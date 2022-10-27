const app = getApp();
Page({
  data: {
    // ******************* 分析页面顶部逻辑 *******************
    currentMode: "record",
    currentMonth:"", // 顶部方形日历
    currentDate: "",
    displayedDate: [], // 顶部左右滑动的日期
    analyticsData: [], // 按照每周排列好的服药日期
    // ******************* 日历逻辑 *******************
    toggleButtonStatus: false,
    medi_taken: [],
    medi_taken_obj: [],
    LastClick: {}, // 用来记录上一次被点击的日历方框
    calendarConfig: {
      takeoverTap: true,
    },
    weekNumToRange: {}, // jara方程
    lowestWeekNum: -1,
    medi_taken_classified_by_years: {},
    curTapDate: {},
    // ******************* bar chart逻辑 ******************* 
    swiperPosition: 0, // bar chart中间内容滚动的进度
    slideWidth: 40,  // 滚动条默认长度
    currentClickedBar: 0,
    lastClickBar: 0,
    left: 0,
    // ******************* 分析页面底部逻辑 *******************
    compare: "",  // 底部跟上周比的值
    averageMediTake: 0, // 底部的平均值
  }, 
  // ******************* 日历逻辑 *******************
  onLoad() {
    // 弹窗
    let that = this
    let today = new Date()
    let lastShownModalTime = wx.getStorageSync('NotificationLastShownTime');
    let ifTodayTaken = this.checkIfTapDateTaken({year: today.getFullYear(), month: today.getMonth()+1, date: today.getDate()})

    // model显示之前先对calendar进行渲染
    const medi_taken = app.globalData.userData.med_date;
    this.convertStringtoDateArray(medi_taken)
    this.setData({
      medi_taken,
      currentMonth: today.getMonth() + 1,
      currentDate: today.getDate()
    })
    // 用户如果点击了model需要执行的内容
    if(!ifTodayTaken && (lastShownModalTime == null || !this.isSameDay(today, new Date(lastShownModalTime)))) {
      wx.showModal({
        title: '服药记录',
        content: '今天是否已经服药?',
        cancelText: '否',
        confirmText: '是',
        // 用户弹窗点击成功
        success (res) {
          if (res.confirm) {
            app.globalData.ifCalendarModalShow = true
            // 把今天改为已经服药
            let today_database = new Date(today.getFullYear(), today.getMonth(), today.getDate())
            wx.cloud.callFunction({
              name: 'medication_track',
              data: {
                  date: today_database
              }
            }).then(res => {
              const newDateLst = res.result.data.med_date;
              app.globalData.userData.med_date = newDateLst
              // 创建medi taken的obj list, 用来防止用户点击红色已服药方块
              that.convertStringtoDateArray(newDateLst)
              that.setData({
                toggleButtonStatus: true,
                medi_taken: newDateLst,
              })
              that.renderMediTaken()
              // 全部渲染完之后需要单独对今天进行渲染
              that.changeCalendarBoxStyle(that.data.LastClick, "box-selected-taken")
            });
          }
        }
      })
      try {
        wx.setStorageSync('NotificationLastShownTime', today)
      } catch (e) {
        console.log(e);
      }
    }
  },
  // 处理bar chart的数据
  processAnalystPageData() {
    let _medi_taken_classified_by_years = this.createMedi_taken_classified_by_years(this.data.medi_taken);
    this.setData({
      medi_taken_classified_by_years: _medi_taken_classified_by_years
    })
    this.prepareAnalyticsData()
    this.modifyDateList(this.data.analyticsData)
    this.generateDisplayDate(this.data.analyticsData[0])
    let avg = this.calculateAverage(this.data.analyticsData)
    let compare = this.getCompareString(0)
    let analyticsData = this.data.analyticsData
    analyticsData[0].opacity = 1
    this.setData({
      averageMediTake: avg,
      compare,
      analyticsData
    })
  },
  convertDateobjToDateOBJ(obj) {
    return new Date(obj.year, obj.month-1, obj.date)
  },
  isSameDay(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
  },
  afterCalendarRender(e) {
    // 日历第一次渲染完给当天画框
    const today = new Date()
    const dateObj = {
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      date: today.getDate()
    }
    this.renderMediTaken()
    // 判断今天是否taken,已经taken的话要补上框
    let todayMeditaken = false
    if(this.checkIfTapDateTaken(dateObj)) {
      todayMeditaken = true;
    }
    if(todayMeditaken) {
      this.changeCalendarBoxStyle(dateObj, "box-selected-taken")
    } else {
      this.changeCalendarBoxStyle(dateObj, "box-selected")
    }
    // 今天要是taken, 那么toggle button 要开启, 同时把今天设置为上次点击
    this.setData({
      toggleButtonStatus: todayMeditaken,
      LastClick: dateObj
    })
  },
  // 当左右滑动的时候需要重新渲染日历
  whenChangeMonth(e) {
    this.renderMediTaken()
    // 全部渲染完之后, 需要单独再把last click渲染一遍, 不然会使得原本选中的框子消失
    if(this.checkIfTapDateTaken(this.data.LastClick)) {
      this.changeCalendarBoxStyle(this.data.LastClick, "box-selected-taken")
    } else {
      this.changeCalendarBoxStyle(this.data.LastClick, "box-selected")
    }
  },
  // 把日期的string列表转换为obj列表
  convertStringtoDateArray(lst) {
    const medi_taken_obj = []
    lst.map(date_str => {
      const date = new Date(date_str)
      medi_taken_obj.push(date)
    })
    this.setData({
      medi_taken_obj
    })
  },
  // 用户点击方块的时候启动
  takeoverTap(e) {
    const today = new Date()
    // 设置当前被点击的日期
    let tap_year = e.detail.year
    let tap_month = e.detail.month
    let tap_day = e.detail.date
    this.setData({
      curTapDate: {year: tap_year, month: tap_month, date: tap_day}
    })
    const tap_date = new Date(tap_year, tap_month - 1, tap_day)
    // 只允许用户点击早于今天的日期
    if(tap_date < today) {
      // 给当前点击的方框加入深色边框(需要判断是否taken)
      if(this.checkIfTapDateTaken(this.data.curTapDate)) {
        this.changeCalendarBoxStyle(this.data.curTapDate, "box-selected-taken")
      } else {
        this.changeCalendarBoxStyle(this.data.curTapDate, "box-selected")
      }
      // 取消上一次的深色边框(需要判断是否taken)
      let LastClickDateObj = this.convertDateobjToDateOBJ(this.data.LastClick)
      if(!this.isSameDay(LastClickDateObj, tap_date)) {
        if(this.checkIfTapDateTaken(this.data.LastClick)) {
          this.changeCalendarBoxStyle(this.data.LastClick, "box-deselect-taken")
        } else {
          this.changeCalendarBoxStyle(this.data.LastClick, "box-deselect")
        }
        // 把当前方框设置为上次点击方框
        this.setData({
          toggleButtonStatus: this.checkIfTapDateTaken(this.data.curTapDate),
          LastClick: this.data.curTapDate
        })
      }
    } 
  },
  // 改变格子颜色
  changeCalendarBoxStyle(dateObj, styleName) {
    const calendar = this.selectComponent('#calendar').calendar
    const toSet = []
    const StyledObj = {year:dateObj.year, month:dateObj.month, date:dateObj.date, class: styleName}
    toSet.push(StyledObj)
    calendar.setDateStyle(toSet)
  }, 
  // 判断当前点击的格子是不是已经确认服药了
  checkIfTapDateTaken(dateObj) {
    let curr_medi_taken = this.data.medi_taken_obj
    let ifClickIsTaken = false
    for(let i = 0; i < curr_medi_taken.length; i++) {
      let date = curr_medi_taken[i]
      if(date.getFullYear() == dateObj.year && date.getMonth() + 1 == dateObj.month && date.getDate() == dateObj.date) {
        ifClickIsTaken = true
      }
    }
    return ifClickIsTaken
  },
  // toggle button的改变
  toggleButtonChange(event) {
    let curTapDate = this.data.curTapDate
    let toggleResult = event.detail.checked
    let newMediStatus = false
    // 改变数据库的药的taken状态
    let dateChange = new Date(curTapDate.year, curTapDate.month - 1, curTapDate.date)
    if (toggleResult) newMediStatus = true
  
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    wx.cloud.callFunction({
      name: 'medication_track',
      data: {
          date: dateChange
      }
    })
    .then(res => {
      wx.hideLoading()
      const newDateLst = res.result.data.med_date;
      app.globalData.userData.med_date = newDateLst
      // 创建medi taken的obj list, 用来防止用户点击红色已服药方块
      this.convertStringtoDateArray(newDateLst)
      this.setData({
        medi_taken: newDateLst,
      })
      this.renderMediTaken()
      
      if(toggleResult) {
        this.changeCalendarBoxStyle(curTapDate, "box-selected-taken")
      } else {
        this.changeCalendarBoxStyle(curTapDate, "box-selected")
      }
    });
    this.setData({
      toggleButtonStatus: newMediStatus
    })
    // 更新分析页面的数据
    this.processAnalystPageData()
  },
  // 把所有已经服药过的日期渲染成红色
  renderMediTaken() {
    const calendar = this.selectComponent('#calendar').calendar
    const toSet = []
    const medi_obj =  this.data.medi_taken_obj
    for(let i = 0; i < medi_obj.length; i++) {
      let year = medi_obj[i].getFullYear();
      let month = medi_obj[i].getMonth() + 1;
      let date = medi_obj[i].getDate();
      let obj = { year, month, date, class: 'medi-taken'};
      toSet.push(obj)
    }
    calendar.setDateStyle(toSet)
  },
  // ******************* bar chart 逻辑 *******************
  // 根据数据显示bar的颜色
  addBarColor(count) {
    if(count <= 3) {
      return "#FA5151"
    } else if (count <= 5) {
      return "#FFC300"
    } else {
      return "#4DA470"
    }
  },
  // 点击bar chart的bar
  clickBar(e) {
    // 改变日期比较
    let newCompareStr = this.getCompareString(e.currentTarget.dataset.bindex)
    // 改变顶部日期
    this.generateDisplayDate(this.data.analyticsData[e.currentTarget.dataset.bindex])
    // 改变bar透明度
    let curAnalyticsData = this.data.analyticsData;
    curAnalyticsData[this.data.lastClickBar].opacity = 0.5
    curAnalyticsData[e.currentTarget.dataset.bindex].opacity = 1 
    this.setData({
      currentClickedBar: e.currentTarget.dataset.bindex,
      compare: newCompareStr,
      analyticsData: curAnalyticsData,
      lastClickBar: e.currentTarget.dataset.bindex
    })
  },
  // 给bar chart重新塑造日期
  modifyDateList(lst) {
    let alter_lst = []
    for(let i = 0; i < lst.length; i++) {
      // format start date
      let count = lst[i].count;
      let start = lst[i].start;
      let new_start = this.reconstruct(start)
      let end = lst[i].end;
      let new_end = this.reconstruct(end)
      let color = this.addBarColor(count)
      let obj = {"start": new_start, "end": new_end, "count": count, "color": color, "opacity": 0.5}
      alter_lst.push(obj)
    }
    this.setData({
      analyticsData: alter_lst
    })
  },
  // 获取滚动条向左边移动的长度
  getleft(e) {
    const barScroll = this.convertScollLeftToSlideLeft(e.detail.scrollLeft)
    this.setData({
      slideLeft: barScroll
    })
  },
  convertScollLeftToSlideLeft(userScroll) {
    const chunkCount = this.data.analyticsData.length
    return (userScroll * 210) / ((chunkCount - 4) * 62.5);
  },
  // 将日期从-连接变成点连接
  reconstruct(date) {
    let date_split = date.split('-')
    let date_month = date_split[0]
    let date_date = date_split[1]
    return date_month + "." + date_date
  },
  // 把所有的日期按照周排列好 (Jara's func)
  prepareAnalyticsData() { 
    let today = new Date();
    let _analyticsData = [];
    let _weekNumToRange = {};
    let _weekNumToCount = {};
    let this_year_medi_taken = this.data.medi_taken_classified_by_years[today.getFullYear()];
    if (this_year_medi_taken.length === 0) {
      return;
    }
    // generate week range from whole year
    for (let i = 1; i <= 53; i++) {
      _weekNumToRange[i] = this.getDateRangeOfWeek(i);
    }
    // highest week number and lowest week number
    let HighestDate = new Date(this_year_medi_taken[0]);
    let HighestWeekNum = this.getWeekNum(HighestDate);
    let LowestDate = new Date(this_year_medi_taken[this_year_medi_taken.length - 1]);
    let LowestWeekNum = this.getWeekNum(LowestDate);
    for (let i = 0; i < this_year_medi_taken.length; i++) {
      let currDate = new Date(this_year_medi_taken[i]);
      let curr_weekNum = this.getWeekNum(currDate);
      if (_weekNumToCount[curr_weekNum] == null) {
        _weekNumToCount[curr_weekNum] = 0;
      }
      _weekNumToCount[curr_weekNum] += 1;
    }
    // generate analytics data
    for (let i = LowestWeekNum; i <= HighestWeekNum; i++) {
      let analytics_data_element = {};
      analytics_data_element.start = _weekNumToRange[i][0];
      analytics_data_element.end = _weekNumToRange[i][1];
      if (_weekNumToCount[i] == null || _weekNumToCount[i] == 0) {
        analytics_data_element.count = 0;
      } else {
        analytics_data_element.count = _weekNumToCount[i];
      }
      _analyticsData.push(analytics_data_element);
    }
    this.setData({
      analyticsData: _analyticsData
    });
  },
  getDateRangeOfWeek(weekNo){
    var d1, numOfdaysPastSinceLastMonday, rangeIsFrom, rangeIsTo;
    d1 = new Date();
    numOfdaysPastSinceLastMonday = d1.getDay() - 1;
    d1.setDate(d1.getDate() - numOfdaysPastSinceLastMonday);
    d1.setDate(d1.getDate() + (7 * (weekNo - this.getWeekNum(d1))));
    rangeIsFrom = (d1.getMonth() + 1) + "-" + d1.getDate() + "-" + d1.getFullYear();
    d1.setDate(d1.getDate() + 6);
    rangeIsTo = (d1.getMonth() + 1) + "-" + d1.getDate() + "-" + d1.getFullYear() ;
    return [rangeIsFrom, rangeIsTo];
  },
  getWeekNum(InputDate) {
    var DATE = new Date(InputDate.getTime());
    DATE.setHours(0, 0, 0, 0);
    // Thursday in current week decides the year.
    DATE.setDate(DATE.getDate() + 3 - (DATE.getDay() + 6) % 7);
    // January 4 is always in week 1.
    var week1 = new Date(DATE.getFullYear(), 0, 4);
    // Adjust to Thursday in week 1 and count number of weeks from date to week1.
    return 1 + Math.round(((DATE.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  },
  createMedi_taken_classified_by_years(medi_taken) {
    let _medi_taken_classified_by_years = {};
    for (let i = 0; i < medi_taken.length; i++) { 
      let currDate = new Date(medi_taken[i]);
      if (_medi_taken_classified_by_years[currDate.getFullYear()] == null) {
        _medi_taken_classified_by_years[currDate.getFullYear()] = [];
      }
      _medi_taken_classified_by_years[currDate.getFullYear()].push(currDate);
    }
    return _medi_taken_classified_by_years;
  },
  // ******************* 分析页底部逻辑 *******************
  // 计算本周跟上周比较的string
  getCompareString(index) {
    if(index == 0) {
      return "+0"
    } 
    let curCount = this.data.analyticsData[index].count;
    let prevCount = this.data.analyticsData[index - 1].count
    if(curCount > prevCount) {
      return "+" + (curCount - prevCount)
    } else if (curCount < prevCount) {
      return "-" + Math.abs(curCount - prevCount) 
    } else {
      return "+0"
    }
  },
  // 计算分析页面的平均值
  calculateAverage(lst) {
    let sum = 0
    for(let i = 0; i < lst.length; i++) {
      sum += lst[i].count
    }
    let avg = sum / lst.length
    return avg.toFixed(1)
  },
  // ******************* 分析页面顶部逻辑 *******************
  // 分析页面顶部日期
  generateDisplayDate(obj) {
    const start = obj.start;
    const end = obj.end;
    const start_lst = start.split(".")
    const end_lst = end.split(".")
    const result = start_lst.concat(end_lst)
    this.setData({
      displayedDate: result
    })
  },
  // 切换记录和分析模式
  switchMode: function(event) {
    if(event.currentTarget.dataset.mode == "analyst") {
      this.processAnalystPageData()
    }

    this.setData({
      currentMode: event.currentTarget.dataset.mode
    })
  },
  // arrow click
  clickLeftArrow() {
    let currentClickedBar = this.data.currentClickedBar
    let curAnalyticsData = this.data.analyticsData;
    if(currentClickedBar == 0) {
      return;
    };
    curAnalyticsData[currentClickedBar].opacity = 0.5
    currentClickedBar -= 1
    let newSwiperPosition = currentClickedBar * 62.5
    curAnalyticsData[currentClickedBar].opacity = 1
    this.generateDisplayDate(this.data.analyticsData[currentClickedBar])
    this.setData({
      swiperPosition: newSwiperPosition,
      currentClickedBar,
      analyticsData: curAnalyticsData,
    })
  },
  clickRightArrow() {
    let currentClickedBar = this.data.currentClickedBar
    let curAnalyticsData = this.data.analyticsData;
    if(currentClickedBar == this.data.analyticsData.length - 1) {
      return;
    };
    curAnalyticsData[currentClickedBar].opacity = 0.5
    currentClickedBar += 1
    let newSwiperPosition = currentClickedBar * 62.5
    curAnalyticsData[currentClickedBar].opacity = 1
    this.generateDisplayDate(this.data.analyticsData[currentClickedBar])
    this.setData({
      swiperPosition: newSwiperPosition,
      currentClickedBar,
      analyticsData: curAnalyticsData,
    })
  }
})
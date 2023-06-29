const app = getApp();

// toggle button的time picker专用
const hours = []
const minutes = []
for (var i = 0; i <= 24; i++) {
  var formattedHour = ('0' + i).slice(-2); // Add leading zero for hours less than 10
  hours.push(formattedHour);
}
for (var i = 0; i <= 59; i++) {
  var formattedMinute = ('0' + i).slice(-2); // Add leading zero for hours less than 10
  minutes.push(formattedMinute);
}

Page({
  data: {
    displayConfetti: false,
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
      theme: 'elegant',
      takeoverTap: true
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
    time: '00:00',
    // ******************* 笔记逻辑 *******************
    note: "",
    ifCanEnterNote: false,
    // ******************* 判断是否显示服药时间 *******************
    ifDisplayMediTakenTime: false,
    // ******************* 是否显示时间选择器 *******************
    ifShowTimePicker: true,
    // ******************* toggle button的time picker专用 *******************
    hours: hours,
    minutes: minutes,
    hour: 0,
    minute: 0,
    showPickerModalStatus: false,
  },

  // ******************* 日历逻辑 *******************
  onLoad() {
    // 弹窗
    let that = this
    let today = new Date();
    let lastShownModalTime = wx.getStorageSync('NotificationLastShownTime');
    let ifTodayTaken = this.checkIfTapDateTaken({year: today.getFullYear(), month: today.getMonth()+1, date: today.getDate()})
    // model显示之前先对calendar进行渲染
    const medi_taken = app.globalData.userData.med_date;
    this.convertStringtoDateArray(medi_taken)
    // 获取所有服药的具体时间(map)
    // 如果今天有服药时间的话, 那么要对今天的服药时间进行更新
    const currentTapDateMediTakenTime = app.globalData.userData.med_track

    console.log("asdf", currentTapDateMediTakenTime)
    let formatted_today = new Date(today.getFullYear(), today.getMonth(), today.getDate());


    this.setData({
      medi_taken,
      currentMonth: today.getMonth()+1,
      currentDate: today.getDate(),
      curTapDate: today,
    })

    let correspondingMediTakenTime;
    let today_med_taken_check = (currentTapDateMediTakenTime.length != 0 && formatted_today.getTime() == new Date(currentTapDateMediTakenTime[currentTapDateMediTakenTime.length - 1].date).getTime());
    if (today_med_taken_check) {
      correspondingMediTakenTime = currentTapDateMediTakenTime[currentTapDateMediTakenTime.length - 1].hour;
      console.log("TIME: " + correspondingMediTakenTime)
      this.setData({
        ifDisplayMediTakenTime: true,
        time: correspondingMediTakenTime
      })
    }
    

    console.log("current med time: " + correspondingMediTakenTime);


    // 用户如果点击了model需要执行的内容
    if(!today_med_taken_check && (lastShownModalTime == null || !this.isSameDay(today, new Date(lastShownModalTime)))) {
      wx.showModal({
        title: '服药记录',
        content: '今天是否已经服药?',
        cancelText: '否',
        confirmText: '是',
        // 用户弹窗点击成功
        success (res) {
          if (res.confirm) {
            wx.showLoading({
              title: '加载中',
              mask: true
            })
            app.globalData.ifCalendarModalShow = true
            // 把今天改为已经服药
            let today_database = new Date(today.getFullYear(), today.getMonth(), today.getDate())
            wx.cloud.callFunction({
              name: 'medication_track',
              data: {
                  date: today_database,
                  hour: 0
              }
            }).then(res => {
              const newDateLst = res.result.data.med_date;
              app.globalData.userData.med_date = newDateLst;
              // med hour data (print it out to see details)
              app.globalData.userData.med_track = res.result.data.med_track;
              // 创建medi taken的obj list, 用来防止用户点击红色已服药方块
              that.convertStringtoDateArray(newDateLst)
              that.setData({
                toggleButtonStatus: true,
                medi_taken: newDateLst,
              })
              that.renderMediTaken()
              // 全部渲染完之后需要单独对今天进行渲染
              that.changeCalendarBoxStyle(that.data.LastClick, "box-selected-taken")
              wx.hideLoading();
            });
          }
          try {
            wx.setStorageSync('NotificationLastShownTime', today)
          } catch (e) {
            console.log(e);
          }
        }
      })
    } 
    // 判断笔记是否为空
    if(this.data.note !== "") {
      this.setData({
        ifCanEnterNote: true
      })
    }
    let currentTime = this.getCurrentTime();
    this.setData({
      curTapDate: {year: today.getFullYear(), month: today.getMonth() + 1, date: today.getDate()},
      // time: currentTime
    })
  },
  getCurrentTime: function() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    // Format the hours
    const formattedHours = hours < 10 ? `0${hours}` : `${hours}`;
    // Format the minutes
    const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
    // Return the formatted time string
    return `${formattedHours}:${formattedMinutes}`;
  },
  
  readyToEnter() {
    this.setData({
      ifCanEnterNote: true
    })
  },
  saveNote() {
    let current_tap_date = this.data.curTapDate
    let user_enter_note = this.data.note
    let myDate = new Date(current_tap_date.year, current_tap_date.month - 1, current_tap_date.date);
    if(isNaN(myDate)) {
      myDate = new Date()
    }

    wx.cloud.callFunction({
      name: 'POST_note_change',
      data: {
        date: myDate,
        content: user_enter_note,
        timestamp: new Date()
      },
      success: out => {
        console.log(out);
      },
      fail: out => {
        console.log("fail to call POST_note_change");
        console.log(out);
      }
    });

    this.setData({
      note: user_enter_note,
      ifCanEnterNote: false
    })
  },
  userNameInput(e) {
    const userInputText = e.detail.value
    this.setData({
      note: userInputText
    })
  },
  // 处理bar chart的数据
  processAnalystPageData() {
    let _medi_taken_classified_by_years = this.createMedi_taken_classified_by_years(this.data.medi_taken);
    let today = new Date();
    if (_medi_taken_classified_by_years[today.getFullYear()] == null) {
      _medi_taken_classified_by_years[today.getFullYear()] = []
    }
    this.setData({
      medi_taken_classified_by_years: _medi_taken_classified_by_years
    })
    this.prepareAnalyticsData()
    this.modifyDateList(this.data.analyticsData)
    this.generateDisplayDate(this.data.analyticsData[0])
    let avg = this.calculateAverage(this.data.analyticsData)
    let compare = this.getCompareString(0)
    let analyticsData = this.data.analyticsData
    if (analyticsData.length != 0) {
      analyticsData[0].opacity = 1
    }
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
    const currentTapDateMediTakenTime = app.globalData.userData.med_track
    
    const tap_date = new Date(tap_year, tap_month - 1, tap_day)
    // 只允许用户点击早于今天的日期
    if(tap_date < today) {
      const correspondingMediTakenTime = currentTapDateMediTakenTime.find(obj => new Date(obj.date).getTime() === tap_date.getTime())?.hour;

      this.setData({
        curTapDate: {year: tap_year, month: tap_month, date: tap_day},
        time: correspondingMediTakenTime
      })
      // 给当前点击的方框加入深色边框(需要判断是否taken)
      if(this.checkIfTapDateTaken(this.data.curTapDate)) {
        this.changeCalendarBoxStyle(this.data.curTapDate, "box-selected-taken")
        this.setData({
          ifDisplayMediTakenTime: true
        })
      } else {
        this.changeCalendarBoxStyle(this.data.curTapDate, "box-selected")
        this.setData({
          ifDisplayMediTakenTime: false
        })
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
      // this.showModal();
    }
  },

  showNotePanel: function() {
    let current_tap_date = this.data.curTapDate
    let myDate = new Date(current_tap_date.year, current_tap_date.month - 1, current_tap_date.date);
    if(isNaN(myDate)) {
      myDate = new Date()
    }
    let that = this
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    wx.cloud.callFunction({
      name: 'GET_note',
      data: {
        date: myDate,
      },
      success: out => {
        that.setData({
          note: out.result.data.content
        })
        that.showModal();
      },
      fail: out => {
        console.log("fail to call GET_note");
        console.log(out);
      },
      complete: out => {
        wx.hideLoading();
      }
    })
  },

  bindTimeChange: function(e) {
    // 点击确定后修改显示时间
    this.setData({
      time: e.detail.value
    })
    // 在数据库中存新的时间
    let curTapDate = this.data.curTapDate;
    let dateChange = new Date(curTapDate.year, curTapDate.month - 1, curTapDate.date)

    wx.cloud.callFunction({
      name: 'EDIT_medication_time',
      data: {
          date: dateChange,
          hour: e.detail.value
      },
      success: out => {
        app.globalData.userData.med_track = out.result.data.med_track;
      },
      fail: out => {
        console.log("fail to call EDIT_medication_time");
        console.log(out);
      }
    })
  },

  //显示对话框
  showModal: function () {
    // 显示遮罩层
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.translateY(300).step()
    this.setData({
      animationData: animation.export(),
      showModalStatus: true
    })
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export()
      })
    }.bind(this), 200)
  },
  // 显示由toggle button控制的time picker
  showPickerModal: function () {
    // 显示遮罩层
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.translateY(300).step()
    let that = this;
    // picker init
    if (!that.data.ifDisplayMediTakenTime) {
      that.setData({
        hour: "00",
        minute: "00"
      })
    }
    
    this.setData({
      animationData: animation.export(),
      showPickerModalStatus: true,
      hour: that.data.hour,
      minute: that.data.minute
    }) 
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export()
      })
    }.bind(this), 200)
  },

  //隐藏对话框
  hideModal: function () {
    // 隐藏遮罩层
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.translateY(300).step()
    this.setData({
      animationData: animation.export(),
    })
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export(),
        showModalStatus: false
      })
    }.bind(this), 200)
  },

  //隐藏toggle button出发的时间选择器
  hideTimePickerModal: function () {
    // 修改时间
    let new_picker_time = this.data.hour + ':' + this.data.minute
    console.log("TIME: " + new_picker_time);
    
    let that = this;
    this.setData({
      time: new_picker_time,
      ifDisplayMediTakenTime: true
    })
    // hide的同时往数据库存进数据
    let curTapDate = this.data.curTapDate;
    let dateChange = new Date(curTapDate.year, curTapDate.month - 1, curTapDate.date)
    wx.cloud.callFunction({
      name: 'EDIT_medication_time',
      data: {
          date: dateChange,
          hour: new_picker_time
      },
      success: out => {
        app.globalData.userData.med_track = out.result.data.med_track;
      },
      fail: out => {
        console.log("fail to call EDIT_medication_time");
        console.log(out);
      }
    })
        
    // 隐藏遮罩层
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.translateY(300).step()
    this.setData({
      animationData: animation.export(),
    })
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export(),
        showPickerModalStatus: false
      })
    }.bind(this), 200)
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

    let that = this
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    // 取消服药记录
    wx.cloud.callFunction({
      name: 'medication_track',
      data: {
          date: dateChange,
          hour: "untoggle"
      }
    })
    .then(res => {
      const newDateLst = res.result.data.med_date;
      app.globalData.userData.med_date = newDateLst
      // med hour data (print it out to see details)
      app.globalData.userData.med_track = res.result.data.med_track;
      // 创建medi taken的obj list, 用来防止用户点击红色已服药方块
      that.convertStringtoDateArray(newDateLst)
      that.setData({
        medi_taken: newDateLst,
      })
      that.renderMediTaken()
      if(toggleResult) {
        that.changeCalendarBoxStyle(curTapDate, "box-selected-taken")
        // 当用户开启按钮的时候需要弹出时间选择的窗口
        that.showPickerModal()
      } else {
        that.changeCalendarBoxStyle(curTapDate, "box-selected")
        that.setData({
          ifDisplayMediTakenTime: false
        })
      }
      that.setData({
        toggleButtonStatus: newMediStatus
      })
      // 更新分析页面的数据
      wx.hideLoading()
      that.processAnalystPageData()
    });
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
    const chunkCount = this.data.analyticsData.length
    const userScroll = e.detail.scrollLeft
    const barScroll = (userScroll * 210) / ((chunkCount - 4) * 62.5)
    this.setData({
      slideLeft: barScroll
    })
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
    if (this_year_medi_taken == null) {
      this_year_medi_taken = []
    }
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
    // 跨年
    if (LowestWeekNum > HighestWeekNum) {
      LowestDate = new Date(this_year_medi_taken[this_year_medi_taken.length - 2]);
      LowestWeekNum = this.getWeekNum(LowestDate);
    }

    for (let i = 0; i < this_year_medi_taken.length; i++) {
      let currDate = new Date(this_year_medi_taken[i]);
      let curr_weekNum = this.getWeekNum(currDate);
      if (curr_weekNum > HighestWeekNum || curr_weekNum < LowestWeekNum) {
        continue;
      }
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
    if (typeof obj === 'undefined') {
      return;
    }
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
      if (this.data.analyticsData.length == 0
      || this.data.medi_taken_classified_by_years[new Date().getFullYear()].length == 0) {
        wx.showModal({
          title: '服药记录',
          content: '当前年份没有记录'
        })
        return;
      }
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
    let newSwiperPosition = currentClickedBar * 40
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
    let newSwiperPosition = currentClickedBar * 40
    curAnalyticsData[currentClickedBar].opacity = 1
    this.generateDisplayDate(this.data.analyticsData[currentClickedBar])
    this.setData({
      swiperPosition: newSwiperPosition,
      currentClickedBar,
      analyticsData: curAnalyticsData,
    })
  },

  togglePickerBindChange(e) {
    const val = e.detail.value
    console.log("hours and minutes",  this.data.hours, this.data.minutes)
    console.log("valll", val)
    this.setData({
      hour: this.data.hours[val[0]],
      minute: this.data.minutes[val[1]],
    })
  }
})

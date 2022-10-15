const app = getApp();
Page({
  data: {
    toggleButtonStatus: false,
    swiperPosition: 0,
    lastClickBar: 0,
    compare: "",
    averageMediTake: 0,
    currentClickedBar: 0,
    displayedDate: [],
    currentMonth: "",
    currentDate: "",
    currentMode: "record",
    left: 30,
    calendarCo: 4,
    slideWidth: 50,
    slideLefnfig: {
      takeoverTap: true,
    },
    calendarConfig: {
      takeoverTap: true
    },
    ifTodayTaken: false,
    medi_taken: [],
    analyticsData: [],
    lowestWeekNum: -1,
    weekNumToRange: {},
    medi_taken_classified_by_years: {}
  }, 
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
  modifyDateList(lst) {
    let alter_lst = []
    for(let i = 0; i < lst.length; i++) {
      // format start date
      let count = lst[i].count;
      let start = lst[i].start;
      let start_split = start.split('-')
      let start_month = start_split[0]
      let start_date = start_split[1]
      let new_start = start_month + "." + start_date
      // format end date
      let end = lst[i].end;
      let end_split = end.split('-')
      let end_month = end_split[0]
      let end_date = end_split[1]
      let new_end =  end_month + "." + end_date
      // add bar color
      let color = this.addBarColor(count)
      let obj = {"start": new_start, "end": new_end, "count": count, "color": color, "opacity": 0.5}
      alter_lst.push(obj)
    }
    this.setData({
      analyticsData: alter_lst
    })
  },
  addBarColor(count) {
    if(count <= 3) {
      return "#FA5151"
    } else if (count <= 5) {
      return "#FFC300"
    } else {
      return "4DA470"
    }
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
  checkIfTodayTaken(today) {
    if(this.data.medi_taken.length > 0) {
      const medi_first = new Date(this.data.medi_taken[0])
      if(medi_first.getYear() == today.getYear() && medi_first.getMonth() == today.getMonth() && medi_first.getDate() == today.getDate()) {
        this.setData({
          ifTodayTaken: true
        })
      }
    }
  },
  takeoverTap(e) {
    if(e.detail.isToday && !this.data.ifTodayTaken) {
      const today = new Date()
      wx.showLoading({
        title: '加载中',
        mask: true
      })
      wx.cloud.callFunction({
        name: 'medication_track',
        data: {
            date: today
        }
      })
      .then(res => {
        wx.hideLoading()
        const newDateLst = res.result.data.med_date;
        app.globalData.userData.med_date = newDateLst
        this.setData({
          medi_taken: newDateLst,
          ifTodayTaken: true
        })
        this.renderMediTaken()
      });
    }
  },
  afterCalendarRender(e) {
    // marktoday
    const today = new Date();
    const calendar = this.selectComponent('#calendar').calendar
    const toSet = []
    let year = today.getFullYear();
    let month = today.getMonth() + 1;
    let date = today.getDate();
    let obj = { year, month, date, class: 'medi-today'};
    let objDisable = { year, month, date};
    toSet.push(obj)
    calendar.setDateStyle(toSet)
    this.renderMediTaken()
  },
  whenChangeMonth(e) {
    this.renderMediTaken()
  },
  renderMediTaken() {
    const calendar = this.selectComponent('#calendar').calendar
    const toSet = []
    for(let i = 0; i < this.data.medi_taken.length; i++) {
      let currDate = new Date(this.data.medi_taken[i]);
      let year = currDate.getFullYear();
      let month = currDate.getMonth() + 1;
      let date = currDate.getDate();
      let obj = { year, month, date, class: 'medi-taken'};
      toSet.push(obj)
    }
    calendar.setDateStyle(toSet)
  },
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
    console.log(this.data.analyticsData);
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
//     let DATE = new Date(InputDate);
//     let oneDayTime = 1000*60*60*24;
//     let weekNum = parseInt(DATE.getTime()/oneDayTime);
//     return parseInt((weekNum+4)/7);
    var DATE = new Date(InputDate.getTime());
    DATE.setHours(0, 0, 0, 0);
    // Thursday in current week decides the year.
    DATE.setDate(DATE.getDate() + 3 - (DATE.getDay() + 6) % 7);
    // January 4 is always in week 1.
    var week1 = new Date(DATE.getFullYear(), 0, 4);
    // Adjust to Thursday in week 1 and count number of weeks from date to week1.
    return 1 + Math.round(((DATE.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  },

  isSameDay(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
  },

  onLoad() {
    // 弹窗
    const medi_taken = app.globalData.userData.med_date;
    this.setData({
      medi_taken: medi_taken
    });
    let that = this
    const today = new Date()
    let lastShownModalTime = wx.getStorageSync('NotificationLastShownTime');

    this.checkIfTodayTaken(today);
    console.log(this.data.ifTodayTaken);
    if (this.data.ifTodayTaken) {
      this.setData({
        toggleButtonStatus: true
      })
    }
    
    console.log(lastShownModalTime);
    if(!this.data.ifTodayTaken && (lastShownModalTime == null || !this.isSameDay(today, new Date(lastShownModalTime)))) {
      wx.showModal({
        title: '服药记录',
        content: '今天是否已经服药?',
        cancelText: '否',
        confirmText: '是',
        success (res) {
          if (res.confirm) {
            that.setData({
              ifTodayTaken: true,
              toggleButtonStatus: true
            })
          }
          try {
            wx.setStorageSync('NotificationLastShownTime', today)
          } catch (e) {
            console.log(e);
          }
        }
      })
    }

    let _medi_taken_classified_by_years = this.createMedi_taken_classified_by_years(medi_taken);
    
    this.setData({
      medi_taken,
      currentMonth: today.getMonth() + 1,
      currentDate: today.getDate(),
      medi_taken_classified_by_years: _medi_taken_classified_by_years
    })
    // this.checkIfTodayTaken(today)
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
  calculateAverage(lst) {
    let sum = 0
    for(let i = 0; i < lst.length; i++) {
      sum += lst[i].count
    }
    return sum / lst.length
  },
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
  getleft(e) {
      const userScroll = e.detail.scrollLeft
      const barScroll = (userScroll * 200) / 125
      this.setData({
        slideLeft: barScroll
      })
  },
  switchToRecord: function() {
    this.setData({
      currentMode: "record"
    })
  },
  switchToAnalyst: function() {
    this.setData({
      currentMode: "analyst"
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
  // for toggle button
  onChange(event) {
    let toggleResult = event.detail.checked
    let newMediStatus = false
    if(toggleResult) {
      newMediStatus = true
    }
    this.setData({
      toggleButtonStatus: newMediStatus
    })
  }
})
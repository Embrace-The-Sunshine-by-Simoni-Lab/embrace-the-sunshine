const app = getApp();
Page({
  data: {
    currentMonth: "",
    currentDate: "",
    currentMode: "record",
    leftt: 20,
    calendarCo: 4,
    slideWidth: 40,
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

  onLoad() {
    const medi_taken = app.globalData.userData.med_date;
    let _medi_taken_classified_by_years = this.createMedi_taken_classified_by_years(medi_taken);
    const today = new Date()
    this.setData({
      medi_taken,
      currentMonth: today.getMonth() + 1,
      currentDate: today.getDate(),
      medi_taken_classified_by_years: _medi_taken_classified_by_years
    })
    this.checkIfTodayTaken(today)
    this.prepareAnalyticsData()
  },

  getleft(e) {
      this.setData({
        slideLeft: e.detail.scrollLeft
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
  }
})
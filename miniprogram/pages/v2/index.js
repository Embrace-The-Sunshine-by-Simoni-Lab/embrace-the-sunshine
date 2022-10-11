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
    medi_taken: []
  }, 
  onLoad() {
    const medi_taken = app.globalData.userData.med_date;
    const today = new Date()
    this.setData({
      medi_taken,
      currentMonth: today.getMonth() + 1,
      currentDate: today.getDate()
    })
    console.log(this.data.medi_taken)
    this.checkIfTodayTaken(today)
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
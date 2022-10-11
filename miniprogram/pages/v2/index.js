// import selectable from '../component/v2/plugins/selectable'
// import plugin from '../component/v2/plugins/index'

// import selectable from '/components/v2/plugins/selectable'
// import plugin from '../../../miniprogram/components/v2/plugins/index'

const app = getApp();

// plugin.use(selectable)

Page({
  data: {
    currentMode: "record",
    left: 4,
    slideWidth: 40,
    slideLeft: 20
  }, 
  afterTapDate(e) {
    // console.log('takeoverTap', e)
  },
  afterCalendarRender(e) {
    this.renderMediTaken()
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
    // only enable today

    
  },

  whenChangeMonth(e) {
    this.renderMediTaken()
  },
  renderMediTaken() {
    const calendar = this.selectComponent('#calendar').calendar
    const medi_taken = app.globalData.userData.med_date;
    const toSet = []
    for(let i = 0; i < medi_taken.length; i++) {
      let currDate = new Date(medi_taken[i]);
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
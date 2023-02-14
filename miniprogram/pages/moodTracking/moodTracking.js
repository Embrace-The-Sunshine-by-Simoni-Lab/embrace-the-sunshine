const app = getApp();
Page({
  data: {
    showStartTest: true
  },
  onLoad: function (options) {
    let mood_track_records = app.globalData.userData.mood_track.mood_date;
    if (mood_track_records.length != 0) {
      let closestRecord = mood_track_records[0];
      if (this.isSameWeek(closestRecord)) {
        this.setData({
          showStartTest: false
        });
      }
    }
  },
  goToTest() {
    wx.redirectTo({
      url:'/pages/moodTracking-Content/mockTracking-Content'
    })
  },
  isSameWeek: function (date) {
    let today = new Date();
    let otherDate = new Date(date);
    var oneDayTime = 1000*60*60*24;
    var old_count = parseInt(otherDate.getTime()/oneDayTime);
    var now_other = parseInt(today.getTime()/oneDayTime);
    return parseInt((old_count+4)/7) === parseInt((now_other+4)/7);
  },

  goToMedicationReport() {
    if (app.globalData.userData.mood_track.mood_date.length == 0) {
      wx.showToast({
        title: '请先完成至少一次情绪测试',
        icon: 'none',
        duration: 2000
      })
    } else {
      wx.redirectTo({
        url:'/pages/medicationReportUchart/index'
      })
    }
    
  }
})
const app = getApp()

Page({
  data: {
    indicatorDots: true,
    vertical: false,
    autoplay: false,
    interval: 2000,
    duration: 500
  },

  toMainPage: function() {
    console.log("toMainPage")
    wx.switchTab({
      url: "../mainpage/mainpage",
    })
  },

  onLoad: function() {
    // new login logic
  }
})


const app = getApp()

// pages/profile/profile.js
Page({
  
  /**
   * Page initial data
   */
  data: {
    username: app.globalData.userData.nickname,
    use_week: 2,
    num_finished_module: 2,
    num_finished_optional_module: 6
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    this.setData({
      nickname: app.globalData.userData.nickname
    })
    /*
    const date = new Date();
    let todayDate = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
    console.log(Math.round(Math.abs(todayDate - app.globalData.userData.reg_time) / (1000*60*60*24*7)))
    */
  },

  goto_save: function() {
    wx.navigateTo({
      url: "../save/save",
    })
  },
  goto_resources: function() {
    wx.navigateTo({
      url: "../infoPage/infoPage",
    })
  },
  goto_settings: function() {
    wx.navigateTo({
      url: "../setting/setting",
    })
  },
  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady: function () {
    
  },

  /**
   * Lifecycle function--Called when page show
   */
  onShow: function () {

  },

  /**
   * Lifecycle function--Called when page hide
   */
  onHide: function () {

  },

  /**
   * Lifecycle function--Called when page unload
   */
  onUnload: function () {

  },

  /**
   * Page event handler function--Called when user drop down
   */
  onPullDownRefresh: function () {

  },

  /**
   * Called when page reach bottom
   */
  onReachBottom: function () {

  },

  /**
   * Called when user click on the top right corner to share
   */
  onShareAppMessage: function () {

  },

  updateName: function (e) {
    let name = e.detail.value.new_name;
    if(name.length !== 0) {
      this.setData({
        username: name
      })
    }
  },

  submitNameTest: function (e) {
    let that = this;
    let newName = e.detail.value.new_name;
    wx.cloud.callFunction({
      name: 'nickname_edit',
      data: {
        nickname: newName
      }
    })
      that.setData({
        nickname: newName
    })
  }
})
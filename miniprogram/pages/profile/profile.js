// pages/profile/profile.js
Page({

  /**
   * Page initial data
   */
  data: {
    username: "傻逼Instagram",
    use_week: 2,
    num_finished_module: 2,
    num_finished_optional_module: 6
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    
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

  submitName: function (e) {
    let name = e.detail.value.new_name;
    if(name.length !== 0) {
      this.setData({
        username: name
      })
    }
  }
})
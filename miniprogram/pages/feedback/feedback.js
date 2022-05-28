// pages/feedback/feedback.js
Page({

  /**
   * Page initial data
   */
  data: {
    feedback_content: ""
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {

  },

  input_handler: function (event) {
    // console.log(event.detail.value)
    this.feedback_content = event.detail.value
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

  }
})
// pages/demo/demo.js
Page({

  /**
   * Page initial data
   */
  data: {
    demo_data: 1,
    show_first_image: true
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
  },

  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady: function () {

  },

  increase: function() {
    this.setData({
      demo_data: this.data.demo_data + 1
    })  
  },

  decrease: function() {
    this.setData({
      demo_data: this.data.demo_data - 1
    }) 
  },

  switchIMG: function() {
    this.setData({
      show_first_image: !this.data.show_first_image
    })
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
// pages/profileEdit/profileEdit.js
Page({

  /**
   * Page initial data
   */

  /**
   * Lifecycle function--Called when page load
   */
  onLoad(options) {

  },

  runSubmitName: function (e) {

    console.log(e);

    var page = getCurrentPages();
    var prevPage = page[page.length - 2];
    prevPage.setNewName(e);

    wx.showToast({
      title: '保存成功',
      icon: 'success',
      duration: 2000
    })
  },

  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady() {

  },

  /**
   * Lifecycle function--Called when page show
   */
  onShow() {

  },

  /**
   * Lifecycle function--Called when page hide
   */
  onHide() {

  },

  /**
   * Lifecycle function--Called when page unload
   */
  onUnload() {

  },

  /**
   * Page event handler function--Called when user drop down
   */
  onPullDownRefresh() {

  },

  /**
   * Called when page reach bottom
   */
  onReachBottom() {

  },

  /**
   * Called when user click on the top right corner to share
   */
  onShareAppMessage() {

  }
})
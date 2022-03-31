const app = getApp();
// pages/infoPage/infoPage.js
Page({

  /**
   * Page initial data
   */
  data: {

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

  /**
   * When the phone call icon is clicked, users can choose either make a call or copy the number
   * 当用户点击电话按钮时，可以选择拨打电话或者复制电话
   */

  phoneIconClicked: function (e) {
    var that = this
    var phone_num = e.currentTarget.dataset['index']
    if (typeof phone_num == 'undefined') {
      phone_num = '(---------)'
    }
    wx.showActionSheet({
      itemList: ['呼叫 '+phone_num, '复制电话号码'],
      success: function (res) {
        if (res.tapIndex == 0) {
          // 呼叫号码
          wx.makePhoneCall({
            phoneNumber: phone_num,
          })
        } else if (res.tapIndex == 1)
        // 复制电话号码
        wx.setClipboardData({
          data: phone_num,
          success() {
            wx.showToast({
              title: '复制成功',
              duration: 700
            })
          }
        })
      }
    })
  },

  linkIconClicked: function (e) {
    var that = this
    var url = e.currentTarget.dataset['index']
    wx.showActionSheet({
      itemList: ['打开网页链接', '复制网页链接'],
      success: function (res) {
        if (res.tapIndex == 0) {
          // 打开网页链接
          wx.navvigateTo({
            url: url,
          })
        } else if (res.tapIndex == 1)
        // 复制网页链接
        wx.setClipboardData({
          data: url,
          success() {
            wx.showToast({
              title: '复制成功',
              duration: 700
            })
          }
        })
      }
    })
  },

  emailIconClicked: function (e) {
    var that = this
    var address = e.currentTarget.dataset['index']
    wx.showActionSheet({
      itemList: ['复制邮箱地址'],
      success: function (res) {
        if (res.tapIndex == 0) {
          wx.setClipboardData({
            data: address,
            success() {
              wx.showToast({
                title: '复制成功',
                duration: 700
              })
            }
          })
        }
      }
    })
  },
})


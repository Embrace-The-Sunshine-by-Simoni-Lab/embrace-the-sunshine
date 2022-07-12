// pages/feedback/feedback.js
Page({

  /**
   * Page initial data
   */
  data: {
    feedback_content: "",
    btn_disable: false
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {

  },

  input_handler: function (event) {
    // console.log(event.detail.value)
    this.data.feedback_content = event.detail.value
  },

  submit_feedback: function () {
    
    let that = this
    if (this.data.feedback_content.length < 5) {
      wx.showToast({
        title: '请写至少五个字',
        icon: false
      })
    } else {
      this.setData({
        btn_disable: true
      })
      wx.showLoading({
        title: '反馈提交中',
      })
      wx.cloud.callFunction({
        name: 'add_feedback',
        data: {
          feedback_text: that.data.feedback_content
        },
        success: out => {
          that.setData({
            feedback_content: ""
          })
          that.data.feedback_content = ""
          wx.hideLoading()
          wx.showToast({
            title: '感谢您的反馈',
          })
        },
        fail: out => {
          wx.hideLoading()
          wx.showToast({
            title: '请检查您的网络',
          })
        },
        complete: out => {
          that.setData({
            btn_disable: false
          })
        }
      })
    }
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
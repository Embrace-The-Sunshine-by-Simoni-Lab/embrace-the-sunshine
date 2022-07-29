const app = getApp()

// pages/profile/profile.js
Page({
  
  /**
   * Page initial data
   */
  data: {
    username: app.globalData.userData.nickname,
    num_finished_module: 2,
    num_finished_optional_module: 6
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {

    const todayDate = new Date();
    const regDate = new Date(app.globalData.userData.reg_time);
    const weeksUsed = Math.round(Math.abs((todayDate - regDate) / (1000*60*60*24*7)));

    let that = this
    wx.cloud.callFunction({
      name: 'authorized_user',
      data: {
      },
      success: out => {
        console.log('callfunction sucess');
        console.log(out);
        if (out.result.errCode == 0) {
          if (out.result.data.registered) {
            app.globalData.userData = out.result.data.userData;
            console.log(out.errMsg);
            this.setData({
              username: out.result.data.userData.nickname,
              use_week: weeksUsed
            })
          }
        }
      }
    })
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
      username: newName
    })
  }
})
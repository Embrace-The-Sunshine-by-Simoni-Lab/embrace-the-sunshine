// package_profile/pages/aboutUs.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

  openExternalLink: function () {
    wx.navigateToMiniProgram({
      appId: 'wxd947200f82267e58', // 将appId参数设置为空字符串
      path: 'pages/wjxqList/wjxqList?activityId=mT1WPPo', // 不设置path参数
      extraData: {
        url: '', // 设置要跳转的网址
      },
      envVersion: 'release', // 打开的小程序版本，可选值：develop（开发版）、trial（体验版）、release（正式版）
      success(res) {
        console.log('打开成功');
        const launchOptions = wx.getLaunchOptionsSync();
        if (launchOptions && launchOptions.extraData && launchOptions.extraData.url) {
          wx.navigateTo({ url: launchOptions.extraData.url });
        }
      },
      fail(res) {
        console.error('打开失败', res.errMsg);
      }
    });
  }

})
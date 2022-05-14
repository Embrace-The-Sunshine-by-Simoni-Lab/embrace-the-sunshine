// pages/module/modulePage.js
Page({

  /**
   * 页面的初始数据
   */

  data: {
    open: false,
    // x_old 是指原点x轴坐标
    x_old: 0,
    // x_new 是指移动的最新点的x轴坐标 
    x_new: 0,
    istoright: true,
    percentage: 80,
    sub_title: 'sub_title_place_holder',
  },

  // 点击左上角小图标事件
  tap_ch: function (e) {
    if (this.data.open) {
      this.setData({
        open: false
      });
    } else {
      this.setData({
        open: true
      });
    }
  },

  tap_start: function (e) {
    // touchstart事件
    // 把手指触摸屏幕的那一个点的 x 轴坐标赋值给 mark 和 newmark
    this.data.x_old = this.data.x_new = e.touches[0].pageX;
  },

  tap_drag: function (e) {
    // touchmove事件
    this.data.x_new = e.touches[0].pageX;

    // 手指从左向右移动
    if (this.data.x_old < this.data.x_new) {
      this.istoright = true;
    }

    // 手指从右向左移动
    if (this.data.x_old > this.data.x_new) {
      this.istoright = false;
    }
    this.data.x_old = this.data.newmark;
  },

  tap_end: function (e) {
    // touchend事件
    this.data.x_old = 0;
    this.data.x_new = 0;
    // 通过改变 opne 的值，让主页加上滑动的样式
    if (this.istoright) {
      this.setData({
        open: true
      });
    } else {
      this.setData({
        open: false
      });
    }
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

  }
})
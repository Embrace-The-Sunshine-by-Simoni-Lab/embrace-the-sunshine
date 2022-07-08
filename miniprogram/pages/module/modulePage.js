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
    percentage: 0,



    // 这些内容应储存到云端
    sub_titles: ['一、思想，情绪和行为', '二、恶性循环', '三、确定自己的模式', '四、打破恶性循环', '五、本模块作业'],
    current_page: 1,
    sub_title: '',
    p1: '<p style="color:#white">思想：脑海中的想法，这些想法可能与现实一致，也可能与现实大相径庭。比如，有时我们对人或事情的想法可能过于极端，从而偏离现实。 </p>'
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

  close_menu: function (e) {
    if (this.data.open) {
      this.setData({
        open: false
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
    // if (this.data.x_old < this.data.x_new) {
    //   this.istoright = true;
    // }

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

  go_back: function (e) {
    var page = this.data.current_page
    if (page != 1) {
      page = page - 1
    }
    this.setData({
        current_page: page
    })
  },

  go_next: function (e) {
    var page = this.data.current_page
    if (page != this.data.sub_titles.length) {
      page = page + 1
    }
    this.setData({
        current_page: page
    })
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
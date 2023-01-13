// pages/allPodCastPage/index.js
const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    podCastInfo: []
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let allPodCastData =  wx.getStorageSync('allPodCastData');
    this.setData({
      podCastInfo: allPodCastData
    })
  },
  jumpToPodCastPlay(e) {
    let clickedPodCastNum = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `../podcastPlay/index?podCastOrder=${clickedPodCastNum}`
    })
  }
})
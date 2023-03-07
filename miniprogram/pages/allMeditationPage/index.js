// pages/allPodCastPage/index.js
const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    meditationInfo: [],
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let allMeditationData =  wx.getStorageSync('allMeditationData');
    this.setData({
      meditationInfo: allMeditationData,
    })
  },

  onShow() {

  },

  jumpToPodCastPlay(e) {
    let clickedPodCastNum = e.currentTarget.dataset.id
    let type = e.currentTarget.dataset.podcasttype
    console.log("dd", e.currentTarget)
    console.log("clickedPodCastNum", clickedPodCastNum)
    console.log("type", type)
    wx.navigateTo({
      url: `../podcastPlay/index?podCastOrder=${clickedPodCastNum}&type=${type}`
    })
  }
})
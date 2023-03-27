// pages/allPodCastPage/index.js
const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    meditationInfo: [],
    meditationComplete: []
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let allMeditationData =  wx.getStorageSync('allMeditationData');
    let meditationComplete = app.globalData.meditationComplete
    this.setData({
      meditationInfo: allMeditationData,
      meditationComplete
    })
  },

  onShow() {
    let new_meditation_complete = app.globalData.finished_meditations
    console.log("new_meditation_completeaa", new_meditation_complete)
    this.setData({
      meditationComplete: new_meditation_complete
    })
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
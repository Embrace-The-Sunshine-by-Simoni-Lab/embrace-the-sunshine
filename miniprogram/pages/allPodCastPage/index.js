// pages/allPodCastPage/index.js
const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    podCastInfo: [],
    podcastComplete: []
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let allPodCastData =  wx.getStorageSync('allPodCastData');
  
    this.setData({
      podCastInfo: allPodCastData,
    })
  },

  onShow() {
    let new_podcast_complete = app.globalData.userData.finished_podcasts
    this.setData({
      podcastComplete: new_podcast_complete
    })
  },
  jumpToPodCastPlay(e) {
    let clickedPodCastNum = e.currentTarget.dataset.id
    let type = e.currentTarget.dataset.podcasttype
    wx.navigateTo({
      url: `../podcastPlay/index?podCastOrder=${clickedPodCastNum}&type=${type}`
    })
  }
})
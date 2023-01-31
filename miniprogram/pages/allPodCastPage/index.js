// pages/allPodCastPage/index.js
const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    podCastInfo: [],
    podcastsAvailability: [],
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // console.log("all list on load")
    let allPodCastData =  wx.getStorageSync('allPodCastData');

    console.log("app global", app.globalData)
    let podcastRegisterAvailability = app.globalData.podcastRegisterAvailability
    let podcastComplete = app.globalData.podcastComplete

    this.setData({
      podCastInfo: allPodCastData,
      podcastsAvailability: app.globalData.podcastsAvailability,
      podcastRegisterAvailability,
      podcastComplete
    })
  },
  jumpToPodCastPlay(e) {
    let clickedPodCastNum = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `../podcastPlay/index?podCastOrder=${clickedPodCastNum}`
    })
  },
  jumpToUnAvailableNotice(e) {
    let clickedPodCastNum = e.currentTarget.dataset.id
    let currpodcast_finish_status = this.data.podcastsAvailability[clickedPodCastNum - 1]
    let currpodcast_register_status = this.data.podcastRegisterAvailability[clickedPodCastNum]

    if(currpodcast_finish_status == -1) {
      wx.showModal({
        content: '请先完成当前内容',
        confirmText: '我知道了',
        showCancel: false,
        success (res) {
          console.log("还没有完成前面的内容")
        }
      })
    } else if(currpodcast_register_status == -1) {
      wx.showModal({
        content: '新内容下周更新',
        confirmText: '我知道了',
        showCancel: false,
        success (res) {
          console.log("还未到下一周")
        }
      })
    } else {
      wx.showModal({
        content: '请先完成当前内容',
        confirmText: '我知道了',
        showCancel: false,
        success (res) {
          console.log("还没有完成前面的内容")
        }
      })
    }
  }
})
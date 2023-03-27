// pages/allPodCastPage/index.js
const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    podCastInfo: [],
    podcastsAvailability: [],
    podcastComplete: []
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // console.log("all list on load")
    let allPodCastData =  wx.getStorageSync('allPodCastData');

    let podcastRegisterAvailability = app.globalData.podcastRegisterAvailability
    let podcastComplete = app.globalData.podcastComplete
    
    this.setData({
      podCastInfo: allPodCastData,
      podcastsAvailability: app.globalData.podcastsAvailability,
      podcastRegisterAvailability,
      podcastComplete
    })
  },

  onShow() {
    // let new_podcast_availability = this.generatePodcastAvailabilityArray(app.globalData.podcastComplete || [], app.globalData.podcastRegisterAvailability)
    let new_podcast_availability = Array(app.globalData.podCast.length).fill(1);
    
    let new_podcast_complete = app.globalData.finished_podcasts
    app.globalData.podcastsAvailability = new_podcast_availability

    this.setData({
      podcastsAvailability: new_podcast_availability,
      podcastComplete: new_podcast_complete
    })
  },
  // generate podcast availability and on podcast complete array and register time podcast array
  generatePodcastAvailabilityArray(podcastComplete, podcastRegisterAvailability) {
    if(podcastComplete.length == 0) return [1]
    let result = [1];
    for (let i = 0; i < podcastComplete.length; i++) {
      if (podcastComplete[i] === 1 && podcastRegisterAvailability[i + 1] === 1) {
        result[i + 1] = 1;
      }
    }
    return result
  },
  jumpToPodCastPlay(e) {
    let clickedPodCastNum = e.currentTarget.dataset.id
    let type = e.currentTarget.dataset.podcasttype
    wx.navigateTo({
      url: `../podcastPlay/index?podCastOrder=${clickedPodCastNum}&type=${type}`
    })
  },
  jumpToUnAvailableNotice(e) {
    let clickedPodCastNum = e.currentTarget.dataset.id
    let prev_podcast_finish_status = app.globalData.podcastComplete[clickedPodCastNum - 1]
    let currpodcast_register_status = app.globalData.podcastRegisterAvailability[clickedPodCastNum]
    console.log("global podcastComplete", app.globalData.podcastComplete);
    // console.log(" podcastsAvailability", this.data.podcastComplete);
    if(prev_podcast_finish_status == -1 || app.globalData.podcastComplete.length == 0 || clickedPodCastNum - 1 >= app.globalData.podcastComplete.length) {
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
    }
  }
})
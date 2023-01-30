// pages/allPodCastPage/index.js
const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    podCastInfo: [],
    podcastsAvailability: [1,-1,-1,-1],
    podcastRegisterAvailability: [], // to decide whether user has 
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let allPodCastData =  wx.getStorageSync('allPodCastData');
    const date = new Date(app.globalData.userData.reg_time);
    const today = new Date();
    const inputWeek = Math.floor((today - date) / (7 * 24 * 60 * 60 * 1000)) + 1;

    const podcastRegisterAvailability = new Array(app.globalData.podCast.length);
    for (let i = 0; i < podcastRegisterAvailability.length; i++) {
      if (i <= inputWeek) {
        podcastRegisterAvailability[i] = 1;
      }
    }

    this.setData({
      podCastInfo: allPodCastData,
      podcastRegisterAvailability
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
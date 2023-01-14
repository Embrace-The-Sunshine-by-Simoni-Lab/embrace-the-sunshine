const app = getApp()
Page({
  data: {
    ReportStatus: false,
    audioList: [],
    collectStatus: false,
    playStatus: false,
    isPlaying: false,
    currPodCastOrder: -1, 
  },

  onLoad(options) {
    let currentPodCastOrder = options.podCastOrder;
    this.setData({
      currPodCastOrder: currentPodCastOrder
    })
  },

  changePlayListOrder(e) {
    let newPodCastNum = e.detail.newPodCastNum
    this.setData({
      currPodCastOrder: newPodCastNum
    })
  }
})





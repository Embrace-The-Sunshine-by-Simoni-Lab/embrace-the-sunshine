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
    console.log("currentPodCastOrder", currentPodCastOrder)
    // let allPodCastData =  wx.getStorageSync('allPodCastData');
    // let currPodCastInfo = allPodCastData[currentPodCastOrder]
    // console.log("currentPodCastOrder", allPodCastData[currentPodCastOrder])
    // console.log("currPodCastInfo", currPodCastInfo)
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





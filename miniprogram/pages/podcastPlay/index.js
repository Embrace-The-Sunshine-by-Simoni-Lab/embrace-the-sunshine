const app = getApp()
Page({
  data: {
    ReportStatus: false,
    audioList: [],
    collectStatus: false,
    playStatus: false,
    isPlaying: false,
    currPodCastOrder: -1, 
    podCastType: ""
  },

  onLoad(options) {
    console.log("podcast options:", options)
    let currentPodCastOrder = options.podCastOrder;
    // 用来分辨podcast play需要渲染的是普通podcast还是meditation
    let podCastType = options.type
    console.log("options",options)
    this.setData({
      currPodCastOrder: currentPodCastOrder,
      podCastType
    })
  },

  changePlayListOrder(e) {
    let newPodCastNum = e.detail.newPodCastNum
    this.setData({
      currPodCastOrder: newPodCastNum
    })
  },


})





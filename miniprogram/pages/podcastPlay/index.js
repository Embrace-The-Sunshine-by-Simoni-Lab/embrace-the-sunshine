const app = getApp()
Page({
  data: {
    ReportStatus: false,
    audioList: [],
    collectStatus: false,
    playStatus: false,
    isPlaying: false,
    currPodCastOrder: -1, 
    podCastType: "",
    ifEnterFromCollection: false //这个是用于判断是不是从收藏页面进入的podcastPlay页面, 如果是的话, 那么就需要改前进和后退的逻辑
  },

  onLoad(options) {
    console.log("options", options)

    // 只有从collection页面进来的optjions里面才会有enterFromCollection这个key
    if('enterFromCollection' in options){
      this.setData({
        ifEnterFromCollection: true
      })
    }

    let currentPodCastOrder = options.podCastOrder;
    // 用来分辨podcast play需要渲染的是普通podcast还是meditation
    let podCastType = options.type
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





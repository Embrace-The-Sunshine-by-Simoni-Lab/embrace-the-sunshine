// components/playAudio.js
Component({

  // 组件的初始数据
  properties: {
    // 音频文件的临时路径
    src: {
      type: String,
      currentPlayTime: '',
    },
    currPodCastOrder: {
      type: Number,
    }
  },
  data: {
    isPlaying: false,
    sliderPosition: 0,
    currentPlayTime: '00:00', // 进度条的初始值为 0
    duration: 9, // 音频的总时长（单位：秒）
    currentProgressSecond: 0,
    podCastInfo: {},
    allPodCastCount: -1, // to make sure when you keep pressing next podcast, it will return to the first one
    currPodCastOrder: -1
  },

  ready() {
    let count =  wx.getStorageSync('allPodCastData').length;
    let allPodCastData =  wx.getStorageSync('allPodCastData');
    let currPodCast = allPodCastData[this.properties.currPodCastOrder]
    this.setData({
      podCastInfo: currPodCast,
      allPodCastCount: count,
      currPodCastOrder: this.properties.currPodCastOrder
    })

    this.innerAudioContext = wx.createInnerAudioContext({
      useWebAudioImplement: false
    })
    this.innerAudioContext.src = this.data.podCastInfo.url
    let totalDuration = this.data.podCastInfo.totalTimeSecond

    this.innerAudioContext.onTimeUpdate(() => {
      const currentSeconds = this.innerAudioContext.currentTime
      const newSliderPosition = currentSeconds / totalDuration * 100
      const format = this.formatTime(currentSeconds)
    
      this.setData({
        sliderPosition: newSliderPosition,
        currentPlayTime: format,
        currentProgressSecond: currentSeconds
      })
    })

    this.innerAudioContext.onSeeked(()=> {
      const currentSeconds = this.innerAudioContext.currentTime
    })
  },
  
  show() {

  }, 

  create() {

  },

  // 组件的方法列表
  methods: {

    // 处理滑动进度条时的事件
    sliderChange(event) {
      // 获取用户拖动进度条的值
      const value = event.detail.value
      // 计算新的播放位置，单位为秒
      const newAudioSecond = (value / 100) * this.data.podCastInfo.totalTimeSecond
      const format = this.formatTime(newAudioSecond)

      this.setData({
        currentPlayTime: format, // 当前播放的位置例如 01:00
        sliderPosition: value,
        currentProgressSecond: newAudioSecond,
      })
      
      this.innerAudioContext.seek(newAudioSecond)
    },

    togglePlay () {
      // 先判断音频是否正在播放
      if (this.data.isPlaying) {
        // 如果正在播放，则暂停播放
        this.innerAudioContext.pause()
        this.setData({
          isPlaying: false
        })
      } else {
        // 如果没有播放，则开始播放
        this.innerAudioContext.play()
        this.setData({
          isPlaying: true
        })
      }
    },
    changeCollectStatus() {
      let currentCollectStatus = this.data.collectStatus
      this.setData({
        collectStatus: !currentCollectStatus
      })
      wx.showToast({
        title: this.data.collectStatus?'收藏成功':'取消收藏',
        duration: 1500
      })
    },
    // change second to a time string format（such as 01:30）
    formatTime(time) {
      // Convert seconds to minutes and seconds
      const minutes = Math.floor(time / 60)
      const seconds = Math.floor(time % 60)
      // Format minutes and seconds
      const formattedMinutes = this.pad(minutes)
      const formattedSeconds = this.pad(seconds)
      // Concatenate time string
      return `${formattedMinutes}:${formattedSeconds}`
    },
    // change single number to double numbers（如 5 返回 05）
    pad(number) {
      // 如果传入的数字小于 10，则在前面添加一个 0
      if (number < 10) {
        return `0${number}`
      }
      return number
    },
    speedDown30() {
      let totalSeconds = this.data.podCastInfo.totalTimeSecond
      let currentProgressSecond = this.data.currentProgressSecond
      currentProgressSecond -= 30
      if(currentProgressSecond <= 0) {
        currentProgressSecond = 0
      }
      const newSliderPosition = currentProgressSecond / totalSeconds * 100
      const format = this.formatTime(currentProgressSecond)
      this.setData({
        currentPlayTime: format, // 当前播放的位置例如 01:00
        sliderPosition: newSliderPosition,
        currentProgressSecond: currentProgressSecond
      })
      // 更新音频的播放进度
      this.innerAudioContext.seek(currentProgressSecond)
      setTimeout(() => {
        let temp = this.innerAudioContext.paused
    }, 1200)
    },
    speedUp30() {
      let totalSeconds = this.data.podCastInfo.totalTimeSecond
      let currentProgressSecond = this.data.currentProgressSecond
      currentProgressSecond += 30

      if(currentProgressSecond >= totalSeconds) {
        currentProgressSecond = totalSeconds
      }
      const newSliderPosition = currentProgressSecond / totalSeconds * 100
      const format = this.formatTime(currentProgressSecond)
      this.setData({
        currentPlayTime: format, // 当前播放的位置例如 01:00
        sliderPosition: newSliderPosition,
        currentProgressSecond: currentProgressSecond
      })
      // 更新音频的播放进度
      this.innerAudioContext.seek(currentProgressSecond)
        setTimeout(() => {
          let temp = this.innerAudioContext.paused
      }, 1200)
    },
    // change a pod cast
    goToPrevPodCast() {
      let curPodCastId = this.properties.currPodCastOrder
      curPodCastId -= 1
      if(curPodCastId < 0) {
        curPodCastId = this.data.allPodCastCount - 1
      }

      this.triggerEvent("changePlayListOrder", { newPodCastNum: curPodCastId})
      
      // update podcaset content
      let allPodCastData =  wx.getStorageSync('allPodCastData');
      let currPodCast = allPodCastData[curPodCastId]
      this.setData({
        podCastInfo: currPodCast,
        currPodCastOrder: curPodCastId
      })
    },
    goToNextPodCast() {
      let curPodCastId = this.properties.currPodCastOrder
      curPodCastId += 1
      if(curPodCastId >= this.data.allPodCastCount) {
        curPodCastId = 0
      }

      this.triggerEvent("changePlayListOrder", { newPodCastNum: curPodCastId})

      // update podcaset content
      let allPodCastData =  wx.getStorageSync('allPodCastData');
      let currPodCast = allPodCastData[curPodCastId]
      this.setData({
        podCastInfo: currPodCast,
        currPodCastOrder: curPodCastId
      })
    }
  },
})


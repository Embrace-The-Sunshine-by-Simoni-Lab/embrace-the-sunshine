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
      type: Number
    }
  },
  data: {
    isPlaying: false,
    sliderPosition: 0,
    currentPlayTime: '00:00', // 进度条的初始值为 0
    duration: 9, // 音频的总时长（单位：秒）
    currentProgressSecond: 0,
    podCastInfo: {}
  },
  created() {
    // fetch the index of the podcast list and assign the corresponding podcast
    // for the podcast Player and podcast Quiz
    let allPodCastData =  wx.getStorageSync('allPodCastData');
    let currPodCast = allPodCastData[this.properties.currPodCastOrder]
    console.log("currPodCast", currPodCast)
    this.setData({
      podCastInfo: currPodCast
    })

    // this.innerAudioContext = wx.createInnerAudioContext({
    //   useWebAudioImplement: false
    // })
    // console.log(123, this.data.podCastInfo)
    // console.log(123, this.data.podCastInfo.url)
    // this.innerAudioContext.src = this.data.podCastInfo.url
    // let totalDuration = this.data.podCastInfo.totalTimeSecond
    // this.innerAudioContext.onTimeUpdate(() => {
    //   const currentSeconds = this.innerAudioContext.currentTime
    //   const newSliderPosition = currentSeconds / totalDuration * 100
    //   const format = this.formatTime(currentSeconds)
    
    //   this.setData({
    //     sliderPosition: newSliderPosition,
    //     currentPlayTime: format,
    //     currentProgressSecond: currentSeconds
    //   })
    // })
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
      // 更新当前播放位置
      this.setData({
        currentPlayTime: format, // 当前播放的位置例如 01:00
        sliderPosition: value,
        currentProgressSecond: newAudioSecond,
      })
      // 更新音频的播放进度
      this.innerAudioContext.seek(newAudioSecond)
      // 重要!!!!! 不可删
      setTimeout(() => {
          let temp = this.innerAudioContext.paused
      }, 1200)
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
    // 将秒数转换为时间字符串（如 01:30）
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
    // 将数字格式化为两位数（如 5 返回 05）
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

    goToPrevPodCast() {
      this.triggerEvent("changePlayListOrder", { newPodCastNum: 1})
    },
    goToNextPodCast() {
      this.triggerEvent("changePlayListOrder", { newPodCastNum: 1})
    }
  },
})


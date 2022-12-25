// components/playAudio.js
Component({
  // 组件的初始数据
  properties: {
    // 音频文件的临时路径
    src: {
      type: String,
      currentPlayTime: ''
    }
  },
  data: {
    isPlaying: false,
    sliderPosition: 0,
    currentPlayTime: '00:00', // 进度条的初始值为 0
    time: '00:10',
    duration: 9, // 音频的总时长（单位：秒）
    currentProgressSecond: 0
  },

  // 组件的生命周期函数s
  created() {
    this.innerAudioContext = wx.createInnerAudioContext()

    wx.cloud.downloadFile({
      fileID: 'cloud://cloud1-2gjzvf7qc03c5783.636c-cloud1-2gjzvf7qc03c5783-1306062016/podcast_audio/cartoon-intro-13087.mp3',
      success: (res) => {
        // 下载成功后，将文件的临时路径赋值给音频上下文
        this.innerAudioContext.src = res.tempFilePath
        // 监听 canplay 事件
        this.innerAudioContext.onCanplay(() => {         
          // 获取音频文件的总时长（单位：秒）
          const duration = this.innerAudioContext.duration
        })
      }
    })
    
    // 监听音频上下文的 timeUpdate 事件
    this.innerAudioContext.onTimeUpdate(() => {
      // 获取当前播放进度（单位：秒）
      const currentSeconds = this.innerAudioContext.currentTime
      const newSliderPosition = currentSeconds / this.data.duration * 100
      const format = this.formatTime(currentSeconds)

      // 更新进度条的值
      this.setData({
        sliderPosition: newSliderPosition,
        currentPlayTime: format, // 当前播放的位置 01:00
        currentProgressSecond: currentSeconds
      })
    })
  },

  // 组件的方法列表
  methods: {
    // 处理滑动进度条时的事件
    sliderChange(event) {
      // 获取用户拖动进度条的值
      const value = event.detail.value
      // 计算新的播放位置，单位为秒
      const newAudioSecond = (value / 100) * this.data.duration
      // 更新进度条位置
      this.setData({
        sliderPosition: value
      })
      // 更新音频的播放进度
      this.innerAudioContext.seek(newAudioSecond)
      // 更新当前播放位置
      this.setData({
        currentProgressSecond: newAudioSecond
      })
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
      // 将秒数转换为分钟和秒数
      const minutes = Math.floor(time / 60)
      const seconds = Math.floor(time % 60)
      // 格式化分钟和秒数
      const formattedMinutes = this.pad(minutes)
      const formattedSeconds = this.pad(seconds)
      // 拼接时间字符串
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
      let currentProgressSecond = this.data.currentProgressSecond
      currentProgressSecond -= 30
      if(currentProgressSecond <= 0) {
        currentProgressSecond = 0
      }
      const newSliderPosition = currentProgressSecond / this.data.duration * 100
      this.setData({
        sliderPosition: newSliderPosition,
        currentProgressSecond: currentProgressSecond
      })
      // 更新音频的播放进度
      this.innerAudioContext.seek(currentProgressSecond)
    },
    speedUp30() {
      let currentProgressSecond = this.data.currentProgressSecond
      currentProgressSecond += 30
      if(currentProgressSecond >= this.data.duration) {
        currentProgressSecond = this.data.duration
      }
      const newSliderPosition = currentProgressSecond / this.data.duration * 100
      this.setData({
        sliderPosition: newSliderPosition,
        currentProgressSecond: currentProgressSecond
      })
      // 更新音频的播放进度
      this.innerAudioContext.seek(currentProgressSecond)
    },
  },


})


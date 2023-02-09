// components/playAudio.js
const app = getApp()

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
    currPodCastOrder: -1,
    podcastCollected: false,
  },

  detached: function() {
    this.innerAudioContext.destroy();
  },

  ready() {
    const app = getApp()
    let allPodCastData =  wx.getStorageSync('allPodCastData');
    let count = allPodCastData.length
    let currPodCast = allPodCastData[this.properties.currPodCastOrder]
    // get info about if the current podcast has already been finished listening
    let podCastEndStatus;
    if (app.globalData.userData.finished_podcasts == undefined) {
      podCastEndStatus = -1;
    } else {
      podCastEndStatus = app.globalData.userData.finished_podcasts[this.properties.currPodCastOrder];
    }
    
    console.log("podCastEndStatus", podCastEndStatus)
    // change the display collect star status, 1 means collected, -1 means not collected
    let curr_podcast_fav;
    if (app.globalData.userData.fav_podcasts == undefined) {
      curr_podcast_fav = -1;
    } else {
      curr_podcast_fav = app.globalData.userData.fav_podcasts[this.properties.currPodCastOrder];
    }
    let curr_podcast_fav_status;

    if(curr_podcast_fav === 1) {
      curr_podcast_fav_status = true
    } else {
      curr_podcast_fav_status = false;
    }
    console.log("podCastInfo0", this.data.podCastInfo)
    this.setData({
      podCastInfo: currPodCast,
      allPodCastCount: count,
      currPodCastOrder: this.properties.currPodCastOrder,
      podcastCollected: curr_podcast_fav_status,
    })

    console.log("podCastInfo", this.data.podCastInfo)
    this.innerAudioContext = wx.createInnerAudioContext({
      useWebAudioImplement: false
    })
    this.innerAudioContext.src = this.data.podCastInfo.url
    let totalDuration = this.data.podCastInfo.totalTimeSecond

    this.innerAudioContext.onTimeUpdate(() => {
      // console.log("on time update")
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
      // console.log("onSeeked called")
      const currentSeconds = this.innerAudioContext.currentTime
    })

    this.innerAudioContext.onEnded(()=> {
      if(podCastEndStatus === -1) {
        wx.cloud.callFunction({
          name: 'finish_podcast',
          data: {
            podcast_id: this.properties.currPodCastOrder,
          },
          success: out => {
            console.log("successfully finish podcast")
            // 提交完后更新
            console.log("out.result: ", out.result);
            app.globalData.userData.finished_podcasts = out.result.data;
          },
          fail: out => {
            console.log('fail to finsih podcast')
          }
        })
      }
    })
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
      let currentCollectStatus = this.data.podcastCollected
      wx.cloud.callFunction({
        name: 'toggle_podcast_star_status',
        data: {
          podcast_id: this.properties.currPodCastOrder
        },
        success: out => {
          console.log("successfully update")
          // // 提交完后更新
          app.globalData.userData.fav_podcasts = out.result.data;

          wx.showToast({
            title: this.data.podcastCollected?'取消收藏':'收藏成功',
            duration: 1500
          })
          this.setData({
            podcastCollected: !currentCollectStatus
          })
        },
        fail: out => {
          console.log('fail to collect')
        }
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
      this.innerAudioContext.destroy();
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
        currPodCastOrder: curPodCastId,
        isPlaying: false,
        sliderPosition: 0,
        currentProgressSecond: 0,
        currentPlayTime: '00:00'
      })
      this.audioPlayerInit();
    },
    goToNextPodCast() {
      this.innerAudioContext.destroy();
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
        currPodCastOrder: curPodCastId,
        isPlaying: false,
        sliderPosition: 0,
        currentProgressSecond: 0,
        currentPlayTime: '00:00'
      })
      this.audioPlayerInit();
    },
    audioPlayerInit() {
      const app = getApp()
      let allPodCastData =  wx.getStorageSync('allPodCastData');
      let count = allPodCastData.length
      let currPodCast = allPodCastData[this.properties.currPodCastOrder]
      // get info about if the current podcast has already been finished listening
      let podCastEndStatus;
      if (app.globalData.userData.finished_podcasts == undefined) {
        podCastEndStatus = -1;
      } else {
        podCastEndStatus = app.globalData.userData.finished_podcasts[this.properties.currPodCastOrder];
      }
      
      console.log("podCastEndStatus", podCastEndStatus)
      // change the display collect star status, 1 means collected, -1 means not collected
      let curr_podcast_fav;
      if (app.globalData.userData.fav_podcasts == undefined) {
        curr_podcast_fav = -1;
      } else {
        curr_podcast_fav = app.globalData.userData.fav_podcasts[this.properties.currPodCastOrder];
      }
      let curr_podcast_fav_status;
  
      if(curr_podcast_fav === 1) {
        curr_podcast_fav_status = true
      } else {
        curr_podcast_fav_status = false;
      }
      console.log("podCastInfo0", this.data.podCastInfo)
      this.setData({
        podCastInfo: currPodCast,
        allPodCastCount: count,
        currPodCastOrder: this.properties.currPodCastOrder,
        podcastCollected: curr_podcast_fav_status,
      })
  
      console.log("podCastInfo", this.data.podCastInfo)
      this.innerAudioContext = wx.createInnerAudioContext({
        useWebAudioImplement: false
      })
      this.innerAudioContext.src = this.data.podCastInfo.url
      let totalDuration = this.data.podCastInfo.totalTimeSecond


  
      this.innerAudioContext.onTimeUpdate(() => {
        // console.log("on time update")
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
        // console.log("onSeeked called")
        const currentSeconds = this.innerAudioContext.currentTime
      })

      this.innerAudioContext.seek(0);
  
      this.innerAudioContext.onEnded(()=> {
        if(podCastEndStatus === -1) {
          wx.cloud.callFunction({
            name: 'finish_podcast',
            data: {
              podcast_id: this.properties.currPodCastOrder,
            },
            success: out => {
              console.log("successfully finish podcast")
              // 提交完后更新
              console.log("out.result: ", out.result);
              app.globalData.userData.finished_podcasts = out.result.data;
            },
            fail: out => {
              console.log('fail to finsih podcast')
            }
          })
        }
      })
    }
  },
})


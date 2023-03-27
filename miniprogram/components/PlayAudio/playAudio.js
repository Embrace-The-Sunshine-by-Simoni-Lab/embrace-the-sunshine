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
    },
    podCastType: {
      type: String
    },
    ifEnterFromCollection: {
      type: Boolean
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
    podcastCollected: false,
  },

  detached: function() {
    this.innerAudioContext.destroy();
  },

  ready() {
    // 这里要要根据podcast的类型(是普通podcast还是meditation)设置allPodCastData,然后也要根据type来设置count, count的作用是去上一个博客或者下一个博客的时候, 不会超出范围
    const app = getApp()
    let allPodCastData;
    let count;
    let curr_podcast_fav; // [1, 1, 1, null], 列举了每个podcast的收藏情况, 1为收藏
    let curr_podcast_fav_status; // true or false, 代表当前的podcast是否已经被收藏过了

    console.log("current fav", app.globalData.userData.fav_podcasts)
    if(this.properties.podCastType !== '冥想') {
      // The media type is podcast
      allPodCastData =  wx.getStorageSync('allPodCastData');
      count = app.globalData.podcastsAvailability.length
      console.log("-----------", allPodCastData)
      console.log("-----------", allPodCastData.length)

      if (!app.globalData.userData.fav_podcasts) {
        curr_podcast_fav = -1;
      } else {
        curr_podcast_fav = app.globalData.userData.fav_podcasts[this.properties.currPodCastOrder];
      }
      // 根据当前curr_podcast_fav来决定curr_podcast_fav_status的状态
      if(curr_podcast_fav === 1) {
        curr_podcast_fav_status = true
      } else {
        curr_podcast_fav_status = false;
      }
    } else {
      // The media type is meditation
      allPodCastData =  wx.getStorageSync('allMeditationData');
      count = allPodCastData.length
      if (!app.globalData.userData.fav_medi) {
        curr_podcast_fav = -1;
      } else {
        curr_podcast_fav = app.globalData.userData.fav_medi[this.properties.currPodCastOrder];
      }
      if(curr_podcast_fav === 1) {
        curr_podcast_fav_status = true
      } else {
        curr_podcast_fav_status = false;
      }
    }

    let currPodCast = allPodCastData[this.properties.currPodCastOrder]
    // get info about if the current podcast has already been finished listening
    // 这个podCastEndStatus主要是用作下面来判断当播客播完的时候,是否要给数据库记录该播客是否已经完成
    // 需要按照当前播客是否为冥想播客分开判断

    const { podCastType, currPodCastOrder } = this.properties;
    const { finished_podcasts, meditation_podcasts } = app.globalData.userData;
    const podcast_finish_list = podCastType !== '冥想' ? finished_podcasts : meditation_podcasts;
    const podCastEndStatus = podcast_finish_list ? podcast_finish_list[currPodCastOrder] || -1 : -1;
    // let podCastEndStatus;
    // if(this.properties.podCastType !== '冥想') {
    //   if (app.globalData.userData.finished_podcasts === undefined) {
    //     podCastEndStatus = -1;
    //   } else {
    //     podCastEndStatus = app.globalData.userData.finished_podcasts[this.properties.currPodCastOrder];
    //   }
    // } else {
    //   if (app.globalData.userData.finished_podcasts === undefined) {
    //     podCastEndStatus = -1;
    //   } else {
    //     podCastEndStatus = app.globalData.userData.meditation_podcasts[this.properties.currPodCastOrder];
    //   }
    // }

    this.setData({
      podCastInfo: currPodCast,
      allPodCastCount: count,
      currPodCastOrder: this.properties.currPodCastOrder,
      podcastCollected: curr_podcast_fav_status,
    })

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
      const currentSeconds = this.innerAudioContext.currentTime
    })

    this.innerAudioContext.onEnded(()=> {
      if(!podCastEndStatus || podCastEndStatus == -1) {
        // 触发属于博客的podcast
        if(this.properties.podCastType !== '冥想') {
          wx.cloud.callFunction({
            name: 'finish_podcast',
            data: {
              podcast_id: this.properties.currPodCastOrder,
            },
            success: out => {
              console.log("successfully finish podcast")
              // 提交完后更新
              console.log("out.result: ", out.result);
              app.globalData.finished_podcasts = out.result.data;
              // app.globalData.podcastComplete = out.result.data;
            },
            fail: out => {
              console.log('fail to finsih podcast')
            }
          })
        } else {
        console.log("meditation parameter", this.properties.currPodCastOrder)
        // 触发属于冥想的podcast
          wx.cloud.callFunction({
            name: 'finish_meditation',
            data: {
              meditation_id: this.properties.currPodCastOrder,
            },
            success: out => {
              console.log("successfully finish podcast")
              // 提交完后更新
              console.log("out.result: ", out.result);
              app.globalData.finished_meditations = out.result.data;
              // app.globalData.podcastComplete = out.result.data;
            },
            fail: out => {
              console.log('fail to finsih podcast')
            }
          })
        }
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
      let mediaType = this.properties.podCastType == '冥想' ? 'meditation' : 'podcast';
      console.log("------before cloud function-------")
      console.log(this.data)
      console.log("currentCollectStatus:", currentCollectStatus)
      console.log("this.properties.podCastType:", this.properties.podCastType)
      console.log("mediaType:", mediaType)
      console.log("-------------")
      wx.cloud.callFunction({
        name: 'toggle_podcast_star_status',
        data: {
          mediaType: mediaType,
          podcast_id: this.properties.currPodCastOrder
        },
        success: out => {
          console.log("successfully update")
          // // 提交完后更新
          app.globalData.userData = out.result.data;
          // console.log('out.result.data', out.result.data)
          wx.showToast({
            title: this.data.podcastCollected?'取消收藏':'收藏成功',
            duration: 1500
          })
          this.setData({
            podcastCollected: !currentCollectStatus
          })
          console.log("-----after cloud function--------")
          console.log("currentCollectStatus:", currentCollectStatus)
          console.log("this.properties.podCastType:", this.properties.podCastType)
          console.log("mediaType:", mediaType)
          console.log("-------------")
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
    speedDown10() {
      let totalSeconds = this.data.podCastInfo.totalTimeSecond
      let currentProgressSecond = this.data.currentProgressSecond
      currentProgressSecond -= 10
      if(currentProgressSecond <= 0) {
        currentProgressSecond = 0
      }
      const newSlidedrPosition = currentProgressSecond / totalSeconds * 100
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
    speedUp10() {
      let totalSeconds = this.data.podCastInfo.totalTimeSecond
      let currentProgressSecond = this.data.currentProgressSecond
      currentProgressSecond += 10

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
      // 销毁当前播客实例
      this.innerAudioContext.destroy();
      // 获取当前的所有收藏情况
      let curr_fav_list;
      if(this.properties.podCastType === '播客') {
        curr_fav_list = app.globalData.userData.fav_podcasts
      } else {
        curr_fav_list = app.globalData.userData.fav_medi
      }
      // 获取当前是否是从收藏页面进入的
      let ifEnterFromCollection = this.properties.ifEnterFromCollection
      let curPodCastId;
      // 如果是从收藏页面进来的, 那么PodCastOrder就需要被特殊处理
      if(ifEnterFromCollection) {
        curPodCastId = this.getPrevIndex(curr_fav_list, this.properties.currPodCastOrder)
      } else {// 如果不是从收藏页面进来, 那么currPodCastOrder就只需奥正常加一就好了
        curPodCastId = this.properties.currPodCastOrder
        curPodCastId -= 1
        if(curPodCastId < 0) {
          curPodCastId = this.data.allPodCastCount - 1
        }
      }

      this.triggerEvent("changePlayListOrder", { newPodCastNum: curPodCastId})
      
      // update podcaset content
      let allPodCastData;
      let currPodCast;
      if(this.properties.podCastType !== '冥想') {
        allPodCastData =  wx.getStorageSync('allPodCastData');
        currPodCast = allPodCastData[curPodCastId]
      } else {
        allPodCastData =  wx.getStorageSync('allMeditationData');
        currPodCast = allPodCastData[curPodCastId]
      }

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
      // 销毁当前播客实例
      this.innerAudioContext.destroy();
      console.log("podCastType", this.properties.podCastType)
      console.log("globalData", app.globalData.userData)

      if (this.properties.podCastType == null) {
        return;
     }

      // 获取当前的所有收藏情况
      let curr_fav_list;
      if(this.properties.podCastType === '播客') {
        console.log("enter 播客")
        curr_fav_list = app.globalData.userData.fav_podcasts
      } else {
        console.log("enter 冥想")
        curr_fav_list = app.globalData.userData.fav_medi
      }

      console.log("xxxxxxxxxxxxxxxcurr_fav_list", curr_fav_list)
      // 获取当前是否是从收藏页面进入的
      let ifEnterFromCollection = this.properties.ifEnterFromCollection
      console.log("ifEnterFromCollection", ifEnterFromCollection)
      let curPodCastId;
      // 如果是从收藏页面进来的, 那么PodCastOrder就需要被特殊处理
      if(ifEnterFromCollection) {
        console.log("curr_fav_list", curr_fav_list)
        console.log("currPodCastOrder", this.properties.currPodCastOrder)
        curPodCastId = this.getNextIndex(curr_fav_list, this.properties.currPodCastOrder)
        console.log("next curPodCastId", curPodCastId)
      } else {// 如果不是从收藏页面进来, 那么currPodCastOrder就只需奥正常加一就好了
        curPodCastId = this.properties.currPodCastOrder
        curPodCastId += 1
        console.log("allPodCastCount",this.data.allPodCastCount)
        if(curPodCastId >= this.data.allPodCastCount) {
          curPodCastId = 0
        }
      }
      console.log("curPodCastId", curPodCastId)
      this.triggerEvent("changePlayListOrder", { newPodCastNum: curPodCastId})
      // update podcaset content(取决于现在是meditation还是普通的podcast)
      let allPodCastData;
      let currPodCast;
      if(this.properties.podCastType !== '冥想') {
        allPodCastData =  wx.getStorageSync('allPodCastData');
        currPodCast = allPodCastData[curPodCastId]
      } else {
        allPodCastData =  wx.getStorageSync('allMeditationData');
        currPodCast = allPodCastData[curPodCastId]
      }

      console.log("allPodCastData", allPodCastData)
      console.log("currPodCast", currPodCast)

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

    // 这个方程是专门用来处理收藏情况下的next button的, 由于fav_list的格式为[1,1,null, 1];
    // Overall, this function is designed to find the next index in a list after a given index where the value is not null and equal to 1. It handles cases where the search needs to wrap around to the beginning of the list and returns null if no such value is found.
    getNextIndex(list, index) {
      let i = (index + 1) % list.length; // start from next index or 0 if at end of list
      while (i !== index) {
        if (list[i] === 1) {
          return i;
        }
        i = (i + 1) % list.length; // continue to next index or wrap around to start of list
      }
      return null; // no non-null value of 1 found
    },

    // 这个方程是专门用来处理收藏情况下的prev button的, 由于fav_list的格式为[1,1,null, 1];
    // 该函数首先将i设置为前一个索引。如果在索引0，则将其设置为列表的末尾。然后它进入一个循环，在循环中，它会检查索引i的值是否是1，如果是，则返回该索引。否则，它会将i设置为前一个索引，并继续搜索前一个索引，或将其包装到列表的末尾。当i等于原始索引时，循环将结束，函数返回null，表示找不到满足条件的索引
    getPrevIndex(list, index) {
      let i = (index - 1 + list.length) % list.length; // 将i设置为前一个索引，如果在索引0，则将其设置为列表的末尾
      while (i !== index) { // 当i不等于原始索引时，进入循环
        if (list[i] === 1) { // 如果找到了一个非空值为1的索引，则返回该索引
          return i;
        }
        i = (i - 1 + list.length) % list.length; // 继续搜索前一个索引，或将其包装到列表的末尾
      }
      return null; // 如果没有找到满足条件的索引，则返回null
    },

    audioPlayerInit() {
      // 这里要要根据podcast的类型(是普通podcast还是meditation)设置allPodCastData,然后也要根据type来设置count, count的作用是去上一个博客或者下一个博客的时候, 不会超出范围
      const app = getApp()
      let allPodCastData;
      let count;
      let curr_podcast_fav; // [1, 1, 1, null], 列举了每个podcast的收藏情况, 1为收藏
      let curr_podcast_fav_status; // true or false, 代表当前的podcast是否已经被收藏过了

      console.log("current fav", app.globalData.userData.fav_podcasts)
      if(this.properties.podCastType !== '冥想') {
        // The media type is podcast
        allPodCastData =  wx.getStorageSync('allPodCastData');
        count = app.globalData.podcastsAvailability.length
        
        if (!app.globalData.userData.fav_podcasts) {
          curr_podcast_fav = -1;
        } else {
          curr_podcast_fav = app.globalData.userData.fav_podcasts[this.properties.currPodCastOrder];
        }
        // 根据当前curr_podcast_fav来决定curr_podcast_fav_status的状态
        if(curr_podcast_fav === 1) {
          curr_podcast_fav_status = true
        } else {
          curr_podcast_fav_status = false;
        }
      } else {
        // The media type is meditation
        allPodCastData =  wx.getStorageSync('allMeditationData');
        count = allPodCastData.length
        if (!app.globalData.userData.fav_medi) {
          curr_podcast_fav = -1;
        } else {
          curr_podcast_fav = app.globalData.userData.fav_medi[this.properties.currPodCastOrder];
        }
        if(curr_podcast_fav === 1) {
          curr_podcast_fav_status = true
        } else {
          curr_podcast_fav_status = false;
        }
      }

      let currPodCast = allPodCastData[this.properties.currPodCastOrder]
      const { podCastType, currPodCastOrder } = this.properties;
      const { finished_podcasts, meditation_podcasts } = app.globalData.userData;
      const podcast_finish_list = podCastType !== '冥想' ? finished_podcasts : meditation_podcasts;
      const podCastEndStatus = podcast_finish_list ? podcast_finish_list[currPodCastOrder] || -1 : -1;

      // get info about if the current podcast has already been finished listening
      // let podCastEndStatus;
      // if (app.globalData.userData.finished_podcasts === undefined) {
      //   podCastEndStatus = -1;
      // } else {
      //   podCastEndStatus = app.globalData.userData.finished_podcasts[this.properties.currPodCastOrder];
      // }

      this.setData({
        podCastInfo: currPodCast,
        allPodCastCount: count,
        currPodCastOrder: this.properties.currPodCastOrder,
        podcastCollected: curr_podcast_fav_status,
      })

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
        const currentSeconds = this.innerAudioContext.currentTime
      })

      this.innerAudioContext.onEnded(()=> {
        if(!podCastEndStatus || podCastEndStatus == -1) {
          console.log("podcast parameter", this.properties.currPodCastOrder)
          // 触发属于博客的podcast
          if(this.properties.podCastType !== '冥想') {
            wx.cloud.callFunction({
              name: 'finish_podcast',
              data: {
                podcast_id: this.properties.currPodCastOrder,
              },
              success: out => {
                console.log("successfully finish podcast")
                // 提交完后更新
                console.log("out.result: ", out.result);
                app.globalData.finished_podcasts = out.result.data;
                // app.globalData.podcastComplete = out.result.data;
              },
              fail: out => {
                console.log('fail to finsih podcast')
              }
            })
          } else {
          // 触发属于冥想的podcast

            console.log("meditation parameter", this.properties.currPodCastOrder)
            wx.cloud.callFunction({
              name: 'finish_meditation',
              data: {
                meditation_id: this.properties.currPodCastOrder,
              },
              success: out => {
                console.log("successfully finish podcast")
                // 提交完后更新
                console.log("out.result: ", out.result);

                
                app.globalData.finished_meditations = out.result.data;
                // app.globalData.podcastComplete = out.result.data;
              },
              fail: out => {
                console.log('fail to finsih podcast')
              }
            })
          }
        }
      })
    }
  },
})


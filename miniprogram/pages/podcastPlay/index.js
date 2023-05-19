// 创建音频播放实例
const myAudio = wx.createInnerAudioContext()

const app = getApp()
Page({
  data: {
    collectStatus: false,
    currPodCastOrder: -1, 
    podCastType: "",
    ifEnterFromCollection: false, //这个是用于判断是不是从收藏页面进入的podcastPlay页面, 如果是的话, 那么就需要改前进和后退的逻辑
    // 音频播放控制
    forNowTime: '00:00', //当前播放时间
    forAllTime: "", //总时长
    duration: 0, //总时间 秒
    current: 0, //slider当前进度
    seek: false, //是否处于拖动状态
    paused: true, //是否处于暂停状态
    podCastInfo: {},
    allPodCastCount: -1,
    podcastCollected: false,
    loading: false,
  },
  onLoad(options) {
    const app = getApp()
    // console.log(app.globalData);
    app.globalData.audio_unload = false;
    // 这里要要根据podcast的类型(是普通podcast还是meditation)设置allPodCastData,然后也要根据type来设置count, count的作用是去上一个博客或者下一个博客的时候, 不会超出范围
    let allPodCastData;
    let count;
    let curr_podcast_fav; // [1, 1, 1, null], 列举了每个podcast的收藏情况, 1为收藏
    let curr_podcast_fav_status; // true or false, 代表当前的podcast是否已经被收藏过了
    let currPodCastOrder = parseInt(options.podCastOrder)
    let podCastType = options.type

    if(podCastType !== '冥想') {
      // The media type is podcast
      allPodCastData =  wx.getStorageSync('allPodCastData');
      count = app.globalData.podCast.length
      if (!app.globalData.userData.fav_podcasts) {
        curr_podcast_fav = -1;
      } else {
        curr_podcast_fav = app.globalData.userData.fav_podcasts[currPodCastOrder];
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
        curr_podcast_fav = app.globalData.userData.fav_medi[currPodCastOrder];
      }
      if(curr_podcast_fav === 1) {
        curr_podcast_fav_status = true
      } else {
        curr_podcast_fav_status = false;
      }
    }

    let currPodCast = allPodCastData[currPodCastOrder]

    this.setData({
      currPodCastOrder, 
      podCastType,
      forAllTime: currPodCast.totalTime,
      podCastInfo: currPodCast,
      allPodCastCount: count,
      podcastCollected: curr_podcast_fav_status,
    })

    // 只有从collection页面进来的optjions里面才会有enterFromCollection这个key
    if('enterFromCollection' in options){
      this.setData({
        ifEnterFromCollection: true
      })
    }
    this.audioInit(currPodCast.url, currPodCast.mainTitle)
  },

  // 时间格式化
  format(t) {
    let time = Math.floor(t / 60) >= 10 ? Math.floor(t / 60) : '0' + Math.floor(t / 60)
    t = time + ':' + ((t % 60) / 100).toFixed(2).slice(-2)
    return t
  },

  changePlayListOrder(curPodCastId) {
    this.setData({
      currPodCastOrder: curPodCastId
    })
  },

  // 音频播放-初始化
  audioInit(url, title) {
    myAudio.src = url 

    // 设置音频播放倍速，此处若不设置，页面上点击设置倍速就不会产生效果
    myAudio.playbackRate = 1.0

    myAudio.onError((res) => {
      console.log("onError");
      console.log('An error occurred during audio playback:', res.errMsg);
      // Handle the error or perform any necessary actions
    });

    // 暂停监听
    myAudio.onPause(() => {
    })

    myAudio.onSeeking(() => {
      this.setData({
        loading: true
      })
    })

    myAudio.onSeeked(() => {
      if (this.data.pause) {
        return;
      }
      myAudio.duration
      this.setData({
        loading: false
      })
      myAudio.play();
    })

    myAudio.onWaiting(() => {
      this.setData({
        loading: true
      })
    })

    // 监听音频进入可以播放状态的事件。但不保证后面可以流畅播放，必须要这个监听，不然播放时长更新监听不会生效，不能给进度条更新值
    myAudio.onCanplay(() => {
      if (this.data.pause) {
        return;
      }
      myAudio.duration
      // this.setData({
      //   loading: false
      // })
      myAudio.play();
    })

    // 播放监听
    myAudio.onPlay(() => {
      if (app.globalData.audio_unload) {
        return;
      }
      this.setData({
        paused: false,
        loading: false
      })
    })

    // 播放时长更新监听
    myAudio.onTimeUpdate(() => {
      // 监听播放进度，更新页面播放时长和进度条进度
      this.setData({
        forNowTime: this.format(parseInt(myAudio.currentTime)),
        forAllTime: this.format(parseInt(myAudio.duration)),
        current: myAudio.currentTime,
        duration: myAudio.duration
      })
    })
    myAudio.onStop(()=> {
    })
    myAudio.onPause(()=> {
    })
    myAudio.onEnded(() => {
      // 这个podCastEndStatus主要是用作下面来判断当播客播完的时候,是否要给数据库记录该播客是否已经完成
      // 需要按照当前播客是否为冥想播客分开判断
      const { finished_podcasts, meditation_podcasts } = app.globalData.userData;
      const podcast_finish_list = this.data.podCastType !== '冥想' ? finished_podcasts : meditation_podcasts;
      const podCastEndStatus = podcast_finish_list ? podcast_finish_list[this.datacurrPodCastOrder] || -1 : -1;
      
      //当audio结束的时候,记录进数据库 
      if(!podCastEndStatus || podCastEndStatus == -1) {
        // 触发属于博客的podcast
        if(this.properties.podCastType !== '冥想') {
          wx.cloud.callFunction({
            name: 'finish_podcast',
            data: {
              podcast_id: this.properties.currPodCastOrder,
            },
            success: out => {
              // 提交完后更新
              console.log("out.result: ", out.result);
              app.globalData.userData.finished_podcasts = out.result.data;
              // app.globalData.podcastComplete = out.result.data;
            },
            fail: out => {
            }
          })
        } else {
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
              app.globalData.userData.finished_meditations = out.result.data;
              // app.globalData.podcastComplete = out.result.data;
              
            },
            fail: out => {
              console.log('fail to finsih podcast')
            }
          })
        }
      }
      this.restartAudioFromBeginning();
    });
  },
  restartAudioFromBeginning() {
    myAudio.seek(0);
    myAudio.play();
  },
  // 开始播放
  audioPlay(val) {
    console.log("触发audioPlay")
    myAudio.src = this.data.podCastInfo.url

    myAudio.play()
  },

  // 暂停播放
  audioPause() {
    // 将暂停状态赋值为true
    this.setData({
      paused: true,
    })
    // 暂停
    myAudio.pause()
  },
  changeCollectStatus() {
    let currentCollectStatus = this.data.podcastCollected
    let mediaType = this.properties.podCastType == '冥想' ? 'meditation' : 'podcast';
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
      },
      fail: out => {
        console.log('fail to collect')
      }
    })
  },
  // Forward up ten seconds
  forwardUpTenSeconds() {
    const newPosition = myAudio.currentTime + 10;
    myAudio.seek(newPosition);
  },

  // Backward ten seconds
  backwardTenSeconds() {
    const newPosition = myAudio.currentTime - 10;
    if (newPosition < 0) {
      myAudio.seek(0);
    } else {
      myAudio.seek(newPosition);
    }
  },

  // 进度条改变
  audioChanging(val) {
    // 通过 seek 来更改当前播放实例的进度
    myAudio.seek(val.detail.value)
    // 界面显示滑动的时间同步改变
    this.setData({
      forNowTime: this.format(parseInt(val.detail.value))
    })
  },

  // 进度条改变完成
  audioChange(val) {
    myAudio.seek(val.detail.value)
  },


  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    // 暂停播放
    this.audioPause()
  },

  /**
   * 生命周期函数--监听页面卸载
   */
onUnload: function () {
    // 停止播放
    app.globalData.audio_unload = true;
    this.setData({
      paused: true
    })
    // 暂停
    myAudio.pause()
    // myAudio.destroy()
  },

  goToNextPodCast() {
    // 获取当前的所有收藏情况
    let curr_fav_list;
    if(this.data.podCastType === '播客') {
      curr_fav_list = app.globalData.userData.fav_podcasts
    } else {
      curr_fav_list = app.globalData.userData.fav_medi
    }

    // // 获取当前是否是从收藏页面进入的
    let ifEnterFromCollection = this.data.ifEnterFromCollection
    let curPodCastId;
    // // 如果是从收藏页面进来的, 那么PodCastOrder就需要被特殊处理
    if(ifEnterFromCollection) {
      curPodCastId = this.getNextIndex(curr_fav_list, this.data.currPodCastOrder)
    } else {// 如果不是从收藏页面进来, 那么currPodCastOrder就只需奥正常加一就好了
      curPodCastId = this.data.currPodCastOrder
      curPodCastId += 1
      if(curPodCastId >= this.data.allPodCastCount) {
        curPodCastId = 0
      }
    }

    let allPodCastData;
    let currPodCast;

    if(this.data.podCastType !== '冥想') {
      allPodCastData =  wx.getStorageSync('allPodCastData');
      currPodCast = allPodCastData[curPodCastId]
    } else {
      allPodCastData =  wx.getStorageSync('allMeditationData');
      currPodCast = allPodCastData[curPodCastId]
    }

    this.setData({
      podCastInfo: currPodCast,
      currPodCastOrder: curPodCastId,
      forNowTime: '00:00',
      current: 0,
      forAllTime: currPodCast.totalTime
    });
    myAudio.pause()
    myAudio.stop()
    myAudio.seek(0);
    myAudio.src = currPodCast.url

    myAudio.onCanplay(() => {
      myAudio.play();
    });
  },

  goToPrevPodCast() {
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
      forNowTime: '00:00',
      current: 0,
      forAllTime: currPodCast.totalTime
    });
    myAudio.pause()
    myAudio.stop()
    myAudio.seek(0);
    myAudio.src = currPodCast.url

    myAudio.onCanplay(() => {
      this.setData({
        loading: false
      })
      myAudio.play();
    });
  },
  // 这个方程是专门用来处理收藏情况下的prev button的, 由于fav_list的格式为[1,1,null, 1];
  // 该函数首先将i设置为前一个索引。如果在索引0，则将其设置为列表的末尾。然后它进入一个循环，在循环中，它会检查索引i的值是否是1，如果是，则返回该索引。否则，它会将i设置为前一个索引，并继续搜索前一个索引，或将其包装到列表的末尾。当i等于原始索引时，循环将结束，函数返回null，表示找不到满足条件的索引
  getPrevIndex(list, index) {
    // Get the length of the list
    const length = list.length;
    // Decrement the index until a non-null value is found
    while (true) {
      // Decrement the index
      index = (index - 1 + length) % length;
      // Check if the value at the new index is not null
      if (list[index] !== null) {
        return index; // Return the new index
      }
    }
  },
  // 这个方程是专门用来处理收藏情况下的next button的, 由于fav_list的格式为[1,1,null, 1];
  // Overall, this function is designed to find the next index in a list after a given index where the value is not null and equal to 1. It handles cases where the search needs to wrap around to the beginning of the list and returns null if no such value is found.
  getNextIndex(list, index) {
    // Get the length of the list
    const length = list.length;
    // Increment the index until a non-null value is found
    while (true) {
      // Increment the index
      index = (index + 1) % length;
      // Check if the value at the new index is not null
      if (list[index] !== null) {
        return index; // Return the new index
      }
    }
  }
})





const app = getApp()

Page({
  data: {
    currWeekAlreadyTaken: 0, // 本周用户有多少天是已经服药的
    showRedDot: false,    // 判断用户今日是否已经确认过服药
    logged: false,
    indicatorDots: true,
    podCastInfo: [], 
    meditationInfo: [],
    progressBarColor: "", // 首页药物追踪的进度条背景
    podcastComplete: [], // 用来设置播客已完成的未完成的打勾
    meditationComplete: []
  },
  onLoad: function(options) {
    console.log(options);
    // this.enable_sharing();
    var is_new_user = false;
    let that = this;
    if (!app.globalData.logged) {
      wx.showLoading({
        title: '加载中',
        mask: true
      })
      wx.cloud.callFunction({
        name: 'auto_sign_in',
        data: {
        },
        success: out => {
          // console.log(out.result)
          if (out.result.errCode == 0) {
            if (out.result.data) {
              // global storage
              app.globalData.userData = out.result.data;
              console.log('33');
              app.globalData.podcast_progress_data = out.result.podcast_progress_data;
              app.globalData.meditation_progress_data = out.result.meditation_progress_data;
              app.globalData.all_resources = out.result.all_resources;
              console.log('37');
              // console.log(app.globalData.all_resources);
              app.globalData.logged = true;
              is_new_user = out.result.is_new_user;
              // 先设置podcast和meditation的完成情况
              that.setData({
                podcastComplete: app.globalData.userData.finished_podcasts || [],
                meditationComplete: app.globalData.userData.finished_meditations || []
              });
              that.change_home_progress_style()
            } else {
              console.log(out.errMsg);
            }
          } else {
            console.log(out.errMsg);
          }
          // 判断是否今天已经服药
          let today = new Date()
          let ifTodayTaken = this.checkIfTapDateTaken({year: today.getFullYear(), month: today.getMonth()+1, date: today.getDate()})
          this.setData({
            showRedDot: !ifTodayTaken
          })
          console.log("success");
        },
        fail: out => {
          console.log('call function failed')
        },
        complete: out => {
          wx.hideLoading();
          // start onboarding page if this is new user
          if (is_new_user) {
            wx.navigateTo({
              url: "../onboarding/onboarding",
            })
          }
          this.load_podcast_meditation(options);
          console.log("complete");
        }
      })
      // console.log("79");
      this.change_home_progress_style();
    } else {
          // 获取并且更新所有的播客内容
      this.load_podcast_meditation(options)
    }

    


    // 药物追踪红点逻辑
    let today = new Date()
    let lastShownModalTime = wx.getStorageSync('NotificationLastShownTime');
    if (lastShownModalTime == null || !this.isSameDay(today, new Date(lastShownModalTime))) {
      this.setData({
        showRedDot: true
      })
    } else {
      this.setData({
        showRedDot: false
      })
    }
  },

  onShow() {
    // 实时更新首页的availability状态
    this.setData({
      podcastComplete: app.globalData.userData.finished_podcasts || [],
      meditationComplete: app.globalData.userData.finished_meditations || [],
    })
    // 获取并且更新首页服药天数状态
    try {
      let medi_taken_days = app.globalData.userData.med_date
      let takenInWeek = this.getMeditakenDayInWeek(medi_taken_days)
      this.setData({
        currWeekAlreadyTaken: takenInWeek
      })
    } catch {
    }
    // 需要实时更新药物追踪progress bar的颜色
    this.change_home_progress_style()

    let today = new Date()
    let lastShownModalTime = wx.getStorageSync('NotificationLastShownTime');
    if (lastShownModalTime == null || !this.isSameDay(today, new Date(lastShownModalTime))) {
      this.setData({
        showRedDot: true
      })
    } else {
      this.setData({
        showRedDot: false
      })
    }
  },

  // page sharing
  onShareAppMessage: function (res) {
    return {
      title: '拥抱阳光Sunshine',
      path: '/pages/newHome/index',
      // imageUrl: 'url-to-your-image.jpg',  // 如果需要自定义分享的图片
      success: function() {
        wx.showToast({
          title: "分享成功"?
          icon: 'success',
          duration: 1500
        })       
      },
      fail: function() {
        console.log('分享失败')
      }
    }
  },

  // onShareTimeline: function() {
  //   return {
  //     title: '拥抱阳光Sunshine',
  //     path: '/pages/newHome/index',
  //     query: 'key=value',
  //     success: function() {
  //       wx.showToast({
  //         title: "分享成功"?
  //         icon: 'success',
  //         duration: 1500
  //       })       
  //     }
  //     // imageUrl: 'url-to-your-image.jpg'  // 如果需要自定义分享的图片
  //   }
  // },

  load_podcast_meditation(options) {
    wx.cloud.callFunction({
      name: 'getAllPodcastAudio',
      data: {
      },
      success: out => {
        if (out.result.errCode == 0) {
          if (out.result.data) {
            let allPodCastData = out.result.data;
            // 根据播客的id进行排序
            let sorted_podcast = this.sortPodCastList(allPodCastData)
            // 根据用户注册时间创建podcastRegisterAvailability
            this.setData({
              podCastInfo: sorted_podcast,
            })
            // 把排列好的博客放进缓存
            app.globalData.podCast = sorted_podcast;
            wx.setStorageSync('allPodCastData', sorted_podcast)
          } 
        } else {
          console.log(out.errMsg);
        }
      },
      fail: out => {
        console.log('call function failed')
      },
      complete: out => {
        wx.hideLoading();
        console.log("Podcasts loaded successfully");
        if (options.podcasttype == '播客') {
          wx.navigateTo({
            url: `../podcastPlay/index?podCastOrder=${options.podcastorder}&type=播客`
          })
        }
        
      }
    })

    // 获取并且更新所有的Meditation内容
    wx.cloud.callFunction({
      name: 'getAllMeditationAudio',
      data: {
      },
      success: out => {
        if (out.result.errcode == 0) {
          if (out.result.data) {
            let allMeditationData = out.result.data;
            this.setData({
              meditationInfo: allMeditationData,
            })
            // 把排列好的博客放进缓存
            app.globalData.meditation = allMeditationData;
            wx.setStorageSync('allMeditationData', allMeditationData)
          } 
        } else {
          console.log(out.errMsg);
        }
      },
      fail: out => {
        console.log('call function failed')
      },
      complete: out => {
        wx.hideLoading()
        console.log("Meditation loaded successfully");
        if (options.podcasttype == '冥想') {
          wx.navigateTo({
            url: `../podcastPlay/index?podCastOrder=${options.podcastorder}&type=冥想`
          })
        }
        }
    })
  },

  // enable_sharing() {
  //   wx.showShareMenu({
  //     withShareTicket: true,
  //     menus: ['shareAppMessage', 'shareTimeline']
  //   })
  // },

  // 改变首页药物追踪进度条的逻辑
  change_home_progress_style() {
    let medi_taken_days = app.globalData.userData.med_date
    let takenInWeek = this.getMeditakenDayInWeek(medi_taken_days || [])
    let currentMediProgressColor = this.data.progressBarColor
    if(takenInWeek <= 1) {
      currentMediProgressColor =  "#FA5151"
    } else if(takenInWeek <= 3) {
      currentMediProgressColor =  "#FFC300";
    } else {
      currentMediProgressColor =  "#46BA74";
    }
    this.setData({
      progressBarColor: currentMediProgressColor,
      currWeekAlreadyTaken: takenInWeek,
    })
  },

  // check how many days in a week users have taken the medicine 
  getMeditakenDayInWeek(dates) {
    // Get today's date
    const today = new Date();
    // Get the start of the week (Monday)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
    startOfWeek.setHours(0, 0, 0, 0);
    // Get the end of the week (Sunday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // Initialize a count variable
    let count = 0;
    // Iterate over the dates
    for (let i = 0; i < dates.length; i++) {
        // Convert the date string to a Date object
        const date = new Date(dates[i]);
        // Check if the date is within the same week as today
        if (date >= startOfWeek && date <= endOfWeek) {
            count++;
        }
    }
    // Return the count
    return count;
  },
  // sort all the pod cast based on the podCast_id list
  sortPodCastList(lst) {
    return lst.sort(function(a, b) {
      return a.podCast_Id - b.podCast_Id;
    });
  },
  isSameDay(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
  },
  checkIfTapDateTaken(dateObj) {
    let lastest_taken_date = new Date(app.globalData.userData.med_date[0]);
    return lastest_taken_date.getFullYear() == dateObj.year && lastest_taken_date.getMonth() + 1 == dateObj.month && lastest_taken_date.getDate() == dateObj.date
  },
  toCalendar: function() {
    wx.navigateTo({
      url: "../calendar/calendar",
    })
  },
  changeIndicatorDots() {
    this.setData({
      indicatorDots: !this.data.indicatorDots
    })
  },
  jumpToMoodTracking() {
    wx.redirectTo({
      url: "../../package_moodTracking/pages/moodTracking/moodTracking",
    })
  },
  jumptoAllPodCastPage() {
    wx.redirectTo({
      url: "../allPodCastPage/index",
    })
  },
  jumptoAllMeditationPage() {
    wx.redirectTo({
      url: "../allMeditationPage/index",
    })
  },
  jumpToCalendar() {
    wx.redirectTo({
      url: "../v2/index",
    })
  },
  jumpToPodCastPlay(e) {
    let clickedPodCastNum = e.currentTarget.dataset.id
    let type = e.currentTarget.dataset.podcasttype
    // url: `../podcastPlay/index?podCastOrder=${clickedPodCastNum}&type=${type}`
    wx.navigateTo({
      url: `../podcastPlay/index?podCastOrder=${clickedPodCastNum}&type=${type}`
    })
  },
  // 处理当前不可用播客点击时候的弹窗逻辑内容
  jumpToUnAvailableNotice(e) {
    let clickedPodCastNum = e.currentTarget.dataset.id
    let currpodcast_finish_status = this.data.podcastComplete[clickedPodCastNum - 1]
    if (currpodcast_finish_status === -1 || this.data.podcastComplete.length == 0 || clickedPodCastNum - 1 >= app.globalData.userData.finished_podcasts.length) {
      wx.showModal({
        content: '请先完成当前内容',
        confirmText: '我知道了',
        showCancel: false,
        success (res) {
          console.log("还没有完成前面的内容")
        }
      })
    } else {
      wx.showModal({
        content: '新内容下周更新',
        confirmText: '我知道了',
        showCancel: false,
        success (res) {
          console.log("还未到下一周")
        }
      })
    }
  }
})
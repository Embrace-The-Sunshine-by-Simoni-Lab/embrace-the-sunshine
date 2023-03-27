const app = getApp()

Page({
  data: {
    currWeekAlreadyTaken: 0, // 本周用户有多少天是已经服药的
    showRedDot: false,    // 判断用户今日是否已经确认过服药
    logged: false,
    indicatorDots: true,
    podCastInfo: [], 
    meditationInfo: [],
    podCastInfo_remove_meditation: [],
    progressBarColor: "", // 首页药物追踪的进度条背景
    podcastsAvailability: [], // 综合播客的完成状态和注册时间最终确定展示的播客
    podcastRegisterAvailability: [], // 判断用户是否发已经注册了足够多的时间来获取更新的播客
    podcastComplete: [], // 用来设置播客已完成的未完成的打勾
    meditationComplete: []
  },
  onLoad: function() {
    if(app.globalData.podcastsAvailability)
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
          success: async out => {
            if (out.result.errCode == 0) {
              if (out.result.data) {
                app.globalData.userData = out.result.data;
                app.globalData.podcast_progress_data = out.result.podcast_progress_data;
                app.globalData.meditation_progress_data = out.result.meditation_progress_data;

                app.globalData.logged = true;
                is_new_user = out.result.is_new_user;

                console.log("dddd global data", app.globalData.userData)
                // 先设置podcast和meditation的完成情况
                that.setData({
                  podcastComplete: app.globalData.userData.finished_podcasts || [],
                  meditationComplete: app.globalData.userData.finished_meditations || []
                });
                that.change_home_progress_style()
                await that.createPodcastRegisterAvailability(app)
                // 通过podcastComplete和podcastRegisterAvailability来改变podcastsAvailability的值
                // let new_podcast_availability = that.generatePodcastAvailabilityArray(that.data.podcastComplete, that.data.podcastRegisterAvailability)

                let new_podcast_availability = Array(app.globalData.podCast.length).fill(1);
                app.globalData.podcastComplete = that.data.podcastComplete
                app.globalData.meditationComplete = that.data.meditationComplete

                app.globalData.podcastRegisterAvailability = that.data.podcastRegisterAvailability
                app.globalData.podcastsAvailability = new_podcast_availability
                this.setData({
                  podcastsAvailability: new_podcast_availability
                })
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
          },
          fail: out => {
            console.log('call function failed')
          },
          complete: out => {
            wx.hideLoading()
            // start onboarding page if this is new user
            if (is_new_user) {
              wx.navigateTo({
                url: "../onboarding/onboarding",
              })
            }
          }
        })
        this.change_home_progress_style()
    } 

    // 获取并且更新所有的播客内容
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
            const date = new Date(app.globalData.userData.reg_time);
            const today = new Date();
            const inputWeek = Math.floor((today - date) / (7 * 24 * 60 * 60 * 1000)) + 1;
            const podcastRegisterAvailability = new Array(sorted_podcast.length);
            for (let i = 0; i < podcastRegisterAvailability.length; i++) {
              if (i <= inputWeek) {
                podcastRegisterAvailability[i] = 1;
              }
            }
            this.setData({
              podCastInfo: sorted_podcast,
              podcastRegisterAvailability,
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
        wx.hideLoading()
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
            console.log("allMeditationData", allMeditationData)
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
        }
    })

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
    let new_podcast_availability = this.generatePodcastAvailabilityArray(app.globalData.podcastComplete || [],app.globalData.podcastRegisterAvailability)
    
    console.log("home on show", app.globalData.userData.finished_podcasts)
    this.setData({
      podcastComplete: app.globalData.userData.finished_podcasts || [],
      meditationComplete: app.globalData.userData.finished_meditations || [],
      podcastsAvailability: new_podcast_availability
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

  async createPodcastRegisterAvailability(app) {
    let allPodCastData =  await wx.getStorageSync('allPodCastData');
    const date = new Date(app.globalData.userData.reg_time);
    const today = new Date();
    const inputWeek = Math.floor((today - date) / (7 * 24 * 60 * 60 * 1000));
    const podcastRegisterAvailability = new Array(allPodCastData.length);
    for (let i = 0; i < podcastRegisterAvailability.length; i++) {
        podcastRegisterAvailability[i] = i <= inputWeek ? 1: -1;
    }
    this.setData({
      podcastRegisterAvailability
    })
  },
  // generate podcast availability and on podcast complete array and register time podcast array
  generatePodcastAvailabilityArray(podcastComplete, podcastRegisterAvailability) {
    if(podcastComplete.length == 0) return [1]
    let result = [1];
    for (let i = 0; i < podcastComplete.length; i++) {
      if (podcastComplete[i] === 1 && podcastRegisterAvailability[i + 1] === 1) {
        result[i + 1] = 1;
      }
    }
    
    return result
  },

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
    if (currpodcast_finish_status === -1 || this.data.podcastComplete.length == 0 || clickedPodCastNum - 1 >= app.globalData.podcastComplete.length) {
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
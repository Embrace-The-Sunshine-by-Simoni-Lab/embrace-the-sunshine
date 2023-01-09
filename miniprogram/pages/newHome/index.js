const app = getApp()

Page({
  data: {
    // 本周服药天数数据
    currWeekAlreadyTaken: 1,
    // display if enter medication today
    showRedDot: false,
    // original data
    userInfo: {},
    hasUserInfo: false,
    logged: false,
    // new home data
    background: ['demo-text-1', 'demo-text-2', 'demo-text-3'],
    indicatorDots: true,
    vertical: false,
    autoplay: false,
    interval: 2000,
    duration: 500,
    podCastInfo: [
      {
        
        episodeNum: '第一集',
        mainTitle: '认识情绪',
        mainContentSummary: '情绪的种类，功能，和强度',
        imageUrl: 'cloud://cloud1-2gjzvf7qc03c5783.636c-cloud1-2gjzvf7qc03c5783-1306062016/images/podcast/castSample.png'
      },
      {
        episodeNum: '第二集',
        mainTitle: '认识情绪2',
        mainContentSummary: '情绪的种类，功能，和强度2',
        imageUrl: 'cloud://cloud1-2gjzvf7qc03c5783.636c-cloud1-2gjzvf7qc03c5783-1306062016/images/podcast/castSample.png'
      },
      {
        episodeNum: '第三集',
        mainTitle: '认识情绪3',
        mainContentSummary: '情绪的种类，功能，和强度3',
        imageUrl: 'cloud://cloud1-2gjzvf7qc03c5783.636c-cloud1-2gjzvf7qc03c5783-1306062016/images/podcast/castSample.png'
      },
      {
        episodeNum: '第四集',
        mainTitle: '认识情绪',
        mainContentSummary: '情绪的种类，功能，和强度3',
        imageUrl: 'cloud://cloud1-2gjzvf7qc03c5783.636c-cloud1-2gjzvf7qc03c5783-1306062016/images/podcast/castSample.png'
      }
    ]
  },
  onLoad: function() {
    var is_new_user = false;
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
          if (out.result.errCode == 0) {
            if (out.result.data) {
              app.globalData.userData = out.result.data;
              app.globalData.logged = true;
              is_new_user = out.result.is_new_user;
            } else {
              console.log(out.errMsg);
            }
          } else {
            console.log(out.errMsg);
          }
          // 获取当天是否已经确认服药
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
          if (typeof this.getTabBar === "function" && this.getTabBar()) {
              this.getTabBar().setData({
                  selected: 1
              })
          }
          // start onboarding page if this is new user
          if (is_new_user) {
            wx.navigateTo({
              url: "../onboarding/onboarding",
            })
          }
         }
      })
    } else {
      if (typeof this.getTabBar === "function" && this.getTabBar()) {
        this.getTabBar().setData({
            selected: 1
        })
      }
    }
    // 获取podcast信息
    wx.cloud.callFunction({
      name: 'getAllPodcastAudio',
      data: {
      },
      success: out => {
        if (out.result.errCode == 0) {
          if (out.result.data) {
            let allPodCastData = out.result.data;
            console.log("allPodCastData", allPodCastData)
            app.globalData.podCast = allPodCastData;
            console.log("allPodCastData", allPodCastData)
            // 把音频数据放进缓存
            wx.setStorageSync('allPodCastData', allPodCastData)
       
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
    // 获取红点逻辑
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
    console.log("check");
    let today = new Date()
    let lastShownModalTime = wx.getStorageSync('NotificationLastShownTime');
    console.log((lastShownModalTime == null || !this.isSameDay(today, new Date(lastShownModalTime))) );
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
      url: "../moodTracking/moodTracking",
    })
  },
  jumptoAllPodCastPage() {
    wx.redirectTo({
      url: "../allPodCastPage/index",
    })
  },
  jumpToCalendar() {
    wx.redirectTo({
      url: "../v2/index",
    })
  },
  jumpToPodCastPlay(e) {
    let clickedPodCastNum = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `../podcastPlay/index?podCastOrder=${clickedPodCastNum}`
    })
  }
})
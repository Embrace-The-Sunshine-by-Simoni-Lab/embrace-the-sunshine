const app = getApp()

Page({
  data: {
    // days in the current week on which user has taken medicine 
    currWeekAlreadyTaken: 0,
    // display if enter medication today
    showRedDot: false,
    logged: false,
    // new home data
    indicatorDots: true,
    vertical: false,
    podCastInfo: []
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
              let medi_taken_days = app.globalData.userData.med_date
              let takenInWeek = this.getMeditakenDayInWeek(medi_taken_days)
              this.setData({
                currWeekAlreadyTaken: takenInWeek
              })
            } else {
              console.log(out.errMsg);
            }
          } else {
            console.log(out.errMsg);
          }
          // get if medi taken today
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
    // fetch audio info
    wx.cloud.callFunction({
      name: 'getAllPodcastAudio',
      data: {
      },
      success: out => {
        if (out.result.errCode == 0) {
          if (out.result.data) {
            let allPodCastData = out.result.data;
            console.log("allPodCastData", allPodCastData)
            let sorted_podcast = this.sortPodCastList(allPodCastData)
            console.log("sorted_podcast", sorted_podcast)

            this.setData({
              podCastInfo: sorted_podcast
            })
            // store audio in memory
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
    // logic for homepage red dot
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

  // check how many days in a week users have taken the medicine 
  getMeditakenDayInWeek(dates) {
    let count = 0;
    let today = new Date();
    for (let date of dates) {
      let d = new Date(date);
      let day = d.getDay();
      let timestamp = d.getTime();
    
      if (timestamp >= today.getTime() - day * 24 * 60 * 60 * 1000 && timestamp < today.getTime() + (7 - day) * 24 * 60 * 60 * 1000) {
        count++;
      }
    }
    return count;
  },
  // sort all the pod cast based on the podCast_id list
  sortPodCastList(lst) {
    return lst.sort(function(a, b) {
      return a.podCast_Id - b.podCast_Id;
    });
  },
  onShow() {
    try {
      let medi_taken_days = app.globalData.userData.med_date
      let takenInWeek = this.getMeditakenDayInWeek(medi_taken_days)
      this.setData({
        currWeekAlreadyTaken: takenInWeek
      })
    } catch {
    }

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
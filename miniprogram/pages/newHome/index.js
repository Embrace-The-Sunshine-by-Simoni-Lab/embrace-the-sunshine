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
    podCastInfo: [], 
    progressBarColor: "", // the color changes based on the total days of medi taken
    podcastsAvailability: [],
    podcastRegisterAvailability: [], // to decide whether user has registered long enough to see each podcast
    podcastComplete: []
  },
  onLoad: function() {
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
          if (out.result.errCode == 0) {
            if (out.result.data) {
              app.globalData.userData = out.result.data;
              app.globalData.podcast_progress_data = out.result.podcast_progress_data;
              app.globalData.logged = true;
              is_new_user = out.result.is_new_user;
              that.setData({
                podcastComplete: app.globalData.userData.finished_podcasts,
                podcastsAvailability: app.globalData.userData.finished_podcasts
              });
              console.log(that.data.podcastsAvailability);
              // change bar color based on the medi taken days
              let medi_taken_days = app.globalData.userData.med_date
              let takenInWeek = this.getMeditakenDayInWeek(medi_taken_days)
              let currentMediProgressColor = this.data.progressBarColor
          
              if(takenInWeek <= 1) {
                currentMediProgressColor =  "#FA5151"
              } else if(takenInWeek <= 3) {
                currentMediProgressColor =  "#FFC300";
              } else {
                currentMediProgressColor =  "#46BA74";
              }

              // set register date
              const user_register_date = new Date(2023, 0, 1)
              console.log("gbgb: ", app.globalData);
              // change each podcast's availability based on the user register time 
              this.createPodcastRegisterAvailability(app)

              this.setData({
                progressBarColor: currentMediProgressColor,
                currWeekAlreadyTaken: takenInWeek,
                userRegisterDate: user_register_date
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
                  selected: 0
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
      // change progress bar color based on different medi taken days
      let medi_taken_days = app.globalData.userData.med_date
      let takenInWeek = this.getMeditakenDayInWeek(medi_taken_days)
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
        currWeekAlreadyTaken: takenInWeek
      })
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
            let sorted_podcast = this.sortPodCastList(allPodCastData)
            // update the podcast availability based on the register date, 否则当你进入一个页面,比如药物追踪, 然后又返回首页的时候, podcast的availability就不会更新
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
              podcastRegisterAvailability
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

  async createPodcastRegisterAvailability(app) {
    let allPodCastData =  await wx.getStorageSync('allPodCastData');
    const date = new Date(app.globalData.userData.reg_time);
    const today = new Date();
    console.log("today", today);
    const inputWeek = Math.floor((today - date) / (7 * 24 * 60 * 60 * 1000));
    const podcastRegisterAvailability = new Array(allPodCastData.length);
    // console.log(app.globalData.podCast);
    // console.log("podcastRegisterAvailability 180", podcastRegisterAvailability);
    console.log(inputWeek);
    for (let i = 0; i < podcastRegisterAvailability.length; i++) {
        podcastRegisterAvailability[i] = i <= inputWeek ? 1: -1;
    }
    console.log("podcastRegisterAvailability", podcastRegisterAvailability)
    console.log("podcastsAvailability", this.data.podcastsAvailability);
    this.setData({
      podcastRegisterAvailability
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
  onShow() {
    
    this.setData({
      podcastComplete: app.globalData.userData.finished_podcasts
    });
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
      url: "../../package_moodTracking/pages/moodTracking/moodTracking",
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
  },
  jumpToUnAvailableNotice(e) {
    let clickedPodCastNum = e.currentTarget.dataset.id
    let currpodcast_finish_status = this.data.podcastsAvailability[clickedPodCastNum - 1]
    let currpodcast_register_status = this.data.podcastRegisterAvailability[clickedPodCastNum]

    if (currpodcast_finish_status === 1 && this.data.podcastsAvailability.length != -1) {
      wx.showModal({
        content: '请先完成当前内容',
        confirmText: '我知道了',
        showCancel: false,
        success (res) {
          console.log("还没有完成前面的内容")
        }
      })
    } else if (currpodcast_register_status) {
      wx.showModal({
        content: '新内容下周更新',
        confirmText: '我知道了',
        showCancel: false,
        success (res) {
          console.log("还未到下一周")
        }
      })
    } else {
      wx.showModal({
        content: '请先完成当前内容',
        confirmText: '我知道了',
        showCancel: false,
        success (res) {
          console.log("还没有完成前面的内容")
        }
      })
    }
  }
})
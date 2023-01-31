const app = getApp()

Page({
  data: {
    currWeekAlreadyTaken: 0, // days in the current week on which user has taken medicine 
    showRedDot: false,    // display if enter medication today
    logged: false,
    indicatorDots: true,
    podCastInfo: [], 
    progressBarColor: "", // the color changes based on the total days of medi taken
    podcastsAvailability: [], // decide if podcast can be click into
    podcastRegisterAvailability: [], // to decide whether user has registered long enough to see each podcast
    podcastComplete: [] // use to show check mark and uncheck mark
  },
  onLoad: function() {
    // if there are podcast available, update
    console.log("home onload")
    let curr_podcast_availability = app.globalData.podcastsAvailability
    if(curr_podcast_availability && curr_podcast_availability.length > 0) {
      this.setData({
        podcastsAvailability:curr_podcast_availability
      })
    }
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
              app.globalData.logged = true;
              is_new_user = out.result.is_new_user;
              that.setData({
                podcastComplete: app.globalData.userData.finished_podcasts,
              });
              // grant color to meditation progress bar
              that.change_home_progress_style()
              // change each podcast's availability based on the user register time 
              await that.createPodcastRegisterAvailability(app)

              console.log("podcastComplete", that.data.podcastComplete)
              console.log("podcastsAvailability", that.data.podcastsAvailability)
              console.log("podcastRegisterAvailability", that.data.podcastRegisterAvailability)
              // 通过podcastComplete和podcastRegisterAvailability来改变podcastsAvailability的值
              let new_podcast_availability = that.generatePodcastAvailabilityArray(that.data.podcastComplete, that.data.podcastRegisterAvailability)
              console.log("new_podcast_availability", new_podcast_availability)

              app.globalData.podcastComplete = that.data.podcastComplete
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
      this.change_home_progress_style()
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
      if (podcastComplete[i] === 1 && podcastRegisterAvailability[i] === 1) {
        result[i] = 1;
      }
    }
    if(result.length < podcastRegisterAvailability.length) {
        result.push(1); 
    }
    return result
  },

  // change color of progress bar on the home page
  change_home_progress_style() {
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
  },
  jumpToUnAvailableNotice(e) {
    let clickedPodCastNum = e.currentTarget.dataset.id
    let currpodcast_finish_status = this.data.podcastsAvailability[clickedPodCastNum - 1]
    let currpodcast_register_status = this.data.podcastRegisterAvailability[clickedPodCastNum]
    
    if (currpodcast_register_status === 1 && currpodcast_finish_status !== -1) {
      wx.showModal({
        content: '请先完成当前内容',
        confirmText: '我知道了',
        showCancel: false,
        success (res) {
          console.log("还没有完成前面的内容")
        }
      })
    } else if (currpodcast_register_status !== 1 && currpodcast_finish_status === 1) {
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
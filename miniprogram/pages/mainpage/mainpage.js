//index.js
const app = getApp()

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    logged: false
  },


  main_page_data_setup: function() {
    
    console.log(app.globalData.userData)
    // displaying red dot on calendar icon
    var medDate = app.globalData.userData.med_date
    var tabList = this.getTabBar().data.list
    if (medDate.length != 0) {
        var today = new Date()
        var lastDate = new Date(app.globalData.userData.med_date[0])
    
        if (today.toDateString() != lastDate.toDateString()) {
          tabList[1].showRedDot = true
        } else {
          tabList[1].showRedDot = false
        }
    } else {
      tabList[1].showRedDot = true
    }

    // displaying red dot on moodtracking icon
    // displaying red dot on moodtracking icon
    var last_questionare_week = app.globalData.userData.mood_track.mood_date[0];
    var currDate = new Date();
    var janOne = new Date(currDate.getFullYear(),0,1);
    var dayNum = Math.floor((currDate - janOne) / (24 * 60 * 60 * 1000));
    var curWeekNum = Math.ceil((currDate.getDay() + 1 + dayNum) / 7);
    console.log(curWeekNum);
    if (last_questionare_week == -1) {
      tabList[0].showRedDot = true
    } else {
      if (curWeekNum == last_questionare_week) {
        tabList[0].showRedDot = false;
      } else {
        tabList[0].showRedDot = true;
      }
    }

    this.getTabBar().setData({
      list:tabList
    })

    // changes color when selected
    if (typeof this.getTabBar === "function" && this.getTabBar()) {
        this.getTabBar().setData({
            selected: 3
        })
    }
  },

  /**
   * Lifecycle function--Called when page show
   */
  onLoad: function() {
    var is_new_user = false;
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
            console.log(out.result.data);
            app.globalData.userData = out.result.data;
            is_new_user = out.result.is_new_user;
            console.log("login_status: " + out.result)
          } else {
            console.log(out.errMsg);
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
        // console.log(app.globalData.userData)
        /**
         * red dot of tabbar implementation
         
        // displaying red dot on calendar icon
        var medDate = app.globalData.userData.med_date
        var tabList = this.getTabBar().data.list
        if (medDate.length != 0) {
            var today = new Date()
            var lastDate = new Date(app.globalData.userData.med_date[0])
        
            if (today.toDateString() != lastDate.toDateString()) {
              tabList[1].showRedDot = true
            } else {
              console.log(out.errMsg);
            }
        } else {
          tabList[1].showRedDot = true
        }

        // displaying red dot on moodtracking icon
        var last_questionare_week = app.globalData.userData.mood_track.mood_date[0];
        var currDate = new Date();
        var janOne = new Date(currDate.getFullYear(),0,1);
        var dayNum = Math.floor((currDate - janOne) / (24 * 60 * 60 * 1000));
        var curWeekNum = Math.ceil((currDate.getDay() + 1 + dayNum) / 7);
        console.log(curWeekNum);
        if (last_questionare_week == -1) {
          tabList[0].showRedDot = true
        } else {
          if (curWeekNum == last_questionare_week) {
            tabList[0].showRedDot = false;
          } else {
            console.log(out.errMsg);
          }
        },
        fail: out => {
          console.log('call function failed')
        },
        complete: out => {
          this.main_page_data_setup();
          wx.hideLoading();
        }
      })
    } else {
      this.main_page_data_setup();
    }

        this.getTabBar().setData({
          list:tabList
        })
        */

        // changes color when selected
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
        
  
},

  toMoodTracking: function() {
    console.log("toMoodTracking")
    wx.navigateTo({
      url: "../questionnaire/questionnaire",
    })
  },
  toMedTracking: function() {
    console.log("toCalendar")
    wx.navigateTo({
      url: "../calendar/calendar",
    })
  },

  toModule: function() {
    wx.navigateTo({
      url: "../module/modulePage",
    })
  },

  /**
   * Lifecycle function--Called when page hide
   */
  onHide: function () {

  },

  /**
   * Lifecycle function--Called when page unload
   */
  onUnload: function () {

  },

  /**
   * Page event handler function--Called when user drop down
   */
  onPullDownRefresh: function () {

  },

  /**
   * Called when page reach bottom
   */
  onReachBottom: function () {

  },

  /**
   * Called when user click on the top right corner to share
   */
  onShareAppMessage: function () {

  },
  
  toInfoPage: function () {
    wx.navigateTo({
      url: '../infoPage/infoPage',
    })
  },

  // logout() {
  //   let that = this
  //   wx.setStorageSync('userdata', null)
  //   that.setData({
  //     avatarUrl: './user-unlogin.png',
  //     userInfo: null,
  //     hasUserInfo: false,
  //     logged: false,
  //     username: '用户未登录'
  //   })
  //   wx.showToast({
  //     title:'logged out',
  //   })
  // },

  toCalendar: function() {
    wx.navigateTo({
      url: "../calendar/calendar",
    })
  },

  toQuesetionnaire: function() {
    wx.navigateTo({
      url: "../questionnaire/questionnaire",
    })
  },

  to_new_mood_tracking: function() {
    wx.navigateTo({
      url: "../new_mood_tracking/new_mood_tracking",
    })
  },

  call_complete_page: function() {
    wx.cloud.callFunction({
      name: 'complete_page',
      data: {
        module_num: 1,
        task_num: 3,
        page_num: 2
      },
      success: out => {
        console.log('callfunction sucess');
        console.log(out);
        if (out.result.errCode == 0) {
          console.log("call CP func sucess")
          console.log(out.result)
        } else {
          console.log(out.errMsg);
        }
      },
      fail: out => {
        console.log('call CP function failed')
      },
      complete: out => {
        console.log('call CP function completed')
      }
    })
  },





})

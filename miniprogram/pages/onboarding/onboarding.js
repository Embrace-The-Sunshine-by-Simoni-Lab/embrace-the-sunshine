const app = getApp()

Page({
  data: {
    indicatorDots: true,
    vertical: false,
    autoplay: false,
    interval: 2000,
    duration: 500
  },

  toMainPage: function() {
    console.log("toMainPage")
    wx.switchTab({
      url: "../mainpage/mainpage",
    })
  },

  onLoad: function() {
    // new login logic
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
        console.log(app.globalData.userData)
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

      //   // changes color when selected
      //   if (typeof this.getTabBar === "function" && this.getTabBar()) {
      //       this.getTabBar().setData({
      //           selected: 1
      //       })
      //   }
       }
    })
  }
})


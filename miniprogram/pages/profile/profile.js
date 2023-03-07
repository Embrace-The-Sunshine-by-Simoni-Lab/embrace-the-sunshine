// pages/profile/profile.js
const app = getApp()
Page({
  
  /**
   * Page initial data
   */
  data: {
    username: app.globalData.userData.nickname,
    headImg : "../../images/profile/headImg.svg",
    fileID: "",
    num_finished_module: 0,
    num_finished_optional_module: 0,
    weeksUsed: 0
  },
  goto_save: function() {
    wx.navigateTo({
      url: "../starContent/starContent",
    })
  },
  goto_resources: function() {
    wx.redirectTo({
      url: "../infoPage/infoPage",
    })
  },
  goto_profileEdit: function() {
    wx.navigateTo({
      url: "../../package_profile/pages/profileEdit/profileEdit",
    })
  },
  goto_feedback: function() {
    wx.navigateTo({
      url: "../../package_profile/pages/feedback/feedback",
    })
  },
  goto_aboutUs: function() {
    wx.navigateTo({
      url: "../../package_profile/pages/aboutUs/aboutUs",
    })
  },
  onLoad: function () {
    const todayDate = new Date();
    const regDate = new Date(app.globalData.userData.reg_time);
    const weeksUsed = Math.round(Math.abs((todayDate - regDate) / (1000*60*60*24*7)));
    this.setData({
      username: app.globalData.userData.nickname,
      weeksUsed: weeksUsed
    })
  },

  onShow: function() {
    this.setData({
      username: app.globalData.userData.nickname
    })
  }, 
  setNewName: async function (e) {
    let that = this;
    let newName = e.detail.value.new_name;
    console.log("newName", newName)
    console.log(this.data)
    if (newName != this.data.nickname) {
      console.log("输入了新昵称 bug未修复")
      await wx.cloud.callFunction({
        name: 'nickname_edit',
        data: {
          nickname: newName
        }
      })
      app.globalData.userData.nickname = newName
      console.log("newname", newName)
      that.setData({
        username: newName
      })
    } else {
      console.log("新昵称与原昵称一致")
    }
  }
})
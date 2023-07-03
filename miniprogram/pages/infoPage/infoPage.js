const app = getApp();
// pages/infoPage/infoPage.js

Page({
  /**
   * Page initial data
   */
  data: {
    text: "",
    isExpand: true,
    infoTypeList: [
      {type: "互助小组"}, 
      {type: "高校"}, 
      {type: "医院/社会福利机构"}, 
      {type: "心理咨询机构"}, 
      {type: "公众号平台"}, 
      {type: "心理援助热线"},
    ],
    filterOrNot: false,
    infoList: [],
    filteredInfoList: [],
    filteredInfoTypeList: [],
    previousType: "",
    currentType : ""
  },

  jumpToDetailPage(e) {
    let name = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '../infoDetail/infoDetail?name=' + name,
    });
  },

  scroll(e) {
  },

  chooseType(e) {
    let infoList = this.data.infoList
    let infoTypeList = this.data.infoTypeList
    let filteredInfoList = []
    let filteredInfoTypeList = infoTypeList
    let type = e.currentTarget.dataset.id
    if (this.data.currentType == type) {
      this.setData({
        filteredInfoList: infoList, 
        filteredOrNot: false,
        currentType: "",
      })
    } else {
      infoList.forEach(element => {
        if (element.type == type) {
          filteredInfoList.push(element)
        }
      });
      filteredInfoTypeList.forEach(element => {
        if (element.type == type) {
          element.cliked = true
        }
      });
      this.setData({
        filteredInfoTypeList: filteredInfoTypeList,
        filteredInfoList: filteredInfoList,
        filterOrNot: true,
        currentType: type,
      })
    }
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    let all_resources = app.globalData.all_resources
    this.setData({
      infoList: all_resources,
    })
  },

  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady: function () {
    let all_resources = app.globalData.all_resources
    this.setData({
      infoList: all_resources,
    })
  },

  /**
   * Lifecycle function--Called when page show
   */
  onShow: function () {

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
})


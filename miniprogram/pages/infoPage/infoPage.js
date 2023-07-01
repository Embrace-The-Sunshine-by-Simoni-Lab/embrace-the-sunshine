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
      {type: "Apps"}
    ],
    infoList: [
      {
        "name": "沙丘心理", 
        "label" : "互助小组",
        "mediaType": "公众号", 
        "abstract" : "互助、共情、探索自我", 
        "fee": "免费",
        "contact" : "0123456789",
        "hours" : "10:00 - 17:00",
        "link" : "公众号主页",
      }, 
      {
        "name": "沙丘心理2", 
        "label" : "心理咨询机构",
        "mediaType": "公众号2", 
        "abstract" : "互助、共情、探索自我2", 
        "fee": "",
        "contact" : "0987654321",
        "hours" : "08:00 - 18:00"
      }, 
    ]
  },



  jumpToDetailPage(e) {
    let name = e.currentTarget.dataset.id
    console.log("click to jump to the detail page " + name )
    wx.navigateTo({
      url: '../infoDetail/infoDetail?name=' + name,
    });
  },

  scroll(e) {
    console.log(e)
  },

  expansionClick(e) {
    console.log(e)
    this.setData({
      isExpand: !this.data.isExpand
    })
  },

  chooseType(e) {
    console.log("choose type")
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    let globalData = app.globalData
    console.log(globalData)
  },

  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady: function () {

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


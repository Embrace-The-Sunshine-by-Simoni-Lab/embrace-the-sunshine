// pages/moodtrack-finish/moodtrack-finish.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    score: 0,
    category: null,
    type: null,
    imageUrl: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let currScore = options.score;
    let currCategory = this.data.category;
    let currType = this.data.type;
    let imageUrl;
    console.log("currScore", currScore)
    currScore = 8
    if(currScore <= 4) {
      currCategory = "mini-depress"
      currType=""
      imageUrl="cloud://cloud1-2gjzvf7qc03c5783.636c-cloud1-2gjzvf7qc03c5783-1306062016/images/moodtrack/depression tracking-Questionnaire_Results_Minimal.svg"
    } else if (currScore <= 9) {
      currCategory = "mild-depress"
      currType="轻度抑郁"
      imageUrl="cloud://cloud1-2gjzvf7qc03c5783.636c-cloud1-2gjzvf7qc03c5783-1306062016/images/moodtrack/depression tracking-Questionnaire_Results_mild.svg"
    } else if (currScore <= 14) {
      currCategory = "moder-depress"
      currType="中度抑郁"
      imageUrl="cloud://cloud1-2gjzvf7qc03c5783.636c-cloud1-2gjzvf7qc03c5783-1306062016/images/moodtrack/depression tracking-Questionnaire_Results_Moderate.svg"
    } else if (currScore <= 19) {
      currCategory = "moder-severe-depress"
      currType="中重度抑郁"
      imageUrl="cloud://cloud1-2gjzvf7qc03c5783.636c-cloud1-2gjzvf7qc03c5783-1306062016/images/moodtrack/depression tracking-Questionnaire_sitting down.svg"
    } else {
      currCategory = "severe-depress"
      currType="重度抑郁"
      imageUrl="cloud://cloud1-2gjzvf7qc03c5783.636c-cloud1-2gjzvf7qc03c5783-1306062016/images/moodtrack/depression tracking-Questionnaire_sitting_with_rain.svg"
    }
    this.setData({
      score: currScore,
      category: currCategory,
      type: currType,
      imageUrl
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },
  backHome() {
    wx.switchTab({
      url: '../../../pages/newHome/index'
    })
  },
  
  goToMoodTrackingReport() {
    wx.redirectTo({
      url:'../moodTrackingReport/index'
    })
  }
})
// pages/allPodCastPage/index.js
const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
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
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log(app.globalData)
  },

  jumpToPodCast(e) {
    console.log(e.currentTarget.dataset.index)
    let clickedPodCastNum = e.currentTarget.dataset.index
    wx.navigateTo({
      url: `../podcastPlay/index?podCastOrder=${clickedPodCastNum}`
    })
  }
})
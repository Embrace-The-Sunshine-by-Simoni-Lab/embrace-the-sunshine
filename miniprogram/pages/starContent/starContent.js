const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    podcastRegisterAvailability: [],
    podCastInfo: [],
    podcastsAvailability: [],
    podcastComplete: [],
    podcastBtn: false,
    meditationBtn: true,
    fav_podcasts: []
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let allPodCastData =  wx.getStorageSync('allPodCastData');
    console.log(app.globalData.podcastComplete)
    let podcastRegisterAvailability = app.globalData.podcastRegisterAvailability
    let podcastComplete = app.globalData.podcastComplete
    let podcastsAvailability = app.globalData.podcastsAvailability
    let fav_podcasts = this.getFavList();

    this.setData({
      podCastInfo: allPodCastData,
      podcastsAvailability: podcastsAvailability,
      podcastRegisterAvailability: podcastRegisterAvailability,
      podcastComplete: podcastComplete,
      fav_podcasts: fav_podcasts,
      // podcastBtn: false,
      // meditationBtn: true,
    })
  },

  onShow() {
    let new_podcast_availability = this.generatePodcastAvailabilityArray(app.globalData.podcastComplete || [], app.globalData.podcastRegisterAvailability)
    let new_podcast_complete = app.globalData.finished_podcasts
    app.globalData.podcastsAvailability = new_podcast_availability
    let fav_podcasts = this.getFavList()
    
    this.setData({
      podcastsAvailability: new_podcast_availability,
      podcastComplete: new_podcast_complete,
      fav_podcasts: fav_podcasts,
      // meditationBtn: true,
      // podcastBtn: true
    })
  },

  getFavList() {
    let allPodCastData =  wx.getStorageSync('allPodCastData');
    let fav_podcastsIdx = app.globalData.userData.fav_podcasts
    let fav_podcasts = [];
    if (typeof fav_podcastsIdx !== 'undefined') {
      fav_podcastsIdx.forEach((element, index) => {
        if (element == 1) {
          fav_podcasts.push(allPodCastData[index])
        }
      });
    }
    // // make podcastComplete and fav_podcasts same length
    // while (podcastComplete.length < fav_podcasts.length) {
    //   podcastComplete.push(-1);
    // }
    return fav_podcasts;
  },

  choosePodcasts(){

  },

  // generate podcast availability and on podcast complete array and register time podcast array
  generatePodcastAvailabilityArray(podcastComplete, podcastRegisterAvailability) {
    if(podcastComplete.length == 0) return [1]
    let result = [1];
    for (let i = 0; i < podcastComplete.length; i++) {
      if (podcastComplete[i] === 1 && podcastRegisterAvailability[i + 1] === 1) {
        result[i + 1] = 1;
      }
    }
    return result
  },
  jumpToPodCastPlay(e) {
    let clickedPodCastNum = e.currentTarget.dataset.id
    console.log(clickedPodCastNum)
    wx.navigateTo({
      url: `../podcastPlay/index?podCastOrder=${clickedPodCastNum}`
    })
  },
})
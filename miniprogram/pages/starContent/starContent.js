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
    podcastBtn: '',
    meditationBtn: '',
    favList: []
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let allPodCastData =  wx.getStorageSync('allPodCastData');
    let podcastRegisterAvailability = app.globalData.podcastRegisterAvailability
    let podcastComplete = app.globalData.podcastComplete
    let podcastsAvailability = app.globalData.podcastsAvailability
    let favList = this.getFavList('podcast');

    this.setData({
      podCastInfo: allPodCastData,
      podcastsAvailability: podcastsAvailability,
      podcastRegisterAvailability: podcastRegisterAvailability,
      podcastComplete: podcastComplete,
      favList: favList,
      podcastBtn: true,
      meditationBtn: false,
    })
  },

  onShow() {
    let new_podcast_availability = this.generatePodcastAvailabilityArray(app.globalData.podcastComplete || [], app.globalData.podcastRegisterAvailability)
    let new_podcast_complete = app.globalData.finished_podcasts
    app.globalData.podcastsAvailability = new_podcast_availability
    let favList = this.getFavList('podcast')
    
    this.setData({
      podcastsAvailability: new_podcast_availability,
      podcastComplete: new_podcast_complete,
      favList: favList,
      podcastBtn: true,
      meditationBtn: false
    })
  },

  getFavList(mediatType) {
    let favList = []
    if (mediatType == 'podcast') {
      let allPodCastData = wx.getStorageSync('allPodCastData');
      console.log("app.globalData.userData", app.globalData.userData)
      let favListIdx = app.globalData.userData.fav_podcasts
      console.log(favListIdx)
      if (typeof favListIdx !== 'undefined') {
        favListIdx.forEach((element, index) => {
          console.log(favListIdx)
          if (element == 1) {
            favList.push(allPodCastData[index])
          }
        });
      }
    } else {
      let allMeditationData = wx.getStorageSync('allMeditationData');
      let favListIdx = app.globalData.userData.fav_medi
      if (typeof favListIdx !== 'undefined') {
        favListIdx.forEach((element, index) => {
          if (element == 1) {
            favList.push(allMeditationData[index])
          }
        });
      }
    }
    console.log(favList)
    return favList;
  },

  choosePodcasts() {
    let favList = this.getFavList('podcast');
    this.setData ({
      favList : favList,
      podcastBtn: true,
      meditationBtn: false
    })
  },

  chooseMeditation() {
    let favList = this.getFavList('meditation');
    this.setData ({
      favList : favList,
      podcastBtn: false,
      meditationBtn: true
    })
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
    let type = e.currentTarget.dataset.podcasttype
    // console.log(e.currentTarget.dataset)
    // console.log("type", type)
    // console.log("clickedPodCastNum", clickedPodCastNum)
    wx.navigateTo({
      url: `../podcastPlay/index?podCastOrder=${clickedPodCastNum}&type=${type}`
    })
  },
})
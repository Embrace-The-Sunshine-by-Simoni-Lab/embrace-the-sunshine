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
    favList: [],
    typeBeforeJump: ''
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
      jumpToPodCastPlay: 'podcast',
      podcastBtn: true,
      meditationBtn: false,
    })
  },

  onShow() {
    let new_podcast_availability = this.generatePodcastAvailabilityArray(app.globalData.podcastComplete || [], app.globalData.podcastRegisterAvailability)
    let new_podcast_complete = app.globalData.finished_podcasts
    app.globalData.podcastsAvailability = new_podcast_availability
    if (this.data.typeBeforeJump == '播客' || this.data.typeBeforeJump == '') {
      this.choosePodcasts()
    } else {
      this.chooseMeditation()
    }
    
    this.setData({
      podcastsAvailability: new_podcast_availability,
      podcastComplete: new_podcast_complete,
    })
  },

  getFavList(mediatType) {
    let favList = []
    // console.log("app.globalData.userData", app.globalData.userData)
    if (mediatType == 'podcast') {
      let allPodCastData = wx.getStorageSync('allPodCastData');
      let favListIdx = app.globalData.userData.fav_podcasts
      if (typeof favListIdx !== 'undefined') {
        favListIdx.forEach((element, index) => {
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
    
    this.setData ({
      typeBeforeJump: type
    })
    wx.navigateTo({
      url: `../podcastPlay/index?podCastOrder=${clickedPodCastNum}&type=${type}&enterFromCollection=${true}`
    })
  },
})
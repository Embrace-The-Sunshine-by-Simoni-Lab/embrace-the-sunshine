const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    podCastInfo: [],
    fav_podcastComplete: [],
    fav_meditationComplete: [],
    podcastBtn: '',
    meditationBtn: '',
    favList: [],
    typeBeforeJump: '播客'
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let allPodCastData =  wx.getStorageSync('allPodCastData');
    let podcastComplete = app.globalData.userData.finished_podcasts
    let meditationComplete = app.globalData.userData.finished_meditations

    // 获取播客和冥想的完成情况
    let favList_podcast = this.getFavList('podcast')
    let favList_meditation = this.getFavList('meditation')

    let fav_podcastComplete = this.getCorrespondingComplete(favList_podcast, podcastComplete, 'podCast_Id')
    let fav_meditationComplete = this.getCorrespondingComplete(favList_meditation,meditationComplete, 'meditation_Id')

    this.setData({
      podCastInfo: allPodCastData,
      fav_podcastComplete: fav_podcastComplete,
      fav_meditationComplete: fav_meditationComplete,
      favList: favList_podcast,
      podcastBtn: true,
      meditationBtn: false,
    })
  },

  getCorrespondingComplete(firstList = [], secondList = [], key) {
    let newList = Array.from({ length: firstList.length }, () => -1);
    for (let i = 0; i < firstList.length; i++) {
      let id = firstList[i][key];
      newList[i] = secondList[id];
    }
    return newList;
  },

  onShow() {
    let podcastComplete = app.globalData.userData.finished_podcasts
    let meditationComplete = app.globalData.userData.finished_meditations

    // 获取播客和冥想的完成情况
    let favList_podcast = this.getFavList('podcast')
    let favList_meditation = this.getFavList('meditation')

    let fav_podcastComplete = this.getCorrespondingComplete(favList_podcast, podcastComplete, 'podCast_Id')
    let fav_meditationComplete = this.getCorrespondingComplete(favList_meditation,meditationComplete, 'meditation_Id')

    if (this.data.typeBeforeJump == '播客' || this.data.typeBeforeJump == '') {
      this.choosePodcasts()
    } else {
      this.chooseMeditation()
    }
    
    this.setData({
      fav_podcastComplete: fav_podcastComplete,
      fav_meditationComplete: fav_meditationComplete,
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
      meditationBtn: false,
      typeBeforeJump: '播客'
    })
  },

  chooseMeditation() {
    let favList = this.getFavList('meditation');
    this.setData ({
      favList : favList,
      podcastBtn: false,
      meditationBtn: true,
      typeBeforeJump: '冥想'
    })
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
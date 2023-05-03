const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    podcastRegisterAvailability: [],
    podCastInfo: [],
    podcastsAvailability: [],
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
    console.log("收藏onload")
    let allPodCastData =  wx.getStorageSync('allPodCastData');
    let podcastComplete = app.globalData.userData.finished_podcasts
    let meditationComplete = app.globalData.userData.finished_meditations

    // 获取播客和冥想的完成情况
    let favList_podcast = this.getFavList('podcast')
    let favList_meditation = this.getFavList('meditation')

    let fav_podcastComplete = this.getCorrespondingComplete(favList_podcast, podcastComplete, 'podCast_Id')
    let fav_meditationComplete = this.getCorrespondingComplete(favList_meditation,meditationComplete, 'meditation_Id')

    console.log("onload fav_podcastComplete", fav_podcastComplete)
    console.log("onload fav_meditationComplete", fav_meditationComplete)
    
    console.log("favList_podcast", favList_podcast)
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
    console.log("call func", firstList, secondList)
    let newList = Array.from({ length: firstList.length }, () => -1);
    console.log("newList", newList)
    for (let i = 0; i < firstList.length; i++) {
      let id = firstList[i][key];
      newList[i] = secondList[id];
    }
    return newList;
  },

  onShow() {
    console.log("收藏onshow")
    let podcastComplete = app.globalData.userData.finished_podcasts
    let meditationComplete = app.globalData.userData.finished_meditations

    // 获取播客和冥想的完成情况
    let favList_podcast = this.getFavList('podcast')
    let favList_meditation = this.getFavList('meditation')

    let fav_podcastComplete = this.getCorrespondingComplete(favList_podcast, podcastComplete, 'podCast_Id')
    let fav_meditationComplete = this.getCorrespondingComplete(favList_meditation,meditationComplete, 'meditation_Id')

    console.log("onshow fav_podcastComplete", fav_podcastComplete)
    console.log("onshow fav_meditationComplete", fav_meditationComplete)

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

    console.log("jumpToPodCastPlay", clickedPodCastNum, type)
    this.setData ({
      typeBeforeJump: type
    })
    wx.navigateTo({
      url: `../podcastPlay/index?podCastOrder=${clickedPodCastNum}&type=${type}&enterFromCollection=${true}`
    })
  },
})
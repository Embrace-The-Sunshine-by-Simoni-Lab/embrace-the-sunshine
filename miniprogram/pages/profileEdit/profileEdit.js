// pages/profileEdit/profileEdit.js
Page({
  data: {
    headImg: "../../images/profile/photoId.png"
  },

  /**
   * Page initial data
   */

  /**
   * Lifecycle function--Called when page load
   */
  onLoad(options) {

  },

  runSubmitName: function (e) {
    console.log(e);
    var page = getCurrentPages();
    var prevPage = page[page.length - 2];
    prevPage.setNewName(e);
    // console.log("page", page)
    // console.log("prevPage", prevPage)
    this.goto_profile()

    wx.showToast({
      title: '保存成功',
      icon: 'success',
      duration: 2000
    })
  },

  goto_profile: function() {
    wx.switchTab({
      url: "../profile/profile",
    })
  },

  changeHeadImg: function () {
    var  _this = this;
     wx.chooseMedia({
       count: 1,
       mediaType: ['image'],
       sizeType: ['original', 'compressed'],
       sourceType: ['album', 'camera'],  
       success: function (res) {
        wx.showToast({
          title: '正在上传...',
          icon: 'loading',
          mask: true,
          duration: 10000
        });
        console.log("res", res)
         console.log(res.tempFiles[0])
         var headImgPath = res.tempFiles[0].tempFilePath
        // that.upImgs(res.tempFilePaths[0], 0); // 调用上传方法
        // 剪裁图片
        //  wx.cropImage({
        //   src: res.tempFiles.tempFilePath, // 图片路径
        //   cropScale: '1:1', // 裁剪比例
        // })
         _this.setData({
           headImg: res.tempFilePaths
        })
      },
      fail: function (err) {
        console.log(`请确保微信权限都已开启,不然无法正常调用相机或相册`, err)
      },
      cancel: function (res) {
        console.log('取消图片选择', res)
      } 
    })
  },
  upImgs: function (imgurl, index) {
    const that = this;
    wx.uploadFile({
      url: `http://api`,
      // 小程序本地的路径
      filePath: imgurl,
      // 后台获取我们图片的key
      name: 'file',
      header: {
        'content-type': 'multipart/form-data'
      },
      // 额外的参数formData
      formData: {},
      success: function (res) {
        const datas = JSON.parse(res.data);
        console.log(datas);
        if (datas.code === 1) {
          wx.setStorageSync('PROFILEURL', 'http://' + datas.data);
          const profileUrl = wx.getStorageSync('PROFILEURL');
          that.setData({
            profileUrl: profileUrl
          });
          wx.showToast({
            title: '头像上传成功',
            icon: 'success',
            duration: 2000,
            mask: true,
            success: res => {}
          });
          console.log('success', res); // 接口返回网络路径
        } else {
          wx.showModal({
            title: '错误提示',
            content: datas.message,
            showCancel: false,
            success: function (res) { }
          });
          console.log('fail', datas.message);
        }
      },
      fail: function (res) {
        console.log('fail', res);
        wx.hideToast();
        wx.showModal({
          title: '错误提示',
          content: '上传图片失败',
          showCancel: false,
          success: function (res) { }
        });
      }
    });
  },
  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady() {

  },

  /**
   * Lifecycle function--Called when page show
   */
  onShow() {

  },

  /**
   * Lifecycle function--Called when page hide
   */
  onHide() {

  },

  /**
   * Lifecycle function--Called when page unload
   */
  onUnload() {

  },

  /**
   * Page event handler function--Called when user drop down
   */
  onPullDownRefresh() {

  },

  /**
   * Called when page reach bottom
   */
  onReachBottom() {

  },

  /**
   * Called when user click on the top right corner to share
   */
  onShareAppMessage() {

  }
})
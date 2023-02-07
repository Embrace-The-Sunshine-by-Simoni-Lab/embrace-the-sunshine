// pages/profileEdit/profileEdit.js
const app = getApp()
Page({
  data: {
    headImg: "../../../images/profile/headImg.png",
    bufferHeadImg: "",
    nickName: "",
    userId: ""
  },

  /**
   * Page initial data
   */
  async getUserInfo() {
    const data = await wx.cloud.database().collection('main_db').doc(this.data.userId).get()
    console.log("data", data)
    this.setData({
      headImg: data.headImg,
    })
  },

  async submit() {
    const {userId, headImg} = this.data;
    wx.showLoading({
      title: '修改中...',
    })

    const bufferHeadImg = wx.getFileSystemManager().readFileSync(headImg)
    console.log(bufferHeadImg)
    const data = await wx.cloud.callFunction({
      name: 'patchUserInfo',
      data: {
        bufferHeadImg,
        // nickName,
        userId,
        headImg,
      }
    })
    wx.hideLoading()
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad(options) {
    const globalUserData = app.globalData.userData
    console.log(globalUserData)

    const userInfo = wx.getStorageSync('_id')
    if(globalUserData) {
      this.setData({
        userId: globalUserData._id,
        nickName: globalUserData.nickname
      })
    }
    // this.getUserInfo()
  },

  runSubmitName: function (e) {
    console.log(e);
    var page = getCurrentPages();
    var prevPage = page[page.length - 2];
    prevPage.setNewName(e);
    // console.log("page", page)
    // console.log("prevPage", prevPage)
    wx.showToast({
      title: '保存成功',
      icon: 'success',
      duration: 3000
    })
    this.goto_profile()
  },

  goto_profile: function() {
    wx.switchTab({
      url: "../profile/profile",
    })
  },

  changeHeadImg: async function () {
    var that = this;
     const { tempFiles } = await wx.chooseMedia({
       count: 1,
       mediaType: ['image'],
       sizeType: ['original', 'compressed'],
       sourceType: ['album', 'camera'],  
      //  async success(res){
      //     console.log(res.tempFiles)
      //     var cloudPath = "images/profile/handImg" + new Date().getTime() + ".png";
      //     const result = await that.uploadFile(res.tempFiles[0].tempFilePath, cloudPath, function(res){
      //       console.log(`上传进度：${res.progress}%，已上传${res.totalBytesSent}B，共${res.totalBytesExpectedToSend}B`)
      //       // if(res.progress > 50){ // 测试文件上传一半就终止上传
      //       //   return false
      //       // }
      //     })
        // wx.showToast({
        //   title: '正在上传...',
        //   icon: 'loading',
        //   mask: true,
        //   duration: 10000
        // });
        // console.log("res", res)
        //  console.log(res.tempFiles[0])
        //  var headImgPath = res.tempFiles[0].tempFilePath
        // that.upImgs(res.tempFilePaths[0], 0); // 调用上传方法
        // 剪裁图片
        //  wx.cropImage({
        //   src: res.tempFiles.tempFilePath, // 图片路径
        //   cropScale: '1:1', // 裁剪比例
        // })
        //  _this.setData({
        //    headImg: res.tempFilePaths
        // })
      // },
      // fail: function (err) {
      //   console.log(`请确保微信权限都已开启,不然无法正常调用相机或相册`, err)
      // },
      // cancel: function (res) {
      //   console.log('取消图片选择', res)
      // } 
    })
    console.log(tempFiles)
    that.setData({
      headImg: tempFiles[0].tempFilePath
    })

    // await wx.cloud.uploadFile({
    //   cloudPath: 'images/profile/handImg' + 'example.png',
    //   filePath: tempFiles[0].tempFilePath, // 文件路径
    //   success: res => {
    //     // get resource ID
    //     console.log(res.fileID)
    //   },
    //   fail: err => {
    //     // handle error
    //   }
    // })

  },
  uploadFile(file, path, onCall = () => {}) {
    return new Promise((resolve, reject) => {
      const task = wx.cloud.uploadFile({
        cloudPath: path,
        filePath: file,
        name: "headImg" + app.globalData.userData.openid,
        config: {
          env: 'cloud1-2gjzvf7qc03c5783' // 需要替换成自己的微信云托管环境ID
        },
        success: res => {
          console.log(res)
          this.setData({
            fileID: res.fileID
          })
          this.getImagePath(res.fileID)
          resolve(res.fileID)
          wx.showToast({
            title: '头像上传成功',
            icon: 'success',
            duration: 2000,
            mask: true,
            success: res => {}
          });
        },
        fail: e => {
          const info = e.toString()
          if (info.indexOf('abort') != -1) {
            reject(new Error('【文件上传失败】中断上传'))
          } else {
            reject(new Error('【文件上传失败】网络或其他错误'))
          }
        }
      })
      task.onProgressUpdate((res) => {
        if (onCall(res) == false) {
          task.abort()
        }
      })
    })
  },
  getImagePath(fileId) {
    console.log("getImagePath", fileId)
    wx.cloud.getTempFileURL({
      fileList: [fileId],
      success: res => {
        console.log("获取url地址：", res.fileList[0].tempFileURL);
        this.setData({
          headImg: res.fileList[0].tempFileURL
        })
      },
      fail: console.error
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
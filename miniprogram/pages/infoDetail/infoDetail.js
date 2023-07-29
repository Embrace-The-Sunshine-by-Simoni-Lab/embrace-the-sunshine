const app = getApp()
Page({
  data: {
    infoDetail: [],
    displayNone: "display: none;",
  },

  onLoad(options) {
    console.log(options)
    let all_resources = app.globalData.all_resources
    all_resources.forEach(element => {
      if (element.name == options.name) {
        this.setData({
          infoDetail: element
        })
      }
    });
    console.log(this.data.infoDetail)
  },
});
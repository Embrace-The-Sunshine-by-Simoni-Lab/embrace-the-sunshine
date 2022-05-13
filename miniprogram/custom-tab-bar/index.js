const query = wx.createSelectorQuery();
const app = getApp();
Component({
  /**
   * Component properties
   */
  properties: {

  },

  /**
   * Component initial data
   */
  data: {
    "selected": 1,
    "list": [
      {
        "selectedIconPath": "../images/content-icon-selected.png",
        "iconPath": "../images/content-icon.png",
        "pagePath": "../pages/questionnaire/questionnaire",
        "text": "内容"
      },
      {
        "selectedIconPath": "../images/home-icon-selected.png",
        "iconPath": "../images/home-icon.png",
        "pagePath": "../pages/mainpage/mainpage",
        "text": "主页"
      },
      {
        "selectedIconPath": "../images/selected-profile2.png",
        "iconPath": "../images/profile.png",
        "pagePath": "../pages/mainpage/mainpage",
        "text": "我的"
      }
    ],
  },

  /**
   * Component methods
   */
  methods: {
    onLoad: function(event) {
      console.log(event.currentTarget)
      console.log(this.data)
    },

    tabChange: function(event) {
      const data = event.currentTarget.dataset
      const url = this.data.list[data.index].pagePath
      console.log(data.index)
      wx.switchTab({
        url: url,
        success(){
          let page = getCurrentPages().pop();
          if(page == undefined || page == null){
              return;
          }
          page.onLoad();
        }
      })
      this.setData({
        active: data.index
      })
    }
  }
})
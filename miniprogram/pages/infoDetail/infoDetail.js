const app = getApp()
Page({
  data: {
    infoTypeList: [
      {type: "互助小组"}, 
      {type: "高校"}, 
      {type: "医院/社会福利机构"}, 
      {type: "心理咨询机构"}, 
      {type: "公众号平台"}, 
      {type: "心理援助热线"},
      {type: "Apps"}
    ],
    infoDetail: [],
  },

  onLoad(options) {
    console.log(options)
    wx.cloud.callFunction({
      name: 'getData', // 云函数名称
      success(res) {
        const data = res.result; // 获取云函数返回的数据
        console.log(data);
        // 处理数据
      },
      fail(error) {
        console.error('调用云函数失败', error);
      },
    });
  },
});
// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  try {
    const result = await cloud.openapi.subscribeMessage.send({
        "touser": 'OPENID',
        "page": 'index',
        "lang": 'zh_CN',
        "data": {
          "number01": {
            "value": '339208499'
          },
          "date01": {
            "value": '2015年01月05日'
          },
          "site01": {
            "value": 'TIT创意园'
          },
          "site02": {
            "value": '广州市新港中路397号'
          }
        },
        "templateId": 'TEMPLATE_ID',
        "miniprogramState": 'developer'
      })
    return result
  } catch (err) {
    return err
  }

  return {
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
}
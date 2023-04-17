// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()



  if (wxContext.OPENID != undefined) {
  } else {
    let result = {};
    result.errCode = 1;
    result.errMsg = "failed to get user data from WXContext";
    result.data = {};
    return result;
  }

  if (event.nickname == undefined || event.nickname == '') {
    let result = {};
    result.errCode = 2;
    result.errMsg = "user nickname shouldn't be empty";
    result.data = {};
    return result;
  }
  
  const db = cloud.database();
  await db.collection('main_db')
  .where({
    openid: wxContext.OPENID
  }).update({
    data: {
      nickname: event.nickname
    }
  })

  let result = {};
  result.errCode = 0;
  result.errMsg = "User nickname updated";
  
  return {
    result
  }
}
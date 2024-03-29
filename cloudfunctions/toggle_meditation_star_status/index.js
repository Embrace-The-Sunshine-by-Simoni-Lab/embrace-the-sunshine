// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  var result = {};
  if (wxContext.OPENID != undefined) {
    console.log("user data: " + wxContext.OPENID);
  } else {
    
    result.errCode = 1;
    result.errMsg = "failed to get user data from WXContext";
    result.data = {};
    return result;
  }

  if (event.meditaion_id == undefined) {
    result.errCode = 2;
    result.errMsg = "failed to get meditaion_id";
    result.data = {};
    return result;
  }

  const db = cloud.database();
  var userData;

  await db.collection("main_db")
  .where({
    openid: wxContext.OPENID
  })
  .get()
  .then(res => {
    userData = res.data[0];
  })

  if (userData.fav_podcasts == undefined) {
    userData.fav_meditations = [];
  }
  
  if (userData.fav_podcasts[event.meditaion_id] == undefined || userData.fav_podcasts[event.meditaion_id] === -1) {
    userData.fav_podcasts[event.meditaion_id] = 1;
  } else if (userData.fav_podcasts[event.meditaion_id] === 1) {
    userData.fav_podcasts[event.meditaion_id] = -1;
  }
 
  
  // update database
  await db.collection('main_db')
  .where({
    openid: wxContext.OPENID
  })
  .update({
    data: {
      fav_podcasts: userData.fav_podcasts
    }
  })

  return {
    data: userData.fav_podcasts,
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
}
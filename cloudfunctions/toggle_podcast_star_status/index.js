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

  if (event.podcast_id == undefined || event.mediaType == undefined) {
    result.errCode = 2;
    result.errMsg = "failed to get podcast_id or media type";
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
    userData.fav_podcasts = [];
  }

  if (userData.fav_medi == undefined) {
    userData.fav_medi = [];
  }

  if (event.mediaType == 'podcast') {
    if (userData.fav_podcasts[event.podcast_id] == undefined) {
      userData.fav_podcasts[event.podcast_id] = 1;
    } else if (userData.fav_podcasts[event.podcast_id] === 1) {
      userData.fav_podcasts[event.podcast_id] = null;
    }
  } else {
    if (userData.fav_medi[event.podcast_id] == undefined) {
      userData.fav_medi[event.podcast_id] = 1;
    } else if (userData.fav_medi[event.podcast_id] === 1) {
      userData.fav_medi[event.podcast_id] = null;
    }
  }

  // update database
  await db.collection('main_db')
  .where({
    openid: wxContext.OPENID
  })
  .update({
    data: {
      fav_podcasts: userData.fav_podcasts,
      fav_medi : userData.fav_medi
    }
  })
  const db = cloud.database();
  await db.collection("main_db")
  .where({
    openid: wxContext.OPENID
  })
  .get()
  .then(res => {
    userData = res.data[0];
  });
  return {
    data: userData,
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
}
// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境
var result = {};
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  
  if (wxContext.OPENID != undefined) {
    console.log("user data: " + wxContext.OPENID);
  } else {
    result.errCode = 1;
    result.errMsg = "failed to get OPENID data from WXContext";
    result.data = {};
    return result;
  }

  if (event.podcast_id == undefined || typeof event.podcast_id !== 'number') {
    result.errCode = 2;
    result.errMsg = "no podcast_id or podcast_id is not a number";
    result.data = {};
    return result;
  }
  
  // answer content check
  if (event.user_answers == undefined || event.user_answers.length == 0) {
    result.errCode = 2;
    result.errMsg = "no user_answers found";
    result.data = {};
    return result;
  }

  const db = cloud.database();
  var podcast_progress_data;

  await db.collection("podcast_progress_db")
  .where({
    openid: wxContext.OPENID
  })
  .get()
  .then(res => {
    console.log("sucessfully check the database for podcast progress");
    podcast_progress_data = res.data[0];
  })
  
  let podcast_progress_list = podcast_progress_data.podcast_progress;
  // if (podcast_progress_list.length <= event.podcast_id) {
  //   for (let i = 0; i < event.podcast_id - podcast_progress_list.length + 1; i++) {
  //     podcast_progress_list.push([]);
  //   }
  // }

  podcast_progress_list[event.podcast_id] = event.user_answers;

  // UPDATE
  await db.collection("podcast_progress_db")
  .where({
    openid: wxContext.OPENID
  })
  .update({
    data: {
      podcast_progress: podcast_progress_list
    }
  })
  .then(res => {
    console.log(res);
  })
  
  return {
    data: podcast_progress_list,
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
}
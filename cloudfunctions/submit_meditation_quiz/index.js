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

  if (event.meditation_id == undefined || typeof event.meditation_id !== 'number') {
    result.errCode = 2;
    result.errMsg = "no meditation_id or meditation_id is not a number";
    result.data = {};
    return result;
  }

  
  // answer content check
  if (event.user_answer == undefined) {
    result.errCode = 2;
    result.errMsg = "no user_answers found";
    result.data = {};
    return result;
  }

  const db = cloud.database();
  var meditation_progress_data;

  await db.collection("meditation_progress_db")
  .where({
    openid: wxContext.OPENID
  })
  .get()
  .then(res => {
    console.log("sucessfully check the database for meditation progress");
    meditation_progress_data = res.data[0];
  })
  
  if (meditation_progress_data == null) {
    // data new data entry to dataset
    var data_to_insert = {};
    data_to_insert.openid = wxContext.OPENID;
    data_to_insert.meditation_progress = [];
    data_to_insert.meditation_progress[event.meditation_id] = event.user_answer
    await db.collection("meditation_progress_db")
    .add({
      data: data_to_insert
    }).then(res => {
      console.log(res);
    })
    return {
      data: data_to_insert.meditation_progress,
      event,
      openid: wxContext.OPENID,
      appid: wxContext.APPID,
      unionid: wxContext.UNIONID,
    }
  }
  
  let meditation_progress_list = meditation_progress_data.meditation_progress;
  // if (podcast_progress_list.length <= event.podcast_id) {
  //   for (let i = 0; i < event.podcast_id - podcast_progress_list.length + 1; i++) {
  //     podcast_progress_list.push([]);
  //   }
  // }
  

  meditation_progress_list[event.meditation_id] = event.user_answer;

  // UPDATE
  await db.collection("meditation_progress_db")
  .where({
    openid: wxContext.OPENID
  })
  .update({
    data: {
      meditation_progress: meditation_progress_list
    }
  })
  .then(res => {
    console.log(res);
  })
  
  return {
    data: meditation_progress_list,
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
}
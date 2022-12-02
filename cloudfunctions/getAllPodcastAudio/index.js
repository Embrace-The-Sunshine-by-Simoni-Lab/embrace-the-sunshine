// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  if (wxContext.OPENID != undefined) {
    console.log("user data: " + wxContext.OPENID);
  } else {
    result.errCode = 1;
    result.errMsg = "failed to get audio data from WXContext";
    return result;
  }

  var podcasts_data;
  var result = {};
  const db = cloud.database();
  await db.collection("podcast_audio_db")
  .get()
  .then(res => {
    podcasts_data = res.data;
  });
  result.errcode = 0;
  result.data = podcasts_data;
  return result
}
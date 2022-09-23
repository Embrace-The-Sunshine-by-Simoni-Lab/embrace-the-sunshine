// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  result.errCode = 0;
  result.errMsg = "";

  const db = cloud.database();
  var userData;
  await db.collection("favorite_pages_db")
  .where({
    openid: wxContext.OPENID
  })
  .get()
  .then(res => {
    console.log("sucessfully check the database for user information");
    userData = res.data[0];
  });
  if (userData == undefined) {
    result.errCode = 0;
    result.errMsg = "the current user haven't registered";
    return result;
  } else {
    result.errCode = 0;
    result.errMsg = "the current user have registered, the userInfo is returned";
    result.data.registered = true;
    result.data.userData = userData;
    return result;
  }
}
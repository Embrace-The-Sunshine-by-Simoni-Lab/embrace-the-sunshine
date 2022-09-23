// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  var result = {};
  result.errCode = 0;
  result.errMsg = "";
  result.data = {};
  
  if (wxContext.OPENID != undefined) {
    console.log("user data: " + wxContext.OPENID);
  } else {
    result.errCode = 1;
    result.errMsg = "failed to get feedback data from WXContext";
    return result;
  }

  const db = cloud.database();
  var userData;
  await db.collection("main_db")
  .get()
  .then(res => {
    console.log("sucessfully check the database for all the user information");
    userData = res.data;
  });
  if (userData == undefined) {
    result.errCode = 0;
    result.errMsg = "there is no ionformation in the database";
    return result;
  } else {
    result.errCode = 0;
    result.errMsg = "current user data return";
    result.data.userData = userData;
    return result;
  }
}
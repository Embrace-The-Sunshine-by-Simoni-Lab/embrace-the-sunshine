// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const current_time = new Date();
  // only need openid
  if (wxContext.OPENID != undefined) {
    console.log("user data: " + wxContext.OPENID);
  } else {
    var result = {};
    result.errCode = 1;
    result.errMsg = "failed to get user data from WXContext";
    result.data = {};
    return result;
  }

  // check database
  const db = cloud.database();
  var userData;
  await db.collection("main_db")
  .where({
    openid: wxContext.OPENID
  })
  .get()
  .then(res => {
    console.log("sucessfully check the database for user information");
    userData = res.data[0];
  })
  var is_new_user = false;
  data_to_return = {};
  if (userData == undefined) {
    // new user
    is_new_user = true;
    // build a new record
    data_to_insert = {
      openid: wxContext.OPENID,
      nickname: "先生/女士",
      is_admin: false,
      reg_time: current_time,
      last_sign_in: current_time,
      mood_track: {
        // fixed size: 4
        // only record last 4 weeks
        mood_date: [-1, -1, -1, -1],
        mood_score: [-1, -1, -1, -1]
      },
      med_date: []
    }

    // insert into database
    await db.collection('main_db')
    .add({
      data: data_to_insert
    })
    .then(res => {
      console.log("new user added to the database");
    });
    data_to_return = data_to_insert;
  } else {
    await db.collection('main_db')
    .where({
      openid: wxContext.OPENID
    })
    .update({
      data: {
        last_sign_in: current_time
      }
    })
    .then(res => {
      console.log("user info updated");
    })
    data_to_return = userData;
    data_to_return['last_sign_in'] = current_time; 
  }

     
    
  var result = {};
  result.is_new_user = is_new_user;
  result.errCode = 0;
  result.errMsg = 'successfully return userinformation';
  result.data = data_to_return;
  return result;
}
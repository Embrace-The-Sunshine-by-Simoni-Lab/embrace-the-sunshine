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
        mood_date: [],
        mood_score: []
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

  
  // check podcast progress database
  var podcast_progress_info;
  await db.collection("podcast_progress_db")
  .where({
    openid: wxContext.OPENID
  })
  .get()
  .then(res => {
    console.log("sucessfully check the database for user podcast information");
    podcast_progress_info = res.data[0];
  })

  var podcast_progress_data_to_return;
  if (podcast_progress_info == undefined) {
    podcast_progress_data_to_insert = {
      openid: wxContext.OPENID,
      podcast_progress: []
    }
    // insert into database
    await db.collection('podcast_progress_db')
    .add({
      data: podcast_progress_data_to_insert
    })
    .then(res => {
      console.log("new user's podcast info added to the database");
    });
    podcast_progress_data_to_return = podcast_progress_data_to_insert;
  } else {
    podcast_progress_data_to_return = podcast_progress_info;
  }



  // check meditation progress database
  var meditation_progress_info;
  await db.collection("meditation_progress_db")
  .where({
    openid: wxContext.OPENID
  })
  .get()
  .then(res => {
    console.log("sucessfully check the database for user meditation information");
    meditation_progress_info = res.data[0];
  })

  var meditation_progress_data_to_return;
  if (meditation_progress_info == undefined) {
    meditation_progress_data_to_insert = {
      openid: wxContext.OPENID,
      meditation_progress: []
    }
    // insert into database
    await db.collection('meditation_progress_db')
    .add({
      data: meditation_progress_data_to_insert
    })
    .then(res => {
      console.log("new user's meditation info added to the database");
    });
    meditation_progress_data_to_return = meditation_progress_data_to_insert;
  } else {
    meditation_progress_data_to_return = meditation_progress_info;
  }


  // get medication time info
  let data_entry;
  await db.collection("med_time_db")
  .where({
    openid: wxContext.OPENID
  })
  .get()
  .then(res => {
    data_entry = res.data[0];
  })

  let med_track_date = [];
  let med_track = [];
  if (data_entry != undefined) {
    med_track = data_entry.med_track;
    for (let i = 0; i < med_track.length; i++) {
      med_track_date.push(med_track[i].date);
    }
  }
  
  data_to_return.med_date = med_track_date;
  data_to_return.med_track = med_track;

  var result = {};
  result.is_new_user = is_new_user;
  result.errCode = 0;
  result.errMsg = 'successfully return userinformation with is new user';
  result.data = data_to_return;
  result.podcast_progress_data = podcast_progress_data_to_return;
  result.meditation_progress_data = meditation_progress_data_to_return;
  return result;
}
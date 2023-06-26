// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// change id 
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  
  var result = {};
  result.data = {};
  if (wxContext.OPENID != undefined) {
    console.log("user data: " + wxContext.OPENID);
  } else {
    result.errCode = 1;
    result.errMsg = "failed to get user data from WXContext";
    result.data = {};
    return result;
  }
  
  if (event.date == undefined) {
    result.errCode = 1;
    result.errMsg = "missing required parameter"
    return result;
  }

  if (event.hour == undefined) {
    result.errCode = 1;
    result.errMsg = "missing required parameter"
    return result;
  }

  var data_entry;
  const db = cloud.database();
  await db.collection("med_time_db")
  .where({
    openid: wxContext.OPENID
  })
  .get()
  .then(res => {
    data_entry = res.data[0];
  });

  const inputDate = new Date(event.date);
  const cleanDate = new Date(event.date);
  cleanDate.setHours(0);
  cleanDate.setMinutes(0);
  cleanDate.setSeconds(0);
  cleanDate.setMilliseconds(0);


  let item = {
    date: inputDate,
    hour: event.hour
  }
  
  if (data_entry == null) {
    var med_track = [];
    med_track.push(item);
    await db.collection('med_time_db')
    .add({
      data: {
        openid: wxContext.OPENID,
        med_track: med_track
      }
    })
    .then(res => {
      console.log("new data entry added to the database");
    });
  } else {
    // update
    var med_track = data_entry.med_track;
    let added = false;
    for (let i = 0; i < med_track.length; i++) {
      let obj = med_track[i];
      let obj_date = new Date(obj.date);
      obj_date.setHours(0);
      obj_date.setMinutes(0);
      obj_date.setSeconds(0);
      obj_date.setMilliseconds(0);
      
      // update time
      if (obj_date.getTime() == cleanDate.getTime()) {
        med_track[i] = item;
        added = true;
        break;
      } else if (obj_date.getTime() > cleanDate.getTime()) {
        // insert at i
        med_track.splice(i, 0, item);
        added = true;
        break;
      }
    }
    if (!added) {
      console.log("append to end");
      med_track.push(item);
    }
    await db.collection("med_time_db")
    .where({
      openid: wxContext.OPENID
    })
    .update({
      data: {
        med_track: med_track
      }
    })
  }
  
  result.data.med_track = med_track;
  result.msg = "medication time set successfully";
  return result
}
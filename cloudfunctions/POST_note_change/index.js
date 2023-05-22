// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  var result = {};
  // only need openid
  if (wxContext.OPENID != undefined) {
    console.log("user data: " + wxContext.OPENID);
  } else {
    
    result.errCode = 1;
    result.errMsg = "failed to get user data from WXContext";
    result.data = {};
    return result;
  }

  if (event.content == null || typeof event.content != 'string') {
    result.errCode = 2;
    result.errMsg = "wrong parameter name(content) or wrong input type";
    result.data = {};
    return result;
  }

  // if (event.timestamp == null) {
  //   result.errCode = 2;
  //   result.errMsg = "wrong parameter name(timestamp) or wrong input type";
  //   result.data = {};
  //   return result;
  // }

  if (event.date == null) {
    result.errCode = 2;
    result.errMsg = "wrong parameter name(date) or wrong input type";
    result.data = {};
    return result;
  }
  
  

  const db = cloud.database();
  var resp;

  await db.collection('notes_db')
  .where({
    openid: wxContext.OPENID
  })
  .get()
  .then(res => {
    if (res.data.length == 0) {
      resp = null;
    } else {
      resp = res.data[0];
    }
    
  })

  // let ts = new Date(event.timestamp);

  let date = new Date(event.date);
  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);

  let item = {
      date: date,
      content: event.content
      // timestamp: ts
  }

  if (resp == null) {
    var notes = [];
    notes.push(item);
    await db.collection('notes_db')
    .add({
      data: {
        openid: wxContext.OPENID,
        notes: notes
      }
    })
    .then(res => {
      console.log("new data entry added to the database");
    });
    
  } else {
    // update
    let new_notes = resp.notes;
    let added = false;
    // console.log("input date: " + item.date);
    for (let i = 0; i < new_notes.length; i++) {
      let obj = new_notes[i];
      let obj_date = new Date(obj.date);
      // console.log(obj_date);
      // console.log((obj_date == item.date) );
      if (obj_date.getTime() == item.date.getTime()) {
        new_notes[i] = item;
        added = true;
        break;
      } else if (obj_date.getTime() > item.date.getTime()) {
        // insert at i
        new_notes.splice(i, 0, item);
        added = true;
        break;
      }
    }
    if (!added) {
      console.log("append to end");
      new_notes.push(item);
    }
    
    await db.collection('notes_db')
    .where({
      openid: wxContext.OPENID
    })
    .update({
      data: {
        notes: new_notes
      }
    })
    .then(res => {
      console.log("note updated");
    })  
    
  }
  
  return {
    status: "note successfully saved",
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
}
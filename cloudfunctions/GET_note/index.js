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
    resp = res.data[0];
  })

  let date = new Date(event.date);
  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);
  
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

  result = {};
  result.errCode = 0;
  result.errMsg = "success";
  result.data = {};
  result.data.content = "";
  result.data.timestamp = null;

  if (resp != null) {
    let notes = resp.notes;
    for (let i = 0; i < notes.length; i++) {
      let note = notes[i];
      if ((new Date(note.date)).getTime() == date.getTime()) {
        result.data.content = note.content;
        result.data.timestamp = note.timestamp;
        return result;
      }
    }
  }

  return result;
}
const cloud = require('wx-server-sdk')
cloud.init()
// parameters: date object
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  var result = {};
  result.errCode = 0;
  result.errMsg = "";
  result.data = {
    med_date: [],
    med_track: []
  };
  if (event.date == undefined) {
    result.errCode = 1;
    result.errMsg = "missing required parameter (date)";
    return result;
  }
  

  if (event.hour == undefined) {
    result.errCode = 1;
    result.errMsg = "missing required parameter (hour)";
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
    var med_track = data_entry.med_track;
    // maintain order
    let added = false;
    // let evict = false;
    for (let i = 0; i < med_track.length; i++) {
      let obj = med_track[i];
      let obj_date = new Date(obj.date);
      // clean date object for comparison
      obj_date.setHours(0);
      obj_date.setMinutes(0);
      obj_date.setSeconds(0);
      obj_date.setMilliseconds(0);

      // console.log(obj_date);
      // console.log((obj_date == item.date) );
      if (obj_date.getTime() == cleanDate.getTime()) {
        med_track.splice(i, 1);
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

  let med_date = []
  for (let i = 0; i < med_track.length; i++) {
    med_date.push(med_track[i].date);
  }
  
  result.data.med_date = med_date;
  result.data.med_track = med_track;
  return result
}
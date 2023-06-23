const cloud = require('wx-server-sdk')
cloud.init()
// parameters: date object
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  var result = {};
  result.errCode = 0;
  result.errMsg = "";
  result.data = {
    med_date: []
  };
  if (event.date == undefined) {
    result.errCode = 1;
    result.errMsg = "missing required parameter (date)";
    return result;
  }
  

  if (event.timestamp == undefined) {
    result.errCode = 1;
    result.errMsg = "missing required parameter (timestamp)";
    return result;
  }
  
  var med_data;
  const db = cloud.database();
  
  
  // if (Object.prototype.toString.call(event.date) !== "[object Date]") {
  //   result.errCode = 2;
  //   // result.errMsg = "wrong parameter type (should be a date object)"
  //   result.errMsg = Object.prototype.toString.call(event.date);
  //   return result;
  // }s
  var userData;
  const db = cloud.database();
  await db.collection("main_db")
  .where({
    openid: wxContext.OPENID
  })
  .get()
  .then(res => {
    userData = res.data[0];
  });
  var new_med_date = userData.med_date;
  // only stores 90 days' data
  // while (new_med_date.length > 90) {
  //   new_med_date.pop();
  // }
  // new_med_date.unshift(new Date(event.date));
  
  const inputDate = new Date(event.date);
  const cleanDate = new Date(event.date);
  cleanDate.setHours(0);
  cleanDate.setMinutes(0);
  cleanDate.setSeconds(0);
  cleanDate.setMilliseconds(0);

  // console.log(inputDate.getFullYear());
  // console.log(inputDate.getMonth());
  // console.log(inputDate.getDate());
  // console.log("-----------------------START CHECKING-----------------");
  // maintain order
  let added = false;
  for (let i = 0; i < new_med_date.length; i++) {
    let obj = new_med_date[i];
    let obj_date = new Date(obj.date);
    // clean date object for comparison
    obj_date.setHours(0);
    obj_date.setMinutes(0);
    obj_date.setSeconds(0);
    obj_date.setMilliseconds(0);

    // console.log(obj_date);
    // console.log((obj_date == item.date) );
    if (obj_date.getTime() == cleanDate.getTime()) {
      new_med_date[i] = inputDate;
      added = true;
      break;
    } else if (obj_date.getTime() > cleanDate.getTime()) {
      // insert at i
      new_med_date.splice(i, 0, inputDate);
      added = true;
      break;
    }
  }
  if (!added) {
    console.log("append to end");
    new_med_date.push(inputDate);
  }
  

  // let i = 0;
  // let evict = false;
  // console.log("length: " + new_med_date.length);
  // for (i = 0; i < new_med_date.length; i++) {
  //   let currDate = new Date(new_med_date[i]);
  //   console.log(currDate.getFullYear());
  //   console.log(currDate.getMonth());
  //   console.log(currDate.getDate());
    
  //   if (currDate.getFullYear() < inputDate.getFullYear()) {
  //     console.log("different year");
  //     break;
  //   } else if (currDate.getFullYear() === inputDate.getFullYear() && currDate.getMonth() < inputDate.getMonth()) {
  //     console.log("different month");
  //     break;
  //   } else if (currDate.getFullYear() === inputDate.getFullYear() && currDate.getMonth() === inputDate.getMonth() && currDate.getDate() < inputDate.getDate()) {
  //     console.log("different day");
  //     break;
  //   }

  //   if (currDate.getFullYear() === inputDate.getFullYear() && currDate.getMonth() === inputDate.getMonth() && currDate.getDate() === inputDate.getDate()) {
  //     console.log("same day, start evicting");
  //     evict = true;
  //     break;
  //   }
  //   console.log("-----------------------");
  // }

  // if (evict) {
  //   new_med_date.splice(i, 1);
  // } else {
  //   new_med_date.splice(i, 0, inputDate);
  // }
  
  await db.collection("main_db")
  .where({
    openid: wxContext.OPENID
  })
  .update({
    data: {
      med_date: new_med_date
    }
  })




  result.data.med_date = new_med_date;
  return result
}
// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 云函数入口函数
exports.main = async (event) => {
  const { nickName, userId, headImg, bufferHeadImg } = event;
  console.log(event)
  console.log(await cloud.database().collection('main_db').doc(userId))
  const { fileID } = await cloud.uploadFile({
    cloudPath: 'images/profile/handImg' + 'example.png',
    fildContent: Buffer.from(bufferHeadImg),
  })

  return {
    fileID
  }

  const data = await cloud.database().collection('main_db').doc(userId).update({
    data: {
      nickName,
      userId,
    }
  })

  return {
    data
  }
}
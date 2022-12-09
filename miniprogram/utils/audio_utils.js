module.exports = {
  getAllPodcastAudioInfo: getAllPodcastAudioInfo,
  loadAudioFile: loadAudioFile,
  audioGoToTime: audioGoToTime,
  playAudioFile: playAudioFile,
  pauseAudioFile: pauseAudioFile,
  getCurrTime: getCurrTime
}

function getAllPodcastAudioInfo() {
    var podcasts_info;
    wx.showLoading({
      title: '加载中',
    })
    wx.cloud.callFunction({
      name: 'getAllPodcastAudio',
      data: {
      },
      success: out => {
        console.log('callfunction sucess');
        console.log(out);
        if (out.result.errCode == 0) {
          podcasts_info = out.result.data;
        } else {
          console.log(out.errMsg);
        }
      },
      fail: out => {
        console.log('call function failed');
      },
      complete: out => {
        console.log('call function completed');
        wx.hideLoading();
        console.log(podcasts_info);
      }
    })
}

// load audio file
function loadAudioFile(src) {
  const innerAudioContext = wx.createInnerAudioContext({
    useWebAudioImplement: false
  })
  innerAudioContext.src = src;
  // innerAudioContext.onPlay(function(res) {
  //   var duration = innerAudioContext.duration;
  // });
  // innerAudioContext.onTimeUpdate(function(res) {
  //   var currTime = innerAudioContext.currentTime * 1000;
  //   // set curr time
  // });
  return innerAudioContext;
}

// play
function playAudioFile(audioContext) {
  innerAudioContext.play();
}

// pause
function pauseAudioFile(audioContext) {
  innerAudioContext.pause();
}

function getCurrTime(audioContext) {
  return audioContext.currentTime();
}

// go to time
function audioGoToTime(audioContext, second) {
  audioContext.seek(secend)
}

// get next podcast

// get prev podcast
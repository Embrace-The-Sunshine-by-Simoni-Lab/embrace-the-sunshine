module.exports = {
  loadAudioFile: loadAudioFile,
  audioGoToTime: audioGoToTime,
  playAudioFile: playAudioFile,
  pauseAudioFile: pauseAudioFile,
  getCurrTime: getCurrTime
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
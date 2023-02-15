// pages/moodTracking-Content/mockTracking-Content.js
const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    totalScore: 27,
    questionProgress: 0,
    warningStatus: false,
    currentQuestion:  0,
    finishStatus: [-1, -1, -1, -1, -1, -1, -1, -1, -1],
    questions: [
      ["1.没有兴趣或不乐意做事情", "cloud://cloud1-2gjzvf7qc03c5783.636c-cloud1-2gjzvf7qc03c5783-1306062016/images/moodtrack/moodtrack1.png"],
      ["2.感到情绪低落,沮丧或绝望", "cloud://cloud1-2gjzvf7qc03c5783.636c-cloud1-2gjzvf7qc03c5783-1306062016/images/moodtrack/moodtrack2.png"],
      ["3.入睡或保持睡眠有困难", "cloud://cloud1-2gjzvf7qc03c5783.636c-cloud1-2gjzvf7qc03c5783-1306062016/images/moodtrack/moodtrack3.png"],
      ["4.感到疲劳或没有精神", "cloud://cloud1-2gjzvf7qc03c5783.636c-cloud1-2gjzvf7qc03c5783-1306062016/images/moodtrack/moodtrack4.png"],
      ["5.胃口不好或者饮食过度", "cloud://cloud1-2gjzvf7qc03c5783.636c-cloud1-2gjzvf7qc03c5783-1306062016/images/moodtrack/moodtrack5.png"],
      ["6.对自己感到难过过,感觉自己是个失败者或让自己或家人失望", "cloud://cloud1-2gjzvf7qc03c5783.636c-cloud1-2gjzvf7qc03c5783-1306062016/images/moodtrack/moodtrack6.png"],
      ["7.做事不能集中注意力,如读报纸或看电视", "cloud://cloud1-2gjzvf7qc03c5783.636c-cloud1-2gjzvf7qc03c5783-1306062016/images/moodtrack/moodtrack7.png"],
      ["8.走路或说话很慢,慢到引人注意(或者相反,坐立不安或好动,比通常情况下走动的时间多)", "cloud://cloud1-2gjzvf7qc03c5783.636c-cloud1-2gjzvf7qc03c5783-1306062016/images/moodtrack/moodtrack8.png"],
      ["9.想到自己最好去死或者以某种方式伤害自己", "cloud://cloud1-2gjzvf7qc03c5783.636c-cloud1-2gjzvf7qc03c5783-1306062016/images/moodtrack/moodtrack9.png"]
    ]
  },
  goToNextQuestion() {
    const NextQuestion = this.data.currentQuestion + 1;
    this.setData({
      currentQuestion: NextQuestion
    })
  },
  goToPrevQuestion() {
    const PrevQuestion = this.data.currentQuestion - 1;
    this.setData({
      currentQuestion: PrevQuestion
    })
  },
  pickOption(event) {
    const currentQuestion = this.data.currentQuestion;
    const pickResult = event.currentTarget.dataset.optionId;
    const currentAnswer = this.data.finishStatus;
    // calculate percentage
    if(currentAnswer[currentQuestion] == -1) {
      const newProgress = this.data.questionProgress + (1/9*100)
      this.setData({
        questionProgress: newProgress
      })
    }
    currentAnswer[currentQuestion] = pickResult;
    // change state
    if(!currentAnswer.includes(-1)) {
      this.setData({
        warningStatus: false
      })
    }
    this.setData({
      finishStatus: currentAnswer
    })
  },
  submit() {
    if(this.data.finishStatus.includes(-1)) {
      this.setData({
        warningStatus: !this.data.warningStatus
      })
    } else {
      const numberArray = this.data.finishStatus.map(Number);
      const totalScore  = numberArray.reduce((accumulator, value) => {
        return accumulator + value;
      }, 0);
      wx.cloud.callFunction({
        name: 'mood_tracking_submit',
        data: {
          week: new Date(),
          score: totalScore
        },
        success: out => {
          console.log(app.globalData.userData)
          app.globalData.userData.mood_track = out.result.data.mood_track;
          wx.showToast({
            title:'提交成功',
            icon: 'success'
          })
        }
      })
      wx.redirectTo({
        url: '../moodtrack-finish/moodtrack-finish?score=' + totalScore
      })
    }
  }
})
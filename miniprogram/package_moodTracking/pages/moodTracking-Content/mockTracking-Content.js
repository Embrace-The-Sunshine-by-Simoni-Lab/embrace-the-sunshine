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
      ["1.没有兴趣或不乐意做事情", "cloud://cloud1-2gjzvf7qc03c5783.636c-cloud1-2gjzvf7qc03c5783-1306062016/images/moodtrack/depression tracking- person resting head on desk.svg"],
      ["2.感到情绪低落,沮丧或绝望", "cloud://cloud1-2gjzvf7qc03c5783.636c-cloud1-2gjzvf7qc03c5783-1306062016/images/moodtrack/depression tracking- person thinking.svg"],
      ["3.入睡或保持睡眠有困难", "cloud://cloud1-2gjzvf7qc03c5783.636c-cloud1-2gjzvf7qc03c5783-1306062016/images/moodtrack/depression tracking- person overwhelmed.svg"],
      ["4.感到疲劳或没有精神", "cloud://cloud1-2gjzvf7qc03c5783.636c-cloud1-2gjzvf7qc03c5783-1306062016/images/moodtrack/depression track- person with down arrows.svg"],
      ["5.胃口不好或者饮食过度", "cloud://cloud1-2gjzvf7qc03c5783.636c-cloud1-2gjzvf7qc03c5783-1306062016/images/moodtrack/depression tracking- person with burgers.svg"],
      ["6.对自己感到难过过,感觉自己是个失败者或让自己或家人失望", "cloud://cloud1-2gjzvf7qc03c5783.636c-cloud1-2gjzvf7qc03c5783-1306062016/images/moodtrack/depression tracking- person with arrows.svg"],
      ["7.做事不能集中注意力,如读报纸或看电视", "cloud://cloud1-2gjzvf7qc03c5783.636c-cloud1-2gjzvf7qc03c5783-1306062016/images/moodtrack/depression tracking- person with book.svg"],
      ["8.走路或说话很慢,慢到引人注意(或者相反,坐立不安或好动,比通常情况下走动的时间多)", "cloud://cloud1-2gjzvf7qc03c5783.636c-cloud1-2gjzvf7qc03c5783-1306062016/images/moodtrack/depression tracking- person with clocks.svg"],
      ["9.有想要伤害自己或一死了之的想法", "cloud://cloud1-2gjzvf7qc03c5783.636c-cloud1-2gjzvf7qc03c5783-1306062016/images/moodtrack/depression tracking- person with cancels.svg"]
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
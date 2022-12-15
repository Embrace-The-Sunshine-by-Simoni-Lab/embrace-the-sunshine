Page({
  /**
   * 生命周期函数--监听页面加载
   */
  
  data: {
    ReportStatus: false,
    audioList: [],
    collectStatus: false,
    playStatus: false,
    mode: "Content",
    completeStatus:  true, // 判断是否所有的问题都被回答完了
    submitStatus: false,
    rightAnswer: ['0', '3', '1', '2', '1', '1', '1', '1'],
    finishStatus: [-1, -1, -1, -1, -1, -1, -1, -1],
    currentQuestion:  0,
    questions: [
      ["1.你好, 我是问题一请回答"],
      ["2.你好, 我是问题二请回答"],
      ["3.你好, 我是问题三请回答"],
      ["4.你好, 我是问题四请回答"],
      ["5.你好, 我是问题五请回答"],
      ["6.你好, 我是问题六请回答"],
      ["7.你好, 我是问题七请回答"],
      ["8.你好, 我是问题八请回答"]
    ],
    isPlaying: false
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

    currentAnswer[currentQuestion] = pickResult;

    console.log(123, currentAnswer)
    if(!currentAnswer.includes(-1)) {
      this.setData({
        completeStatus: true
      })
    }

    this.setData({
      finishStatus: currentAnswer
    })
  },

  goToTest() {
    this.setData({
      mode: "Quiz"
    })
  },
  goToContent() {
    this.setData({
      mode: "Content"
    })
  },

  submit() {
    this.setData({
      submitStatus: true,
      ReportStatus: true,
      currentQuestion: 0,
    })
  },
})





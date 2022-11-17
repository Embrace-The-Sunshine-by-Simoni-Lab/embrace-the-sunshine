// pages/podcastPlay/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    collectStatus: false,
    playStatus: false,
    mode: "Content",
    completeStatus: false,
    submitStatus: false,
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
    ]
  },
  /**
   * 组件的方法列表
   */
  methods: {
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
    changePlayStatus() {
      let currentPlayStatus = this.data.playStatus
      this.setData({
        playStatus: !currentPlayStatus
      })
    },
    changeCollectStatus() {
      let currentCollectStatus = this.data.collectStatus
      this.setData({
        collectStatus: !currentCollectStatus
      })

      wx.showToast({
        title: this.data.collectStatus?'收藏成功':'取消收藏',
        duration: 1500
      })
    },
    submit() {
      if(!this.data.finishStatus.includes(-1)) {
        this.setData({
          submitStatus: true,
          finishStatus: [-1, -1, -1, -1, -1, -1, -1, -1],
        })
      } else if(this.data.submitStatus) {
        this.setData({
          submitStatus: false,
          currentQuestion: 0,
          completeStatus: false,
        })
      }
    },
  }
})

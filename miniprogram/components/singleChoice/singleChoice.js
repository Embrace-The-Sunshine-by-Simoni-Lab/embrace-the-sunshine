// components/singleChoice/singleChoice.js
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
    mode: "Quiz",
    completeStatus: false, // 判断是否所有的问题都被回答完了
    submitStatus: false, // 判断答案是否已经提交
    ReportStatus: false, // 判断是否已经点击report按钮
    rightAnswer: ['0', '3', '1'],
    finishStatus: ['-1', '-1', '-1'],
    currentQuestion:  0,
    questions: [
      ["1.你好, 我是问题一请回答"],
      ["2.你好, 我是问题二请回答"],
      ["3.你好, 我是问题三请回答"],
    ],
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

      if(!currentAnswer.includes("-1")) {
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
        currentQuestion: 0,
      })
    },
    checkReport() {
      this.setData({
        ReportStatus: true
      })
    }
  }
})

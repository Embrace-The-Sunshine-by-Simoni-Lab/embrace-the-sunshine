// components/singleChoice/singleChoice.js
Component({
  properties: {
    currPodCastOrder: {
      type: Number,
      observer: function (order) {
        this.setData({
          currPodcastOrder: order
        })
        this.refresh();
      }
    }
  },
  data: {
    mode: "Quiz",
    reportPageClicked: true,
    allQuestionAnswered: false,
    currentDisplayQuestion: 0,
    user_answer: [],
    currPodcastOrder: -1,
    podCastInfo: {}
  },

  ready() {
    this.refresh();
  },

  methods: {
    async refresh() {
      let allPodCastData = await wx.getStorageSync('allPodCastData');
      let currPodCast = allPodCastData[this.properties.currPodCastOrder];
      let answerTemp = currPodCast.pod_Cast_Quiz.length
      let answerLength = answerTemp
      let arr = new Array(answerLength).fill(-1);
      this.setData({
        answer: arr,
        podCastInfo: currPodCast,
      })
    },
    goToOption(e) {
      this.setData({
        mode: e.currentTarget.dataset.mode
      })
    },
    clickOption(e) {
      let newClickedAnswer = e.detail
      let newAllQuestionAnswered = false;
      if(!newClickedAnswer.includes(-1)) {
        newAllQuestionAnswered = true
      }
      this.setData({
        answer: newClickedAnswer,
        allQuestionAnswered: newAllQuestionAnswered
      })
    },

    changeQuestion(e) {
      let direction = e.currentTarget.dataset.direction
      let currentDisplayQuestion = this.data.currentDisplayQuestion
      let questionCount = this.data.answer.length
      if(direction === 'prev' && currentDisplayQuestion > 0) {
        currentDisplayQuestion -= 1
      } else if(direction === 'next' && currentDisplayQuestion <= questionCount - 2) {
        currentDisplayQuestion += 1
      } 
      this.setData({
        currentDisplayQuestion
      })
    },

    // allow users to type in answers for open ended question
    userNameInput(e) {
      console.log("input", e)
    }
  }
})

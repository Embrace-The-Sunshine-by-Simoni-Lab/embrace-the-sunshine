// components/singleChoice/singleChoice.js
const app = getApp()

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
    mode: "Content",
    submitClicked: false, // 是否用户已经点了提交
    allQuestionAnswered: false, // 是否用户已经完成所有需要填完的问题
    checkResultClicked: false,
    currentDisplayQuestion: 0, // 当前问题
    user_answer: [], // 所有问题用户的答案
    currPodcastOrder: -1, // 当前是哪个podcast
    podCastInfo: {}, // 当前podcast的内容
    open_ended_answer: "", // 开放式问题用户的答案
  },
  ready() {
    this.refresh();
  },

  methods: {
    async refresh() {
      let allPodCastData = await wx.getStorageSync('allPodCastData');
      let currPodCast = allPodCastData[this.properties.currPodCastOrder];
      let currUserAnswer = app.globalData.podcast_progress_data.podcast_progress[this.properties.currPodCastOrder];

      // 如果有open eneded的回答那么更新
      if(currUserAnswer) {
        let cur_pod_cast_open_ended = currUserAnswer[currUserAnswer.length - 1]
        if(cur_pod_cast_open_ended != -1){// 等于-1说明用户没有填开放式回答
          this.setData({
            open_ended_answer: cur_pod_cast_open_ended
          })
        } 
      }

      if(!currUserAnswer) { // 用户还未提交过
        let answerTemp = currPodCast.pod_Cast_Quiz.length
        let answerLength = answerTemp
        currUserAnswer = new Array(answerLength).fill(-1);
        this.setData({
          submitClicked: false
        })
      } else { // 如果已经有提交过的数据了
        currUserAnswer = app.globalData.podcast_progress_data.podcast_progress[this.properties.currPodCastOrder];
        this.setData({
          submitClicked: true
        })
      }

      this.setData({
        user_answer: currUserAnswer,
        podCastInfo: currPodCast,
      })
    },

    goToOption(e) {
      this.setData({
        mode: e.currentTarget.dataset.mode
      })
    },

    // 用户点击单选或者多选, 更新答案
    clickOption(e) {
      // 更新后的用户答案, 为一个list
      let newClickedAnswerList = e.detail
      let newAllQuestionAnswered = false;

      // 当所有问题(除了最后一个开放式问答)都被回答完毕
      if(!newClickedAnswerList.slice(0,-1).includes(-1)) {
        newAllQuestionAnswered = true
      }
      this.setData({
        user_answer: newClickedAnswerList,
        allQuestionAnswered: newAllQuestionAnswered
      })
    },
    // 跳转到上一个问题或者下一个问题
    changeQuestion(e) {
      let direction = e.currentTarget.dataset.direction
      let currentDisplayQuestion = this.data.currentDisplayQuestion
      let questionCount = this.data.user_answer.length
      if(direction === 'prev' && currentDisplayQuestion > 0) {
        currentDisplayQuestion -= 1
      } else if(direction === 'next' && currentDisplayQuestion <= questionCount - 2) {
        currentDisplayQuestion += 1
      } 
      this.setData({
        currentDisplayQuestion
      })
    },

    // 开放式回答,每次用户输入新内容更新
    userNameInput(e) {
      const userInputText = e.detail.value
      let currentAnswerList = this.data.user_answer
      currentAnswerList[this.data.currentDisplayQuestion] = userInputText

      console.log("currentAnswerList", currentAnswerList)
      this.setData({
        user_answer: currentAnswerList,
        open_ended_answer: userInputText
      })
    },
    // 提交答案, 并且将当前的页面设置为已经提交
    submitQuiz() {
      let that = this
      wx.cloud.callFunction({
        name: 'submit_podcast_quiz',
        data: {
          podcast_id: that.properties.currPodCastOrder,
          user_answers: that.data.user_answer
        },
        success: out => {
          console.log("successfully update")
          // 提交完后更新
          app.globalData.podcast_progress_data.podcast_progress = out.result.data;

          // 提交成功之后显示弹窗
          wx.showToast({
            title: '提交成功',
            duration: 1500
          })

          that.setData({
            currentDisplayQuestion: 0,
            submitClicked: true
          })
        },
        fail: out => {
          console.log('call function failed')
        }
      })
  },
    // 点击查看结果按钮
    checkResult() {
      this.setData({
        checkResultClicked: true
      })
    }
}})

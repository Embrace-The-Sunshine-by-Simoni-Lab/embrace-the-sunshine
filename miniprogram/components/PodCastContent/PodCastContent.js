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
    },
    podCastType: {
      type: String,
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
    podCastType: "", // 判断当前podcast是不是冥想
    meditation_open_end_filled_status: false // 判断用户是否至少填写了一个字符
  },
  ready() {
    // 同时更新当前podcast是不是冥想
    let currentPodcastType = this.properties.podCastType
    this.setData({
      podCastType: currentPodcastType
    })
    this.refresh();
  },

  methods: {
    async refresh() {
      // 这里要要根据podcast的类型(是普通podcast还是meditation)设置allPodCastData以及对应的问题答案
      let allPodCastData;
      let currUserAnswer;
      if(this.properties.podCastType !== '冥想') {
        allPodCastData =  await wx.getStorageSync('allPodCastData');
        currUserAnswer = app.globalData.podcast_progress_data.podcast_progress[this.properties.currPodCastOrder];
      } else {
        allPodCastData =  await wx.getStorageSync('allMeditationData');
        console.log("123allPodCastData", app.globalData.meditation_progress_data)
        currUserAnswer = app.globalData.meditation_progress_data.meditation_progress[this.properties.currPodCastOrder];
      }

      let currPodCast = allPodCastData[this.properties.currPodCastOrder];
      let curr_Podcast_quiz_length = currPodCast.pod_Cast_Quiz.length

      console.log("currUserAnswer", currUserAnswer)
      // 如果有open eneded的回答那么更新
      if(currUserAnswer && currUserAnswer.length !== 0) {// currUserAnswer.length !== 0是因为冥想没提交的时候currUserAnswer为空的[]
        let cur_pod_cast_open_ended = currUserAnswer[currUserAnswer.length - 1]
        if(cur_pod_cast_open_ended && cur_pod_cast_open_ended != -1){// 不等于-1说明用户填了开放式回答
          this.setData({
            submitClicked: true,
            open_ended_answer: cur_pod_cast_open_ended
          })
        } 
      } else {// 用户还未提交过,此时没有useranswer
        let answerTemp = currPodCast.pod_Cast_Quiz.length
        let answerLength = answerTemp
        currUserAnswer = new Array(answerLength).fill(-1);
        this.setData({
          submitClicked: false,
        })
      }
      this.setData({
        curr_Podcast_quiz_length,
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
      if(userInputText!=="") {
        let currentAnswerList = this.data.user_answer
        currentAnswerList[this.data.currentDisplayQuestion] = userInputText
        this.setData({
          user_answer: currentAnswerList,
          open_ended_answer: userInputText,
          meditation_open_end_filled_status: true
        })
      } else {
        this.setData({
          user_answer: [],
          open_ended_answer: userInputText,
          meditation_open_end_filled_status: false
        })
      }
    },

    // 提交答案, 并且将当前的页面设置为已经提交
    submitQuiz(e) {
      // 用来判断是meditation的提交, 还是普通的quiz提交
      let currentSubmitType = e.currentTarget.dataset.type
      let that = this
      // 如果是冥想的提交
      if(currentSubmitType === '冥想') {
        wx.cloud.callFunction({
          name: 'submit_meditation_quiz',
          data: {
            meditation_id: that.properties.currPodCastOrder,
            user_answer: that.data.user_answer[0] // 这里0的位置肯定有值不然不给提交
          },
          success: out => {
            console.log("successfully update", out.result)
            // 提交完后更新
            app.globalData.meditation_progress_data.meditation_progress = out.result.data;
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
      } else { // 如果是普通博客的提交
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
      }
  },
  // 点击查看结果按钮
  checkResult() {
    this.setData({
      checkResultClicked: true
    })
  }
}})

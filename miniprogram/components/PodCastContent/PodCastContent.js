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
    meditation_open_end_filled_status: false, // 判断用户是否至少填写了一个字符
    curr_Podcast_quiz_length: -1
  },
  ready() {
    // 同时更新当前podcast是不是冥想
    let currentPodcastType = this.properties.podCastType
    this.setData({
      podCastType: currentPodcastType,
    })
    this.refresh();
  },

  methods: {
    async refresh() {
      if(this.properties.currPodCastOrder == -1) return;

      let allPodCastData;
      let currUserAnswer;
      // console.log("type", this.properties.podCastType)
      // console.log("order", this.properties.currPodCastOrder)
      // console.log("app global podcast", app.globalData.podcast_progress_data)
      // console.log("app global meditation", app.globalData.meditation_progress_data)
      // 这里要要根据podcast的类型(是普通podcast还是meditation)设置allPodCastData以及对应的问题答案
      // podcast_progress和meditation_progress都是一样的,没有记录的都是默认都是空的[]
      // 有数据的时候podcast_progress的格式为[[],[],[]]
      // 有数据的时候meditation_progress的格式为[[]] (里面只可能有一个[], 因为meditation只有一个问答题)
      // 如果podcast和meditation都没有记录,
      // currUserAnswer为每个podcast对应的answers
      if(this.properties.podCastType === '播客') {
        allPodCastData =  await wx.getStorageSync('allPodCastData');
        currUserAnswer = app.globalData.podcast_progress_data.podcast_progress[this.properties.currPodCastOrder];
      } else if(this.properties.podCastType === '冥想') {
        allPodCastData =  await wx.getStorageSync('allMeditationData');
        currUserAnswer = app.globalData.meditation_progress_data.meditation_progress[this.properties.currPodCastOrder];
      }
      // console.log("allPodCastData after", allPodCastData)
      // console.log("currUserAnswer after", currUserAnswer)
      // console.log("currPodCastOrder", this.properties.currPodCastOrder)

      // 获取当前的podcast,以及当前quiz的长度(如果有的话)
      // 当前的podcast是为了播放音频, pocastLength是为了播客的前进和后退
      let currPodCast = allPodCastData[this.data.currPodcastOrder];
      let curr_Podcast_quiz_length = currPodCast.pod_Cast_Quiz.length

      // 不管是普通的podcast还是meditation, 只要没有提交过答案, 就把currUserAnswer设置为跟问题数量等长的array
      if(!currUserAnswer) {
        currUserAnswer = Array(curr_Podcast_quiz_length).fill(-1);
        this.setData({
          submitClicked: false,
        })
      } else {
      // 如果currUserAnswer不为undefine, 那么说明用户已经提交答案了
        let submmitted_open_end_question = currUserAnswer[currUserAnswer.length - 1]
        this.setData({
          submitClicked: true,
          open_ended_answer: submmitted_open_end_question
        })
      }
      
      this.setData({
        curr_Podcast_quiz_length,
        podCastInfo: currPodCast,
        user_answer: currUserAnswer
      })
    },
    
    jumpToPodCastPlay(e) {
      let clickedPodCastNum = e.currentTarget.dataset.id
      let type = e.currentTarget.dataset.podcasttype
      wx.navigateTo({
        url: `../podcastPlay/index?podCastOrder=${clickedPodCastNum}&type=${type}`
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

      console.log("newClickedAnswerList", newClickedAnswerList)
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
      let questionCount = this.data.curr_Podcast_quiz_length
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
      console.log("submittt", that.data.user_answer)
      // 如果是冥想的提交
      if(currentSubmitType === '冥想') {
        wx.cloud.callFunction({
          name: 'submit_meditation_quiz',
          data: {
            meditation_id: that.properties.currPodCastOrder,
            user_answers: that.data.user_answer // 这里0的位置肯定有值不然不给提交
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

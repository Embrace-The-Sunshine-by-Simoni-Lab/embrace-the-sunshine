// components/singleChoice/singleChoice.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    currPodCastOrder: {
      type: Number,
      observer: function (text) {
        console.log("update", text)
        this.setData({
          currPodcastOrder: text
        })
        // var that = this;
        // text === 'zhangsan' ? that.a() : that.b()
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    mode: "Quiz",
    reportPageClicked: true,
    allQuestionAnswered: false,
    currentDisplayQuestion: 0,
    user_answer: [],
    currPodcastOrder: -1,
    podCastInfo: {}
    // podCastInfo: {
    //   mainTitle: '认识情绪',
    //   mainContentSummary: '情绪的种类，功能，和强度',
    //   author: '丽莹&凌霄',
    //   publishDate: '2022/01/01',
    //   totalTime: '24:49',
    //   podCastCollected: false,
    //   pod_Cast_Content: [
    //     {
    //       firstLevel: "情绪的种类和源头",
    //       time: "01: 00"
    //     },
    //     {
    //       firstLevel: "情绪（例如愤怒）会引发的行为和后果",
    //       time: "02: 00",
    //       firstLevel_content: [
    //         {
    //           second_title : "有效：理智反思，解决问题",
    //         },
    //         {
    //           second_title: "无效：冲动行事，恶化问题"
    //         }
    //       ]
    //     },
    //     {
    //       firstLevel: "情绪的功能: ",
    //       time: "03: 00",
    //       firstLevel_content: [
    //         {
    //           second_title: "向他人或自己传递信号:",
    //           second_title_content: [
    //             {
    //               third_title: "准确的信号能够促进有益行为，从而帮助达成目的"
    //             },
    //             {
    //               third_title: "不准确的信号可能会引发无益行为，阻碍达成目的"
    //             }
    //           ]
    //         }
    //       ]
    //     },
    //   ],
    //   pod_Cast_Quiz: [
    //     {
    //       order: "第一题",
    //       type: "单选题",
    //       question: "我是问题1?",
    //       options: [
    //         {
    //           option_content: "种类是情绪的属性之一，情绪的种类有愤怒，焦虑，忧伤等",
    //           option_explanation: "选择1xxxxxxxxxxxxx"
    //         },
    //         {
    //           option_content: "强度是情绪的一种属性，比如心情低落是较低强度，而感到绝望则是较高强度",
    //           option_explanation: ""
    //         },
    //         {
    //           option_content: "情绪强度较高时，可能引发冲动的行为，做出让自己后悔的决定",
    //           option_explanation: "选择31xxxxxxxxxxxxx"
    //         },
    //         {
    //           option_content: "情绪可能引发灾难性极端的想法，比如情绪低落的时候，觉得整个世界都把自己抛弃了",
    //           option_explanation: ""
    //         },
    //         {
    //           option_content: "以上所有",
    //           option_explanation: "选择41xxxxxxxxxxxxx"
    //         }
    //       ],
    //       correctAnswer: 2
    //     },
    //     {
    //       order: "第二题",
    //       type: "多选题",
    //       question: "我是问题2?",
    //       options: [
    //         {
    //           option_content: "选择1sdfdsfsdsdfds",
    //           option_explanation: "选择1xxxxxxxxxxxxx"
    //         },
    //         {
    //           option_content: "选择2xxxxxxxxxxxxx选择",
    //           option_explanation: "选择2xxxxxxxxxxxxx选择2xxxxxxxxxxxxx选择2xxxxxxxxxxxxx选择2xxxxxxxxxxxxx选择2xxxxxxxxxxxxx选择2xxxxxxxxxxxxx"
    //         },
    //         {
    //           option_content: "选择3sdfdsfsdsdfds",
    //           option_explanation: "选择31xxxxxxxxxxxxx"
    //         },
    //         {
    //           option_content: "选择4sdfdsfsdsdfds",
    //           option_explanation: "选择41xxxxxxxxxxxxx"
    //         }
    //       ],
    //       correctAnswer: [-1, 1, -1, 1]
    //     },
    //     {
    //       order: "第三题",
    //       type: "排序题",
    //       question: "我是问题3?",
    //       options: [
    //         {
    //           option_content: "选择1sdfdsfsdsdfds",
    //           option_explanation: "选择1xxxxxxxxxxxxx"
    //         },
    //         {
    //           option_content: "选择2xxxxxxxxxxxxx选择",
    //           option_explanation: "选择2xxxxxxxxxxxxx选择2xxxxxxxxxxxxx选择2xxxxxxxxxxxxx选择2xxxxxxxxxxxxx选择2xxxxxxxxxxxxx选择2xxxxxxxxxxxxx"
    //         },
    //         {
    //           option_content: "选择3sdfdsfsdsdfds",
    //           option_explanation: "选择31xxxxxxxxxxxxx"
    //         },
    //         {
    //           option_content: "选择4sdfdsfsdsdfds",
    //           option_explanation: "选择41xxxxxxxxxxxxx"
    //         }
    //       ],
    //       correctAnswer: [-1, 1, -1, 1]
    //     }
    //   ],
    // }
  },

  ready() {
    let allPodCastData =  wx.getStorageSync('allPodCastData');
    let currPodCast = allPodCastData[this.properties.currPodCastOrder]

    let answerTemp = currPodCast.pod_Cast_Quiz.length
    let answerLength = answerTemp
    let arr = new Array(answerLength).fill(-1);

    this.setData({
      answer: arr,
      podCastInfo: currPodCast,
    })
  },


  /**
   * 组件的方法列表
   */
  methods: {
    goToOption(e) {
      this.setData({
        mode: e.currentTarget.dataset.mode
      })
    },
    clickOption(e) {
      let newClickedAnswer = e.detail
      let newAllQuestionAnswered = false;

      // 如果answer中没有-1,那么表示每个问题都被回答了
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
    }
  }
})

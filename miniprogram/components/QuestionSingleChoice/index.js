// components/QuestionSingleChoice/index.js
Component({
  properties: {
    option_info: {
      type: Object,
      value: {}
    },
    user_answer: {
      type: Array,
      value: [],
      observer: function (order) {
        this.refresh();
      }
    },
    order: {
      type: Number,
    },
    reportPageClicked: {
      type: Boolean,
    }
  },

  data: {
    userAnswer: -1, // current user choice
    correctAnswer: -1, // current correct answer
    explanationVisible: [],
  },
  
  attached: function() {
    let questionLength = this.properties.option_info.options.length
    let initExplanationVisible = new Array(questionLength).fill(false);

    this.setData({
      correctAnswer: this.properties.option_info.correctAnswer,
      explanationVisible: initExplanationVisible,
      userAnswer: this.properties.user_answer[this.properties.order]
    })
  },
  /**
   * 组件的方法列表
   */
  methods: {
    refresh() {
      this.setData({
        userAnswer: this.properties.user_answer[this.properties.order],
      })
    },

    clickOption(e) {
      let updatedAnswerList = this.properties.user_answer
      // let clickedIndex = e.target.dataset.index
      let currentQuestionOrder = this.properties.order
      // 如果点击的那个选项已经有被点击过了, 那么把值设置为-1, 否则直接更新为新的选项
      if(updatedAnswerList[currentQuestionOrder] == e.target.dataset.index) {
        updatedAnswerList[currentQuestionOrder] = -1
        this.setData({
          userAnswer: -1,
        })
      } else {
        // 更新用户点击的选项
        updatedAnswerList[currentQuestionOrder] = e.target.dataset.index
        // 被点击到的选项背景变成会变成紫色
        this.setData({
          userAnswer: e.target.dataset.index,
        })
      }
      // clickOption为父组件传递过来的方法
      this.triggerEvent('clickOption', updatedAnswerList)
    },

    toggleExplanation: function(event) {
      // 获取当前被点击的选项的编号
      const optionIndex = event.currentTarget.dataset.index;
      // 修改 explanationVisible 数组中的某一项的值
      const newExplanationVisible = this.data.explanationVisible.map((visible, index) => {
        return index === optionIndex ? !visible : visible;
      });
      this.setData({
        explanationVisible: newExplanationVisible
      });
    }
  }
})

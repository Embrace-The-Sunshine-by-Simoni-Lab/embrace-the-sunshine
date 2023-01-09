// components/QuestionSingleChoice/index.js
Component({
  properties: {
    option_info: {
      type: Object,
      value: {}
    },
    user_answer: {
      type: Array,
      value: []
    },
    order: {
      type: Number,
    },
    reportPageClicked: {
      type: Boolean,
    }
  },

  data: {
    userAnswer: 3, // 当前用户的选择
    correctAnswer: -1, // 当前问题的正确答案
    explanationVisible: [],
  },
  
  attached: function() {
    let questionLength = this.properties.option_info.options.length
    let initExplanationVisible = new Array(questionLength).fill(false);
    this.setData({
      correctAnswer: this.properties.option_info.correctAnswer,
      explanationVisible: initExplanationVisible
    })
  },
  /**
   * 组件的方法列表
   */
  methods: {
    clickOption(e) {
      let updatedAnswerList = this.properties.user_answer
      let clickedIndex = e.target.dataset.index
      let currentQuestionOrder = this.properties.order

      // 更新用户点击的选项
      let updatedAnswer = {
        type: "singleChoice",
        value: e.target.dataset.index
      }
      updatedAnswerList[currentQuestionOrder] = updatedAnswer

      this.triggerEvent('clickOption', updatedAnswerList)

      // 被点击到的选项背景变成会变成紫色
      this.setData({
        userAnswer: e.target.dataset.index,
      })
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

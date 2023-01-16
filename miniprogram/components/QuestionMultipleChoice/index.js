// components/QuestionMultipleChoice/index.js
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
    userAnswer: [1, 1, -1, -1], // 当前用户的选择, 可以选择多个
    correctAnswer: [], // 当前问题的正确答案
    explanationVisible: [],
    buttonText: '点击选项展开解释'
  },
  
  attached: function() {
    let questionLength = this.properties.option_info.options.length

    // console.log("option_info", this.properties.option_info)

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
      
      let currUserAnswer = this.data.userAnswer
      // 检查 userAnswer 数组是否已经包含当前选项的编号
      if(currUserAnswer[clickedIndex] == 1) {
        currUserAnswer[clickedIndex] = -1
      } else {
        currUserAnswer[clickedIndex] = 1
      }
    
      // 更新用户点击的选项
      let updatedAnswer = {
        type: "MultipleChoice",
        value: currUserAnswer
      }
      updatedAnswerList[currentQuestionOrder] = updatedAnswer
    
      this.triggerEvent('clickOption', updatedAnswerList)
    
      // 被点击到的选项背景变成会变成紫色
      this.setData({
        userAnswer: currUserAnswer,
      })
    },
    toggleExplanation: function(event) {
      // 获取当前被点击的选项的编号
      const optionIndex = event.currentTarget.dataset.index;
      // 修改 explanationVisible 数组中的某一项的值
      const newExplanationVisible = this.data.explanationVisible.map((visible, index) => {
          return index === optionIndex ? !visible : visible;
      });
  
      //修改 buttonText 的值
      let newButtonText = '';
      if(this.data.explanationVisible[optionIndex]) {
          newButtonText = '点击选项展开解释';
      } else {
          newButtonText = '点击选项关闭解释';
      }
      this.setData({
          explanationVisible: newExplanationVisible,
          buttonText: newButtonText
      });
    }

  }

})

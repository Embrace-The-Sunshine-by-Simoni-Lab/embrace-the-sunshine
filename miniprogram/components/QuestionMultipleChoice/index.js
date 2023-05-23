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
    userAnswer: [], // 当前用户的选择, 可以选择多个
    correctAnswer: [], // 当前问题的正确答案
    explanationVisible: [],
    buttonText: []
  },
  
  attached: function() {
    let questionLength = this.properties.option_info.options.length
    let initExplanationVisible = new Array(questionLength).fill(false);
    // 控制每个选项的开启和关闭解释
    let initExplainWord = new Array(questionLength).fill('关闭解释');

    this.setData({
      correctAnswer: this.properties.option_info.correctAnswer,
      explanationVisible: initExplanationVisible,
      userAnswer: this.properties.user_answer[this.properties.order],
      buttonText: initExplainWord
    })
  },

  methods: {
    clickOption(e) {
      let currUserAnswer = this.data.userAnswer
      // 如果当前的user_answer为-1的话(说明用户之前把所有的选项都取消了),那么重新给currUserAnswer定义一个Array
      if(currUserAnswer == -1) {
        let questionLength = this.properties.option_info.options.length
        currUserAnswer = new Array(questionLength).fill(-1);
      }
      // 当前用户所有题目的选择
      let updatedAnswerList = this.properties.user_answer
      // 当前用户所选答案的index
      let clickedIndex = e.target.dataset.index
      // 当前问题是第几个问题
      let currentQuestionOrder = this.properties.order
      // 检查 userAnswer 数组是否已经包含当前选项的编号
      if(currUserAnswer[clickedIndex] == 1) {
        // 如果当前选项已经被选了, 那么取消 
        currUserAnswer[clickedIndex] = -1
      } else {
        // 如果当前选项没有被选, 那么选择
        currUserAnswer[clickedIndex] = 1
      }
      //如果当前多选题所有选项都被取消, 那么把当前整个问题答案设置为-1,否则更新答案
      if (currUserAnswer.every(element => element === -1)) {
        currUserAnswer = -1
      } 
      updatedAnswerList[currentQuestionOrder] = currUserAnswer
      // 触发父组件传递过来clickOption方法
      this.triggerEvent('clickOption', updatedAnswerList)
      // 被点击到的选项背景变成会变成紫色
      this.setData({
        userAnswer: currUserAnswer,
      })
    },
    // 用户点击打开关闭选项中的解释
    toggleExplanation: function(event) {
      let currentExplainationLst = this.data.explanationVisible
      // 获取当前被点击的选项的编号
      const optionIndex = event.currentTarget.dataset.index;
      // 修改 explanationVisible 数组中的某一项的值
      const newExplanationVisible = this.data.explanationVisible.map((visible, index) => {
          return index === optionIndex ? !visible : visible;
      });
      //修改 buttonText list的值
      for (let i = 0; i < newExplanationVisible.length; i++) {
        if (newExplanationVisible[i]) {
          currentExplainationLst[i] = '展开解释';
        } else {
          currentExplainationLst[i] = '关闭解释';
        }
      }
      
      this.setData({
          explanationVisible: newExplanationVisible,
          buttonText: currentExplainationLst
      });
    }
  }
})

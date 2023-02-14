// components/QuestionSort/index.js
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
    question: {
      type: 'Sort',
      question: '请按照字母顺序对以下国家名称进行排序：',
      options: [
        { option_content: '美国' },
        { option_content: '俄罗斯' },
        { option_content: '中国' },
        { option_content: '日本' }
      ]
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})

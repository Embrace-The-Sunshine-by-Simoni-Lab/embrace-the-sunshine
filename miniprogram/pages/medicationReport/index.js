// pages/medicationReport/index.js
import * as echarts from '../../ec-canvas/echarts';

function initChart(canvas, width, height, dpr) {
  const chart = echarts.init(canvas, null, {
    width: width,
    height: height,
    devicePixelRatio: dpr // 像素
  });
  canvas.setChart(chart);

  var option = {
    // title: {
    //   show: true,
    //   text: '自测抑郁症风险等级'
    // },
    dataset: {
      source: [
        ['m1', 3],
        ['m2', 7],
        ['m3', 12],
        ['m4', 8],
        ['m5', 4],
        ['m6', 1]
      ]
    },

    tooltip: {
      show: true,
      showContent: true,
      trigger: 'axis',
      axisPointers: {
        type: 'cross'
      }
    },

    xAxis: {
      type: 'category',
      boundaryGap: false,
      axisLine: {
        show: true
      },
      axisLabel: {
        show: true,
        interval: 0
      },
      axisTick: {
        inside: true,
        length: 6,
        interval: 0
      },
      splitNumber: 0,
      // data: ['01.30-02.05', '02.06-02.12', '02.13-02.20', '02.21-02.28'],
      // data: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
      // data: ['1', '2', '3', '4', '5', '6'],

      // data: ['2022/10/01', '2022/10/02','2022/10/03', '2022/10/04','2022/10/05', '2022/10/06', '2022/10/07', '2022/10/08', '2022/10/09']
    },

    yAxis: {
      x: 'center',
      type: 'value',
      axisLine: {show: false},
      axisTick: {show: false},
      axisLabel: {show: false},
    },

    series: [
      // {
      //   name: 'Mood Score',
      //   type: 'line',
      //   smooth: false,
      //   data: [3, 7, 10, 8, 12, 2, 1, 5, 9]
      // }
      {type: 'line'}
    ]
  };

  chart.setOption(option);
  return chart;
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    ec: {
      onInit: initChart
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})
// pages/moodTrackingReport/index.js
import * as echarts from '../../ec-canvas/echarts';
// 6 个数据点
let nearHalfYear = [['m1', 3], ['m2', 7], ['m3', 12], ['m4', 8], ['m5', 4], ['m6', 1]]
// 12 个数据点
let nearWholeYear = [['m1', 3], ['m2', 7], ['m3', 12], ['m4', 8], ['m5', 4], ['m6', 1], ['m7', 8], ['m8', 4], ['m9', 1], ['m10', 8], ['m11', 4], ['m12', 1]]
// 7 个数据点
let nearOneWeek = [['d1', 3], ['d2', 7], ['d3', 12], ['d4', 8], ['d5', 4], ['d6', 3], ['d7', 6]]
// 4 个数据点
let nearOneMonth = [['w1', 3], ['w2', 7], ['w3', 12]]
const query = wx.createQuerySelector;
var chart = null;
function initChart(canvas, width, height, dpr) {
  chart = echarts.init(canvas, null, {
    width: width,
    height: height,
    devicePixelRatio: dpr // 像素
  });
  // chart.showLoading();
  canvas.setChart(chart);

  var option = {

    // title: {
    //   show: true,
    //   text: 'Loading'
    // },

    dataset: {
      source: [
        ['m1', 3],
        ['m2', 7],
        ['m3', 12],
        ['m4', 8],
        ['m5', 4],
        ['m6', 1],
        ['m7', 3]
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
      //   data: [3, 7, 10, 8, 12, 2, 1, 5, 9],
      //   tooltip: {
      //     show: true,
      //     showContent: true,
      //     trigger: 'axis',
      //     axisPointers: {
      //       type: 'cross'
      //     }
      //   }
      // }

      {
        type: 'line'
      }
    ]
  };

  chart.setOption(option);
  return chart;
}

// chart.setOption({
//   dataset: {
//     source: [
//       ['m1', 3],
//       ['m2', 7],
//       ['m3', 12],
//       ['m4', 8],
//       ['m5', 4],
//       ['m6', 1],
//       ['m7', 1],
//     ]
//   },
// })


Page({

  /**
   * 页面的初始数据
   */
  data: {
    ec: {
      onInit: initChart
    },
    array: ['本周', '本月', '最近六个月', '最近一年'],
    index: 0,
    objectArray: [
      {
        id: 0,
        name: '本周'
      },
      {
        id: 1,
        name: '本月'
      },
      {
        id: 2,
        name: '最近六个月'
      },
      {
        id: 3,
        name: '最近一年'
      }
    ],

  },

  // touchStart: function() {
  //   console.log("touchStart function")
  // },

  // touchStart: function() {
  //   console.log("touchStart function")
  // },
  // touchStart: function() {
  //   console.log("touchStart function")
  // },
  // touchStart: function() {
  //   console.log("touchStart function")
  // },

  bindPickerChange: function(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      index: e.detail.value
    })
    chart = function initChart(canvas, width, height, dpr) {
      console.log("chart inside picker")
      chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: dpr // 像素
      });
      // chart.showLoading();
      canvas.setChart(chart);
    
      var option = {
    
        // title: {
        //   show: true,
        //   text: 'Loading'
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
          //   data: [3, 7, 10, 8, 12, 2, 1, 5, 9],
          //   tooltip: {
          //     show: true,
          //     showContent: true,
          //     trigger: 'axis',
          //     axisPointers: {
          //       type: 'cross'
          //     }
          //   }
          // }
    
          {
            type: 'line'
          }
        ]
      };
    
      chart.setOption(option);
      return chart;
    }
    // .setOption({
    //   console.log("query select success")
    //   dataset : {source: []}
    // })
    console.log("picker finish")
  },

  getData() {
    // wx.request(() => {
    //   chart.hideloading()
    //   chart.setOption({
    //     dataset: {
    //       source: [
    //         ['m1', 3],
    //         ['m2', 7],
    //         ['m3', 12],
    //         ['m4', 8],
    //         ['m5', 4],
    //         ['m6', 1]
    //       ]
    //     }    
    //   })
    // });
  },
  
  onReady(){
    this.getData();
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  // onReady() {

  // },

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
// import * as ucharts from '@qiun/ucharts/';
import uCharts from '../../miniprogram_npm/@qiun/ucharts/index.js';

const app = getApp()
var uChartsInstance = {};

var uChartsInstance = {};
Page({
  data: {
    cWidth: 340,
    cHeight: 220,
    pixelRatio: 2,
    userScoreValue: '',
    userScoreType: '情绪状况',
    userScoreColor: '#7B7B7B',
    oneMonth: true,
    threeMonth: false,
    sixMonth: false,
    timePeriodText: '近一月',
    timePeirodDate: '02月20日-02月27日',
    res_index: 0
  },
  onReady() {
    let cWidth = this.data.cWidth;
    let cHeight = this.data.cHeight;
    this.setData({ cWidth, cHeight });
    this.getServerData();
  },
  getServerData() {
    //模拟从服务器获取数据时的延时
    setTimeout(() => {
      //模拟服务器返回数据，如果数据格式和标准格式不同，需自行按下面的格式拼接
      // let res = {
      //   // categories: [],
      //   categories: ["01.30-02.05","02.06-02.12","02.13-02.19","02.20-02.27","02.28-03.04","03.05-03.11"],
      //   series: [
      //     {
      //       // data: [],
      //       data: [1,0,2,3,4,4],

      //     },
      //   ]
      // };


      let res_pre = [
        // 近1月
        { categories: ["01.30-02.05","02.06-02.12","02.13-02.19","02.20-02.27","02.28-03.04","03.05-03.11"],
          series: [{data: [1,0,2,3,4,4]}]},

        // 近3月
        { categories: ["01.30-02.05","02.06-02.12","02.13-02.19","02.20-02.27","02.28-03.04","03.05-03.11"],
          series: [{data: [6,7,9,12,4,3]}]},
        
        // 近6月
        { categories: ["01.30-02.05","02.06-02.12","02.13-02.19","02.20-02.27","02.28-03.04","03.05-03.11"],
          series: [{data: [8,0,12,3,14,4]}]},
      ];

      var res = res_pre[0]
      this.drawCharts('jkyWEuYZpJWLcfbnKkmySDRjQLEpHsIG', res);
    }, 500);
  },
  drawCharts(id,data){
    const ctx = wx.createCanvasContext(id, this);
    uChartsInstance[id] = new uCharts({
        type: "line",
        context: ctx,
        width: this.data.cWidth,
        height: this.data.cHeight,
        categories: data.categories,
        series: data.series,
        animation: true,
        background: "#FFFFFF",
        color: ["#4D50A4","#91CB74","#FAC858","#EE6666","#73C0DE","#3CA272","#FC8452","#9A60B4","#ea7ccc"],
        padding: [5,5,5,5],
        enableScroll: true,
        legend: {},
        xAxis: {
          disableGrid: true,
          scrollShow: true,
          itemCount: 4,
          fontSize: 11
        },
        yAxis: {
          disabled: true,
          gridType: "dash",
          dashLength: 2,
        },
        extra: {
          line: {
            type: "straight",
            width: 2
          },
          tooltip: {
            showBox: false,
          }
        },
        legend: {
          show: false
        }
      });
  },

  touchstart(e){
    uChartsInstance[e.target.id].scrollStart(e);
  },
  touchmove(e){
    uChartsInstance[e.target.id].scroll(e);
  },
  touchend(e){
    uChartsInstance[e.target.id].scrollEnd(e);
    uChartsInstance[e.target.id].touchLegend(e);
    uChartsInstance[e.target.id].showToolTip(e);
    var tapObj = uChartsInstance[e.target.id].getCurrentDataIndex(e);
    console.log(tapObj)
    console.log(this.data.userScoreInfo)
    if (tapObj.index != -1) {
      this.setData({
        userScoreValue: this.data.userScoreInfo.scoreValue[tapObj.index],
        userScoreType: this.data.userScoreInfo.scoreType[tapObj.index],
        userScoreColor: this.data.userScoreInfo.scoreColor[tapObj.index]
      })
      
    }
    
  },

  onLoad(options) {
    console.log(this.data)
    console.log("global date: " + app.globalData.userData.mood_track.mood_date)
    console.log("global score: "  + app.globalData.userData.mood_track.mood_score)
    console.log(this.getUserScoreDateRange())
    console.log(this.getUserScoreLevel())
    this.setData({
      res_index: 0
    })
  },

  chooseOneMonth() {
    this.setData(
      {
        oneMonth: true,
        threeMonth: false,
        sixMonth: false,
        timePeriodText: '近一月',
        res_index: 0
      }
    )
    this.drawCharts('jkyWEuYZpJWLcfbnKkmySDRjQLEpHsIG', res);

  },

  chooseThreeMonth() {
    this.setData(
      {
        oneMonth: false,
        threeMonth: true,
        sixMonth: false,
        timePeriodText: '近三月',
        res_index: 1
      }
    ),
    this.drawCharts('jkyWEuYZpJWLcfbnKkmySDRjQLEpHsIG', res);
  },

  chooseSixMonth() {
    this.setData(
      {
        oneMonth: false,
        threeMonth: false,
        sixMonth: true,
        timePeriodText: '近六月',
        res_index: 2,
      }
    )
    this.drawCharts('jkyWEuYZpJWLcfbnKkmySDRjQLEpHsIG', res);
  },
})

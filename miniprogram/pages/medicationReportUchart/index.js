// import * as ucharts from '@qiun/ucharts/';
import uCharts from '../../miniprogram_npm/@qiun/ucharts/index.js';

const app = getApp()
var uChartsInstance = {};

Page({
  data: {
    timePeriod: '近1月',
    cWidth: 700,
    cHeight: 500,
    pixelRatio: 2,
    userScoreValue: '',
    userScoreType: '情绪状况',
    userScoreColor: '',
    // chartData: {},
    // animation: false,
    //您可以通过修改 config-ucharts.js 文件中下标为 ['line'] 的节点来配置全局默认参数，如都是默认参数，此处可以不传 opts
    //实际应用过程中 opts 只需传入与全局默认参数中不一致的【某一个属性】即可实现同类型的图表显示不同的样式，达到页面简洁的需求。
    // opts: {
    //     color: ["#4D50A4"],
    //     padding: [15,10,0,15],
    //     enableScroll: true,
    //     dataPointShapeType: "hollow",
    //     legend: {
    //       show: false
    //     },
    //     xAxis: {
    //       disableGrid: true,
    //       scrollShow: true,
    //       itemCount: 1
    //     },
    //     yAxis: {
    //       disabled: false,
    //       gridType: "dash",
    //       dashLength: 2
    //     },
    //     extra: {
    //       line: {
    //         type: "straight",
    //         width: 2
    //       },
    //       tooltip: {
    //         showBox: true
    //       }
    //     }
    // }
  },

  getServerData() {
  //模拟从服务器获取数据时的延时
    setTimeout(() => {
      //模拟服务器返回数据，如果数据格式和标准格式不同，需自行按下面的格式拼接
      var scoreData = this.getUserScoreLevel();
      console.log(scoreData)
      let res = {
          categories: this.getUserScoreDateRange(),
          // 下列一行为测试数据，当数据个数足够多时，scroll效果才出现
          // categories: [1, 2, 3, 4, 5, 6, 7, 8],
          series: [
            {
              name: '测试分数',
              data: scoreData,
              // data: [3, 7, 14, 1, 0, 20, 3, 27, 14],
            }
          ]
        };
        // this.setTimeCategory();
        // this.setData({ chartData: JSON.parse(JSON.stringify(res)) });
         this.drawCharts('UxMBnLLjpWIojdTydNQkyeLutcXoQYEw', res);
    }, 500);
  },

  // 非2d canvas 方法
  // drawCharts(id, data){
  //   const ctx = wx.createCanvasContext(id, this);
  //   uChartsInstance[id] = new uCharts({
  //       type: "line",
  //       context: ctx,
  //       legend: {
  //         show: false
  //       },
  //       width: this.data.cWidth,
  //       height: this.data.cHeight,
  //       categories: data.categories,
  //       series: data.series,
  //       animation: true,
  //       background: "#FFFFFF",
  //       enableScroll: true,
  //       color:  ["#4D50A4"],
  //       padding: [15,10,0,15],
  //       dataPointShapeType: "hollow",
  //       xAxis: {
  //         disableGrid: true,
  //         scrollShow: true,
  //         scrollColor: "#4D50A4",
  //         itemCount: 2
  //       },
  //       yAxis: {
  //         gridType: "dash",
  //         dashLength: 2
  //       },
  //       extra: {
  //         line: {
  //           type: "straight",
  //           width: 2
  //         }
  //       }
  //     });
  // },

  // 2d canvas 方法
  drawCharts(id,data){
    const query = wx.createSelectorQuery().in(this);
    query.select('#' + id).fields({ node: true, size: true }).exec(res => {
      if (res[0]) {
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        canvas.width = res[0].width * this.data.pixelRatio;
        canvas.height = res[0].height * this.data.pixelRatio;
        uChartsInstance[id] = new uCharts({
          type: "line",
          context: ctx,
          width: this.data.cWidth * this.data.pixelRatio,
          height: this.data.cHeight * this.data.pixelRatio,
          categories: data.categories,
          series: data.series,
          pixelRatio: this.data.pixelRatio,
          dataLabel: false,
          animation: true,
          background: "#FFFFFF",
          color:  ["#4D50A4"],
          padding: [15,10,0,15],
          enableScroll: true,
          legend: {
            show: false
          },
          xAxis: {
            disableGrid: true,
            scrollShow: true,
            itemCount: 2
          },
          yAxis: {
            gridType: "dash",
            dashLength: 2,
            disabled: false,
            data: {
              max: 27,
              min: 0,
              position: "right"
            }
          },
          extra: {
            line: {
              type: "straight",
              width: 2
            }
          },
          tooltip: {
            showBox: false
          }
        });
      }else{
        console.error("[uCharts]: 未获取到 context");
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


  setTimeCategory() {
    var date = new Date();
    console.log("current month: " + date.getMonth())
  },

  createMedi_taken_classified_by_years(medi_taken) {
    let _medi_taken_classified_by_years = {};
    for (let i = 0; i < medi_taken.length; i++) { 
      let currDate = new Date(medi_taken[i]);
      if (_medi_taken_classified_by_years[currDate.getFullYear()] == null) {
        _medi_taken_classified_by_years[currDate.getFullYear()] = [];
      }
      _medi_taken_classified_by_years[currDate.getFullYear()].push(currDate);
    };
    return _medi_taken_classified_by_years;
  },
  
  // (from v2 index.js)
  reconstruct(date) {
    let date_split = date.split('-')
    let date_month = date_split[0]
    let date_date = date_split[1]
    return date_month + "." + date_date
  },

  // 给line chart重新塑造日期(from v2 index.js)
  modifyDateList(lst) {
    let alter_lst = []
    for(let i = 0; i < lst.length; i++) {
      // format start date
      let count = lst[i].count;
      let start = lst[i].start;
      let new_start = this.reconstruct(start)
      let end = lst[i].end;
      let new_end = this.reconstruct(end)
      // let color = this.addBarColor(count)
      // let obj = {"start": new_start, "end": new_end, "count": count, "color": color, "opacity": 0.5}
      let obj = {"start": new_start, "end": new_end}
      alter_lst.push(obj)
    }
    this.setData({
      analyticsData: alter_lst
    })
  },

  getUserScoreDateRange() {
    var userScoreDate = app.globalData.userData.mood_track.mood_date
    this.setData({"medi_taken_classified_by_years": this.createMedi_taken_classified_by_years(userScoreDate)})
    this.prepareAnalyticsData()
    this.modifyDateList(this.data.analyticsData)
    var userAnalyticsData = this.data.analyticsData
    var userScoreDateRange = []
    userAnalyticsData.forEach((range) => {
      userScoreDateRange.push(range.start+ "-" + range.end)
    })
    userScoreDateRange.push("10.24-10.30")
    userScoreDateRange.push("                                                              ")
    console.log(userScoreDateRange)
    return userScoreDateRange;
  },

// 把所有的日期按照周排列好 (Jara's func)
  prepareAnalyticsData() { 
    let today = new Date();
    let _analyticsData = [];
    let _weekNumToRange = {};
    let _weekNumToCount = {};
    let this_year_medi_taken = this.data.medi_taken_classified_by_years[today.getFullYear()];
    if (this_year_medi_taken.length === 0) {
      return;
    }
    // generate week range from whole year
    for (let i = 1; i <= 53; i++) {
      _weekNumToRange[i] = this.getDateRangeOfWeek(i);
    }
    // highest week number and lowest week number
    let HighestDate = new Date(this_year_medi_taken[0]);
    let HighestWeekNum = this.getWeekNum(HighestDate);
    let LowestDate = new Date(this_year_medi_taken[this_year_medi_taken.length - 1]);
    let LowestWeekNum = this.getWeekNum(LowestDate);
    for (let i = 0; i < this_year_medi_taken.length; i++) {
      let currDate = new Date(this_year_medi_taken[i]);
      let curr_weekNum = this.getWeekNum(currDate);
      if (_weekNumToCount[curr_weekNum] == null) {
        _weekNumToCount[curr_weekNum] = 0;
      }
      _weekNumToCount[curr_weekNum] += 1;
    }
    // generate analytics data
    for (let i = LowestWeekNum; i <= HighestWeekNum; i++) {
      let analytics_data_element = {};
      analytics_data_element.start = _weekNumToRange[i][0];
      analytics_data_element.end = _weekNumToRange[i][1];
      if (_weekNumToCount[i] == null || _weekNumToCount[i] == 0) {
        analytics_data_element.count = 0;
      } else {
        analytics_data_element.count = _weekNumToCount[i];
      }
      _analyticsData.push(analytics_data_element);
    }
    this.setData({
      analyticsData: _analyticsData
    });
  },

  getDateRangeOfWeek(weekNo){
    var d1, numOfdaysPastSinceLastMonday, rangeIsFrom, rangeIsTo;
    d1 = new Date();
    numOfdaysPastSinceLastMonday = d1.getDay() - 1;
    d1.setDate(d1.getDate() - numOfdaysPastSinceLastMonday);
    d1.setDate(d1.getDate() + (7 * (weekNo - this.getWeekNum(d1))));
    rangeIsFrom = (d1.getMonth() + 1) + "-" + d1.getDate() + "-" + d1.getFullYear();
    d1.setDate(d1.getDate() + 6);
    rangeIsTo = (d1.getMonth() + 1) + "-" + d1.getDate() + "-" + d1.getFullYear() ;
    return [rangeIsFrom, rangeIsTo];
  },

  getWeekNum(InputDate) {
    var DATE = new Date(InputDate.getTime());
    DATE.setHours(0, 0, 0, 0);
    // Thursday in current week decides the year.
    DATE.setDate(DATE.getDate() + 3 - (DATE.getDay() + 6) % 7);
    // January 4 is always in week 1.
    var week1 = new Date(DATE.getFullYear(), 0, 4);
    // Adjust to Thursday in week 1 and count number of weeks from date to week1.
    return 1 + Math.round(((DATE.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  },

  getUserScoreLevel() {
    var userScoreValue = app.globalData.userData.mood_track.mood_score
    var currLevel = ""
    var currCategory = ""
    var currType = ""
    var typeColor = ""
    var scoreLevel = []
    var scoreCategory = []
    var scoreType = []
    var scoreValue = []
    var scoreColor = []
    for(var i = userScoreValue.length-1; i >= 0 ; i--){
      var score = userScoreValue[i]
      console.log(score)
      if(score <= 4) {
        currLevel = "1"
        currCategory = "mini-depress"
        currType = "情绪正常"
        typeColor= "#4DA470"
      } else if (score <= 9) {
        currLevel = "2"
        currCategory = "mild-depress"
        currType = "轻度抑郁"
        typeColor = "#FFC300"
      } else if (score <= 14) {
        currLevel = "3"
        currCategory = "moder-depress"
        currType = "中度抑郁"
        typeColor = "pink"
      } else if (score <= 19) {
        currLevel = "4"
        currCategory = "moder-severe-depress"
        currType = "中重度抑郁"
        typeColor = "red"
      } else {
        currLevel = "5"
        currCategory = "severe-depress"
        currType = "重度抑郁"
        typeColor = "#FA5151"
      }
      scoreValue.push(score);
      scoreLevel.push(currLevel);
      scoreCategory.push(currCategory);
      scoreType.push(currType);
      scoreColor.push(typeColor)
    }
    var userScoreInfo = {}
    userScoreInfo["scoreValue"] = scoreValue;
    userScoreInfo["scoreLevel"] = scoreLevel,
    userScoreInfo["scoreCategory"] = scoreCategory,
    userScoreInfo["scoreType"] = scoreType,
    userScoreInfo['scoreColor'] = scoreColor,
    this.setData({"userScoreInfo": userScoreInfo})
    return userScoreInfo.scoreValue;
  },
  
  // _tap(e) {
  //   //方法一：格式化ToolTip
  //   uChartsInstance[e.target.id].showToolTip(e, {
  //     formatter: (item, category, index, opts) => {
  //       return item.name + ":" + item.data;
  //     }
  //   });
    //方法二：自定义ToolTip
    // uChartsInstance[e.target.id].showToolTip(e, {
    //   idnex: 2,
    //   offset: {x: 10, y: 10},//不传offset显示位置为点击的坐标
    //   textList: [
    //       {text: "2022年销量", color: null},
    //       {text: "大米：100万斤", color: "#1890FF"},
    //       {text: "豆油：10吨", color: "#91CB74"}
    //   ]
    // });
  // },

    // 切换记录和分析模式
    changeTimePeriod: function(event) {
      this.setData({
        timePeriod: '近1月'
      })
    },
  

  methods: {
    // getServerData() {
    //   //模拟从服务器获取数据时的延时
    //   setTimeout(() => {
    //     //模拟服务器返回数据，如果数据格式和标准格式不同，需自行按下面的格式拼接
    //     let res = {
    //         categories: ["2016","2017","2018","2019","2020","2021"],
    //         series: [
    //           {
    //             name: "成交量A",
    //             data: [35,8,25,37,4,20]
    //           },
    //           {
    //             name: "成交量B",
    //             data: [70,40,65,100,44,68]
    //           },
    //           {
    //             name: "成交量C",
    //             data: [100,80,95,150,112,132]
    //           }
    //         ]
    //       };
    //       this.setData({ chartData: JSON.parse(JSON.stringify(res)) });
    //   }, 500);
    // },
  },

  // bindPickerChange: function(e) {
  //   console.log('picker发送选择改变，携带值为', e.detail.value)
  //   this.setData({
  //     index: e.detail.value
  //   })
  //   console.log("picker finish")
  // },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log(this.data)
    console.log("global date: " + app.globalData.userData.mood_track.mood_date)
    console.log("global score: "  + app.globalData.userData.mood_track.mood_score)
    console.log(this.getUserScoreDateRange())
    console.log(this.getUserScoreLevel())
    // this.setData({
    //   userScoreValue: 5,
    //   userScoreType: this.data.userScoreInfo.userScoreType[0],
    //   userScoreColor: this.data.userScoreInfo.userScoreColor[0],
    // })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },
  
  onReady() {
    //这里的第一个 750 对应 css .charts 的 width
    const cWidth = 750 / 750 * wx.getSystemInfoSync().windowWidth;
    //这里的 500 对应 css .charts 的 height
    const cHeight = 500 / 750 * wx.getSystemInfoSync().windowWidth;
    const pixelRatio = wx.getSystemInfoSync().pixelRatio;
    this.setData({ cWidth, cHeight, pixelRatio });
    this.getServerData();
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

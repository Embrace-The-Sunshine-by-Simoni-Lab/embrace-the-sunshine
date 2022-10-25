// import * as ucharts from '@qiun/ucharts/';
// import uCharts from '../../miniprogram_npm/@qiun/ucharts/index.js';

const app = getApp()

Page({
  data: {
    chartData: {},
    //您可以通过修改 config-ucharts.js 文件中下标为 ['line'] 的节点来配置全局默认参数，如都是默认参数，此处可以不传 opts
    //实际应用过程中 opts 只需传入与全局默认参数中不一致的【某一个属性】即可实现同类型的图表显示不同的样式，达到页面简洁的需求。
    opts: {
        color: ["#1890FF","#91CB74","#FAC858","#EE6666","#73C0DE","#3CA272","#FC8452","#9A60B4","#ea7ccc"],
        padding: [15,10,0,15],
        xAxis: {
          disableGrid: true
        },
        yAxis: {
          disabled: false,
          gridType: "dash",
          dashLength: 2
        },
        extra: {
          line: {
            type: "straight",
            width: 2
          },
          tooltip: {
            showBox: false
          }
        }
      }
  },

  getServerData() {
  //模拟从服务器获取数据时的延时
    setTimeout(() => {
      //模拟服务器返回数据，如果数据格式和标准格式不同，需自行按下面的格式拼接
      let res = {
          // categories: this.getUserScoreDate(),
          categories: this.getUserScoreDate(),
          series: [
            {
              name: 'Score',
              data: this.data.userScoreInfo.scoreLevel
            }
          ]
        };
        this.setTimeCategory();
        this.setData({ chartData: JSON.parse(JSON.stringify(res)) });
    }, 500);
  },

  setTimeCategory() {
    var date = new Date();
    var currentMonth = 0;
    console.log("current month:" + date.getMonth())
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
    
  getUserScoreDate() {
    var userScoreDate = app.globalData.userData.mood_track.mood_date
    this.setData({"medi_taken_classified_by_years": this.createMedi_taken_classified_by_years(userScoreDate)})
    var userScoreWeek = 
    return userScoreDate
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
    console.log(userScoreValue)
    var currLevel = ""
    var currCategory = ""
    var currType = ""
    var scoreLevel = []
    var scoreCategory = []
    var scoreType = []
    userScoreValue.forEach(score => {
      if(score <= 4) {
        currLevel = "1"
        currCategory = "mini-depress"
        currType = ""
      } else if (score <= 9) {
        currLevel = "2"
        currCategory = "mild-depress"
        currType = "轻度抑郁"
      } else if (score <= 14) {
        currLevel = "3"
        currCategory = "moder-depress"
        currType = "中度抑郁"
      } else if (score <= 19) {
        currLevel = "4"
        currCategory = "moder-severe-depress"
        currType = "中重度抑郁"
      } else {
        currLevel = "5"
        currCategory = "severe-depress"
        currType = "重度抑郁"
      }
      scoreLevel.push(currLevel);
      scoreCategory.push(currCategory);
      scoreType.push(currType);
    })
    var userScoreInfo = {}
    userScoreInfo["scoreLevel"] = scoreLevel,
    userScoreInfo["scoreCategory"] = scoreCategory,
    userScoreInfo["scoreType"] = scoreType
  
    console.log(userScoreInfo);
    this.setData({"userScoreInfo": userScoreInfo});
    return scoreLevel
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
    console.log(this.getUserScoreDate())
    console.log(this.getUserScoreLevel())
    this.prepareAnalyticsData()
    console.log(this.data.medi_taken_classified_by_years)
    // console.log(analyticsData)

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },
  
  onReady() {
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

import uCharts from '../../npm/@qiun/ucharts/index';

const app = getApp()
var uChartsInstance = {};

Page({
  data: {
    cWidth: 310,
    cHeight: 190,
    // ******************* userScoreInfo *******************
    userScoreValue: '',
    userScoreType: '情绪状况',
    userScoreColor: '#7B7B7B',
    userMoodDescription: '',
    userMoodTitle: '',
    // ******************* time period buttons *******************
    oneMonth: '',
    threeMonth: '',
    sixMonth: '',
    timePeriodText: '',
    timePeriodDate: '',
    OneMonthMoodTrackData: {},
    ThreeMonthMoodTrackData: {},
    SixMonthMoodTrackData: {},
    // ******************* podcast scroll *******************
    mediaList: [],
    swiperPosition: 0, // 内容滚动的进度
    slideWidth: 270,  // 滚动条默认长度
    currentClickedBar: 0,
    lastClickBar: 0,
    left: 0,
  },

  onLoad(options) {
    this.getUserScoreLevel();
    this.getUserScoreDate();
    var onLoadData, onLoadDataRange, onLoadScoreValue, onLoadScoreType, onLoadScoreColor, onLoadMoodTitle, onLoadMoodDescription;
    if (this.data.OneMonthMoodTrackData.categories.length > 0) {
      onLoadData = this.data.OneMonthMoodTrackData
      onLoadDataRange = this.dateFormat("oneMonth")
      onLoadScoreValue = this.data.userScoreInfo.scoreValue[this.data.userScoreInfo.scoreValue.length-1],
      onLoadScoreType = this.data.userScoreInfo.scoreType[this.data.userScoreInfo.scoreType.length-1],
      onLoadScoreColor = this.data.userScoreInfo.scoreColor[this.data.userScoreInfo.scoreColor.length-1]
      onLoadMoodTitle = this.data.userScoreInfo.moodTitle[this.data.userScoreInfo.scoreColor.length-1],
      onLoadMoodDescription = this.data.userScoreInfo.moodDescription[this.data.userScoreInfo.scoreColor.length-1]
    } else {
      onLoadData = []
      onLoadDataRange = ['近30天无数据']
    }
    console.log("onLoadDataRange", onLoadDataRange)
    console.log("this.data.userScoreInfo", this.data.userScoreInfo)
    this.setData({
      oneMonth: true,
      threeMonth: false,
      sixMonth: false,
      timePeriodText: '近30天',
      timePeriodDate: onLoadDataRange,
      userScoreValue: onLoadScoreValue,
      userScoreType: onLoadScoreType,
      userScoreColor: onLoadScoreColor,
      userMoodTitle: onLoadMoodTitle,
      userMoodDescription: onLoadMoodDescription,
      mediaList: [
        {id: 0, title: "认识情绪", img: "cloud://cloud1-2gjzvf7qc03c5783.636c-cloud1-2gjzvf7qc03c5783-1306062016/images/podcast/podcast1/standard.svg"},
        {id: 1, title: "承受痛苦", img: "cloud://cloud1-2gjzvf7qc03c5783.636c-cloud1-2gjzvf7qc03c5783-1306062016/images/podcast/podcast2/standard.svg"},
        {id: 2, title: "全然接受现实", img: "cloud://cloud1-2gjzvf7qc03c5783.636c-cloud1-2gjzvf7qc03c5783-1306062016/images/podcast/podcast3/standar.svg"},
        // {id: 3, title: "情绪管理", img: "cloud://cloud1-2gjzvf7qc03c5783.636c-cloud1-2gjzvf7qc03c5783-1306062016/images/podcast/podcast4/standard.svg"},
        // {id: 4, title: "情绪总结篇", img: "cloud://cloud1-2gjzvf7qc03c5783.636c-cloud1-2gjzvf7qc03c5783-1306062016/images/podcast/podcast4/standard.svg"},
      ]
    })
    this.drawCharts('jkyWEuYZpJWLcfbnKkmySDRjQLEpHsIG', onLoadData);
  },

  onReady() {
    let cWidth = this.data.cWidth;
    let cHeight = this.data.cHeight;
    this.setData({ cWidth, cHeight });
  },

  getUserScoreDate() {
    let userScoreDate = app.globalData.userData.mood_track.mood_date
    let userScore = app.globalData.userData.mood_track.mood_score
    this.setData({
      userScoreDate: userScoreDate,
      userScore: userScore
    })
    this.prepareClassifiedData()
    console.log(this.data.OneMonthMoodTrackData);
    console.log(this.data.ThreeMonthMoodTrackData);
    console.log(this.data.SixMonthMoodTrackData);
  },

  dateDiffInDays(date1, date2) {
    return Math.abs((date1 - date2) / (1000 * 60 * 60 * 24));
  },

  prepareClassifiedData() {
    // latest one month
    let today = new Date();
    let userScoreDate = this.data.userScoreDate;
    let userScore = this.data.userScore;
    let oneMonthScoreDate = [];
    let oneMonthScore = [];
    // console.log(userScoreDate);
    // console.log(userScore);
    
    for (let i = 0; i < userScoreDate.length; i++) {
      let curr_date = userScoreDate[i];
      let curr_score = userScore[i];
      let dateDiff = this.dateDiffInDays(today, new Date(curr_date));
      if (dateDiff < 30) {
        oneMonthScoreDate.unshift(curr_date);
        oneMonthScore.unshift(curr_score);
      } else {
        break;
      }
    }
    let OneMonth_data = this.prepareAnalyticsData(oneMonthScoreDate, oneMonthScore);
    this.setData({
      OneMonthMoodTrackData: OneMonth_data
    });

    let ThreeMonthScoreDate = [];
    let ThreeMonthScore = [];
    for (let i = 0; i < userScoreDate.length; i++) {
      let curr_date = userScoreDate[i];
      let curr_score = userScore[i];
      let dateDiff = this.dateDiffInDays(today, new Date(curr_date));
      if (dateDiff < 90) {
        ThreeMonthScoreDate.unshift(curr_date);
        ThreeMonthScore.unshift(curr_score);
      } else {
        break;
      }
    }
    let ThreeMonth_data = this.prepareAnalyticsData(ThreeMonthScoreDate, ThreeMonthScore);
    this.setData({
      ThreeMonthMoodTrackData: ThreeMonth_data
    });

    let SixMonthScoreDate = [];
    let SixMonthScore = [];
    for (let i = 0; i < userScoreDate.length; i++) {
      let curr_date = userScoreDate[i];
      let curr_score = userScore[i];
      let dateDiff = this.dateDiffInDays(today, new Date(curr_date));
      if (dateDiff < 180) {
        SixMonthScoreDate.unshift(curr_date);
        SixMonthScore.unshift(curr_score);
      } else {
        break;
      }
    }
    // console.log(SixMonthScoreDate);
    let SixMonth_data = this.prepareAnalyticsData(SixMonthScoreDate, SixMonthScore);
    this.setData({
      SixMonthMoodTrackData: SixMonth_data
    });
  },

  // return object for line chart
  prepareAnalyticsData(userScoreDate, userScore) {
    let res = {
      categories: [],
      series: [
        {
          data: [],
        },
      ]
    };
    if (userScoreDate.length === 0) {
      return res;
    }

    let categories = []
    for (let i = 0; i < userScoreDate.length; i++) {
      categories.push(this.reformatDate(new Date(userScoreDate[i])));
    }

    res.categories = categories;
    res.series[0].data = userScore;
    return res;
  },

  reformatDate(d) {
    let month = d.getMonth() + 1;
    let date = d.getDate();
    return ((month < 10) ? "0": "") + month + "." + ((date < 10) ? "0": "") + date;
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

  drawCharts(id, data){
    console.log("data passed to drawCharts", data)
    if(data == undefined || data.length == 0 || data.categories.length == 0) {
      data = {
        "categories": ["", "", "", "", "", "", "", "", ""],
        "series": []
      }
    }
    const ctx = wx.createCanvasContext(id, this);
    uChartsInstance[id] = new uCharts({
        type: "line",
        context: ctx,
        width: this.data.cWidth,
        height: this.data.cHeight,
        categories: data.categories,
        series: data.series,
        dataLabel: false,
        animation: false,
        background: "#FFFFFF",
        color: ["#4D50A4","#91CB74","#FAC858","#EE6666","#73C0DE","#3CA272","#FC8452","#9A60B4","#ea7ccc"],
        padding: [5,5,5,5],
        enableScroll: true,
        legend: {},
        xAxis: {
          disableGrid: true,
          scrollShow: true,
          itemCount: 5,
          fontSize: 14
        },
        yAxis: {
          disabled: true,
          gridType: "dash",
          dashLength: 4,
          disableGrid: true,
          splitNumber: 5,
          data: [{
            max: 27,
            min: 0,
          }]

        },
        legend: {
          show: false
        },
        extra: {
          line: {
            type: "straight",
            width: 1.5,
          },
          tooltip: {
            showBox: false,
          },
          markLine: {
            type: 'dash',
            data: [
              {
                showLabel: false,
                value: 4,
                labelOffsetX: 20,
                lineColor: '#46BA74'

              },
              {
                showLabel: false,
                value: 9,
                labelOffsetX: 20,
                lineColor: '#91D300'

              },
              {
                showLabel: false,
                value: 14,
                labelOffsetX: 20,
                lineColor: '#FFC300'

              },
              {
                showLabel: false,
                value: 19,
                labelOffsetX: 20,
                lineColor: '#F48657'

              },
              {
                showLabel: false,
                value: 27,
                labelOffsetX: 20,
                lineColor: '#FA5151'
              },
            ]
          },
        },
      });
  },

  // ['#46BA74', '#91D300', '#FFC300', '#F48657', '#FA5151']
  getUserScoreLevel() {
    var userScoreValue = app.globalData.userData.mood_track.mood_score
    var currLevel = ""
    var currCategory = ""
    var currType = ""
    var typeColor = ""
    var title = ""
    var description = ""
    var scoreLevel = []
    var scoreCategory = []
    var scoreType = []
    var scoreValue = []
    var scoreColor = []
    var moodTitle = []
    var moodDescription= []
    for(var i = 0; i < userScoreValue.length; i++){
      var score = userScoreValue[i]
      if(score <= 4) {
        currLevel = "1"
        currCategory = "mini-depress"
        currType = "情绪正常"
        typeColor = '#46BA74'
        title = "不错 😀";
        description = "太棒了～您的情绪状态不错，看来您最近有在努力地调节情绪，请继续加油，阳光和我们一直在！";  
      } else if (score <= 9) {
        currLevel = "2"
        currCategory = "mild-depress"
        currType = "轻度抑郁"
        typeColor = '#91D300'
        title = "不错 😊";
        description = "看来您最近的情绪状态有些波动，请尝试使用播客里讲到的技巧来管理情绪～加油，阳光和我们一直在！";  
      } else if (score <= 14) {
        currLevel = "3"
        currCategory = "moder-depress"
        currType = "中度抑郁"
        typeColor = '#FFC300'
        title = "还ok 🙂";
        description = "您的情绪状态有些波动，要是想找人聊聊的话，可以随时发消息给我们～如果您的状态持续几周都是如此，建议您跟我们的心理咨询师联系～阳光和我们一直在！";  
      } else if (score <= 19) {
        currLevel = "4"
        currCategory = "moder-severe-depress"
        currType = "高度抑郁"
        typeColor = '#F48657'
        title = "不太好 🥺";
        description = "您的情绪状态有些低落，请及时与我们的心理咨询师联系～阳光和我们一直在！";
      } else {
        currLevel = "5"
        currCategory = "severe-depress"
        currType = "重度抑郁"
        typeColor = '#FA5151'
        title = "不太好 🥺";
        description = "您的情绪状态有些低落，请及时联系我们的咨询师，我们会帮您做心理评估，并和您一起制定方案来改善情绪状态。阳光和我们一直在！";  
      }
      scoreValue.unshift(score);
      scoreLevel.unshift(currLevel);
      scoreCategory.unshift(currCategory);
      scoreType.unshift(currType);
      scoreColor.unshift(typeColor)
      moodTitle.unshift(title)
      moodDescription.unshift(description)
    }
    var userScoreInfo = {}
    userScoreInfo["scoreValue"] = scoreValue;
    userScoreInfo["scoreLevel"] = scoreLevel;
    userScoreInfo["scoreCategory"] = scoreCategory;
    userScoreInfo["scoreType"] = scoreType;
    userScoreInfo['scoreColor'] = scoreColor;
    userScoreInfo['moodTitle'] = moodTitle;
    userScoreInfo['moodDescription'] = moodDescription;
    this.setData({"userScoreInfo": userScoreInfo})
    // console.log(userScoreInfo);
    return userScoreInfo.scoreValue;
  },

  touchstart(e){
    uChartsInstance[e.target.id].scrollStart(e);
  },

  touchmove(e){
    uChartsInstance[e.target.id].scroll(e);
  },
  
  // clicking-dot logic is included
  touchend(e){
    uChartsInstance[e.target.id].scrollEnd(e);
    uChartsInstance[e.target.id].touchLegend(e);
    uChartsInstance[e.target.id].showToolTip(e);
    var tapObj = uChartsInstance[e.target.id].getCurrentDataIndex(e);
    console.log(tapObj)
    if (tapObj.index != -1) {
      let total_len = this.data.userScoreInfo.scoreValue.length;
      let category_len = 0;
      if (this.data.oneMonth) {
        category_len = this.data.OneMonthMoodTrackData.categories.length;
      } else if (this.data.threeMonth) {
        category_len = this.data.ThreeMonthMoodTrackData.categories.length;
      } else if (this.data.sixMonth) {
        category_len = this.data.SixMonthMoodTrackData.categories.length;
      } else {
        console.error("no category chosen");
      }
      this.setData({
        userScoreValue: this.data.userScoreInfo.scoreValue[tapObj.index + (total_len - category_len)],
        userScoreType: this.data.userScoreInfo.scoreType[tapObj.index + (total_len - category_len)],
        userScoreColor: this.data.userScoreInfo.scoreColor[tapObj.index + (total_len - category_len)],
        userMoodTitle: this.data.userScoreInfo.moodTitle[tapObj.index + (total_len - category_len)],
        userMoodDescription: this.data.userScoreInfo.moodDescription[tapObj.index + (total_len - category_len)]
      })
      
    }
  },

  reconstruct(date) {
    let date_split = date.split('.')
    let date_month = date_split[0]
    let date_date = date_split[1]
    return date_month + "月" + date_date + "日"
  },

  dateFormat(type) {
    // Calculate the start and end dates based on the provided type
    let startDate, endDate;
    const today = new Date();
    switch (type) {
      case "oneMonth":
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
        endDate = today;
        break;
      case "threeMonth":
        startDate = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
        endDate = today;
        break;
      case "sixMonth":
        startDate = new Date(today.getFullYear(), today.getMonth() - 6, today.getDate());
        endDate = today;
        break;
      default:
        throw new Error(`Invalid type: ${type}`);
    }
  
    // Format the start and end dates as strings in the desired format
    const startString = `${("0" + (startDate.getMonth() + 1)).slice(-2)}月${("0" + startDate.getDate()).slice(-2)}日`;
    const endString = `${("0" + (endDate.getMonth() + 1)).slice(-2)}月${("0" + endDate.getDate()).slice(-2)}日`;
  
    // Return the final formatted string
    return `${startString}-${endString}`;
  },

  chooseOneMonth() {
    let empty_one_month = false;
    let empty_data_placeholder = "";
    if (this.data.OneMonthMoodTrackData.categories.length == 0) {
      empty_one_month = true;
      empty_data_placeholder = "近30天无数据，请参与情绪记录"
    }
    this.setData(
      {
        oneMonth: true,
        threeMonth: false,
        sixMonth: false,
        timePeriodText: '近30天',
        timePeirodDate: this.dateFormat("oneMonth")
      }
    )
    console.log("this.data.timePeriodDate in oneMonth()", this.data.timePeriodDate)
    this.drawCharts('jkyWEuYZpJWLcfbnKkmySDRjQLEpHsIG', this.data.OneMonthMoodTrackData);
  },

  chooseThreeMonth() {
    let empty_three_month = false;
    let empty_data_placeholder = "";
    if (this.data.ThreeMonthMoodTrackData.categories.length == 0) {
      empty_three_month = true;
      empty_data_placeholder = "近3个月无数据，请参与情绪记录"
    }
    this.setData(
      {
        oneMonth: false,
        threeMonth: true,
        sixMonth: false,
        timePeriodText: '近90天',
        timePeirodDate: (empty_three_month ? empty_data_placeholder : this.dateFormat("threeMonth"))  
      }
    ),
    console.log("this.data.timePeriodDate in threeMonth()", this.data.timePeriodDate)
    this.drawCharts('jkyWEuYZpJWLcfbnKkmySDRjQLEpHsIG', this.data.ThreeMonthMoodTrackData);
  },

  chooseSixMonth() {
    let empty_six_month = false;
    let empty_data_placeholder = "";
    if (this.data.SixMonthMoodTrackData.categories.length == 0) {
      empty_six_month = true;
      empty_data_placeholder = "近6个月无数据，请参与情绪记录"
    }

    this.setData(
      {
        oneMonth: false,
        threeMonth: false,
        sixMonth: true,
        timePeriodText: '近180天',
        timePeirodDate: (empty_six_month ? empty_data_placeholder: this.dateFormat("sixMonth"))
      }
    )
    console.log("this.data.timePeriodDate in sixMonth()", this.data.timePeriodDate)
    this.drawCharts('jkyWEuYZpJWLcfbnKkmySDRjQLEpHsIG', this.data.SixMonthMoodTrackData);
  },

  // 获取滚动条向左边移动的长度
  scroll(e) {
    const chunkCount = this.data.mediaList.length // 5
    const userScroll = e.detail.scrollLeft
    const barScroll = (userScroll * 30) / ((chunkCount - 4) * 20)
    this.setData({
      slideLeft: barScroll
    })
  },
  
  handlePdrecommend(e) {
    console.log('bindtap function runs')
    // let clickedPodCastNum = e.currentTarget.dataset.id
    // let type = e.currentTarget.dataset.podcasttype
    let clickedPodCastNum = e.currentTarget.dataset.bindex
    let type = "播客"
    wx.navigateTo({
      url: `../../../pages/podcastPlay/index?podCastOrder=${clickedPodCastNum}&type=${type}`
    })
  }
})

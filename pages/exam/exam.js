const app = getApp()
const questionManager = require('../../utils/questionManager.js')

Page({
  data: {
    examHistory: [],
    categories: [],
    selectedCategory: 'pharmacist',
    examConfig: {
      totalQuestions: 100,
      timeLimit: 90,  // 分钟
      passScore: 60
    },
    canStartExam: true,
    examModalVisible: false,
    examQuestions: [],
    currentIndex: 0,
    currentQuestion: {},
    selectedAnswers: [],
    showResult: false,
    correctCount: 0,
    examStartTime: null,
    examEndTime: null
  },

  onLoad: function () {
    this.loadData()
  },

  onShow: function () {
    this.loadData()
  },

  loadData: function () {
    const examHistory = app.globalData.userData.examHistory || []
    const categories = app.globalData.categories
    const isVip = app.checkMemberStatus()

    this.setData({
      examHistory: examHistory,
      categories: categories,
      canStartExam: isVip
    })
  },

  selectCategory: function (e) {
    const categoryId = e.currentTarget.dataset.category
    this.setData({
      selectedCategory: categoryId
    })
  },

  showExamModal: function () {
    if (!this.data.canStartExam) {
      wx.showToast({
        title: '请先开通会员',
        icon: 'none'
      })
      return
    }

    wx.showModal({
      title: '开始模拟考试',
      content: `共${this.data.examConfig.totalQuestions}题，限时${this.data.examConfig.timeLimit}分钟，60分及格`,
      confirmText: '开始考试',
      success: (res) => {
        if (res.confirm) {
          this.startExam()
        }
      }
    })
  },

  startExam: function () {
    // 生成模拟试卷
    const questions = this.generateExamPaper()
    if (questions.length === 0) {
      wx.showToast({
        title: '题库加载中，请稍后再试',
        icon: 'none'
      })
      return
    }

    this.setData({
      examQuestions: questions,
      currentIndex: 0,
      currentQuestion: questions[0],
      selectedAnswers: new Array(questions.length).fill(-1),
      showResult: false,
      correctCount: 0,
      examStartTime: Date.now(),
      examEndTime: null
    })

    wx.navigateTo({
      url: '/pages/quiz/quiz?examMode=1'
    })
  },

  generateExamPaper: function () {
    const categoryId = this.data.selectedCategory
    const categoryQuestions = questionManager.getCategoryQuestions(categoryId)
    if (!categoryQuestions || categoryQuestions.length === 0) return []

    const allQuestions = []
    categoryQuestions.forEach(chapter => {
      allQuestions.push(...chapter.questions)
    })

    // 随机抽取指定数量
    const shuffled = allQuestions.sort(() => Math.random() - 0.5)
    return shuffled.slice(0, this.data.examConfig.totalQuestions)
  },

  goToVip: function () {
    wx.navigateTo({
      url: '/pages/vip/vip'
    })
  }
})

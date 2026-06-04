const app = getApp()
const questions = require('../../data/questions.js')

Page({
  data: {
    categoryId: '',
    level: 0,
    questions: [],
    currentIndex: 0,
    currentQuestion: {},
    selectedAnswer: -1,
    showResult: false,
    correctCount: 0,
    totalQuestions: 0,
    showHintModal: false,
    progressPercent: 0,
    quizResults: []
  },

  onLoad: function (options) {
    const categoryId = options.category
    const level = parseInt(options.level)
    
    this.setData({
      categoryId: categoryId,
      level: level
    })
    
    this.initQuestions()
  },

  initQuestions: function () {
    const categoryQuestions = questions[this.data.categoryId]
    if (!categoryQuestions) {
      wx.showToast({
        title: '题库加载失败',
        icon: 'none'
      })
      return
    }

    const levelData = categoryQuestions.find(l => l.level === this.data.level)
    if (!levelData) {
      wx.showToast({
        title: '关卡不存在',
        icon: 'none'
      })
      return
    }

    const shuffledQuestions = [...levelData.questions].sort(() => Math.random() - 0.5)
    
    this.setData({
      questions: shuffledQuestions,
      currentIndex: 0,
      currentQuestion: shuffledQuestions[0],
      totalQuestions: shuffledQuestions.length,
      correctCount: 0,
      selectedAnswer: -1,
      showResult: false,
      progressPercent: 0,
      quizResults: []
    })
  },

  selectOption: function (e) {
    if (this.data.showResult) return

    const index = e.currentTarget.dataset.index
    const isCorrect = index === this.data.currentQuestion.answer
    
    this.setData({
      selectedAnswer: index,
      showResult: true,
      correctCount: isCorrect ? this.data.correctCount + 1 : this.data.correctCount
    })

    this.data.quizResults.push({
      question: this.data.currentQuestion.question,
      userAnswer: index,
      correctAnswer: this.data.currentQuestion.answer,
      isCorrect: isCorrect
    })

    app.updateUserProgress(this.data.categoryId, this.data.level, isCorrect)
  },

  nextQuestion: function () {
    const nextIndex = this.data.currentIndex + 1
    
    if (nextIndex >= this.data.totalQuestions) {
      this.goToResult()
      return
    }

    this.setData({
      currentIndex: nextIndex,
      currentQuestion: this.data.questions[nextIndex],
      selectedAnswer: -1,
      showResult: false,
      progressPercent: ((nextIndex + 1) / this.data.totalQuestions) * 100
    })
  },

  goToResult: function () {
    const correctRate = (this.data.correctCount / this.data.totalQuestions) * 100
    const isPass = correctRate >= 60
    
    if (isPass) {
      app.unlockNextLevel(this.data.categoryId, this.data.level)
    }

    wx.redirectTo({
      url: `/pages/result/result?category=${this.data.categoryId}&level=${this.data.level}&correct=${this.data.correctCount}&total=${this.data.totalQuestions}&pass=${isPass}`
    })
  },

  showHint: function () {
    this.setData({
      showHintModal: true
    })
  },

  closeHint: function () {
    this.setData({
      showHintModal: false
    })
  },

  getOptionClass: function (index) {
    if (!this.data.showResult) return ''
    
    if (index === this.data.currentQuestion.answer) {
      return 'option-correct'
    }
    if (index === this.data.selectedAnswer && index !== this.data.currentQuestion.answer) {
      return 'option-wrong'
    }
    return 'option-disabled'
  },

  getLetter: function (index) {
    return ['A', 'B', 'C', 'D'][index]
  }
})
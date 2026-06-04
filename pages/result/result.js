Page({
  data: {
    categoryId: '',
    level: 0,
    correctCount: 0,
    totalQuestions: 0,
    isPass: false,
    correctRate: 0
  },

  onLoad: function (options) {
    const categoryId = options.category
    const level = parseInt(options.level)
    const correctCount = parseInt(options.correct)
    const totalQuestions = parseInt(options.total)
    const isPass = options.pass === 'true'
    const correctRate = Math.round((correctCount / totalQuestions) * 100)

    this.setData({
      categoryId: categoryId,
      level: level,
      correctCount: correctCount,
      totalQuestions: totalQuestions,
      isPass: isPass,
      correctRate: correctRate
    })
  },

  getStars: function () {
    const rate = this.data.correctRate
    if (rate >= 100) return '⭐⭐⭐⭐⭐'
    if (rate >= 80) return '⭐⭐⭐⭐'
    if (rate >= 60) return '⭐⭐⭐'
    if (rate >= 40) return '⭐⭐'
    return '⭐'
  },

  getComment: function () {
    const rate = this.data.correctRate
    if (rate >= 100) return '完美！你是真正的学霸！'
    if (rate >= 80) return '优秀！继续保持！'
    if (rate >= 60) return '不错！再接再厉！'
    if (rate >= 40) return '加油！多练习会更好！'
    return '别灰心！知识需要积累！'
  },

  retry: function () {
    wx.redirectTo({
      url: `/pages/quiz/quiz?category=${this.data.categoryId}&level=${this.data.level}`
    })
  },

  nextLevel: function () {
    const nextLevel = this.data.level + 1
    wx.redirectTo({
      url: `/pages/quiz/quiz?category=${this.data.categoryId}&level=${nextLevel}`
    })
  },

  backToLevels: function () {
    wx.redirectTo({
      url: `/pages/levels/levels?category=${this.data.categoryId}`
    })
  }
})
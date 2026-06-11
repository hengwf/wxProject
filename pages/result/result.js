const adManager = require('../../utils/adManager.js')

Page({
  data: {
    categoryId: '',
    chapter: 0,
    correctCount: 0,
    totalQuestions: 0,
    isPass: false,
    correctRate: 0,
    adShown: false,
    examMode: false
  },

  onLoad: function (options) {
    const categoryId = options.category
    const chapter = parseInt(options.chapter)
    const correctCount = parseInt(options.correct)
    const totalQuestions = parseInt(options.total)
    const isPass = options.pass === 'true'
    const examMode = options.examMode === '1'
    const correctRate = Math.round((correctCount / totalQuestions) * 100)

    this.setData({
      categoryId: categoryId,
      chapter: chapter,
      correctCount: correctCount,
      totalQuestions: totalQuestions,
      isPass: isPass,
      correctRate: correctRate,
      examMode: examMode
    })

    this.initInterstitialAd()
  },

  onShow: function () {
    if (!this.data.adShown && !this.data.examMode) {
      this.delayShowAd()
    }
  },

  initInterstitialAd: function () {
    adManager.initInterstitialAd()
  },

  delayShowAd: function () {
    setTimeout(() => {
      adManager.showInterstitialAd()
      this.setData({
        adShown: true
      })
    }, 1000)
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
    if (rate >= 100) return '满分！太棒了！'
    if (rate >= 80) return '优秀！继续保持！'
    if (rate >= 60) return '及格啦！再接再厉！'
    if (rate >= 40) return '加油！多练习会更好！'
    return '别灰心！知识需要积累！'
  },

  retry: function () {
    wx.redirectTo({
      url: `/pages/quiz/quiz?category=${this.data.categoryId}&chapter=${this.data.chapter}`
    })
  },

  nextChapter: function () {
    const nextChapter = this.data.chapter + 1
    if (nextChapter > 10) {
      wx.showToast({ title: '已是最后一章', icon: 'none' })
      return
    }
    wx.redirectTo({
      url: `/pages/quiz/quiz?category=${this.data.categoryId}&chapter=${nextChapter}`
    })
  },

  backToChapters: function () {
    wx.redirectTo({
      url: `/pages/chapters/chapters?category=${this.data.categoryId}`
    })
  },

  backToHome: function () {
    wx.switchTab({
      url: '/pages/index/index'
    })
  }
})

const app = getApp()
const adManager = require('../../utils/adManager.js')

Page({
  data: {
    categories: [],
    userData: {},
    todayQuestions: 0,
    totalQuestions: 0,
    correctRate: 0,
    memberStatus: 'free',
    currentTip: '',
    tips: [
      '遇到难题可以收藏，方便日后复习',
      '模拟考试可以检验你的学习效果',
      '坚持每天刷题，考试不再慌张',
      '错题本是你的薄弱点，多复习',
      '开通会员解锁全部题库和功能'
    ]
  },

  onLoad: function () {
    this.refreshData()
    this.initBannerAd()
  },

  onShow: function () {
    this.refreshData()
    adManager.showBannerAd()
  },

  onHide: function () {
    adManager.hideBannerAd()
  },

  onUnload: function () {
    adManager.destroyBannerAd()
  },

  refreshData: function () {
    const userData = app.globalData.userData
    const correctRate = userData.totalQuestions > 0
      ? Math.round((userData.correctCount / userData.totalQuestions) * 100)
      : 0

    this.setData({
      categories: app.globalData.categories,
      userData: userData,
      todayQuestions: userData.todayQuestions || 0,
      totalQuestions: userData.totalQuestions || 0,
      correctRate: correctRate,
      memberStatus: userData.memberStatus || 'free',
      currentTip: this.data.tips[Math.floor(Math.random() * this.data.tips.length)]
    })
  },

  initBannerAd: function () {
    adManager.initBannerAd()
    adManager.showBannerAd()
  },

  goToChapters: function (e) {
    const categoryId = e.currentTarget.dataset.category
    wx.navigateTo({
      url: `/pages/chapters/chapters?category=${categoryId}`
    })
  },

  goToVip: function () {
    wx.navigateTo({
      url: '/pages/vip/vip'
    })
  },

  getCategoryProgress: function (categoryId) {
    const progress = app.globalData.userData.categories[categoryId]?.progress
    if (progress) {
      return `${progress.completed}/${progress.total}`
    }
    return '0/20'
  },

  getProgressPercent: function (categoryId) {
    const progress = app.globalData.userData.categories[categoryId]?.progress
    if (progress && progress.total > 0) {
      return (progress.completed / progress.total) * 100
    }
    return 0
  }
})

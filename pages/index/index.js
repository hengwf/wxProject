const app = getApp()

Page({
  data: {
    categories: [],
    todayQuestions: 0,
    totalQuestions: 0,
    totalLevels: 10,
    currentTip: '',
    tips: [
      '遇到难题可以点击提示按钮获取帮助哦！',
      '每关答对60%以上的题目即可通关',
      '通关后可以解锁下一关',
      '答错不会扣分，但会影响正确率',
      '坚持每天答题，知识会越来越丰富！',
      '关卡难度会逐渐增加，挑战自己吧！'
    ]
  },

  onLoad: function () {
    this.setData({
      categories: app.globalData.categories,
      todayQuestions: app.globalData.userData.todayQuestions,
      totalQuestions: app.globalData.userData.totalQuestions,
      currentTip: this.data.tips[Math.floor(Math.random() * this.data.tips.length)]
    })
  },

  onShow: function () {
    this.setData({
      todayQuestions: app.globalData.userData.todayQuestions,
      totalQuestions: app.globalData.userData.totalQuestions
    })
  },

  getProgress: function (categoryId) {
    const progress = app.globalData.userData.categoryProgress[categoryId]
    if (progress) {
      return (progress.completed / progress.total) * 100
    }
    return 0
  },

  getCategoryProgress: function (categoryId) {
    const progress = app.globalData.userData.categoryProgress[categoryId]
    if (progress) {
      return `${progress.completed}/${progress.total}`
    }
    return '0/10'
  },

  getUnlockedLevels: function (categoryId) {
    return app.globalData.userData.unlockedLevels[categoryId] || 1
  },

  goToLevels: function (e) {
    const categoryId = e.currentTarget.dataset.category
    wx.navigateTo({
      url: `/pages/levels/levels?category=${categoryId}`
    })
  },

  goToMine: function () {
    wx.navigateTo({
      url: '/pages/mine/mine'
    })
  }
})
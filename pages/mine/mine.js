const app = getApp()

Page({
  data: {
    userData: {},
    categories: [],
    correctRate: 0,
    totalCompletedLevels: 0,
    totalUnlockedLevels: 0
  },

  onLoad: function () {
    this.setData({
      categories: app.globalData.categories
    })
    this.loadUserData()
  },

  onShow: function () {
    this.loadUserData()
  },

  loadUserData: function () {
    const userData = app.globalData.userData
    const correctRate = userData.totalQuestions > 0 
      ? Math.round((userData.correctCount / userData.totalQuestions) * 100) 
      : 0
    
    let totalCompleted = 0
    let totalUnlocked = 0
    for (const key in userData.completedLevels) {
      if (userData.completedLevels[key]) {
        totalCompleted++
      }
    }
    for (const key in userData.unlockedLevels) {
      totalUnlocked += userData.unlockedLevels[key]
    }

    this.setData({
      userData: userData,
      correctRate: correctRate,
      totalCompletedLevels: totalCompleted,
      totalUnlockedLevels: totalUnlocked
    })
  },

  getCategoryProgress: function (categoryId) {
    const progress = this.data.userData.categoryProgress[categoryId]
    if (progress) {
      return `${progress.completed}/${progress.total}`
    }
    return '0/10'
  },

  getProgressPercent: function (categoryId) {
    const progress = this.data.userData.categoryProgress[categoryId]
    if (progress) {
      return (progress.completed / progress.total) * 100
    }
    return 0
  },

  goToRules: function () {
    wx.navigateTo({
      url: '/pages/rules/rules'
    })
  },

  goToPrivacy: function () {
    wx.navigateTo({
      url: '/pages/privacy/privacy'
    })
  },

  showAbout: function () {
    wx.showModal({
      title: '关于我们',
      content: '益智闯关 v1.0.0\n\n一款轻松有趣的百科闯关益智答题小程序，涵盖生活常识、影视娱乐、历史人文、综合知识海量题库。逐级闯关解锁全新题目，遇到难题可观看提示轻松通关。休闲解压、增长知识、老少皆宜！',
      showCancel: false
    })
  },

  clearData: function () {
    wx.showModal({
      title: '确认清除',
      content: '确定要清除所有答题数据吗？此操作不可恢复。',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('userData')
          app.initUserData()
          this.loadUserData()
          wx.showToast({
            title: '数据已清除',
            icon: 'success'
          })
        }
      }
    })
  }
})
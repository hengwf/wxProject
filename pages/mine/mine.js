const app = getApp()

Page({
  data: {
    userData: {},
    categories: [],
    correctRate: 0,
    totalCompletedChapters: 0,
    memberStatus: 'free',
    wrongCount: 0,
    collectCount: 0
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
    for (const catKey in userData.categories) {
      const cat = userData.categories[catKey]
      if (cat.completedChapters) {
        totalCompleted += Object.keys(cat.completedChapters).length
      }
    }

    this.setData({
      userData: userData,
      correctRate: correctRate,
      totalCompletedChapters: totalCompleted,
      memberStatus: userData.memberStatus || 'free',
      wrongCount: userData.wrongQuestions?.length || 0,
      collectCount: userData.collectedQuestions?.length || 0
    })
  },

  goToVip: function () {
    wx.navigateTo({
      url: '/pages/vip/vip'
    })
  },

  goToRules: function () {
    wx.navigateTo({
      url: '/pages/rules/rules'
    })
  },

  goToProfile: function () {
    wx.navigateTo({
      url: '/pages/profile/profile'
    })
  },

  goToPrivacy: function () {
    wx.navigateTo({
      url: '/pages/privacy/privacy'
    })
  },

  goToWrong: function () {
    wx.switchTab({
      url: '/pages/wrong/wrong'
    })
  },

  showAbout: function () {
    wx.showModal({
      title: '关于我们',
      content: '医考通 v1.0.0\n\n专注医学考试题库，涵盖执业药师、护士、医师等海量题库。\n\n支持章节练习、模拟考试、错题本等功能。',
      showCancel: false
    })
  },

  clearData: function () {
    wx.showModal({
      title: '确认清除',
      content: '确定要清除所有学习数据吗？此操作不可恢复。',
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
  },

  getMemberStatusText: function () {
    if (this.data.memberStatus === 'vip') {
      return 'VIP会员'
    }
    return '普通用户'
  }
})

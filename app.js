App({
  onLaunch: function () {
    this.initUserData()
  },

  initUserData: function () {
    const userData = wx.getStorageSync('userData')
    if (!userData) {
      const defaultData = {
        totalQuestions: 0,
        correctCount: 0,
        unlockedLevels: {
          'life': 1,
          'entertainment': 1,
          'history': 1,
          'general': 1
        },
        completedLevels: {},
        categoryProgress: {
          'life': { completed: 0, total: 10 },
          'entertainment': { completed: 0, total: 10 },
          'history': { completed: 0, total: 10 },
          'general': { completed: 0, total: 10 }
        },
        todayQuestions: 0,
        lastDate: ''
      }
      wx.setStorageSync('userData', defaultData)
      this.globalData.userData = defaultData
    } else {
      this.globalData.userData = userData
    }
    this.updateTodayData()
  },

  updateTodayData: function () {
    const today = new Date().toISOString().split('T')[0]
    if (this.globalData.userData.lastDate !== today) {
      this.globalData.userData.todayQuestions = 0
      this.globalData.userData.lastDate = today
      this.saveUserData()
    }
  },

  saveUserData: function () {
    wx.setStorageSync('userData', this.globalData.userData)
  },

  updateUserProgress: function (category, level, isCorrect) {
    const userData = this.globalData.userData
    userData.totalQuestions++
    if (isCorrect) {
      userData.correctCount++
    }
    userData.todayQuestions++
    this.saveUserData()
  },

  unlockNextLevel: function (category, currentLevel) {
    const userData = this.globalData.userData
    const nextLevel = currentLevel + 1
    if (nextLevel > userData.unlockedLevels[category]) {
      userData.unlockedLevels[category] = nextLevel
      userData.completedLevels[`${category}_${currentLevel}`] = true
      if (userData.categoryProgress[category]) {
        userData.categoryProgress[category].completed++
      }
      this.saveUserData()
    }
  },

  globalData: {
    userData: null,
    categories: [
      { id: 'life', name: '生活常识', icon: '🏠', color: '#52c41a' },
      { id: 'entertainment', name: '影视娱乐', icon: '🎬', color: '#f5a623' },
      { id: 'history', name: '历史人文', icon: '📜', color: '#9b59b6' },
      { id: 'general', name: '综合知识', icon: '🔬', color: '#3498db' }
    ]
  }
})
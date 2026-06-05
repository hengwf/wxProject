App({
  onLaunch: function () {
    this.initUserData()
  },

  initUserData: function () {
    try {
      const userData = wx.getStorageSync('userData')
      console.log('从存储读取的 userData:', userData)
      
      if (!userData || !userData.unlockedLevels) {
        console.log('初始化默认数据')
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
            'life': { completed: 0, total: 66 },
            'entertainment': { completed: 0, total: 66 },
            'history': { completed: 0, total: 66 },
            'general': { completed: 0, total: 66 }
          },
          todayQuestions: 0,
          lastDate: ''
        }
        this.globalData.userData = defaultData
        this.saveUserData()
      } else {
        this.globalData.userData = userData
      }
      this.updateTodayData()
    } catch (e) {
      console.error('初始化用户数据失败:', e)
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
          'life': { completed: 0, total: 66 },
          'entertainment': { completed: 0, total: 66 },
          'history': { completed: 0, total: 66 },
          'general': { completed: 0, total: 66 }
        },
        todayQuestions: 0,
        lastDate: ''
      }
      this.globalData.userData = defaultData
      this.saveUserData()
    }
  },

  updateTodayData: function () {
    try {
      const today = new Date().toISOString().split('T')[0]
      if (this.globalData.userData.lastDate !== today) {
        this.globalData.userData.todayQuestions = 0
        this.globalData.userData.lastDate = today
        this.saveUserData()
      }
    } catch (e) {
      console.error('更新今日数据失败:', e)
    }
  },

  saveUserData: function () {
    try {
      console.log('正在保存数据:', this.globalData.userData)
      wx.setStorageSync('userData', this.globalData.userData)
      console.log('数据保存成功')
    } catch (e) {
      console.error('保存用户数据失败:', e)
    }
  },

  updateUserProgress: function (category, level, isCorrect) {
    try {
      const userData = this.globalData.userData
      userData.totalQuestions++
      if (isCorrect) {
        userData.correctCount++
      }
      userData.todayQuestions++
      this.saveUserData()
    } catch (e) {
      console.error('更新用户进度失败:', e)
    }
  },

  unlockNextLevel: function (category, currentLevel) {
    try {
      const userData = this.globalData.userData
      const nextLevel = currentLevel + 1
      console.log('解锁下一关:', { category, currentLevel, nextLevel, currentUnlocked: userData.unlockedLevels[category] })
      
      if (nextLevel > userData.unlockedLevels[category]) {
        userData.unlockedLevels[category] = nextLevel
        userData.completedLevels[`${category}_${currentLevel}`] = true
        if (userData.categoryProgress[category]) {
          userData.categoryProgress[category].completed++
        }
        this.saveUserData()
        console.log('解锁成功，保存后的数据:', userData)
      }
    } catch (e) {
      console.error('解锁下一关失败:', e)
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
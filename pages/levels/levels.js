const app = getApp()

Page({
  data: {
    categoryId: '',
    currentCategory: {},
    categoryDesc: '',
    levels: [],
    totalLevels: 66
  },

  onLoad: function (options) {
    const categoryId = options.category
    this.setData({
      categoryId: categoryId
    })
    this.initPage()
  },

  onShow: function () {
    this.initPage()
  },

  initPage: function () {
    const categoryId = this.data.categoryId
    const category = app.globalData.categories.find(c => c.id === categoryId)
    
    const descMap = {
      'life': '日常科普、生活误区、安全常识、民俗知识',
      'entertainment': '电影、电视剧、综艺、明星、流行作品',
      'history': '中国历史、世界历史、古代文化、历史人物事件',
      'general': '地理、科学、自然、冷门趣味知识'
    }

    const unlockedLevels = app.globalData.userData.unlockedLevels[categoryId] || 1
    const completedLevels = app.globalData.userData.completedLevels

    const levels = []
    for (let i = 1; i <= this.data.totalLevels; i++) {
      let status = 'locked'
      if (i <= unlockedLevels) {
        if (completedLevels[`${categoryId}_${i}`]) {
          status = 'completed'
        } else {
          status = 'available'
        }
      }
      levels.push({
        level: i,
        status: status
      })
    }

    this.setData({
      currentCategory: category || {},
      categoryDesc: descMap[categoryId] || '',
      levels: levels
    })
  },

  goToQuiz: function (e) {
    const level = e.currentTarget.dataset.level
    const levelData = this.data.levels.find(l => l.level === level)
    
    if (levelData.status === 'locked') {
      wx.showToast({
        title: '请先通关上一关',
        icon: 'none'
      })
      return
    }

    wx.navigateTo({
      url: `/pages/quiz/quiz?category=${this.data.categoryId}&level=${level}`
    })
  }
})
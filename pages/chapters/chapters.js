const app = getApp()

// 章节配置
const chapterConfig = {
  pharmacist: [
    { id: 1, name: '药事法规', questions: 80 },
    { id: 2, name: '药学专业知识（一）', questions: 120 },
    { id: 3, name: '药学综合知识与技能', questions: 100 },
    { id: 4, name: '中药学专业知识', questions: 100 },
    { id: 5, name: '药事管理与法规', questions: 80 },
    { id: 6, name: '药理学', questions: 90 },
    { id: 7, name: '药物分析', questions: 70 },
    { id: 8, name: '药物化学', questions: 80 },
    { id: 9, name: '药剂学', questions: 90 },
    { id: 10, name: '临床药理学', questions: 80 }
  ],
  nurse: [
    { id: 1, name: '基础护理学', questions: 100 },
    { id: 2, name: '内科护理学', questions: 120 },
    { id: 3, name: '外科护理学', questions: 110 },
    { id: 4, name: '妇产科护理学', questions: 90 },
    { id: 5, name: '儿科护理学', questions: 90 },
    { id: 6, name: '急救护理学', questions: 70 },
    { id: 7, name: '护理心理学', questions: 60 },
    { id: 8, name: '护理伦理学', questions: 50 },
    { id: 9, name: '护理管理学', questions: 60 },
    { id: 10, name: '社区护理学', questions: 70 }
  ],
  doctor: [
    { id: 1, name: '临床医学知识', questions: 150 },
    { id: 2, name: '预防医学', questions: 80 },
    { id: 3, name: '医学人文', questions: 60 },
    { id: 4, name: '解剖学', questions: 90 },
    { id: 5, name: '生理学', questions: 80 },
    { id: 6, name: '病理学', questions: 70 },
    { id: 7, name: '药理学', questions: 80 },
    { id: 8, name: '诊断学', questions: 100 },
    { id: 9, name: '内科学', questions: 120 },
    { id: 10, name: '外科学', questions: 110 }
  ]
}

Page({
  data: {
    categoryId: '',
    currentCategory: {},
    chapters: [],
    totalChapters: 10
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
    const chapters = chapterConfig[categoryId] || []
    const unlockedChapters = app.globalData.userData.categories[categoryId]?.unlockedChapters || 1
    const completedChapters = app.globalData.userData.categories[categoryId]?.completedChapters || {}

    const chapterList = chapters.map(ch => {
      let status = 'locked'
      if (ch.id <= unlockedChapters) {
        if (completedChapters[ch.id]) {
          status = 'completed'
        } else {
          status = 'available'
        }
      }
      return {
        ...ch,
        status: status
      }
    })

    this.setData({
      currentCategory: category || {},
      chapters: chapterList
    })
  },

  goToQuiz: function (e) {
    const chapterId = e.currentTarget.dataset.chapter
    const chapterData = this.data.chapters.find(ch => ch.id === chapterId)

    if (chapterData.status === 'locked') {
      wx.showToast({
        title: '请先解锁上一章',
        icon: 'none'
      })
      return
    }

    wx.navigateTo({
      url: `/pages/quiz/quiz?category=${this.data.categoryId}&chapter=${chapterId}`
    })
  },

  goBack: function () {
    wx.navigateBack()
  }
})

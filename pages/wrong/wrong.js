const app = getApp()

Page({
  data: {
    wrongQuestions: [],
    isEmpty: true
  },

  onLoad: function () {
    this.loadWrongQuestions()
  },

  onShow: function () {
    this.loadWrongQuestions()
  },

  loadWrongQuestions: function () {
    const wrongQuestions = app.globalData.userData.wrongQuestions || []
    this.setData({
      wrongQuestions: wrongQuestions,
      isEmpty: wrongQuestions.length === 0
    })
  },

  goToQuiz: function (e) {
    const index = e.currentTarget.dataset.index
    const question = this.data.wrongQuestions[index]
    wx.navigateTo({
      url: `/pages/quiz/quiz?category=${question.category}&chapter=${question.chapter}&wrongIndex=${index}`
    })
  },

  removeWrong: function (e) {
    const questionId = e.currentTarget.dataset.id
    wx.showModal({
      title: '确认移除',
      content: '确定要从错题本移除这道题吗？',
      success: (res) => {
        if (res.confirm) {
          app.removeFromWrongBook(questionId)
          this.loadWrongQuestions()
          wx.showToast({
            title: '已移除',
            icon: 'success'
          })
        }
      }
    })
  },

  clearAll: function () {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空整个错题本吗？',
      success: (res) => {
        if (res.confirm) {
          app.globalData.userData.wrongQuestions = []
          app.saveUserData()
          this.loadWrongQuestions()
          wx.showToast({
            title: '已清空',
            icon: 'success'
          })
        }
      }
    })
  }
})

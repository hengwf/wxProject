const app = getApp()

Page({
  data: {
    memberStatus: 'free',
    memberExpireTime: '',
    packages: [
      {
        id: 'month',
        name: '月卡',
        price: '9.9',
        originalPrice: '29.9',
        duration: '30天',
        features: [
          '解锁全部题库',
          '无限模拟考试',
          '无限错题本',
          '去广告'
        ]
      },
      {
        id: 'year',
        name: '年卡',
        price: '59.9',
        originalPrice: '199',
        duration: '365天',
        recommended: true,
        features: [
          '解锁全部题库',
          '无限模拟考试',
          '无限错题本',
          '去广告',
          '专属学习报告'
        ]
      },
      {
        id: 'forever',
        name: '终身卡',
        price: '199',
        originalPrice: '599',
        duration: '永久有效',
        features: [
          '解锁全部题库',
          '无限模拟考试',
          '无限错题本',
          '去广告',
          '专属学习报告',
          '优先客服支持',
          '终身更新'
        ]
      }
    ]
  },

  onLoad: function () {
    this.loadMemberInfo()
  },

  onShow: function () {
    this.loadMemberInfo()
  },

  loadMemberInfo: function () {
    const userData = app.globalData.userData
    let expireText = ''

    if (userData.memberStatus === 'vip' && userData.memberExpireTime) {
      if (userData.memberExpireTime === null) {
        expireText = '永久有效'
      } else {
        const expireDate = new Date(userData.memberExpireTime)
        expireText = `${expireDate.getFullYear()}/${expireDate.getMonth() + 1}/${expireDate.getDate()} 到期`
      }
    }

    this.setData({
      memberStatus: userData.memberStatus || 'free',
      memberExpireTime: expireText
    })
  },

  selectPackage: function (e) {
    const packageId = e.currentTarget.dataset.id

    wx.showToast({
      title: '支付功能开发中',
      icon: 'none'
    })
  },

  goBack: function () {
    wx.navigateBack()
  }
})

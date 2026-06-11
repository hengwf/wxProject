const app = getApp()

Page({
  data: {
    userData: {},
    bioLength: 0, // 单独保存简介长度
    goalList: [
      { id: 'pharmacist', name: '执业药师' },
      { id: 'nurse', name: '护士执业' },
      { id: 'doctor', name: '执业医师' },
      { id: 'other', name: '其他' }
    ],
    avatarList: ['👤', '👨‍⚕️', '👩‍⚕️', '👨‍🎓', '👩‍🎓', '📚', '💪', '🎯', '⭐', '🌟', '✨', '🔥']
  },

  onLoad() {
    this.loadUserData()
    wx.setNavigationBarTitle({
      title: '个人信息'
    })
  },

  loadUserData() {
    const globalData = app.globalData.userData
    // 处理默认值
    const userData = {
      ...globalData,
      nickname: globalData.nickname || '医学考生',
      avatar: globalData.avatar || '👤',
      bio: globalData.bio || ''
    }
    this.setData({
      userData: userData,
      bioLength: (globalData.bio || '').length
    })
  },

  // 选择头像（调用微信头像选择）
  chooseAvatar() {
    wx.showActionSheet({
      itemList: ['从相册选择', '使用快捷头像'],
      success: (res) => {
        if (res.tapIndex === 0) {
          wx.chooseImage({
            count: 1,
            sizeType: ['compressed'],
            sourceType: ['album', 'camera'],
            success: (res) => {
              this.setData({
                'userData.avatar': res.tempFilePaths[0]
              })
            }
          })
        }
      }
    })
  },

  // 选择快捷头像
  selectAvatar(e) {
    const avatar = e.currentTarget.dataset.avatar
    this.setData({
      'userData.avatar': avatar
    })
  },

  // 输入昵称
  onNicknameInput(e) {
    this.setData({
      'userData.nickname': e.detail.value
    })
  },

  // 输入个人简介
  onBioInput(e) {
    const bio = e.detail.value
    this.setData({
      'userData.bio': bio,
      bioLength: bio.length
    })
  },

  // 选择备考目标
  chooseGoal(e) {
    const goalId = e.currentTarget.dataset.id
    this.setData({
      'userData.goal': goalId
    })
  },

  // 保存个人信息
  saveProfile() {
    if (!this.data.userData.nickname || this.data.userData.nickname.trim() === '') {
      wx.showToast({
        title: '请输入昵称',
        icon: 'none'
      })
      return
    }

    // 更新全局数据，但保护userUuid和会员信息不被覆盖
    const currentGlobalData = app.globalData.userData
    app.globalData.userData = {
      ...currentGlobalData,  // 先保留所有原数据
      ...this.data.userData, // 再覆盖新修改的字段
      // 强制保护关键字段
      userUuid: currentGlobalData.userUuid,
      memberStatus: currentGlobalData.memberStatus,
      memberExpireTime: currentGlobalData.memberExpireTime
    }

    // 保存到本地存储
    wx.setStorageSync('userData', app.globalData.userData)

    wx.showToast({
      title: '保存成功',
      icon: 'success'
    })

    setTimeout(() => {
      wx.navigateBack()
    }, 1000)
  }
})

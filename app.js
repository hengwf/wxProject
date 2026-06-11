const questionManager = require('./utils/questionManager.js')

App({
  onLaunch: function () {
    this.initUserData()
    this.initQuestionManager()
  },

  // 生成唯一用户ID
  generateUuid: function () {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substr(2, 9)
    return 'med_' + timestamp + '_' + random
  },

  // 初始化题库管理器
  initQuestionManager: async function () {
    try {
      await questionManager.init()
      // 暂时禁用服务器检查更新，避免域名报错
      // questionManager.checkAndUpdate().then((updated) => {
      //   if (updated) {
      //     console.log('题库已更新！')
      //   }
      // }).catch((e) => {
      //   console.log('检查更新失败（不影响使用）:', e)
      // })
    } catch (e) {
      console.error('初始化题库管理器失败:', e)
    }
  },

  initUserData: function () {
    try {
      const userData = wx.getStorageSync('userData')
      console.log('从存储读取的 userData:', userData)

      if (!userData || !userData.categories) {
        console.log('初始化默认数据')
        // 优先保留已有的userUuid和会员信息
        const existingUuid = userData?.userUuid || this.generateUuid()
        const existingMemberStatus = userData?.memberStatus || 'free'
        const existingMemberExpireTime = userData?.memberExpireTime || null

        const defaultData = {
          userUuid: existingUuid,
          totalQuestions: userData?.totalQuestions || 0,
          correctCount: userData?.correctCount || 0,
          nickname: userData?.nickname || '医学考生',
          avatar: userData?.avatar || '👨‍⚕️',
          bio: userData?.bio || '',
          goal: userData?.goal || '',
          categories: {
            'pharmacist': { unlockedChapters: 1, completedChapters: {}, progress: { completed: 0, total: 20 } },
            'nurse': { unlockedChapters: 1, completedChapters: {}, progress: { completed: 0, total: 20 } },
            'doctor': { unlockedChapters: 1, completedChapters: {}, progress: { completed: 0, total: 20 } }
          },
          wrongQuestions: userData?.wrongQuestions || [],
          collectedQuestions: userData?.collectedQuestions || [],
          examHistory: userData?.examHistory || [],
          memberStatus: existingMemberStatus,
          memberExpireTime: existingMemberExpireTime,
          todayQuestions: userData?.todayQuestions || 0,
          lastDate: userData?.lastDate || ''
        }
        this.globalData.userData = defaultData
        this.saveUserData()
      } else {
        this.globalData.userData = userData
        // 为旧数据补充新字段
        if (!this.globalData.userData.userUuid) {
          this.globalData.userData.userUuid = this.generateUuid()
        }
        if (!this.globalData.userData.nickname) {
          this.globalData.userData.nickname = '医学考生'
        }
        if (!this.globalData.userData.avatar) {
          this.globalData.userData.avatar = '👨‍⚕️'
        }
        if (this.globalData.userData.bio === undefined) {
          this.globalData.userData.bio = ''
        }
        if (this.globalData.userData.goal === undefined) {
          this.globalData.userData.goal = ''
        }
        // 确保会员信息不会丢失
        if (!this.globalData.userData.memberStatus) {
          this.globalData.userData.memberStatus = 'free'
        }
      }
      this.updateTodayData()
    } catch (e) {
      console.error('初始化用户数据失败:', e)
      const defaultData = {
        userUuid: this.generateUuid(),
        totalQuestions: 0,
        correctCount: 0,
        nickname: '医学考生',
        avatar: '👨‍⚕️',
        bio: '',
        goal: '',
        categories: {
          'pharmacist': { unlockedChapters: 1, completedChapters: {}, progress: { completed: 0, total: 20 } },
          'nurse': { unlockedChapters: 1, completedChapters: {}, progress: { completed: 0, total: 20 } },
          'doctor': { unlockedChapters: 1, completedChapters: {}, progress: { completed: 0, total: 20 } }
        },
        wrongQuestions: [],
        collectedQuestions: [],
        examHistory: [],
        memberStatus: 'free',
        memberExpireTime: null,
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
      wx.setStorageSync('userData', this.globalData.userData)
    } catch (e) {
      console.error('保存用户数据失败:', e)
    }
  },

  updateUserProgress: function (category, chapter, isCorrect, question) {
    try {
      const userData = this.globalData.userData
      userData.totalQuestions++
      if (isCorrect) {
        userData.correctCount++
      } else {
        // 添加到错题本
        if (question && !this.isQuestionInWrongBook(question.id)) {
          userData.wrongQuestions.push({
            ...question,
            category: category,
            chapter: chapter,
            wrongTime: Date.now()
          })
        }
      }
      userData.todayQuestions++
      this.saveUserData()
    } catch (e) {
      console.error('更新用户进度失败:', e)
    }
  },

  // 检查题目是否已在错题本
  isQuestionInWrongBook: function (questionId) {
    const wrongQuestions = this.globalData.userData.wrongQuestions
    return wrongQuestions.some(q => q.id === questionId)
  },

  // 从错题本移除
  removeFromWrongBook: function (questionId) {
    const userData = this.globalData.userData
    userData.wrongQuestions = userData.wrongQuestions.filter(q => q.id !== questionId)
    this.saveUserData()
  },

  // 收藏/取消收藏题目
  toggleCollectQuestion: function (question) {
    const userData = this.globalData.userData
    const index = userData.collectedQuestions.findIndex(q => q.id === question.id)
    if (index >= 0) {
      userData.collectedQuestions.splice(index, 1)
    } else {
      userData.collectedQuestions.push(question)
    }
    this.saveUserData()
    return index < 0
  },

  // 检查是否已收藏
  isQuestionCollected: function (questionId) {
    return this.globalData.userData.collectedQuestions.some(q => q.id === questionId)
  },

  // 通关章节，解锁下一章
  unlockNextChapter: function (category, currentChapter) {
    try {
      const userData = this.globalData.userData
      const nextChapter = currentChapter + 1
      console.log('解锁下一章:', { category, currentChapter, nextChapter })

      if (nextChapter > (userData.categories[category]?.unlockedChapters || 1)) {
        userData.categories[category].unlockedChapters = nextChapter
        userData.categories[category].completedChapters[`${currentChapter}`] = true
        if (userData.categories[category].progress) {
          userData.categories[category].progress.completed++
        }
        this.saveUserData()
        console.log('解锁成功')
      }
    } catch (e) {
      console.error('解锁下一章失败:', e)
    }
  },

  // 记录考试历史
  addExamHistory: function (examData) {
    const userData = this.globalData.userData
    userData.examHistory.unshift({
      ...examData,
      examTime: Date.now()
    })
    // 只保留最近20次考试记录
    if (userData.examHistory.length > 20) {
      userData.examHistory.pop()
    }
    this.saveUserData()
  },

  // 验证会员状态
  checkMemberStatus: function () {
    const userData = this.globalData.userData
    if (userData.memberStatus === 'vip' && userData.memberExpireTime) {
      if (Date.now() > userData.memberExpireTime) {
        userData.memberStatus = 'free'
        this.saveUserData()
        return false
      }
      return true
    }
    return false
  },

  // 激活会员
  activateMember: function (packageType) {
    const userData = this.globalData.userData
    userData.memberStatus = 'vip'
    const now = Date.now()
    if (packageType === 'month') {
      userData.memberExpireTime = now + 30 * 24 * 60 * 60 * 1000
    } else if (packageType === 'year') {
      userData.memberExpireTime = now + 365 * 24 * 60 * 60 * 1000
    } else if (packageType === 'forever') {
      userData.memberExpireTime = null  // 永久
    }
    this.saveUserData()
  },

  globalData: {
    userData: null,
    categories: [
      { id: 'pharmacist', name: '执业药师', icon: '💊', color: '#1890ff', desc: '药师资格证考试题库' },
      { id: 'nurse', name: '护士执业', icon: '👩‍⚕️', color: '#52c41a', desc: '护士资格考试题库' },
      { id: 'doctor', name: '执业医师', icon: '👨‍⚕️', color: '#fa8c16', desc: '医师资格考试题库' }
    ]
  }
})

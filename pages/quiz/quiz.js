const app = getApp()
const questionManager = require('../../utils/questionManager.js')
const adManager = require('../../utils/adManager.js')

Page({
  data: {
    categoryId: '',
    chapter: 0,
    questions: [],
    currentIndex: 0,
    currentQuestion: {},
    selectedAnswer: -1,
    selectedAnswers: [],  // 支持多选
    showResult: false,
    correctCount: 0,
    totalQuestions: 0,
    showHintModal: false,
    progressPercent: 0,
    quizResults: [],
    hintUsed: false,
    questionType: 'single',  // single/multiple/judge
    examMode: false,
    wrongIndex: -1  // 错题索引，-1表示正常模式
  },

  onLoad: function (options) {
    const categoryId = options.category
    const chapter = parseInt(options.chapter)
    const wrongIndex = options.wrongIndex ? parseInt(options.wrongIndex) : -1

    this.setData({
      categoryId: categoryId,
      chapter: chapter,
      examMode: options.examMode === '1',
      wrongIndex: wrongIndex  // 错题索引
    })

    this.initQuestions()
    this.initRewardedVideoAd()
  },

  initQuestions: function () {
    // 错题模式：直接从错题本加载
    if (this.data.wrongIndex >= 0) {
      const wrongQuestions = app.globalData.userData.wrongQuestions || [];
      if (wrongQuestions.length > this.data.wrongIndex) {
        const question = wrongQuestions[this.data.wrongIndex];
        this.setData({
          questions: [question],
          currentIndex: 0,
          currentQuestion: question,
          totalQuestions: 1,
          correctCount: 0,
          selectedAnswer: -1,
          selectedAnswers: [],
          showResult: false,
          progressPercent: 0,
          quizResults: [],
          hintUsed: false,
          questionType: this.getQuestionType(question)
        });
        console.log('🎯 错题练习模式，题目:', question);
        return;
      }
    }

    // 正常模式：加载章节题目
    const categoryQuestions = questionManager.getCategoryQuestions(this.data.categoryId);
    console.log('📚 加载的题库:', this.data.categoryId, categoryQuestions);
    if (!categoryQuestions || categoryQuestions.length === 0) {
      wx.showToast({
        title: '题库加载失败',
        icon: 'none'
      });
      return;
    }

    const chapterData = categoryQuestions.find(ch => ch.chapter === this.data.chapter);
    console.log('📖 章节数据:', chapterData);
    if (!chapterData) {
      wx.showToast({
        title: '章节不存在',
        icon: 'none'
      });
      return;
    }

    // 暂时不打乱题目，方便调试
    const shuffledQuestions = chapterData.questions;

    this.setData({
      questions: shuffledQuestions,
      currentIndex: 0,
      currentQuestion: shuffledQuestions[0],
      totalQuestions: shuffledQuestions.length,
      correctCount: 0,
      selectedAnswer: -1,
      selectedAnswers: [],
      showResult: false,
      progressPercent: 0,
      quizResults: [],
      hintUsed: false,
      questionType: this.getQuestionType(shuffledQuestions[0])
    });

    console.log('🎯 第一题数据:', shuffledQuestions[0]);
  },

  getQuestionType: function (question) {
    // 根据选项判断题型
    if (question.options.length === 2) {
      return 'judge'  // 判断题
    } else if (question.isMultiple) {
      return 'multiple'  // 多选题
    }
    return 'single'  // 单选题
  },

  initRewardedVideoAd: function () {
    adManager.initRewardedVideoAd()
  },

  selectOption: function (e) {
    if (this.data.showResult) return

    const index = e.currentTarget.dataset.index
    const question = this.data.currentQuestion

    if (this.data.questionType === 'multiple') {
      // 多选题处理
      let selected = [...this.data.selectedAnswers]
      const idx = selected.indexOf(index)
      if (idx >= 0) {
        selected.splice(idx, 1)
      } else {
        selected.push(index)
      }
      this.setData({
        selectedAnswers: selected
      })
    } else {
      // 单选题/判断题
      this.setData({
        selectedAnswer: index
      })
    }
  },

  confirmAnswer: function () {
    if (this.data.questionType === 'multiple') {
      if (this.data.selectedAnswers.length === 0) {
        wx.showToast({ title: '请选择答案', icon: 'none' });
        return;
      }
    }

    const question = this.data.currentQuestion;
    console.log('🔍 答题检查:', {
      selectedAnswer: this.data.selectedAnswer,
      correctAnswer: question.answer,
      options: question.options,
      questionType: this.data.questionType
    });

    let isCorrect = false;

    if (this.data.questionType === 'multiple') {
      // 多选题：检查是否完全匹配
      const correctAnswers = Array.isArray(question.answer) ? question.answer : [question.answer];
      isCorrect = correctAnswers.length === this.data.selectedAnswers.length &&
        correctAnswers.every(a => this.data.selectedAnswers.includes(a));
    } else {
      isCorrect = this.data.selectedAnswer === question.answer;
    }

    console.log('✅ 是否正确:', isCorrect);

    // 创建新的结果
    const newResult = {
      question: question.question,
      userAnswer: this.data.questionType === 'multiple' ? this.data.selectedAnswers : this.data.selectedAnswer,
      correctAnswer: question.answer,
      isCorrect: isCorrect
    };

    // 更新结果数组
    const newQuizResults = [...this.data.quizResults, newResult];

    this.setData({
      showResult: true,
      correctCount: isCorrect ? this.data.correctCount + 1 : this.data.correctCount,
      quizResults: newQuizResults
    });

    app.updateUserProgress(this.data.categoryId, this.data.chapter, isCorrect, question);
  },

  nextQuestion: function () {
    const nextIndex = this.data.currentIndex + 1

    if (nextIndex >= this.data.totalQuestions) {
      this.goToResult()
      return
    }

    const nextQuestion = this.data.questions[nextIndex]

    this.setData({
      currentIndex: nextIndex,
      currentQuestion: nextQuestion,
      selectedAnswer: -1,
      selectedAnswers: [],
      showResult: false,
      progressPercent: ((nextIndex + 1) / this.data.totalQuestions) * 100,
      hintUsed: false,
      questionType: this.getQuestionType(nextQuestion)
    })
  },

  goToResult: function () {
    const correctRate = (this.data.correctCount / this.data.totalQuestions) * 100
    const isPass = correctRate >= 60

    if (isPass) {
      app.unlockNextChapter(this.data.categoryId, this.data.chapter)
    }

    // 记录考试历史
    if (this.data.examMode) {
      const category = app.globalData.categories.find(c => c.id === this.data.categoryId)
      app.addExamHistory({
        categoryName: category?.name || this.data.categoryId,
        score: Math.round(correctRate),
        totalQuestions: this.data.totalQuestions,
        correctCount: this.data.correctCount
      })
    }

    wx.redirectTo({
      url: `/pages/result/result?category=${this.data.categoryId}&chapter=${this.data.chapter}&correct=${this.data.correctCount}&total=${this.data.totalQuestions}&pass=${isPass}&examMode=${this.data.examMode}`
    })
  },

  showHint: function () {
    if (this.data.hintUsed) {
      this.setData({
        showHintModal: true
      })
      return
    }

    wx.showModal({
      title: '观看视频获取提示',
      content: '观看一段短视频即可查看本题提示',
      confirmText: '观看视频',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          this.watchVideoForHint()
        }
      }
    })
  },

  watchVideoForHint: function () {
    wx.showLoading({ title: '加载广告中...' })

    adManager.showRewardedVideoAd(
      () => {
        wx.hideLoading()
        this.setData({
          hintUsed: true,
          showHintModal: true
        })
        wx.showToast({
          title: '获得提示！',
          icon: 'success'
        })
      },
      (err) => {
        wx.hideLoading()
        wx.showToast({
          title: '广告加载失败，请稍后再试',
          icon: 'none'
        })
      }
    )
  },

  closeHint: function () {
    this.setData({
      showHintModal: false
    })
  },

  toggleCollect: function () {
    const question = this.data.currentQuestion
    const isCollected = app.toggleCollectQuestion(question)
    wx.showToast({
      title: isCollected ? '已收藏' : '已取消',
      icon: 'success'
    })
  },

  // 上一题
  prevQuestion: function () {
    if (this.data.currentIndex <= 0) {
      wx.showToast({ title: '已经是第一题', icon: 'none' })
      return
    }

    const prevIndex = this.data.currentIndex - 1
    const prevQuestion = this.data.questions[prevIndex]

    this.setData({
      currentIndex: prevIndex,
      currentQuestion: prevQuestion,
      selectedAnswer: -1,
      selectedAnswers: [],
      showResult: false,
      progressPercent: ((prevIndex + 1) / this.data.totalQuestions) * 100,
      hintUsed: false,
      questionType: this.getQuestionType(prevQuestion)
    })
  }
})

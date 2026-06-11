// 题库管理器
let extraQuestions = null;

// 服务器地址配置
const SERVER_URL = 'http://localhost:3000';

// 安全地加载题库 - 每次都重新加载，保证最新
function safeLoadLocalQuestions() {
  try {
    // 优先加载医学题库
    try {
      const medicalData = require('../data/medical_questions.js');
      if (medicalData.pharmacist && Array.isArray(medicalData.pharmacist)) {
        console.log('✅ 加载医学题库成功');
        return medicalData;
      }
    } catch (e) {
      console.log('医学题库加载失败，尝试原题库:', e.message);
    }

    // 备用原题库
    const questionsData = require('../data/questions.js');
    if (questionsData.life && Array.isArray(questionsData.life)) {
      return questionsData;
    }
  } catch (e) {
    console.error('⚠️ 加载题库失败:', e.message);
    return generateFallbackQuestions();
  }
}

// 生成备用题库
function generateFallbackQuestions() {
  return {
    pharmacist: generateFallbackChapter('执业药师', 1),
    nurse: generateFallbackChapter('护士执业', 2),
    doctor: generateFallbackChapter('执业医师', 3)
  };
}

function generateFallbackChapter(categoryName, startId) {
  const result = [];
  let id = startId * 10000;

  for (let chapter = 1; chapter <= 10; chapter++) {
    const chapterQuestions = [];
    for (let i = 0; i < 5; i++) {
      chapterQuestions.push({
        id: id++,
        question: `${categoryName} 第${chapter}章 第${i + 1}题`,
        options: ['选项A', '选项B', '选项C', '选项D'],
        answer: 0,
        hint: '',
        explanation: ''
      });
    }
    result.push({
      chapter: chapter,
      questions: chapterQuestions
    });
  }
  return result;
}

// 加载额外题库
function loadExtraQuestions() {
  try {
    const extra = wx.getStorageSync('extraQuestions');
    if (extra && typeof extra === 'object') {
      return extra;
    }
  } catch (e) {
    console.error('⚠️ 加载额外题库失败:', e);
  }
  return {
    pharmacist: [],
    nurse: [],
    doctor: [],
    life: [],
    entertainment: [],
    history: [],
    general: []
  };
}

// 合并原始题库和额外题库
function mergeQuestions(original, extra) {
  const result = {};

  for (const category in original) {
    result[category] = JSON.parse(JSON.stringify(original[category]));

    if (extra[category] && extra[category].length > 0) {
      extra[category].forEach(q => {
        const targetChapter = q.difficulty === 'easy' ? 1 :
                            q.difficulty === 'medium' ? 4 : 8;

        const chapterData = result[category].find(ch => ch.chapter === targetChapter);
        if (chapterData) {
          chapterData.questions.push({
            id: q.id,
            question: q.question,
            options: q.options,
            answer: q.answer,
            hint: q.hint,
            explanation: q.explanation
          });
        }
      });
    }
  }

  return result;
}

class QuestionManager {
  constructor() {
    this.questions = null;
    this.localVersion = 1;
    this.remoteVersion = 0;
    this.isInitialized = false;
  }

  async init() {
    try {
      // 每次都重新加载本地题库，保证最新
      const original = safeLoadLocalQuestions();
      const extra = loadExtraQuestions();
      this.questions = mergeQuestions(original, extra);
      console.log('✅ 从本地文件加载题库');

      this.isInitialized = true;
      return true;
    } catch (e) {
      console.error('⚠️ 初始化题库管理器失败:', e);
      const original = safeLoadLocalQuestions();
      const extra = loadExtraQuestions();
      this.questions = mergeQuestions(original, extra);
      this.isInitialized = true;
      return false;
    }
  }

  async checkAndUpdate() {
    try {
      console.log('🔍 检查题库更新...');

      const versionRes = await this.request({
        url: `${SERVER_URL}/api/version`
      });

      if (!versionRes.success) {
        console.log('⚠️ 获取版本失败，使用本地');
        return false;
      }

      const remoteVersion = versionRes.version;
      console.log('📦 本地版本:', this.localVersion, '远程版本:', remoteVersion);

      if (remoteVersion > this.localVersion) {
        console.log('✨ 发现新版本，下载...');
        return await this.downloadAndUpdate(remoteVersion);
      } else {
        console.log('✅ 已是最新版本');
        return false;
      }
    } catch (e) {
      console.error('⚠️ 检查更新失败:', e);
      return false;
    }
  }

  async downloadAndUpdate(newVersion) {
    try {
      const downloadRes = await this.request({
        url: `${SERVER_URL}/api/download`
      });

      if (!downloadRes.success || !downloadRes.data) {
        console.error('❌ 下载失败');
        return false;
      }

      this.questions = downloadRes.data;
      this.localVersion = newVersion;

      wx.setStorageSync('cachedQuestions', downloadRes.data);
      wx.setStorageSync('cachedQuestionVersion', newVersion);

      console.log('✅ 题库更新成功！');
      return true;
    } catch (e) {
      console.error('⚠️ 下载题库失败:', e);
      return false;
    }
  }

  getQuestions() {
    if (!this.questions) {
      const original = safeLoadLocalQuestions();
      const extra = loadExtraQuestions();
      this.questions = mergeQuestions(original, extra);
    }
    return this.questions;
  }

  getCategoryQuestions(categoryId) {
    const questions = this.getQuestions();
    return questions[categoryId] || [];
  }

  getChapterQuestions(categoryId, chapter) {
    const categoryQuestions = this.getCategoryQuestions(categoryId);
    const chapterData = categoryQuestions.find(ch => ch.chapter === chapter);
    return chapterData ? chapterData.questions : [];
  }

  request(options) {
    return new Promise((resolve, reject) => {
      wx.request({
        ...options,
        timeout: 10000,
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data);
          } else {
            reject(new Error(`请求失败: ${res.statusCode}`));
          }
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  }

  setServerUrl(url) {
    SERVER_URL = url;
  }
}

const questionManager = new QuestionManager();
module.exports = questionManager;

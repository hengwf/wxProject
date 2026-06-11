# 益智闯关小程序 - Code Wiki

## 项目概述

**益智闯关**是一款微信小程序百科闯关答题应用，包含四个知识分类（生活常识、影视娱乐、历史人文、综合知识），每个分类有66个关卡，共计数千道题目。用户通过逐级闯关解锁新关卡，答对60%以上即可通关。

## 项目架构

```
wxProject-main/
├── app.js                 # 小程序主入口
├── app.json               # 小程序全局配置
├── app.wxss               # 小程序全局样式
├── pages/                 # 页面目录
│   ├── index/              # 首页 - 分类展示
│   ├── levels/             # 关卡列表页
│   ├── quiz/               # 答题页面
│   ├── result/             # 结果页面
│   ├── mine/               # 个人中心
│   ├── rules/              # 规则说明页
│   └── privacy/            # 隐私政策页
├── utils/                  # 工具模块
│   ├── questionManager.js   # 题库管理器
│   └── adManager.js         # 广告管理器
├── data/                   # 题库数据
│   ├── questions.js         # 原始题库
│   └── extra-questions.json # 额外题库
├── images/                 # 图片资源
│   └── tab/                # TabBar图标
├── admin/                  # 后台管理系统
│   ├── server.js           # Express服务器
│   ├── package.json        # 后台依赖
│   └── public/             # 静态文件
└── minitest/               # 测试配置
```

## 主要模块

### 1. 全局应用 (app.js)

**文件路径**: `app.js`

小程序主入口文件，负责全局状态管理和初始化。

#### 核心功能

| 函数/属性 | 说明 |
|-----------|------|
| `onLaunch()` | 小程序启动时初始化用户数据和题库管理器 |
| `initUserData()` | 初始化或从存储加载用户数据 |
| `initQuestionManager()` | 异步初始化题库管理器 |
| `updateTodayData()` | 更新每日答题数据（按日期重置） |
| `saveUserData()` | 保存用户数据到本地存储 |
| `updateUserProgress()` | 更新用户答题进度 |
| `unlockNextLevel()` | 通关后解锁下一关卡 |
| `globalData` | 全局数据容器 |

#### 全局数据结构

```javascript
globalData = {
  userData: {
    totalQuestions: Number,      // 总答题数
    correctCount: Number,        // 正确答题数
    unlockedLevels: {            // 各分类已解锁关卡
      life: Number,
      entertainment: Number,
      history: Number,
      general: Number
    },
    completedLevels: {},         // 已完成关卡记录
    categoryProgress: {          // 分类进度
      life: { completed: 0, total: 66 },
      entertainment: { completed: 0, total: 66 },
      history: { completed: 0, total: 66 },
      general: { completed: 0, total: 66 }
    },
    todayQuestions: Number,      // 今日答题数
    lastDate: String             // 上次答题日期
  },
  categories: [                  // 知识分类配置
    { id: 'life', name: '生活常识', icon: '🏠', color: '#52c41a' },
    { id: 'entertainment', name: '影视娱乐', icon: '🎬', color: '#f5a623' },
    { id: 'history', name: '历史人文', icon: '📜', color: '#9b59b6' },
    { id: 'general', name: '综合知识', icon: '🔬', color: '#3498db' }
  ]
}
```

---

### 2. 题库管理器 (utils/questionManager.js)

**文件路径**: `utils/questionManager.js`

负责题库的加载、缓存、更新和网络同步。

#### 类: QuestionManager

##### 主要方法

| 方法 | 说明 |
|------|------|
| `init()` | 异步初始化，加载缓存或本地题库 |
| `checkAndUpdate()` | 检查远程题库版本并更新 |
| `downloadAndUpdate(version)` | 下载并应用新版本题库 |
| `getQuestions()` | 获取完整题库 |
| `getCategoryQuestions(categoryId)` | 获取指定分类的所有题目 |
| `getLevelQuestions(categoryId, level)` | 获取指定关卡的题目 |
| `request(options)` | 封装微信网络请求 |

##### 题库数据结构

```javascript
questions = {
  life: [           // 生活常识分类
    {
      level: 1,     // 关卡1
      questions: [
        {
          id: 1,
          question: "题目内容",
          options: ["A选项", "B选项", "C选项", "D选项"],
          answer: 0,         // 正确答案索引
          hint: "提示信息",
          explanation: "答案解析"
        },
        // ... 5道题/关卡
      ]
    },
    // ... 66个关卡
  ],
  entertainment: [...],  // 影视娱乐
  history: [...],       // 历史人文
  general: [...]        // 综合知识
}
```

##### 难度分级

- **关卡 1-20**: 简单题 (easy)
- **关卡 21-40**: 中等题 (medium)
- **关卡 41-66**: 困难题 (hard)

---

### 3. 广告管理器 (utils/adManager.js)

**文件路径**: `utils/adManager.js`

封装微信小程序广告组件，提供Banner、插屏、激励视频三种广告类型。

#### 类: AdManager

##### 广告位配置

| 属性 | 默认值 |
|------|--------|
| `bannerAdUnitId` | 'adunit-你的Banner广告位ID' |
| `interstitialAdUnitId` | 'adunit-你的插屏广告位ID' |
| `rewardedVideoAdUnitId` | 'adunit-你的激励视频广告位ID' |

##### 主要方法

| 方法 | 说明 |
|------|------|
| `initBannerAd(adUnitId?)` | 初始化Banner广告 |
| `showBannerAd()` | 显示Banner广告 |
| `hideBannerAd()` | 隐藏Banner广告 |
| `destroyBannerAd()` | 销毁Banner广告 |
| `initInterstitialAd(adUnitId?)` | 初始化插屏广告 |
| `showInterstitialAd()` | 显示插屏广告 |
| `initRewardedVideoAd(adUnitId?)` | 初始化激励视频广告 |
| `showRewardedVideoAd(onSuccess, onError)` | 显示激励视频广告 |

---

### 4. 页面模块

#### 4.1 首页 (pages/index)

**文件**: `pages/index/index.js`

小程序首页，展示四个知识分类入口和用户统计数据。

##### 数据结构

```javascript
data: {
  categories: Array,           // 分类列表
  todayQuestions: Number,        // 今日答题数
  totalQuestions: Number,        // 累计答题数
  totalLevels: 66,              // 总关卡数
  currentTip: String             // 随机提示语
}
```

##### 关键函数

| 函数 | 说明 |
|------|------|
| `refreshData()` | 刷新页面数据 |
| `initBannerAd()` | 初始化Banner广告 |
| `getProgress(categoryId)` | 获取分类进度百分比 |
| `getCategoryProgress(categoryId)` | 获取分类进度文本 |
| `getUnlockedLevels(categoryId)` | 获取已解锁关卡数 |
| `goToLevels(e)` | 跳转关卡列表页 |

---

#### 4.2 关卡列表页 (pages/levels)

**文件**: `pages/levels/levels.js`

展示指定分类下的所有66个关卡及其状态。

##### 数据结构

```javascript
data: {
  categoryId: String,           // 分类ID
  currentCategory: Object,       // 当前分类信息
  categoryDesc: String,          // 分类描述
  levels: Array,                 // 关卡列表
  totalLevels: 66               // 总关卡数
}
```

##### 关卡状态

| 状态 | 说明 |
|------|------|
| `locked` | 已锁定（未解锁） |
| `available` | 可挑战 |
| `completed` | 已通关 |

---

#### 4.3 答题页面 (pages/quiz)

**文件**: `pages/quiz/quiz.js`

核心答题交互页面。

##### 数据结构

```javascript
data: {
  categoryId: String,
  level: Number,
  questions: Array,              // 当前关卡题目
  currentIndex: Number,          // 当前题目索引
  currentQuestion: Object,      // 当前题目
  selectedAnswer: Number,        // 用户选择的答案
  showResult: Boolean,          // 是否显示答题结果
  correctCount: Number,          // 正确题数
  totalQuestions: Number,        // 总题数
  showHintModal: Boolean,       // 是否显示提示弹窗
  progressPercent: Number,       // 答题进度百分比
  quizResults: Array,           // 答题结果记录
  hintUsed: Boolean             // 是否已使用提示
}
```

##### 关键函数

| 函数 | 说明 |
|------|------|
| `initQuestions()` | 初始化题目（随机排序） |
| `selectOption(e)` | 选择答案，处理答题逻辑 |
| `nextQuestion()` | 进入下一题 |
| `goToResult()` | 进入结果页（全部答完） |
| `showHint()` | 显示提示（需观看激励视频） |
| `watchVideoForHint()` | 观看视频获取提示 |
| `getOptionClass(index)` | 获取选项样式类 |

##### 答题规则

- 每关5道题目
- 答对60%（3题）以上即可通关
- 答错显示正确答案和解析
- 观看激励视频可获取当前题目的提示

---

#### 4.4 结果页面 (pages/result)

**文件**: `pages/result/result.js`

展示答题结果和通关状态。

##### 数据结构

```javascript
data: {
  categoryId: String,
  level: Number,
  correctCount: Number,
  totalQuestions: Number,
  isPass: Boolean,
  correctRate: Number,
  adShown: Boolean
}
```

##### 关键函数

| 函数 | 说明 |
|------|------|
| `getStars()` | 根据正确率获取星级评价 |
| `getComment()` | 获取评语文本 |
| `retry()` | 重新挑战本关 |
| `nextLevel()` | 进入下一关 |
| `backToLevels()` | 返回关卡列表 |

##### 星级评定

| 正确率 | 星级 |
|--------|------|
| 100% | ⭐⭐⭐⭐⭐ |
| 80%+ | ⭐⭐⭐⭐ |
| 60%+ | ⭐⭐⭐ |
| 40%+ | ⭐⭐ |
| <40% | ⭐ |

---

#### 4.5 个人中心 (pages/mine)

**文件**: `pages/mine/mine.js`

展示用户答题统计和个人数据管理。

##### 数据结构

```javascript
data: {
  userData: Object,
  categories: Array,
  correctRate: Number,
  totalCompletedLevels: Number,
  totalUnlockedLevels: Number
}
```

##### 关键函数

| 函数 | 说明 |
|------|------|
| `loadUserData()` | 加载用户数据 |
| `getCategoryProgress(categoryId)` | 获取分类进度文本 |
| `getProgressPercent(categoryId)` | 获取分类进度百分比 |
| `goToRules()` | 跳转规则页 |
| `goToPrivacy()` | 跳转隐私政策页 |
| `showAbout()` | 显示关于对话框 |
| `clearData()` | 清除所有用户数据 |

---

### 5. 题库数据 (data/questions.js)

**文件**: `data/questions.js`

本地题库，导出四个分类的题目。

#### 题目结构

```javascript
{
  id: Number,           // 题目ID
  question: String,     // 题目内容
  options: Array,       // 选项数组 [4项]
  answer: Number,       // 正确答案索引 0-3
  hint: String,        // 提示信息
  explanation: String   // 答案解析
}
```

#### 分类说明

| 分类ID | 名称 | 难度分级 |
|--------|------|----------|
| `life` | 生活常识 | 简单21题、中等20题、困难26题 |
| `entertainment` | 影视娱乐 | 简单20题、中等20题、困难26题 |
| `history` | 历史人文 | 简单20题、中等20题、困难31题 |
| `general` | 综合知识 | 简单20题、中等5题、困难5题 |

---

### 6. 后台管理系统 (admin/)

基于Node.js/Express的题库管理后台。

#### 服务器配置

**文件**: `admin/server.js`

```javascript
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
```

#### API接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/questions` | 获取全部题目 |
| GET | `/api/questions/:category` | 获取指定分类题目 |
| POST | `/api/questions` | 添加新题目 |
| DELETE | `/api/questions/:category/:id` | 删除额外题目 |
| GET | `/api/stats` | 获取题库统计信息 |
| GET | `/api/version` | 获取题库版本 |
| GET | `/api/download` | 下载完整题库 |
| GET | `/` | 后台管理首页 |

#### 添加题目接口

```
POST /api/questions
Content-Type: application/json

{
  "category": "life",
  "difficulty": "easy",
  "questionData": {
    "question": "题目内容",
    "options": ["A", "B", "C", "D"],
    "answer": 0,
    "hint": "提示",
    "explanation": "解析"
  }
}
```

---

## 依赖关系

### 小程序依赖

微信小程序原生API，无外部npm依赖。

### 后台系统依赖 (admin/package.json)

```json
{
  "express": "^4.18.2",
  "body-parser": "^1.20.2",
  "cors": "^2.8.5"
}
```

---

## 项目配置

### app.json - 全局配置

```json
{
  "pages": ["pages/index/index", ...],
  "window": {
    "navigationBarTitleText": "益智闯关"
  },
  "tabBar": {
    "list": [
      { "pagePath": "pages/index/index", "text": "首页" },
      { "pagePath": "pages/mine/mine", "text": "我的" }
    ]
  }
}
```

### project.config.json

微信开发者工具项目配置：
- `compileType`: "miniprogram"
- `appid`: "wx8326ea1180660f7d"

---

## 运行方式

### 微信小程序

1. 下载并安装微信开发者工具
2. 打开项目，选择 `wxProject-main` 目录
3. 修改 `appid` 为实际的小程序 appid
4. 点击"编译"运行

### 后台管理系统

```bash
cd admin
npm install
npm start
# 访问 http://localhost:3000
```

### 题库服务器地址

默认配置：`http://localhost:3000`

在 `utils/questionManager.js` 中修改 `SERVER_URL` 常量。

---

## 数据存储

### 本地存储键值

| 键名 | 说明 |
|------|------|
| `userData` | 用户答题数据 |
| `cachedQuestions` | 缓存的题库数据 |
| `cachedQuestionVersion` | 缓存题库版本 |
| `extraQuestions` | 额外题库数据 |

---

## 注意事项

1. **广告配置**: 需在微信公众平台申请广告位，替换 `adManager.js` 中的广告位ID
2. **题库安全**: 原题库文件 (`questions.js`) 受保护，后台只能添加额外题目到 `extra-questions.json`
3. **版本更新**: 题库更新通过检查文件修改时间判断版本号

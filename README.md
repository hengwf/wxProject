# 医考通 - 医学考试题库小程序

## 📋 项目简介

医考通是一个专注于执业医师、药师、护士等医学从业者考试的微信小程序，包含章节练习、错题本、模拟考试等功能。

## 🚀 快速开始

### 1. 小程序端运行

1. 下载并安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)

2. 打开微信开发者工具，选择「导入项目」

3. 选择项目目录：`d:\practise\wxProject-main`

4. 填写项目信息后点击「导入」

5. 项目会自动编译并在模拟器中运行

### 2. 后台管理系统运行

1. 确保已安装 Node.js (建议 v14+)

2. 进入后台目录并安装依赖：

```bash
cd d:\practise\wxProject-main\admin
npm install
```

3. 启动后台服务：

```bash
node server.js
```

4. 浏览器访问：`http://localhost:3000`

## 📁 项目结构

```
wxProject-main/
├── app.js                 # 小程序入口
├── app.json              # 小程序配置
├── app.wxss              # 全局样式
├── sitemap.json
├── pages/                # 页面目录
│   ├── index/            # 首页
│   ├── chapters/         # 章节列表
│   ├── quiz/             # 答题页
│   ├── result/           # 结果页
│   ├── wrong/            # 错题本
│   ├── exam/             # 模拟考试
│   ├── mine/             # 个人中心
│   └── vip/              # 会员中心
├── utils/
│   ├── questionManager.js    # 题库管理
│   └── adManager.js          # 广告管理
├── data/
│   ├── medical_questions.js  # 医学题库
│   └── questions.js          # 原题库
├── images/               # 图片资源
└── admin/                # 后台管理
    ├── server.js         # Express后端
    ├── package.json
    └── public/
        └── index.html    # 后台界面
```

## 📊 题库分类

| 分类 | 章节数 | 题目数 |
|------|--------|--------|
| 执业药师 | 10章 | 50题 |
| 护士执业 | 10章 | 50题 |
| 执业医师 | 10章 | 50题 |

*每章5题，共150题，可通过后台继续添加*

## 🔧 添加新题目

### 方法一：通过后台管理添加

1. 启动后台服务：`cd admin && node server.js`

2. 访问 `http://localhost:3000`

3. 选择分类（药师/护士/医师）

4. 点击「+ 添加题目」

5. 填写题目信息并保存

### 方法二：直接编辑题库文件

编辑 `data/medical_questions.js` 文件，按格式添加题目。

## 📱 小程序配置

### 1. 配置广告位ID

在 `utils/adManager.js` 中配置微信广告位ID：

```javascript
const BANNER_AD_ID = 'your-banner-ad-id';
const REWARDED_AD_ID = 'your-rewarded-ad-id';
const INTERSTITIAL_AD_ID = 'your-interstitial-ad-id';
```

### 2. 配置服务器地址

在 `utils/questionManager.js` 中修改服务器地址：

```javascript
const SERVER_URL = 'http://your-server-address:3000';
```

## 📝 注意事项

1. **首次运行**：建议先在微信开发者工具中运行，确保没有问题
2. **题库更新**：添加新题目后，小程序会自动检测更新
3. **数据安全**：后台管理系统新增的题目保存在 `data/extra-questions.json`，不会覆盖原始题库
4. **Tab图标**：当前使用临时图标，建议替换为您自己的图标（81x81 PNG）

## 🛠️ 常见问题

### Q: 小程序启动报错找不到页面？
A: 检查 `app.json` 中的页面路径是否正确

### Q: 后台启动失败？
A: 确保已安装依赖：`cd admin && npm install`

### Q: 题库不更新？
A: 检查后台服务是否正常运行，以及服务器地址配置

## 📄 许可证

MIT License

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const questionsPath = path.join(__dirname, '../data/questions.js');

function readQuestions() {
  try {
    const data = fs.readFileSync(questionsPath, 'utf8');
    const moduleExportsMatch = data.match(/module\.exports\s*=\s*(\{[\s\S]*\});?/);
    if (moduleExportsMatch) {
      return JSON.parse(moduleExportsMatch[1]);
    }
    return {};
  } catch (error) {
    console.error('读取题库文件失败:', error);
    return {};
  }
}

function writeQuestions(questions) {
  try {
    const content = `const questions = ${JSON.stringify(questions, null, 2)};\n\nmodule.exports = questions;`;
    fs.writeFileSync(questionsPath, content);
    return true;
  } catch (error) {
    console.error('写入题库文件失败:', error);
    return false;
  }
}

app.get('/api/questions', (req, res) => {
  const questions = readQuestions();
  res.json(questions);
});

app.get('/api/questions/:category', (req, res) => {
  const questions = readQuestions();
  const category = req.params.category;
  if (questions[category]) {
    res.json(questions[category]);
  } else {
    res.status(404).json({ error: '分类不存在' });
  }
});

app.post('/api/questions', (req, res) => {
  const questions = readQuestions();
  const { category, level, questionData } = req.body;
  
  if (!questions[category]) {
    questions[category] = [];
  }
  
  let levelData = questions[category].find(l => l.level === level);
  if (!levelData) {
    levelData = { level, questions: [] };
    questions[category].push(levelData);
  }
  
  const maxId = Math.max(...levelData.questions.map(q => q.id), 0);
  questionData.id = maxId + 1;
  levelData.questions.push(questionData);
  
  if (writeQuestions(questions)) {
    res.json({ success: true, message: '题目添加成功' });
  } else {
    res.status(500).json({ success: false, message: '保存失败' });
  }
});

app.put('/api/questions/:category/:level/:id', (req, res) => {
  const questions = readQuestions();
  const { category, level, id } = req.params;
  const questionData = req.body;
  
  if (!questions[category]) {
    return res.status(404).json({ error: '分类不存在' });
  }
  
  const levelData = questions[category].find(l => l.level === parseInt(level));
  if (!levelData) {
    return res.status(404).json({ error: '关卡不存在' });
  }
  
  const questionIndex = levelData.questions.findIndex(q => q.id === parseInt(id));
  if (questionIndex === -1) {
    return res.status(404).json({ error: '题目不存在' });
  }
  
  levelData.questions[questionIndex] = { ...levelData.questions[questionIndex], ...questionData };
  
  if (writeQuestions(questions)) {
    res.json({ success: true, message: '题目更新成功' });
  } else {
    res.status(500).json({ success: false, message: '保存失败' });
  }
});

app.delete('/api/questions/:category/:level/:id', (req, res) => {
  const questions = readQuestions();
  const { category, level, id } = req.params;
  
  if (!questions[category]) {
    return res.status(404).json({ error: '分类不存在' });
  }
  
  const levelData = questions[category].find(l => l.level === parseInt(level));
  if (!levelData) {
    return res.status(404).json({ error: '关卡不存在' });
  }
  
  const questionIndex = levelData.questions.findIndex(q => q.id === parseInt(id));
  if (questionIndex === -1) {
    return res.status(404).json({ error: '题目不存在' });
  }
  
  levelData.questions.splice(questionIndex, 1);
  
  if (writeQuestions(questions)) {
    res.json({ success: true, message: '题目删除成功' });
  } else {
    res.status(500).json({ success: false, message: '删除失败' });
  }
});

app.get('/api/stats', (req, res) => {
  const questions = readQuestions();
  const stats = {};
  let totalQuestions = 0;
  
  for (const category in questions) {
    const levels = questions[category];
    const categoryQuestions = levels.reduce((sum, level) => sum + level.questions.length, 0);
    stats[category] = {
      levels: levels.length,
      questions: categoryQuestions
    };
    totalQuestions += categoryQuestions;
  }
  
  stats.total = totalQuestions;
  res.json(stats);
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`后台管理系统运行在 http://localhost:${PORT}`);
});
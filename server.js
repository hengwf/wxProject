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

// 优先使用医学题库
const medicalQuestionsPath = path.join(__dirname, '../data/medical_questions.js');
const questionsPath = path.join(__dirname, '../data/questions.js');
const extraQuestionsPath = path.join(__dirname, '../data/extra-questions.json');

// 读取额外题库
function readExtraQuestions() {
  if (fs.existsSync(extraQuestionsPath)) {
    try {
      return JSON.parse(fs.readFileSync(extraQuestionsPath, 'utf8'));
    } catch (e) {
      return { pharmacist: [], nurse: [], doctor: [], life: [], entertainment: [], history: [], general: [] };
    }
  }
  return { pharmacist: [], nurse: [], doctor: [], life: [], entertainment: [], history: [], general: [] };
}

// 保存额外题库
function writeExtraQuestions(data) {
  fs.writeFileSync(extraQuestionsPath, JSON.stringify(data, null, 2), 'utf8');
}

// 读取原始题库 - 优先医学题库
function readOriginalQuestions() {
  try {
    delete require.cache[require.resolve(medicalQuestionsPath)];
    return require(medicalQuestionsPath);
  } catch (e) {
    console.log('医学题库加载失败，尝试使用原始题库');
    delete require.cache[require.resolve(questionsPath)];
    return require(questionsPath);
  }
}

// 获取合并后的题库
function getMergedQuestions() {
  const original = readOriginalQuestions();
  const extra = readExtraQuestions();
  
  const result = {};
  
  for (const category in original) {
    result[category] = JSON.parse(JSON.stringify(original[category]));
    
    if (extra[category] && extra[category].length > 0) {
      extra[category].forEach(q => {
        // 医学题库使用章节(chapter)，原来用关卡(level)
        const targetChapter = q.difficulty === 'easy' ? 1 : 
                            q.difficulty === 'medium' ? 4 : 8;
        
        const chapterData = result[category].find(l => l.chapter === targetChapter || l.level === targetChapter);
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

// 获取题库
app.get('/api/questions', (req, res) => {
  res.json(getMergedQuestions());
});

app.get('/api/questions/:category', (req, res) => {
  const merged = getMergedQuestions();
  res.json(merged[req.params.category] || []);
});

// 添加题目
app.post('/api/questions', (req, res) => {
  try {
    const { category, difficulty, questionData } = req.body;
    const extra = readExtraQuestions();
    
    if (!extra[category]) {
      extra[category] = [];
    }
    
    // 医学分类的ID前缀
    const idPrefix = category === 'pharmacist' ? 10000 :
                     category === 'nurse' ? 20000 :
                     category === 'doctor' ? 30000 :
                     difficulty === 'easy' ? 10000 : difficulty === 'medium' ? 20000 : 30000;
    
    const maxId = extra[category].length > 0 ? 
      Math.max(...extra[category].map(q => q.id)) : 
      idPrefix;
    
    const newQuestion = {
      id: maxId + 1,
      difficulty: difficulty,
      category: category,
      ...questionData
    };
    
    extra[category].push(newQuestion);
    writeExtraQuestions(extra);
    
    res.json({ 
      success: true, 
      message: `题目添加成功！已保存到额外题库，ID: ${newQuestion.id}` 
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: '添加失败' });
  }
});

// 删除额外添加的题目
app.delete('/api/questions/:category/:id', (req, res) => {
  try {
    const { category, id } = req.params;
    const extra = readExtraQuestions();
    
    if (!extra[category]) {
      return res.status(404).json({ success: false });
    }
    
    extra[category] = extra[category].filter(q => q.id != id);
    writeExtraQuestions(extra);
    
    res.json({ success: true, message: '删除成功' });
  } catch (e) {
    res.status(500).json({ success: false });
  }
});

// 更新暂时禁用
app.put('/api/questions/*', (req, res) => {
  res.json({ success: true, message: '更新功能暂时禁用' });
});

// 统计信息
app.get('/api/stats', (req, res) => {
  const merged = getMergedQuestions();
  const extra = readExtraQuestions();
  const stats = {};
  let totalQuestions = 0;
  let totalLevels = 0;
  
  for (const category in merged) {
    const chapters = merged[category];
    const count = chapters.reduce((sum, l) => sum + l.questions.length, 0);
    stats[category] = { 
      chapters: chapters.length, 
      questions: count,
      extra: (extra[category] || []).length
    };
    totalQuestions += count;
    totalLevels += chapters.length;
  }
  stats.total = totalQuestions;
  
  res.json(stats);
});

// 版本信息
app.get('/api/version', (req, res) => {
  try {
    let lastUpdate = 0;
    
    try {
      const stat1 = fs.statSync(medicalQuestionsPath);
      lastUpdate = Math.max(lastUpdate, stat1.mtime.getTime());
    } catch (e) {}
    
    try {
      const stat2 = fs.statSync(questionsPath);
      lastUpdate = Math.max(lastUpdate, stat2.mtime.getTime());
    } catch (e) {}
    
    if (fs.existsSync(extraQuestionsPath)) {
      const stat3 = fs.statSync(extraQuestionsPath);
      lastUpdate = Math.max(lastUpdate, stat3.mtime.getTime());
    }
    
    res.json({
      success: true,
      version: lastUpdate,
      lastUpdate: new Date(lastUpdate).toISOString()
    });
  } catch (e) {
    res.status(500).json({ success: false });
  }
});

// 下载题库
app.get('/api/download', (req, res) => {
  res.json({ success: true, data: getMergedQuestions() });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🏥 医考通题库管理后台已启动！`);
  console.log(`📱 访问地址：http://localhost:${PORT}`);
  console.log(`🛡️ 安全模式：新增题目不会破坏原始题库！`);
});

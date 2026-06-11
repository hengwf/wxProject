const fs = require('fs');
const path = require('path');

const questionsPath = path.join(__dirname, '../data/questions.js');

console.log('正在测试题库文件...');
try {
  // 先检查文件存在
  if (!fs.existsSync(questionsPath)) {
    console.error('❌ 题库文件不存在');
    process.exit(1);
  }
  
  console.log('✅ 题库文件存在');
  
  // 尝试读取
  const content = fs.readFileSync(questionsPath, 'utf8');
  console.log(`✅ 文件读取成功，共 ${content.length} 字符`);
  
  // 尝试用 require 加载
  delete require.cache[require.resolve(questionsPath)];
  const questions = require(questionsPath);
  
  console.log(`✅ 加载成功！`);
  console.log(`- 分类数量: ${Object.keys(questions).length}`);
  
  for (const cat in questions) {
    const levels = questions[cat];
    const totalQuestions = levels.reduce((sum, l) => sum + l.questions.length, 0);
    console.log(`- ${cat}: ${levels.length} 关，${totalQuestions} 题`);
  }
  
  console.log('\n🎉 题库文件一切正常！');
  
} catch (e) {
  console.error('❌ 错误:', e.message);
  console.error(e.stack);
}

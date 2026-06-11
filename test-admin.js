const fs = require('fs');
const path = require('path');

const questionsPath = path.join(__dirname, '../data/questions.js');

// 测试读取
console.log('正在测试读取题库...');
try {
  delete require.cache[require.resolve(questionsPath)];
  const questions = require(questionsPath);
  
  console.log('✅ 读取成功！');
  console.log('分类列表:', Object.keys(questions));
  
  for (const category in questions) {
    const levels = questions[category];
    console.log(`\n${category}: ${levels.length} 个关卡`);
    if (levels.length > 0) {
      console.log(`第1关有 ${levels[0].questions.length} 道题`);
      console.log('示例题目:', levels[0].questions[0]?.question);
    }
  }
  
  console.log('\n✅ 读取测试完成！');
} catch (error) {
  console.error('❌ 读取失败:', error);
}

console.log('\n====================\n');

console.log('管理后台已适配现有题库格式！');
console.log('使用方法:');
console.log('1. 进入 admin 目录: cd admin');
console.log('2. 安装依赖: npm install');
console.log('3. 启动服务: npm start');
console.log('4. 在浏览器打开: http://localhost:3000');

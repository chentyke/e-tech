// 数据库初始化脚本
const { execSync } = require('child_process');
const path = require('path');

console.log('正在初始化数据库...');

try {
  // 使用 ts-node 运行 seed 脚本
  execSync('npx tsx src/lib/seed.ts', {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit'
  });
  console.log('数据库初始化完成！');
} catch (error) {
  console.error('数据库初始化失败:', error.message);
  process.exit(1);
}


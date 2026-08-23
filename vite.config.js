import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // 使用相对路径，使构建结果既能部署到任意子目录，也能通过 file:// 直接打开。
  base: './',

  // 提供 JSX 转换、React Fast Refresh 和生产构建优化。
  plugins: [react()],
  build: {
    // 将生产产物放在仓库约定的 docs 目录，便于直接用于静态托管。
    outDir: 'docs',

    // 与 package.json 中的 Node 要求无关；这里控制浏览器端 JavaScript 输出级别。
    target: 'es2020',
  },
});

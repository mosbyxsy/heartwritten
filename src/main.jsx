import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/index.css';

// 应用只需要一个根节点。StrictMode 会在开发环境额外检查不安全的副作用，
// 例如未正确清理的定时器；生产构建不会因此重复渲染页面。
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

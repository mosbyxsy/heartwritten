# Heartwritten

> A love letter written in code.

一封会自己写出来的七夕情书。页面左侧逐字展示并实时应用 CSS，右侧随代码进度绘制爱心；生成完成后，点击爱心即可触发一场爱心雨。

## 功能特点

- 实时代码演示：逐字展示 CSS，并使用 PrismJS 完成语法高亮。
- 可控播放流程：支持暂停、继续、跳过动画和重新播放。
- 互动爱心舞台：代码生成完成后可反复触发爱心雨。
- 响应式布局：兼顾桌面端与移动端展示。
- 无障碍适配：支持键盘焦点，并尊重系统的“减少动态效果”设置。
- 单文件构建：生产构建会将 CSS 和 JavaScript 内联到 `docs/index.html`，可离线直接打开或用于静态托管。

## 技术栈

- React 19
- Vite 8
- PrismJS

## 本地运行

环境要求：Node.js 20.19+ 或 22.12+，以及 npm。

```bash
npm install
npm run dev
```

开发服务启动后，根据终端给出的地址在浏览器中访问页面。

## 构建与预览

```bash
npm run build
```

构建完成后，可直接双击 `docs/index.html` 查看，无需启动本地服务器；也可以通过本地服务器预览：

```bash
npm run preview
```

### npm 命令

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动 Vite 开发服务器 |
| `npm start` | `npm run dev` 的别名 |
| `npm run build:assets` | 生成常规的 CSS/JavaScript 静态资源构建 |
| `npm run build` | 构建静态资源并打包为单个 `docs/index.html` |
| `npm run preview` | 预览最近一次生产构建 |

## 项目目录与文件说明

```text
Heartwritten/
├─ index.html                    # Vite HTML 入口模板
├─ package.json                  # 项目信息、依赖与 npm 命令
├─ vite.config.js                # Vite 与 React 构建配置
├─ scripts/
│  └─ build-single-html.mjs      # 将构建后的 CSS/JS 内联为单 HTML
├─ src/
│  ├─ main.jsx                   # React 应用挂载入口
│  ├─ App.jsx                    # 页面布局、交互流程与模块编排
│  ├─ components/
│  │  ├─ HeartPreview.jsx        # 爱心舞台与完成状态展示
│  │  ├─ HeartRain.jsx           # 爱心雨粒子渲染层
│  │  └─ StyleEditor.jsx         # CSS 代码、高亮和进度展示
│  ├─ config/
│  │  └─ animation.js            # 打字速度、爱心雨数量和时长配置
│  ├─ content/
│  │  └─ loveStyle.js            # 逐字展示并实时应用的情书 CSS
│  ├─ hooks/
│  │  ├─ useCelebrationRain.js   # 爱心雨实例与定时器生命周期
│  │  ├─ usePrefersReducedMotion.js # 系统动态效果偏好监听
│  │  └─ useTypewriter.js        # 打字动画、进度及播放控制
│  └─ styles/
│     └─ index.css               # 页面基础样式与动画关键帧
└─ docs/                         # 单文件生产产物，可直接部署为静态站点
```

`node_modules/` 和编辑器配置已被忽略；`docs/index.html` 是可提交的生产产物，可用于 GitHub Pages 等静态托管服务。

## 自定义

- 修改情书文字、爱心成形过程或最终主题：编辑 `src/content/loveStyle.js`。
- 调整打字速度、爱心雨数量、持续时间：编辑 `src/config/animation.js`。
- 修改页面静态布局与基础视觉效果：编辑 `src/styles/index.css`。
- 修改标题、描述等页面元信息：编辑根目录的 `index.html`。

## 构建流程

`npm run build` 会先调用 Vite 把生产资源生成到 `docs/`，再由 `scripts/build-single-html.mjs` 读取本地 CSS 和 JavaScript，将其安全地内联到 HTML，最后移除不再需要的 `docs/assets/` 目录。最终交付物只有 `docs/index.html`。

## License

ISC

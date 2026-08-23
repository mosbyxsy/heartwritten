// 每个字符对应的理论播放间隔；数值越小，整段代码写完得越快。
export const CHARACTER_INTERVAL = 16;

// 限制 React 更新频率：累积到该时长后，才批量显示期间应出现的字符。
export const RENDER_INTERVAL = 32;

// 每次庆祝生成的爱心粒子数量。
export const RAIN_DROP_COUNT = 38;

// 一场爱心雨保留在 React 树中的时间，需覆盖最长“延迟 + 下落时长”。
export const RAIN_LIFETIME = 9000;

// 快速连续点击时最多并存的雨层数，防止 DOM 节点和动画无限叠加。
export const MAX_CONCURRENT_RAINS = 3;

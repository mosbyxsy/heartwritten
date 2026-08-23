import { memo, useMemo } from 'react';
import { createPortal } from 'react-dom';

/**
 * 创建一个带种子的伪随机数生成器（Mulberry32 的变体）。
 * 与 Math.random 不同，相同 seed 总会生成相同序列，因此 React 在开发模式
 * 额外渲染组件时，粒子的位置不会发生不可预测的变化。
 */
function createRandom(seed) {
  let state = seed >>> 0;

  return () => {
    state += 0x6D2B79F5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * 预先计算本场爱心雨中每个粒子的 CSS 自定义属性。
 * 动画期间浏览器只需读取变量并执行 CSS 关键帧，不必由 JavaScript 逐帧改样式。
 */
function createDrops(count, seed) {
  const random = createRandom(seed);
  const randomBetween = (min, max) => min + random() * (max - min);

  return Array.from({ length: count }, (_, index) => ({
    // id 在单场雨中稳定且唯一，只用于 React 列表协调。
    id: index,
    // 横向起点保留 2vw 边距，减少粒子紧贴视口边缘的情况。
    left: randomBetween(2, 98),
    // 错开延迟、下落时长和漂移量，避免所有爱心同步移动。
    delay: randomBetween(0, 2.6),
    duration: randomBetween(3.6, 6.2),
    drift: randomBetween(-120, 120),
    size: randomBetween(14, 30),
    rotate: randomBetween(-100, 100),
    opacity: randomBetween(0.55, 1),
  }));
}

/**
 * 单场全屏爱心雨。
 *
 * Portal 将覆盖层渲染到 document.body，避免受到 appShell 的层叠上下文、
 * 最大宽度或 overflow 约束；覆盖层本身禁用指针事件，不会挡住页面按钮。
 */
function HeartRain({ count = 36, seed = 1 }) {
  // count 或 seed 不变时复用粒子描述，普通父级重渲染不会重新计算布局。
  const drops = useMemo(() => createDrops(count, seed), [count, seed]);

  return createPortal(
    <div className="rainLayer" aria-hidden="true">
      {drops.map((drop) => (
        <span
          className="rainDrop"
          key={drop.id}
          style={{
            // CSS 自定义属性负责把本粒子的随机参数传给 index.css。
            '--left': `${drop.left}vw`,
            '--delay': `${drop.delay}s`,
            '--duration': `${drop.duration}s`,
            '--drift': `${drop.drift}px`,
            '--size': `${drop.size}px`,
            '--rotate': `${drop.rotate}deg`,
            '--opacity': drop.opacity,
          }}
        >❤</span>
      ))}
    </div>,
    document.body,
  );
}

export default memo(HeartRain);

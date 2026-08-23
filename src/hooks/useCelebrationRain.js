import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * 管理多场爱心雨的创建、并发上限和自动清理。
 *
 * rains 是渲染所需的公开状态；对应 ref 保存可被定时器和快速连续点击立即读取
 * 的最新数组，避免闭包捕获旧 state。每场雨都有独立定时器，并会在提前淘汰
 * 或组件卸载时主动取消。
 */
export default function useCelebrationRain({
  count = 36,
  lifetime = 9000,
  maxConcurrent = 3,
} = {}) {
  const [rains, setRains] = useState([]);

  // refs 的变化无需触发渲染，适合保存控制器内部的即时状态与资源句柄。
  const rainsRef = useRef([]);
  const sequenceRef = useRef(0);
  const timersRef = useRef(new Map());

  const celebrate = useCallback(() => {
    // 时间戳与自增序号组合，确保同一毫秒内的连续点击也拥有不同 React key。
    const sequence = sequenceRef.current;
    sequenceRef.current += 1;

    const id = `${Date.now()}-${sequence}`;
    const rain = { id, count, seed: sequence + 1 };

    // 新增一场之前只保留最近的 maxConcurrent - 1 场；至少允许新场景显示。
    const retainCount = Math.max(0, Math.floor(maxConcurrent) - 1);
    const retainedRains = retainCount === 0
      ? []
      : rainsRef.current.slice(-retainCount);
    const retainedIds = new Set(retainedRains.map((item) => item.id));

    // 达到并发上限时，旧雨层会立即退出；同时取消其尚未到期的清理定时器。
    rainsRef.current.forEach((item) => {
      if (retainedIds.has(item.id)) return;
      clearTimeout(timersRef.current.get(item.id));
      timersRef.current.delete(item.id);
    });

    const nextRains = [...retainedRains, rain];
    rainsRef.current = nextRains;
    setRains(nextRains);

    // CSS 动画结束后从 React 树移除 Portal，避免隐藏节点长期滞留在 body。
    const timer = setTimeout(() => {
      timersRef.current.delete(id);
      rainsRef.current = rainsRef.current.filter((item) => item.id !== id);
      setRains(rainsRef.current);
    }, Math.max(0, lifetime));

    timersRef.current.set(id, timer);
  }, [count, lifetime, maxConcurrent]);

  // 组件卸载时统一回收全部定时器，防止卸载后继续调用 setState。
  useEffect(() => () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current.clear();
    rainsRef.current = [];
  }, []);

  return { celebrate, rains };
}

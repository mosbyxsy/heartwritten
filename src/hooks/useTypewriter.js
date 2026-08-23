import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/**
 * 将完整文本按时间切成不断增长的可见片段，并提供播放控制。
 *
 * characterInterval 决定理论字符速度；renderInterval 决定最多多久更新一次
 * React 状态。二者分离后，可以一次追加多个字符，避免每个字符都触发一次
 * 渲染，同时仍能根据真实经过时间保持稳定播放速度。
 */
export default function useTypewriter(text, {
  characterInterval = 16,
  reducedMotion = false,
  renderInterval = 32,
} = {}) {
  // 用户偏好减少动画时，从第一帧起直接显示全文，避免先闪现空编辑器。
  const initialLength = reducedMotion ? text.length : 0;
  const [visibleLength, setVisibleLength] = useState(initialLength);
  const [isPlaying, setIsPlaying] = useState(!reducedMotion && text.length > 0);

  // 动画回调跨越多个浏览器帧，需要 ref 始终读取最新长度；若直接闭包捕获
  // visibleLength，会读到启动该 effect 时的旧值。
  const visibleLengthRef = useRef(initialLength);
  const isComplete = visibleLength >= text.length;

  useEffect(() => {
    // 已完成时无需再申请动画帧。
    if (isComplete) return undefined;

    // 偏好可能在播放中被系统设置改变，因此这里也要动态响应并立即完成。
    if (reducedMotion) {
      visibleLengthRef.current = text.length;
      setVisibleLength(text.length);
      setIsPlaying(false);
      return undefined;
    }

    if (!isPlaying) return undefined;

    // 防御无效配置，并保证一次渲染窗口至少覆盖一个字符间隔。
    const safeCharacterInterval = Math.max(1, characterInterval);
    const safeRenderInterval = Math.max(safeCharacterInterval, renderInterval);
    let frameId;
    let previousTime = performance.now();
    let elapsed = 0;

    const typeNext = (now) => {
      // 使用 rAF 提供的高精度时间，而不是假设每帧固定为 16ms；后台标签页、
      // 低刷新率设备或偶发卡顿后，字符进度仍能追上真实经过的时间。
      elapsed += now - previousTime;
      previousTime = now;

      if (elapsed >= safeRenderInterval) {
        // 把本窗口累计的时间换算成应新增的字符数，并保留不足一字符的余数。
        const count = Math.floor(elapsed / safeCharacterInterval);
        elapsed %= safeCharacterInterval;
        const nextLength = Math.min(visibleLengthRef.current + count, text.length);

        visibleLengthRef.current = nextLength;
        setVisibleLength(nextLength);

        // 到达末尾后不再申请下一帧，同时同步按钮的播放状态。
        if (nextLength >= text.length) {
          setIsPlaying(false);
          return;
        }
      }

      frameId = requestAnimationFrame(typeNext);
    };

    frameId = requestAnimationFrame(typeNext);

    // 暂停、完成、配置变化或组件卸载时取消旧帧，避免孤立回调继续更新状态。
    return () => cancelAnimationFrame(frameId);
  }, [characterInterval, isComplete, isPlaying, reducedMotion, renderInterval, text.length]);

  const restart = useCallback(() => {
    // 减少动态效果开启时“重新播放”仍保持全文，避免制造一次空白闪烁。
    const nextLength = reducedMotion ? text.length : 0;
    visibleLengthRef.current = nextLength;
    setVisibleLength(nextLength);
    setIsPlaying(!reducedMotion && text.length > 0);
  }, [reducedMotion, text.length]);

  const toggle = useCallback(() => {
    // 完成状态由外层解释为“重新播放”，这里仅处理未完成时的暂停/继续。
    if (!isComplete) setIsPlaying((playing) => !playing);
  }, [isComplete]);

  const finish = useCallback(() => {
    // “跳过动画”同步更新 ref 和 state，确保尚未执行的 rAF 也看见最新长度。
    visibleLengthRef.current = text.length;
    setVisibleLength(text.length);
    setIsPlaying(false);
  }, [text.length]);

  const currentText = useMemo(
    () => text.slice(0, visibleLength),
    [text, visibleLength],
  );

  // 空文本视为已完成，避免除以零得到 NaN。
  const progress = text.length === 0
    ? 100
    : Math.round((visibleLength / text.length) * 100);

  return {
    currentText,
    finish,
    isComplete,
    isPlaying,
    progress,
    restart,
    toggle,
  };
}

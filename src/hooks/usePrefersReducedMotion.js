import { useEffect, useState } from 'react';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

// 延迟读取浏览器能力，使初始化只执行一次，并兼容未来可能的服务端渲染环境。
function getInitialPreference() {
  return typeof window !== 'undefined'
    && window.matchMedia?.(REDUCED_MOTION_QUERY).matches === true;
}

/**
 * 订阅系统“减少动态效果”偏好。
 * 返回值会随系统设置实时变化，调用方可以立即停止或跳过非必要动画。
 */
export default function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(getInitialPreference);

  useEffect(() => {
    // SSR 或极旧环境不存在 window/matchMedia 时，维持默认的 false。
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;

    const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
    const updatePreference = (event) => setPrefersReducedMotion(event.matches);

    setPrefersReducedMotion(mediaQuery.matches);

    // 现代浏览器将 MediaQueryList 实现为 EventTarget。
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', updatePreference);
      return () => mediaQuery.removeEventListener('change', updatePreference);
    }

    // addListener/removeListener 是旧版 Safari 等浏览器使用的兼容接口。
    mediaQuery.addListener(updatePreference);
    return () => mediaQuery.removeListener(updatePreference);
  }, []);

  return prefersReducedMotion;
}

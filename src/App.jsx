import { useCallback, useEffect, useRef } from 'react';
import HeartPreview from './components/HeartPreview';
import HeartRain from './components/HeartRain';
import StyleEditor from './components/StyleEditor';
import {
  CHARACTER_INTERVAL,
  MAX_CONCURRENT_RAINS,
  RAIN_DROP_COUNT,
  RAIN_LIFETIME,
  RENDER_INTERVAL,
} from './config/animation';
import loveStyle from './content/loveStyle';
import useCelebrationRain from './hooks/useCelebrationRain';
import usePrefersReducedMotion from './hooks/usePrefersReducedMotion';
import useTypewriter from './hooks/useTypewriter';

/**
 * 应用根组件只负责组合页面与协调交互：
 * 1. useTypewriter 管理左侧代码的播放进度；
 * 2. 当前已展示的 CSS 会由 StyleEditor 实时注入页面；
 * 3. 代码完成后启用右侧爱心，并由 useCelebrationRain 管理庆祝动画。
 *
 * 将具体算法放进 Hook 后，这里可以保持为清晰的“页面流程图”。
 */
export default function App() {
  const reducedMotion = usePrefersReducedMotion();

  // StyleEditor 通过 ref 暴露滚动方法，App 无需了解其内部 DOM 结构。
  const editorRef = useRef(null);

  // 防止完成状态下因组件重渲染而重复触发自动爱心雨。
  const celebrated = useRef(false);

  // 打字速度集中放在 config/animation.js，方便只改配置而不改业务代码。
  const {
    currentText: currentCode,
    finish,
    isComplete,
    isPlaying,
    progress,
    restart,
    toggle,
  } = useTypewriter(loveStyle, {
    characterInterval: CHARACTER_INTERVAL,
    reducedMotion,
    renderInterval: RENDER_INTERVAL,
  });

  // 爱心雨的实例数量与清理定时器由 Hook 统一维护，卸载时也会自动回收。
  const { celebrate, rains } = useCelebrationRain({
    count: RAIN_DROP_COUNT,
    lifetime: RAIN_LIFETIME,
    maxConcurrent: MAX_CONCURRENT_RAINS,
  });

  // 仅在一行代码完成或全文结束时滚到底部，避免每增加一个字符都滚动，
  // 从而减少布局计算并保留更自然的阅读节奏。
  useEffect(() => {
    if (!currentCode.endsWith('\n') && !isComplete) return undefined;
    const frameId = requestAnimationFrame(() => editorRef.current?.scrollToBottom());
    return () => cancelAnimationFrame(frameId);
  }, [currentCode, isComplete]);

  // 动画自然播放完成时自动庆祝一次。“减少动态效果”开启时跳过该动画，
  // 同时保留用户主动点击爱心的交互入口。
  useEffect(() => {
    if (isComplete && !reducedMotion && !celebrated.current) {
      celebrated.current = true;
      celebrate();
    }
  }, [celebrate, isComplete, reducedMotion]);

  // 重新播放前重置自动庆祝标记，使下一次自然播放结束后仍会庆祝。
  const restartAnimation = useCallback(() => {
    celebrated.current = false;
    restart();
  }, [restart]);

  // 主按钮复用两种语义：播放过程中负责暂停/继续，完成后负责重新播放。
  const togglePlayback = useCallback(() => {
    if (isComplete) restartAnimation();
    else toggle();
  }, [isComplete, restartAnimation, toggle]);

  return (
    <div className="appShell">
      {/* 环境光与纹理只负责装饰，对辅助技术隐藏。 */}
      <div className="ambient" aria-hidden="true">
        <span className="ambientOrb" />
        <span className="ambientOrb" />
        <span className="noise" />
      </div>

      {/* 顶栏展示品牌与当前生成状态。 */}
      <header className="topbar">
        <div className="brand">
          <span className="brandMark" aria-hidden="true">♥</span>
          <div>
            <span className="eyebrow">A LOVE LETTER WRITTEN IN CODE</span>
            <h1>Heartwritten</h1>
          </div>
        </div>
        <div className="statusPill">
          <span className={isComplete ? 'done' : ''} />
          {isComplete ? '心动已送达' : `正在生成 ${progress}%`}
        </div>
      </header>

      {/* 工作区由实时代码面板和爱心预览舞台组成。 */}
      <main className="workspace">
        <StyleEditor
          ref={editorRef}
          code={currentCode}
          progress={progress}
          isTyping={isPlaying && !isComplete}
        />
        <HeartPreview enabled={isComplete} onCelebrate={celebrate} />
      </main>

      {/* 所有播放控制均使用原生 button，保留键盘操作与禁用语义。 */}
      <footer className="controlBar">
        <div className="controls">
          <button type="button" className="controlButton primary" onClick={togglePlayback}>
            <span aria-hidden="true">{isComplete ? '↻' : isPlaying ? 'Ⅱ' : '▶'}</span>
            {isComplete ? '再看一次' : isPlaying ? '暂停' : '继续'}
          </button>
          {!isComplete && (
            <button type="button" className="controlButton" onClick={finish}>
              跳过动画
            </button>
          )}
          <button
            type="button"
            className="controlButton"
            onClick={celebrate}
            disabled={!isComplete}
          >
            撒下爱心
          </button>
        </div>
        <p><span aria-hidden="true">✦</span> 每一行代码，都是爱！</p>
      </footer>

      {/* 每次庆祝对应一个独立的全屏 Portal；到期后由 Hook 从数组中移除。 */}
      {rains.map((rain) => (
        <HeartRain key={rain.id} count={rain.count} seed={rain.seed} />
      ))}
    </div>
  );
}

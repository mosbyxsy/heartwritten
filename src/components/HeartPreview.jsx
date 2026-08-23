import { memo } from 'react';

/**
 * 右侧爱心预览舞台。
 *
 * enabled 表示情书 CSS 是否已完整生成：未完成时按钮禁用，完成后才允许
 * 调用 onCelebrate。视觉上的爱心成形过程由逐步注入的 loveStyle CSS 驱动，
 * 因此组件本身不需要保存额外动画状态。
 */
function HeartPreview({ enabled, onCelebrate }) {
  return (
    <section className="heartWrapper panel" aria-label="爱心动画舞台">
      {/* 标题区同时告诉用户当前是构建中还是可交互状态。 */}
      <header className="panelHeader stageHeader">
        <span>LOVE PREVIEW</span>
        <span className={`liveDot ${enabled ? 'isReady' : ''}`}>
          {enabled ? 'READY' : 'BUILDING'}
        </span>
      </header>

      {/* 轨道、闪光和双层心形都由 CSS 负责定位及动画。 */}
      <div className="heartScene">
        <span className="orbit orbitOne" aria-hidden="true" />
        <span className="orbit orbitTwo" aria-hidden="true" />
        <span className="spark sparkOne" aria-hidden="true">✦</span>
        <span className="spark sparkTwo" aria-hidden="true">✦</span>
        <span className="spark sparkThree" aria-hidden="true">·</span>
        <button
          className="heartButton"
          type="button"
          onClick={onCelebrate}
          disabled={!enabled}
          aria-label={enabled ? '点击放一场爱心雨' : '爱心还在生成中'}
        >
          {/* heartEcho 是扩散光晕，第二个 heartShape 是可见的主体。 */}
          <span className="heartShape heartEcho" aria-hidden="true" />
          <span className="heartShape" aria-hidden="true" />
        </button>
      </div>

      {/* 保持节点常驻，仅切换 class，可让显隐过渡平滑连续。 */}
      <div className={`loveMessage ${enabled ? 'isVisible' : ''}`}>
        <strong>七夕快乐</strong>
        <span>{enabled ? '点击爱心，把浪漫洒满屏幕' : '正在用代码拼好这一颗心…'}</span>
      </div>
    </section>
  );
}

export default memo(HeartPreview);

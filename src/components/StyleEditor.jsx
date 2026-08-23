import {
  forwardRef,
  memo,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import Prism from 'prismjs';

/**
 * 左侧代码编辑器外观组件。
 *
 * 它同时承担三项职责：展示 Prism 高亮后的 CSS、把当前代码放进 <style>
 * 实时应用到页面，以及通过 ref 向父组件提供“滚动到底部”的最小命令接口。
 */
const StyleEditor = memo(forwardRef(function StyleEditor({ code, progress, isTyping }, ref) {
  const wrapperRef = useRef(null);

  // Prism.highlight 的结果只由 code 决定；父组件因其他状态重渲染时可直接复用。
  const highlightedCode = useMemo(
    () => Prism.highlight(code, Prism.languages.css, 'css'),
    [code],
  );

  // useImperativeHandle 避免父组件直接持有内部滚动容器 DOM，降低组件耦合。
  useImperativeHandle(ref, () => ({
    scrollToBottom() {
      wrapperRef.current?.scrollTo({
        top: wrapperRef.current.scrollHeight,
        behavior: 'auto',
      });
    },
  }), []);

  return (
    <section className={`styleEditor panel ${isTyping ? 'isTyping' : ''}`} aria-label="正在生成的 CSS 代码">
      {/*
        loveStyle 是项目内置的可信静态字符串。将已显示部分写入 style 后，
        浏览器会随着打字进度逐步应用规则，从而形成“代码画出爱心”的效果。
      */}
      <style>{code}</style>
      <header className="panelHeader">
        <div className="windowDots" aria-hidden="true"><i /><i /><i /></div>
        <span>love-letter.css</span>
        <span className="typingState">
          {isTyping ? '编写中' : progress < 100 ? '已暂停' : '已完成'}
        </span>
      </header>
      <div className="codeViewport" ref={wrapperRef}>
        {/* Prism 返回带 token class 的 HTML；输入不来自用户或网络。 */}
        <pre><code dangerouslySetInnerHTML={{ __html: highlightedCode }} /></pre>
      </div>
      {/* 使用原生 progressbar 语义，让辅助技术能读取准确的百分比。 */}
      <div
        className="codeProgress"
        role="progressbar"
        aria-label="代码生成进度"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow={progress}
      >
        <span style={{ width: `${progress}%` }} />
      </div>
    </section>
  );
}));

export default StyleEditor;

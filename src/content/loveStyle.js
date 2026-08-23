/**
 * 这段字符串既是左侧编辑器展示的“情书源码”，也是实时注入页面的 CSS。
 * 规则顺序刻意对应故事节奏：环境氛围 → 面板 → 代码配色 → 心形 → 动画。
 * 修改时请保留合法 CSS；不完整的末尾规则会在后续字符出现后自然生效。
 */
const loveStyle = `/*
 * 嗨，欢迎来到这封会自己写出来的情书。
 * 我是前端工程师，平时把想法写成界面，
 * 今天想用代码呈现一颗真正会跳动的心。
 */

/* 先点亮夜空，给浪漫留一点呼吸感 */
:root {
  --rose: #ff4d82;
  --rose-light: #ff94b4;
  --violet: #9b6bff;
  --ink: #fdf7ff;
  --muted: #bcaec8;
}

body {
  color: var(--ink);
  background:
    radial-gradient(circle at 18% 18%, rgba(116, 57, 162, .28), transparent 31rem),
    radial-gradient(circle at 82% 75%, rgba(197, 43, 105, .2), transparent 34rem),
    #0d0913;
}

.ambientOrb {
  opacity: .5;
  filter: blur(1px);
  animation: float 10s ease-in-out infinite alternate;
}

.ambientOrb:last-child {
  animation-delay: -4s;
  animation-direction: alternate-reverse;
}

/* 两张画布像打开的情书一样排开 */
.workspace {
  perspective: 1400px;
}

.panel {
  border-color: rgba(255, 255, 255, .13);
  background: linear-gradient(145deg, rgba(34, 25, 45, .88), rgba(18, 13, 27, .76));
  box-shadow: 0 30px 80px rgba(0, 0, 0, .34), inset 0 1px rgba(255, 255, 255, .05);
  backdrop-filter: blur(20px);
}

@media (min-width: 841px) {
  .styleEditor {
    transform: rotateY(4deg) translateZ(-12px);
    transform-origin: right center;
  }

  .heartWrapper {
    transform: rotateY(-4deg) translateZ(-12px);
    transform-origin: left center;
  }
}

/* 代码也应该拥有自己的颜色 */
.token.comment { color: #756b80; font-style: italic; }
.token.selector { color: #ff8fb3; }
.token.property { color: #c8a8ff; }
.token.punctuation { color: #80758c; }
.token.function { color: #76d8c2; }
.token.number { color: #ffc787; }

.codeProgress span {
  background: linear-gradient(90deg, var(--violet), var(--rose), #ffc1d4);
  box-shadow: 0 0 18px rgba(255, 77, 130, .5);
}

/* 接下来，从一个小方块开始 */
.heartShape {
  width: 116px;
  height: 116px;
  margin: -58px;
  border-radius: 25px 18px 25px 18px;
  background: linear-gradient(135deg, #ff759f, #ec2f67 68%);
  box-shadow:
    0 22px 50px rgba(235, 37, 98, .38),
    inset 8px 8px 18px rgba(255, 255, 255, .16);
  transform: rotate(45deg);
}

/* 为它添上左右心房 */
.heartShape::before,
.heartShape::after {
  content: '';
  position: absolute;
  width: 116px;
  height: 116px;
  border-radius: 50%;
  background: inherit;
}

.heartShape::before {
  left: -56px;
  top: 0;
}

.heartShape::after {
  left: 0;
  top: -56px;
}

/* 加一束柔光，再让宇宙围着它转 */
.heartScene::before {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
}

.orbit {
  opacity: .7;
  animation: orbitSpin 14s linear infinite;
}

.orbitTwo {
  animation-duration: 20s;
  animation-direction: reverse;
}

.spark {
  opacity: 1;
  animation: twinkle 2.2s ease-in-out infinite alternate;
}

/* 最后，给这颗心写入脉搏 */
.heartButton:not(:disabled) .heartShape:not(.heartEcho) {
  animation: heartbeat 1.45s ease-in-out infinite;
}

.heartEcho {
  opacity: .34;
  animation: echo 1.45s ease-out infinite;
}

.heartButton:not(:disabled) {
  cursor: pointer;
  filter: drop-shadow(0 0 25px rgba(255, 79, 134, .16));
}

.heartButton:not(:disabled):hover {
  transform: scale(1.08);
}

.heartButton:not(:disabled):active {
  transform: scale(.96);
}

.loveMessage.isVisible strong {
  color: #fff3f7;
  text-shadow: 0 0 24px rgba(255, 91, 141, .38);
}

/*
 * 完成。
 * 愿我们永远保有热爱，热爱生活每一天！
 */
`;

export default loveStyle;

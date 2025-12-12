# CSS 面试题

## 基础概念

### 1. CSS 选择器有哪些？优先级如何计算？

**答案：**

**选择器类型：**

| 类型 | 示例 | 权重 |
|------|------|------|
| ID 选择器 | `#id` | 100 |
| 类选择器 | `.class` | 10 |
| 属性选择器 | `[type="text"]` | 10 |
| 伪类选择器 | `:hover` | 10 |
| 元素选择器 | `div` | 1 |
| 伪元素选择器 | `::before` | 1 |
| 通配符选择器 | `*` | 0 |
| 关系选择器 | `>`, `+`, `~`, ` ` | 0 |

**优先级计算：**
1. `!important` > 内联样式 > ID > 类/属性/伪类 > 元素/伪元素
2. 同级别按照权重相加比较
3. 权重相同时，后面的覆盖前面的

```css
/* 权重计算示例 */
#nav .list li a:hover    /* 100 + 10 + 1 + 1 + 10 = 122 */
.nav .list li.active a   /* 10 + 10 + 1 + 10 + 1 = 32 */
```

---

### 2. 盒模型是什么？标准盒模型和 IE 盒模型有什么区别？

**答案：**

盒模型由四部分组成：`content` + `padding` + `border` + `margin`

**标准盒模型（content-box）：**
- `width/height` = content
- 总宽度 = width + padding + border

**IE 盒模型（border-box）：**
- `width/height` = content + padding + border
- 总宽度 = width

```css
/* 标准盒模型（默认） */
.box {
  box-sizing: content-box;
  width: 100px;
  padding: 10px;
  border: 5px solid;
  /* 实际宽度 = 100 + 10*2 + 5*2 = 130px */
}

/* IE 盒模型 */
.box {
  box-sizing: border-box;
  width: 100px;
  padding: 10px;
  border: 5px solid;
  /* 实际宽度 = 100px，content = 100 - 10*2 - 5*2 = 70px */
}

/* 推荐全局设置 */
*, *::before, *::after {
  box-sizing: border-box;
}
```

---

### 3. BFC 是什么？如何创建 BFC？有什么用？

**答案：**

BFC（Block Formatting Context）块级格式化上下文，是一个独立的渲染区域。

**创建 BFC 的方式：**
```css
/* 1. float 不为 none */
.bfc { float: left; }

/* 2. position 为 absolute 或 fixed */
.bfc { position: absolute; }

/* 3. display 为 inline-block、flex、grid、table-cell 等 */
.bfc { display: inline-block; }
.bfc { display: flow-root; } /* 推荐，专门创建 BFC */

/* 4. overflow 不为 visible */
.bfc { overflow: hidden; }
.bfc { overflow: auto; }
```

**BFC 的作用：**

**1. 清除浮动（包含浮动元素）：**
```css
.parent {
  overflow: hidden; /* 创建 BFC，包含浮动子元素 */
}
```

**2. 防止 margin 重叠：**
```html
<div class="box">Box 1</div>
<div class="bfc">
  <div class="box">Box 2</div>
</div>
```

**3. 阻止元素被浮动元素覆盖：**
```css
.float { float: left; width: 100px; }
.content { overflow: hidden; } /* 创建 BFC，不会被浮动元素覆盖 */
```

---

### 4. 什么是外边距重叠（Margin Collapse）？如何解决？

**答案：**

相邻的块级元素的垂直外边距会合并为一个外边距，取较大值。

**发生场景：**
1. 相邻兄弟元素
2. 父元素与第一个/最后一个子元素
3. 空的块级元素

```css
/* 场景 1：相邻兄弟 */
.box1 { margin-bottom: 20px; }
.box2 { margin-top: 30px; }
/* 实际间距 = 30px（取大值），而非 50px */

/* 场景 2：父子元素 */
.parent { margin-top: 20px; }
.child { margin-top: 30px; }
/* child 的 margin-top 会"穿透"到 parent 外部 */
```

**解决方法：**

```css
/* 1. 创建 BFC */
.parent { overflow: hidden; }

/* 2. 设置 padding 或 border */
.parent { padding-top: 1px; }
.parent { border-top: 1px solid transparent; }

/* 3. 使用 flexbox */
.parent { display: flex; flex-direction: column; }
```

---

### 5. position 有哪些值？各有什么特点？

**答案：**

| 值 | 特点 | 参照物 |
|----|------|--------|
| `static` | 默认值，正常文档流 | - |
| `relative` | 相对定位，保留原位置 | 自身原位置 |
| `absolute` | 绝对定位，脱离文档流 | 最近的非 static 祖先元素 |
| `fixed` | 固定定位，脱离文档流 | 视口（viewport） |
| `sticky` | 粘性定位，正常流 + 固定 | 最近的滚动祖先 |

```css
/* relative */
.box {
  position: relative;
  top: 10px;
  left: 20px;
  /* 视觉上移动，但原位置仍占用空间 */
}

/* absolute */
.box {
  position: absolute;
  top: 0;
  right: 0;
  /* 相对于最近的定位祖先 */
}

/* fixed */
.header {
  position: fixed;
  top: 0;
  width: 100%;
  /* 相对于视口固定 */
}

/* sticky */
.nav {
  position: sticky;
  top: 0;
  /* 滚动到顶部时固定 */
}
```

---

### 6. Flexbox 布局详解

**答案：**

**容器属性：**
```css
.container {
  display: flex;

  /* 主轴方向 */
  flex-direction: row | row-reverse | column | column-reverse;

  /* 换行 */
  flex-wrap: nowrap | wrap | wrap-reverse;

  /* 简写 */
  flex-flow: row wrap;

  /* 主轴对齐 */
  justify-content: flex-start | flex-end | center | space-between | space-around | space-evenly;

  /* 交叉轴对齐（单行） */
  align-items: stretch | flex-start | flex-end | center | baseline;

  /* 交叉轴对齐（多行） */
  align-content: stretch | flex-start | flex-end | center | space-between | space-around;

  /* 间距 */
  gap: 10px;
  row-gap: 10px;
  column-gap: 20px;
}
```

**项目属性：**
```css
.item {
  /* 排列顺序 */
  order: 0;

  /* 放大比例 */
  flex-grow: 0;

  /* 缩小比例 */
  flex-shrink: 1;

  /* 基础尺寸 */
  flex-basis: auto;

  /* 简写 */
  flex: 0 1 auto; /* grow shrink basis */
  flex: 1; /* 等于 flex: 1 1 0% */

  /* 单独对齐 */
  align-self: auto | flex-start | flex-end | center | baseline | stretch;
}
```

**常见布局示例：**
```css
/* 水平垂直居中 */
.center {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 两端对齐 */
.space-between {
  display: flex;
  justify-content: space-between;
}

/* 等分布局 */
.equal {
  display: flex;
}
.equal > * {
  flex: 1;
}

/* 固定 + 自适应 */
.sidebar-layout {
  display: flex;
}
.sidebar { width: 200px; }
.content { flex: 1; }
```

---

### 7. Grid 布局详解

**答案：**

**容器属性：**
```css
.container {
  display: grid;

  /* 定义列 */
  grid-template-columns: 100px 200px auto;
  grid-template-columns: repeat(3, 1fr);
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));

  /* 定义行 */
  grid-template-rows: 100px auto 100px;

  /* 间距 */
  gap: 10px;
  row-gap: 10px;
  column-gap: 20px;

  /* 区域命名 */
  grid-template-areas:
    "header header header"
    "sidebar content content"
    "footer footer footer";

  /* 隐式网格 */
  grid-auto-rows: 100px;
  grid-auto-columns: 100px;
  grid-auto-flow: row | column | dense;

  /* 对齐 */
  justify-items: start | end | center | stretch;
  align-items: start | end | center | stretch;
  justify-content: start | end | center | stretch | space-around | space-between | space-evenly;
  align-content: start | end | center | stretch | space-around | space-between | space-evenly;
}
```

**项目属性：**
```css
.item {
  /* 位置 */
  grid-column: 1 / 3;      /* 从第1列到第3列 */
  grid-column: span 2;      /* 跨2列 */
  grid-row: 1 / 2;

  /* 区域名称 */
  grid-area: header;

  /* 单独对齐 */
  justify-self: start | end | center | stretch;
  align-self: start | end | center | stretch;
}
```

**经典布局示例：**
```css
/* 圣杯布局 */
.holy-grail {
  display: grid;
  grid-template-columns: 200px 1fr 200px;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "header header header"
    "left main right"
    "footer footer footer";
  min-height: 100vh;
}

.header { grid-area: header; }
.left { grid-area: left; }
.main { grid-area: main; }
.right { grid-area: right; }
.footer { grid-area: footer; }
```

---

### 8. 如何实现水平垂直居中？

**答案：**

```css
/* 1. Flexbox（推荐） */
.parent {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 2. Grid */
.parent {
  display: grid;
  place-items: center;
}

/* 3. 绝对定位 + transform */
.child {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* 4. 绝对定位 + margin auto（需要固定宽高） */
.child {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  margin: auto;
  width: 100px;
  height: 100px;
}

/* 5. 绝对定位 + 负 margin（需要知道宽高） */
.child {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100px;
  height: 100px;
  margin-top: -50px;
  margin-left: -50px;
}

/* 6. table-cell */
.parent {
  display: table-cell;
  vertical-align: middle;
  text-align: center;
}
```

---

### 9. 如何实现两栏布局和三栏布局？

**答案：**

**两栏布局（左固定，右自适应）：**

```css
/* 1. Flexbox */
.container {
  display: flex;
}
.left {
  width: 200px;
}
.right {
  flex: 1;
}

/* 2. Grid */
.container {
  display: grid;
  grid-template-columns: 200px 1fr;
}

/* 3. float + BFC */
.left {
  float: left;
  width: 200px;
}
.right {
  overflow: hidden; /* 创建 BFC */
}

/* 4. float + margin */
.left {
  float: left;
  width: 200px;
}
.right {
  margin-left: 200px;
}
```

**三栏布局（左右固定，中间自适应）：**

```css
/* 1. Flexbox */
.container {
  display: flex;
}
.left, .right {
  width: 200px;
}
.center {
  flex: 1;
}

/* 2. Grid */
.container {
  display: grid;
  grid-template-columns: 200px 1fr 200px;
}

/* 3. 圣杯布局 */
.container {
  padding: 0 200px;
}
.center {
  float: left;
  width: 100%;
}
.left {
  float: left;
  width: 200px;
  margin-left: -100%;
  position: relative;
  left: -200px;
}
.right {
  float: left;
  width: 200px;
  margin-left: -200px;
  position: relative;
  right: -200px;
}

/* 4. 双飞翼布局 */
.center {
  float: left;
  width: 100%;
}
.center-inner {
  margin: 0 200px;
}
.left {
  float: left;
  width: 200px;
  margin-left: -100%;
}
.right {
  float: left;
  width: 200px;
  margin-left: -200px;
}
```

---

### 10. 如何清除浮动？

**答案：**

```css
/* 1. 伪元素清除（推荐） */
.clearfix::after {
  content: '';
  display: block;
  clear: both;
}

/* 2. 创建 BFC */
.parent {
  overflow: hidden;
}

/* 3. display: flow-root */
.parent {
  display: flow-root;
}

/* 4. 额外标签 */
<div class="clear" style="clear: both;"></div>
```

---

### 11. 响应式设计与媒体查询

**答案：**

**媒体查询语法：**
```css
/* 基本语法 */
@media screen and (max-width: 768px) {
  /* 样式 */
}

/* 常见断点 */
/* 手机 */
@media (max-width: 767px) { }

/* 平板 */
@media (min-width: 768px) and (max-width: 1023px) { }

/* 桌面 */
@media (min-width: 1024px) { }

/* 大屏 */
@media (min-width: 1200px) { }

/* 打印 */
@media print { }

/* 深色模式 */
@media (prefers-color-scheme: dark) { }

/* 减少动画 */
@media (prefers-reduced-motion: reduce) { }

/* 横屏/竖屏 */
@media (orientation: landscape) { }
@media (orientation: portrait) { }
```

**响应式单位：**
```css
/* 相对单位 */
.box {
  font-size: 1rem;    /* 相对于根元素字体大小 */
  font-size: 1em;     /* 相对于父元素字体大小 */
  width: 50vw;        /* 视口宽度的 50% */
  height: 50vh;       /* 视口高度的 50% */
  width: 50vmin;      /* vw 和 vh 中的较小值 */
  width: 50vmax;      /* vw 和 vh 中的较大值 */
  width: 50%;         /* 相对于父元素 */
}

/* clamp 函数 */
.title {
  font-size: clamp(1rem, 2.5vw, 2rem);
  /* 最小 1rem，首选 2.5vw，最大 2rem */
}
```

---

### 12. CSS 动画和过渡

**答案：**

**过渡（Transition）：**
```css
.box {
  transition: all 0.3s ease;
  /* 等价于 */
  transition-property: all;
  transition-duration: 0.3s;
  transition-timing-function: ease;
  transition-delay: 0s;
}

/* 多个属性 */
.box {
  transition: width 0.3s ease, height 0.3s ease 0.1s;
}

/* 缓动函数 */
transition-timing-function: ease | ease-in | ease-out | ease-in-out | linear;
transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
transition-timing-function: steps(4, end);
```

**动画（Animation）：**
```css
/* 定义关键帧 */
@keyframes slide-in {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* 或使用百分比 */
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

/* 应用动画 */
.box {
  animation: slide-in 0.5s ease forwards;
  /* 等价于 */
  animation-name: slide-in;
  animation-duration: 0.5s;
  animation-timing-function: ease;
  animation-delay: 0s;
  animation-iteration-count: 1; /* infinite 无限循环 */
  animation-direction: normal; /* reverse, alternate, alternate-reverse */
  animation-fill-mode: forwards; /* none, forwards, backwards, both */
  animation-play-state: running; /* paused */
}
```

**性能优化：**
```css
/* 使用 transform 和 opacity 触发 GPU 加速 */
.box {
  transform: translateZ(0);
  will-change: transform;
}

/* 避免动画以下属性（会触发重排） */
/* width, height, top, left, margin, padding, border */
```

---

### 13. CSS 预处理器（Sass/Less）

**答案：**

**变量：**
```scss
// Sass
$primary-color: #007bff;
$spacing: 16px;

.button {
  color: $primary-color;
  padding: $spacing;
}
```

**嵌套：**
```scss
.nav {
  ul {
    margin: 0;
    li {
      display: inline-block;
      a {
        color: white;
        &:hover {
          color: yellow;
        }
      }
    }
  }
}
```

**Mixin：**
```scss
@mixin flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

@mixin button($bg-color) {
  background: $bg-color;
  padding: 10px 20px;
  &:hover {
    background: darken($bg-color, 10%);
  }
}

.card {
  @include flex-center;
}
.btn {
  @include button(#007bff);
}
```

**继承：**
```scss
%message-base {
  padding: 10px;
  border-radius: 4px;
}

.success {
  @extend %message-base;
  background: green;
}

.error {
  @extend %message-base;
  background: red;
}
```

**函数：**
```scss
@function rem($px) {
  @return ($px / 16) * 1rem;
}

.title {
  font-size: rem(24); // 1.5rem
}
```

---

### 14. CSS 变量（自定义属性）

**答案：**

```css
/* 定义变量 */
:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --spacing-unit: 8px;
  --font-size-base: 16px;
}

/* 使用变量 */
.button {
  color: var(--primary-color);
  padding: calc(var(--spacing-unit) * 2);
  font-size: var(--font-size-base, 14px); /* 带默认值 */
}

/* 局部变量 */
.card {
  --card-padding: 20px;
  padding: var(--card-padding);
}

/* JavaScript 操作 */
// 获取
getComputedStyle(document.documentElement).getPropertyValue('--primary-color');

// 设置
document.documentElement.style.setProperty('--primary-color', '#ff0000');
```

**深色模式切换：**
```css
:root {
  --bg-color: white;
  --text-color: black;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg-color: #1a1a1a;
    --text-color: white;
  }
}

/* 或通过类切换 */
[data-theme="dark"] {
  --bg-color: #1a1a1a;
  --text-color: white;
}
```

---

### 15. 移动端适配方案

**答案：**

**1. Viewport 设置：**
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
```

**2. rem 方案：**
```javascript
// 动态设置根字体大小
function setRem() {
  const width = document.documentElement.clientWidth;
  const rem = width / 10; // 设计稿宽度 / 10
  document.documentElement.style.fontSize = rem + 'px';
}
setRem();
window.addEventListener('resize', setRem);
```

**3. vw/vh 方案：**
```css
/* 设计稿 375px，1vw = 3.75px */
.box {
  width: 26.67vw;  /* 100px */
  font-size: 4.27vw; /* 16px */
}

/* 配合 postcss-px-to-viewport 自动转换 */
```

**4. 1px 问题解决：**
```css
/* 伪元素 + transform */
.border-1px {
  position: relative;
}
.border-1px::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 1px;
  background: #000;
  transform: scaleY(0.5);
  transform-origin: bottom;
}

/* 或使用 box-shadow */
.border-1px {
  box-shadow: 0 1px 0 0 #000;
}
```

---

### 16. 什么是层叠上下文（Stacking Context）？

**答案：**

层叠上下文是 HTML 元素的三维概念，决定了元素在 Z 轴上的显示顺序。

**创建层叠上下文的方式：**
```css
/* 1. 根元素 html */

/* 2. position 非 static 且 z-index 非 auto */
.ctx { position: relative; z-index: 1; }

/* 3. position: fixed / sticky */
.ctx { position: fixed; }

/* 4. flexbox/grid 子元素且 z-index 非 auto */
.flex-child { z-index: 1; }

/* 5. opacity 小于 1 */
.ctx { opacity: 0.99; }

/* 6. transform 非 none */
.ctx { transform: translateZ(0); }

/* 7. filter 非 none */
.ctx { filter: blur(0); }

/* 8. isolation: isolate */
.ctx { isolation: isolate; }

/* 9. will-change */
.ctx { will-change: transform; }

/* 10. contain: layout / paint */
.ctx { contain: paint; }
```

**层叠顺序（从低到高）：**
1. 背景和边框
2. 负 z-index
3. 块级盒子
4. 浮动盒子
5. 行内盒子
6. z-index: 0 / auto
7. 正 z-index

---

### 17. CSS 模块化方案有哪些？

**答案：**

**1. BEM 命名规范：**
```css
/* Block__Element--Modifier */
.card { }
.card__title { }
.card__title--large { }
.card--featured { }
```

**2. CSS Modules：**
```css
/* Button.module.css */
.button {
  padding: 10px;
}
.primary {
  background: blue;
}
```
```jsx
import styles from './Button.module.css';
<button className={styles.button}>Click</button>
```

**3. CSS-in-JS（styled-components）：**
```jsx
import styled from 'styled-components';

const Button = styled.button`
  padding: 10px 20px;
  background: ${props => props.primary ? 'blue' : 'white'};

  &:hover {
    opacity: 0.8;
  }
`;

<Button primary>Click</Button>
```

**4. Tailwind CSS（原子化）：**
```html
<button class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
  Click
</button>
```

---

### 18. 如何实现文本溢出省略？

**答案：**

**单行省略：**
```css
.ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

**多行省略（Webkit）：**
```css
.ellipsis-multi {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

**多行省略（兼容方案）：**
```css
.ellipsis-multi {
  position: relative;
  line-height: 1.5em;
  max-height: 4.5em; /* line-height * 行数 */
  overflow: hidden;
}

.ellipsis-multi::after {
  content: '...';
  position: absolute;
  right: 0;
  bottom: 0;
  padding-left: 20px;
  background: linear-gradient(to right, transparent, white 50%);
}
```

---

### 19. CSS 性能优化有哪些方法？

**答案：**

**1. 选择器优化：**
```css
/* 避免 */
div.container ul li a { }
*::before { }

/* 推荐 */
.nav-link { }
```

**2. 减少重排重绘：**
```css
/* 使用 transform 代替位置属性 */
.move {
  transform: translateX(100px);
  /* 而不是 left: 100px */
}

/* 使用 opacity 代替 visibility */
.hide {
  opacity: 0;
  /* 而不是 visibility: hidden 或 display: none */
}
```

**3. 硬件加速：**
```css
.accelerate {
  transform: translateZ(0);
  will-change: transform;
}
```

**4. 关键 CSS 内联：**
```html
<style>
  /* 首屏关键样式 */
</style>
```

**5. CSS 代码压缩和合并**

**6. 使用 CSS containment：**
```css
.card {
  contain: content; /* layout, paint, size, content, strict */
}
```

---

### 20. 如何实现自定义滚动条样式？

**答案：**

```css
/* Webkit 浏览器 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Firefox */
.scroll-container {
  scrollbar-width: thin;
  scrollbar-color: #888 #f1f1f1;
}

/* 隐藏滚动条但保持滚动 */
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
```

---

### 21. 如何实现暗黑模式？

**答案：**

```css
/* 使用 CSS 变量 */
:root {
  --bg-color: #ffffff;
  --text-color: #333333;
  --border-color: #e0e0e0;
}

/* 系统偏好 */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-color: #1a1a1a;
    --text-color: #ffffff;
    --border-color: #333333;
  }
}

/* 手动切换 */
[data-theme="dark"] {
  --bg-color: #1a1a1a;
  --text-color: #ffffff;
  --border-color: #333333;
}

/* 应用 */
body {
  background-color: var(--bg-color);
  color: var(--text-color);
}
```

```javascript
// JavaScript 切换
function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
}

// 初始化
const savedTheme = localStorage.getItem('theme') ||
  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
document.documentElement.setAttribute('data-theme', savedTheme);
```

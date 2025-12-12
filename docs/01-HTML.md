# HTML 面试题

## 基础概念

### 1. 什么是 HTML5？相比 HTML4 有哪些新特性？

**答案：**

HTML5 是 HTML 的第五个主要版本，主要新特性包括：

**语义化标签：**
- `<header>` - 页头
- `<footer>` - 页脚
- `<nav>` - 导航
- `<article>` - 文章
- `<section>` - 区块
- `<aside>` - 侧边栏
- `<main>` - 主要内容
- `<figure>` / `<figcaption>` - 图片及说明

**多媒体支持：**
- `<video>` - 视频
- `<audio>` - 音频
- `<canvas>` - 画布
- `<svg>` - 矢量图形

**表单增强：**
- 新的 input 类型：`email`、`url`、`number`、`range`、`date`、`color` 等
- 新属性：`placeholder`、`required`、`autofocus`、`pattern` 等

**API 增强：**
- Web Storage（localStorage、sessionStorage）
- Web Workers
- WebSocket
- Geolocation API
- Drag and Drop API
- History API

---

### 2. DOCTYPE 的作用是什么？

**答案：**

DOCTYPE（文档类型声明）用于告诉浏览器使用哪种 HTML 或 XHTML 规范来解析文档。

```html
<!DOCTYPE html>
```

**作用：**
1. **触发标准模式**：让浏览器以标准模式渲染页面，而不是怪异模式（Quirks Mode）
2. **指定文档类型**：告诉浏览器使用哪个版本的 HTML/XHTML 规范

**标准模式 vs 怪异模式：**
- 标准模式：浏览器按照 W3C 标准解析渲染
- 怪异模式：浏览器使用自己的方式解析，可能导致不同浏览器表现不一致

---

### 3. 什么是语义化？为什么要语义化？

**答案：**

语义化是指使用恰当的 HTML 标签来表达内容的含义和结构。

**好处：**
1. **可读性**：代码结构清晰，便于开发者阅读和维护
2. **可访问性**：屏幕阅读器等辅助设备能更好地解析内容
3. **SEO 友好**：搜索引擎能更好地理解页面结构和内容
4. **样式丢失可用**：即使 CSS 加载失败，页面仍有清晰的结构

**语义化示例：**

```html
<!-- 不语义化 -->
<div class="header">
  <div class="nav">...</div>
</div>
<div class="content">...</div>
<div class="footer">...</div>

<!-- 语义化 -->
<header>
  <nav>...</nav>
</header>
<main>
  <article>...</article>
</main>
<footer>...</footer>
```

---

### 4. meta 标签有哪些常用属性？

**答案：**

```html
<!-- 字符编码 -->
<meta charset="UTF-8">

<!-- 视口设置（移动端适配） -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">

<!-- SEO 相关 -->
<meta name="description" content="页面描述">
<meta name="keywords" content="关键词1,关键词2">
<meta name="author" content="作者">

<!-- HTTP 等效头 -->
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta http-equiv="refresh" content="5;url=http://example.com">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'">

<!-- 社交媒体（Open Graph） -->
<meta property="og:title" content="标题">
<meta property="og:description" content="描述">
<meta property="og:image" content="图片URL">

<!-- 禁止缓存 -->
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
<meta http-equiv="Pragma" content="no-cache">
<meta http-equiv="Expires" content="0">
```

---

### 5. src 和 href 的区别？

**答案：**

| 属性 | 含义 | 行为 | 使用元素 |
|------|------|------|----------|
| `src` | Source（资源） | 下载并替换当前元素 | `<script>`、`<img>`、`<iframe>`、`<video>` |
| `href` | Hypertext Reference（超文本引用） | 建立链接关系 | `<a>`、`<link>` |

**区别：**

1. **src**：浏览器会暂停其他资源的下载和处理，直到该资源加载完成（阻塞）
2. **href**：浏览器会并行下载资源，不会阻塞页面解析

```html
<!-- src：替换元素内容 -->
<script src="app.js"></script>
<img src="image.png">

<!-- href：建立引用关系 -->
<link href="style.css" rel="stylesheet">
<a href="page.html">链接</a>
```

---

### 6. script 标签的 async 和 defer 属性有什么区别？

**答案：**

```html
<!-- 普通 -->
<script src="script.js"></script>

<!-- async -->
<script async src="script.js"></script>

<!-- defer -->
<script defer src="script.js"></script>
```

| 属性 | 下载 | 执行时机 | 执行顺序 |
|------|------|----------|----------|
| 无 | 阻塞 HTML 解析 | 下载完立即执行 | 按顺序 |
| `async` | 并行下载 | 下载完立即执行（可能中断 HTML 解析） | 不保证顺序 |
| `defer` | 并行下载 | HTML 解析完成后，DOMContentLoaded 之前 | 按顺序 |

**使用场景：**
- `async`：独立脚本，如统计分析脚本
- `defer`：需要操作 DOM 或有依赖关系的脚本

---

### 7. 什么是 Web Components？

**答案：**

Web Components 是一套浏览器原生支持的组件化技术，包含三个主要技术：

**1. Custom Elements（自定义元素）：**
```javascript
class MyComponent extends HTMLElement {
  constructor() {
    super();
    this.innerHTML = '<p>Hello World</p>';
  }

  connectedCallback() {
    console.log('元素被添加到 DOM');
  }

  disconnectedCallback() {
    console.log('元素从 DOM 移除');
  }
}

customElements.define('my-component', MyComponent);
```

**2. Shadow DOM（影子 DOM）：**
```javascript
class MyComponent extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>
        p { color: red; } /* 样式隔离 */
      </style>
      <p>Shadow DOM Content</p>
    `;
  }
}
```

**3. HTML Templates（HTML 模板）：**
```html
<template id="my-template">
  <style>
    .container { padding: 10px; }
  </style>
  <div class="container">
    <slot name="title"></slot>
    <slot></slot>
  </div>
</template>
```

---

### 8. Canvas 和 SVG 的区别？

**答案：**

| 特性 | Canvas | SVG |
|------|--------|-----|
| 类型 | 位图（像素） | 矢量图 |
| 缩放 | 失真 | 不失真 |
| DOM | 无 DOM 节点 | 有 DOM 节点 |
| 事件 | 需手动计算 | 支持事件绑定 |
| 性能 | 大量图形时更好 | 少量复杂图形更好 |
| 适用场景 | 游戏、图像处理、数据可视化 | 图标、图表、地图 |

```html
<!-- Canvas -->
<canvas id="canvas" width="200" height="200"></canvas>
<script>
  const ctx = document.getElementById('canvas').getContext('2d');
  ctx.fillStyle = 'red';
  ctx.fillRect(10, 10, 100, 100);
</script>

<!-- SVG -->
<svg width="200" height="200">
  <rect x="10" y="10" width="100" height="100" fill="red" />
</svg>
```

---

### 9. 如何处理 HTML5 的浏览器兼容性问题？

**答案：**

**1. 使用 HTML5 Shiv/Shim：**
```html
<!--[if lt IE 9]>
  <script src="html5shiv.js"></script>
<![endif]-->
```

**2. 特性检测：**
```javascript
// 检测 Canvas 支持
if (document.createElement('canvas').getContext) {
  // 支持 Canvas
}

// 使用 Modernizr
if (Modernizr.canvas) {
  // 支持 Canvas
}
```

**3. Polyfill：**
```html
<script src="https://polyfill.io/v3/polyfill.min.js"></script>
```

---

### 10. 什么是 Data Attributes？如何使用？

**答案：**

Data Attributes（数据属性）允许在 HTML 元素上存储自定义数据。

```html
<div id="user"
     data-id="123"
     data-user-name="张三"
     data-role="admin">
</div>
```

**JavaScript 访问：**
```javascript
const user = document.getElementById('user');

// 使用 dataset
console.log(user.dataset.id);        // "123"
console.log(user.dataset.userName);  // "张三"（驼峰命名）
console.log(user.dataset.role);      // "admin"

// 使用 getAttribute
console.log(user.getAttribute('data-id')); // "123"
```

**CSS 访问：**
```css
/* 属性选择器 */
[data-role="admin"] {
  color: red;
}

/* content 属性 */
.user::before {
  content: attr(data-user-name);
}
```

---

### 11. 行内元素、块级元素、行内块元素有哪些？有什么区别？

**答案：**

**块级元素：**
- `<div>`、`<p>`、`<h1>`-`<h6>`、`<ul>`、`<ol>`、`<li>`、`<table>`、`<form>`、`<header>`、`<footer>`、`<section>`、`<article>`

**行内元素：**
- `<span>`、`<a>`、`<strong>`、`<em>`、`<i>`、`<b>`、`<label>`、`<code>`、`<br>`

**行内块元素：**
- `<img>`、`<input>`、`<button>`、`<select>`、`<textarea>`

| 特性 | 块级元素 | 行内元素 | 行内块元素 |
|------|----------|----------|------------|
| 独占一行 | 是 | 否 | 否 |
| 设置宽高 | 可以 | 不可以 | 可以 |
| 默认宽度 | 100% | 内容宽度 | 内容宽度 |
| 包含元素 | 可包含块级和行内 | 只能包含行内 | - |
| margin/padding | 完全有效 | 水平有效，垂直不影响布局 | 完全有效 |

---

### 12. iframe 有哪些优缺点？

**答案：**

**优点：**
1. 隔离性好，不影响主页面
2. 可以加载跨域内容
3. 并行加载，不阻塞主页面
4. 适合嵌入第三方内容（广告、视频、地图等）

**缺点：**
1. **SEO 不友好**：搜索引擎难以索引 iframe 内容
2. **性能问题**：增加 HTTP 请求，阻塞主页面 onload 事件
3. **用户体验**：无法被浏览器前进/后退
4. **安全风险**：可能被点击劫持攻击
5. **响应式困难**：高度自适应复杂

**安全属性：**
```html
<iframe
  src="https://example.com"
  sandbox="allow-scripts allow-same-origin"
  referrerpolicy="no-referrer"
></iframe>
```

---

### 13. 如何实现浏览器内多个标签页之间的通信？

**答案：**

**1. localStorage + storage 事件：**
```javascript
// 发送页面
localStorage.setItem('message', JSON.stringify({
  data: 'Hello',
  timestamp: Date.now()
}));

// 接收页面
window.addEventListener('storage', (e) => {
  if (e.key === 'message') {
    console.log(JSON.parse(e.newValue));
  }
});
```

**2. BroadcastChannel API：**
```javascript
// 创建频道
const channel = new BroadcastChannel('my_channel');

// 发送消息
channel.postMessage('Hello from tab 1');

// 接收消息
channel.onmessage = (e) => {
  console.log(e.data);
};
```

**3. SharedWorker：**
```javascript
// worker.js
const connections = [];
onconnect = (e) => {
  const port = e.ports[0];
  connections.push(port);
  port.onmessage = (e) => {
    connections.forEach(p => p.postMessage(e.data));
  };
};

// 页面
const worker = new SharedWorker('worker.js');
worker.port.onmessage = (e) => console.log(e.data);
worker.port.postMessage('Hello');
```

**4. Service Worker：**
```javascript
// 通过 postMessage 和 clients API 实现
```

---

### 14. 什么是 Web Worker？如何使用？

**答案：**

Web Worker 允许在后台线程中运行 JavaScript，不阻塞主线程。

**主线程：**
```javascript
// 创建 Worker
const worker = new Worker('worker.js');

// 发送消息
worker.postMessage({ type: 'start', data: [1, 2, 3] });

// 接收消息
worker.onmessage = (e) => {
  console.log('Result:', e.data);
};

// 错误处理
worker.onerror = (e) => {
  console.error('Worker error:', e.message);
};

// 终止 Worker
worker.terminate();
```

**Worker 线程（worker.js）：**
```javascript
self.onmessage = (e) => {
  const { type, data } = e.data;

  if (type === 'start') {
    // 执行耗时操作
    const result = data.map(x => x * 2);
    self.postMessage(result);
  }
};
```

**限制：**
- 不能访问 DOM
- 不能访问 window 对象
- 不能访问 document 对象
- 同源限制

---

### 15. 如何优化关键渲染路径？

**答案：**

**1. 优化 CSS：**
```html
<!-- 关键 CSS 内联 -->
<style>
  /* 首屏关键样式 */
</style>

<!-- 非关键 CSS 异步加载 -->
<link rel="preload" href="styles.css" as="style" onload="this.rel='stylesheet'">
```

**2. 优化 JavaScript：**
```html
<!-- 使用 defer 或 async -->
<script defer src="app.js"></script>

<!-- 预加载关键脚本 -->
<link rel="preload" href="critical.js" as="script">
```

**3. 资源优先级提示：**
```html
<!-- 预连接 -->
<link rel="preconnect" href="https://api.example.com">

<!-- DNS 预解析 -->
<link rel="dns-prefetch" href="https://cdn.example.com">

<!-- 预加载 -->
<link rel="preload" href="font.woff2" as="font" crossorigin>

<!-- 预获取 -->
<link rel="prefetch" href="next-page.html">
```

**4. 减少关键资源：**
- 压缩 HTML/CSS/JS
- 移除不必要的代码
- 代码分割
- 图片懒加载

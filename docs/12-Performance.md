# 前端性能优化面试题

## 性能指标

### 1. 常见性能指标有哪些？

**答案：**

**核心 Web Vitals（Core Web Vitals）：**

| 指标 | 全称 | 含义 | 好 | 需改进 | 差 |
|------|------|------|-----|--------|-----|
| LCP | Largest Contentful Paint | 最大内容绘制 | ≤2.5s | ≤4s | >4s |
| FID | First Input Delay | 首次输入延迟 | ≤100ms | ≤300ms | >300ms |
| CLS | Cumulative Layout Shift | 累积布局偏移 | ≤0.1 | ≤0.25 | >0.25 |
| INP | Interaction to Next Paint | 交互到下一次绘制 | ≤200ms | ≤500ms | >500ms |

**其他重要指标：**

| 指标 | 含义 |
|------|------|
| FCP | First Contentful Paint，首次内容绘制 |
| TTFB | Time to First Byte，首字节时间 |
| TTI | Time to Interactive，可交互时间 |
| TBT | Total Blocking Time，总阻塞时间 |
| SI | Speed Index，速度指数 |

**测量方式：**
```javascript
// Performance API
const timing = performance.timing;

// DNS 解析时间
const dnsTime = timing.domainLookupEnd - timing.domainLookupStart;

// TCP 连接时间
const tcpTime = timing.connectEnd - timing.connectStart;

// 首字节时间
const ttfb = timing.responseStart - timing.requestStart;

// DOM 解析时间
const domParseTime = timing.domComplete - timing.domInteractive;

// 页面完全加载时间
const loadTime = timing.loadEventEnd - timing.navigationStart;

// Web Vitals
import { getLCP, getFID, getCLS } from 'web-vitals';

getLCP(console.log);
getFID(console.log);
getCLS(console.log);

// Performance Observer
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log(entry.name, entry.startTime, entry.duration);
  }
});

observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
```

---

## 加载优化

### 2. 资源加载优化策略

**答案：**

**1. 资源压缩：**
```javascript
// Gzip / Brotli 压缩
// nginx.conf
gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_min_length 1024;

// Webpack 压缩
const CompressionPlugin = require('compression-webpack-plugin');
plugins: [
  new CompressionPlugin({
    algorithm: 'gzip',
    test: /\.(js|css|html|svg)$/
  })
]
```

**2. 资源合并与分割：**
```javascript
// 代码分割
optimization: {
  splitChunks: {
    chunks: 'all',
    cacheGroups: {
      vendors: {
        test: /[\\/]node_modules[\\/]/,
        name: 'vendors'
      }
    }
  }
}

// 动态导入
const module = await import('./heavy-module.js');
```

**3. 图片优化：**
```html
<!-- 响应式图片 -->
<img srcset="small.jpg 300w, medium.jpg 600w, large.jpg 1200w"
     sizes="(max-width: 600px) 300px, 600px"
     src="medium.jpg" alt="">

<!-- WebP 格式 -->
<picture>
  <source srcset="image.webp" type="image/webp">
  <source srcset="image.jpg" type="image/jpeg">
  <img src="image.jpg" alt="">
</picture>

<!-- 懒加载 -->
<img loading="lazy" src="image.jpg" alt="">

<!-- 占位图 -->
<img src="data:image/svg+xml;base64,..." data-src="image.jpg" alt="">
```

**4. 预加载策略：**
```html
<!-- DNS 预解析 -->
<link rel="dns-prefetch" href="//cdn.example.com">

<!-- 预连接 -->
<link rel="preconnect" href="https://api.example.com">

<!-- 预加载关键资源 -->
<link rel="preload" href="critical.css" as="style">
<link rel="preload" href="main.js" as="script">
<link rel="preload" href="font.woff2" as="font" crossorigin>

<!-- 预获取非关键资源 -->
<link rel="prefetch" href="next-page.js">

<!-- 预渲染下一页 -->
<link rel="prerender" href="https://example.com/next-page">
```

**5. 缓存策略：**
```javascript
// 强缓存（文件名带 hash）
Cache-Control: max-age=31536000

// 协商缓存（HTML 文件）
Cache-Control: no-cache

// Service Worker 缓存
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request);
    })
  );
});
```

---

### 3. 首屏加载优化

**答案：**

**1. 关键渲染路径优化：**
```html
<!-- 关键 CSS 内联 -->
<style>
  /* 首屏关键样式 */
  .header { ... }
  .hero { ... }
</style>

<!-- 非关键 CSS 异步加载 -->
<link rel="preload" href="non-critical.css" as="style"
      onload="this.onload=null;this.rel='stylesheet'">

<!-- 关键 JS 预加载 -->
<link rel="preload" href="critical.js" as="script">

<!-- 非关键 JS defer -->
<script defer src="non-critical.js"></script>
```

**2. 服务端渲染（SSR）：**
```javascript
// 服务端直出 HTML
// 减少客户端渲染时间
// 提高 FCP 和 LCP
```

**3. 骨架屏：**
```html
<div id="app">
  <div class="skeleton">
    <div class="skeleton-avatar"></div>
    <div class="skeleton-text"></div>
    <div class="skeleton-text short"></div>
  </div>
</div>
```

**4. 按需加载：**
```javascript
// 路由懒加载
const Home = () => import('./views/Home.vue');

// 组件懒加载
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));

// 条件加载
if (condition) {
  const module = await import('./module');
}
```

**5. 资源优先级：**
```html
<!-- 提高优先级 -->
<link rel="preload" href="important.js" as="script" importance="high">

<!-- 降低优先级 -->
<img src="below-fold.jpg" loading="lazy" importance="low">
```

---

## 渲染优化

### 4. 减少重排重绘

**答案：**

**触发重排的操作：**
```javascript
// 修改几何属性
element.style.width = '100px';
element.style.height = '100px';
element.style.margin = '10px';
element.style.padding = '10px';
element.style.border = '1px solid';

// 读取布局信息
element.offsetWidth;
element.offsetHeight;
element.getBoundingClientRect();
window.getComputedStyle(element);
```

**优化方法：**
```javascript
// 1. 批量修改 DOM
// 不好
element.style.width = '100px';
element.style.height = '100px';
element.style.margin = '10px';

// 好 - 使用 class
element.className = 'new-style';

// 好 - 使用 cssText
element.style.cssText = 'width: 100px; height: 100px; margin: 10px;';

// 2. 使用 DocumentFragment
const fragment = document.createDocumentFragment();
for (let i = 0; i < 100; i++) {
  const div = document.createElement('div');
  fragment.appendChild(div);
}
container.appendChild(fragment);

// 3. 离线操作
element.style.display = 'none';
// 多次 DOM 操作
element.style.display = 'block';

// 4. 缓存布局信息
const width = element.offsetWidth;
// 使用缓存的 width

// 5. 使用 transform 代替 top/left
element.style.transform = 'translateX(100px)';

// 6. 使用 will-change
element.style.willChange = 'transform';
```

---

### 5. 动画性能优化

**答案：**

**使用 GPU 加速：**
```css
/* 触发 GPU 加速的属性 */
.animated {
  transform: translateZ(0);
  /* 或 */
  will-change: transform;
}

/* 只使用这些属性做动画 */
/* transform, opacity - 只触发合成，不触发重排重绘 */
.animate {
  transition: transform 0.3s, opacity 0.3s;
}

/* 避免动画这些属性 */
/* width, height, top, left, margin, padding, border */
```

**使用 requestAnimationFrame：**
```javascript
// 不好 - setTimeout
function animate() {
  element.style.left = position + 'px';
  position += 1;
  setTimeout(animate, 16);
}

// 好 - requestAnimationFrame
function animate() {
  element.style.transform = `translateX(${position}px)`;
  position += 1;
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
```

**CSS 动画 vs JS 动画：**
```css
/* CSS 动画 - 由浏览器优化 */
@keyframes slide {
  from { transform: translateX(0); }
  to { transform: translateX(100px); }
}

.animated {
  animation: slide 0.3s ease-out;
}
```

```javascript
// Web Animations API
element.animate([
  { transform: 'translateX(0)' },
  { transform: 'translateX(100px)' }
], {
  duration: 300,
  easing: 'ease-out'
});
```

---

## JavaScript 优化

### 6. JavaScript 执行优化

**答案：**

**1. 防抖和节流：**
```javascript
// 防抖 - 连续触发只执行最后一次
function debounce(fn, delay) {
  let timer = null;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// 节流 - 固定时间执行一次
function throttle(fn, interval) {
  let lastTime = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastTime >= interval) {
      lastTime = now;
      fn.apply(this, args);
    }
  };
}

// 使用
input.addEventListener('input', debounce(handleSearch, 300));
window.addEventListener('scroll', throttle(handleScroll, 100));
```

**2. 避免长任务：**
```javascript
// 不好 - 长任务阻塞主线程
function processLargeArray(array) {
  array.forEach(item => heavyComputation(item));
}

// 好 - 分片处理
function processLargeArray(array) {
  const chunkSize = 100;
  let index = 0;

  function processChunk() {
    const chunk = array.slice(index, index + chunkSize);
    chunk.forEach(item => heavyComputation(item));
    index += chunkSize;

    if (index < array.length) {
      // 让出主线程
      requestIdleCallback(processChunk);
      // 或 setTimeout(processChunk, 0);
    }
  }

  processChunk();
}

// 使用 Web Worker
const worker = new Worker('worker.js');
worker.postMessage(largeArray);
worker.onmessage = (e) => {
  console.log('Result:', e.data);
};
```

**3. 事件委托：**
```javascript
// 不好 - 多个监听器
items.forEach(item => {
  item.addEventListener('click', handleClick);
});

// 好 - 事件委托
container.addEventListener('click', (e) => {
  if (e.target.matches('.item')) {
    handleClick(e);
  }
});
```

**4. 虚拟滚动：**
```javascript
// 只渲染可见区域
function VirtualList({ items, itemHeight, containerHeight }) {
  const [scrollTop, setScrollTop] = useState(0);

  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );

  const visibleItems = items.slice(startIndex, endIndex);

  return (
    <div style={{ height: containerHeight, overflow: 'auto' }}
         onScroll={(e) => setScrollTop(e.target.scrollTop)}>
      <div style={{ height: items.length * itemHeight }}>
        <div style={{ transform: `translateY(${startIndex * itemHeight}px)` }}>
          {visibleItems.map((item, i) => (
            <div key={startIndex + i} style={{ height: itemHeight }}>
              {item.content}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

## 框架优化

### 7. React 性能优化

**答案：**

```jsx
// 1. React.memo - 避免不必要的重新渲染
const MemoComponent = React.memo(function MyComponent(props) {
  return <div>{props.name}</div>;
});

// 自定义比较函数
const MemoComponent = React.memo(MyComponent, (prevProps, nextProps) => {
  return prevProps.id === nextProps.id;
});

// 2. useMemo - 缓存计算结果
const expensiveResult = useMemo(() => {
  return computeExpensiveValue(a, b);
}, [a, b]);

// 3. useCallback - 缓存函数
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);

// 4. 避免在渲染中创建对象
// 不好
<Component style={{ color: 'red' }} />

// 好
const style = useMemo(() => ({ color: 'red' }), []);
<Component style={style} />

// 5. 使用 key
{items.map(item => <Item key={item.id} {...item} />)}

// 6. 代码分割
const LazyComponent = React.lazy(() => import('./LazyComponent'));

// 7. 使用 React Profiler 分析
<Profiler id="MyComponent" onRender={onRenderCallback}>
  <MyComponent />
</Profiler>
```

---

### 8. Vue 性能优化

**答案：**

```vue
<script setup>
import { computed, shallowRef, markRaw, defineAsyncComponent } from 'vue';

// 1. 计算属性缓存
const sortedItems = computed(() => {
  return [...items.value].sort((a, b) => a.name.localeCompare(b.name));
});

// 2. v-once - 只渲染一次
<span v-once>{{ staticContent }}</span>

// 3. v-memo - 记忆化
<div v-for="item in items" :key="item.id" v-memo="[item.active]">
  {{ item.name }}
</div>

// 4. shallowRef / shallowReactive - 浅层响应式
const shallowState = shallowRef({ nested: { value: 1 } });

// 5. markRaw - 标记非响应式
const rawData = markRaw({ large: 'data' });

// 6. 异步组件
const AsyncComponent = defineAsyncComponent(() =>
  import('./HeavyComponent.vue')
);

// 7. keep-alive 缓存
<keep-alive :max="10">
  <router-view />
</keep-alive>

// 8. 使用 key 强制重新渲染
<Component :key="componentKey" />
</script>
```

---

## 网络优化

### 9. 网络请求优化

**答案：**

**1. 请求合并：**
```javascript
// 合并多个请求
async function batchFetch(ids) {
  const response = await fetch('/api/items', {
    method: 'POST',
    body: JSON.stringify({ ids })
  });
  return response.json();
}
```

**2. 请求缓存：**
```javascript
const cache = new Map();

async function fetchWithCache(url) {
  if (cache.has(url)) {
    return cache.get(url);
  }

  const response = await fetch(url);
  const data = await response.json();
  cache.set(url, data);
  return data;
}

// SWR 策略
// stale-while-revalidate
async function fetchSWR(url) {
  // 先返回缓存
  const cached = cache.get(url);
  if (cached) {
    // 后台更新
    fetch(url).then(res => res.json()).then(data => {
      cache.set(url, data);
    });
    return cached;
  }

  const data = await fetch(url).then(res => res.json());
  cache.set(url, data);
  return data;
}
```

**3. 取消请求：**
```javascript
// AbortController
const controller = new AbortController();

fetch(url, { signal: controller.signal })
  .then(response => response.json())
  .catch(error => {
    if (error.name === 'AbortError') {
      console.log('Request cancelled');
    }
  });

// 取消请求
controller.abort();
```

**4. 请求重试：**
```javascript
async function fetchWithRetry(url, options = {}, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error('Request failed');
      return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

---

## 构建优化

### 10. 打包优化

**答案：**

```javascript
// webpack.config.js
module.exports = {
  // 1. 代码分割
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  },

  // 2. Tree Shaking
  mode: 'production',
  optimization: {
    usedExports: true,
    minimize: true
  },

  // 3. 压缩
  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          compress: {
            drop_console: true
          }
        }
      }),
      new CssMinimizerPlugin()
    ]
  },

  // 4. 外部化依赖
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM'
  },

  // 5. 缓存
  cache: {
    type: 'filesystem'
  },

  // 6. 并行构建
  module: {
    rules: [
      {
        test: /\.js$/,
        use: ['thread-loader', 'babel-loader']
      }
    ]
  }
};
```

---

### 11. 性能监控

**答案：**

```javascript
// 1. Performance API
const timing = performance.timing;

const metrics = {
  // DNS 查询
  dns: timing.domainLookupEnd - timing.domainLookupStart,
  // TCP 连接
  tcp: timing.connectEnd - timing.connectStart,
  // 首字节时间
  ttfb: timing.responseStart - timing.requestStart,
  // DOM 解析
  domParse: timing.domComplete - timing.domInteractive,
  // 页面加载
  load: timing.loadEventEnd - timing.navigationStart
};

// 2. Performance Observer
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    // 发送到监控服务
    sendToAnalytics({
      name: entry.name,
      type: entry.entryType,
      value: entry.startTime
    });
  }
});

observer.observe({
  entryTypes: ['paint', 'largest-contentful-paint', 'layout-shift']
});

// 3. Web Vitals
import { getLCP, getFID, getCLS, getTTFB, getFCP } from 'web-vitals';

function sendToAnalytics(metric) {
  const body = JSON.stringify(metric);
  navigator.sendBeacon('/analytics', body);
}

getLCP(sendToAnalytics);
getFID(sendToAnalytics);
getCLS(sendToAnalytics);
getTTFB(sendToAnalytics);
getFCP(sendToAnalytics);

// 4. 错误监控
window.onerror = function(message, source, lineno, colno, error) {
  sendToAnalytics({
    type: 'error',
    message,
    source,
    lineno,
    colno,
    stack: error?.stack
  });
};

window.addEventListener('unhandledrejection', (e) => {
  sendToAnalytics({
    type: 'unhandledrejection',
    reason: e.reason
  });
});

// 5. 资源加载监控
const resourceObserver = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.initiatorType === 'fetch' || entry.initiatorType === 'xmlhttprequest') {
      sendToAnalytics({
        type: 'api',
        name: entry.name,
        duration: entry.duration
      });
    }
  }
});

resourceObserver.observe({ entryTypes: ['resource'] });
```

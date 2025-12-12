# 浏览器原理面试题

## 浏览器架构

### 1. 浏览器的主要组成部分

**答案：**

```
┌─────────────────────────────────────────────────────────────┐
│                      用户界面                                │
│  (地址栏、前进/后退按钮、书签等)                              │
├─────────────────────────────────────────────────────────────┤
│                    浏览器引擎                                │
│  (在用户界面和渲染引擎之间传送指令)                           │
├─────────────────────────────────────────────────────────────┤
│                    渲染引擎                                  │
│  (解析 HTML/CSS，构建 DOM/CSSOM，渲染页面)                   │
├─────────────┬───────────────┬───────────────────────────────┤
│  网络模块   │  JS 解释器    │       UI 后端                  │
│  (HTTP请求) │  (V8引擎)     │    (绘制基本组件)              │
├─────────────┴───────────────┴───────────────────────────────┤
│                    数据存储                                  │
│  (Cookie、LocalStorage、IndexedDB、Cache)                   │
└─────────────────────────────────────────────────────────────┘
```

**主要进程（Chrome 多进程架构）：**

| 进程 | 职责 |
|------|------|
| 浏览器进程 | 界面显示、用户交互、子进程管理、存储 |
| 渲染进程 | HTML/CSS/JS 解析执行、页面渲染 |
| GPU 进程 | 3D 绘制、合成图层 |
| 网络进程 | 网络资源加载 |
| 插件进程 | 运行插件（每个插件一个进程） |

---

### 2. 从输入 URL 到页面展示的完整过程

**答案：**

**1. URL 解析：**
```
https://www.example.com:443/path/page.html?query=1#hash
  │           │          │         │           │      │
协议       域名        端口      路径        查询参数  锚点
```

**2. DNS 解析：**
```
浏览器缓存 -> 操作系统缓存 -> hosts 文件 -> 本地 DNS 服务器
-> 根 DNS 服务器 -> 顶级域 DNS 服务器 -> 权威 DNS 服务器
-> 返回 IP 地址
```

**3. 建立 TCP 连接（三次握手）：**
```
客户端                     服务器
   │                         │
   │──── SYN (seq=x) ────────>│  第一次握手
   │                         │
   │<─── SYN+ACK (seq=y,     │  第二次握手
   │     ack=x+1) ───────────│
   │                         │
   │──── ACK (ack=y+1) ──────>│  第三次握手
   │                         │
   │   ══════ 连接建立 ══════  │
```

**4. TLS 握手（HTTPS）：**
```
1. Client Hello（支持的加密算法、随机数）
2. Server Hello（选择的加密算法、证书、随机数）
3. 客户端验证证书
4. 生成预主密钥，用服务器公钥加密发送
5. 双方生成会话密钥
6. 加密通信开始
```

**5. 发送 HTTP 请求：**
```http
GET /path/page.html HTTP/1.1
Host: www.example.com
User-Agent: Mozilla/5.0 ...
Accept: text/html,application/xhtml+xml
Accept-Language: zh-CN,zh;q=0.9
Accept-Encoding: gzip, deflate, br
Connection: keep-alive
Cookie: session=abc123
```

**6. 服务器响应：**
```http
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
Content-Length: 1234
Cache-Control: max-age=3600
Set-Cookie: session=abc123

<!DOCTYPE html>
<html>...
```

**7. 浏览器解析渲染：**
```
HTML -> DOM 树
CSS -> CSSOM 树
DOM + CSSOM -> 渲染树
渲染树 -> 布局（计算位置和大小）
布局 -> 绘制（光栅化）
绘制 -> 合成（GPU）
合成 -> 显示
```

**8. 断开连接（四次挥手）：**
```
客户端                     服务器
   │                         │
   │──── FIN ────────────────>│  第一次挥手
   │                         │
   │<─── ACK ────────────────│  第二次挥手
   │                         │
   │<─── FIN ────────────────│  第三次挥手
   │                         │
   │──── ACK ────────────────>│  第四次挥手
   │                         │
   │   ══════ 连接关闭 ══════  │
```

---

## 渲染原理

### 3. 浏览器渲染流程

**答案：**

```
                    HTML
                      │
                      ▼
              ┌──────────────┐
              │  HTML Parser │
              └──────────────┘
                      │
                      ▼
              ┌──────────────┐      CSS
              │   DOM Tree   │        │
              └──────────────┘        ▼
                      │        ┌──────────────┐
                      │        │  CSS Parser  │
                      │        └──────────────┘
                      │               │
                      │               ▼
                      │        ┌──────────────┐
                      │        │  CSSOM Tree  │
                      │        └──────────────┘
                      │               │
                      ▼               ▼
              ┌─────────────────────────────┐
              │        Render Tree          │
              └─────────────────────────────┘
                              │
                              ▼
              ┌─────────────────────────────┐
              │     Layout (Reflow)         │
              │   计算元素位置和大小          │
              └─────────────────────────────┘
                              │
                              ▼
              ┌─────────────────────────────┐
              │     Paint (Repaint)         │
              │      绘制元素内容            │
              └─────────────────────────────┘
                              │
                              ▼
              ┌─────────────────────────────┐
              │       Composite             │
              │       图层合成               │
              └─────────────────────────────┘
```

**详细步骤：**

1. **构建 DOM 树**：解析 HTML，构建节点树
2. **构建 CSSOM 树**：解析 CSS，构建样式树
3. **构建渲染树**：合并 DOM 和 CSSOM，只包含可见节点
4. **布局（Layout/Reflow）**：计算每个节点的几何信息
5. **绘制（Paint）**：将元素绘制为图层
6. **合成（Composite）**：将图层合成为最终画面

---

### 4. 重排（Reflow）和重绘（Repaint）

**答案：**

**重排（Reflow）：**
元素的几何属性变化时，需要重新计算布局。

```javascript
// 触发重排的操作
element.style.width = '100px';
element.style.height = '100px';
element.style.margin = '10px';
element.style.padding = '10px';
element.style.border = '1px solid';
element.style.display = 'block';
element.style.position = 'absolute';
element.style.fontSize = '16px';

// 读取布局信息也会触发重排
element.offsetWidth;
element.offsetHeight;
element.offsetTop;
element.clientWidth;
element.scrollTop;
element.getBoundingClientRect();
window.getComputedStyle(element);
```

**重绘（Repaint）：**
元素外观变化但不影响布局时，只需重绘。

```javascript
// 只触发重绘的操作
element.style.color = 'red';
element.style.backgroundColor = 'blue';
element.style.visibility = 'hidden';
element.style.boxShadow = '0 0 10px black';
element.style.outline = '1px solid red';
```

**优化建议：**

```javascript
// 1. 批量修改样式
// 不好
element.style.width = '100px';
element.style.height = '100px';
element.style.margin = '10px';

// 好 - 使用 class
element.className = 'new-class';

// 好 - 使用 cssText
element.style.cssText = 'width: 100px; height: 100px; margin: 10px;';

// 2. 离线操作 DOM
// 使用 documentFragment
const fragment = document.createDocumentFragment();
items.forEach(item => {
  const li = document.createElement('li');
  li.textContent = item;
  fragment.appendChild(li);
});
list.appendChild(fragment);

// 先隐藏，修改后再显示
element.style.display = 'none';
// 多次 DOM 操作
element.style.display = 'block';

// 3. 缓存布局信息
// 不好
for (let i = 0; i < 100; i++) {
  element.style.left = element.offsetLeft + 10 + 'px';
}

// 好
let left = element.offsetLeft;
for (let i = 0; i < 100; i++) {
  left += 10;
  element.style.left = left + 'px';
}

// 4. 使用 transform 代替位置属性
// 不好 - 触发重排
element.style.left = '100px';

// 好 - 只触发合成
element.style.transform = 'translateX(100px)';

// 5. 使用绝对定位脱离文档流
element.style.position = 'absolute';
// 然后进行动画，不会影响其他元素

// 6. 使用 will-change 提示浏览器
element.style.willChange = 'transform';
```

---

### 5. CSS 和 JS 如何阻塞渲染

**答案：**

**CSS 阻塞：**
```html
<!-- CSS 阻塞渲染，但不阻塞 HTML 解析 -->
<link rel="stylesheet" href="style.css">

<!-- 可以使用 media 属性减少阻塞 -->
<link rel="stylesheet" href="print.css" media="print">
<link rel="stylesheet" href="mobile.css" media="(max-width: 768px)">

<!-- 预加载关键 CSS -->
<link rel="preload" href="critical.css" as="style">
```

**JS 阻塞：**
```html
<!-- 普通脚本会阻塞 HTML 解析 -->
<script src="script.js"></script>

<!-- async：异步加载，加载完立即执行（可能中断解析） -->
<script async src="script.js"></script>

<!-- defer：异步加载，HTML 解析完后执行 -->
<script defer src="script.js"></script>

<!-- 内联脚本会阻塞 -->
<script>
  console.log('blocking');
</script>
```

**最佳实践：**
```html
<!DOCTYPE html>
<html>
<head>
  <!-- 关键 CSS 内联 -->
  <style>
    /* 首屏关键样式 */
  </style>

  <!-- 预加载关键资源 -->
  <link rel="preload" href="main.js" as="script">
  <link rel="preload" href="main.css" as="style">

  <!-- 非关键 CSS 异步加载 -->
  <link rel="preload" href="non-critical.css" as="style" onload="this.rel='stylesheet'">
</head>
<body>
  <!-- 内容 -->

  <!-- JS 放在底部或使用 defer -->
  <script defer src="main.js"></script>
</body>
</html>
```

---

## 浏览器存储

### 6. 浏览器存储方式对比

**答案：**

| 特性 | Cookie | localStorage | sessionStorage | IndexedDB |
|------|--------|--------------|----------------|-----------|
| 容量 | 4KB | 5-10MB | 5-10MB | 无限制 |
| 生命周期 | 可设置过期时间 | 永久 | 会话结束 | 永久 |
| 服务器通信 | 自动发送 | 不发送 | 不发送 | 不发送 |
| 同源策略 | 遵守 | 遵守 | 遵守 | 遵守 |
| 数据类型 | 字符串 | 字符串 | 字符串 | 结构化数据 |
| 同步/异步 | 同步 | 同步 | 同步 | 异步 |

**Cookie：**
```javascript
// 设置 Cookie
document.cookie = 'name=value; expires=Thu, 18 Dec 2025 12:00:00 UTC; path=/; domain=.example.com; secure; SameSite=Strict';

// 读取 Cookie
const cookies = document.cookie;

// 删除 Cookie（设置过期时间为过去）
document.cookie = 'name=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

// Cookie 属性
// - expires/max-age: 过期时间
// - path: 路径
// - domain: 域名
// - secure: 只在 HTTPS 发送
// - SameSite: 跨站限制 (Strict/Lax/None)
// - HttpOnly: 禁止 JS 访问（只能通过服务器设置）
```

**localStorage / sessionStorage：**
```javascript
// 存储
localStorage.setItem('key', 'value');
localStorage.setItem('user', JSON.stringify({ name: '张三' }));

// 读取
const value = localStorage.getItem('key');
const user = JSON.parse(localStorage.getItem('user'));

// 删除
localStorage.removeItem('key');

// 清空
localStorage.clear();

// 监听变化（跨标签页）
window.addEventListener('storage', (e) => {
  console.log(e.key, e.oldValue, e.newValue);
});
```

**IndexedDB：**
```javascript
// 打开数据库
const request = indexedDB.open('MyDatabase', 1);

request.onerror = (e) => console.error('Error');

request.onupgradeneeded = (e) => {
  const db = e.target.result;
  // 创建对象存储
  const store = db.createObjectStore('users', { keyPath: 'id' });
  store.createIndex('name', 'name', { unique: false });
};

request.onsuccess = (e) => {
  const db = e.target.result;

  // 添加数据
  const transaction = db.transaction(['users'], 'readwrite');
  const store = transaction.objectStore('users');
  store.add({ id: 1, name: '张三', age: 25 });

  // 读取数据
  const getRequest = store.get(1);
  getRequest.onsuccess = () => {
    console.log(getRequest.result);
  };

  // 使用索引查询
  const index = store.index('name');
  const indexRequest = index.get('张三');
};
```

---

### 7. 浏览器缓存机制

**答案：**

**缓存位置（优先级从高到低）：**
1. Service Worker
2. Memory Cache（内存缓存）
3. Disk Cache（磁盘缓存）
4. Push Cache（HTTP/2）

**强缓存：**
```http
# Expires（HTTP 1.0）- 绝对时间
Expires: Thu, 01 Dec 2025 16:00:00 GMT

# Cache-Control（HTTP 1.1）- 相对时间
Cache-Control: max-age=3600        # 缓存 1 小时
Cache-Control: no-cache           # 需要验证
Cache-Control: no-store           # 不缓存
Cache-Control: public             # 可被代理缓存
Cache-Control: private            # 只能浏览器缓存
Cache-Control: must-revalidate    # 过期必须验证
```

**协商缓存：**
```http
# Last-Modified / If-Modified-Since
# 响应头
Last-Modified: Wed, 21 Oct 2024 07:28:00 GMT

# 请求头
If-Modified-Since: Wed, 21 Oct 2024 07:28:00 GMT

# ETag / If-None-Match（优先级更高）
# 响应头
ETag: "33a64df551425fcc55e4d42a148795d9f25f89d4"

# 请求头
If-None-Match: "33a64df551425fcc55e4d42a148795d9f25f89d4"

# 服务器返回 304 表示资源未修改
```

**缓存流程：**
```
请求资源
    │
    ▼
检查强缓存是否有效
    │
    ├─ 有效 ──> 使用缓存（200 from cache）
    │
    └─ 无效/过期
           │
           ▼
      发起请求，携带协商缓存标识
           │
           ▼
      服务器检查资源是否修改
           │
           ├─ 未修改 ──> 返回 304，使用缓存
           │
           └─ 已修改 ──> 返回 200 + 新资源
```

**缓存策略示例：**
```
# HTML - 不缓存或短时间缓存
Cache-Control: no-cache

# CSS/JS - 长期缓存（文件名带 hash）
Cache-Control: max-age=31536000

# 图片 - 长期缓存
Cache-Control: max-age=31536000

# API - 根据需求
Cache-Control: no-store  # 实时数据
Cache-Control: max-age=60  # 可缓存 1 分钟
```

---

## 跨域

### 8. 什么是跨域？如何解决？

**答案：**

**同源策略：**
协议、域名、端口都相同才是同源。

```
http://example.com/a
http://example.com/b       ✓ 同源
https://example.com/a      ✗ 协议不同
http://www.example.com/a   ✗ 域名不同
http://example.com:8080/a  ✗ 端口不同
```

**跨域解决方案：**

**1. CORS（推荐）：**
```javascript
// 服务端设置响应头
// 简单请求
Access-Control-Allow-Origin: https://example.com
Access-Control-Allow-Origin: *

// 预检请求（非简单请求）
Access-Control-Allow-Origin: https://example.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true  // 允许携带 Cookie
Access-Control-Max-Age: 86400  // 预检结果缓存时间

// 前端携带 Cookie
fetch(url, {
  credentials: 'include'
});
```

**2. JSONP（仅支持 GET）：**
```javascript
// 前端
function jsonp(url, callback) {
  const script = document.createElement('script');
  const callbackName = 'jsonp_' + Date.now();

  window[callbackName] = (data) => {
    callback(data);
    delete window[callbackName];
    document.body.removeChild(script);
  };

  script.src = `${url}?callback=${callbackName}`;
  document.body.appendChild(script);
}

jsonp('http://api.example.com/data', (data) => {
  console.log(data);
});

// 服务端返回
// jsonp_1234567890({"name": "张三"})
```

**3. 代理服务器：**
```javascript
// 开发环境 - Webpack
devServer: {
  proxy: {
    '/api': {
      target: 'http://api.example.com',
      changeOrigin: true,
      pathRewrite: { '^/api': '' }
    }
  }
}

// 开发环境 - Vite
server: {
  proxy: {
    '/api': {
      target: 'http://api.example.com',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, '')
    }
  }
}

// 生产环境 - Nginx
location /api {
  proxy_pass http://api.example.com;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
}
```

**4. postMessage：**
```javascript
// 发送方（父窗口）
const iframe = document.getElementById('iframe');
iframe.contentWindow.postMessage('Hello', 'https://target.com');

// 接收方（iframe）
window.addEventListener('message', (e) => {
  if (e.origin !== 'https://parent.com') return;
  console.log(e.data);
  // 回复
  e.source.postMessage('World', e.origin);
});
```

**5. WebSocket：**
```javascript
// WebSocket 不受同源策略限制
const ws = new WebSocket('wss://api.example.com/socket');

ws.onopen = () => {
  ws.send('Hello');
};

ws.onmessage = (e) => {
  console.log(e.data);
};
```

---

## 性能

### 9. 首屏加载优化

**答案：**

**1. 资源优化：**
```html
<!-- DNS 预解析 -->
<link rel="dns-prefetch" href="//cdn.example.com">

<!-- 预连接 -->
<link rel="preconnect" href="https://api.example.com">

<!-- 预加载关键资源 -->
<link rel="preload" href="critical.css" as="style">
<link rel="preload" href="hero.jpg" as="image">

<!-- 预获取非关键资源 -->
<link rel="prefetch" href="next-page.js">
```

**2. 代码优化：**
```javascript
// 代码分割
const Component = React.lazy(() => import('./Component'));

// 路由懒加载
const routes = [
  {
    path: '/dashboard',
    component: () => import('./Dashboard.vue')
  }
];

// Tree Shaking
import { debounce } from 'lodash-es'; // 而不是整个 lodash
```

**3. 图片优化：**
```html
<!-- 懒加载 -->
<img loading="lazy" src="image.jpg" />

<!-- 响应式图片 -->
<img srcset="small.jpg 300w, medium.jpg 600w, large.jpg 1200w"
     sizes="(max-width: 600px) 300px, (max-width: 1200px) 600px, 1200px"
     src="medium.jpg" />

<!-- WebP 格式 -->
<picture>
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" />
</picture>
```

**4. 骨架屏：**
```html
<!-- 首屏骨架屏，减少白屏时间 -->
<div id="app">
  <div class="skeleton">
    <div class="skeleton-header"></div>
    <div class="skeleton-content"></div>
  </div>
</div>
```

**5. 服务端渲染（SSR）：**
```javascript
// 服务端渲染首屏，减少首屏时间
// Next.js / Nuxt.js
```

---

### 10. 长列表性能优化

**答案：**

**虚拟滚动：**
```javascript
// 只渲染可见区域的元素
function VirtualList({ items, itemHeight, containerHeight }) {
  const [scrollTop, setScrollTop] = useState(0);

  // 计算可见范围
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );

  // 只渲染可见元素
  const visibleItems = items.slice(startIndex, endIndex);

  // 容器总高度
  const totalHeight = items.length * itemHeight;

  // 偏移量
  const offsetY = startIndex * itemHeight;

  return (
    <div
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={(e) => setScrollTop(e.target.scrollTop)}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => (
            <div key={startIndex + index} style={{ height: itemHeight }}>
              {item.content}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 使用库
// react-window
// react-virtualized
// vue-virtual-scroller
```

**分页加载：**
```javascript
// 滚动到底部加载更多
function useInfiniteScroll(loadMore) {
  useEffect(() => {
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      if (scrollTop + clientHeight >= scrollHeight - 100) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMore]);
}
```

---

### 11. Web Workers 使用

**答案：**

```javascript
// main.js
const worker = new Worker('worker.js');

// 发送消息
worker.postMessage({
  type: 'calculate',
  data: largeArray
});

// 接收消息
worker.onmessage = (e) => {
  console.log('Result:', e.data);
};

// 错误处理
worker.onerror = (e) => {
  console.error('Worker error:', e.message);
};

// 终止
worker.terminate();

// worker.js
self.onmessage = (e) => {
  const { type, data } = e.data;

  if (type === 'calculate') {
    // 耗时操作
    const result = heavyCalculation(data);
    self.postMessage(result);
  }
};

// 可转移对象（零拷贝传输）
const buffer = new ArrayBuffer(1024);
worker.postMessage(buffer, [buffer]);
```

**SharedWorker：**
```javascript
// 多个页面共享同一个 Worker
const worker = new SharedWorker('shared-worker.js');

worker.port.onmessage = (e) => {
  console.log(e.data);
};

worker.port.postMessage('Hello');

// shared-worker.js
const connections = [];

self.onconnect = (e) => {
  const port = e.ports[0];
  connections.push(port);

  port.onmessage = (e) => {
    // 广播给所有连接
    connections.forEach(p => p.postMessage(e.data));
  };
};
```

---

### 12. Service Worker 和 PWA

**答案：**

```javascript
// 注册 Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(registration => {
      console.log('SW registered:', registration.scope);
    })
    .catch(error => {
      console.error('SW registration failed:', error);
    });
}

// sw.js
const CACHE_NAME = 'my-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js'
];

// 安装
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// 激活
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(names => {
      return Promise.all(
        names.filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// 拦截请求
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request)
      .then(response => {
        // 缓存优先
        if (response) {
          return response;
        }

        // 网络请求
        return fetch(e.request).then(response => {
          // 缓存新资源
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(e.request, responseClone);
            });
          }
          return response;
        });
      })
  );
});

// manifest.json（PWA 配置）
{
  "name": "My App",
  "short_name": "App",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

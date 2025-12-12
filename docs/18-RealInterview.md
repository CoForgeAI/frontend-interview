# 大厂面试真题集

> 收录字节跳动、阿里巴巴、腾讯、美团、百度等大厂真实面试题

## 字节跳动

### 一面（基础）

#### 1. 实现一个 LRU 缓存

**题目：** 设计一个 LRU（最近最少使用）缓存结构

```javascript
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) return -1;
    const value = this.cache.get(key);
    // 更新位置（删除再添加到末尾）
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  put(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      // 删除最久未使用（Map 第一个）
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }
}

// 测试
const cache = new LRUCache(2);
cache.put(1, 1);
cache.put(2, 2);
cache.get(1);      // 返回 1
cache.put(3, 3);   // 淘汰 key 2
cache.get(2);      // 返回 -1
```

---

#### 2. 实现 Promise.allSettled

```javascript
Promise.myAllSettled = function(promises) {
  return Promise.all(
    promises.map(p =>
      Promise.resolve(p)
        .then(value => ({ status: 'fulfilled', value }))
        .catch(reason => ({ status: 'rejected', reason }))
    )
  );
};

// 测试
Promise.myAllSettled([
  Promise.resolve(1),
  Promise.reject('error'),
  Promise.resolve(3)
]).then(console.log);
// [
//   { status: 'fulfilled', value: 1 },
//   { status: 'rejected', reason: 'error' },
//   { status: 'fulfilled', value: 3 }
// ]
```

---

#### 3. 事件循环输出题

```javascript
async function async1() {
  console.log('async1 start');
  await async2();
  console.log('async1 end');
}

async function async2() {
  console.log('async2');
}

console.log('script start');

setTimeout(function() {
  console.log('setTimeout');
}, 0);

async1();

new Promise(function(resolve) {
  console.log('promise1');
  resolve();
}).then(function() {
  console.log('promise2');
});

console.log('script end');

// 输出顺序：
// script start
// async1 start
// async2
// promise1
// script end
// async1 end
// promise2
// setTimeout
```

**解析：**
1. 同步：script start → async1 start → async2 → promise1 → script end
2. 微任务：async1 end → promise2
3. 宏任务：setTimeout

---

#### 4. 手写 useState

```javascript
let state;
let setterIndex = 0;
const stateArray = [];

function useState(initialValue) {
  const currentIndex = setterIndex;
  stateArray[currentIndex] = stateArray[currentIndex] ?? initialValue;

  const setState = (newValue) => {
    if (typeof newValue === 'function') {
      stateArray[currentIndex] = newValue(stateArray[currentIndex]);
    } else {
      stateArray[currentIndex] = newValue;
    }
    render(); // 触发重新渲染
  };

  setterIndex++;
  return [stateArray[currentIndex], setState];
}

function render() {
  setterIndex = 0; // 重置索引
  // 重新执行组件函数
}
```

---

#### 5. 实现请求并发控制

```javascript
async function asyncPool(limit, tasks) {
  const results = [];
  const executing = new Set();

  for (const [index, task] of tasks.entries()) {
    const promise = Promise.resolve(task()).then(result => {
      executing.delete(promise);
      return result;
    });

    results[index] = promise;
    executing.add(promise);

    if (executing.size >= limit) {
      await Promise.race(executing);
    }
  }

  return Promise.all(results);
}

// 使用
const tasks = urls.map(url => () => fetch(url));
const results = await asyncPool(3, tasks);
```

---

### 二面（进阶）

#### 6. React Fiber 原理

**问题：** 请解释 React Fiber 的工作原理，为什么需要它？

**答案：**

**背景：** React 15 的 Stack Reconciler 是同步递归的，一旦开始无法中断，长时间占用主线程会导致页面卡顿。

**Fiber 架构：**
```
Fiber 节点结构：
{
  type,          // 组件类型
  key,           // 唯一标识
  stateNode,     // DOM 节点或组件实例
  child,         // 第一个子节点
  sibling,       // 兄弟节点
  return,        // 父节点
  pendingProps,  // 新 props
  memoizedProps, // 旧 props
  memoizedState, // 旧 state
  effectTag,     // 副作用标记
  alternate,     // 双缓存（current ↔ workInProgress）
}
```

**工作流程：**
1. **Scheduler 调度器：** 任务优先级排序，高优先级先执行
2. **Reconciler 协调器：** 构建 Fiber 树，打上增删改标记
3. **Renderer 渲染器：** 根据标记执行 DOM 操作

**可中断原理：**
- 时间切片：每 5ms 检查是否有剩余时间
- requestIdleCallback / MessageChannel
- 高优先级任务（用户输入）可打断低优先级任务（数据请求）

---

#### 7. 虚拟列表实现原理

**问题：** 如何实现一个虚拟列表来优化长列表性能？

```javascript
function VirtualList({ items, itemHeight, containerHeight }) {
  const [scrollTop, setScrollTop] = useState(0);

  // 计算可见范围
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );

  // 只渲染可见项
  const visibleItems = items.slice(startIndex, endIndex);

  // 计算偏移量
  const offsetY = startIndex * itemHeight;

  return (
    <div
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={e => setScrollTop(e.target.scrollTop)}
    >
      {/* 撑开滚动高度 */}
      <div style={{ height: items.length * itemHeight }}>
        {/* 可见区域 */}
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, i) => (
            <div key={startIndex + i} style={{ height: itemHeight }}>
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

#### 8. 实现深度比较 isEqual

```javascript
function isEqual(a, b) {
  // 严格相等
  if (a === b) return true;

  // null 或非对象
  if (a === null || b === null) return false;
  if (typeof a !== 'object' || typeof b !== 'object') return false;

  // 类型不同
  const typeA = Object.prototype.toString.call(a);
  const typeB = Object.prototype.toString.call(b);
  if (typeA !== typeB) return false;

  // 数组比较
  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    return a.every((item, i) => isEqual(item, b[i]));
  }

  // 对象比较
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;

  return keysA.every(key => isEqual(a[key], b[key]));
}
```

---

## 阿里巴巴

### 一面

#### 9. 实现一个 compose 函数

```javascript
// 从右到左执行
function compose(...fns) {
  return function(x) {
    return fns.reduceRight((acc, fn) => fn(acc), x);
  };
}

// 从左到右执行
function pipe(...fns) {
  return function(x) {
    return fns.reduce((acc, fn) => fn(acc), x);
  };
}

// 测试
const add1 = x => x + 1;
const mul2 = x => x * 2;
const div3 = x => x / 3;

compose(div3, mul2, add1)(5);  // (5+1)*2/3 = 4
pipe(add1, mul2, div3)(5);     // (5+1)*2/3 = 4
```

---

#### 10. 手写 JSON.stringify

```javascript
function stringify(value) {
  const type = typeof value;

  // 基本类型
  if (value === null) return 'null';
  if (type === 'undefined' || type === 'function' || type === 'symbol') {
    return undefined;
  }
  if (type === 'boolean') return String(value);
  if (type === 'number') {
    if (Number.isNaN(value) || !Number.isFinite(value)) return 'null';
    return String(value);
  }
  if (type === 'string') return `"${value}"`;

  // 数组
  if (Array.isArray(value)) {
    const items = value.map(item => stringify(item) ?? 'null');
    return `[${items.join(',')}]`;
  }

  // 对象
  if (type === 'object') {
    // 处理 toJSON 方法
    if (typeof value.toJSON === 'function') {
      return stringify(value.toJSON());
    }

    const pairs = [];
    for (const key of Object.keys(value)) {
      const v = stringify(value[key]);
      if (v !== undefined) {
        pairs.push(`"${key}":${v}`);
      }
    }
    return `{${pairs.join(',')}}`;
  }
}
```

---

#### 11. Vue 3 的 Diff 算法优化

**问题：** Vue 3 相比 Vue 2 在 Diff 算法上做了哪些优化？

**答案：**

**1. 静态提升（Static Hoisting）**
```javascript
// 编译前
<div>
  <p>静态文本</p>
  <p>{{ dynamic }}</p>
</div>

// 编译后
const _hoisted_1 = createVNode("p", null, "静态文本")

function render() {
  return createVNode("div", null, [
    _hoisted_1,  // 静态节点复用
    createVNode("p", null, ctx.dynamic)
  ])
}
```

**2. 补丁标志（Patch Flags）**
```javascript
// 标记动态内容类型
const PatchFlags = {
  TEXT: 1,           // 动态文本
  CLASS: 2,          // 动态 class
  STYLE: 4,          // 动态 style
  PROPS: 8,          // 动态属性
  FULL_PROPS: 16,    // 有动态 key 的属性
  HYDRATE_EVENTS: 32 // 事件监听器
}

// 只对比有标志的节点
createVNode("p", null, ctx.text, PatchFlags.TEXT)
```

**3. 块级树（Block Tree）**
```javascript
// 收集动态节点，跳过静态节点对比
const block = openBlock()
// 只追踪动态节点
```

**4. 最长递增子序列**
```javascript
// 处理移动节点时，计算最少移动次数
// 旧: [a, b, c, d, e]
// 新: [a, c, d, b, e]
// 最长递增子序列: [a, c, d, e]
// 只需移动 b
```

---

#### 12. 实现 lodash.get

```javascript
function get(obj, path, defaultValue) {
  // 处理路径
  const keys = Array.isArray(path)
    ? path
    : path.replace(/\[(\d+)\]/g, '.$1').split('.');

  let result = obj;
  for (const key of keys) {
    result = result?.[key];
    if (result === undefined) return defaultValue;
  }
  return result;
}

// 测试
const obj = { a: { b: [{ c: 1 }] } };
get(obj, 'a.b[0].c');        // 1
get(obj, ['a', 'b', 0, 'c']); // 1
get(obj, 'a.b.c', 'default'); // 'default'
```

---

### 二面

#### 13. 微前端架构设计

**问题：** 如何设计一个微前端架构？需要考虑哪些问题？

**答案：**

**核心问题：**

| 问题 | 解决方案 |
|-----|---------|
| 应用隔离 | Shadow DOM / CSS Modules / CSS-in-JS |
| JS 沙箱 | Proxy 代理 window |
| 路由管理 | 主应用统一管理，子应用内部路由 |
| 通信机制 | CustomEvent / props / 全局状态 |
| 资源加载 | import-html-entry / System.js |
| 共享依赖 | externals / Module Federation |

**JS 沙箱实现：**
```javascript
class ProxySandbox {
  constructor() {
    this.fakeWindow = {};
    this.proxy = new Proxy(this.fakeWindow, {
      get: (target, key) => {
        return key in target ? target[key] : window[key];
      },
      set: (target, key, value) => {
        target[key] = value;
        return true;
      }
    });
  }

  active() {
    this.running = true;
  }

  inactive() {
    this.running = false;
  }
}
```

**CSS 隔离：**
```javascript
// 1. Shadow DOM
const shadow = element.attachShadow({ mode: 'closed' });
shadow.appendChild(style);
shadow.appendChild(content);

// 2. CSS 前缀
.app1-button { }
.app2-button { }

// 3. 运行时动态添加前缀
function scopeCSS(css, prefix) {
  return css.replace(/([^\r\n,{}]+)(,(?=[^}]*{)|\s*{)/g,
    (match, selector, ending) => `${prefix} ${selector}${ending}`);
}
```

---

#### 14. 大文件上传方案

**问题：** 如何实现大文件上传？要求支持断点续传和并发上传。

```javascript
class FileUploader {
  constructor(options) {
    this.chunkSize = options.chunkSize || 5 * 1024 * 1024; // 5MB
    this.concurrency = options.concurrency || 3;
  }

  async upload(file) {
    // 1. 计算文件 hash（用于秒传和断点续传）
    const hash = await this.calculateHash(file);

    // 2. 检查已上传的分片
    const { uploaded, uploadedChunks } = await this.checkFile(hash, file.name);
    if (uploaded) {
      return { success: true, message: '秒传成功' };
    }

    // 3. 切片
    const chunks = this.createChunks(file);

    // 4. 过滤已上传的分片
    const pendingChunks = chunks.filter(
      (_, index) => !uploadedChunks.includes(index)
    );

    // 5. 并发上传
    await this.uploadChunks(pendingChunks, hash, file.name);

    // 6. 合并请求
    return this.mergeFile(hash, file.name, chunks.length);
  }

  // 计算 hash（使用 Web Worker 避免阻塞）
  calculateHash(file) {
    return new Promise(resolve => {
      const worker = new Worker('/hash-worker.js');
      worker.postMessage({ file });
      worker.onmessage = e => {
        resolve(e.data.hash);
        worker.terminate();
      };
    });
  }

  // 切片
  createChunks(file) {
    const chunks = [];
    let start = 0;
    let index = 0;

    while (start < file.size) {
      chunks.push({
        index,
        blob: file.slice(start, start + this.chunkSize)
      });
      start += this.chunkSize;
      index++;
    }

    return chunks;
  }

  // 并发上传
  async uploadChunks(chunks, hash, filename) {
    const pool = [];

    for (const chunk of chunks) {
      const task = this.uploadChunk(chunk, hash, filename);

      task.then(() => {
        pool.splice(pool.indexOf(task), 1);
      });

      pool.push(task);

      if (pool.length >= this.concurrency) {
        await Promise.race(pool);
      }
    }

    await Promise.all(pool);
  }

  // 上传单个分片
  async uploadChunk(chunk, hash, filename) {
    const formData = new FormData();
    formData.append('chunk', chunk.blob);
    formData.append('hash', hash);
    formData.append('filename', filename);
    formData.append('index', chunk.index);

    return fetch('/upload', {
      method: 'POST',
      body: formData
    });
  }
}
```

---

## 腾讯

### 一面

#### 15. 实现一个 EventEmitter

```javascript
class EventEmitter {
  constructor() {
    this.events = new Map();
  }

  on(event, callback) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event).push(callback);
    return this;
  }

  off(event, callback) {
    if (!this.events.has(event)) return this;
    if (!callback) {
      this.events.delete(event);
    } else {
      const callbacks = this.events.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) callbacks.splice(index, 1);
    }
    return this;
  }

  emit(event, ...args) {
    if (!this.events.has(event)) return this;
    this.events.get(event).forEach(cb => cb.apply(this, args));
    return this;
  }

  once(event, callback) {
    const wrapper = (...args) => {
      callback.apply(this, args);
      this.off(event, wrapper);
    };
    wrapper.originalCallback = callback;
    return this.on(event, wrapper);
  }
}
```

---

#### 16. 手写 Redux

```javascript
function createStore(reducer, preloadedState, enhancer) {
  if (enhancer) {
    return enhancer(createStore)(reducer, preloadedState);
  }

  let state = preloadedState;
  let listeners = [];

  const getState = () => state;

  const dispatch = (action) => {
    state = reducer(state, action);
    listeners.forEach(listener => listener());
    return action;
  };

  const subscribe = (listener) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  };

  // 初始化
  dispatch({ type: '@@INIT' });

  return { getState, dispatch, subscribe };
}

// 中间件机制
function applyMiddleware(...middlewares) {
  return (createStore) => (reducer, preloadedState) => {
    const store = createStore(reducer, preloadedState);
    let dispatch = store.dispatch;

    const middlewareAPI = {
      getState: store.getState,
      dispatch: (action) => dispatch(action)
    };

    const chain = middlewares.map(middleware => middleware(middlewareAPI));
    dispatch = compose(...chain)(store.dispatch);

    return { ...store, dispatch };
  };
}

// 使用
const store = createStore(
  reducer,
  initialState,
  applyMiddleware(logger, thunk)
);
```

---

#### 17. CSS 三栏布局

**问题：** 实现一个三栏布局，左右固定宽度，中间自适应

**方案一：Flex**
```css
.container {
  display: flex;
}
.left, .right {
  width: 200px;
}
.center {
  flex: 1;
}
```

**方案二：Grid**
```css
.container {
  display: grid;
  grid-template-columns: 200px 1fr 200px;
}
```

**方案三：Float（圣杯布局）**
```css
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
```

**方案四：绝对定位**
```css
.container {
  position: relative;
}
.left {
  position: absolute;
  left: 0;
  width: 200px;
}
.right {
  position: absolute;
  right: 0;
  width: 200px;
}
.center {
  margin: 0 200px;
}
```

---

### 二面

#### 18. 性能优化实战

**问题：** 页面首屏加载需要 5 秒，如何优化到 1.5 秒以内？

**答案：**

**1. 资源优化**
```javascript
// 代码分割
const Home = React.lazy(() => import('./pages/Home'));

// 图片优化
<img loading="lazy" src="image.webp" />

// 字体优化
<link rel="preload" href="font.woff2" as="font" crossorigin />
```

**2. 网络优化**
```nginx
# Gzip/Brotli 压缩
gzip on;
gzip_types text/plain application/javascript text/css;

# HTTP/2
listen 443 ssl http2;

# CDN 加速
# 静态资源放 CDN

# 缓存策略
location ~* \.(js|css|png|jpg)$ {
  expires 1y;
  add_header Cache-Control "public, immutable";
}
```

**3. 渲染优化**
```html
<!-- 关键 CSS 内联 -->
<style>/* 首屏关键样式 */</style>

<!-- 非关键 CSS 异步加载 -->
<link rel="preload" href="styles.css" as="style" onload="this.rel='stylesheet'">

<!-- JS 延迟加载 -->
<script defer src="app.js"></script>
```

**4. 服务端优化**
```javascript
// SSR
export async function getServerSideProps() {
  const data = await fetchData();
  return { props: { data } };
}

// 接口优化
// - 数据库索引
// - Redis 缓存
// - 并行请求
```

**5. 监控指标**
```javascript
// 性能指标
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log('LCP:', entry.startTime);
  }
}).observe({ entryTypes: ['largest-contentful-paint'] });
```

---

## 美团

### 一面

#### 19. 手写 Promise

```javascript
class MyPromise {
  constructor(executor) {
    this.state = 'pending';
    this.value = undefined;
    this.reason = undefined;
    this.onFulfilledCallbacks = [];
    this.onRejectedCallbacks = [];

    const resolve = (value) => {
      if (this.state === 'pending') {
        this.state = 'fulfilled';
        this.value = value;
        this.onFulfilledCallbacks.forEach(fn => fn());
      }
    };

    const reject = (reason) => {
      if (this.state === 'pending') {
        this.state = 'rejected';
        this.reason = reason;
        this.onRejectedCallbacks.forEach(fn => fn());
      }
    };

    try {
      executor(resolve, reject);
    } catch (e) {
      reject(e);
    }
  }

  then(onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : v => v;
    onRejected = typeof onRejected === 'function' ? onRejected : e => { throw e; };

    const promise2 = new MyPromise((resolve, reject) => {
      const fulfilledTask = () => {
        queueMicrotask(() => {
          try {
            const x = onFulfilled(this.value);
            this.resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
      };

      const rejectedTask = () => {
        queueMicrotask(() => {
          try {
            const x = onRejected(this.reason);
            this.resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
      };

      if (this.state === 'fulfilled') {
        fulfilledTask();
      } else if (this.state === 'rejected') {
        rejectedTask();
      } else {
        this.onFulfilledCallbacks.push(fulfilledTask);
        this.onRejectedCallbacks.push(rejectedTask);
      }
    });

    return promise2;
  }

  resolvePromise(promise2, x, resolve, reject) {
    if (promise2 === x) {
      return reject(new TypeError('Chaining cycle detected'));
    }

    if (x instanceof MyPromise) {
      x.then(resolve, reject);
    } else if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
      try {
        const then = x.then;
        if (typeof then === 'function') {
          then.call(x, resolve, reject);
        } else {
          resolve(x);
        }
      } catch (e) {
        reject(e);
      }
    } else {
      resolve(x);
    }
  }

  catch(onRejected) {
    return this.then(null, onRejected);
  }

  static resolve(value) {
    return new MyPromise(resolve => resolve(value));
  }

  static reject(reason) {
    return new MyPromise((_, reject) => reject(reason));
  }
}
```

---

#### 20. 算法：有效括号

```javascript
function isValid(s) {
  const stack = [];
  const map = { ')': '(', ']': '[', '}': '{' };

  for (const char of s) {
    if (['(', '[', '{'].includes(char)) {
      stack.push(char);
    } else {
      if (stack.pop() !== map[char]) return false;
    }
  }

  return stack.length === 0;
}

// 测试
isValid('()[]{}');  // true
isValid('([)]');    // false
isValid('{[]}');    // true
```

---

#### 21. Vue 组件通信方式

**问题：** 列举 Vue 中所有组件通信方式

| 方式 | 场景 | 示例 |
|-----|------|------|
| props | 父→子 | `<Child :msg="msg" />` |
| emit | 子→父 | `emit('update', value)` |
| v-model | 双向绑定 | `<Child v-model="value" />` |
| provide/inject | 跨层级 | `provide('key', value)` |
| ref | 父访问子 | `<Child ref="child" />` |
| EventBus | 任意组件 | `bus.emit('event')` |
| Pinia/Vuex | 全局状态 | `store.state` |
| attrs/listeners | 透传属性 | `v-bind="$attrs"` |

---

## 百度

### 一面

#### 22. 实现 instanceof

```javascript
function myInstanceof(obj, Constructor) {
  if (obj === null || typeof obj !== 'object') return false;

  let proto = Object.getPrototypeOf(obj);
  const prototype = Constructor.prototype;

  while (proto) {
    if (proto === prototype) return true;
    proto = Object.getPrototypeOf(proto);
  }

  return false;
}

// 测试
myInstanceof([], Array);   // true
myInstanceof([], Object);  // true
myInstanceof({}, Array);   // false
```

---

#### 23. 算法：两数之和

```javascript
function twoSum(nums, target) {
  const map = new Map();

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }

  return [];
}

// 测试
twoSum([2, 7, 11, 15], 9);  // [0, 1]
```

---

#### 24. 实现 Object.create

```javascript
function myCreate(proto, propertiesObject) {
  if (typeof proto !== 'object' && typeof proto !== 'function') {
    throw new TypeError('Object prototype may only be an Object or null');
  }

  function F() {}
  F.prototype = proto;
  const obj = new F();

  if (propertiesObject !== undefined) {
    Object.defineProperties(obj, propertiesObject);
  }

  return obj;
}
```

---

#### 25. HTTP 缓存策略

**问题：** 详细说明 HTTP 缓存机制

```
用户请求
    │
    ▼
┌───────────────────┐
│   检查强缓存       │
│ Cache-Control     │
│ Expires          │
└─────────┬─────────┘
          │
    命中？ ├── 是 ──→ 直接使用缓存 (200 from cache)
          │
          否
          │
          ▼
┌───────────────────┐
│   发送协商请求     │
│ If-None-Match    │
│ If-Modified-Since│
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│   服务器验证       │
│ ETag             │
│ Last-Modified    │
└─────────┬─────────┘
          │
    有效？ ├── 是 ──→ 返回 304，使用缓存
          │
          否
          │
          ▼
    返回新资源 (200)
```

**缓存头说明：**
```http
# 强缓存
Cache-Control: max-age=3600       # 1小时
Cache-Control: no-cache           # 跳过强缓存，走协商
Cache-Control: no-store           # 不缓存

# 协商缓存
ETag: "abc123"                    # 资源指纹
If-None-Match: "abc123"           # 客户端带上

Last-Modified: Mon, 01 Jan 2024   # 修改时间
If-Modified-Since: Mon, 01 Jan 2024
```

---

## 滴滴

### 一面

#### 26. 实现一个简单的模板引擎

```javascript
function template(str, data) {
  return str.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key] !== undefined ? data[key] : match;
  });
}

// 进阶版：支持表达式
function templateAdvanced(str, data) {
  const fn = new Function(
    'data',
    `with(data) { return \`${str.replace(/\{\{(.+?)\}\}/g, '${$1}')}\` }`
  );
  return fn(data);
}

// 测试
template('Hello, {{name}}!', { name: 'World' });
// 'Hello, World!'

templateAdvanced('{{ a + b }}', { a: 1, b: 2 });
// '3'
```

---

#### 27. 算法：最长不重复子串

```javascript
function lengthOfLongestSubstring(s) {
  const map = new Map();
  let left = 0;
  let maxLen = 0;

  for (let right = 0; right < s.length; right++) {
    const char = s[right];
    if (map.has(char) && map.get(char) >= left) {
      left = map.get(char) + 1;
    }
    map.set(char, right);
    maxLen = Math.max(maxLen, right - left + 1);
  }

  return maxLen;
}

// 测试
lengthOfLongestSubstring('abcabcbb');  // 3 ('abc')
lengthOfLongestSubstring('bbbbb');     // 1 ('b')
```

---

## 快手

### 一面

#### 28. 实现数字千分位格式化

```javascript
// 方法1：正则
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// 方法2：toLocaleString
function formatNumber2(num) {
  return num.toLocaleString();
}

// 方法3：手动实现
function formatNumber3(num) {
  const [int, decimal] = String(num).split('.');
  const result = [];

  for (let i = int.length - 1, count = 0; i >= 0; i--) {
    if (count > 0 && count % 3 === 0) {
      result.unshift(',');
    }
    result.unshift(int[i]);
    count++;
  }

  return decimal ? result.join('') + '.' + decimal : result.join('');
}

// 测试
formatNumber(1234567.89);  // '1,234,567.89'
```

---

#### 29. 实现一个 sleep 函数

```javascript
// Promise 版本
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 使用
async function demo() {
  console.log('Start');
  await sleep(1000);
  console.log('End');  // 1秒后执行
}

// Generator 版本
function* sleepGenerator(ms) {
  yield new Promise(resolve => setTimeout(resolve, ms));
}
```

---

## 综合算法题

### 30. 反转链表

```javascript
function reverseList(head) {
  let prev = null;
  let curr = head;

  while (curr) {
    const next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
  }

  return prev;
}
```

### 31. 二叉树层序遍历

```javascript
function levelOrder(root) {
  if (!root) return [];
  const result = [];
  const queue = [root];

  while (queue.length) {
    const level = [];
    const size = queue.length;

    for (let i = 0; i < size; i++) {
      const node = queue.shift();
      level.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }

    result.push(level);
  }

  return result;
}
```

### 32. 合并两个有序数组

```javascript
function merge(nums1, m, nums2, n) {
  let p1 = m - 1;
  let p2 = n - 1;
  let p = m + n - 1;

  while (p2 >= 0) {
    if (p1 >= 0 && nums1[p1] > nums2[p2]) {
      nums1[p] = nums1[p1];
      p1--;
    } else {
      nums1[p] = nums2[p2];
      p2--;
    }
    p--;
  }
}
```

### 33. 最大子数组和

```javascript
function maxSubArray(nums) {
  let maxSum = nums[0];
  let currentSum = nums[0];

  for (let i = 1; i < nums.length; i++) {
    currentSum = Math.max(nums[i], currentSum + nums[i]);
    maxSum = Math.max(maxSum, currentSum);
  }

  return maxSum;
}
```

### 34. 爬楼梯

```javascript
function climbStairs(n) {
  if (n <= 2) return n;

  let prev1 = 1;
  let prev2 = 2;

  for (let i = 3; i <= n; i++) {
    const curr = prev1 + prev2;
    prev1 = prev2;
    prev2 = curr;
  }

  return prev2;
}
```

### 35. 买卖股票的最佳时机

```javascript
function maxProfit(prices) {
  let minPrice = Infinity;
  let maxProfit = 0;

  for (const price of prices) {
    minPrice = Math.min(minPrice, price);
    maxProfit = Math.max(maxProfit, price - minPrice);
  }

  return maxProfit;
}
```

---

## 更多高频手写题

### 36. 实现 Array.prototype.reduce

```javascript
Array.prototype.myReduce = function(callback, initialValue) {
  const arr = this;
  let accumulator = initialValue;
  let startIndex = 0;

  // 没有初始值时，使用数组第一个元素
  if (accumulator === undefined) {
    if (arr.length === 0) {
      throw new TypeError('Reduce of empty array with no initial value');
    }
    accumulator = arr[0];
    startIndex = 1;
  }

  for (let i = startIndex; i < arr.length; i++) {
    accumulator = callback(accumulator, arr[i], i, arr);
  }

  return accumulator;
};

// 测试
[1, 2, 3, 4].myReduce((acc, cur) => acc + cur, 0); // 10
```

---

### 37. 实现 Array.prototype.map

```javascript
Array.prototype.myMap = function(callback, thisArg) {
  const result = [];
  for (let i = 0; i < this.length; i++) {
    if (i in this) {
      result[i] = callback.call(thisArg, this[i], i, this);
    }
  }
  return result;
};

// 测试
[1, 2, 3].myMap(x => x * 2); // [2, 4, 6]
```

---

### 38. 实现 Array.prototype.filter

```javascript
Array.prototype.myFilter = function(callback, thisArg) {
  const result = [];
  for (let i = 0; i < this.length; i++) {
    if (i in this && callback.call(thisArg, this[i], i, this)) {
      result.push(this[i]);
    }
  }
  return result;
};

// 测试
[1, 2, 3, 4].myFilter(x => x > 2); // [3, 4]
```

---

### 39. 实现 Promise.race

```javascript
Promise.myRace = function(promises) {
  return new Promise((resolve, reject) => {
    promises.forEach(p => {
      Promise.resolve(p).then(resolve, reject);
    });
  });
};

// 测试
Promise.myRace([
  new Promise(resolve => setTimeout(() => resolve(1), 100)),
  new Promise(resolve => setTimeout(() => resolve(2), 50))
]).then(console.log); // 2
```

---

### 40. 实现 Promise.any

```javascript
Promise.myAny = function(promises) {
  return new Promise((resolve, reject) => {
    let rejectedCount = 0;
    const errors = [];

    promises.forEach((p, i) => {
      Promise.resolve(p).then(
        resolve,
        err => {
          errors[i] = err;
          rejectedCount++;
          if (rejectedCount === promises.length) {
            reject(new AggregateError(errors, 'All promises were rejected'));
          }
        }
      );
    });
  });
};
```

---

### 41. 实现 Object.assign

```javascript
Object.myAssign = function(target, ...sources) {
  if (target == null) {
    throw new TypeError('Cannot convert undefined or null to object');
  }

  const result = Object(target);

  sources.forEach(source => {
    if (source != null) {
      for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          result[key] = source[key];
        }
      }
      // 处理 Symbol 属性
      Object.getOwnPropertySymbols(source).forEach(sym => {
        result[sym] = source[sym];
      });
    }
  });

  return result;
};
```

---

### 42. 实现 Object.is

```javascript
Object.myIs = function(a, b) {
  // 处理 +0 和 -0
  if (a === 0 && b === 0) {
    return 1 / a === 1 / b;
  }
  // 处理 NaN
  if (a !== a) {
    return b !== b;
  }
  return a === b;
};

// 测试
Object.myIs(NaN, NaN);   // true
Object.myIs(+0, -0);     // false
Object.myIs(1, 1);       // true
```

---

### 43. 实现 JSONP

```javascript
function jsonp(url, params = {}, callbackName = 'callback') {
  return new Promise((resolve, reject) => {
    // 创建唯一回调函数名
    const fnName = `jsonp_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    // 构建 URL
    const query = Object.entries(params)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('&');
    const src = `${url}?${query}&${callbackName}=${fnName}`;

    // 创建 script 标签
    const script = document.createElement('script');
    script.src = src;

    // 注册全局回调
    window[fnName] = (data) => {
      resolve(data);
      document.body.removeChild(script);
      delete window[fnName];
    };

    script.onerror = () => {
      reject(new Error('JSONP request failed'));
      document.body.removeChild(script);
      delete window[fnName];
    };

    document.body.appendChild(script);
  });
}

// 使用
jsonp('https://api.example.com/data', { id: 1 })
  .then(data => console.log(data));
```

---

### 44. 实现图片懒加载

```javascript
class LazyLoad {
  constructor(selector = 'img[data-src]') {
    this.images = document.querySelectorAll(selector);
    this.init();
  }

  init() {
    // 使用 IntersectionObserver
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              this.loadImage(entry.target);
              observer.unobserve(entry.target);
            }
          });
        },
        { rootMargin: '100px' }
      );

      this.images.forEach(img => observer.observe(img));
    } else {
      // 降级方案
      this.bindScroll();
    }
  }

  loadImage(img) {
    const src = img.dataset.src;
    if (src) {
      img.src = src;
      img.removeAttribute('data-src');
    }
  }

  bindScroll() {
    const throttledCheck = throttle(() => this.checkImages(), 200);
    window.addEventListener('scroll', throttledCheck);
    this.checkImages();
  }

  checkImages() {
    this.images.forEach(img => {
      if (this.isInViewport(img)) {
        this.loadImage(img);
      }
    });
  }

  isInViewport(el) {
    const rect = el.getBoundingClientRect();
    return rect.top < window.innerHeight + 100 && rect.bottom > 0;
  }
}
```

---

### 45. 实现无限滚动

```javascript
class InfiniteScroll {
  constructor(options) {
    this.container = options.container;
    this.loadMore = options.loadMore;
    this.threshold = options.threshold || 100;
    this.loading = false;

    this.init();
  }

  init() {
    const observer = new IntersectionObserver(
      async (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !this.loading) {
          this.loading = true;
          await this.loadMore();
          this.loading = false;
        }
      },
      { rootMargin: `${this.threshold}px` }
    );

    // 观察一个哨兵元素
    this.sentinel = document.createElement('div');
    this.sentinel.className = 'scroll-sentinel';
    this.container.appendChild(this.sentinel);
    observer.observe(this.sentinel);
  }
}

// 使用
new InfiniteScroll({
  container: document.querySelector('.list'),
  loadMore: async () => {
    const data = await fetchMoreData();
    renderItems(data);
  }
});
```

---

### 46. 实现拖拽排序

```javascript
function initDragSort(container) {
  let dragging = null;

  container.addEventListener('dragstart', (e) => {
    dragging = e.target;
    e.target.classList.add('dragging');
  });

  container.addEventListener('dragend', (e) => {
    e.target.classList.remove('dragging');
    dragging = null;
  });

  container.addEventListener('dragover', (e) => {
    e.preventDefault();
    const target = e.target;

    if (target !== dragging && target.draggable) {
      const rect = target.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;

      if (e.clientY < midY) {
        container.insertBefore(dragging, target);
      } else {
        container.insertBefore(dragging, target.nextSibling);
      }
    }
  });
}
```

---

### 47. 实现双向数据绑定

```javascript
// 简易版 Vue 双向绑定
function reactive(obj, callback) {
  return new Proxy(obj, {
    get(target, key) {
      return target[key];
    },
    set(target, key, value) {
      target[key] = value;
      callback(key, value);
      return true;
    }
  });
}

// 使用
const data = reactive({ text: '' }, (key, value) => {
  document.querySelector(`[data-bind="${key}"]`).textContent = value;
});

// 监听 input
document.querySelector('input').addEventListener('input', (e) => {
  data.text = e.target.value;
});
```

---

### 48. 实现单例模式

```javascript
// 方式1：闭包
const Singleton = (function() {
  let instance;

  function createInstance() {
    return { name: 'singleton' };
  }

  return {
    getInstance() {
      if (!instance) {
        instance = createInstance();
      }
      return instance;
    }
  };
})();

// 方式2：类
class Database {
  static instance = null;

  constructor() {
    if (Database.instance) {
      return Database.instance;
    }
    Database.instance = this;
  }

  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }
}

// 方式3：Proxy
function singleton(className) {
  let instance;
  return new Proxy(className, {
    construct(target, args) {
      if (!instance) {
        instance = new target(...args);
      }
      return instance;
    }
  });
}
```

---

### 49. 实现观察者模式

```javascript
class Subject {
  constructor() {
    this.observers = [];
    this.state = null;
  }

  attach(observer) {
    this.observers.push(observer);
  }

  detach(observer) {
    this.observers = this.observers.filter(o => o !== observer);
  }

  setState(state) {
    this.state = state;
    this.notify();
  }

  notify() {
    this.observers.forEach(observer => observer.update(this.state));
  }
}

class Observer {
  constructor(name) {
    this.name = name;
  }

  update(state) {
    console.log(`${this.name} received: ${state}`);
  }
}

// 使用
const subject = new Subject();
const observer1 = new Observer('Observer 1');
const observer2 = new Observer('Observer 2');

subject.attach(observer1);
subject.attach(observer2);
subject.setState('Hello');
// Observer 1 received: Hello
// Observer 2 received: Hello
```

---

### 50. 实现 Ajax 请求封装

```javascript
function ajax(options) {
  return new Promise((resolve, reject) => {
    const {
      url,
      method = 'GET',
      data = null,
      headers = {},
      timeout = 10000
    } = options;

    const xhr = new XMLHttpRequest();

    xhr.open(method, url, true);

    // 设置请求头
    Object.entries(headers).forEach(([key, value]) => {
      xhr.setRequestHeader(key, value);
    });

    // 超时设置
    xhr.timeout = timeout;

    xhr.onload = function() {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch {
          resolve(xhr.responseText);
        }
      } else {
        reject(new Error(`HTTP Error: ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error('Network Error'));
    xhr.ontimeout = () => reject(new Error('Timeout'));

    // 发送请求
    if (data && method !== 'GET') {
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify(data));
    } else {
      xhr.send();
    }
  });
}

// 使用
ajax({
  url: '/api/users',
  method: 'POST',
  data: { name: 'John' },
  headers: { 'Authorization': 'Bearer token' }
}).then(console.log);
```

---

## 进阶场景题

### 51. 实现 retry 重试机制

```javascript
function retry(fn, times = 3, delay = 1000) {
  return new Promise((resolve, reject) => {
    const attempt = (remaining) => {
      fn()
        .then(resolve)
        .catch(err => {
          if (remaining <= 1) {
            reject(err);
          } else {
            console.log(`Retrying... ${remaining - 1} attempts left`);
            setTimeout(() => attempt(remaining - 1), delay);
          }
        });
    };
    attempt(times);
  });
}

// 指数退避
function retryWithBackoff(fn, times = 3, baseDelay = 1000) {
  return new Promise((resolve, reject) => {
    const attempt = (remaining, delay) => {
      fn()
        .then(resolve)
        .catch(err => {
          if (remaining <= 1) {
            reject(err);
          } else {
            setTimeout(() => attempt(remaining - 1, delay * 2), delay);
          }
        });
    };
    attempt(times, baseDelay);
  });
}
```

---

### 52. 实现 memorize 缓存函数

```javascript
function memoize(fn) {
  const cache = new Map();

  return function(...args) {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

// 支持过期时间的版本
function memoizeWithTTL(fn, ttl = 60000) {
  const cache = new Map();

  return function(...args) {
    const key = JSON.stringify(args);
    const cached = cache.get(key);

    if (cached && Date.now() - cached.time < ttl) {
      return cached.value;
    }

    const result = fn.apply(this, args);
    cache.set(key, { value: result, time: Date.now() });
    return result;
  };
}

// 测试
const expensiveFn = memoize((n) => {
  console.log('Computing...');
  return n * 2;
});

expensiveFn(5); // Computing... 10
expensiveFn(5); // 10 (from cache)
```

---

### 53. 实现并发任务调度器

```javascript
class Scheduler {
  constructor(maxConcurrent = 2) {
    this.maxConcurrent = maxConcurrent;
    this.running = 0;
    this.queue = [];
  }

  add(task) {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this.run();
    });
  }

  run() {
    while (this.running < this.maxConcurrent && this.queue.length) {
      const { task, resolve, reject } = this.queue.shift();
      this.running++;

      task()
        .then(resolve)
        .catch(reject)
        .finally(() => {
          this.running--;
          this.run();
        });
    }
  }
}

// 测试
const scheduler = new Scheduler(2);
const delay = (ms) => new Promise(r => setTimeout(r, ms));

const addTask = (time, order) => {
  scheduler.add(() => delay(time)).then(() => console.log(order));
};

addTask(1000, '1');
addTask(500, '2');
addTask(300, '3');
addTask(400, '4');

// 输出顺序: 2 3 1 4
```

---

### 54. 实现 URL 参数解析

```javascript
function parseURL(url) {
  const result = {
    protocol: '',
    host: '',
    port: '',
    pathname: '',
    search: '',
    hash: '',
    query: {}
  };

  // 使用 URL API
  try {
    const urlObj = new URL(url);
    result.protocol = urlObj.protocol.slice(0, -1);
    result.host = urlObj.hostname;
    result.port = urlObj.port;
    result.pathname = urlObj.pathname;
    result.search = urlObj.search;
    result.hash = urlObj.hash;

    // 解析 query
    urlObj.searchParams.forEach((value, key) => {
      if (result.query[key]) {
        result.query[key] = [].concat(result.query[key], value);
      } else {
        result.query[key] = value;
      }
    });
  } catch {
    // 手动解析
    const match = url.match(
      /^(https?):\/\/([^:\/]+)(?::(\d+))?(\/[^?#]*)?(\?[^#]*)?(#.*)?$/
    );
    if (match) {
      result.protocol = match[1];
      result.host = match[2];
      result.port = match[3] || '';
      result.pathname = match[4] || '/';
      result.search = match[5] || '';
      result.hash = match[6] || '';

      // 解析 query
      if (result.search) {
        result.search.slice(1).split('&').forEach(pair => {
          const [key, value] = pair.split('=').map(decodeURIComponent);
          result.query[key] = value;
        });
      }
    }
  }

  return result;
}

// 测试
parseURL('https://example.com:8080/path?name=test&id=1#section');
```

---

### 55. 实现模板字符串解析

```javascript
function render(template, data) {
  return template.replace(/\{\{(.+?)\}\}/g, (match, key) => {
    // 支持嵌套属性 如 {{user.name}}
    const keys = key.trim().split('.');
    let value = data;

    for (const k of keys) {
      value = value?.[k];
    }

    return value !== undefined ? value : match;
  });
}

// 支持表达式的版本
function renderWithExpr(template, data) {
  return template.replace(/\{\{(.+?)\}\}/g, (match, expr) => {
    try {
      const fn = new Function(...Object.keys(data), `return ${expr.trim()}`);
      return fn(...Object.values(data));
    } catch {
      return match;
    }
  });
}

// 测试
render('Hello, {{user.name}}!', { user: { name: 'World' } });
// 'Hello, World!'

renderWithExpr('{{ a + b }}', { a: 1, b: 2 });
// '3'
```

---

### 56. 实现 sleep 和 delay

```javascript
// sleep: 阻塞等待
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// delay: 延迟执行函数
function delay(fn, ms, ...args) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve(fn(...args));
      } catch (e) {
        reject(e);
      }
    }, ms);
  });
}

// 可取消的 delay
function cancellableDelay(fn, ms, ...args) {
  let timeoutId;
  let reject;

  const promise = new Promise((resolve, rej) => {
    reject = rej;
    timeoutId = setTimeout(() => {
      try {
        resolve(fn(...args));
      } catch (e) {
        rej(e);
      }
    }, ms);
  });

  promise.cancel = () => {
    clearTimeout(timeoutId);
    reject(new Error('Cancelled'));
  };

  return promise;
}

// 使用
async function demo() {
  console.log('Start');
  await sleep(1000);
  console.log('After 1s');

  const result = await delay((a, b) => a + b, 500, 1, 2);
  console.log(result); // 3
}
```

---

### 57. 实现对象路径取值和设值

```javascript
// 取值
function get(obj, path, defaultValue = undefined) {
  const keys = Array.isArray(path)
    ? path
    : path.replace(/\[(\d+)\]/g, '.$1').split('.');

  let result = obj;

  for (const key of keys) {
    if (result == null) return defaultValue;
    result = result[key];
  }

  return result === undefined ? defaultValue : result;
}

// 设值
function set(obj, path, value) {
  const keys = Array.isArray(path)
    ? path
    : path.replace(/\[(\d+)\]/g, '.$1').split('.');

  let current = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    const nextKey = keys[i + 1];

    if (current[key] == null) {
      // 根据下一个 key 判断创建数组还是对象
      current[key] = /^\d+$/.test(nextKey) ? [] : {};
    }

    current = current[key];
  }

  current[keys[keys.length - 1]] = value;
  return obj;
}

// 测试
const obj = { a: { b: [{ c: 1 }] } };
get(obj, 'a.b[0].c'); // 1
set(obj, 'a.b[0].d', 2); // { a: { b: [{ c: 1, d: 2 }] } }
```

---

### 58. 实现版本号比较

```javascript
function compareVersion(v1, v2) {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  const maxLen = Math.max(parts1.length, parts2.length);

  for (let i = 0; i < maxLen; i++) {
    const num1 = parts1[i] || 0;
    const num2 = parts2[i] || 0;

    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }

  return 0;
}

// 测试
compareVersion('1.0.0', '1.0.1');   // -1
compareVersion('1.0.2', '1.0.1');   // 1
compareVersion('1.0.0', '1.0.0');   // 0
compareVersion('1.0', '1.0.0');     // 0
compareVersion('1.10.0', '1.9.0');  // 1
```

---

### 59. 实现千分位格式化（支持小数）

```javascript
function formatNumber(num) {
  const [int, decimal] = String(num).split('.');

  // 整数部分添加千分位
  const formattedInt = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return decimal ? `${formattedInt}.${decimal}` : formattedInt;
}

// 或者使用 Intl API
function formatNumberIntl(num) {
  return new Intl.NumberFormat().format(num);
}

// 测试
formatNumber(1234567.89);  // '1,234,567.89'
formatNumber(-1234567);    // '-1,234,567'
```

---

### 60. 实现 compose 和 pipe

```javascript
// compose: 从右到左执行
function compose(...fns) {
  if (fns.length === 0) return (x) => x;
  if (fns.length === 1) return fns[0];

  return fns.reduce((a, b) => (...args) => a(b(...args)));
}

// pipe: 从左到右执行
function pipe(...fns) {
  if (fns.length === 0) return (x) => x;
  if (fns.length === 1) return fns[0];

  return fns.reduce((a, b) => (...args) => b(a(...args)));
}

// 异步版本
function asyncPipe(...fns) {
  return function(input) {
    return fns.reduce(
      (promise, fn) => promise.then(fn),
      Promise.resolve(input)
    );
  };
}

// 测试
const add1 = x => x + 1;
const mul2 = x => x * 2;
const sub3 = x => x - 3;

compose(sub3, mul2, add1)(5);  // (5+1)*2-3 = 9
pipe(add1, mul2, sub3)(5);     // (5+1)*2-3 = 9
```

---

## 面试技巧

### 回答问题的 STAR 法则

- **S**ituation（情境）：描述背景
- **T**ask（任务）：说明目标
- **A**ction（行动）：具体做了什么
- **R**esult（结果）：取得什么成果

### 项目经验描述模板

> "在 XX 项目中，面对 XX 问题，我通过 XX 技术方案，实现了 XX 效果，性能提升了 XX%。"

### 常见追问应对

| 追问 | 应对 |
|-----|------|
| "还有其他方案吗？" | 列举 2-3 种替代方案并对比 |
| "为什么选择这个方案？" | 从性能、可维护性、团队熟悉度分析 |
| "遇到什么困难？" | 描述具体问题和解决过程 |
| "如何优化？" | 从时间复杂度、空间复杂度、用户体验角度 |

---

## 八股文快速记忆口诀

> 面试前快速过一遍，加深记忆

### JavaScript

**事件循环：** 同步 → 微任务 → 宏任务

**this 指向：** 箭头看定义，普通看调用

**闭包三要素：** 函数嵌套 + 内部访问外部 + 返回内部函数

**new 四步曲：** 创对象 → 连原型 → 执行函数 → 返回结果

**深拷贝要点：** JSON 简单用，递归才完整，WeakMap 防循环

### CSS

**BFC 触发：** float/position/display/overflow（浮定显溢）

**居中方案：** flex 最简单，grid 更强大，定位要计算

**重排重绘：** 几何变重排，外观变重绘，transform 最优

### 浏览器与网络

**HTTP 缓存：** 强缓存不请求，协商缓存看响应

**跨域方案：** CORS 最标准，代理最常用，JSONP 已过时

**TCP 握手：** 三次握手建连接，四次挥手断连接

**HTTPS：** 非对称换密钥，对称加密传数据

### 框架

**Vue 响应式：** 2 用 defineProperty，3 用 Proxy

**Vue 通信：** 父子 props/emit，跨级 provide/inject，全局 Pinia

**React 优化：** memo 包组件，useMemo 包计算，useCallback 包函数

**Hooks 规则：** 顶层调用，条件禁用，自定义复用

### 性能优化

**首屏优化：** 懒加载 + 预加载 + SSR + CDN

**构建优化：** 分包 + 压缩 + Tree Shaking + 缓存

**运行时优化：** 防抖节流 + 虚拟列表 + Web Worker

### 安全

**XSS 防御：** 输入过滤 + 输出转义 + CSP + HttpOnly

**CSRF 防御：** Token + SameSite + Referer 校验

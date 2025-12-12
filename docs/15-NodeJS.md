# Node.js 面试题

## 基础概念

### 1. Node.js 是什么？有什么特点？

**答案：**

Node.js 是基于 Chrome V8 引擎的 JavaScript 运行时环境。

**特点：**

1. **单线程**：主线程是单线程，通过事件循环处理并发
2. **非阻塞 I/O**：异步 I/O 操作，不阻塞主线程
3. **事件驱动**：基于事件循环机制
4. **跨平台**：支持 Windows、Linux、macOS
5. **npm 生态**：拥有丰富的第三方包

**适用场景：**
- I/O 密集型应用
- 实时应用（聊天、游戏）
- API 服务
- 微服务架构
- 工具开发（CLI、构建工具）

**不适用场景：**
- CPU 密集型计算（可用 Worker Threads 解决）

---

### 2. Node.js 事件循环机制

**答案：**

```
   ┌───────────────────────────┐
┌─>│           timers          │  setTimeout/setInterval
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     pending callbacks     │  系统操作回调
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │       idle, prepare       │  内部使用
│  └─────────────┬─────────────┘      ┌───────────────┐
│  ┌─────────────┴─────────────┐      │   incoming:   │
│  │           poll            │<─────┤  connections, │
│  └─────────────┬─────────────┘      │   data, etc.  │
│  ┌─────────────┴─────────────┐      └───────────────┘
│  │           check           │  setImmediate
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
└──┤      close callbacks      │  socket.on('close')
   └───────────────────────────┘
```

**各阶段说明：**

```javascript
// 1. timers 阶段
setTimeout(() => console.log('timeout'), 0);
setInterval(() => console.log('interval'), 1000);

// 2. pending callbacks
// 处理系统操作的回调，如 TCP 错误

// 3. poll 阶段
// 获取新的 I/O 事件，执行 I/O 回调
fs.readFile('file.txt', (err, data) => {
  console.log('file read');
});

// 4. check 阶段
setImmediate(() => console.log('immediate'));

// 5. close callbacks
socket.on('close', () => console.log('socket closed'));
```

**微任务队列：**

```javascript
// process.nextTick 优先级最高
process.nextTick(() => console.log('nextTick'));

// Promise 微任务
Promise.resolve().then(() => console.log('promise'));

// 执行顺序示例
console.log('start');

setTimeout(() => console.log('timeout'), 0);

setImmediate(() => console.log('immediate'));

Promise.resolve().then(() => console.log('promise'));

process.nextTick(() => console.log('nextTick'));

console.log('end');

// 输出：
// start
// end
// nextTick
// promise
// timeout
// immediate (顺序可能变化)
```

---

### 3. setTimeout 和 setImmediate 的区别

**答案：**

```javascript
// 在主模块中，顺序不确定
setTimeout(() => console.log('timeout'), 0);
setImmediate(() => console.log('immediate'));
// 可能输出 timeout -> immediate
// 也可能输出 immediate -> timeout

// 在 I/O 回调中，setImmediate 总是先执行
const fs = require('fs');

fs.readFile('file.txt', () => {
  setTimeout(() => console.log('timeout'), 0);
  setImmediate(() => console.log('immediate'));
});
// 总是输出：immediate -> timeout

// 原因：I/O 回调在 poll 阶段执行
// poll 之后是 check 阶段（setImmediate）
// 然后才是下一轮的 timers 阶段（setTimeout）
```

---

### 4. process.nextTick 和 Promise 的区别

**答案：**

```javascript
// process.nextTick 在当前操作完成后立即执行
// 优先级高于 Promise

Promise.resolve().then(() => console.log('promise 1'));
process.nextTick(() => console.log('nextTick 1'));
Promise.resolve().then(() => console.log('promise 2'));
process.nextTick(() => console.log('nextTick 2'));

// 输出：
// nextTick 1
// nextTick 2
// promise 1
// promise 2

// nextTick 队列会在每个阶段之间清空
// 递归调用 nextTick 可能阻塞事件循环
function recursiveNextTick() {
  process.nextTick(recursiveNextTick); // 危险！
}

// 建议使用 setImmediate 代替深度递归的 nextTick
function safeRecursion() {
  setImmediate(safeRecursion);
}
```

---

## 模块系统

### 5. CommonJS 和 ES Module 的区别

**答案：**

```javascript
// CommonJS (CJS)
// 1. 同步加载
const fs = require('fs');

// 2. 导出
module.exports = { name: 'module' };
exports.name = 'module';

// 3. 值的拷贝
// a.js
let count = 0;
module.exports = { count, increment: () => count++ };

// b.js
const a = require('./a');
console.log(a.count); // 0
a.increment();
console.log(a.count); // 0 (仍然是拷贝的值)

// ES Module (ESM)
// 1. 异步加载
import fs from 'fs';

// 2. 导出
export const name = 'module';
export default { name: 'module' };

// 3. 值的引用
// a.mjs
export let count = 0;
export const increment = () => count++;

// b.mjs
import { count, increment } from './a.mjs';
console.log(count); // 0
increment();
console.log(count); // 1 (引用同一个值)
```

**混合使用：**

```javascript
// ESM 中使用 CJS
import cjsModule from './cjs-module.cjs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pkg = require('./package.json');

// CJS 中使用 ESM
// 使用动态 import
async function loadESM() {
  const esmModule = await import('./esm-module.mjs');
  return esmModule;
}
```

**配置方式：**

```json
// package.json
{
  "type": "module",  // 默认使用 ESM
  // 或
  "type": "commonjs" // 默认使用 CJS
}

// 文件扩展名
// .mjs - 强制 ESM
// .cjs - 强制 CJS
```

---

### 6. require 的加载机制

**答案：**

```javascript
// 1. 缓存机制
// 模块第一次加载后会被缓存
const a1 = require('./a');
const a2 = require('./a');
console.log(a1 === a2); // true

// 查看缓存
console.log(require.cache);

// 清除缓存
delete require.cache[require.resolve('./a')];

// 2. 加载顺序
require('module-name');

// 查找顺序：
// 1) 核心模块（fs, path, http 等）
// 2) 文件模块
//    - 精确匹配
//    - 添加 .js, .json, .node 扩展名
//    - 作为目录，查找 package.json 的 main 字段
//    - 作为目录，查找 index.js, index.json, index.node
// 3) node_modules
//    - 当前目录的 node_modules
//    - 父目录的 node_modules
//    - 一直到根目录

// 3. 循环依赖
// a.js
console.log('a starting');
exports.done = false;
const b = require('./b');
console.log('in a, b.done =', b.done);
exports.done = true;
console.log('a done');

// b.js
console.log('b starting');
exports.done = false;
const a = require('./a');
console.log('in b, a.done =', a.done);
exports.done = true;
console.log('b done');

// main.js
const a = require('./a');
const b = require('./b');

// 输出：
// a starting
// b starting
// in b, a.done = false (a 还未执行完)
// b done
// in a, b.done = true
// a done
```

---

## 核心模块

### 7. Stream 流的类型和使用

**答案：**

```javascript
const fs = require('fs');
const { Transform, pipeline } = require('stream');
const zlib = require('zlib');

// 1. 四种流类型
// Readable - 可读流
// Writable - 可写流
// Duplex - 双工流（可读可写）
// Transform - 转换流（读写过程中可修改数据）

// 2. 可读流
const readable = fs.createReadStream('input.txt', {
  highWaterMark: 64 * 1024, // 64KB 缓冲区
  encoding: 'utf8'
});

readable.on('data', (chunk) => {
  console.log('Received:', chunk.length);
});

readable.on('end', () => {
  console.log('Read complete');
});

readable.on('error', (err) => {
  console.error('Error:', err);
});

// 暂停/恢复
readable.pause();
readable.resume();

// 3. 可写流
const writable = fs.createWriteStream('output.txt');

writable.write('Hello ');
writable.write('World');
writable.end('!');

writable.on('finish', () => {
  console.log('Write complete');
});

// 处理背压
function writeData(writer, data) {
  let i = 0;
  write();

  function write() {
    let ok = true;
    while (i < data.length && ok) {
      ok = writer.write(data[i]);
      i++;
    }
    if (i < data.length) {
      writer.once('drain', write);
    }
  }
}

// 4. 管道
const readStream = fs.createReadStream('input.txt');
const writeStream = fs.createWriteStream('output.txt');

readStream.pipe(writeStream);

// 链式管道
fs.createReadStream('input.txt')
  .pipe(zlib.createGzip())
  .pipe(fs.createWriteStream('output.txt.gz'));

// 5. pipeline（推荐，自动处理错误和清理）
pipeline(
  fs.createReadStream('input.txt'),
  zlib.createGzip(),
  fs.createWriteStream('output.txt.gz'),
  (err) => {
    if (err) {
      console.error('Pipeline failed:', err);
    } else {
      console.log('Pipeline succeeded');
    }
  }
);

// 6. 自定义 Transform 流
class UpperCaseTransform extends Transform {
  _transform(chunk, encoding, callback) {
    this.push(chunk.toString().toUpperCase());
    callback();
  }
}

const upperCase = new UpperCaseTransform();

process.stdin
  .pipe(upperCase)
  .pipe(process.stdout);
```

---

### 8. Buffer 的使用

**答案：**

```javascript
// 1. 创建 Buffer
// 分配指定大小（不安全，可能包含旧数据）
const buf1 = Buffer.allocUnsafe(10);

// 分配指定大小（安全，填充 0）
const buf2 = Buffer.alloc(10);

// 从数组创建
const buf3 = Buffer.from([1, 2, 3]);

// 从字符串创建
const buf4 = Buffer.from('Hello', 'utf8');

// 2. 读写操作
const buf = Buffer.alloc(4);

// 写入
buf.writeUInt8(0x48, 0);  // H
buf.writeUInt8(0x69, 1);  // i
buf.write('!!', 2);

console.log(buf.toString()); // Hi!!

// 读取
console.log(buf.readUInt8(0)); // 72 (0x48)
console.log(buf[0]); // 72

// 3. Buffer 操作
const buf5 = Buffer.from('Hello');
const buf6 = Buffer.from('World');

// 连接
const combined = Buffer.concat([buf5, Buffer.from(' '), buf6]);
console.log(combined.toString()); // Hello World

// 切片（共享内存）
const slice = buf5.slice(0, 2);
console.log(slice.toString()); // He

// 复制
const copy = Buffer.alloc(5);
buf5.copy(copy);
console.log(copy.toString()); // Hello

// 比较
console.log(buf5.compare(buf6)); // -1 (buf5 < buf6)
console.log(buf5.equals(Buffer.from('Hello'))); // true

// 4. 编码转换
const str = '你好';
const utf8Buf = Buffer.from(str, 'utf8');
console.log(utf8Buf); // <Buffer e4 bd a0 e5 a5 bd>
console.log(utf8Buf.toString('base64')); // 5L2g5aW9
console.log(utf8Buf.toString('hex')); // e4bda0e5a5bd

// Base64 解码
const base64Str = '5L2g5aW9';
const decoded = Buffer.from(base64Str, 'base64').toString('utf8');
console.log(decoded); // 你好

// 5. 与 TypedArray 的关系
const buf7 = Buffer.from([1, 2, 3, 4]);
const uint32 = new Uint32Array(buf7.buffer, buf7.byteOffset, buf7.length / 4);
console.log(uint32[0]); // 67305985 (小端序)
```

---

### 9. fs 文件系统操作

**答案：**

```javascript
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');

// 1. 同步 vs 异步
// 同步（阻塞）
const dataSync = fs.readFileSync('file.txt', 'utf8');

// 异步（回调）
fs.readFile('file.txt', 'utf8', (err, data) => {
  if (err) throw err;
  console.log(data);
});

// 异步（Promise）
async function readFile() {
  const data = await fsPromises.readFile('file.txt', 'utf8');
  return data;
}

// 2. 文件操作
// 读取
const content = await fsPromises.readFile('file.txt', 'utf8');

// 写入（覆盖）
await fsPromises.writeFile('file.txt', 'Hello World');

// 追加
await fsPromises.appendFile('file.txt', '\nNew line');

// 删除
await fsPromises.unlink('file.txt');

// 重命名/移动
await fsPromises.rename('old.txt', 'new.txt');

// 复制
await fsPromises.copyFile('src.txt', 'dest.txt');

// 3. 目录操作
// 创建目录
await fsPromises.mkdir('new-dir', { recursive: true });

// 读取目录
const files = await fsPromises.readdir('dir');
const filesWithTypes = await fsPromises.readdir('dir', { withFileTypes: true });

// 删除目录
await fsPromises.rmdir('dir'); // 空目录
await fsPromises.rm('dir', { recursive: true, force: true }); // 递归删除

// 4. 文件信息
const stats = await fsPromises.stat('file.txt');
console.log({
  isFile: stats.isFile(),
  isDirectory: stats.isDirectory(),
  size: stats.size,
  mtime: stats.mtime, // 修改时间
  ctime: stats.ctime  // 创建时间
});

// 检查文件是否存在
try {
  await fsPromises.access('file.txt', fs.constants.F_OK);
  console.log('文件存在');
} catch {
  console.log('文件不存在');
}

// 5. 文件监听
const watcher = fs.watch('dir', { recursive: true }, (eventType, filename) => {
  console.log(`${eventType}: ${filename}`);
});

// 停止监听
watcher.close();

// 6. 遍历目录
async function walkDir(dir) {
  const files = await fsPromises.readdir(dir, { withFileTypes: true });
  const results = [];

  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      results.push(...await walkDir(fullPath));
    } else {
      results.push(fullPath);
    }
  }

  return results;
}
```

---

### 10. path 模块常用方法

**答案：**

```javascript
const path = require('path');

// 1. 路径拼接
path.join('/foo', 'bar', 'baz/qux', '..');
// '/foo/bar/baz'

// 2. 解析为绝对路径
path.resolve('foo', 'bar');
// '/当前工作目录/foo/bar'

path.resolve('/foo', 'bar');
// '/foo/bar'

// 3. 获取路径各部分
const filePath = '/home/user/docs/file.txt';

path.dirname(filePath);   // '/home/user/docs'
path.basename(filePath);  // 'file.txt'
path.basename(filePath, '.txt'); // 'file'
path.extname(filePath);   // '.txt'

// 4. 解析路径
path.parse('/home/user/docs/file.txt');
// {
//   root: '/',
//   dir: '/home/user/docs',
//   base: 'file.txt',
//   ext: '.txt',
//   name: 'file'
// }

// 5. 格式化路径
path.format({
  dir: '/home/user/docs',
  name: 'file',
  ext: '.txt'
});
// '/home/user/docs/file.txt'

// 6. 判断绝对路径
path.isAbsolute('/foo/bar'); // true
path.isAbsolute('./foo');    // false

// 7. 相对路径
path.relative('/data/users', '/data/files/test.txt');
// '../files/test.txt'

// 8. 规范化路径
path.normalize('/foo/bar//baz/qux/..');
// '/foo/bar/baz'

// 9. 跨平台
path.sep;       // '/' (Unix) 或 '\\' (Windows)
path.delimiter; // ':' (Unix) 或 ';' (Windows)

// 使用 path.posix 或 path.win32 强制使用特定平台格式
path.posix.join('/foo', 'bar');  // '/foo/bar'
path.win32.join('/foo', 'bar');  // '\\foo\\bar'
```

---

## 网络编程

### 11. HTTP 服务器创建

**答案：**

```javascript
const http = require('http');
const https = require('https');
const fs = require('fs');
const url = require('url');

// 1. 基本 HTTP 服务器
const server = http.createServer((req, res) => {
  // 请求信息
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', req.headers);

  // 解析 URL
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  console.log('Pathname:', parsedUrl.pathname);
  console.log('Query:', parsedUrl.searchParams);

  // 获取请求体
  let body = '';
  req.on('data', chunk => {
    body += chunk;
  });

  req.on('end', () => {
    // 设置响应头
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;

    // 发送响应
    res.end(JSON.stringify({
      message: 'Hello World',
      body: body
    }));
  });
});

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});

// 2. 路由处理
const routes = {
  'GET /': (req, res) => {
    res.end('Home Page');
  },
  'GET /api/users': (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify([{ id: 1, name: 'John' }]));
  },
  'POST /api/users': async (req, res) => {
    const body = await getBody(req);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ created: JSON.parse(body) }));
  }
};

function getBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => resolve(body));
  });
}

const routeServer = http.createServer((req, res) => {
  const key = `${req.method} ${new URL(req.url, 'http://localhost').pathname}`;
  const handler = routes[key];

  if (handler) {
    handler(req, res);
  } else {
    res.statusCode = 404;
    res.end('Not Found');
  }
});

// 3. HTTPS 服务器
const httpsServer = https.createServer({
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert')
}, (req, res) => {
  res.end('Secure Hello');
});

// 4. 静态文件服务
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg'
};

const staticServer = http.createServer((req, res) => {
  const filePath = './public' + (req.url === '/' ? '/index.html' : req.url);
  const ext = path.extname(filePath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.statusCode = 404;
      res.end('Not Found');
      return;
    }

    res.setHeader('Content-Type', mimeTypes[ext] || 'text/plain');
    res.end(data);
  });
});
```

---

### 12. HTTP 客户端请求

**答案：**

```javascript
const http = require('http');
const https = require('https');

// 1. 基本请求
http.get('http://api.example.com/data', (res) => {
  let data = '';

  res.on('data', chunk => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(JSON.parse(data));
  });
}).on('error', (err) => {
  console.error('Error:', err);
});

// 2. POST 请求
const postData = JSON.stringify({ name: 'John' });

const options = {
  hostname: 'api.example.com',
  port: 443,
  path: '/users',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = https.request(options, (res) => {
  console.log('Status:', res.statusCode);

  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Response:', data));
});

req.on('error', (err) => {
  console.error('Error:', err);
});

req.write(postData);
req.end();

// 3. 封装为 Promise
function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const lib = parsedUrl.protocol === 'https:' ? https : http;

    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = lib.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}

// 使用
const response = await request('https://api.example.com/data', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'John' })
});

// 4. 使用 fetch（Node.js 18+）
const res = await fetch('https://api.example.com/data', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'John' })
});

const data = await res.json();
```

---

## 进程与线程

### 13. 子进程（child_process）

**答案：**

```javascript
const { spawn, exec, execFile, fork } = require('child_process');

// 1. spawn - 流式输出，适合大量数据
const ls = spawn('ls', ['-la', '/home']);

ls.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

ls.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
});

ls.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});

// 2. exec - 缓冲输出，适合小量数据
exec('ls -la', (error, stdout, stderr) => {
  if (error) {
    console.error(`exec error: ${error}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
  console.error(`stderr: ${stderr}`);
});

// Promise 版本
const { promisify } = require('util');
const execPromise = promisify(exec);

async function runCommand() {
  const { stdout, stderr } = await execPromise('ls -la');
  console.log(stdout);
}

// 3. execFile - 直接执行文件，更安全
execFile('node', ['--version'], (error, stdout) => {
  console.log(`Node version: ${stdout}`);
});

// 4. fork - 专门用于创建 Node.js 子进程
// parent.js
const child = fork('child.js');

child.on('message', (msg) => {
  console.log('Message from child:', msg);
});

child.send({ hello: 'world' });

// child.js
process.on('message', (msg) => {
  console.log('Message from parent:', msg);
  process.send({ foo: 'bar' });
});

// 5. 进程间通信
// 使用 stdio 选项
const child2 = spawn('cat', [], {
  stdio: ['pipe', 'pipe', 'pipe']
});

child2.stdin.write('Hello from parent\n');
child2.stdin.end();

child2.stdout.on('data', (data) => {
  console.log(`Received: ${data}`);
});

// 6. 配置选项
const options = {
  cwd: '/home/user',           // 工作目录
  env: { ...process.env, FOO: 'bar' }, // 环境变量
  timeout: 5000,               // 超时时间
  maxBuffer: 1024 * 1024,      // 最大缓冲区
  shell: true,                 // 使用 shell
  detached: true               // 独立进程
};

// 7. 分离子进程
const detached = spawn('long-running-process', [], {
  detached: true,
  stdio: 'ignore'
});

detached.unref(); // 允许父进程退出
```

---

### 14. Worker Threads（工作线程）

**答案：**

```javascript
const {
  Worker,
  isMainThread,
  parentPort,
  workerData,
  threadId
} = require('worker_threads');

// 1. 基本用法
if (isMainThread) {
  // 主线程
  const worker = new Worker(__filename, {
    workerData: { num: 42 }
  });

  worker.on('message', (msg) => {
    console.log('From worker:', msg);
  });

  worker.on('error', (err) => {
    console.error('Worker error:', err);
  });

  worker.on('exit', (code) => {
    console.log(`Worker stopped with exit code ${code}`);
  });

  worker.postMessage('Hello Worker');
} else {
  // 工作线程
  console.log('Worker started with data:', workerData);
  console.log('Thread ID:', threadId);

  parentPort.on('message', (msg) => {
    console.log('From main:', msg);
    parentPort.postMessage('Hello Main');
  });
}

// 2. 独立文件方式
// main.js
const worker = new Worker('./worker.js', {
  workerData: { task: 'compute' }
});

worker.on('message', console.log);

// worker.js
const { parentPort, workerData } = require('worker_threads');

function heavyComputation(data) {
  // CPU 密集型计算
  let result = 0;
  for (let i = 0; i < 1e9; i++) {
    result += i;
  }
  return result;
}

const result = heavyComputation(workerData);
parentPort.postMessage(result);

// 3. 共享内存
const { Worker } = require('worker_threads');

// 创建共享内存
const sharedBuffer = new SharedArrayBuffer(4);
const sharedArray = new Int32Array(sharedBuffer);

const worker = new Worker(`
  const { parentPort, workerData } = require('worker_threads');
  const sharedArray = new Int32Array(workerData.sharedBuffer);

  // 原子操作
  Atomics.add(sharedArray, 0, 1);
  Atomics.notify(sharedArray, 0);

  parentPort.postMessage('done');
`, {
  eval: true,
  workerData: { sharedBuffer }
});

worker.on('message', () => {
  console.log('Shared value:', sharedArray[0]);
});

// 4. 线程池
const { Worker } = require('worker_threads');
const os = require('os');

class WorkerPool {
  constructor(workerScript, numWorkers = os.cpus().length) {
    this.workers = [];
    this.freeWorkers = [];
    this.taskQueue = [];

    for (let i = 0; i < numWorkers; i++) {
      const worker = new Worker(workerScript);
      worker.on('message', (result) => {
        const callback = worker.currentCallback;
        worker.currentCallback = null;
        this.freeWorkers.push(worker);
        this.runNext();
        callback(null, result);
      });
      this.workers.push(worker);
      this.freeWorkers.push(worker);
    }
  }

  runTask(data, callback) {
    if (this.freeWorkers.length > 0) {
      const worker = this.freeWorkers.pop();
      worker.currentCallback = callback;
      worker.postMessage(data);
    } else {
      this.taskQueue.push({ data, callback });
    }
  }

  runNext() {
    if (this.taskQueue.length > 0 && this.freeWorkers.length > 0) {
      const { data, callback } = this.taskQueue.shift();
      this.runTask(data, callback);
    }
  }

  destroy() {
    for (const worker of this.workers) {
      worker.terminate();
    }
  }
}
```

---

### 15. cluster 集群模块

**答案：**

```javascript
const cluster = require('cluster');
const http = require('http');
const os = require('os');

const numCPUs = os.cpus().length;

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // 创建工作进程
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // 监听工作进程事件
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    // 重新启动工作进程
    cluster.fork();
  });

  cluster.on('online', (worker) => {
    console.log(`Worker ${worker.process.pid} is online`);
  });

  // 向工作进程发送消息
  for (const id in cluster.workers) {
    cluster.workers[id].send({ type: 'config', data: {} });
  }

} else {
  // 工作进程
  http.createServer((req, res) => {
    res.writeHead(200);
    res.end(`Hello from Worker ${process.pid}\n`);
  }).listen(8000);

  console.log(`Worker ${process.pid} started`);

  // 接收主进程消息
  process.on('message', (msg) => {
    console.log('Worker received:', msg);
  });
}

// 优雅退出
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });

  // 强制退出
  setTimeout(() => {
    console.error('Forcing shutdown');
    process.exit(1);
  }, 10000);
});
```

---

## 错误处理与调试

### 16. 错误处理最佳实践

**答案：**

```javascript
// 1. 同步代码错误处理
try {
  const data = JSON.parse(invalidJson);
} catch (error) {
  console.error('Parse error:', error.message);
}

// 2. 异步回调错误处理
fs.readFile('file.txt', (err, data) => {
  if (err) {
    console.error('Read error:', err);
    return;
  }
  // 处理数据
});

// 3. Promise 错误处理
someAsyncOperation()
  .then(result => {
    // 处理结果
  })
  .catch(error => {
    console.error('Async error:', error);
  });

// 4. async/await 错误处理
async function handleRequest() {
  try {
    const result = await someAsyncOperation();
    return result;
  } catch (error) {
    console.error('Error:', error);
    throw error; // 或返回默认值
  }
}

// 5. 自定义错误类
class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

class ValidationError extends AppError {
  constructor(message, details) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }
}

// 6. 全局错误处理
// 未捕获的异常
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // 记录错误后退出
  process.exit(1);
});

// 未处理的 Promise 拒绝
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// 7. Express 错误处理中间件
app.use((err, req, res, next) => {
  console.error('Error:', err);

  if (err.isOperational) {
    res.status(err.statusCode).json({
      code: err.code,
      message: err.message,
      details: err.details
    });
  } else {
    // 程序错误，不暴露详情
    res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: 'Internal server error'
    });
  }
});

// 8. 错误包装
async function withErrorHandling(fn) {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Operation failed', 500, 'INTERNAL_ERROR');
  }
}
```

---

### 17. 调试技巧

**答案：**

```javascript
// 1. console 调试
console.log('Simple log');
console.error('Error log');
console.warn('Warning');
console.table([{ a: 1, b: 2 }, { a: 3, b: 4 }]);
console.time('operation');
// ... 操作
console.timeEnd('operation');

console.trace('Trace'); // 打印调用栈
console.dir(obj, { depth: null }); // 深度打印对象

// 2. debugger 语句
function problematicFunction() {
  const data = getData();
  debugger; // 在此处暂停
  return process(data);
}

// 3. Node.js 内置调试器
// node inspect app.js
// 或
// node --inspect app.js (Chrome DevTools)
// node --inspect-brk app.js (启动时暂停)

// 4. 使用 debug 模块
const debug = require('debug');
const log = debug('app:server');
const dbLog = debug('app:db');

log('Server starting...'); // DEBUG=app:server node app.js
dbLog('Connected to database'); // DEBUG=app:* node app.js

// 5. 性能分析
const { performance, PerformanceObserver } = require('perf_hooks');

const obs = new PerformanceObserver((items) => {
  console.log(items.getEntries());
});
obs.observe({ entryTypes: ['measure'] });

performance.mark('start');
// ... 操作
performance.mark('end');
performance.measure('My Operation', 'start', 'end');

// 6. 内存分析
console.log(process.memoryUsage());
// {
//   rss: 30932992,      // 常驻内存
//   heapTotal: 6537216, // V8 堆总大小
//   heapUsed: 4225664,  // V8 堆使用量
//   external: 8272      // 外部内存
// }

// 生成堆快照
const v8 = require('v8');
const fs = require('fs');

const snapshotFile = `heap-${Date.now()}.heapsnapshot`;
const snapshot = v8.writeHeapSnapshot(snapshotFile);
console.log(`Heap snapshot written to ${snapshot}`);

// 7. CPU 分析
// node --prof app.js
// node --prof-process isolate-*.log > processed.txt

// 8. 使用 clinic.js
// npx clinic doctor -- node app.js
// npx clinic flame -- node app.js
// npx clinic bubbleprof -- node app.js
```

---

## 常见框架

### 18. Express 基础

**答案：**

```javascript
const express = require('express');
const app = express();

// 1. 中间件
// 内置中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// 自定义中间件
const logger = (req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
};
app.use(logger);

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// 2. 路由
// 基本路由
app.get('/', (req, res) => {
  res.send('Hello World');
});

app.post('/users', (req, res) => {
  res.json({ user: req.body });
});

// 路由参数
app.get('/users/:id', (req, res) => {
  res.json({ id: req.params.id });
});

// 查询参数
app.get('/search', (req, res) => {
  res.json({ query: req.query });
});

// 路由模块化
const userRouter = express.Router();

userRouter.get('/', (req, res) => {
  res.json({ users: [] });
});

userRouter.get('/:id', (req, res) => {
  res.json({ id: req.params.id });
});

userRouter.post('/', (req, res) => {
  res.status(201).json({ user: req.body });
});

app.use('/api/users', userRouter);

// 3. 请求处理
app.post('/upload', (req, res) => {
  // 请求体
  console.log(req.body);

  // 请求头
  console.log(req.headers);
  console.log(req.get('Content-Type'));

  // Cookies (需要 cookie-parser)
  console.log(req.cookies);

  res.json({ success: true });
});

// 4. 响应方法
app.get('/response-demo', (req, res) => {
  // 发送文本
  res.send('Hello');

  // 发送 JSON
  res.json({ message: 'Hello' });

  // 设置状态码
  res.status(201).json({ created: true });

  // 重定向
  res.redirect('/new-url');

  // 发送文件
  res.sendFile('/path/to/file.pdf');

  // 下载文件
  res.download('/path/to/file.pdf', 'custom-name.pdf');

  // 设置响应头
  res.set('X-Custom-Header', 'value');
});

// 5. 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

### 19. Koa 基础

**答案：**

```javascript
const Koa = require('koa');
const Router = require('@koa/router');
const bodyParser = require('koa-bodyparser');

const app = new Koa();
const router = new Router();

// 1. 中间件（洋葱模型）
app.use(async (ctx, next) => {
  console.log('1. Before');
  await next();
  console.log('5. After');
});

app.use(async (ctx, next) => {
  console.log('2. Before');
  await next();
  console.log('4. After');
});

app.use(async (ctx, next) => {
  console.log('3. Handle');
});

// 输出顺序：1, 2, 3, 4, 5

// 2. 常用中间件
app.use(bodyParser());

// 自定义中间件
const logger = async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
};
app.use(logger);

// 3. 错误处理
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = {
      message: err.message,
      code: err.code
    };
    ctx.app.emit('error', err, ctx);
  }
});

app.on('error', (err, ctx) => {
  console.error('Server error:', err);
});

// 4. 路由
router.get('/', (ctx) => {
  ctx.body = 'Hello World';
});

router.get('/users/:id', (ctx) => {
  ctx.body = { id: ctx.params.id };
});

router.post('/users', (ctx) => {
  ctx.status = 201;
  ctx.body = { user: ctx.request.body };
});

// 路由前缀
const apiRouter = new Router({ prefix: '/api' });
apiRouter.get('/users', (ctx) => {
  ctx.body = { users: [] };
});

app.use(router.routes());
app.use(router.allowedMethods());
app.use(apiRouter.routes());

// 5. Context (ctx)
router.get('/demo', (ctx) => {
  // 请求
  console.log(ctx.request.method);
  console.log(ctx.request.url);
  console.log(ctx.request.query);
  console.log(ctx.request.body);
  console.log(ctx.request.headers);

  // 简写
  console.log(ctx.method);
  console.log(ctx.url);
  console.log(ctx.query);
  console.log(ctx.headers);

  // 响应
  ctx.status = 200;
  ctx.set('X-Custom-Header', 'value');
  ctx.body = { message: 'Hello' };
});

// 6. 启动
app.listen(3000, () => {
  console.log('Koa server running on port 3000');
});
```

---

## 数据库操作

### 20. MongoDB/Mongoose 使用

**答案：**

```javascript
const mongoose = require('mongoose');

// 1. 连接数据库
mongoose.connect('mongodb://localhost:27017/mydb', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', () => console.log('Connected to MongoDB'));

// 2. 定义 Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email']
  },
  age: {
    type: Number,
    min: 0,
    max: 150
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }]
});

// 虚拟属性
userSchema.virtual('info').get(function() {
  return `${this.name} (${this.email})`;
});

// 实例方法
userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// 静态方法
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email });
};

// 中间件
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

const User = mongoose.model('User', userSchema);

// 3. CRUD 操作
// 创建
const user = new User({ name: 'John', email: 'john@example.com' });
await user.save();

// 或
const user2 = await User.create({ name: 'Jane', email: 'jane@example.com' });

// 查询
const users = await User.find({ role: 'user' });
const oneUser = await User.findOne({ email: 'john@example.com' });
const userById = await User.findById('60a7c...');

// 条件查询
const results = await User.find()
  .where('age').gte(18).lte(65)
  .where('role').equals('user')
  .select('name email')
  .sort({ createdAt: -1 })
  .limit(10)
  .skip(0)
  .populate('posts')
  .lean(); // 返回普通对象

// 更新
await User.findByIdAndUpdate(id, { name: 'New Name' }, { new: true });
await User.updateMany({ role: 'user' }, { $set: { active: true } });

// 删除
await User.findByIdAndDelete(id);
await User.deleteMany({ createdAt: { $lt: new Date('2020-01-01') } });

// 4. 聚合
const stats = await User.aggregate([
  { $match: { role: 'user' } },
  { $group: {
    _id: '$role',
    count: { $sum: 1 },
    avgAge: { $avg: '$age' }
  }},
  { $sort: { count: -1 } }
]);

// 5. 事务
const session = await mongoose.startSession();
session.startTransaction();

try {
  await User.create([{ name: 'User1' }], { session });
  await Post.create([{ title: 'Post1' }], { session });
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

---

### 21. MySQL/Sequelize 使用

**答案：**

```javascript
const { Sequelize, DataTypes, Op } = require('sequelize');

// 1. 连接数据库
const sequelize = new Sequelize('database', 'username', 'password', {
  host: 'localhost',
  dialect: 'mysql',
  pool: {
    max: 10,
    min: 0,
    idle: 10000
  },
  logging: console.log
});

// 测试连接
await sequelize.authenticate();

// 2. 定义模型
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      len: [2, 50]
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  age: {
    type: DataTypes.INTEGER,
    validate: {
      min: 0,
      max: 150
    }
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user'
  }
}, {
  tableName: 'users',
  timestamps: true,
  paranoid: true, // 软删除
  indexes: [
    { fields: ['email'] }
  ]
});

const Post = sequelize.define('Post', {
  title: DataTypes.STRING,
  content: DataTypes.TEXT
});

// 3. 关联关系
User.hasMany(Post, { foreignKey: 'userId', as: 'posts' });
Post.belongsTo(User, { foreignKey: 'userId', as: 'author' });

// 多对多
const Tag = sequelize.define('Tag', { name: DataTypes.STRING });
Post.belongsToMany(Tag, { through: 'PostTags' });
Tag.belongsToMany(Post, { through: 'PostTags' });

// 同步模型
await sequelize.sync({ alter: true });

// 4. CRUD 操作
// 创建
const user = await User.create({ name: 'John', email: 'john@example.com' });

// 批量创建
await User.bulkCreate([
  { name: 'Jane', email: 'jane@example.com' },
  { name: 'Bob', email: 'bob@example.com' }
]);

// 查询
const users = await User.findAll({
  where: {
    role: 'user',
    age: { [Op.gte]: 18 }
  },
  attributes: ['id', 'name', 'email'],
  include: [{
    model: Post,
    as: 'posts',
    attributes: ['id', 'title']
  }],
  order: [['createdAt', 'DESC']],
  limit: 10,
  offset: 0
});

const oneUser = await User.findOne({ where: { email: 'john@example.com' } });
const userById = await User.findByPk(1);
const { count, rows } = await User.findAndCountAll({ where: {} });

// 更新
await User.update({ name: 'New Name' }, { where: { id: 1 } });
user.name = 'Updated Name';
await user.save();

// 删除
await User.destroy({ where: { id: 1 } });
await user.destroy();

// 5. 事务
const t = await sequelize.transaction();

try {
  const user = await User.create({ name: 'John' }, { transaction: t });
  await Post.create({ title: 'Post', userId: user.id }, { transaction: t });
  await t.commit();
} catch (error) {
  await t.rollback();
  throw error;
}

// 6. 原始查询
const [results] = await sequelize.query(
  'SELECT * FROM users WHERE age > :age',
  {
    replacements: { age: 18 },
    type: Sequelize.QueryTypes.SELECT
  }
);
```

---

## 测试

### 22. 单元测试（Jest）

**答案：**

```javascript
// 1. 基本测试
// sum.js
function sum(a, b) {
  return a + b;
}
module.exports = sum;

// sum.test.js
const sum = require('./sum');

describe('sum function', () => {
  test('adds 1 + 2 to equal 3', () => {
    expect(sum(1, 2)).toBe(3);
  });

  test('adds negative numbers', () => {
    expect(sum(-1, -2)).toBe(-3);
  });
});

// 2. 常用断言
expect(value).toBe(expected);           // 严格相等
expect(value).toEqual(expected);        // 深度相等
expect(value).toBeTruthy();             // 真值
expect(value).toBeFalsy();              // 假值
expect(value).toBeNull();               // null
expect(value).toBeUndefined();          // undefined
expect(value).toBeDefined();            // 已定义
expect(value).toBeGreaterThan(number);  // 大于
expect(value).toBeLessThan(number);     // 小于
expect(value).toContain(item);          // 包含
expect(value).toMatch(/regex/);         // 正则匹配
expect(fn).toThrow(error);              // 抛出错误

// 3. 异步测试
// 回调
test('async callback', (done) => {
  fetchData((data) => {
    expect(data).toBe('data');
    done();
  });
});

// Promise
test('async promise', () => {
  return fetchData().then(data => {
    expect(data).toBe('data');
  });
});

// async/await
test('async/await', async () => {
  const data = await fetchData();
  expect(data).toBe('data');
});

// 4. Mock 函数
const mockFn = jest.fn();

mockFn('arg1', 'arg2');

expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
expect(mockFn).toHaveBeenCalledTimes(1);

// Mock 返回值
mockFn.mockReturnValue('default');
mockFn.mockReturnValueOnce('first');
mockFn.mockResolvedValue('async result');

// 5. Mock 模块
jest.mock('./api');

const api = require('./api');
api.fetchUser.mockResolvedValue({ name: 'John' });

test('fetch user', async () => {
  const user = await api.fetchUser(1);
  expect(user.name).toBe('John');
});

// 6. 生命周期
beforeAll(() => {
  // 所有测试前执行一次
});

afterAll(() => {
  // 所有测试后执行一次
});

beforeEach(() => {
  // 每个测试前执行
});

afterEach(() => {
  // 每个测试后执行
});

// 7. HTTP 测试（supertest）
const request = require('supertest');
const app = require('./app');

describe('GET /users', () => {
  test('responds with json', async () => {
    const response = await request(app)
      .get('/users')
      .set('Authorization', 'Bearer token')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveLength(2);
  });
});

// 8. 覆盖率
// package.json
{
  "scripts": {
    "test": "jest",
    "test:coverage": "jest --coverage"
  }
}
```

---

## 部署与运维

### 23. PM2 进程管理

**答案：**

```bash
# 1. 安装
npm install pm2 -g

# 2. 基本命令
pm2 start app.js                    # 启动应用
pm2 start app.js --name "my-app"    # 指定名称
pm2 start app.js -i max             # 集群模式，最大进程数
pm2 start app.js -i 4               # 指定 4 个进程

pm2 list                            # 查看进程列表
pm2 show <id|name>                  # 查看详情
pm2 logs                            # 查看日志
pm2 logs --lines 100                # 查看最后 100 行

pm2 restart <id|name>               # 重启
pm2 reload <id|name>                # 平滑重启
pm2 stop <id|name>                  # 停止
pm2 delete <id|name>                # 删除

pm2 monit                           # 监控面板

# 3. 配置文件 ecosystem.config.js
module.exports = {
  apps: [{
    name: 'my-app',
    script: './app.js',
    instances: 'max',
    exec_mode: 'cluster',
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    },
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    merge_logs: true,
    // 自动重启配置
    autorestart: true,
    restart_delay: 4000,
    max_restarts: 10,
    // 优雅退出
    kill_timeout: 5000,
    listen_timeout: 3000
  }]
};

# 使用配置文件
pm2 start ecosystem.config.js --env production

# 4. 开机自启
pm2 startup
pm2 save

# 5. 部署
# ecosystem.config.js
module.exports = {
  deploy: {
    production: {
      user: 'deploy',
      host: ['192.168.1.1'],
      ref: 'origin/main',
      repo: 'git@github.com:user/repo.git',
      path: '/var/www/app',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production'
    }
  }
};

# 部署命令
pm2 deploy production setup
pm2 deploy production
```

---

### 24. Docker 部署 Node.js

**答案：**

```dockerfile
# Dockerfile
# 多阶段构建

# 构建阶段
FROM node:18-alpine AS builder

WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制源码
COPY . .

# 构建
RUN npm run build

# 生产阶段
FROM node:18-alpine

WORKDIR /app

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# 从构建阶段复制文件
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

# 切换用户
USER nodejs

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# 启动命令
CMD ["node", "dist/index.js"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=db
      - REDIS_HOST=redis
    depends_on:
      - db
      - redis
    restart: unless-stopped
    networks:
      - app-network
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '0.5'
          memory: 512M

  db:
    image: postgres:14-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: mydb
    volumes:
      - db-data:/var/lib/postgresql/data
    networks:
      - app-network

  redis:
    image: redis:7-alpine
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - app
    networks:
      - app-network

volumes:
  db-data:

networks:
  app-network:
    driver: bridge
```

```javascript
// .dockerignore
node_modules
npm-debug.log
Dockerfile
.dockerignore
.git
.gitignore
README.md
.env
coverage
.nyc_output
```

---

### 25. 日志管理

**答案：**

```javascript
// 使用 winston
const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

// 1. 创建 logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'my-service' },
  transports: [
    // 错误日志
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '14d'
    }),
    // 所有日志
    new DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d'
    })
  ]
});

// 开发环境添加控制台输出
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// 2. 使用 logger
logger.info('Server started', { port: 3000 });
logger.warn('Memory usage high', { usage: '85%' });
logger.error('Database connection failed', { error: err.message });

// 3. 请求日志中间件
const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('HTTP Request', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
  });

  next();
};

// 4. 错误日志
const errorLogger = (err, req, res, next) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    body: req.body
  });
  next(err);
};

// 5. 异步上下文追踪
const { AsyncLocalStorage } = require('async_hooks');
const asyncLocalStorage = new AsyncLocalStorage();

const traceMiddleware = (req, res, next) => {
  const traceId = req.headers['x-trace-id'] || generateId();
  asyncLocalStorage.run({ traceId }, () => {
    next();
  });
};

// 在 logger 中使用
const contextLogger = {
  info: (message, meta = {}) => {
    const store = asyncLocalStorage.getStore();
    logger.info(message, { ...meta, traceId: store?.traceId });
  }
};
```

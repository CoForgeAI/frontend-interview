# 网络协议面试题

## HTTP 基础

### 1. HTTP 常见状态码

**答案：**

**1xx 信息性状态码：**
- `100 Continue`：继续请求
- `101 Switching Protocols`：切换协议（如升级到 WebSocket）

**2xx 成功状态码：**
- `200 OK`：请求成功
- `201 Created`：创建成功（POST/PUT）
- `204 No Content`：成功但无响应体
- `206 Partial Content`：部分内容（断点续传）

**3xx 重定向状态码：**
- `301 Moved Permanently`：永久重定向（会缓存）
- `302 Found`：临时重定向
- `303 See Other`：重定向到 GET 请求
- `304 Not Modified`：资源未修改（协商缓存）
- `307 Temporary Redirect`：临时重定向（保持方法）
- `308 Permanent Redirect`：永久重定向（保持方法）

**4xx 客户端错误：**
- `400 Bad Request`：请求语法错误
- `401 Unauthorized`：需要身份认证
- `403 Forbidden`：拒绝访问
- `404 Not Found`：资源不存在
- `405 Method Not Allowed`：方法不允许
- `408 Request Timeout`：请求超时
- `413 Payload Too Large`：请求体过大
- `414 URI Too Long`：URI 过长
- `429 Too Many Requests`：请求过多（限流）

**5xx 服务器错误：**
- `500 Internal Server Error`：服务器内部错误
- `502 Bad Gateway`：网关错误
- `503 Service Unavailable`：服务不可用
- `504 Gateway Timeout`：网关超时

---

### 2. HTTP 请求方法

**答案：**

| 方法 | 描述 | 幂等性 | 安全性 | 有请求体 |
|------|------|--------|--------|----------|
| GET | 获取资源 | 是 | 是 | 否 |
| POST | 创建资源 | 否 | 否 | 是 |
| PUT | 替换资源 | 是 | 否 | 是 |
| PATCH | 部分更新 | 否 | 否 | 是 |
| DELETE | 删除资源 | 是 | 否 | 可选 |
| HEAD | 获取头部 | 是 | 是 | 否 |
| OPTIONS | 获取支持的方法 | 是 | 是 | 否 |

**幂等性**：多次请求结果相同
**安全性**：不会修改服务器状态

**GET vs POST：**
| 特性 | GET | POST |
|------|-----|------|
| 参数位置 | URL | 请求体 |
| 参数长度 | 受 URL 长度限制 | 无限制 |
| 缓存 | 可被缓存 | 默认不缓存 |
| 书签 | 可以收藏 | 不能收藏 |
| 历史记录 | 参数保留在历史 | 参数不保留 |
| 幂等性 | 是 | 否 |

---

### 3. HTTP 常见请求头和响应头

**答案：**

**请求头：**
```http
# 通用
Host: www.example.com
User-Agent: Mozilla/5.0 ...
Accept: text/html,application/json
Accept-Language: zh-CN,zh;q=0.9
Accept-Encoding: gzip, deflate, br
Connection: keep-alive

# 认证
Authorization: Bearer token123
Cookie: session=abc123

# 缓存
If-Modified-Since: Wed, 21 Oct 2024 07:28:00 GMT
If-None-Match: "etag123"
Cache-Control: max-age=0

# 内容
Content-Type: application/json
Content-Length: 1234

# 跨域
Origin: https://example.com

# 范围请求
Range: bytes=0-1023
```

**响应头：**
```http
# 通用
Date: Wed, 21 Oct 2024 07:28:00 GMT
Server: nginx/1.18.0

# 缓存
Cache-Control: max-age=3600
Expires: Thu, 22 Oct 2024 07:28:00 GMT
ETag: "etag123"
Last-Modified: Wed, 21 Oct 2024 07:28:00 GMT

# 内容
Content-Type: text/html; charset=utf-8
Content-Length: 1234
Content-Encoding: gzip

# 跨域
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST
Access-Control-Allow-Headers: Content-Type

# 安全
Strict-Transport-Security: max-age=31536000
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Security-Policy: default-src 'self'

# Cookie
Set-Cookie: session=abc123; Path=/; HttpOnly; Secure; SameSite=Strict
```

---

### 4. HTTP/1.1、HTTP/2、HTTP/3 的区别

**答案：**

**HTTP/1.1：**
```
特点：
- 持久连接（Keep-Alive）
- 管道化（Pipelining，但有队头阻塞问题）
- 分块传输（Chunked）
- 缓存控制（Cache-Control）

缺点：
- 队头阻塞（Head-of-Line Blocking）
- 头部未压缩，冗余大
- 每个请求需要一个 TCP 连接（或复用但串行）
```

**HTTP/2：**
```
特点：
- 二进制分帧
- 多路复用（一个 TCP 连接多个请求）
- 头部压缩（HPACK）
- 服务器推送
- 请求优先级

优势：
- 减少延迟
- 减少 TCP 连接数
- 减少头部大小

缺点：
- TCP 层队头阻塞（丢包影响所有流）
```

**HTTP/3：**
```
特点：
- 基于 QUIC（UDP）
- 解决 TCP 队头阻塞
- 0-RTT 连接建立
- 连接迁移（网络切换不断开）
- 改进的拥塞控制

优势：
- 更低延迟
- 更好的移动体验
- 更快的连接建立
```

```
HTTP/1.1:
请求1 ────────> 响应1 ────────> 请求2 ────────> 响应2
              (串行，队头阻塞)

HTTP/2:
请求1 ──┐
请求2 ──┼──> 复用同一 TCP 连接 ──> 响应（可能乱序）
请求3 ──┘

HTTP/3:
        QUIC 连接（基于 UDP）
请求1 ──────> 流1 ──────> 响应1
请求2 ──────> 流2 ──────> 响应2  (独立，丢包不影响其他流)
请求3 ──────> 流3 ──────> 响应3
```

---

### 5. HTTPS 原理

**答案：**

**HTTPS = HTTP + TLS/SSL**

**TLS 握手过程：**
```
客户端                                      服务器
   │                                          │
   │──── Client Hello ────────────────────────>│
   │     (支持的加密套件、随机数 Client Random)  │
   │                                          │
   │<──── Server Hello ────────────────────────│
   │      (选择的加密套件、随机数 Server Random) │
   │                                          │
   │<──── Certificate ─────────────────────────│
   │      (服务器证书)                          │
   │                                          │
   │<──── Server Key Exchange ─────────────────│
   │      (可选，DH 参数)                       │
   │                                          │
   │<──── Server Hello Done ───────────────────│
   │                                          │
   │───── Client Key Exchange ─────────────────>│
   │      (预主密钥，用服务器公钥加密)           │
   │                                          │
   │      [双方计算主密钥和会话密钥]             │
   │                                          │
   │───── Change Cipher Spec ─────────────────>│
   │───── Finished (加密) ────────────────────>│
   │                                          │
   │<──── Change Cipher Spec ──────────────────│
   │<──── Finished (加密) ─────────────────────│
   │                                          │
   │      ═══════ 加密通信开始 ═══════         │
```

**证书验证：**
```
1. 检查证书是否过期
2. 检查证书颁发机构（CA）是否受信任
3. 检查证书是否被吊销
4. 检查域名是否匹配
5. 使用 CA 公钥验证证书签名
```

**加密方式：**
- **非对称加密**：RSA/ECDHE，用于密钥交换
- **对称加密**：AES，用于数据加密
- **摘要算法**：SHA-256，用于完整性验证

---

## TCP/UDP

### 6. TCP 三次握手和四次挥手

**答案：**

**三次握手：**
```
客户端                              服务器
  │                                   │
  │   SYN=1, seq=x                   │
  │─────────────────────────────────>│ 第一次握手
  │   (客户端发送连接请求)             │
  │                                   │
  │   SYN=1, ACK=1                    │
  │   seq=y, ack=x+1                  │
  │<─────────────────────────────────│ 第二次握手
  │   (服务器确认并发送连接请求)        │
  │                                   │
  │   ACK=1, seq=x+1, ack=y+1        │
  │─────────────────────────────────>│ 第三次握手
  │   (客户端确认)                     │
  │                                   │
  │   ════════ 连接建立 ════════      │
```

**为什么是三次：**
- 确保双方都有发送和接收能力
- 防止历史连接的混乱

**四次挥手：**
```
客户端                              服务器
  │                                   │
  │   FIN=1, seq=u                   │
  │─────────────────────────────────>│ 第一次挥手
  │   (客户端请求关闭)                 │
  │                                   │
  │   ACK=1, seq=v, ack=u+1          │
  │<─────────────────────────────────│ 第二次挥手
  │   (服务器确认)                     │
  │                                   │
  │   [服务器可能还有数据要发送]        │
  │                                   │
  │   FIN=1, ACK=1, seq=w, ack=u+1  │
  │<─────────────────────────────────│ 第三次挥手
  │   (服务器请求关闭)                 │
  │                                   │
  │   ACK=1, seq=u+1, ack=w+1       │
  │─────────────────────────────────>│ 第四次挥手
  │   (客户端确认)                     │
  │                                   │
  │   [客户端等待 2MSL]                │
  │                                   │
  │   ════════ 连接关闭 ════════      │
```

**为什么是四次：**
- TCP 是全双工，每个方向需要单独关闭
- 服务器可能还有数据要发送

---

### 7. TCP 和 UDP 的区别

**答案：**

| 特性 | TCP | UDP |
|------|-----|-----|
| 连接 | 面向连接 | 无连接 |
| 可靠性 | 可靠（确认、重传） | 不可靠 |
| 顺序 | 保证顺序 | 不保证 |
| 流量控制 | 有 | 无 |
| 拥塞控制 | 有 | 无 |
| 首部大小 | 20-60 字节 | 8 字节 |
| 传输效率 | 较低 | 较高 |
| 应用场景 | HTTP、FTP、邮件 | DNS、视频、游戏 |

**TCP 特性：**
```
- 三次握手建立连接
- 序号和确认号保证顺序
- 超时重传保证可靠
- 滑动窗口流量控制
- 拥塞控制（慢启动、拥塞避免等）
```

**UDP 特性：**
```
- 无连接，直接发送
- 支持广播和多播
- 首部开销小
- 适合实时应用
```

---

## WebSocket

### 8. WebSocket 原理和使用

**答案：**

**握手过程：**
```http
# 客户端请求
GET /chat HTTP/1.1
Host: server.example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13

# 服务器响应
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
```

**使用：**
```javascript
// 创建连接
const ws = new WebSocket('wss://server.example.com/chat');

// 连接打开
ws.onopen = () => {
  console.log('Connected');
  ws.send('Hello Server');
};

// 接收消息
ws.onmessage = (event) => {
  console.log('Received:', event.data);
};

// 连接关闭
ws.onclose = (event) => {
  console.log('Closed:', event.code, event.reason);
};

// 错误处理
ws.onerror = (error) => {
  console.error('Error:', error);
};

// 发送消息
ws.send('Text message');
ws.send(new Blob(['binary']));
ws.send(new ArrayBuffer(8));

// 关闭连接
ws.close(1000, 'Normal closure');

// 检查状态
// 0: CONNECTING
// 1: OPEN
// 2: CLOSING
// 3: CLOSED
console.log(ws.readyState);
```

**心跳保活：**
```javascript
class WebSocketClient {
  constructor(url) {
    this.url = url;
    this.ws = null;
    this.heartbeatTimer = null;
    this.reconnectTimer = null;
  }

  connect() {
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      this.startHeartbeat();
    };

    this.ws.onclose = () => {
      this.stopHeartbeat();
      this.reconnect();
    };

    this.ws.onmessage = (event) => {
      if (event.data === 'pong') {
        // 心跳响应
        return;
      }
      // 处理其他消息
    };
  }

  startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.send('ping');
      }
    }, 30000);
  }

  stopHeartbeat() {
    clearInterval(this.heartbeatTimer);
  }

  reconnect() {
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, 3000);
  }

  send(data) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(data);
    }
  }

  close() {
    clearTimeout(this.reconnectTimer);
    this.stopHeartbeat();
    this.ws.close();
  }
}
```

---

## DNS

### 9. DNS 解析过程

**答案：**

```
用户输入 www.example.com
         │
         ▼
┌─────────────────────┐
│  浏览器 DNS 缓存    │───> 命中 ──> 返回 IP
└─────────────────────┘
         │ 未命中
         ▼
┌─────────────────────┐
│  操作系统 DNS 缓存  │───> 命中 ──> 返回 IP
└─────────────────────┘
         │ 未命中
         ▼
┌─────────────────────┐
│   hosts 文件        │───> 命中 ──> 返回 IP
└─────────────────────┘
         │ 未命中
         ▼
┌─────────────────────┐
│  本地 DNS 服务器    │───> 缓存命中 ──> 返回 IP
└─────────────────────┘
         │ 未命中
         ▼
┌─────────────────────┐
│   根 DNS 服务器     │───> 返回 .com 域服务器地址
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│  顶级域 DNS 服务器  │───> 返回 example.com 服务器地址
│    (.com)          │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│  权威 DNS 服务器    │───> 返回 www.example.com 的 IP
│ (example.com)      │
└─────────────────────┘
         │
         ▼
       返回 IP 地址给用户
```

**DNS 记录类型：**
- `A`：域名到 IPv4 地址
- `AAAA`：域名到 IPv6 地址
- `CNAME`：别名
- `MX`：邮件服务器
- `TXT`：文本信息
- `NS`：域名服务器

---

## CDN

### 10. CDN 工作原理

**答案：**

```
用户请求 www.example.com/image.png
                │
                ▼
        DNS 解析（CNAME 指向 CDN）
                │
                ▼
        CDN 智能 DNS 系统
        (根据用户位置、网络状况选择最优节点)
                │
                ▼
        ┌───────┴───────┐
        │               │
   边缘节点1        边缘节点2 ...
   (北京)          (上海)
        │
        │ 缓存未命中
        ▼
    回源请求
        │
        ▼
    源站服务器
        │
        ▼
    返回资源 + 缓存到边缘节点
        │
        ▼
    返回给用户
```

**CDN 优势：**
1. **加速访问**：就近获取资源
2. **减轻源站压力**：缓存静态资源
3. **提高可用性**：多节点容灾
4. **安全防护**：DDoS 防护

**CDN 缓存策略：**
```
1. 根据 HTTP 缓存头
   - Cache-Control
   - Expires
   - ETag
   - Last-Modified

2. CDN 自定义规则
   - 文件类型
   - 路径规则
   - 参数规则

3. 缓存刷新
   - URL 刷新
   - 目录刷新
   - 预热
```

---

## 其他

### 11. RESTful API 设计规范

**答案：**

**URL 设计：**
```
# 使用名词，复数
GET    /users           # 获取用户列表
GET    /users/1         # 获取单个用户
POST   /users           # 创建用户
PUT    /users/1         # 更新用户（全量）
PATCH  /users/1         # 更新用户（部分）
DELETE /users/1         # 删除用户

# 嵌套资源
GET    /users/1/posts   # 获取用户的文章
POST   /users/1/posts   # 为用户创建文章

# 过滤、排序、分页
GET /users?status=active&sort=name&page=1&limit=10

# 版本控制
/api/v1/users
```

**响应设计：**
```json
// 成功响应
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "name": "张三"
  }
}

// 列表响应
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [...],
    "total": 100,
    "page": 1,
    "pageSize": 10
  }
}

// 错误响应
{
  "code": 400,
  "message": "参数错误",
  "errors": [
    { "field": "email", "message": "邮箱格式不正确" }
  ]
}
```

---

### 12. JWT 认证原理

**答案：**

**JWT 结构：**
```
Header.Payload.Signature

eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

**三部分：**
```javascript
// Header
{
  "alg": "HS256",  // 签名算法
  "typ": "JWT"
}

// Payload
{
  "sub": "1234567890",  // 主题
  "name": "John Doe",
  "iat": 1516239022,    // 签发时间
  "exp": 1516242622     // 过期时间
}

// Signature
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)
```

**使用流程：**
```
1. 用户登录，服务器验证身份
2. 服务器生成 JWT，返回给客户端
3. 客户端存储 JWT（localStorage/Cookie）
4. 请求时携带 JWT
   Authorization: Bearer <token>
5. 服务器验证 JWT，处理请求
```

**优缺点：**
```
优点：
- 无状态，服务器不存储
- 可扩展，适合分布式
- 跨域支持好

缺点：
- 无法主动失效
- Token 较大
- 安全存储问题
```

**刷新策略：**
```javascript
// 双 Token 策略
{
  accessToken: '短期有效，如 15 分钟',
  refreshToken: '长期有效，如 7 天'
}

// 刷新流程
1. accessToken 过期
2. 使用 refreshToken 请求新 accessToken
3. 返回新的 accessToken
4. refreshToken 过期则需重新登录
```

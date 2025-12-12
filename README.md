# 前端面试题大全

一份全面的前端面试准备资料，涵盖前端开发的各个核心领域。

基于 VitePress 构建的静态文档网站。

## 在线访问

访问地址：[https://your-username.github.io/frontend-interview](https://your-username.github.io/frontend-interview)

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 部署方式

### 方式一：GitHub Pages（推荐）

1. Fork 或克隆此仓库到你的 GitHub 账户

2. 在仓库设置中启用 GitHub Pages：
   - 进入 Settings > Pages
   - Source 选择 "GitHub Actions"

3. 推送代码到 `main` 分支，会自动触发部署

4. 如果部署到子路径（如 `https://username.github.io/frontend-interview/`），需要修改 `.vitepress/config.mts`：
   ```ts
   export default defineConfig({
     base: '/frontend-interview/',
     // ...
   })
   ```

### 方式二：Vercel

1. 在 [Vercel](https://vercel.com) 导入你的 GitHub 仓库
2. Vercel 会自动识别 VitePress 项目并完成部署
3. 每次推送代码会自动更新

### 方式三：Netlify

1. 在 [Netlify](https://netlify.com) 导入你的 GitHub 仓库
2. 构建配置已在 `netlify.toml` 中预设
3. 点击部署即可

### 方式四：自定义服务器

```bash
# 构建
npm run build

# 产物在 .vitepress/dist 目录
# 将该目录部署到任意静态服务器（Nginx、Apache 等）
```

Nginx 配置示例：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/frontend-interview/.vitepress/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## 目录结构

```
frontend-interview/
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Actions 自动部署
├── .vitepress/
│   └── config.mts          # VitePress 配置
├── docs/                   # 文档目录
│   ├── 01-HTML.md
│   ├── 02-CSS.md
│   ├── 03-JavaScript.md
│   ├── 04-ES6.md
│   ├── 05-TypeScript.md
│   ├── 06-Vue.md
│   ├── 07-React.md
│   ├── 08-Webpack.md
│   ├── 09-Vite.md
│   ├── 10-Browser.md
│   ├── 11-Network.md
│   ├── 12-Performance.md
│   ├── 13-Security.md
│   ├── 14-Algorithm.md
│   ├── 15-NodeJS.md
│   └── 16-Engineering.md
├── public/                 # 静态资源
├── index.md                # 首页
├── package.json
├── netlify.toml            # Netlify 配置
├── vercel.json             # Vercel 配置
└── README.md
```

## 内容概览

### 基础知识
| 主题 | 主要内容 |
|------|----------|
| HTML | HTML5 新特性、语义化标签、meta 标签、Web Workers、Canvas/SVG |
| CSS | 选择器、盒模型、BFC、Flex/Grid 布局、响应式设计、CSS 动画 |
| JavaScript | 数据类型、闭包、this、原型链、继承、事件循环、Promise |
| ES6+ | let/const、解构、箭头函数、Symbol、Set/Map、Proxy/Reflect |
| TypeScript | 类型系统、泛型、工具类型、条件类型、装饰器 |

### 框架与库
| 主题 | 主要内容 |
|------|----------|
| Vue | Vue 2/3 对比、响应式原理、Composition API、Vue Router、Pinia |
| React | Hooks、Redux、性能优化、Fiber 架构、React 18 新特性 |

### 构建工具
| 主题 | 主要内容 |
|------|----------|
| Webpack | Loader/Plugin、代码分割、Tree Shaking、HMR、Module Federation |
| Vite | ESM 原理、依赖预构建、插件系统、SSR 支持 |

### 浏览器与网络
| 主题 | 主要内容 |
|------|----------|
| 浏览器原理 | 渲染流程、重排重绘、存储机制、缓存策略、跨域方案 |
| 网络协议 | HTTP/1.1/2/3、HTTPS、TCP/UDP、WebSocket、DNS、CDN |

### 进阶专题
| 主题 | 主要内容 |
|------|----------|
| 性能优化 | Core Web Vitals、资源优化、首屏优化、性能监控 |
| 前端安全 | XSS、CSRF、CSP、点击劫持、安全响应头 |
| 算法 | 排序、数据结构、LeetCode 高频题、手写题 |

### 后端与工程化
| 主题 | 主要内容 |
|------|----------|
| Node.js | 事件循环、Stream、Buffer、Express/Koa |
| 工程化 | Monorepo、CI/CD、微前端、设计模式 |

## 学习建议

### 初级前端（0-1年）
- HTML/CSS 基础布局
- JavaScript 核心概念（闭包、原型、异步）
- 一个框架的基本使用（Vue 或 React）
- 基础数据结构和算法

### 中级前端（1-3年）
- TypeScript 类型系统
- 框架深入原理
- Webpack/Vite 配置优化
- 性能优化实践

### 高级前端（3年以上）
- 架构设计能力
- 工程化体系建设
- 性能监控与优化
- 团队技术选型

## 贡献指南

欢迎提交 Issue 或 Pull Request 来完善这份面试资料。

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交修改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

[MIT License](LICENSE)

# 前端工程化与项目实践面试题

## 包管理

### 1. npm、yarn、pnpm 的区别

**答案：**

| 特性 | npm | yarn | pnpm |
|------|-----|------|------|
| 安装速度 | 较慢 | 快（并行安装） | 最快（硬链接） |
| 磁盘空间 | 每个项目独立 | 每个项目独立 | 共享存储 |
| 锁文件 | package-lock.json | yarn.lock | pnpm-lock.yaml |
| 幽灵依赖 | 存在 | 存在 | 不存在 |
| Monorepo | npm workspaces | yarn workspaces | pnpm workspaces |

**幽灵依赖问题：**

```javascript
// 问题：项目没有直接安装 lodash，但可以使用
// 原因：npm/yarn 扁平化 node_modules，间接依赖被提升
import lodash from 'lodash'; // 能用但不安全

// pnpm 解决方案：非扁平化结构
node_modules/
  .pnpm/           # 实际包存储
  package-a/       # 软链接到 .pnpm
  package-b/       # 软链接到 .pnpm
```

**常用命令：**

```bash
# npm
npm install
npm install package
npm install package --save-dev
npm uninstall package
npm update
npm run script
npm publish

# yarn
yarn
yarn add package
yarn add package --dev
yarn remove package
yarn upgrade
yarn run script
yarn publish

# pnpm
pnpm install
pnpm add package
pnpm add package -D
pnpm remove package
pnpm update
pnpm run script
pnpm publish
```

---

### 2. package.json 重要字段

**答案：**

```json
{
  "name": "my-package",
  "version": "1.0.0",
  "description": "Package description",

  // 入口文件
  "main": "dist/index.js",           // CommonJS 入口
  "module": "dist/index.esm.js",     // ESM 入口
  "types": "dist/index.d.ts",        // TypeScript 类型
  "browser": "dist/index.browser.js", // 浏览器入口
  "exports": {                       // 条件导出（Node.js 12+）
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    },
    "./utils": {
      "import": "./dist/utils.mjs",
      "require": "./dist/utils.cjs"
    }
  },

  // 脚本
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "test": "jest",
    "lint": "eslint src",
    "prepare": "husky install",
    "prepublishOnly": "npm run build"
  },

  // 依赖
  "dependencies": {
    "lodash": "^4.17.21"     // ^: 兼容次版本更新
  },
  "devDependencies": {
    "typescript": "~5.0.0"   // ~: 只兼容补丁更新
  },
  "peerDependencies": {       // 宿主环境需要提供
    "react": ">=16.8.0"
  },
  "optionalDependencies": {}, // 可选依赖

  // 包发布配置
  "files": ["dist", "README.md"], // 发布包含的文件
  "publishConfig": {
    "access": "public",
    "registry": "https://registry.npmjs.org"
  },
  "sideEffects": false,      // 无副作用，支持 tree-shaking
  // 或指定有副作用的文件
  "sideEffects": ["*.css", "*.scss"],

  // 引擎要求
  "engines": {
    "node": ">=16.0.0",
    "npm": ">=8.0.0"
  },

  // 仓库信息
  "repository": {
    "type": "git",
    "url": "https://github.com/user/repo.git"
  },

  // Monorepo 工作空间
  "workspaces": [
    "packages/*"
  ]
}
```

---

### 3. 版本管理与语义化版本

**答案：**

```
语义化版本格式：主版本.次版本.补丁版本（MAJOR.MINOR.PATCH）

- MAJOR：不兼容的 API 变更
- MINOR：向后兼容的功能新增
- PATCH：向后兼容的 bug 修复

预发布版本：
- 1.0.0-alpha.1
- 1.0.0-beta.1
- 1.0.0-rc.1
```

**版本范围：**

```json
{
  "dependencies": {
    // 精确版本
    "package-a": "1.2.3",

    // 波浪号：只更新补丁版本
    "package-b": "~1.2.3",  // >=1.2.3 <1.3.0

    // 插入符：更新次版本和补丁版本
    "package-c": "^1.2.3",  // >=1.2.3 <2.0.0
    "package-d": "^0.2.3",  // >=0.2.3 <0.3.0 (0.x 特殊)

    // 范围
    "package-e": ">=1.0.0 <2.0.0",
    "package-f": "1.0.0 - 2.0.0",

    // 通配符
    "package-g": "*",       // 任意版本
    "package-h": "1.x",     // 1.x.x
    "package-i": "1.2.x",   // 1.2.x

    // 特殊标签
    "package-j": "latest",
    "package-k": "next"
  }
}
```

**锁文件的作用：**

```
- 锁定依赖的精确版本
- 保证团队成员安装相同版本
- 提高安装速度（跳过版本解析）
- 应该提交到版本控制
```

---

## 代码规范

### 4. ESLint 配置与使用

**答案：**

```javascript
// .eslintrc.js
module.exports = {
  // 运行环境
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true
  },

  // 继承配置
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:prettier/recommended' // 放最后
  ],

  // 解析器
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    },
    project: './tsconfig.json'
  },

  // 插件
  plugins: [
    '@typescript-eslint',
    'react',
    'react-hooks',
    'import'
  ],

  // 自定义规则
  rules: {
    // 0 = off, 1 = warn, 2 = error
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',

    // React 规则
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // 导入排序
    'import/order': ['error', {
      groups: [
        'builtin',
        'external',
        'internal',
        'parent',
        'sibling',
        'index'
      ],
      'newlines-between': 'always',
      alphabetize: { order: 'asc' }
    }]
  },

  // 特定文件覆盖
  overrides: [
    {
      files: ['*.test.ts', '*.spec.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off'
      }
    }
  ],

  // 忽略文件
  ignorePatterns: ['dist', 'node_modules', '*.config.js'],

  // 设置
  settings: {
    react: {
      version: 'detect'
    }
  }
};
```

```javascript
// .eslintignore
node_modules
dist
build
coverage
*.min.js
```

---

### 5. Prettier 配置

**答案：**

```javascript
// .prettierrc.js
module.exports = {
  // 行宽
  printWidth: 80,

  // 缩进
  tabWidth: 2,
  useTabs: false,

  // 分号
  semi: true,

  // 引号
  singleQuote: true,
  jsxSingleQuote: false,
  quoteProps: 'as-needed',

  // 尾逗号
  trailingComma: 'es5',

  // 括号空格
  bracketSpacing: true,
  bracketSameLine: false,

  // 箭头函数括号
  arrowParens: 'avoid',

  // 换行符
  endOfLine: 'lf',

  // HTML 空格敏感
  htmlWhitespaceSensitivity: 'css',

  // Vue 缩进
  vueIndentScriptAndStyle: false,

  // 嵌入语言格式化
  embeddedLanguageFormatting: 'auto'
};
```

```javascript
// .prettierignore
node_modules
dist
build
coverage
pnpm-lock.yaml
package-lock.json
```

**ESLint 与 Prettier 集成：**

```bash
# 安装
npm install -D eslint-config-prettier eslint-plugin-prettier
```

```javascript
// .eslintrc.js
{
  extends: [
    // 其他配置...
    'plugin:prettier/recommended' // 必须放最后
  ]
}
```

---

### 6. Git Hooks 与 Husky

**答案：**

```bash
# 安装
npm install -D husky lint-staged

# 初始化 husky
npx husky install

# 添加 prepare 脚本
npm pkg set scripts.prepare="husky install"
```

```bash
# 添加 pre-commit hook
npx husky add .husky/pre-commit "npx lint-staged"

# 添加 commit-msg hook
npx husky add .husky/commit-msg "npx --no -- commitlint --edit $1"
```

```javascript
// lint-staged.config.js
module.exports = {
  // JS/TS 文件
  '*.{js,jsx,ts,tsx}': [
    'eslint --fix',
    'prettier --write'
  ],
  // 样式文件
  '*.{css,scss,less}': [
    'stylelint --fix',
    'prettier --write'
  ],
  // JSON/MD 文件
  '*.{json,md}': [
    'prettier --write'
  ]
};
```

```javascript
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'feat',     // 新功能
      'fix',      // 修复
      'docs',     // 文档
      'style',    // 样式（不影响代码逻辑）
      'refactor', // 重构
      'perf',     // 性能优化
      'test',     // 测试
      'chore',    // 构建/工具
      'revert',   // 回滚
      'build',    // 构建
      'ci'        // CI 配置
    ]],
    'subject-case': [0],
    'subject-max-length': [2, 'always', 100]
  }
};
```

**提交信息格式：**

```
<type>(<scope>): <subject>

<body>

<footer>

示例：
feat(auth): add login functionality

- Add login form component
- Add authentication API service
- Add user state management

Closes #123
```

---

## Monorepo

### 7. Monorepo 架构

**答案：**

**优点：**
- 代码共享方便
- 统一的工具链和配置
- 原子化提交
- 依赖管理统一

**缺点：**
- 仓库体积大
- 权限管理复杂
- CI/CD 配置复杂

**目录结构：**

```
my-monorepo/
├── packages/
│   ├── shared/           # 共享库
│   │   ├── src/
│   │   └── package.json
│   ├── web/              # Web 应用
│   │   ├── src/
│   │   └── package.json
│   └── mobile/           # 移动应用
│       ├── src/
│       └── package.json
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

**pnpm workspace：**

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'apps/*'
```

```json
// 根 package.json
{
  "private": true,
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint"
  },
  "devDependencies": {
    "turbo": "^1.10.0"
  }
}
```

```json
// packages/shared/package.json
{
  "name": "@myorg/shared",
  "version": "1.0.0",
  "main": "dist/index.js",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts"
}
```

```json
// packages/web/package.json
{
  "name": "@myorg/web",
  "dependencies": {
    "@myorg/shared": "workspace:*"
  }
}
```

---

### 8. Turborepo 使用

**答案：**

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": [],
      "inputs": ["src/**/*.tsx", "src/**/*.ts", "test/**/*.ts"]
    },
    "lint": {
      "outputs": []
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "deploy": {
      "dependsOn": ["build", "test", "lint"]
    }
  }
}
```

**常用命令：**

```bash
# 运行所有包的 build
turbo run build

# 只运行特定包
turbo run build --filter=@myorg/web

# 运行包及其依赖
turbo run build --filter=@myorg/web...

# 并行运行
turbo run lint test --parallel

# 查看任务依赖图
turbo run build --graph

# 清除缓存
turbo run build --force
```

**远程缓存：**

```bash
# 登录
npx turbo login

# 链接到远程缓存
npx turbo link

# 构建时使用远程缓存
turbo run build --remote-only
```

---

## CI/CD

### 9. GitHub Actions 配置

**答案：**

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '18'

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm lint

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Test
        run: pnpm test -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  build:
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build
        run: pnpm build

      - name: Upload artifact
        uses: actions/upload-artifact@v3
        with:
          name: dist
          path: dist

  deploy:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Download artifact
        uses: actions/download-artifact@v3
        with:
          name: dist
          path: dist

      - name: Deploy to server
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/app
            git pull
            pnpm install
            pnpm build
            pm2 reload all
```

---

### 10. Docker 部署前端应用

**答案：**

```dockerfile
# Dockerfile
# 多阶段构建

# 构建阶段
FROM node:18-alpine AS builder

WORKDIR /app

# 复制依赖文件
COPY package.json pnpm-lock.yaml ./

# 安装 pnpm
RUN npm install -g pnpm

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源码
COPY . .

# 构建
RUN pnpm build

# 生产阶段
FROM nginx:alpine

# 复制 nginx 配置
COPY nginx.conf /etc/nginx/nginx.conf

# 从构建阶段复制产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]
```

```nginx
# nginx.conf
user nginx;
worker_processes auto;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # 日志
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    # 性能优化
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # SPA 路由处理
        location / {
            try_files $uri $uri/ /index.html;
        }

        # 静态资源缓存
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # API 代理
        location /api/ {
            proxy_pass http://backend:3000/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }

        # 安全头
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
    }
}
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "80:80"
    environment:
      - NGINX_HOST=localhost
    restart: unless-stopped
    networks:
      - app-network

  backend:
    image: node:18-alpine
    working_dir: /app
    volumes:
      - ./backend:/app
    command: node server.js
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@db:5432/mydb
    depends_on:
      - db
    networks:
      - app-network

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: mydb
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - app-network

volumes:
  postgres-data:

networks:
  app-network:
    driver: bridge
```

---

## 微前端

### 11. 微前端架构方案

**答案：**

**主流方案对比：**

| 方案 | 原理 | 优点 | 缺点 |
|------|------|------|------|
| iframe | 浏览器原生隔离 | 隔离性强 | 性能差、通信复杂 |
| single-spa | 路由分发 | 技术栈无关 | 配置复杂 |
| qiankun | 基于 single-spa | 开箱即用 | 沙箱有限制 |
| Module Federation | Webpack 5 | 共享代码 | 依赖 Webpack |
| Web Components | 原生组件化 | 标准化 | 兼容性 |

**qiankun 示例：**

```javascript
// 主应用
import { registerMicroApps, start } from 'qiankun';

registerMicroApps([
  {
    name: 'app1',
    entry: '//localhost:8081',
    container: '#subapp-container',
    activeRule: '/app1',
    props: {
      token: 'xxx'
    }
  },
  {
    name: 'app2',
    entry: '//localhost:8082',
    container: '#subapp-container',
    activeRule: '/app2'
  }
]);

start({
  prefetch: 'all',
  sandbox: {
    strictStyleIsolation: true,
    experimentalStyleIsolation: true
  }
});
```

```javascript
// 子应用（Vue）
// main.js
let instance = null;

function render(props = {}) {
  const { container } = props;
  instance = createApp(App);
  instance.mount(container ? container.querySelector('#app') : '#app');
}

// 独立运行
if (!window.__POWERED_BY_QIANKUN__) {
  render();
}

// 生命周期
export async function bootstrap() {
  console.log('app bootstraped');
}

export async function mount(props) {
  console.log('app mount', props);
  render(props);
}

export async function unmount() {
  instance.unmount();
  instance = null;
}
```

```javascript
// vite.config.js（子应用）
import qiankun from 'vite-plugin-qiankun';

export default {
  plugins: [
    qiankun('app1', {
      useDevMode: true
    })
  ],
  server: {
    port: 8081,
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  }
};
```

---

### 12. Module Federation

**答案：**

```javascript
// 远程应用 webpack.config.js
const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'remoteApp',
      filename: 'remoteEntry.js',
      exposes: {
        './Button': './src/components/Button',
        './Header': './src/components/Header'
      },
      shared: {
        react: { singleton: true, eager: true },
        'react-dom': { singleton: true, eager: true }
      }
    })
  ]
};
```

```javascript
// 主应用 webpack.config.js
const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'hostApp',
      remotes: {
        remoteApp: 'remoteApp@http://localhost:3001/remoteEntry.js'
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true }
      }
    })
  ]
};
```

```javascript
// 主应用使用远程组件
// 动态导入
const RemoteButton = React.lazy(() => import('remoteApp/Button'));

function App() {
  return (
    <React.Suspense fallback="Loading...">
      <RemoteButton />
    </React.Suspense>
  );
}

// 或静态导入（需要配置）
import Button from 'remoteApp/Button';
```

**Vite 中使用：**

```javascript
// vite.config.js
import federation from '@originjs/vite-plugin-federation';

export default {
  plugins: [
    federation({
      name: 'remoteApp',
      filename: 'remoteEntry.js',
      exposes: {
        './Button': './src/components/Button.vue'
      },
      shared: ['vue']
    })
  ],
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false
  }
};
```

---

## 项目架构

### 13. 前端项目目录结构

**答案：**

```
src/
├── assets/                 # 静态资源
│   ├── images/
│   ├── fonts/
│   └── styles/
│       ├── variables.scss
│       ├── mixins.scss
│       └── global.scss
│
├── components/             # 通用组件
│   ├── common/            # 基础组件
│   │   ├── Button/
│   │   │   ├── index.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Button.module.scss
│   │   │   └── Button.test.tsx
│   │   └── Input/
│   └── business/          # 业务组件
│
├── pages/                  # 页面组件
│   ├── Home/
│   ├── User/
│   └── Order/
│
├── layouts/                # 布局组件
│   ├── MainLayout/
│   └── AuthLayout/
│
├── hooks/                  # 自定义 Hooks
│   ├── useAuth.ts
│   ├── useRequest.ts
│   └── useLocalStorage.ts
│
├── services/               # API 服务
│   ├── api.ts             # axios 实例
│   ├── user.ts
│   └── order.ts
│
├── stores/                 # 状态管理
│   ├── index.ts
│   ├── user.ts
│   └── app.ts
│
├── utils/                  # 工具函数
│   ├── format.ts
│   ├── validate.ts
│   └── storage.ts
│
├── constants/              # 常量定义
│   ├── api.ts
│   └── enums.ts
│
├── types/                  # TypeScript 类型
│   ├── api.d.ts
│   ├── store.d.ts
│   └── global.d.ts
│
├── router/                 # 路由配置
│   ├── index.ts
│   └── routes.ts
│
├── config/                 # 应用配置
│   ├── index.ts
│   └── menu.ts
│
├── locales/                # 国际化
│   ├── zh-CN.json
│   └── en-US.json
│
├── App.tsx
├── main.tsx
└── vite-env.d.ts
```

---

### 14. 状态管理最佳实践

**答案：**

```typescript
// stores/user.ts (Zustand)
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface User {
  id: number;
  name: string;
  email: string;
}

interface UserState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

interface UserActions {
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  clearError: () => void;
}

const initialState: UserState = {
  user: null,
  token: null,
  loading: false,
  error: null
};

export const useUserStore = create<UserState & UserActions>()(
  devtools(
    persist(
      immer((set, get) => ({
        ...initialState,

        login: async (credentials) => {
          set({ loading: true, error: null });
          try {
            const response = await api.login(credentials);
            set({
              user: response.user,
              token: response.token,
              loading: false
            });
          } catch (error) {
            set({
              error: error.message,
              loading: false
            });
          }
        },

        logout: () => {
          set(initialState);
        },

        updateUser: (data) => {
          set((state) => {
            if (state.user) {
              Object.assign(state.user, data);
            }
          });
        },

        clearError: () => {
          set({ error: null });
        }
      })),
      {
        name: 'user-storage',
        partialize: (state) => ({
          token: state.token,
          user: state.user
        })
      }
    ),
    { name: 'UserStore' }
  )
);

// 选择器
export const selectUser = (state: UserState) => state.user;
export const selectIsLoggedIn = (state: UserState) => !!state.token;

// 使用
function UserProfile() {
  const user = useUserStore(selectUser);
  const logout = useUserStore((state) => state.logout);

  return (
    <div>
      <p>{user?.name}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

```typescript
// stores/user.ts (Pinia)
import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null as User | null,
    token: null as string | null,
    loading: false
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    userInfo: (state) => state.user
  },

  actions: {
    async login(credentials: { email: string; password: string }) {
      this.loading = true;
      try {
        const response = await api.login(credentials);
        this.user = response.user;
        this.token = response.token;
      } finally {
        this.loading = false;
      }
    },

    logout() {
      this.$reset();
    }
  },

  persist: {
    paths: ['token', 'user']
  }
});
```

---

### 15. API 请求封装

**答案：**

```typescript
// services/api.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

interface ApiResponse<T = any> {
  code: number;
  data: T;
  message: string;
}

class ApiService {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // 请求拦截
    this.instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // 响应拦截
    this.instance.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        const { code, data, message } = response.data;

        if (code === 0) {
          return data;
        }

        // 业务错误
        return Promise.reject(new Error(message));
      },
      (error) => {
        if (error.response) {
          const { status } = error.response;

          switch (status) {
            case 401:
              // 未授权，跳转登录
              window.location.href = '/login';
              break;
            case 403:
              console.error('没有权限');
              break;
            case 404:
              console.error('请求资源不存在');
              break;
            case 500:
              console.error('服务器错误');
              break;
          }
        } else if (error.request) {
          console.error('网络错误');
        }

        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.get(url, config);
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.post(url, data, config);
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.put(url, data, config);
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.delete(url, config);
  }
}

export const api = new ApiService();

// services/user.ts
export const userService = {
  getProfile: () => api.get<User>('/user/profile'),
  updateProfile: (data: Partial<User>) => api.put<User>('/user/profile', data),
  getUsers: (params: { page: number; size: number }) =>
    api.get<{ list: User[]; total: number }>('/users', { params })
};
```

```typescript
// hooks/useRequest.ts
import { useState, useCallback, useEffect } from 'react';

interface UseRequestOptions<T> {
  manual?: boolean;
  defaultParams?: any[];
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

interface UseRequestResult<T> {
  data: T | undefined;
  loading: boolean;
  error: Error | null;
  run: (...args: any[]) => Promise<T>;
  refresh: () => Promise<T>;
}

export function useRequest<T>(
  service: (...args: any[]) => Promise<T>,
  options: UseRequestOptions<T> = {}
): UseRequestResult<T> {
  const { manual = false, defaultParams = [], onSuccess, onError } = options;

  const [data, setData] = useState<T>();
  const [loading, setLoading] = useState(!manual);
  const [error, setError] = useState<Error | null>(null);
  const [params, setParams] = useState(defaultParams);

  const run = useCallback(async (...args: any[]) => {
    setLoading(true);
    setError(null);
    setParams(args);

    try {
      const result = await service(...args);
      setData(result);
      onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [service, onSuccess, onError]);

  const refresh = useCallback(() => {
    return run(...params);
  }, [run, params]);

  useEffect(() => {
    if (!manual) {
      run(...defaultParams);
    }
  }, []);

  return { data, loading, error, run, refresh };
}

// 使用
function UserList() {
  const { data, loading, error, refresh } = useRequest(
    () => userService.getUsers({ page: 1, size: 10 }),
    {
      onSuccess: (data) => console.log('获取成功', data),
      onError: (error) => console.error('获取失败', error)
    }
  );

  if (loading) return <Loading />;
  if (error) return <Error message={error.message} />;

  return (
    <div>
      {data?.list.map(user => <UserItem key={user.id} user={user} />)}
      <button onClick={refresh}>刷新</button>
    </div>
  );
}
```

---

## 国际化

### 16. React 国际化（react-i18next）

**答案：**

```typescript
// i18n/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import zhCN from './locales/zh-CN.json';
import enUS from './locales/en-US.json';

const resources = {
  'zh-CN': { translation: zhCN },
  'en-US': { translation: enUS }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'zh-CN',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;
```

```json
// locales/zh-CN.json
{
  "common": {
    "confirm": "确认",
    "cancel": "取消",
    "save": "保存",
    "delete": "删除"
  },
  "user": {
    "name": "用户名",
    "email": "邮箱",
    "welcome": "欢迎，{{name}}！",
    "items": "{{count}} 个项目",
    "items_plural": "{{count}} 个项目"
  },
  "validation": {
    "required": "{{field}}不能为空",
    "minLength": "{{field}}最少{{min}}个字符"
  }
}
```

```tsx
// 使用
import { useTranslation, Trans } from 'react-i18next';

function UserProfile() {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div>
      {/* 简单翻译 */}
      <button>{t('common.save')}</button>

      {/* 带参数 */}
      <p>{t('user.welcome', { name: '张三' })}</p>

      {/* 复数 */}
      <p>{t('user.items', { count: 5 })}</p>

      {/* 嵌套翻译 */}
      <p>{t('validation.required', { field: t('user.name') })}</p>

      {/* 组件内翻译 */}
      <Trans i18nKey="user.welcome" values={{ name: '张三' }}>
        欢迎，<strong>{{name}}</strong>！
      </Trans>

      {/* 切换语言 */}
      <button onClick={() => changeLanguage('zh-CN')}>中文</button>
      <button onClick={() => changeLanguage('en-US')}>English</button>
    </div>
  );
}
```

---

### 17. Vue 国际化（vue-i18n）

**答案：**

```typescript
// i18n/index.ts
import { createI18n } from 'vue-i18n';
import zhCN from './locales/zh-CN';
import enUS from './locales/en-US';

const messages = {
  'zh-CN': zhCN,
  'en-US': enUS
};

const i18n = createI18n({
  legacy: false, // 使用 Composition API
  locale: localStorage.getItem('language') || 'zh-CN',
  fallbackLocale: 'zh-CN',
  messages
});

export default i18n;
```

```typescript
// locales/zh-CN.ts
export default {
  common: {
    confirm: '确认',
    cancel: '取消'
  },
  user: {
    welcome: '欢迎，{name}！',
    items: '{count} 个项目 | {count} 个项目'
  }
};
```

```vue
<!-- 使用 -->
<template>
  <div>
    <!-- 简单翻译 -->
    <button>{{ $t('common.confirm') }}</button>

    <!-- 带参数 -->
    <p>{{ $t('user.welcome', { name: '张三' }) }}</p>

    <!-- 复数 -->
    <p>{{ $t('user.items', 5) }}</p>

    <!-- 组件方式 -->
    <i18n-t keypath="user.welcome" tag="p">
      <template #name>
        <strong>张三</strong>
      </template>
    </i18n-t>

    <!-- 切换语言 -->
    <button @click="changeLanguage('zh-CN')">中文</button>
    <button @click="changeLanguage('en-US')">English</button>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t, locale } = useI18n();

const changeLanguage = (lng: string) => {
  locale.value = lng;
  localStorage.setItem('language', lng);
};
</script>
```

---

## 错误监控

### 18. 前端错误监控

**答案：**

```typescript
// utils/errorMonitor.ts
interface ErrorInfo {
  type: 'js' | 'promise' | 'resource' | 'api' | 'custom';
  message: string;
  stack?: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  url: string;
  userAgent: string;
  timestamp: number;
  extra?: Record<string, any>;
}

class ErrorMonitor {
  private errors: ErrorInfo[] = [];
  private reportUrl: string;
  private maxErrors: number = 10;

  constructor(reportUrl: string) {
    this.reportUrl = reportUrl;
    this.init();
  }

  private init() {
    // JS 错误
    window.onerror = (message, filename, lineno, colno, error) => {
      this.capture({
        type: 'js',
        message: String(message),
        stack: error?.stack,
        filename,
        lineno,
        colno
      });
    };

    // Promise 错误
    window.addEventListener('unhandledrejection', (event) => {
      this.capture({
        type: 'promise',
        message: event.reason?.message || String(event.reason),
        stack: event.reason?.stack
      });
    });

    // 资源加载错误
    window.addEventListener('error', (event) => {
      const target = event.target as HTMLElement;
      if (target.tagName) {
        this.capture({
          type: 'resource',
          message: `Failed to load ${target.tagName.toLowerCase()}`,
          extra: {
            tagName: target.tagName,
            src: (target as HTMLImageElement).src || (target as HTMLScriptElement).src
          }
        });
      }
    }, true);
  }

  capture(info: Partial<ErrorInfo>) {
    const errorInfo: ErrorInfo = {
      type: 'custom',
      message: '',
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
      ...info
    };

    this.errors.push(errorInfo);

    // 立即上报
    this.report([errorInfo]);
  }

  private async report(errors: ErrorInfo[]) {
    try {
      // 使用 sendBeacon 保证页面卸载时也能发送
      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          this.reportUrl,
          JSON.stringify(errors)
        );
      } else {
        await fetch(this.reportUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(errors)
        });
      }
    } catch (e) {
      console.error('Error reporting failed:', e);
    }
  }

  // 手动捕获
  captureError(error: Error, extra?: Record<string, any>) {
    this.capture({
      type: 'custom',
      message: error.message,
      stack: error.stack,
      extra
    });
  }

  // 捕获 API 错误
  captureApiError(url: string, status: number, message: string) {
    this.capture({
      type: 'api',
      message: `API Error: ${url} - ${status} - ${message}`,
      extra: { url, status }
    });
  }
}

// 初始化
export const errorMonitor = new ErrorMonitor('/api/errors');

// 使用
try {
  riskyOperation();
} catch (error) {
  errorMonitor.captureError(error as Error, {
    userId: currentUser.id,
    action: 'riskyOperation'
  });
}
```

```typescript
// React Error Boundary
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { errorMonitor } from './errorMonitor';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    errorMonitor.captureError(error, {
      componentStack: errorInfo.componentStack
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-page">
          <h1>出错了</h1>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>
            刷新页面
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

---

## 设计模式

### 19. 前端常用设计模式

**答案：**

```typescript
// 1. 单例模式
class Singleton {
  private static instance: Singleton;
  private constructor() {}

  static getInstance(): Singleton {
    if (!Singleton.instance) {
      Singleton.instance = new Singleton();
    }
    return Singleton.instance;
  }
}

// 应用：全局状态、配置管理
class ConfigManager {
  private static instance: ConfigManager;
  private config: Record<string, any> = {};

  private constructor() {}

  static getInstance() {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  set(key: string, value: any) {
    this.config[key] = value;
  }

  get(key: string) {
    return this.config[key];
  }
}

// 2. 观察者模式
class EventEmitter {
  private events: Map<string, Function[]> = new Map();

  on(event: string, callback: Function) {
    const callbacks = this.events.get(event) || [];
    callbacks.push(callback);
    this.events.set(event, callbacks);
  }

  off(event: string, callback: Function) {
    const callbacks = this.events.get(event) || [];
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }

  emit(event: string, ...args: any[]) {
    const callbacks = this.events.get(event) || [];
    callbacks.forEach(callback => callback(...args));
  }

  once(event: string, callback: Function) {
    const wrapper = (...args: any[]) => {
      callback(...args);
      this.off(event, wrapper);
    };
    this.on(event, wrapper);
  }
}

// 3. 发布订阅模式
class PubSub {
  private static events: Map<string, Function[]> = new Map();

  static subscribe(event: string, callback: Function) {
    const callbacks = this.events.get(event) || [];
    callbacks.push(callback);
    this.events.set(event, callbacks);

    return () => {
      const cbs = this.events.get(event) || [];
      const index = cbs.indexOf(callback);
      if (index > -1) cbs.splice(index, 1);
    };
  }

  static publish(event: string, data?: any) {
    const callbacks = this.events.get(event) || [];
    callbacks.forEach(callback => callback(data));
  }
}

// 4. 工厂模式
interface Button {
  render(): void;
}

class PrimaryButton implements Button {
  render() {
    console.log('Render primary button');
  }
}

class SecondaryButton implements Button {
  render() {
    console.log('Render secondary button');
  }
}

class ButtonFactory {
  static create(type: 'primary' | 'secondary'): Button {
    switch (type) {
      case 'primary':
        return new PrimaryButton();
      case 'secondary':
        return new SecondaryButton();
      default:
        throw new Error('Unknown button type');
    }
  }
}

// 5. 策略模式
interface PaymentStrategy {
  pay(amount: number): void;
}

class AlipayStrategy implements PaymentStrategy {
  pay(amount: number) {
    console.log(`Pay ${amount} via Alipay`);
  }
}

class WechatPayStrategy implements PaymentStrategy {
  pay(amount: number) {
    console.log(`Pay ${amount} via WeChat Pay`);
  }
}

class PaymentContext {
  private strategy: PaymentStrategy;

  setStrategy(strategy: PaymentStrategy) {
    this.strategy = strategy;
  }

  executePayment(amount: number) {
    this.strategy.pay(amount);
  }
}

// 6. 装饰器模式
function log(target: any, key: string, descriptor: PropertyDescriptor) {
  const original = descriptor.value;

  descriptor.value = function(...args: any[]) {
    console.log(`Calling ${key} with`, args);
    const result = original.apply(this, args);
    console.log(`Result:`, result);
    return result;
  };

  return descriptor;
}

class Calculator {
  @log
  add(a: number, b: number) {
    return a + b;
  }
}

// 7. 代理模式
const createImageProxy = (src: string) => {
  const img = new Image();

  return new Proxy(img, {
    get(target, prop) {
      if (prop === 'src') {
        // 懒加载
        if (!target.src) {
          target.src = src;
        }
      }
      return Reflect.get(target, prop);
    }
  });
};

// 8. 适配器模式
interface OldAPI {
  request(url: string, callback: (data: any) => void): void;
}

class OldApiAdapter {
  private oldApi: OldAPI;

  constructor(oldApi: OldAPI) {
    this.oldApi = oldApi;
  }

  async fetch(url: string): Promise<any> {
    return new Promise((resolve) => {
      this.oldApi.request(url, resolve);
    });
  }
}
```

---

### 20. 常见面试场景题

**答案：**

**1. 大文件上传：**

```typescript
class FileUploader {
  private chunkSize = 5 * 1024 * 1024; // 5MB

  async upload(file: File) {
    const chunks = this.createChunks(file);
    const hash = await this.calculateHash(file);

    // 检查已上传的分片
    const { uploadedChunks } = await this.checkUploadedChunks(hash);

    // 并发上传
    await this.uploadChunks(chunks, hash, uploadedChunks);

    // 合并文件
    await this.mergeChunks(hash, file.name);
  }

  private createChunks(file: File): Blob[] {
    const chunks: Blob[] = [];
    let start = 0;

    while (start < file.size) {
      chunks.push(file.slice(start, start + this.chunkSize));
      start += this.chunkSize;
    }

    return chunks;
  }

  private async calculateHash(file: File): Promise<string> {
    return new Promise((resolve) => {
      const spark = new SparkMD5.ArrayBuffer();
      const reader = new FileReader();

      reader.onload = (e) => {
        spark.append(e.target?.result as ArrayBuffer);
        resolve(spark.end());
      };

      reader.readAsArrayBuffer(file);
    });
  }

  private async uploadChunks(
    chunks: Blob[],
    hash: string,
    uploadedChunks: number[]
  ) {
    const tasks = chunks.map((chunk, index) => {
      if (uploadedChunks.includes(index)) {
        return Promise.resolve();
      }
      return this.uploadChunk(chunk, hash, index);
    });

    // 控制并发数
    await this.parallelLimit(tasks, 3);
  }

  private parallelLimit(tasks: Promise<any>[], limit: number) {
    return new Promise((resolve) => {
      let index = 0;
      let running = 0;
      let completed = 0;

      const run = async () => {
        while (running < limit && index < tasks.length) {
          running++;
          const currentIndex = index++;

          tasks[currentIndex].then(() => {
            running--;
            completed++;
            if (completed === tasks.length) {
              resolve(undefined);
            } else {
              run();
            }
          });
        }
      };

      run();
    });
  }
}
```

**2. 虚拟滚动：**

```tsx
interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
}

function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);

  const totalHeight = items.length * itemHeight;
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(startIndex + visibleCount + 1, items.length);

  const visibleItems = items.slice(startIndex, endIndex);
  const offsetY = startIndex * itemHeight;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  return (
    <div
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => (
            <div key={startIndex + index} style={{ height: itemHeight }}>
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

**3. 前端路由实现：**

```typescript
// Hash 路由
class HashRouter {
  private routes: Map<string, () => void> = new Map();

  constructor() {
    window.addEventListener('hashchange', () => {
      this.handleRouteChange();
    });

    window.addEventListener('load', () => {
      this.handleRouteChange();
    });
  }

  register(path: string, callback: () => void) {
    this.routes.set(path, callback);
  }

  private handleRouteChange() {
    const hash = window.location.hash.slice(1) || '/';
    const callback = this.routes.get(hash);
    callback?.();
  }

  push(path: string) {
    window.location.hash = path;
  }
}

// History 路由
class HistoryRouter {
  private routes: Map<string, () => void> = new Map();

  constructor() {
    window.addEventListener('popstate', () => {
      this.handleRouteChange();
    });
  }

  register(path: string, callback: () => void) {
    this.routes.set(path, callback);
  }

  private handleRouteChange() {
    const path = window.location.pathname;
    const callback = this.routes.get(path);
    callback?.();
  }

  push(path: string) {
    window.history.pushState(null, '', path);
    this.handleRouteChange();
  }

  replace(path: string) {
    window.history.replaceState(null, '', path);
    this.handleRouteChange();
  }
}
```

**4. 图片懒加载：**

```typescript
function lazyLoadImages() {
  const images = document.querySelectorAll<HTMLImageElement>('img[data-src]');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset.src!;
          img.removeAttribute('data-src');
          observer.unobserve(img);
        }
      });
    },
    {
      rootMargin: '100px' // 提前 100px 加载
    }
  );

  images.forEach((img) => observer.observe(img));
}

// React Hook
function useLazyLoad(ref: RefObject<HTMLImageElement>, src: string) {
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && ref.current) {
          ref.current.src = src;
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [ref, src]);
}
```

**5. 请求并发控制：**

```typescript
class RequestPool {
  private limit: number;
  private running: number = 0;
  private queue: Array<() => Promise<any>> = [];

  constructor(limit: number = 5) {
    this.limit = limit;
  }

  async add<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const task = async () => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.running--;
          this.runNext();
        }
      };

      if (this.running < this.limit) {
        this.running++;
        task();
      } else {
        this.queue.push(task);
      }
    });
  }

  private runNext() {
    if (this.queue.length > 0 && this.running < this.limit) {
      const task = this.queue.shift()!;
      this.running++;
      task();
    }
  }
}

// 使用
const pool = new RequestPool(3);

const urls = ['/api/1', '/api/2', '/api/3', '/api/4', '/api/5'];

const results = await Promise.all(
  urls.map(url => pool.add(() => fetch(url)))
);
```

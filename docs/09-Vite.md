# Vite 面试题

## 基础概念

### 1. Vite 是什么？与 Webpack 有什么区别？

**答案：**

Vite 是新一代前端构建工具，利用浏览器原生 ES 模块和现代 JavaScript 工具实现极快的开发体验。

**核心特点：**
1. **极速冷启动**：利用浏览器原生 ES 模块，无需打包
2. **即时热更新**：基于 ESM 的 HMR，速度极快
3. **按需编译**：只编译当前页面需要的模块
4. **生产优化**：使用 Rollup 打包，输出高度优化的代码

**Vite vs Webpack：**

| 特性 | Vite | Webpack |
|------|------|---------|
| 开发服务器 | 原生 ESM | 打包后服务 |
| 冷启动 | 极快（毫秒级） | 较慢（秒级） |
| HMR | 极快 | 较慢 |
| 生产打包 | Rollup | Webpack |
| 配置复杂度 | 简单 | 复杂 |
| 生态系统 | 新兴 | 成熟 |
| 浏览器支持 | 现代浏览器 | 更广泛 |

**工作原理对比：**
```
Webpack 开发模式：
源文件 -> 打包所有模块 -> Bundle -> 服务器 -> 浏览器

Vite 开发模式：
源文件 -> 服务器 -> 浏览器请求 -> 按需编译单个模块 -> 返回
```

---

### 2. Vite 为什么快？

**答案：**

**1. 利用浏览器原生 ES 模块：**
```html
<!-- 浏览器直接请求模块 -->
<script type="module" src="/src/main.js"></script>
```

```javascript
// 浏览器直接解析 import
import { createApp } from 'vue';
import App from './App.vue';

// Vite 开发服务器拦截请求，按需编译返回
```

**2. 依赖预构建（Pre-bundling）：**
```javascript
// node_modules 中的依赖使用 esbuild 预构建
// esbuild 用 Go 编写，比 JS 工具快 10-100 倍

// vite.config.js
export default {
  optimizeDeps: {
    include: ['lodash-es', 'axios'], // 强制预构建
    exclude: ['your-local-package']  // 排除预构建
  }
};
```

**3. 按需编译：**
```
首次请求 /src/main.js
  -> 编译 main.js
  -> 返回

请求 /src/components/Button.vue
  -> 编译 Button.vue
  -> 返回

// 只编译请求的模块，未访问的模块不编译
```

**4. 高效的 HMR：**
```javascript
// 基于 ESM 的 HMR
// 只需要更新变化的模块及其依赖链
// 而不是重新打包整个应用

// 模块更新只影响该模块，不影响其他模块
```

---

### 3. Vite 的基本配置

**答案：**

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  // 插件
  plugins: [vue()],

  // 开发服务器
  server: {
    host: '0.0.0.0',
    port: 3000,
    open: true,
    cors: true,
    // 代理
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },

  // 构建选项
  build: {
    target: 'es2015',
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'terser', // 'esbuild' | 'terser' | false
    sourcemap: true,
    // Rollup 选项
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        nested: path.resolve(__dirname, 'nested/index.html')
      },
      output: {
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: '[ext]/[name]-[hash].[ext]',
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          lodash: ['lodash-es']
        }
      }
    },
    // 压缩选项
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },

  // 解析选项
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      'components': path.resolve(__dirname, 'src/components')
    },
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
  },

  // CSS 选项
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`
      },
      less: {
        javascriptEnabled: true
      }
    },
    modules: {
      localsConvention: 'camelCase'
    },
    postcss: {
      plugins: [require('autoprefixer')]
    }
  },

  // 环境变量前缀
  envPrefix: 'VITE_',

  // 基础路径
  base: '/',

  // 预构建优化
  optimizeDeps: {
    include: ['axios', 'lodash-es'],
    exclude: ['your-local-package']
  }
});
```

---

### 4. Vite 如何处理环境变量？

**答案：**

**环境文件：**
```bash
.env                # 所有环境
.env.local          # 本地覆盖（git忽略）
.env.development    # 开发环境
.env.production     # 生产环境
.env.[mode]         # 指定模式
```

**环境变量定义：**
```bash
# .env
VITE_APP_TITLE=My App
VITE_API_URL=https://api.example.com

# 只有 VITE_ 前缀的变量才会暴露给客户端代码
DB_PASSWORD=secret  # 不会暴露
```

**使用环境变量：**
```javascript
// 客户端代码
console.log(import.meta.env.VITE_APP_TITLE);
console.log(import.meta.env.VITE_API_URL);

// 内置变量
console.log(import.meta.env.MODE);      // 'development' | 'production'
console.log(import.meta.env.BASE_URL);  // 基础路径
console.log(import.meta.env.PROD);      // 是否生产环境
console.log(import.meta.env.DEV);       // 是否开发环境
console.log(import.meta.env.SSR);       // 是否服务端渲染
```

**TypeScript 类型支持：**
```typescript
// env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

**命令行指定模式：**
```bash
vite build --mode staging
# 加载 .env.staging
```

---

### 5. Vite 的静态资源处理

**答案：**

**导入资源：**
```javascript
// 导入为 URL
import imgUrl from './img.png';
document.getElementById('img').src = imgUrl;

// 导入为字符串
import rawText from './text.txt?raw';

// 导入为 Worker
import Worker from './worker.js?worker';
const worker = new Worker();

// 导入为 Web Assembly
import init from './example.wasm?init';
init().then((instance) => {
  instance.exports.foo();
});
```

**public 目录：**
```
public/
  favicon.ico
  robots.txt

# 通过绝对路径访问
<img src="/favicon.ico" />
```

**资源内联：**
```javascript
// 小于 4KB 的资源默认内联为 base64
// 可以通过配置修改

// vite.config.js
export default {
  build: {
    assetsInlineLimit: 4096 // 4KB
  }
};

// 强制内联
import imgUrl from './img.png?inline';

// 强制作为 URL
import imgUrl from './img.png?url';
```

**JSON 导入：**
```javascript
// 整个 JSON
import json from './data.json';

// 具名导入（tree-shakable）
import { name, version } from './package.json';
```

**Glob 导入：**
```javascript
// 同步导入
const modules = import.meta.glob('./modules/*.js', { eager: true });
// {
//   './modules/a.js': { default: ... },
//   './modules/b.js': { default: ... }
// }

// 异步导入（懒加载）
const modules = import.meta.glob('./modules/*.js');
// {
//   './modules/a.js': () => import('./modules/a.js'),
//   './modules/b.js': () => import('./modules/b.js')
// }

// 使用
for (const path in modules) {
  modules[path]().then((mod) => {
    console.log(mod.default);
  });
}

// 只导入特定导出
const modules = import.meta.glob('./modules/*.js', {
  import: 'default'
});

// 导入为字符串
const modules = import.meta.glob('./modules/*.js', {
  as: 'raw'
});
```

---

## 高级特性

### 6. Vite 插件系统

**答案：**

Vite 插件基于 Rollup 插件接口扩展。

**插件形式：**
```javascript
// 函数形式
function myPlugin() {
  return {
    name: 'my-plugin',
    // 钩子函数
  };
}

// 带选项
function myPlugin(options = {}) {
  return {
    name: 'my-plugin',
    // 使用 options
  };
}
```

**常用钩子：**
```javascript
export default function myPlugin() {
  return {
    name: 'my-plugin',

    // Vite 独有钩子
    config(config, { command, mode }) {
      // 修改 Vite 配置
      return {
        resolve: {
          alias: {
            '@': '/src'
          }
        }
      };
    },

    configResolved(resolvedConfig) {
      // 存储最终配置
    },

    configureServer(server) {
      // 配置开发服务器
      server.middlewares.use((req, res, next) => {
        // 自定义中间件
        next();
      });
    },

    transformIndexHtml(html) {
      // 转换 index.html
      return html.replace(
        /<title>(.*?)<\/title>/,
        '<title>New Title</title>'
      );
    },

    handleHotUpdate({ file, server }) {
      // 自定义 HMR 处理
      if (file.endsWith('.custom')) {
        server.ws.send({
          type: 'custom',
          event: 'custom-update',
          data: {}
        });
        return [];
      }
    },

    // Rollup 通用钩子
    resolveId(source, importer) {
      // 自定义模块解析
      if (source === 'virtual-module') {
        return source;
      }
    },

    load(id) {
      // 自定义模块加载
      if (id === 'virtual-module') {
        return 'export default "Hello"';
      }
    },

    transform(code, id) {
      // 转换代码
      if (id.endsWith('.custom')) {
        return {
          code: transformCustom(code),
          map: null
        };
      }
    },

    buildStart() {
      // 构建开始
    },

    buildEnd() {
      // 构建结束
    },

    generateBundle(options, bundle) {
      // 生成 bundle 时
    }
  };
}
```

**插件执行顺序：**
```javascript
export default {
  plugins: [
    {
      name: 'plugin-pre',
      enforce: 'pre', // 在 Vite 核心插件之前
      transform(code) {}
    },
    {
      name: 'plugin-normal',
      // 默认在 Vite 核心插件之后
      transform(code) {}
    },
    {
      name: 'plugin-post',
      enforce: 'post', // 在 Vite 构建插件之后
      transform(code) {}
    }
  ]
};

// 执行顺序：
// 1. 别名解析
// 2. enforce: 'pre' 插件
// 3. Vite 核心插件
// 4. 普通插件
// 5. Vite 构建插件
// 6. enforce: 'post' 插件
```

**条件应用：**
```javascript
{
  name: 'my-plugin',
  apply: 'build', // 只在构建时应用
  // apply: 'serve', // 只在开发时应用
  // apply: (config, { command }) => command === 'build'
}
```

---

### 7. Vite 的 CSS 处理

**答案：**

**CSS 导入：**
```javascript
// 直接导入
import './style.css';

// CSS Modules
import styles from './style.module.css';
element.className = styles.container;

// 导入为字符串
import cssText from './style.css?inline';
```

**预处理器：**
```bash
# 安装对应预处理器
npm install -D sass
npm install -D less
npm install -D stylus
```

```javascript
// vite.config.js
export default {
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @import "@/styles/variables.scss";
          @import "@/styles/mixins.scss";
        `
      },
      less: {
        modifyVars: {
          'primary-color': '#1890ff'
        },
        javascriptEnabled: true
      }
    }
  }
};
```

**PostCSS：**
```javascript
// postcss.config.js
module.exports = {
  plugins: [
    require('autoprefixer'),
    require('postcss-preset-env'),
    require('tailwindcss')
  ]
};

// 或在 vite.config.js 中
export default {
  css: {
    postcss: {
      plugins: [
        require('autoprefixer')
      ]
    }
  }
};
```

**CSS Modules 配置：**
```javascript
export default {
  css: {
    modules: {
      localsConvention: 'camelCase', // 类名转换
      scopeBehaviour: 'local', // 默认作用域
      generateScopedName: '[name]__[local]___[hash:base64:5]'
    }
  }
};
```

---

### 8. Vite 的代码分割

**答案：**

**动态导入：**
```javascript
// 自动代码分割
const module = await import('./module.js');

// React 懒加载
const LazyComponent = React.lazy(() => import('./LazyComponent'));

// Vue 异步组件
const AsyncComponent = defineAsyncComponent(() =>
  import('./AsyncComponent.vue')
);
```

**手动分割（Rollup）：**
```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // 第三方库分割
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'lodash': ['lodash-es'],
          'echarts': ['echarts']
        }
      }
    }
  }
};

// 函数形式（更灵活）
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // 按包名分割
            const name = id.split('node_modules/')[1].split('/')[0];
            return `vendor-${name}`;
          }
        }
      }
    }
  }
};
```

**分割策略：**
```javascript
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // 大型库单独打包
            if (id.includes('echarts')) {
              return 'echarts';
            }
            if (id.includes('lodash')) {
              return 'lodash';
            }
            // 其他 node_modules 打包到 vendor
            return 'vendor';
          }
          // 公共模块
          if (id.includes('src/utils')) {
            return 'utils';
          }
        }
      }
    }
  }
};
```

---

### 9. Vite 的 SSR 支持

**答案：**

```javascript
// server.js
import fs from 'fs';
import path from 'path';
import express from 'express';
import { createServer as createViteServer } from 'vite';

async function createServer() {
  const app = express();

  // 创建 Vite 开发服务器
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom'
  });

  // 使用 Vite 中间件
  app.use(vite.middlewares);

  app.use('*', async (req, res) => {
    const url = req.originalUrl;

    try {
      // 读取 index.html
      let template = fs.readFileSync(
        path.resolve(__dirname, 'index.html'),
        'utf-8'
      );

      // 应用 Vite HTML 转换
      template = await vite.transformIndexHtml(url, template);

      // 加载服务端入口
      const { render } = await vite.ssrLoadModule('/src/entry-server.js');

      // 渲染应用
      const appHtml = await render(url);

      // 注入渲染后的 HTML
      const html = template.replace(`<!--ssr-outlet-->`, appHtml);

      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      console.error(e);
      res.status(500).end(e.message);
    }
  });

  app.listen(3000);
}

createServer();
```

**entry-server.js：**
```javascript
import { createApp } from './main';
import { renderToString } from 'vue/server-renderer';

export async function render(url) {
  const { app, router } = createApp();

  router.push(url);
  await router.isReady();

  const html = await renderToString(app);
  return html;
}
```

**生产环境构建：**
```bash
# 构建客户端
vite build --outDir dist/client

# 构建 SSR
vite build --ssr src/entry-server.js --outDir dist/server
```

---

### 10. Vite 性能优化

**答案：**

**1. 依赖预构建优化：**
```javascript
export default {
  optimizeDeps: {
    // 强制预构建
    include: [
      'vue',
      'vue-router',
      'pinia',
      'axios',
      'lodash-es'
    ],
    // 排除
    exclude: ['your-local-package']
  }
};
```

**2. 构建优化：**
```javascript
export default {
  build: {
    // 压缩
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },

    // CSS 代码分割
    cssCodeSplit: true,

    // 资源内联阈值
    assetsInlineLimit: 4096,

    // 分块策略
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia']
        }
      }
    },

    // 减小 chunk 大小
    chunkSizeWarningLimit: 500
  }
};
```

**3. 生产环境移除 console：**
```javascript
export default {
  esbuild: {
    drop: ['console', 'debugger']
  }
};
```

**4. 使用 CDN：**
```javascript
import { defineConfig } from 'vite';
import { createHtmlPlugin } from 'vite-plugin-html';

export default defineConfig({
  plugins: [
    createHtmlPlugin({
      inject: {
        data: {
          injectScript: `
            <script src="https://cdn.jsdelivr.net/npm/vue@3"></script>
          `
        }
      }
    })
  ],
  build: {
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue'
        }
      }
    }
  }
});
```

**5. 预加载：**
```javascript
// 自动生成 modulepreload
// Vite 会自动为入口 chunk 的直接导入生成 <link rel="modulepreload">

// 手动预加载
export default {
  build: {
    modulePreload: {
      polyfill: true
    }
  }
};
```

**6. Gzip/Brotli 压缩：**
```javascript
import viteCompression from 'vite-plugin-compression';

export default {
  plugins: [
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz'
    }),
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br'
    })
  ]
};
```

---

### 11. 常用 Vite 插件

**答案：**

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';
import { visualizer } from 'rollup-plugin-visualizer';
import viteCompression from 'vite-plugin-compression';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';

export default defineConfig({
  plugins: [
    // Vue 支持
    vue(),

    // React 支持
    react(),

    // 传统浏览器支持
    legacy({
      targets: ['defaults', 'not IE 11']
    }),

    // 打包分析
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true
    }),

    // Gzip 压缩
    viteCompression(),

    // SVG 图标
    createSvgIconsPlugin({
      iconDirs: [path.resolve(__dirname, 'src/icons')],
      symbolId: 'icon-[dir]-[name]'
    }),

    // 自动导入 API
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      resolvers: [ElementPlusResolver()],
      dts: 'src/auto-imports.d.ts'
    }),

    // 自动导入组件
    Components({
      resolvers: [ElementPlusResolver()],
      dts: 'src/components.d.ts'
    })
  ]
});
```

---

### 12. Vite 和传统工具链对比

**答案：**

**Vite vs Create React App：**
```
启动速度：Vite 快 10-100 倍
HMR：Vite 快得多
配置：Vite 更简单
构建：CRA 用 Webpack，Vite 用 Rollup
```

**Vite vs Vue CLI：**
```
启动速度：Vite 快很多
HMR：Vite 基于 ESM，更快
配置：相似，Vite 更简洁
插件：Vue CLI 基于 Webpack，Vite 基于 Rollup
```

**什么时候用 Vite：**
- 新项目
- 现代浏览器为主
- 追求开发体验
- 中小型项目

**什么时候用 Webpack：**
- 需要支持旧浏览器
- 复杂的构建需求
- 依赖特定 Webpack 插件
- 大型遗留项目

**迁移到 Vite：**
```bash
# 安装
npm install -D vite @vitejs/plugin-vue

# 修改 package.json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}

# 移动 index.html 到项目根目录
# 修改入口引用
<script type="module" src="/src/main.js"></script>

# 创建 vite.config.js
```

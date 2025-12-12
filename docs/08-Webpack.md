# Webpack 面试题

## 基础概念

### 1. Webpack 是什么？核心概念有哪些？

**答案：**

Webpack 是一个现代 JavaScript 应用程序的静态模块打包工具。

**核心概念：**

| 概念 | 说明 |
|------|------|
| Entry | 入口，Webpack 从这里开始构建依赖图 |
| Output | 输出，打包后的文件存放位置 |
| Loader | 转换器，让 Webpack 处理非 JS 文件 |
| Plugin | 插件，扩展 Webpack 功能 |
| Mode | 模式，development/production/none |
| Module | 模块，每个文件都是一个模块 |
| Chunk | 代码块，多个模块的集合 |
| Bundle | 包，最终输出的文件 |

```javascript
// webpack.config.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  // 模式
  mode: 'development', // 'production' | 'none'

  // 入口
  entry: './src/index.js',
  // 多入口
  entry: {
    main: './src/index.js',
    vendor: './src/vendor.js'
  },

  // 输出
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    clean: true, // 清理输出目录
    publicPath: '/', // 公共路径
  },

  // Loader
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },

  // 插件
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html'
    })
  ],

  // 解析
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
};
```

---

### 2. Loader 和 Plugin 的区别？

**答案：**

| 特性 | Loader | Plugin |
|------|--------|--------|
| 作用 | 转换文件 | 扩展功能 |
| 执行时机 | 打包文件时 | 整个构建过程 |
| 配置位置 | module.rules | plugins |
| 本质 | 函数 | 类（有 apply 方法） |

**Loader：**
```javascript
// 执行顺序：从右到左，从下到上
module: {
  rules: [
    {
      test: /\.scss$/,
      use: [
        'style-loader',   // 3. 将 CSS 注入 DOM
        'css-loader',     // 2. 解析 CSS
        'sass-loader'     // 1. 编译 Sass
      ]
    }
  ]
}

// 自定义 Loader
module.exports = function(source) {
  // source 是文件内容
  const result = transform(source);
  return result;
};
```

**Plugin：**
```javascript
// 自定义 Plugin
class MyPlugin {
  apply(compiler) {
    // 注册钩子
    compiler.hooks.emit.tap('MyPlugin', (compilation) => {
      // 处理构建结果
      console.log('构建完成');
    });
  }
}

// 使用
plugins: [new MyPlugin()]
```

---

### 3. 常用的 Loader 有哪些？

**答案：**

**JavaScript/TypeScript：**
```javascript
// babel-loader - 转译 ES6+
{
  test: /\.js$/,
  exclude: /node_modules/,
  use: {
    loader: 'babel-loader',
    options: {
      presets: ['@babel/preset-env', '@babel/preset-react'],
      plugins: ['@babel/plugin-transform-runtime']
    }
  }
}

// ts-loader - 编译 TypeScript
{
  test: /\.tsx?$/,
  use: 'ts-loader',
  exclude: /node_modules/
}
```

**CSS：**
```javascript
// css-loader + style-loader
{
  test: /\.css$/,
  use: ['style-loader', 'css-loader']
}

// sass-loader
{
  test: /\.scss$/,
  use: ['style-loader', 'css-loader', 'sass-loader']
}

// postcss-loader
{
  test: /\.css$/,
  use: [
    'style-loader',
    'css-loader',
    {
      loader: 'postcss-loader',
      options: {
        postcssOptions: {
          plugins: ['autoprefixer']
        }
      }
    }
  ]
}

// CSS Modules
{
  test: /\.module\.css$/,
  use: [
    'style-loader',
    {
      loader: 'css-loader',
      options: {
        modules: true
      }
    }
  ]
}
```

**资源：**
```javascript
// Webpack 5 内置资源模块
{
  test: /\.(png|jpg|gif|svg)$/,
  type: 'asset/resource' // 输出文件
}

{
  test: /\.(png|jpg|gif|svg)$/,
  type: 'asset/inline' // Base64
}

{
  test: /\.(png|jpg|gif|svg)$/,
  type: 'asset', // 自动选择
  parser: {
    dataUrlCondition: {
      maxSize: 8 * 1024 // 8KB
    }
  }
}

// 字体
{
  test: /\.(woff|woff2|eot|ttf|otf)$/,
  type: 'asset/resource'
}
```

**其他：**
```javascript
// vue-loader
{
  test: /\.vue$/,
  loader: 'vue-loader'
}

// html-loader
{
  test: /\.html$/,
  loader: 'html-loader'
}

// raw-loader - 将文件作为字符串导入
{
  test: /\.txt$/,
  type: 'asset/source'
}
```

---

### 4. 常用的 Plugin 有哪些？

**答案：**

```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const DefinePlugin = require('webpack').DefinePlugin;
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  plugins: [
    // 生成 HTML 文件
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html',
      minify: {
        collapseWhitespace: true,
        removeComments: true
      }
    }),

    // 提取 CSS 到单独文件
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css'
    }),

    // 清理输出目录（Webpack 5 可用 output.clean）
    new CleanWebpackPlugin(),

    // 复制静态资源
    new CopyWebpackPlugin({
      patterns: [
        { from: 'public', to: 'public' }
      ]
    }),

    // 定义环境变量
    new DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
      __DEV__: false
    }),

    // 打包分析
    new BundleAnalyzerPlugin(),

    // 进度条
    new webpack.ProgressPlugin(),

    // 热更新
    new webpack.HotModuleReplacementPlugin()
  ],

  optimization: {
    minimizer: [
      // JS 压缩
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          compress: {
            drop_console: true
          }
        }
      }),
      // CSS 压缩
      new CssMinimizerPlugin()
    ]
  }
};
```

---

## 构建优化

### 5. 如何提高 Webpack 构建速度？

**答案：**

**1. 缩小搜索范围：**
```javascript
module.exports = {
  resolve: {
    // 减少扩展名搜索
    extensions: ['.js', '.jsx'],

    // 指定模块目录
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],

    // 路径别名
    alias: {
      '@': path.resolve(__dirname, 'src')
    },

    // 直接指定入口文件
    mainFields: ['main']
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        // 排除不需要处理的目录
        exclude: /node_modules/,
        // 或者只包含特定目录
        include: path.resolve(__dirname, 'src'),
        use: 'babel-loader'
      }
    ]
  }
};
```

**2. 使用缓存：**
```javascript
module.exports = {
  // Webpack 5 持久化缓存
  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename]
    }
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true // babel-loader 缓存
          }
        }
      }
    ]
  }
};
```

**3. 多进程构建：**
```javascript
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: 'thread-loader', // 多进程处理
            options: {
              workers: 4
            }
          },
          'babel-loader'
        ]
      }
    ]
  },

  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true // 多进程压缩
      })
    ]
  }
};
```

**4. DLL 动态链接库：**
```javascript
// webpack.dll.config.js
const webpack = require('webpack');

module.exports = {
  entry: {
    vendor: ['react', 'react-dom', 'lodash']
  },
  output: {
    path: path.resolve(__dirname, 'dll'),
    filename: '[name].dll.js',
    library: '[name]_dll'
  },
  plugins: [
    new webpack.DllPlugin({
      name: '[name]_dll',
      path: path.resolve(__dirname, 'dll/[name].manifest.json')
    })
  ]
};

// webpack.config.js
module.exports = {
  plugins: [
    new webpack.DllReferencePlugin({
      manifest: require('./dll/vendor.manifest.json')
    })
  ]
};
```

**5. 其他优化：**
```javascript
module.exports = {
  // 开发环境使用 eval 类型的 source map
  devtool: 'eval-cheap-module-source-map',

  // 外部扩展
  externals: {
    jquery: 'jQuery'
  },

  // 忽略大型库的解析
  module: {
    noParse: /jquery|lodash/
  }
};
```

---

### 6. 如何优化 Webpack 打包体积？

**答案：**

**1. 代码分割：**
```javascript
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      minSize: 20000,
      minChunks: 1,
      maxAsyncRequests: 30,
      maxInitialRequests: 30,
      cacheGroups: {
        // 第三方库
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          name: 'vendors',
          reuseExistingChunk: true
        },
        // 公共模块
        common: {
          minChunks: 2,
          priority: -20,
          name: 'common',
          reuseExistingChunk: true
        }
      }
    },
    // 运行时代码单独打包
    runtimeChunk: 'single'
  }
};
```

**2. Tree Shaking：**
```javascript
// package.json
{
  "sideEffects": false, // 标记无副作用
  // 或指定有副作用的文件
  "sideEffects": ["*.css", "*.scss"]
}

// webpack.config.js
module.exports = {
  mode: 'production', // 生产模式自动启用
  optimization: {
    usedExports: true, // 标记未使用的导出
    minimize: true     // 删除未使用代码
  }
};

// 代码中使用 ES6 模块语法
export { a, b };
import { a } from './module'; // 只导入 a，b 会被 tree shake
```

**3. 压缩：**
```javascript
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = {
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true, // 删除 console
            drop_debugger: true
          },
          output: {
            comments: false // 删除注释
          }
        },
        extractComments: false
      }),
      new CssMinimizerPlugin()
    ]
  }
};
```

**4. 图片优化：**
```javascript
// image-minimizer-webpack-plugin
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');

module.exports = {
  optimization: {
    minimizer: [
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          options: {
            plugins: [
              ['gifsicle', { interlaced: true }],
              ['jpegtran', { progressive: true }],
              ['optipng', { optimizationLevel: 5 }],
              ['svgo', { plugins: [{ removeViewBox: false }] }]
            ]
          }
        }
      })
    ]
  }
};
```

**5. Gzip 压缩：**
```javascript
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
  plugins: [
    new CompressionPlugin({
      algorithm: 'gzip',
      test: /\.(js|css|html|svg)$/,
      threshold: 10240, // 只处理大于 10KB 的文件
      minRatio: 0.8
    })
  ]
};
```

**6. 动态导入：**
```javascript
// 路由懒加载
const Home = () => import(/* webpackChunkName: "home" */ './Home');

// 条件加载
if (condition) {
  import(/* webpackChunkName: "feature" */ './feature').then(module => {
    module.default();
  });
}

// React.lazy
const LazyComponent = React.lazy(() =>
  import(/* webpackChunkName: "lazy" */ './LazyComponent')
);
```

---

### 7. Source Map 有哪些类型？如何选择？

**答案：**

| 类型 | 构建速度 | 重构建速度 | 生产环境 | 质量 |
|------|---------|-----------|---------|------|
| eval | 最快 | 最快 | 否 | 生成代码 |
| eval-source-map | 慢 | 较快 | 否 | 原始代码 |
| eval-cheap-source-map | 较快 | 快 | 否 | 转换代码（行） |
| eval-cheap-module-source-map | 慢 | 快 | 否 | 原始代码（行） |
| source-map | 最慢 | 最慢 | 是 | 原始代码 |
| cheap-source-map | 较快 | 慢 | 否 | 转换代码（行） |
| cheap-module-source-map | 慢 | 慢 | 否 | 原始代码（行） |
| hidden-source-map | 最慢 | 最慢 | 是 | 原始代码（不暴露） |
| nosources-source-map | 最慢 | 最慢 | 是 | 无源代码 |

**推荐配置：**
```javascript
module.exports = {
  // 开发环境
  devtool: 'eval-cheap-module-source-map',

  // 生产环境（需要调试）
  devtool: 'source-map',

  // 生产环境（安全）
  devtool: 'hidden-source-map', // 生成但不暴露
  devtool: false, // 不生成
};
```

---

## 高级特性

### 8. Webpack 的热更新（HMR）原理

**答案：**

HMR（Hot Module Replacement）允许在运行时更新模块而无需完全刷新页面。

**配置：**
```javascript
module.exports = {
  devServer: {
    hot: true
  }
};

// 模块中处理热更新
if (module.hot) {
  module.hot.accept('./module.js', () => {
    // 模块更新后的处理
    console.log('module.js 已更新');
  });
}
```

**原理：**
```
1. Webpack 编译，生成 manifest（变化文件列表）和 chunk（变化的代码）

2. 通过 WebSocket 通知浏览器有更新

3. 浏览器请求 manifest 和 chunk

4. HMR Runtime 接收更新
   - 检查是否能处理
   - 替换旧模块
   - 执行 accept 回调

5. 如果无法处理，回退到完全刷新
```

```
                    Webpack Compiler
                          │
                          ▼
    ┌─────────────────────────────────────────┐
    │         webpack-dev-server              │
    │  ┌─────────────────────────────────┐   │
    │  │        Express Server           │   │
    │  └─────────────────────────────────┘   │
    │  ┌─────────────────────────────────┐   │
    │  │        WebSocket Server         │───┼──> 推送更新通知
    │  └─────────────────────────────────┘   │
    │  ┌─────────────────────────────────┐   │
    │  │        内存文件系统              │   │
    │  └─────────────────────────────────┘   │
    └─────────────────────────────────────────┘
                          │
                          ▼
    ┌─────────────────────────────────────────┐
    │               Browser                   │
    │  ┌─────────────────────────────────┐   │
    │  │        HMR Runtime              │   │
    │  │  - 建立 WebSocket 连接          │   │
    │  │  - 接收更新通知                 │   │
    │  │  - 请求更新的模块               │   │
    │  │  - 替换模块                     │   │
    │  └─────────────────────────────────┘   │
    └─────────────────────────────────────────┘
```

---

### 9. Webpack 构建流程

**答案：**

```
1. 初始化
   - 读取配置文件
   - 合并命令行参数
   - 初始化 Compiler 对象
   - 加载插件

2. 编译
   - 从 Entry 开始
   - 调用 Loader 转换模块
   - 找出依赖
   - 递归处理依赖模块

3. 输出
   - 组装 Chunk
   - 输出到文件系统
```

**详细流程：**
```javascript
// 简化的构建流程
class Compiler {
  run() {
    // 1. 触发 beforeRun 钩子
    this.hooks.beforeRun.call(this);

    // 2. 触发 run 钩子
    this.hooks.run.call(this);

    // 3. 编译
    this.compile();
  }

  compile() {
    // 4. 创建 Compilation 对象
    const compilation = new Compilation(this);

    // 5. 触发 make 钩子，开始构建
    this.hooks.make.call(compilation);

    // 6. 从入口开始递归分析依赖
    compilation.addEntry(entry);

    // 7. 对每个模块调用 loader 处理
    compilation.buildModule(module);

    // 8. 触发 seal 钩子，生成 chunk
    this.hooks.seal.call(compilation);

    // 9. 触发 emit 钩子，输出文件
    this.hooks.emit.call(compilation);
  }
}
```

**Tapable 钩子系统：**
```javascript
const { SyncHook, AsyncSeriesHook } = require('tapable');

class Compiler {
  constructor() {
    this.hooks = {
      run: new SyncHook(),
      emit: new AsyncSeriesHook(['compilation']),
      done: new SyncHook(['stats'])
    };
  }
}

// 插件使用钩子
class MyPlugin {
  apply(compiler) {
    compiler.hooks.emit.tap('MyPlugin', (compilation) => {
      // 同步处理
    });

    compiler.hooks.emit.tapAsync('MyPlugin', (compilation, callback) => {
      // 异步处理
      setTimeout(() => callback(), 1000);
    });

    compiler.hooks.emit.tapPromise('MyPlugin', (compilation) => {
      return new Promise(resolve => {
        setTimeout(resolve, 1000);
      });
    });
  }
}
```

---

### 10. 如何编写自定义 Loader 和 Plugin？

**答案：**

**自定义 Loader：**
```javascript
// my-loader.js
const loaderUtils = require('loader-utils');
const schema = require('./options.json');

module.exports = function(source) {
  // 获取配置
  const options = this.getOptions(schema);

  // 同步 Loader
  const result = transform(source, options);
  return result;
};

// 异步 Loader
module.exports = function(source) {
  const callback = this.async();

  asyncTransform(source).then(result => {
    callback(null, result);
  }).catch(err => {
    callback(err);
  });
};

// raw loader（处理二进制）
module.exports = function(source) {
  // source 是 Buffer
  return source;
};
module.exports.raw = true;

// pitch 函数
module.exports.pitch = function(remainingRequest, precedingRequest, data) {
  // 在正常执行前调用
  data.value = 'shared'; // 传递数据
};

// 使用
{
  test: /\.txt$/,
  use: {
    loader: path.resolve(__dirname, 'my-loader.js'),
    options: {
      name: 'value'
    }
  }
}
```

**自定义 Plugin：**
```javascript
// my-plugin.js
class MyPlugin {
  constructor(options) {
    this.options = options;
  }

  apply(compiler) {
    // 注册钩子
    compiler.hooks.compilation.tap('MyPlugin', (compilation) => {
      // 在 compilation 创建后

      compilation.hooks.optimizeAssets.tap('MyPlugin', (assets) => {
        // 优化资源
        for (const name in assets) {
          const content = assets[name].source();
          const optimized = optimize(content);
          assets[name] = {
            source: () => optimized,
            size: () => optimized.length
          };
        }
      });
    });

    // 异步钩子
    compiler.hooks.emit.tapAsync('MyPlugin', (compilation, callback) => {
      // 生成额外的文件
      const content = JSON.stringify(this.options);
      compilation.assets['config.json'] = {
        source: () => content,
        size: () => content.length
      };
      callback();
    });

    compiler.hooks.done.tap('MyPlugin', (stats) => {
      console.log('构建完成');
    });
  }
}

module.exports = MyPlugin;

// 使用
plugins: [
  new MyPlugin({ name: 'value' })
]
```

**实际示例 - 生成版本文件：**
```javascript
class VersionPlugin {
  constructor(options) {
    this.options = options || {};
  }

  apply(compiler) {
    compiler.hooks.emit.tapAsync('VersionPlugin', (compilation, callback) => {
      const version = {
        version: this.options.version || '1.0.0',
        buildTime: new Date().toISOString(),
        hash: compilation.hash
      };

      const content = JSON.stringify(version, null, 2);

      compilation.assets['version.json'] = {
        source: () => content,
        size: () => content.length
      };

      callback();
    });
  }
}
```

---

### 11. Module Federation（模块联邦）

**答案：**

Module Federation 是 Webpack 5 的新特性，允许多个独立构建的应用共享代码。

```javascript
// app1 - 暴露模块
const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'app1',
      filename: 'remoteEntry.js',
      exposes: {
        './Button': './src/components/Button',
        './utils': './src/utils'
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true }
      }
    })
  ]
};

// app2 - 消费模块
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'app2',
      remotes: {
        app1: 'app1@http://localhost:3001/remoteEntry.js'
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true }
      }
    })
  ]
};

// app2 中使用 app1 的模块
import Button from 'app1/Button';
import { formatDate } from 'app1/utils';

// 动态导入
const Button = React.lazy(() => import('app1/Button'));
```

**shared 配置：**
```javascript
shared: {
  react: {
    singleton: true,     // 只使用一个版本
    strictVersion: true, // 严格版本匹配
    requiredVersion: '^17.0.0',
    eager: true          // 立即加载，不异步
  }
}
```

---

### 12. Webpack 5 新特性

**答案：**

**1. 持久化缓存：**
```javascript
module.exports = {
  cache: {
    type: 'filesystem',
    cacheDirectory: path.resolve(__dirname, '.temp_cache'),
    buildDependencies: {
      config: [__filename]
    }
  }
};
```

**2. 资源模块（Asset Modules）：**
```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.png$/,
        type: 'asset/resource' // 替代 file-loader
      },
      {
        test: /\.svg$/,
        type: 'asset/inline' // 替代 url-loader
      },
      {
        test: /\.txt$/,
        type: 'asset/source' // 替代 raw-loader
      },
      {
        test: /\.jpg$/,
        type: 'asset', // 自动选择
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024
          }
        }
      }
    ]
  }
};
```

**3. Module Federation（见上文）**

**4. 更好的 Tree Shaking：**
```javascript
// 支持嵌套的 tree shaking
import { a } from './module';
// module.js 中未使用的嵌套导出也会被移除

// 支持 CommonJS tree shaking
module.exports = {
  optimization: {
    providedExports: true,
    usedExports: true,
    innerGraph: true
  }
};
```

**5. Top Level Await：**
```javascript
// 模块顶层使用 await
const data = await fetch('/api/data').then(r => r.json());
export default data;
```

**6. 输出清理：**
```javascript
module.exports = {
  output: {
    clean: true // 替代 clean-webpack-plugin
  }
};
```

**7. 移除的功能：**
- 移除 Node.js polyfills（需要手动添加）
- 移除 require.ensure
- 移除 module.loaders

```javascript
// 需要手动配置 polyfills
module.exports = {
  resolve: {
    fallback: {
      path: require.resolve('path-browserify'),
      stream: require.resolve('stream-browserify'),
      buffer: require.resolve('buffer/')
    }
  },
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser'
    })
  ]
};
```

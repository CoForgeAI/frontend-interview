---
layout: home

hero:
  name: "前端面试题大全"
  text: "系统全面的前端面试准备资料"
  tagline: 涵盖 HTML、CSS、JavaScript、Vue、React、TypeScript 等 16 个核心专题
  image:
    src: /hero.svg
    alt: 前端面试
  actions:
    - theme: brand
      text: 开始学习
      link: /docs/01-HTML
    - theme: alt
      text: 在 GitHub 上查看
      link: https://github.com/your-username/frontend-interview

features:
  - icon: 📚
    title: 基础知识
    details: HTML5、CSS3、JavaScript 核心概念，ES6+ 新特性，TypeScript 类型系统
    link: /docs/01-HTML
  - icon: ⚡
    title: 主流框架
    details: Vue 2/3 响应式原理、React Hooks、Redux/Pinia 状态管理
    link: /docs/06-Vue
  - icon: 🛠️
    title: 构建工具
    details: Webpack 配置优化、Vite 原理与实践、工程化最佳实践
    link: /docs/08-Webpack
  - icon: 🌐
    title: 浏览器与网络
    details: 浏览器渲染原理、HTTP/HTTPS、TCP/IP、跨域解决方案
    link: /docs/10-Browser
  - icon: 🚀
    title: 性能优化
    details: Core Web Vitals、首屏优化、资源优化、性能监控
    link: /docs/12-Performance
  - icon: 🔒
    title: 前端安全
    details: XSS、CSRF、CSP、点击劫持防护、安全响应头配置
    link: /docs/13-Security
  - icon: 📊
    title: 算法基础
    details: 排序算法、数据结构、LeetCode 高频题、手写代码题
    link: /docs/14-Algorithm
  - icon: 🏗️
    title: 工程化实践
    details: Monorepo、CI/CD、微前端、设计模式、项目架构
    link: /docs/16-Engineering
---

<style>
:root {
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: -webkit-linear-gradient(120deg, #bd34fe 30%, #41d1ff);

  --vp-home-hero-image-background-image: linear-gradient(-45deg, #bd34fe 50%, #47caff 50%);
  --vp-home-hero-image-filter: blur(44px);
}

@media (min-width: 640px) {
  :root {
    --vp-home-hero-image-filter: blur(56px);
  }
}

@media (min-width: 960px) {
  :root {
    --vp-home-hero-image-filter: blur(68px);
  }
}
</style>

import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '前端面试题大全',
  description: '全面的前端面试准备资料，涵盖前端开发的各个核心领域',
  lang: 'zh-CN',

  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#3eaf7c' }],
    ['meta', { name: 'keywords', content: '前端面试,JavaScript,Vue,React,TypeScript,CSS,HTML' }],
    // 防止搜索引擎索引
    ['meta', { name: 'robots', content: 'noindex, nofollow' }],
  ],

  // 如果部署到 GitHub Pages 的子路径，需要设置 base
  base: '/frontend-interview/',

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: '首页', link: '/' },
      {
        text: '基础知识',
        items: [
          { text: 'HTML', link: '/docs/01-HTML' },
          { text: 'CSS', link: '/docs/02-CSS' },
          { text: 'JavaScript', link: '/docs/03-JavaScript' },
          { text: 'ES6+', link: '/docs/04-ES6' },
          { text: 'TypeScript', link: '/docs/05-TypeScript' },
        ]
      },
      {
        text: '框架',
        items: [
          { text: 'Vue', link: '/docs/06-Vue' },
          { text: 'React', link: '/docs/07-React' },
          { text: 'Next.js', link: '/docs/17-NextJS' },
        ]
      },
      {
        text: '工程化',
        items: [
          { text: 'Webpack', link: '/docs/08-Webpack' },
          { text: 'Vite', link: '/docs/09-Vite' },
          { text: 'Node.js', link: '/docs/15-NodeJS' },
          { text: '工程化实践', link: '/docs/16-Engineering' },
        ]
      },
      {
        text: '进阶',
        items: [
          { text: '浏览器原理', link: '/docs/10-Browser' },
          { text: '网络协议', link: '/docs/11-Network' },
          { text: '性能优化', link: '/docs/12-Performance' },
          { text: '前端安全', link: '/docs/13-Security' },
          { text: '算法', link: '/docs/14-Algorithm' },
        ]
      },
      { text: '🔥 大厂真题', link: '/docs/18-RealInterview' },
      { text: '🌐 Web3', link: '/docs/19-Web3' },
    ],

    sidebar: {
      '/docs/': [
        {
          text: '🔥 面试专区',
          collapsed: false,
          items: [
            { text: '大厂面试真题', link: '/docs/18-RealInterview' },
            { text: 'Web3 前端面试', link: '/docs/19-Web3' },
          ]
        },
        {
          text: '基础知识',
          collapsed: false,
          items: [
            { text: 'HTML', link: '/docs/01-HTML' },
            { text: 'CSS', link: '/docs/02-CSS' },
            { text: 'JavaScript', link: '/docs/03-JavaScript' },
            { text: 'ES6+', link: '/docs/04-ES6' },
            { text: 'TypeScript', link: '/docs/05-TypeScript' },
          ]
        },
        {
          text: '框架与库',
          collapsed: false,
          items: [
            { text: 'Vue', link: '/docs/06-Vue' },
            { text: 'React', link: '/docs/07-React' },
            { text: 'Next.js', link: '/docs/17-NextJS' },
          ]
        },
        {
          text: '构建工具',
          collapsed: false,
          items: [
            { text: 'Webpack', link: '/docs/08-Webpack' },
            { text: 'Vite', link: '/docs/09-Vite' },
          ]
        },
        {
          text: '浏览器与网络',
          collapsed: false,
          items: [
            { text: '浏览器原理', link: '/docs/10-Browser' },
            { text: '网络协议', link: '/docs/11-Network' },
          ]
        },
        {
          text: '进阶专题',
          collapsed: false,
          items: [
            { text: '性能优化', link: '/docs/12-Performance' },
            { text: '前端安全', link: '/docs/13-Security' },
            { text: '算法与数据结构', link: '/docs/14-Algorithm' },
          ]
        },
        {
          text: '后端与工程化',
          collapsed: false,
          items: [
            { text: 'Node.js', link: '/docs/15-NodeJS' },
            { text: '工程化实践', link: '/docs/16-Engineering' },
          ]
        },
        {
          text: '📝 笔记',
          collapsed: false,
          items: [
            { text: 'Git 操作指南', link: '/docs/Git操作指南' },
            { text: 'GitLab CI/CD 部署', link: '/docs/GitLab-CICD-部署指南' },
            { text: '部署笔记', link: '/docs/部署笔记' },
            { text: '个人笔记', link: '/docs/个人笔记' },
          ]
        },
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/your-username/frontend-interview' }
    ],

    footer: {
      message: '基于 MIT 许可发布',
      copyright: 'Copyright © 2024 前端面试题大全'
    },

    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: '搜索文档',
            buttonAriaLabel: '搜索文档'
          },
          modal: {
            noResultsText: '无法找到相关结果',
            resetButtonTitle: '清除查询条件',
            footer: {
              selectText: '选择',
              navigateText: '切换',
              closeText: '关闭'
            }
          }
        }
      }
    },

    outline: {
      level: [2, 3],
      label: '页面导航'
    },

    docFooter: {
      prev: '上一篇',
      next: '下一篇'
    },

    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'short'
      }
    },

    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '主题',
  },

  markdown: {
    lineNumbers: true,
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    }
  },

  // 忽略死链接检查（临时）
  ignoreDeadLinks: true,

  lastUpdated: true,
})

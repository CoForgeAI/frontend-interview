# Next.js 面试题

## 目录

1. [基础概念](#基础概念)
2. [路由系统](#路由系统)
3. [数据获取](#数据获取)
4. [渲染模式](#渲染模式)
5. [性能优化](#性能优化)
6. [API Routes](#api-routes)
7. [部署与配置](#部署与配置)
8. [App Router (Next.js 13+)](#app-router-nextjs-13)

---

## 基础概念

### 1. 什么是 Next.js？它解决了什么问题？

**答案：**

Next.js 是一个基于 React 的全栈框架，由 Vercel 开发维护。

**解决的问题：**

| 问题 | Next.js 解决方案 |
|------|-----------------|
| React SPA 的 SEO 问题 | 提供 SSR/SSG 支持 |
| 首屏加载慢 | 服务端渲染 + 自动代码分割 |
| 路由配置繁琐 | 基于文件系统的路由 |
| 构建配置复杂 | 零配置开箱即用 |
| 全栈开发需要分离后端 | 内置 API Routes |

**核心特性：**
- 混合渲染（SSR、SSG、ISR、CSR）
- 文件系统路由
- 自动代码分割
- 内置 CSS/Sass 支持
- 图片优化（next/image）
- API 路由
- 中间件支持

---

### 2. Next.js 的 pages 目录和 app 目录有什么区别？

**答案：**

| 特性 | Pages Router (pages/) | App Router (app/) |
|------|----------------------|-------------------|
| 引入版本 | Next.js 早期 | Next.js 13+ |
| 路由定义 | 文件名即路由 | 文件夹 + page.js |
| 布局 | _app.js, _document.js | layout.js（嵌套布局） |
| 数据获取 | getServerSideProps 等 | async 组件 + fetch |
| 组件类型 | 默认客户端组件 | 默认服务端组件 |
| 流式渲染 | 不支持 | 支持 Streaming |
| 加载状态 | 手动处理 | loading.js |
| 错误处理 | _error.js | error.js（细粒度） |

```
# Pages Router 结构
pages/
  index.js        → /
  about.js        → /about
  blog/[id].js    → /blog/:id

# App Router 结构
app/
  page.js         → /
  about/page.js   → /about
  blog/[id]/page.js → /blog/:id
  layout.js       → 根布局
```

---

### 3. 解释 next/image 组件的优势

**答案：**

`next/image` 是 Next.js 内置的图片优化组件。

**主要优势：**

```jsx
import Image from 'next/image'

// 使用示例
<Image
  src="/photo.jpg"
  alt="照片"
  width={500}
  height={300}
  priority        // 首屏图片优先加载
  placeholder="blur"
  blurDataURL="data:image/..."
/>
```

| 优势 | 说明 |
|------|------|
| **自动优化** | 自动转换为 WebP/AVIF 格式 |
| **响应式** | 根据设备自动提供合适尺寸 |
| **懒加载** | 默认图片进入视口才加载 |
| **防止 CLS** | 自动预留空间，避免布局偏移 |
| **远程图片优化** | 可优化外部 URL 图片 |
| **缓存** | 自动缓存优化后的图片 |

**配置远程图片域名：**

```js
// next.config.js
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'example.com',
      },
    ],
  },
}
```

---

### 4. next/link 和 HTML 的 a 标签有什么区别？

**答案：**

```jsx
import Link from 'next/link'

// next/link 用法
<Link href="/about">关于我们</Link>

// 带参数
<Link href={{ pathname: '/blog', query: { id: 1 } }}>
  博客
</Link>
```

**区别：**

| 特性 | `<Link>` | `<a>` |
|------|----------|-------|
| 页面跳转 | 客户端导航（SPA） | 整页刷新 |
| 预加载 | 自动预加载链接页面 | 无 |
| 性能 | 只更新变化部分 | 重新加载整个页面 |
| 状态保持 | 保持 React 状态 | 状态丢失 |
| 路由历史 | 正确处理浏览器历史 | 标准行为 |

**Link 的预加载行为：**
- 生产环境下，链接进入视口时自动预加载
- 可通过 `prefetch={false}` 禁用

```jsx
<Link href="/heavy-page" prefetch={false}>
  大页面
</Link>
```

---

## 路由系统

### 5. 解释 Next.js 的动态路由

**答案：**

Next.js 使用方括号 `[]` 定义动态路由段。

**Pages Router：**

```
pages/
  blog/[slug].js      → /blog/:slug
  shop/[...slug].js   → /shop/* (捕获所有)
  [[...slug]].js      → 可选捕获所有
```

```jsx
// pages/blog/[slug].js
import { useRouter } from 'next/router'

export default function Post() {
  const router = useRouter()
  const { slug } = router.query  // 获取动态参数

  return <div>文章: {slug}</div>
}
```

**App Router：**

```
app/
  blog/[slug]/page.js     → /blog/:slug
  shop/[...slug]/page.js  → /shop/*
  [[...slug]]/page.js     → 可选捕获所有
```

```jsx
// app/blog/[slug]/page.js
export default function Post({ params }) {
  return <div>文章: {params.slug}</div>
}

// 生成静态参数
export async function generateStaticParams() {
  const posts = await getPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}
```

**路由匹配示例：**

| 路由文件 | 匹配路径 | params |
|----------|---------|--------|
| `[id].js` | `/123` | `{ id: '123' }` |
| `[...slug].js` | `/a/b/c` | `{ slug: ['a','b','c'] }` |
| `[[...slug]].js` | `/` 或 `/a/b` | `{ slug: undefined }` 或 `{ slug: ['a','b'] }` |

---

### 6. 如何实现路由守卫/中间件？

**答案：**

Next.js 使用 `middleware.js` 文件实现路由中间件。

```js
// middleware.js (项目根目录)
import { NextResponse } from 'next/server'

export function middleware(request) {
  const token = request.cookies.get('token')
  const { pathname } = request.nextUrl

  // 未登录访问受保护页面，重定向到登录
  if (pathname.startsWith('/dashboard') && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 已登录访问登录页，重定向到首页
  if (pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // 添加自定义 header
  const response = NextResponse.next()
  response.headers.set('x-custom-header', 'hello')

  return response
}

// 配置中间件匹配路径
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/api/:path*',
  ],
}
```

**中间件可以做的事：**
- 认证/授权检查
- 重定向/重写 URL
- 修改请求/响应头
- A/B 测试
- 地理位置路由
- Bot 检测

---

### 7. 解释路由组 (Route Groups) 的作用

**答案：**

路由组使用 `(folderName)` 语法，用于组织路由而不影响 URL 路径。

```
app/
  (marketing)/
    about/page.js      → /about
    contact/page.js    → /contact
    layout.js          → marketing 布局
  (shop)/
    products/page.js   → /products
    cart/page.js       → /cart
    layout.js          → shop 布局
  (auth)/
    login/page.js      → /login
    register/page.js   → /register
```

**用途：**

1. **不同布局分组** - 同一层级的页面使用不同布局
2. **逻辑组织** - 按功能模块组织代码
3. **团队协作** - 不同团队负责不同路由组

```jsx
// app/(marketing)/layout.js
export default function MarketingLayout({ children }) {
  return (
    <div className="marketing-theme">
      <MarketingHeader />
      {children}
      <MarketingFooter />
    </div>
  )
}

// app/(shop)/layout.js
export default function ShopLayout({ children }) {
  return (
    <div className="shop-theme">
      <ShopHeader />
      <CartProvider>
        {children}
      </CartProvider>
    </div>
  )
}
```

---

## 数据获取

### 8. 解释 getStaticProps、getServerSideProps、getStaticPaths 的区别

**答案：**

这些是 Pages Router 中的数据获取方法。

**getStaticProps (SSG)：**

```jsx
// 构建时获取数据
export async function getStaticProps() {
  const res = await fetch('https://api.example.com/posts')
  const posts = await res.json()

  return {
    props: { posts },
    revalidate: 60, // ISR: 60秒后重新生成
  }
}

export default function Blog({ posts }) {
  return <div>{posts.map(p => <Post key={p.id} {...p} />)}</div>
}
```

**getServerSideProps (SSR)：**

```jsx
// 每次请求时获取数据
export async function getServerSideProps(context) {
  const { req, res, params, query } = context
  const token = req.cookies.token

  const data = await fetchUserData(token)

  if (!data) {
    return { redirect: { destination: '/login', permanent: false } }
  }

  return { props: { data } }
}
```

**getStaticPaths：**

```jsx
// 定义动态路由的预生成路径
export async function getStaticPaths() {
  const posts = await getAllPosts()

  return {
    paths: posts.map(post => ({
      params: { id: post.id.toString() }
    })),
    fallback: 'blocking', // false | true | 'blocking'
  }
}

export async function getStaticProps({ params }) {
  const post = await getPostById(params.id)
  return { props: { post } }
}
```

**对比表：**

| 方法 | 执行时机 | 适用场景 | 数据新鲜度 |
|------|---------|---------|-----------|
| getStaticProps | 构建时 | 博客、文档 | 构建时 / ISR |
| getServerSideProps | 每次请求 | 用户数据、实时数据 | 实时 |
| getStaticPaths | 构建时 | 动态路由预渲染 | - |

**fallback 选项：**

| 值 | 行为 |
|----|------|
| `false` | 未预渲染路径返回 404 |
| `true` | 未预渲染路径显示 fallback，后台生成 |
| `'blocking'` | 未预渲染路径等待生成完成 |

---

### 9. App Router 中如何获取数据？

**答案：**

App Router 使用 async 服务端组件和扩展的 fetch API。

**服务端组件直接 fetch：**

```jsx
// app/posts/page.js
// 这是服务端组件，可以直接 async/await
export default async function PostsPage() {
  const res = await fetch('https://api.example.com/posts', {
    cache: 'force-cache',  // 默认: 类似 getStaticProps
  })
  const posts = await res.json()

  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  )
}
```

**fetch 缓存选项：**

```jsx
// 静态数据 (类似 getStaticProps)
fetch(url, { cache: 'force-cache' })

// 动态数据 (类似 getServerSideProps)
fetch(url, { cache: 'no-store' })

// ISR - 定时重新验证
fetch(url, { next: { revalidate: 60 } })

// 基于标签的重新验证
fetch(url, { next: { tags: ['posts'] } })
```

**使用数据库或 ORM：**

```jsx
// app/users/[id]/page.js
import { db } from '@/lib/db'

export default async function UserPage({ params }) {
  const user = await db.user.findUnique({
    where: { id: params.id }
  })

  return <UserProfile user={user} />
}
```

**并行数据获取：**

```jsx
export default async function Page() {
  // 并行获取，提高性能
  const [posts, categories] = await Promise.all([
    getPosts(),
    getCategories(),
  ])

  return <Blog posts={posts} categories={categories} />
}
```

---

### 10. 什么是 ISR（增量静态再生成）？

**答案：**

ISR 允许在不重新构建整个站点的情况下更新静态页面。

**Pages Router 实现：**

```jsx
export async function getStaticProps() {
  const data = await fetchData()

  return {
    props: { data },
    revalidate: 60, // 60秒后重新验证
  }
}
```

**App Router 实现：**

```jsx
// 方式1: fetch revalidate
async function getData() {
  const res = await fetch('https://api.example.com/data', {
    next: { revalidate: 60 }
  })
  return res.json()
}

// 方式2: 路由段配置
export const revalidate = 60
```

**ISR 工作流程：**

```
1. 用户 A 访问页面 → 返回缓存的静态页面
2. 60秒后，用户 B 访问 → 返回旧页面，后台触发重新生成
3. 重新生成完成 → 缓存新页面
4. 用户 C 访问 → 返回新生成的页面
```

**按需重新验证 (On-Demand Revalidation)：**

```jsx
// app/api/revalidate/route.js
import { revalidatePath, revalidateTag } from 'next/cache'

export async function POST(request) {
  const { path, tag, secret } = await request.json()

  if (secret !== process.env.REVALIDATE_SECRET) {
    return Response.json({ error: 'Invalid secret' }, { status: 401 })
  }

  if (path) {
    revalidatePath(path)  // 重新验证特定路径
  }

  if (tag) {
    revalidateTag(tag)    // 重新验证特定标签
  }

  return Response.json({ revalidated: true })
}
```

---

## 渲染模式

### 11. 解释 Next.js 的四种渲染模式

**答案：**

| 模式 | 全称 | 渲染时机 | 适用场景 |
|------|------|---------|---------|
| **SSG** | Static Site Generation | 构建时 | 博客、文档、营销页 |
| **SSR** | Server-Side Rendering | 每次请求 | 个性化内容、实时数据 |
| **ISR** | Incremental Static Regeneration | 构建时 + 按需更新 | 大型站点、电商 |
| **CSR** | Client-Side Rendering | 浏览器端 | 需要频繁交互的组件 |

**选择指南：**

```
数据是否个性化？
├── 是 → SSR 或 CSR
└── 否 → 数据多久变化？
         ├── 几乎不变 → SSG
         ├── 定期变化 → ISR
         └── 实时变化 → SSR
```

**混合使用示例：**

```jsx
// 页面级别 SSR/SSG
export async function getServerSideProps() { ... }

// 页面内 CSR 组件
'use client'
function LiveComments() {
  const { data } = useSWR('/api/comments', fetcher)
  return <Comments data={data} />
}
```

---

### 12. 什么是服务端组件 (Server Components)？

**答案：**

服务端组件是 React 18 引入、Next.js 13+ 默认启用的特性，组件在服务端渲染，不发送 JavaScript 到客户端。

**服务端组件特点：**

```jsx
// app/page.js - 默认是服务端组件
import { db } from '@/lib/db'
import { formatDate } from '@/lib/utils'

export default async function Page() {
  // 可以直接访问数据库
  const posts = await db.post.findMany()

  // 可以使用 Node.js API
  // 可以安全使用敏感信息（API keys）

  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>
          {post.title} - {formatDate(post.date)}
        </li>
      ))}
    </ul>
  )
}
```

**服务端组件 vs 客户端组件：**

| 特性 | 服务端组件 | 客户端组件 |
|------|-----------|-----------|
| JS 发送到浏览器 | ❌ 不发送 | ✅ 发送 |
| 直接访问后端 | ✅ 可以 | ❌ 需要 API |
| useState/useEffect | ❌ 不支持 | ✅ 支持 |
| 事件处理 | ❌ 不支持 | ✅ 支持 |
| 浏览器 API | ❌ 不支持 | ✅ 支持 |
| 首屏加载 | 快 | 相对慢 |

**客户端组件声明：**

```jsx
'use client'  // 必须在文件顶部

import { useState } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

**组合使用：**

```jsx
// app/page.js (服务端组件)
import Counter from './Counter'  // 客户端组件
import { db } from '@/lib/db'

export default async function Page() {
  const posts = await db.post.findMany()

  return (
    <div>
      {/* 服务端渲染的静态内容 */}
      <h1>我的博客</h1>
      <ul>{posts.map(p => <li key={p.id}>{p.title}</li>)}</ul>

      {/* 客户端交互组件 */}
      <Counter />
    </div>
  )
}
```

---

### 13. 什么是 Streaming 和 Suspense？

**答案：**

Streaming 允许逐步发送 UI 到客户端，配合 Suspense 可以先显示部分内容。

**工作原理：**

```
传统 SSR:
[等待全部数据] → [渲染全部 HTML] → [发送] → [显示]

Streaming:
[壳 HTML] → [发送并显示] → [数据1完成] → [流式发送] → [数据2完成] → [流式发送]
```

**使用 loading.js：**

```
app/
  dashboard/
    loading.js    ← 自动作为 Suspense 边界
    page.js
```

```jsx
// app/dashboard/loading.js
export default function Loading() {
  return <DashboardSkeleton />
}

// app/dashboard/page.js
export default async function Dashboard() {
  const data = await fetchDashboardData()  // 慢请求
  return <DashboardContent data={data} />
}
```

**手动 Suspense 边界：**

```jsx
import { Suspense } from 'react'

export default function Page() {
  return (
    <div>
      <h1>Dashboard</h1>

      {/* 快速加载的部分立即显示 */}
      <UserInfo />

      {/* 慢的部分独立加载 */}
      <Suspense fallback={<ChartSkeleton />}>
        <SlowChart />
      </Suspense>

      <Suspense fallback={<TableSkeleton />}>
        <SlowTable />
      </Suspense>
    </div>
  )
}
```

**并行流式渲染：**

```jsx
async function SlowChart() {
  const data = await fetchChartData()  // 3秒
  return <Chart data={data} />
}

async function SlowTable() {
  const data = await fetchTableData()  // 5秒
  return <Table data={data} />
}

// 两个组件并行加载，谁先完成谁先显示
```

---

## 性能优化

### 14. Next.js 有哪些内置的性能优化？

**答案：**

| 优化项 | 说明 |
|--------|------|
| **自动代码分割** | 每个页面只加载必要的 JS |
| **图片优化** | next/image 自动优化 |
| **字体优化** | next/font 自动优化字体加载 |
| **脚本优化** | next/script 控制第三方脚本加载 |
| **链接预加载** | next/link 自动预加载 |
| **静态导出** | 可导出纯静态 HTML |
| **Tree Shaking** | 自动移除未使用代码 |
| **压缩** | 自动 gzip/brotli 压缩 |

**字体优化示例：**

```jsx
// app/layout.js
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  )
}
```

**脚本优化示例：**

```jsx
import Script from 'next/script'

export default function Page() {
  return (
    <>
      {/* 页面交互后加载 */}
      <Script
        src="https://analytics.example.com/script.js"
        strategy="lazyOnload"
      />

      {/* 页面加载完成后立即加载 */}
      <Script
        src="https://widget.example.com/widget.js"
        strategy="afterInteractive"
      />

      {/* 阻塞渲染，最先加载 */}
      <Script
        src="https://critical.example.com/critical.js"
        strategy="beforeInteractive"
      />
    </>
  )
}
```

---

### 15. 如何优化 Next.js 应用的 LCP 和 FCP？

**答案：**

**LCP (Largest Contentful Paint) 优化：**

```jsx
// 1. 首屏图片添加 priority
import Image from 'next/image'

<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority  // 关键：优先加载
/>

// 2. 预加载关键资源
// app/layout.js
export const metadata = {
  other: {
    'link': [
      { rel: 'preload', href: '/critical.css', as: 'style' },
      { rel: 'preconnect', href: 'https://api.example.com' },
    ]
  }
}

// 3. 避免首屏大量客户端渲染
// 使用服务端组件减少客户端 JS
```

**FCP (First Contentful Paint) 优化：**

```jsx
// 1. 使用 Streaming 和 Suspense
import { Suspense } from 'react'

export default function Page() {
  return (
    <>
      {/* 立即显示静态内容 */}
      <Header />

      {/* 异步内容延迟加载 */}
      <Suspense fallback={<Skeleton />}>
        <AsyncContent />
      </Suspense>
    </>
  )
}

// 2. 减少阻塞的 CSS
// 内联关键 CSS，延迟加载非关键 CSS

// 3. 使用静态生成
export const dynamic = 'force-static'
```

**通用优化：**

```jsx
// 动态导入非关键组件
import dynamic from 'next/dynamic'

const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <ChartSkeleton />,
  ssr: false,  // 仅客户端渲染
})
```

---

## API Routes

### 16. 如何创建 API 路由？

**答案：**

**Pages Router (pages/api/)：**

```js
// pages/api/users.js
export default function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json({ users: [] })
  } else if (req.method === 'POST') {
    const user = req.body
    res.status(201).json({ user })
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
```

**App Router (app/api/)：**

```js
// app/api/users/route.js
import { NextResponse } from 'next/server'

export async function GET(request) {
  const users = await db.user.findMany()
  return NextResponse.json({ users })
}

export async function POST(request) {
  const body = await request.json()
  const user = await db.user.create({ data: body })
  return NextResponse.json({ user }, { status: 201 })
}
```

**动态路由 API：**

```js
// app/api/users/[id]/route.js
export async function GET(request, { params }) {
  const { id } = params
  const user = await db.user.findUnique({ where: { id } })

  if (!user) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    )
  }

  return NextResponse.json({ user })
}

export async function DELETE(request, { params }) {
  await db.user.delete({ where: { id: params.id } })
  return new NextResponse(null, { status: 204 })
}
```

**获取请求信息：**

```js
export async function GET(request) {
  // URL 参数
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query')

  // Headers
  const token = request.headers.get('authorization')

  // Cookies
  const theme = request.cookies.get('theme')

  return NextResponse.json({ query, theme })
}
```

---

### 17. 如何在 API Route 中处理认证？

**答案：**

```js
// lib/auth.js
import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'

export async function getUser() {
  const cookieStore = cookies()
  const token = cookieStore.get('token')?.value

  if (!token) return null

  try {
    const decoded = verify(token, process.env.JWT_SECRET)
    return decoded
  } catch {
    return null
  }
}

export function requireAuth(handler) {
  return async (request, context) => {
    const user = await getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return handler(request, { ...context, user })
  }
}
```

```js
// app/api/protected/route.js
import { getUser } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET() {
  const user = await getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const data = await getProtectedData(user.id)
  return NextResponse.json({ data })
}
```

**使用中间件全局认证：**

```js
// middleware.js
import { NextResponse } from 'next/server'

export function middleware(request) {
  const token = request.cookies.get('token')

  if (request.nextUrl.pathname.startsWith('/api/protected')) {
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
  }

  return NextResponse.next()
}
```

---

## 部署与配置

### 18. next.config.js 常用配置有哪些？

**答案：**

```js
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // 严格模式
  reactStrictMode: true,

  // 图片域名配置
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.example.com' },
    ],
  },

  // 环境变量（暴露到浏览器）
  env: {
    API_URL: process.env.API_URL,
  },

  // 重定向
  async redirects() {
    return [
      {
        source: '/old-page',
        destination: '/new-page',
        permanent: true,  // 301
      },
    ]
  },

  // URL 重写
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://api.example.com/:path*',
      },
    ]
  },

  // 自定义 headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
        ],
      },
    ]
  },

  // Webpack 配置扩展
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback.fs = false
    }
    return config
  },

  // 输出模式
  output: 'standalone',  // Docker 部署推荐

  // 基础路径（部署到子目录）
  basePath: '/app',

  // 禁用 x-powered-by header
  poweredByHeader: false,

  // 实验性功能
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig
```

---

### 19. 如何部署 Next.js 应用？

**答案：**

**1. Vercel（推荐）：**

```bash
npm i -g vercel
vercel
```

**2. Docker 部署：**

```dockerfile
# Dockerfile
FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]
```

```js
// next.config.js
module.exports = {
  output: 'standalone',
}
```

**3. 静态导出：**

```js
// next.config.js
module.exports = {
  output: 'export',
}
```

```bash
npm run build
# 输出到 out/ 目录，可部署到任何静态托管
```

**4. Node.js 服务器：**

```bash
npm run build
npm start  # 启动生产服务器
```

**5. PM2 部署：**

```js
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'nextjs-app',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
  }],
}
```

```bash
pm2 start ecosystem.config.js
```

---

## App Router (Next.js 13+)

### 20. 解释 App Router 的特殊文件约定

**答案：**

```
app/
  layout.js      # 布局（必需根布局）
  page.js        # 页面 UI
  loading.js     # 加载 UI (Suspense)
  error.js       # 错误边界
  not-found.js   # 404 页面
  template.js    # 重新挂载的布局
  default.js     # 并行路由默认 UI
  route.js       # API 端点

  # 特殊命名文件夹
  (group)/       # 路由组（不影响 URL）
  @folder/       # 命名插槽（并行路由）
  _folder/       # 私有文件夹（不参与路由）
```

**layout.js vs template.js：**

```jsx
// layout.js - 导航时保持状态
export default function Layout({ children }) {
  return <div>{children}</div>  // 切换路由时不重新挂载
}

// template.js - 导航时重新挂载
export default function Template({ children }) {
  return <div>{children}</div>  // 切换路由时重新挂载
}
```

**error.js：**

```jsx
'use client'

export default function Error({ error, reset }) {
  return (
    <div>
      <h2>出错了！</h2>
      <p>{error.message}</p>
      <button onClick={() => reset()}>重试</button>
    </div>
  )
}
```

**not-found.js：**

```jsx
// app/not-found.js
export default function NotFound() {
  return (
    <div>
      <h2>页面未找到</h2>
      <Link href="/">返回首页</Link>
    </div>
  )
}

// 在组件中手动触发
import { notFound } from 'next/navigation'

async function Page({ params }) {
  const post = await getPost(params.id)
  if (!post) notFound()
  return <Post post={post} />
}
```

---

### 21. 什么是 Server Actions？

**答案：**

Server Actions 允许直接在组件中定义服务端函数，无需创建 API 路由。

**定义 Server Action：**

```jsx
// app/actions.js
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createPost(formData) {
  const title = formData.get('title')
  const content = formData.get('content')

  await db.post.create({
    data: { title, content }
  })

  revalidatePath('/posts')
  redirect('/posts')
}

export async function deletePost(id) {
  await db.post.delete({ where: { id } })
  revalidatePath('/posts')
}
```

**在表单中使用：**

```jsx
// app/posts/new/page.js
import { createPost } from '../actions'

export default function NewPost() {
  return (
    <form action={createPost}>
      <input name="title" placeholder="标题" required />
      <textarea name="content" placeholder="内容" required />
      <button type="submit">发布</button>
    </form>
  )
}
```

**在客户端组件中使用：**

```jsx
'use client'

import { deletePost } from '../actions'
import { useTransition } from 'react'

export default function DeleteButton({ id }) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      disabled={isPending}
      onClick={() => {
        startTransition(() => deletePost(id))
      }}
    >
      {isPending ? '删除中...' : '删除'}
    </button>
  )
}
```

**表单状态处理：**

```jsx
'use client'

import { useFormStatus, useFormState } from 'react-dom'
import { createPost } from '../actions'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button disabled={pending}>
      {pending ? '提交中...' : '提交'}
    </button>
  )
}

export default function Form() {
  const [state, formAction] = useFormState(createPost, null)

  return (
    <form action={formAction}>
      <input name="title" />
      {state?.error && <p className="error">{state.error}</p>}
      <SubmitButton />
    </form>
  )
}
```

---

### 22. 解释并行路由 (Parallel Routes) 和拦截路由 (Intercepting Routes)

**答案：**

**并行路由：**

允许在同一布局中同时渲染多个页面。

```
app/
  @dashboard/
    page.js
  @analytics/
    page.js
  layout.js
  page.js
```

```jsx
// app/layout.js
export default function Layout({ children, dashboard, analytics }) {
  return (
    <div>
      {children}
      <div className="grid grid-cols-2">
        {dashboard}
        {analytics}
      </div>
    </div>
  )
}
```

**条件渲染：**

```jsx
// app/layout.js
import { getUser } from '@/lib/auth'

export default async function Layout({ children, admin, user }) {
  const currentUser = await getUser()

  return (
    <div>
      {children}
      {currentUser?.role === 'admin' ? admin : user}
    </div>
  )
}
```

**拦截路由：**

允许在当前布局中加载其他路由，常用于模态框。

```
app/
  feed/
    page.js
    @modal/
      (.)photo/[id]/page.js    # 拦截 /photo/[id]
  photo/
    [id]/
      page.js
```

**拦截语法：**

| 语法 | 匹配 |
|------|------|
| `(.)` | 同级路由 |
| `(..)` | 上一级路由 |
| `(..)(..)` | 上两级路由 |
| `(...)` | 根路由 |

**模态框示例：**

```jsx
// app/feed/@modal/(.)photo/[id]/page.js
// 在 feed 页面点击照片时，以模态框形式显示
export default function PhotoModal({ params }) {
  return (
    <Modal>
      <Photo id={params.id} />
    </Modal>
  )
}

// app/photo/[id]/page.js
// 直接访问 URL 时，显示完整页面
export default function PhotoPage({ params }) {
  return <Photo id={params.id} />
}
```

---

### 23. App Router 中如何处理 Metadata（SEO）？

**答案：**

**静态 Metadata：**

```jsx
// app/page.js
export const metadata = {
  title: '首页 | 我的网站',
  description: '这是网站首页',
  keywords: ['Next.js', 'React', 'SEO'],
  openGraph: {
    title: '我的网站',
    description: '欢迎访问我的网站',
    images: ['/og-image.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: '我的网站',
    images: ['/twitter-image.jpg'],
  },
}

export default function Page() {
  return <h1>首页</h1>
}
```

**动态 Metadata：**

```jsx
// app/blog/[slug]/page.js
export async function generateMetadata({ params }) {
  const post = await getPost(params.slug)

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
    },
  }
}

export default async function Post({ params }) {
  const post = await getPost(params.slug)
  return <article>{post.content}</article>
}
```

**全局 Metadata 模板：**

```jsx
// app/layout.js
export const metadata = {
  title: {
    template: '%s | 我的网站',  // 子页面标题会替换 %s
    default: '我的网站',
  },
  metadataBase: new URL('https://example.com'),
  alternates: {
    canonical: '/',
    languages: {
      'zh-CN': '/zh',
      'en-US': '/en',
    },
  },
}
```

**生成 sitemap 和 robots：**

```jsx
// app/sitemap.js
export default async function sitemap() {
  const posts = await getPosts()

  return [
    { url: 'https://example.com', lastModified: new Date() },
    ...posts.map(post => ({
      url: `https://example.com/blog/${post.slug}`,
      lastModified: post.updatedAt,
    })),
  ]
}

// app/robots.js
export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/admin/',
    },
    sitemap: 'https://example.com/sitemap.xml',
  }
}
```

---

### 24. 如何在 Next.js 中实现国际化 (i18n)？

**答案：**

**App Router 实现：**

```
app/
  [lang]/
    page.js
    layout.js
    dictionaries.js
  middleware.js
```

```js
// middleware.js
import { NextResponse } from 'next/server'

const locales = ['en', 'zh']
const defaultLocale = 'zh'

export function middleware(request) {
  const { pathname } = request.nextUrl

  // 检查路径是否已包含语言
  const pathnameHasLocale = locales.some(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (pathnameHasLocale) return

  // 检测用户首选语言
  const acceptLanguage = request.headers.get('accept-language')
  const locale = acceptLanguage?.includes('zh') ? 'zh' : defaultLocale

  return NextResponse.redirect(
    new URL(`/${locale}${pathname}`, request.url)
  )
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

```js
// app/[lang]/dictionaries.js
const dictionaries = {
  en: () => import('./dictionaries/en.json').then(m => m.default),
  zh: () => import('./dictionaries/zh.json').then(m => m.default),
}

export const getDictionary = async (locale) => dictionaries[locale]()
```

```jsx
// app/[lang]/page.js
import { getDictionary } from './dictionaries'

export default async function Page({ params: { lang } }) {
  const dict = await getDictionary(lang)

  return (
    <div>
      <h1>{dict.home.title}</h1>
      <p>{dict.home.description}</p>
    </div>
  )
}
```

```json
// app/[lang]/dictionaries/zh.json
{
  "home": {
    "title": "欢迎",
    "description": "这是首页"
  }
}

// app/[lang]/dictionaries/en.json
{
  "home": {
    "title": "Welcome",
    "description": "This is home page"
  }
}
```

**语言切换组件：**

```jsx
'use client'

import { usePathname, useRouter } from 'next/navigation'

export default function LanguageSwitcher({ lang }) {
  const pathname = usePathname()
  const router = useRouter()

  const switchLanguage = (newLang) => {
    const newPath = pathname.replace(`/${lang}`, `/${newLang}`)
    router.push(newPath)
  }

  return (
    <div>
      <button
        onClick={() => switchLanguage('zh')}
        disabled={lang === 'zh'}
      >
        中文
      </button>
      <button
        onClick={() => switchLanguage('en')}
        disabled={lang === 'en'}
      >
        English
      </button>
    </div>
  )
}
```

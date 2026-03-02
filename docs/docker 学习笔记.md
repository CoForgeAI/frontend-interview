# Docker 学习笔记

## 一、Docker 是什么

把代码 + 运行环境 + 依赖全部打包成一个"集装箱"，在任何机器上都能一样运行，解决"在我电脑上明明是好的"问题。

## 二、三个核心概念

```
Dockerfile（菜谱）→ Image 镜像（做好的菜）→ Container 容器（端上桌的菜）
```

- **Dockerfile**：文本文件，告诉 Docker 怎么打包
- **镜像 Image**：只读的成品包，可分享，可存到 Docker Hub
- **容器 Container**：镜像跑起来的实例，一个镜像可以跑多个容器

## 三、Docker vs 虚拟机

| 特性 | Docker 容器 | 虚拟机 |
|------|-----------|--------|
| 启动速度 | 秒级 | 分钟级 |
| 体积 | MB 级 | GB 级 |
| 性能 | 接近原生 | 有损耗 |
| 隔离级别 | 进程级（共享内核） | 完全隔离（独立内核） |

## 四、Dockerfile 写法

```dockerfile
FROM node:18-alpine          # 基础镜像
WORKDIR /app                 # 工作目录
COPY package.json ./         # 先复制依赖文件（利用缓存）
RUN npm install              # 安装依赖
COPY . .                     # 复制源代码
RUN npm run build            # 构建
CMD ["npm", "start"]         # 启动命令
```

> 先复制 package.json 再复制代码 → 代码改了但依赖没变时不用重新 npm install

## 五、常用命令

### 镜像操作

```bash
docker build -t my-app:v1 .        # 构建镜像
docker images                       # 查看本地镜像
docker pull nginx:latest            # 拉取镜像
docker rmi <image_id>               # 删除镜像
```

### 容器操作

```bash
docker run -d -p 3000:3000 my-app   # 后台运行 + 端口映射
docker ps                            # 查看运行中的容器
docker ps -a                         # 查看所有容器（含已停止）
docker stop <容器ID>                  # 停止容器
docker rm <容器ID>                    # 删除容器
docker logs <容器ID>                  # 查看日志
docker exec -it <容器ID> sh          # 进入容器终端
```

### Docker Compose（多容器编排）

```bash
docker compose up -d                 # 启动所有服务
docker compose down                  # 停止并移除
docker compose logs -f               # 查看日志
```

## 六、Docker Compose 示例

多个服务（前端 + 后端 + 数据库）一起管理：

```yaml
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
  api:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      - DB_HOST=db
  db:
    image: postgres:15
    environment:
      - POSTGRES_PASSWORD=123456
```

## 七、多阶段构建（Multi-stage Build）

### 为什么要多阶段？

单阶段构建会把源代码、dev 依赖、构建工具全部留在最终镜像里，导致镜像很大（500MB+）。多阶段构建让最终镜像**只包含运行必需的东西**，可以缩小到 50-100MB。

### 三个阶段就像工厂流水线

```
deps（采购车间）→ builder（生产车间）→ runner（发货车间）
  只装依赖           只管构建            只装最终产物
```

### Next.js 生产级 Dockerfile 示例

```dockerfile
# 公共底座
FROM node:20-alpine AS base

# --- 阶段 1：安装依赖 ---
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
# 自动识别包管理器
RUN \
  if [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  elif [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  else echo "Lockfile not found." && exit 1; \
  fi

# --- 阶段 2：构建 ---
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules   # 从 deps 拿依赖
COPY . .                                             # 复制源代码
RUN npm run build                                    # 构建项目

# --- 阶段 3：运行（最终镜像）---
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# 创建专用用户（不用 root，更安全）
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 只从 builder 拿三样东西
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
```

### 关键知识点

- `FROM ... AS 名字`：定义一个阶段并取别名
- `COPY --from=阶段名`：从其他阶段复制文件，其余全部丢弃
- `--frozen-lockfile` / `npm ci`：严格按 lock 文件安装，保证一致性
- `standalone`：Next.js 特性，把运行所需的最小依赖打包好，不需要完整 node_modules
- `USER nextjs`：用非 root 用户运行，安全最佳实践

### 入门版 vs 生产版对比

| | 入门版（单阶段） | 生产版（多阶段） |
|---|---|---|
| 阶段数 | 1 个 | 3 个 |
| 最终镜像包含 | 源代码 + 全部 node_modules | 只有构建产物 |
| 镜像大小 | 500MB+ | 50-100MB |
| 安全性 | root 运行 | 专用用户运行 |

## 八、数据持久化（Volume）

容器像一次性纸杯，删了数据就没了。Volume 在宿主机上开辟空间，跟容器目录同步，容器删了数据还在。

### 两种方式

```bash
# 方式 1：Volume（Docker 管理，推荐）
docker volume create mydata
docker run -d -v mydata:/app/data my-app

# 方式 2：Bind Mount（挂载本地目录，开发时好用：改代码容器立刻同步）
docker run -d -v /Users/admin/myproject:/app my-app
```

### Docker Compose 中使用

```yaml
services:
  db:
    image: postgres:15
    volumes:
      - db_data:/var/lib/postgresql/data    # 数据库文件存到 volume
volumes:
  db_data:    # 声明 volume
```

### 常用命令

```bash
docker volume ls                # 查看所有 volume
docker volume inspect mydata    # 查看详情
docker volume rm mydata         # 删除 volume
```

## 九、网络（Network）

同一网络里的容器，可以**直接用服务名互相访问**。

### Docker Compose 自动处理网络

```yaml
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    # 代码里直接用 http://api:8080 访问后端

  api:
    build: ./backend
    environment:
      - DB_HOST=db         # 直接用服务名 "db" 作为地址

  db:
    image: postgres:15
```

> 记住：**在 Docker Compose 里，服务名就是域名**

### 手动创建网络

```bash
docker network create mynet
docker run -d --network mynet --name api my-api
docker run -d --network mynet --name frontend my-fe
```

### 三种网络模式

| 模式 | 说明 | 适用场景 |
|------|------|---------|
| bridge（默认） | 容器在虚拟网络中，通过容器名通信 | 大多数场景 |
| host | 直接用宿主机网络，没有隔离 | 需要最高网络性能时 |
| none | 没有网络 | 安全隔离场景 |

## 十、核心流程总结

```
你的代码 + Dockerfile
        ↓ docker build
      镜像 (Image)          ← 可推送到 Docker Hub 分享
        ↓ docker run
      容器 (Container)      ← 应用在这里运行
```

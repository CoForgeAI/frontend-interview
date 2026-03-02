# Nginx 学习笔记

## 一、Nginx 是什么

Nginx 就是一个"门卫"，用户的请求先经过它，由它决定怎么处理：

- 要静态文件（HTML/CSS/JS/图片）？→ 直接返回
- 要 API 数据？→ 转发给后端服务（反向代理）
- 要 HTTPS？→ 处理 SSL 证书
- 多个域名？→ 分发到不同的服务

## 二、基础配置：托管前端项目

```nginx
server {
    listen 80;
    server_name example.com;

    root /usr/share/nginx/html;       # 前端打包文件的位置
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;   # 关键！支持前端路由
    }
}
```

### try_files 为什么重要？

SPA 单页应用必须加这行，否则刷新页面就 404：

```
用户访问 /about
  → $uri       先找 /about 文件     → 没有
  → $uri/      再找 /about/ 目录    → 没有
  → /index.html 返回首页，前端路由接管 → 正常显示 about 页面
```

## 三、反向代理

前端和后端不在同一个服务上，Nginx 当"中间人"转发请求，解决跨域问题：

```nginx
server {
    listen 80;
    server_name example.com;

    # 前端静态文件
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }

    # API 请求 → 转发给后端
    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;              # 传递原始域名
        proxy_set_header X-Real-IP $remote_addr;  # 传递用户真实 IP
    }
}
```

> 用户全程只跟 `example.com` 打交道，不知道后端在哪，也没有跨域问题

## 四、HTTPS 配置

```nginx
# HTTP → 自动跳转 HTTPS
server {
    listen 80;
    server_name example.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS
server {
    listen 443 ssl;
    server_name example.com;

    ssl_certificate     /etc/nginx/ssl/example.com.pem;
    ssl_certificate_key /etc/nginx/ssl/example.com.key;

    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:8080;
    }
}
```

> 免费 SSL 证书用 Let's Encrypt

## 五、多域名 / 多项目

一台服务器跑多个网站，Nginx 根据域名自动分发：

```nginx
# 主站
server {
    listen 80;
    server_name example.com;
    location / {
        root /var/www/main-site;
        try_files $uri $uri/ /index.html;
    }
}

# 管理后台
server {
    listen 80;
    server_name admin.example.com;
    location / {
        root /var/www/admin;
        try_files $uri $uri/ /index.html;
    }
}
```

## 六、Docker + Nginx 部署前端（最常见方案）

### Dockerfile（多阶段构建）

```dockerfile
# 阶段 1：构建
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# 阶段 2：用 Nginx 托管
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 配套 nginx.conf

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    # 前端路由
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存（文件名有 hash，可以长期缓存）
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API 代理（Docker Compose 里直接用服务名）
    location /api/ {
        proxy_pass http://api:8080;
    }

    # gzip 压缩
    gzip on;
    gzip_types text/css application/javascript application/json;
}
```

### 运行

```bash
docker build -t my-frontend .
docker run -d -p 80:80 my-frontend
```

## 七、速查表

| 需求 | 关键配置 |
|------|---------|
| 托管前端静态文件 | `root` + `try_files $uri $uri/ /index.html` |
| API 反向代理 | `location /api/ { proxy_pass http://后端地址; }` |
| HTTPS | `listen 443 ssl` + 证书路径 |
| HTTP 跳 HTTPS | `return 301 https://...` |
| 多域名多项目 | 多个 `server` 块，不同 `server_name` |
| 静态资源缓存 | `expires 1y` + `Cache-Control` |
| gzip 压缩 | `gzip on` + `gzip_types` |

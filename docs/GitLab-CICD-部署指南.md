# GitLab CI/CD 部署指南

## 目录

1. [基础概念](#基础概念)
2. [环境准备](#环境准备)
3. [.gitlab-ci.yml 配置详解](#gitlab-ciyml-配置详解)
4. [常见部署场景](#常见部署场景)
5. [最佳实践](#最佳实践)
6. [常见问题排查](#常见问题排查)

---

## 基础概念

### 什么是 GitLab CI/CD？

GitLab CI/CD 是 GitLab 内置的持续集成/持续部署工具，通过 `.gitlab-ci.yml` 文件定义流水线（Pipeline），自动化构建、测试和部署流程。

### 核心概念

| 概念 | 说明 |
|------|------|
| **Pipeline** | 流水线，一次完整的 CI/CD 执行过程 |
| **Stage** | 阶段，如 build、test、deploy |
| **Job** | 任务，在 Stage 中执行的具体工作 |
| **Runner** | 执行 Job 的代理程序 |
| **Artifact** | 构建产物，Job 之间传递的文件 |

---

## 环境准备

### 1. 安装 GitLab Runner

```bash
# Ubuntu/Debian
curl -L https://packages.gitlab.com/install/repositories/runner/gitlab-runner/script.deb.sh | sudo bash
sudo apt-get install gitlab-runner

# CentOS/RHEL
curl -L https://packages.gitlab.com/install/repositories/runner/gitlab-runner/script.rpm.sh | sudo bash
sudo yum install gitlab-runner

# macOS
brew install gitlab-runner

# Docker 方式
docker run -d --name gitlab-runner --restart always \
  -v /srv/gitlab-runner/config:/etc/gitlab-runner \
  -v /var/run/docker.sock:/var/run/docker.sock \
  gitlab/gitlab-runner:latest
```

### 2. 注册 Runner

```bash
sudo gitlab-runner register
```

按提示输入：
- GitLab 实例 URL（如 `https://gitlab.com/`）
- 注册令牌（在项目 Settings > CI/CD > Runners 中获取）
- Runner 描述
- 标签（tags）
- 执行器类型（docker、shell、kubernetes 等）

### 3. 验证 Runner 状态

```bash
sudo gitlab-runner status
sudo gitlab-runner list
```

---

## .gitlab-ci.yml 配置详解

### 基础结构

```yaml
# 定义阶段顺序
stages:
  - install
  - build
  - test
  - deploy

# 全局变量
variables:
  NODE_VERSION: "18"

# 全局缓存
cache:
  paths:
    - node_modules/

# 安装依赖
install:
  stage: install
  script:
    - npm ci
  artifacts:
    paths:
      - node_modules/
    expire_in: 1 hour

# 构建任务
build:
  stage: build
  script:
    - npm run build
  artifacts:
    paths:
      - dist/
    expire_in: 1 week

# 测试任务
test:
  stage: test
  script:
    - npm run test

# 部署任务
deploy:
  stage: deploy
  script:
    - echo "Deploying..."
  only:
    - main
```

### 常用关键字说明

```yaml
job_name:
  # 所属阶段
  stage: build

  # 使用的 Docker 镜像
  image: node:18-alpine

  # 执行的命令
  script:
    - npm install
    - npm run build

  # 前置脚本
  before_script:
    - echo "准备环境"

  # 后置脚本
  after_script:
    - echo "清理工作"

  # 指定运行的 Runner 标签
  tags:
    - docker
    - linux

  # 触发条件
  only:
    - main
    - develop
  except:
    - tags

  # 更灵活的触发规则
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
      when: always
    - if: $CI_MERGE_REQUEST_ID
      when: manual
    - when: never

  # 构建产物
  artifacts:
    paths:
      - dist/
    expire_in: 1 week

  # 缓存
  cache:
    key: ${CI_COMMIT_REF_SLUG}
    paths:
      - node_modules/

  # 依赖其他 Job 的产物
  dependencies:
    - build

  # 允许失败
  allow_failure: true

  # 手动触发
  when: manual

  # 重试次数
  retry: 2

  # 超时时间
  timeout: 30 minutes

  # 环境
  environment:
    name: production
    url: https://example.com
```

---

## 常见部署场景

### 场景一：前端项目部署到服务器

```yaml
stages:
  - build
  - deploy

variables:
  DEPLOY_SERVER: "user@your-server.com"
  DEPLOY_PATH: "/var/www/html"

build:
  stage: build
  image: node:18-alpine
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - dist/
    expire_in: 1 day
  cache:
    key: ${CI_COMMIT_REF_SLUG}
    paths:
      - node_modules/

deploy_production:
  stage: deploy
  image: alpine:latest
  before_script:
    - apk add --no-cache openssh-client rsync
    - eval $(ssh-agent -s)
    - echo "$SSH_PRIVATE_KEY" | tr -d '\r' | ssh-add -
    - mkdir -p ~/.ssh
    - chmod 700 ~/.ssh
    - echo "$SSH_KNOWN_HOSTS" >> ~/.ssh/known_hosts
  script:
    - rsync -avz --delete dist/ ${DEPLOY_SERVER}:${DEPLOY_PATH}
  only:
    - main
  environment:
    name: production
    url: https://your-domain.com
```

### 场景二：Docker 镜像构建与推送

```yaml
stages:
  - build
  - push
  - deploy

variables:
  DOCKER_REGISTRY: registry.gitlab.com
  IMAGE_NAME: $CI_REGISTRY_IMAGE
  IMAGE_TAG: $CI_COMMIT_SHORT_SHA

build_image:
  stage: build
  image: docker:24
  services:
    - docker:24-dind
  variables:
    DOCKER_TLS_CERTDIR: "/certs"
  script:
    - docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .
    - docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${IMAGE_NAME}:latest
  only:
    - main
    - develop

push_image:
  stage: push
  image: docker:24
  services:
    - docker:24-dind
  variables:
    DOCKER_TLS_CERTDIR: "/certs"
  before_script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
  script:
    - docker push ${IMAGE_NAME}:${IMAGE_TAG}
    - docker push ${IMAGE_NAME}:latest
  only:
    - main

deploy_k8s:
  stage: deploy
  image: bitnami/kubectl:latest
  script:
    - kubectl set image deployment/my-app my-app=${IMAGE_NAME}:${IMAGE_TAG}
  only:
    - main
  environment:
    name: production
```

### 场景三：多环境部署

```yaml
stages:
  - build
  - deploy

build:
  stage: build
  image: node:18-alpine
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - dist/

.deploy_template: &deploy_template
  stage: deploy
  image: alpine:latest
  before_script:
    - apk add --no-cache openssh-client rsync
    - eval $(ssh-agent -s)
    - echo "$SSH_PRIVATE_KEY" | tr -d '\r' | ssh-add -
    - mkdir -p ~/.ssh && chmod 700 ~/.ssh
    - echo "$SSH_KNOWN_HOSTS" >> ~/.ssh/known_hosts

deploy_dev:
  <<: *deploy_template
  variables:
    DEPLOY_SERVER: "user@dev-server.com"
    DEPLOY_PATH: "/var/www/dev"
  script:
    - rsync -avz dist/ ${DEPLOY_SERVER}:${DEPLOY_PATH}
  only:
    - develop
  environment:
    name: development
    url: https://dev.example.com

deploy_staging:
  <<: *deploy_template
  variables:
    DEPLOY_SERVER: "user@staging-server.com"
    DEPLOY_PATH: "/var/www/staging"
  script:
    - rsync -avz dist/ ${DEPLOY_SERVER}:${DEPLOY_PATH}
  only:
    - staging
  environment:
    name: staging
    url: https://staging.example.com
  when: manual

deploy_production:
  <<: *deploy_template
  variables:
    DEPLOY_SERVER: "user@prod-server.com"
    DEPLOY_PATH: "/var/www/production"
  script:
    - rsync -avz dist/ ${DEPLOY_SERVER}:${DEPLOY_PATH}
  only:
    - main
  environment:
    name: production
    url: https://example.com
  when: manual
```

### 场景四：完整的前端项目流水线

```yaml
stages:
  - install
  - lint
  - test
  - build
  - deploy

variables:
  NODE_IMAGE: node:18-alpine

# 缓存配置
.node_cache: &node_cache
  cache:
    key:
      files:
        - package-lock.json
    paths:
      - node_modules/
    policy: pull

install:
  stage: install
  image: $NODE_IMAGE
  cache:
    key:
      files:
        - package-lock.json
    paths:
      - node_modules/
    policy: pull-push
  script:
    - npm ci
  artifacts:
    paths:
      - node_modules/
    expire_in: 1 hour

lint:
  stage: lint
  image: $NODE_IMAGE
  <<: *node_cache
  script:
    - npm run lint
  allow_failure: false

test:
  stage: test
  image: $NODE_IMAGE
  <<: *node_cache
  script:
    - npm run test:ci
  coverage: '/Lines\s*:\s*(\d+\.?\d*)%/'
  artifacts:
    reports:
      junit: junit.xml
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml

build:
  stage: build
  image: $NODE_IMAGE
  <<: *node_cache
  script:
    - npm run build
  artifacts:
    paths:
      - dist/
    expire_in: 1 week
  only:
    - main
    - develop
    - merge_requests

deploy_preview:
  stage: deploy
  script:
    - echo "Deploy preview..."
  environment:
    name: preview/$CI_COMMIT_REF_SLUG
    url: https://$CI_COMMIT_REF_SLUG.preview.example.com
    on_stop: stop_preview
  only:
    - merge_requests

stop_preview:
  stage: deploy
  script:
    - echo "Stop preview..."
  environment:
    name: preview/$CI_COMMIT_REF_SLUG
    action: stop
  when: manual
  only:
    - merge_requests

deploy_production:
  stage: deploy
  script:
    - echo "Deploy to production..."
  environment:
    name: production
    url: https://example.com
  only:
    - main
  when: manual
```

---

## 最佳实践

### 1. 使用缓存加速构建

```yaml
cache:
  key:
    files:
      - package-lock.json  # 基于 lock 文件生成缓存 key
  paths:
    - node_modules/
  policy: pull-push  # 默认策略，拉取并更新缓存
```

### 2. 合理使用 Artifacts

```yaml
build:
  artifacts:
    paths:
      - dist/
    expire_in: 1 week  # 设置过期时间，节省存储空间
    when: on_success   # 仅成功时保存
```

### 3. 使用模板减少重复

```yaml
# 定义模板
.deploy_base:
  image: alpine:latest
  before_script:
    - apk add --no-cache rsync openssh-client

# 继承模板
deploy_staging:
  extends: .deploy_base
  script:
    - rsync -avz dist/ $STAGING_SERVER
```

### 4. 敏感信息使用 CI/CD 变量

在 **Settings > CI/CD > Variables** 中配置：
- `SSH_PRIVATE_KEY` - SSH 私钥
- `DEPLOY_TOKEN` - 部署令牌
- `DATABASE_PASSWORD` - 数据库密码

```yaml
deploy:
  script:
    - echo "$SSH_PRIVATE_KEY" | ssh-add -
    - mysql -p$DATABASE_PASSWORD  # 变量会被自动隐藏
```

### 5. 使用规则控制执行

```yaml
deploy:
  rules:
    # main 分支自动部署
    - if: $CI_COMMIT_BRANCH == "main"
      when: always
    # MR 手动部署
    - if: $CI_MERGE_REQUEST_ID
      when: manual
    # 标签发布
    - if: $CI_COMMIT_TAG
      when: always
    # 其他情况不执行
    - when: never
```

### 6. 并行执行任务

```yaml
test:
  stage: test
  parallel: 3  # 并行执行 3 个实例
  script:
    - npm run test -- --shard=$CI_NODE_INDEX/$CI_NODE_TOTAL
```

---

## 常见问题排查

### 1. Runner 无法连接

```bash
# 检查 Runner 状态
sudo gitlab-runner status

# 查看日志
sudo gitlab-runner --debug run

# 重新注册
sudo gitlab-runner unregister --all-runners
sudo gitlab-runner register
```

### 2. 权限问题

```yaml
# 在 Job 中添加
before_script:
  - chmod +x ./scripts/deploy.sh
```

### 3. Docker in Docker 问题

```yaml
build:
  image: docker:24
  services:
    - docker:24-dind
  variables:
    DOCKER_HOST: tcp://docker:2376
    DOCKER_TLS_CERTDIR: "/certs"
    DOCKER_CERT_PATH: "/certs/client"
    DOCKER_TLS_VERIFY: 1
```

### 4. 缓存不生效

```yaml
cache:
  key: ${CI_COMMIT_REF_SLUG}  # 确保 key 一致
  paths:
    - node_modules/
  policy: pull-push  # 确保更新缓存
```

### 5. SSH 连接失败

```yaml
before_script:
  - eval $(ssh-agent -s)
  - echo "$SSH_PRIVATE_KEY" | tr -d '\r' | ssh-add -
  - mkdir -p ~/.ssh
  - chmod 700 ~/.ssh
  - ssh-keyscan your-server.com >> ~/.ssh/known_hosts
```

---

## 常用 CI/CD 预定义变量

| 变量名 | 说明 |
|--------|------|
| `CI_COMMIT_SHA` | 完整 commit SHA |
| `CI_COMMIT_SHORT_SHA` | 短 commit SHA (8位) |
| `CI_COMMIT_REF_NAME` | 分支或标签名 |
| `CI_COMMIT_BRANCH` | 分支名 |
| `CI_COMMIT_TAG` | 标签名 |
| `CI_PIPELINE_ID` | 流水线 ID |
| `CI_JOB_ID` | Job ID |
| `CI_PROJECT_NAME` | 项目名称 |
| `CI_PROJECT_PATH` | 项目路径 |
| `CI_REGISTRY` | 容器注册表地址 |
| `CI_REGISTRY_IMAGE` | 项目镜像地址 |
| `CI_MERGE_REQUEST_ID` | MR ID |
| `CI_ENVIRONMENT_NAME` | 环境名称 |

---

## 参考资源

- [GitLab CI/CD 官方文档](https://docs.gitlab.com/ee/ci/)
- [.gitlab-ci.yml 完整参考](https://docs.gitlab.com/ee/ci/yaml/)
- [预定义变量列表](https://docs.gitlab.com/ee/ci/variables/predefined_variables.html)
- [GitLab Runner 文档](https://docs.gitlab.com/runner/)

# Git 操作指南

## 基础配置

### 初始化配置

```bash
# 设置用户名和邮箱
git config --global user.name "你的名字"
git config --global user.email "你的邮箱"

# 查看配置
git config --list

# 设置默认分支名
git config --global init.defaultBranch main
```

### SSH 密钥配置

```bash
# 生成 SSH 密钥
ssh-keygen -t ed25519 -C "你的邮箱"

# 查看公钥（添加到 GitHub/GitLab）
cat ~/.ssh/id_ed25519.pub

# 测试连接
ssh -T git@github.com
ssh -T git@gitlab.com
```

---

## 常用命令

### 仓库操作

```bash
# 初始化仓库
git init

# 克隆仓库
git clone <仓库地址>
git clone <仓库地址> <目录名>

# 克隆指定分支
git clone -b <分支名> <仓库地址>

# 添加远程仓库
git remote add origin <仓库地址>

# 查看远程仓库
git remote -v

# 修改远程仓库地址
git remote set-url origin <新地址>
```

### 提交流程

```bash
# 查看状态
git status

# 添加文件到暂存区
git add <文件名>
git add .                  # 添加所有文件
git add -A                 # 添加所有变更（包括删除）

# 提交
git commit -m "提交信息"
git commit -am "提交信息"   # 添加并提交（仅限已跟踪文件）

# 修改最近一次提交
git commit --amend -m "新的提交信息"

# 推送
git push
git push origin <分支名>
git push -u origin <分支名>  # 设置上游分支
```

### 分支操作

```bash
# 查看分支
git branch           # 本地分支
git branch -r        # 远程分支
git branch -a        # 所有分支

# 创建分支
git branch <分支名>

# 切换分支
git checkout <分支名>
git switch <分支名>        # Git 2.23+

# 创建并切换分支
git checkout -b <分支名>
git switch -c <分支名>     # Git 2.23+

# 删除分支
git branch -d <分支名>     # 安全删除
git branch -D <分支名>     # 强制删除

# 删除远程分支
git push origin --delete <分支名>

# 重命名分支
git branch -m <旧名> <新名>
```

### 合并与变基

```bash
# 合并分支
git merge <分支名>

# 变基
git rebase <分支名>

# 交互式变基（修改多个提交）
git rebase -i HEAD~3

# 取消变基
git rebase --abort

# 继续变基
git rebase --continue
```

### 拉取更新

```bash
# 拉取并合并
git pull

# 拉取但不合并
git fetch

# 拉取并变基
git pull --rebase
```

### 撤销操作

```bash
# 撤销工作区修改
git checkout -- <文件名>
git restore <文件名>        # Git 2.23+

# 撤销暂存区
git reset HEAD <文件名>
git restore --staged <文件名>  # Git 2.23+

# 撤销提交（保留修改）
git reset --soft HEAD~1

# 撤销提交（不保留修改）
git reset --hard HEAD~1

# 撤销某次提交（生成新提交）
git revert <commit-id>
```

### 暂存工作

```bash
# 暂存当前工作
git stash
git stash save "说明信息"

# 查看暂存列表
git stash list

# 恢复暂存
git stash pop           # 恢复并删除
git stash apply         # 恢复不删除
git stash apply stash@{0}  # 恢复指定暂存

# 删除暂存
git stash drop stash@{0}
git stash clear         # 清空所有
```

### 查看历史

```bash
# 查看提交历史
git log
git log --oneline        # 简洁模式
git log --graph          # 图形化显示
git log -n 5             # 最近 5 条

# 查看某个文件的历史
git log -p <文件名>

# 查看某次提交的内容
git show <commit-id>

# 查看差异
git diff                 # 工作区 vs 暂存区
git diff --staged        # 暂存区 vs 最新提交
git diff <分支1> <分支2>  # 两个分支的差异
```

---

## 常见场景

### 场景 1：创建新项目并推送

```bash
# 初始化
git init
git add .
git commit -m "初始化项目"

# 关联远程仓库
git remote add origin git@github.com:用户名/仓库名.git
git branch -M main
git push -u origin main
```

### 场景 2：开发新功能

```bash
# 从 main 创建功能分支
git checkout main
git pull
git checkout -b feature/新功能名

# 开发完成后提交
git add .
git commit -m "feat: 添加新功能"

# 推送功能分支
git push -u origin feature/新功能名

# 创建 Pull Request 或合并
git checkout main
git merge feature/新功能名
git push
```

### 场景 3：修复线上 Bug

```bash
# 从 main 创建修复分支
git checkout main
git pull
git checkout -b hotfix/bug描述

# 修复后提交
git add .
git commit -m "fix: 修复xxx问题"

# 合并到 main
git checkout main
git merge hotfix/bug描述
git push

# 删除修复分支
git branch -d hotfix/bug描述
```

### 场景 4：同步 Fork 的仓库

```bash
# 添加上游仓库
git remote add upstream <原仓库地址>

# 获取上游更新
git fetch upstream

# 合并到本地 main
git checkout main
git merge upstream/main

# 推送到自己的仓库
git push origin main
```

### 场景 5：撤销已推送的提交

```bash
# 方法 1：revert（推荐，生成新提交）
git revert <commit-id>
git push

# 方法 2：reset + force push（危险，会改变历史）
git reset --hard <commit-id>
git push --force
```

### 场景 6：合并多个提交

```bash
# 交互式变基，合并最近 3 个提交
git rebase -i HEAD~3

# 在编辑器中将 pick 改为 squash (s)
# 保存后编辑合并后的提交信息
```

### 场景 7：找回删除的分支

```bash
# 查看操作历史
git reflog

# 找到删除前的 commit，创建新分支
git checkout -b <恢复的分支名> <commit-id>
```

---

## 提交规范

### Commit Message 格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type 类型

| 类型 | 说明 |
|------|------|
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `docs` | 文档更新 |
| `style` | 代码格式（不影响功能） |
| `refactor` | 重构 |
| `perf` | 性能优化 |
| `test` | 测试相关 |
| `chore` | 构建/工具相关 |
| `revert` | 回滚 |

### 示例

```bash
git commit -m "feat: 添加用户登录功能"
git commit -m "fix: 修复首页加载缓慢的问题"
git commit -m "docs: 更新 README 文档"
git commit -m "refactor: 重构用户模块代码结构"
```

---

## .gitignore 配置

### 常用规则

```gitignore
# 依赖目录
node_modules/
vendor/

# 构建输出
dist/
build/
.output/

# 环境变量
.env
.env.local
.env.*.local

# IDE 配置
.idea/
.vscode/
*.swp
*.swo

# 系统文件
.DS_Store
Thumbs.db

# 日志
*.log
npm-debug.log*

# 缓存
.cache/
.temp/
```

### 规则说明

```gitignore
# 忽略所有 .log 文件
*.log

# 忽略 build 目录
build/

# 不忽略 build 目录下的 keep.txt
!build/keep.txt

# 忽略根目录下的 TODO 文件
/TODO

# 忽略任意目录下的 temp 文件夹
**/temp/
```

---

## 我的笔记

<!-- 在这里添加你自己的 Git 笔记 -->

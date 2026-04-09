# GitHub + Vercel 部署指南

## 概述

本指南详细介绍如何将项目部署到 GitHub 并通过 Vercel 实现自动同步和在线测试。

**核心流程**：本地开发 → GitHub 仓库 → Vercel 自动部署 → 在线测试

## 准备工作

### 工具需求

- **GitHub 账号**：https://github.com/join
- **Vercel 账号**：https://vercel.com/signup（用 GitHub 账号登录）
- **Git 客户端**：通常 Windows 安装 Git 后自带

## 步骤 1：创建 GitHub 仓库

### 1.1 登录 GitHub

打开 https://github.com，登录你的账号。

### 1.2 创建新仓库

1. 点击右上角的「+」图标，选择「New repository」
2. 填写仓库信息：
   - **Repository name**：填写你的项目名称（如 `my-project`）
   - **Description**：项目描述（可选）
   - **Visibility**：选择「Public」或「Private」
3. **重要**：不要勾选「Initialize this repository with」下的任何选项
   - ❌ 不要勾选「Add a README file」
   - ❌ 不要勾选「Add .gitignore」
   - ❌ 不要勾选「Choose a license」
4. 点击「Create repository」

**为什么要这样做？**
- 如果勾选了 README，GitHub 会创建一个初始提交
- 本地 Git 也有初始提交，推送时会产生冲突
- 新项目没有历史记录需要保留，所以不需要这些初始化选项

### 1.3 获取仓库地址

创建成功后，页面会显示仓库地址，格式如：
```
https://github.com/你的用户名/仓库名.git
```

## 步骤 2：初始化本地 Git 仓库

### 2.1 打开命令行

- **Windows**：搜索「cmd」或「PowerShell」
- **Mac/Linux**：打开「终端」

### 2.2 进入项目目录

```bash
# 替换为你的项目实际路径
cd "你的项目路径"
```

例如：
```bash
cd "c:\Users\Angela.Wang\Desktop\my-project"
```

### 2.3 初始化 Git

```bash
git init
```

### 2.4 配置 Git 用户名和邮箱

```bash
git config user.name "你的 GitHub 用户名"
git config user.email "你的 GitHub 邮箱"
```

### 2.5 检查分支名称

```bash
git branch
```

默认可能是 `master` 或 `main`。如果显示的不是 `main`，需要重命名：

```bash
git branch -M main
```

## 步骤 3：上传代码到 GitHub

### 3.1 添加文件到 Git

```bash
git add .
```

### 3.2 提交代码

```bash
git commit -m "Initial commit: 项目名称"
```

### 3.3 关联 GitHub 仓库

```bash
git remote add origin https://github.com/你的用户名/仓库名.git
```

### 3.4 推送代码

```bash
git push -u origin main
```

如果推送失败并提示「fetch first」，执行强制推送（新项目可以这样做）：

```bash
git push -u origin main --force
```

**为什么有时需要强制推送？**
- 如果 GitHub 仓库已有初始提交（如 README），会与本地冲突
- 新项目没有历史记录，强制推送是安全的

## 步骤 4：部署到 Vercel

### 4.1 登录 Vercel

1. 打开 https://vercel.com
2. 点击「Sign Up」或「Log In」
3. 选择「Continue with GitHub」，使用 GitHub 账号授权登录

### 4.2 配置 GitHub 访问权限（首次部署）

如果看到「Make sure to grant Vercel access to the Git repositories」提示：
1. 点击「configure GitHub app」或「Configure」选项
2. 跳转到 GitHub 授权页面
3. 选择「All repositories」或只选择目标仓库
4. 点击「Install」或「Authorize」

**为什么要这样做？**
- Vercel 需要明确授权才能访问你的 GitHub 仓库
- 只有授权后才能导入仓库进行部署

### 4.3 导入项目

1. 点击「Add New」→「Project」
2. 在「Import Git Repository」页面，找到你的 GitHub 账号
3. 选择你刚创建的仓库
4. 点击「Import」

### 4.4 配置部署

Vercel 通常会自动检测静态网站配置，保持默认设置即可：

- **Framework Preset**：选择「Other」
- **Root Directory**：保持为空（或 `.`）
- **Build Command**：留空
- **Output Directory**：留空

点击「Deploy」开始部署。

### 4.5 获取部署地址

部署完成后：

1. 点击「Continue to Dashboard」进入控制台
2. 在项目卡片或顶部找到应用地址，格式如：
   ```
   https://你的项目名.vercel.app
   ```
3. 或者点击「Visit」按钮打开应用

如果没看到地址，在左侧菜单找「Deployments」，点击最新的部署记录查看完整地址。

## 步骤 5：实现自动同步

### 5.1 本地修改代码

每次修改代码后，按以下步骤同步到 GitHub：

1. **查看修改状态**：
   ```bash
   git status
   ```

2. **添加修改**：
   ```bash
   git add .
   ```

3. **提交修改**：
   ```bash
   git commit -m "更新：描述你的修改"
   ```
   例如：
   ```bash
   git commit -m "修复：地图缩放比例异常"
   git commit -m "新增：支持自定义 POI 编码搜索"
   ```

4. **推送修改**：
   ```bash
   git push
   ```

### 5.2 Vercel 自动部署

推送代码到 GitHub 后：
- Vercel 会自动检测到代码变更（约几秒内）
- 自动开始重新部署
- 部署完成后，访问你的 Vercel 地址即可看到最新版本

### 5.3 查看部署状态

在 Vercel 控制台的「Deployments」标签页，可以查看每次部署的：
- 部署状态（成功/失败）
- 部署时间
- 部署日志

## 常见问题

### Q1：推送失败，提示「fetch first」

**错误信息**：
```
error: failed to push some refs
hint: Updates were rejected because the remote contains work that you do not have locally.
```

**原因**：GitHub 仓库有本地没有的提交（通常是勾选了 README 导致的）

**解决方法**（新项目适用）：
```bash
git push -u origin main --force
```

### Q2：推送失败，提示「Permission denied」

**原因**：GitHub 授权过期或权限不足

**解决方法**：
1. 在 GitHub 设置里移除 Git 凭证
2. 重新执行 `git push`，会触发重新授权

### Q3：本地分支与远程分支名称不匹配

**错误信息**：
```
error: src refspec main does not match any
```

**原因**：本地分支名称与远程不一致

**解决方法**：
```bash
# 查看本地分支
git branch

# 重命名分支
git branch -M main

# 或使用 master
git branch -M master
```

### Q4：Vercel 部署失败

**解决方法**：
1. 检查 GitHub 仓库中的文件是否完整
2. 确认 `index.html` 存在于根目录
3. 查看 Vercel 部署日志，定位具体错误

### Q5：高德地图不显示

**错误信息**：`USERKEY_PLAT_NOMATCH`

**解决方法**：
1. 确认 `config.js` 中的 API Key 和安全密钥正确
2. 确认在 https://console.amap.com 创建的是「Web端(JS API)」类型的 Key
3. 确认 Key 已设置安全域名（白名单）

## 技术原理

### 为什么需要 Vercel？

1. **自动部署**：推送代码到 GitHub 后自动重新部署，无需手动操作
2. **HTTPS 支持**：高德地图 API 要求 HTTPS 环境才能正常工作
3. **全球 CDN**：访问速度快，用户体验好
4. **免费计划**：个人项目完全够用

### 自动同步的工作原理

```
本地修改代码
    ↓
git add . (暂存修改)
    ↓
git commit -m "说明" (提交到本地仓库)
    ↓
git push (推送到 GitHub)
    ↓
Vercel 检测到 GitHub 代码变更
    ↓
自动重新部署
    ↓
访问 vercel.app 查看最新版本
```

## 注意事项

### 关于 GitHub 仓库初始化

**重要**：创建新仓库时，不要勾选任何初始化选项：
- ❌ 不要勾选「Add a README file」
- ❌ 不要勾选「Add .gitignore」
- ❌ 不要勾选「Choose a license」

这样可以避免本地与远程仓库产生冲突。

### 关于强制推送

强制推送（`--force`）会覆盖远程历史，**只在新项目**或确认不需要保留远程历史时使用。

### 关于分支名称

GitHub 默认分支可能是 `main` 或 `master`，确保本地和远程使用相同的分支名称。

## 后续优化

1. **添加 .gitignore 文件**：忽略不需要提交的文件（如缓存、日志）
2. **设置自定义域名**：使用自己的域名访问应用
3. **启用 GitHub Pages**：作为 Vercel 的备选方案
4. **添加部署通知**：配置 Slack 或邮件通知部署状态

---

**完成！** 现在你可以通过 GitHub + Vercel 实现本地代码的实时同步和在线测试。每次修改代码后，只需执行 `git add .` → `git commit` → `git push` 三步，就能自动更新到线上。 
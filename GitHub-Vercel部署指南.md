# GitHub + Vercel 部署指南：地块周边业态调查工具

## 概述

本指南将详细介绍如何：
1. 创建 GitHub 仓库
2. 上传代码到 GitHub
3. 连接 Vercel 自动部署
4. 实现本地代码修改的实时同步

## 准备工作

### 工具需求
- **GitHub 账号**：https://github.com/join
- **Vercel 账号**：https://vercel.com/signup
- **Git 客户端**：https://git-scm.com/downloads

### 项目文件
确保你的项目目录结构如下：

```
poi-survey-tool/
├── index.html                # 主页面
├── css/
│   ├── style.css             # 主样式表
│   ├── map.css               # 地图相关样式
│   ├── sidebar.css           # 侧边栏样式
│   └── responsive.css        # 响应式设计
└── js/
    ├── config.js              # 配置文件（API Key、POI 映射）
    ├── utils.js              # 工具函数
    ├── map-manager.js        # 地图管理
    ├── search-manager.js     # 搜索管理
    ├── ui-manager.js         # UI 交互
    ├── export-manager.js     # Excel 导出
    ├── poi-query-panel.js    # POI 查询面板
    └── app.js                # 应用入口
```

## 步骤 1：创建 GitHub 仓库

### 1.1 登录 GitHub
打开 https://github.com，登录你的账号。

### 1.2 创建新仓库
1. 点击右上角的「+」图标，选择「New repository」
2. 填写仓库信息：
   - **Repository name**：`poi-survey-tool`
   - **Description**：地块周边业态调查工具（可选）
   - **Visibility**：选择「Public」
   - **Initialize this repository with**：勾选「Add a README file」
3. 点击「Create repository」

## 步骤 2：初始化本地 Git 仓库

### 2.1 打开命令行
- **Windows**：搜索「cmd」或「PowerShell」
- **Mac**：打开「终端」
- **Linux**：打开「终端」

### 2.2 进入项目目录
```bash
# 替换为你的项目路径
cd c:\Users\Angela.Wang\Desktop\vibe\调研
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

## 步骤 3：上传代码到 GitHub

### 3.1 添加文件到 Git
```bash
git add .
```

### 3.2 提交代码
```bash
git commit -m "Initial commit: 地块周边业态调查工具"
```

### 3.3 关联 GitHub 仓库
```bash
# 替换为你的仓库地址
git remote add origin https://github.com/你的用户名/poi-survey-tool.git
```

### 3.4 推送代码
```bash
git push -u origin main
```

## 步骤 4：部署到 Vercel

### 4.1 登录 Vercel
打开 https://vercel.com，使用 GitHub 账号登录。

### 4.2 导入项目
1. 点击「Add New」→「Project」
2. 在「Import Git Repository」页面，选择你的 GitHub 账号
3. 找到并选择 `poi-survey-tool` 仓库
4. 点击「Import」

### 4.3 配置部署
1. 保持默认配置：
   - **Framework Preset**：选择「Other」
   - **Root Directory**：保持为空
   - **Build Command**：留空
   - **Output Directory**：留空
2. 点击「Deploy」

### 4.4 获取部署地址
部署完成后，Vercel 会显示一个成功页面，包含你的应用地址（如 `poi-survey-tool.vercel.app`）。

## 步骤 5：实现自动同步

### 5.1 本地修改代码
当你修改本地代码后：

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

4. **推送修改**：
   ```bash
   git push
   ```

### 5.2 Vercel 自动部署
- 当你推送代码到 GitHub 后，Vercel 会自动检测到代码变更
- 自动开始重新部署过程
- 部署完成后，你的应用地址会立即更新为最新版本

### 5.3 查看部署状态
在 Vercel 控制台的「Deployments」标签页，可以查看每次部署的状态和日志。

## 步骤 6：测试功能

### 6.1 访问应用
打开 Vercel 提供的应用地址（如 `poi-survey-tool.vercel.app`）。

### 6.2 测试核心功能
1. **地图加载**：检查地图是否正常显示
2. **地址搜索**：尝试搜索一个地址，如「北京市海淀区中关村」
3. **业态分类搜索**：选择一个分类（如「写字楼」），点击「开始搜索」
4. **自定义 POI 搜索**：输入 POI 编码，点击「开始搜索」
5. **Excel 导出**：搜索完成后，点击「导出 Excel」

## 常见问题

### Q1：Git 命令执行失败
- **错误**：`fatal: not a git repository`
- **解决**：确保你在项目目录中执行命令，并且已经执行了 `git init`

### Q2：推送代码失败
- **错误**：`Permission denied`
- **解决**：检查 GitHub 账号权限，确保你有权限推送代码

### Q3：Vercel 部署失败
- **错误**：`Build failed`
- **解决**：检查项目文件是否完整，特别是 `index.html` 是否存在

### Q4：高德地图不显示
- **错误**：`USERKEY_PLAT_NOMATCH`
- **解决**：确保 `config.js` 中的 API Key 和安全密钥正确配置

## 技术原理

### 为什么需要 Vercel？
1. **自动部署**：无需手动上传文件
2. **HTTPS 支持**：高德地图 API 要求 HTTPS 环境
3. **全球 CDN**：访问速度快
4. **免费计划**：完全满足个人和小型项目需求

### 自动同步的工作原理
1. **本地修改** → 2. **Git 提交** → 3. **推送到 GitHub** → 4. **Vercel 检测到变更** → 5. **自动重新部署** → 6. **应用更新**

## 后续优化

1. **添加 .gitignore 文件**：忽略不必要的文件
2. **设置自定义域名**：使用自己的域名
3. **添加 CI/CD 流程**：自动测试
4. **监控部署状态**：设置部署通知

---

**完成！** 现在你可以通过 GitHub + Vercel 实现本地代码的实时同步和在线测试。
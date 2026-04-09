# Feature Implementation Plan

**Overall Progress:** `100%`

## TLDR

构建一个纯 Vanilla JavaScript + 高德地图 API 的地块周边业态调查工具。核心功能包括：地图定位与 5km 范围圈、7 个预设业态分类搜索、自定义 POI 编码输入、搜索结果展示与 Excel 导出。

## Critical Decisions

- Decision 1: **模块化架构** - 遵循项目文档的 6 模块设计（map-manager, search-manager, ui-manager, export-manager, config, app），便于后续迁移到 React/Vue
- Decision 2: **CDN 引入依赖** - 使用 CDN 引入高德地图 JS API、XLSX、Axi os，无需构建工具，直接浏览器运行
- Decision 3: **用户可配置 API Key** - 在 config.js 中预留 API\_KEY 配置项，用户可直接修改
- Decision 4: **核心功能优先** - POI 查询面板的数据导入（PDF 转换）作为后续任务

## Tasks:

- [x] 🟩 **Step 1: 创建项目基础文件结构**
  - [x] 🟩 创建 index.html 主页面
  - [x] 🟩 创建 css/style.css 主样式表
  - [x] 🟩 创建 css/map.css 地图相关样式
  - [x] 🟩 创建 css/sidebar.css 侧边栏样式
  - [x] 🟩 创建 css/responsive.css 响应式设计
- [x] 🟩 **Step 2: 创建配置文件与工具模块**
  - [x] 🟩 创建 js/config.js（API Key、POI 分类映射表、API 端点配置）
  - [x] 🟩 创建 js/utils.js（距离计算、数据去重、编码解析等工具函数）
- [x] 🟩 **Step 3: 创建核心功能模块**
  - [x] 🟩 创建 js/map-manager.js（地图初始化、地址搜索、圆形覆盖、POI 标记）
  - [x] 🟩 创建 js/search-manager.js（调用高德周边搜索 API、分页加载、数据处理）
  - [x] 🟩 创建 js/ui-manager.js（DOM 交互、事件绑定、结果渲染）
- [x] 🟩 **Step 4: 创建导出与查询模块**
  - [x] 🟩 创建 js/export-manager.js（Excel 导出功能）
  - [x] 🟩 创建 js/poi-query-panel.js（POI 查询面板，基础框架）
- [x] 🟩 **Step 5: 创建应用入口**
  - [x] 🟩 创建 js/app.js（应用初始化、模块整合、事件监听）
- [x] 🟩 **Step 6: 验证与测试**
  - [x] 🟩 本地运行测试（地图加载、搜索功能、导出功能）
  - [x] 🟩 检查控制台错误

***

## 项目文件结构说明

### 核心业务文件（需要修改/维护）

| 文件路径                    | 作用                               | 重要度 |
| ----------------------- | -------------------------------- | --- |
| `index.html`            | 主页面，包含所有 HTML 结构和第三方库引用          | ⭐⭐⭐ |
| `js/app.js`             | 应用入口，负责初始化所有模块、协调各模块之间的通信        | ⭐⭐⭐ |
| `js/map-manager.js`     | 地图管理，处理地图初始化、地址搜索、POI 标记、圆形覆盖    | ⭐⭐⭐ |
| `js/search-manager.js`  | 搜索管理，调用高德周边搜索 API，处理分页和数据去重      | ⭐⭐⭐ |
| `js/ui-manager.js`      | UI 管理，处理 DOM 交互、事件绑定、结果显示        | ⭐⭐⭐ |
| `js/config.js`          | 全局配置，存储 API Key、POI 分类映射表、API 端点 | ⭐⭐⭐ |
| `js/export-manager.js`  | 导出管理，将搜索结果导出为 Excel 文件           | ⭐⭐⭐ |
| `js/poi-query-panel.js` | POI 查询面板，提供分类查看和选择功能             | ⭐⭐⭐ |
| `js/utils.js`           | 工具函数，距离计算、数据去重、编码解析等辅助功能         | ⭐⭐⭐ |

### 样式文件

| 文件路径                 | 作用                        | 重要度 |
| -------------------- | ------------------------- | --- |
| `css/style.css`      | 主样式表，定义全局样式、颜色、按钮、表格等基础样式 | ⭐⭐  |
| `css/sidebar.css`    | 侧边栏样式，左侧搜索面板的布局和交互样式      | ⭐⭐  |
| `css/map.css`        | 地图相关样式，地图容器、标记点、信息窗口样式    | ⭐⭐  |
| `css/responsive.css` | 响应式样式，适配不同屏幕尺寸            | ⭐   |

### Trae IDE 工作流文件

| 文件路径                     | 作用               |
| ------------------------ | ---------------- |
| `.trae/PROJECT_RULES.md` | 定义项目规则、工作流程、角色定义 |
| `.trae/plan.md`          | 项目开发计划，任务分解和进度跟踪 |
| `.trae/execute.md`       | 执行阶段指南           |
| `.trae/create-issue.md`  | Issue 创建规范       |
| `.trae/review.md`        | 代码审查规范           |
| `.trae/peer-review.md`   | 同行评审指南           |
| `.trae/本项目工作流.md`        | 本项目的具体工作流程说明     |

### 文档文件

| 文件路径                                      | 作用                          |
| ----------------------------------------- | --------------------------- |
| `GitHub-Vercel部署指南.md`                    | GitHub + Vercel 部署操作指南      |
| `issues.md`                               | Issue 列表，记录待修复的 Bug 和待实现的功能 |
| `地块周边业态调查工具 - Project Prompt v2.0 (1).md` | 原始需求文档                      |

***

## 模块依赖关系

```
app.js（应用入口）
    ├── map-manager.js（依赖 AMap 全局对象）
    ├── search-manager.js（依赖 axios）
    ├── ui-manager.js（依赖 DOM）
    ├── export-manager.js（依赖 XLSX）
    ├── poi-query-panel.js（依赖 DOM）
    └── config.js（配置中心）
            └── utils.js（工具函数）
```


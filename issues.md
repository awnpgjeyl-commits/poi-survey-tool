# Issue List - 地块周边业态调查工具

## Issue #1：地图未显示（Critical）

**TL;DR**：Vercel 部署后地图完全空白，Console 报错「高德地图 API 未加载」和「PlaceSearch 插件未初始化」。

### 当前状态 vs 预期结果

**当前状态**：

- 页面加载但地图区域完全空白
- Console 报错：
  - `map-manager.js:20 高德地图 API 未加载`
  - `map-manager.js:160 PlaceSearch 插件未初始化`
  - `app.js:92 地址搜索失败: TypeError: Cannot read properties of null`

**预期结果**：

- 地图正常加载显示
- 地址搜索功能可用
- POI 标记功能正常

### 根因分析

1. **高德地图 API 加载问题**：Vercel 部署环境下，`window._AMapSecurityConfig` 可能未在地图脚本加载前执行
2. **PlaceSearch 插件未初始化**：地图核心对象未正确创建，导致插件无法绑定

### 相关文件

- `js/config.js`（API Key 配置）
- `js/map-manager.js`（地图初始化逻辑）
- `index.html`（脚本加载顺序）

### 风险

- **Critical**：无法进行任何地图相关操作
- 需要检查 Vercel 部署后的脚本加载时序

### 修复方向

1. 检查 `index.html` 中高德地图脚本加载方式，确保 `securityJsCode` 在地图 API 加载前执行
2. 确保 PlaceSearch 插件在地图 `complete` 事件后再初始化
3. 在 Vercel 环境验证 API Key 和安全密钥配置是否正确

### 修复记录（2026-04-09）

**修改文件**：`js/map-manager.js`

**修复内容**：

1. **第 18-21 行**：添加「等待机制」
   - 原代码：如果 `AMap` 未定义，直接报错并退出
   - 修复后：如果 `AMap` 未定义，输出等待日志，每 100ms 重试一次

2. **第 34 行**：调整插件初始化时机
   - 原代码：在 `map.on('complete')` 外部调用 `this.initPlugins()`
   - 修复后：在 `map.on('complete')` 回调内部调用 `this.initPlugins()`，确保地图完全加载后才初始化插件

3. **第 54 行**：添加日志
   - 新增日志输出，确认插件初始化完成

**原理**：Vercel 环境下，动态加载的地图脚本可能存在延迟。原代码检查一次失败后就放弃，导致地图永远无法加载。新代码增加了等待重试机制，并在地图 `complete` 事件后才初始化插件，确保时序正确。

***

## Issue #2：POI 查询面板交互优化（Feature）

**TL;DR**：用户希望在 POI 编码输入框输入时，能自动弹出匹配的 POI 编码建议供选择。

### 当前状态 vs 预期结果

**当前状态**：

- 右侧面板有 POI 输入框
- 用户不知道应该输入什么

**预期结果**：

- 用户输入关键词（如「医院」），系统自动检索 POI 编码并显示匹配列表
- 用户可从列表中选择多个 POI 编码进行搜索
- 类似搜索框的自动补全/建议功能

### 用户场景

1. 用户在 POI 输入框输入「医院」
2. 系统检索 POI 分类数据，显示所有名称/描述中包含「医院」的 POI 编码
3. 用户点击选择需要的 POI 编码
4. 所选编码添加到搜索列表

### 相关文件

- `js/poi-query-panel.js`（POI 查询面板）
- `js/config.js`（POI 分类数据）
- `css/sidebar.css`（样式）

### 依赖条件

- 需要完整的 POI 分类数据（用户有高德 PDF，后续转换）
- 当前 Phase 1 先实现基础框架

### 优先级

- **Medium**（功能增强，非阻塞性）

***

## Issue #3：右侧栏文字溢出（Bug）

**TL;DR**：右侧面板的输入/点击框内文字超出边框范围。

### 当前状态 vs 预期结果

**当前状态**：

- 右侧输入框文字超出边框

**预期结果**：

- 文字在框内正常显示
- 超长文本应自动换行或截断

### 相关文件

- `css/sidebar.css`
- `js/poi-query-panel.js`

### 优先级

- **Low**（UI 细节问题）

***

***

## Issue 处理优先级

1. **Issue #1（Critical）**：优先修复地图加载问题
2. **Issue #2（Medium）**：后续实现 POI 自动补全功能
3. **Issue #3（Low）**：UI 样式调整


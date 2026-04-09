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

## Issue #2：配置两个不同的 API Key（Config）

**TL;DR**：当前使用同一个 Key 负责地图展示和搜索调用，但高德地图要求分别使用「Web JS API Key」和「Web 服务 Key」。

### 类型 / 优先级

- **Type**：Config
- **Priority**：Critical
- **Effort**：Low

### 当前状态 vs 预期结果

**当前状态**：

- 地图显示正常（使用 Web JS API Key）
- 搜索功能报错 `USERKEY_PLAT_NOMATCH`（无法使用同一个 Key 调用 Web 服务 API）

**预期结果**：

- 地图展示使用「Web JS API」Key-浏览器（前端），用户使用，在网页上**显示地图**
- 搜索功能使用「Web 服务」Key-服务器（后端），服务器程序使用，在后台查询数据
- 两个 Key 互不干扰，各自负责对应功能

### 用户场景

用户点击「开始搜索」后，系统调用高德周边搜索 API，但当前 Key 类型不支持，导致搜索失败。

### 相关文件

- `js/config.js`（需要新增 Web 服务 Key 配置）
- `js/search-manager.js`（需要改用 Web 服务 Key）
- `index.html`（地图展示继续使用 JS API Key）

### 解决方案

**方案：创建独立的 Web 服务 Key**

1. 登录高德开放平台
2. 创建新 Key，类型选择「Web 服务」
3. 在 `config.js` 中新增 `AMAP_WEB_SERVICE_KEY` 配置项
4. `search-manager.js` 使用新 Key 调用 API
5. `index.html` 和 `map-manager.js` 继续使用原有 JS API Key

### 风险

- **Critical**：阻塞核心功能（搜索）
- 低实施风险：只需在代码中新增一个配置项

### 依赖条件

- 需要用户提供新的 Web 服务 Key

### 待用户确认

1. ✅ 已创建 Web 服务 Key
2. ✅ 新 Key 已配置白名单/安全域名

### 修复记录（2026-04-09）

**修改文件**：`js/config.js`

1. **新增配置项**：在 `CONFIG` 对象中添加 `AMAP_WEB_SERVICE_KEY`

**修改文件**：`js/search-manager.js`

1. **第 75 行**：将 `key: AMAP_KEY` 改为 `key: AMAP_WEB_SERVICE_KEY`
2. **第 82 行**：移除 `securityCode: SECURITY_CODE`（Web 服务 API 不需要安全密钥）

**原理**：Web 服务 API 使用独立的 Key，不需要 `securityJsCode` 绑定。只有 JS API（浏览器前端）才需要安全密钥配置。

---

## Issue #3：POI 查询面板交互优化（Feature）

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

## Issue #4：右侧栏文字溢出（Bug）

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

---

## Issue #5：API 配额超限（Config）

**TL;DR**：点击「开始搜索」后报错 `CUQPS_HAS_EXCEEDED_THE_LIMIT`，表示高德地图 API 调用配额已用完。

### 类型 / 优先级

- **Type**：Config
- **Priority**：High
- **Effort**：Low

### 当前状态 vs 预期结果

**当前状态**：
- 地图显示正常
- 地址搜索功能正常
- 点击「开始搜索」后报错：`CUQPS_HAS_EXCEEDED_THE_LIMIT`

**预期结果**：
- 点击「开始搜索」后，正常返回周边 POI 结果

### 根因分析

**问题核心**：高德地图 Web 服务的日配额已用完

根据高德开放平台的规则：
- 免费账户有配额限制
- 如果短时间内大量调用，会触发配额限制
- 错误码 `CUQPS_HAS_EXCEEDED_THE_LIMIT` 表示「并发量超限」或「日请求量超限」

### 解决方案

**方案 1：等待配额重置**
- 高德地图 Web 服务的日配额通常在**每天凌晨 0 点重置**
- 可以等到明天再测试

**方案 2：优化搜索参数**
- 减少同时搜索的 POI 类型数量
- 降低搜索半径
- 减少分页请求次数

**方案 3：提升配额**
- 登录高德开放平台
- 进入「控制台」→「费用中心」
- 查看当前配额使用情况
- 如需更多配额，可以申请付费升级

### 相关文件

- `js/search-manager.js`
- `js/config.js`

### 依赖条件

- 等待配额重置或手动提升配额

### 待用户确认

1. 是否有高德开放平台的付费账户？
2. 还是等待明天配额重置后测试？

---

***

## Issue 处理优先级

1. **~~Issue #1~~**：✅ 已修复 - 地图加载问题
2. **~~Issue #2~~**：✅ 已修复 - Web 服务 Key 配置
3. **Issue #3（Medium）**：POI 自动补全功能
4. **Issue #4（Low）**：右侧栏文字溢出
5. **Issue #5（Config）**：API 配额超限，需等待或提升配额


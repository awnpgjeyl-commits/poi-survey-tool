# 地块周边业态调查工具 - Project Prompt v2.0

**项目名称**: POI 地块周边业态调查 Web 应用  
**目标用户**: 房地产开发商、商业地产顾问、城市规划师  
**核心功能**: 基于高德地图 POI 数据的交互式地块周边业态查询和 Excel 导出工具  
**部署方式**: 纯 HTML/CSS/JavaScript 静态网站（可公开发布）  
**技术栈**: Vanilla JavaScript + 高德地图 API（无需 Node.js/React）

---

## 一、项目概述

本项目旨在构建一个 **可公开发布的 Web 应用**，帮助用户快速、高效地调查指定地块周边 5 公里范围内的相关业态功能及项目名称。用户可以在地图上定位项目位置，设定搜索半径，选择预设业态或自定义输入高德 POI 代码，一键获取并导出 Excel 列表。

### 核心特性

- ✅ **无依赖部署**: 纯 HTML/CSS/JavaScript，无需 Node.js、npm 或任何构建工具
- ✅ **可公开发布**: 支持直接上传到 GitHub Pages、Netlify、Vercel 等静态托管平台
- ✅ **预设业态分类**: 7 个常用业态快速勾选
- ✅ **自定义 POI 输入**: 用户可输入高德 POI 代码，灵活扩展搜索范围
- ✅ **内嵌 POI 查询工具**: 集成高德 POI 分类查询，用户可直接查看 POI 编码对应关系
- ✅ **Excel 导出**: 一键导出搜索结果
- ✅ **文件结构可迁移**: 易于未来迁移到 React/Vue 等框架

### 核心痛点

高德地图的 POI 分类体系包含 **23 个一级分类、267 个二级分类、869 个三级分类**，分类过于细碎。用户需要的是**聚合后的业态分类**（如：写字楼、产业园、商业综合体、酒店等），而不是原始的 POI 细分类型。同时，用户可能需要查询不在预设列表中的其他 POI 类型。

---

## 二、POI 分类映射方案

### 2.1 高德 POI 分类体系结构

高德 POI 采用 **三级分类**，格式为：`一级分类;二级分类;三级分类`

**示例**：
- `120201`: `商务住宅;楼宇;商务写字楼`
- `120100`: `商务住宅;产业园区;产业园区`
- `200100`: `商业;购物;购物中心`
- `200101`: `商业;购物;百货`
- `100100`: `住宿服务;宾馆酒店;宾馆酒店`

### 2.2 预设业态分类映射表

根据用户需求，将高德 POI 细分类型映射到 **7 个核心业态分类**：

| 用户业态分类 | 对应高德 POI 类型编码 | 说明 |
|:---|:---|:---|
| **写字楼** | `120201` | 商务住宅 > 楼宇 > 商务写字楼 |
| **产业园** | `120100` | 商务住宅 > 产业园区 > 产业园区 |
| **商业综合体** | `200100`, `200101`, `200102` | 商业 > 购物 > 购物中心、百货、大型超市 |
| **酒店** | `100100`, `100101`, `100102`, `100103`, `100104`, `100105` | 住宿服务 > 宾馆酒店 > 各星级酒店、经济型连锁酒店 |
| **教育机构** | `141201`, `141202`, `141203`, `141204` | 科教文化服务 > 学校 > 高等院校、中学、小学、幼儿园 |
| **医疗设施** | `170000` 系列 | 医疗卫生 > 综合医院、专科医院、诊所等 |
| **餐饮娱乐** | `200200`, `200201`, `200202`, `200203` | 商业 > 餐饮 > 中餐厅、西餐厅、快餐厅等 |
| **其他 POI** | 用户自定义输入 | 允许用户输入任意高德 POI 编码 |

### 2.3 映射表的实现方式

在 JavaScript 中，使用 **JSON 配置文件** 存储映射关系：

```javascript
// poi-config.js
const POI_CATEGORY_MAPPING = {
  '写字楼': ['120201'],
  '产业园': ['120100'],
  '商业综合体': ['200100', '200101', '200102'],
  '酒店': ['100100', '100101', '100102', '100103', '100104', '100105'],
  '教育机构': ['141201', '141202', '141203', '141204'],
  '医疗设施': ['170000'],
  '餐饮娱乐': ['200200', '200201', '200202', '200203'],
  '其他': []  // 用户自定义输入
};

// 反向映射：POI 编码 -> 用户业态分类
const POI_CODE_TO_CATEGORY = {};
Object.entries(POI_CATEGORY_MAPPING).forEach(([category, codes]) => {
  codes.forEach(code => {
    POI_CODE_TO_CATEGORY[code] = category;
  });
});
```

### 2.4 自定义 POI 输入功能

用户可以在"其他 POI"选项中输入高德 POI 代码，支持以下格式：

- **单个编码**: `120201`
- **多个编码**: `120201,120100,200100` 或 `120201|120100|200100`
- **编码范围**: `120200-120203`（自动展开为 `120200,120201,120202,120203`）

### 2.5 内嵌高德 POI 查询工具

在应用中提供一个 **POI 查询面板**，用户可以：

1. **浏览 POI 分类表**: 显示所有高德 POI 分类及对应编码
2. **搜索 POI**: 按关键词搜索（如输入"写字楼"查找对应编码）
3. **复制编码**: 一键复制 POI 编码到自定义输入框
4. **下载 POI 表**: 提供完整的高德 POI 分类 Excel 文件下载

---

## 三、技术架构

### 3.1 前端技术栈

- **HTML5**: 页面结构
- **CSS3 + Flexbox/Grid**: 响应式布局
- **Vanilla JavaScript**: 无框架依赖
- **高德地图 JS API 2.0**: 地图展示和交互
- **XLSX 库** (CDN 引入): Excel 导出
- **Axios 库** (CDN 引入): HTTP 请求

### 3.2 文件结构设计（可迁移架构）

```
poi-survey-tool/
├── index.html                 # 主页面
├── css/
│   ├── style.css             # 主样式表
│   ├── map.css               # 地图相关样式
│   ├── sidebar.css           # 侧边栏样式
│   └── responsive.css        # 响应式设计
├── js/
│   ├── config.js             # 配置文件（POI 映射表、API Key 等）
│   ├── poi-data.js           # 高德 POI 分类数据（可选，用于离线查询）
│   ├── utils.js              # 工具函数（距离计算、数据处理等）
│   ├── map-manager.js        # 地图管理模块
│   ├── search-manager.js     # 搜索管理模块
│   ├── ui-manager.js         # UI 交互管理模块
│   ├── export-manager.js     # Excel 导出模块
│   ├── poi-query-panel.js    # POI 查询面板模块
│   └── app.js                # 应用入口
├── data/
│   ├── poi-categories.json   # 完整的高德 POI 分类表（可选）
│   └── poi-mapping.json      # 用户业态映射表
├── assets/
│   ├── icons/                # 图标资源
│   └── images/               # 图片资源
├── README.md                 # 项目说明
├── DEPLOYMENT.md             # 部署指南
└── MIGRATION.md              # 迁移到 React 的指南
```

### 3.3 模块化设计

每个 JavaScript 模块都是独立的，便于未来迁移到框架：

```javascript
// map-manager.js - 地图管理模块
class MapManager {
  constructor(containerId, config) {
    this.map = null;
    this.config = config;
    this.containerId = containerId;
    this.init();
  }

  init() {
    // 初始化地图
  }

  setCenter(location) {
    // 设置地图中心
  }

  drawCircle(center, radius) {
    // 绘制圆形
  }

  addMarker(poi) {
    // 添加标记
  }

  clearMarkers() {
    // 清空标记
  }
}

// search-manager.js - 搜索管理模块
class SearchManager {
  constructor(config) {
    this.config = config;
    this.results = [];
  }

  async search(center, radius, poiTypes) {
    // 调用高德 API 搜索
  }

  filterResults(category) {
    // 按业态筛选结果
  }

  deduplicateResults() {
    // 数据去重
  }
}

// ui-manager.js - UI 交互管理模块
class UIManager {
  constructor() {
    this.elements = {};
    this.cacheElements();
  }

  cacheElements() {
    // 缓存 DOM 元素
  }

  bindEvents() {
    // 绑定事件
  }

  updateResults(data) {
    // 更新结果表格
  }
}

// export-manager.js - Excel 导出模块
class ExportManager {
  static exportToExcel(data, fileName) {
    // 导出 Excel
  }
}

// poi-query-panel.js - POI 查询面板模块
class POIQueryPanel {
  constructor(config) {
    this.config = config;
    this.init();
  }

  init() {
    // 初始化 POI 查询面板
  }

  searchPOI(keyword) {
    // 搜索 POI
  }

  copyCode(code) {
    // 复制编码到自定义输入框
  }
}

// app.js - 应用入口
class POISurveyApp {
  constructor(config) {
    this.config = config;
    this.mapManager = new MapManager('map-container', config);
    this.searchManager = new SearchManager(config);
    this.uiManager = new UIManager();
    this.exportManager = ExportManager;
    this.poiQueryPanel = new POIQueryPanel(config);
    this.init();
  }

  init() {
    this.uiManager.bindEvents();
    this.attachEventListeners();
  }

  attachEventListeners() {
    // 绑定全局事件
  }
}

// 应用启动
document.addEventListener('DOMContentLoaded', () => {
  const app = new POISurveyApp(CONFIG);
});
```

### 3.4 核心功能模块

#### 模块 1: 地图交互模块 (map-manager.js)
- 初始化高德地图
- 支持地址搜索和地图点击定位
- 在地图上绘制 5km 圆形覆盖范围
- 显示搜索结果的 POI 标记点
- 支持缩放和平移

#### 模块 2: POI 搜索模块 (search-manager.js)
- 调用高德地图 **周边搜索 API**（Around Search）
- 根据用户选择的业态类型，组装 POI 类型编码
- 支持分页加载（高德 API 单次最多返回 20 条）
- 数据去重和清洗
- 支持自定义 POI 编码输入

#### 模块 3: 业态筛选模块 (ui-manager.js)
- 提供 **多选复选框** 界面，用户可勾选需要的业态
- 支持"全选"和"清空"快捷操作
- 提供"其他 POI"输入框，用户可输入自定义 POI 编码
- 实时更新选中的 POI 类型编码列表
- 验证用户输入的 POI 编码格式

#### 模块 4: POI 查询面板模块 (poi-query-panel.js)
- 显示完整的高德 POI 分类表
- 支持按关键词搜索 POI
- 一键复制 POI 编码到自定义输入框
- 提供 POI 分类表下载

#### 模块 5: 结果展示模块 (ui-manager.js)
- 表格形式展示搜索结果
- 显示字段：项目名称、业态分类、地址、距离中心点的直线距离、坐标
- 支持按距离排序
- 支持分页显示

#### 模块 6: 数据导出模块 (export-manager.js)
- 将搜索结果转换为 Excel 格式
- 包含表头：项目名称、业态分类、地址、距离(km)、纬度、经度、高德 POI ID
- 一键下载 Excel 文件

---

## 四、用户界面设计

### 4.1 布局结构

```
┌─────────────────────────────────────────────────────────┐
│                     地块周边业态调查工具                    │
├──────────────────┬──────────────────────────────────────┤
│   控制面板       │                                       │
│  (左侧 300px)    │         高德地图 (右侧主体)           │
│                  │                                       │
│ 📍 地址搜索      │  ┌─────────────────────────────────┐ │
│ 搜索框 + 按钮    │  │                                 │ │
│                  │  │   [地图展示区域]                 │ │
│ 🎯 搜索半径      │  │   - 中心点标记                   │ │
│ 半径滑块         │  │   - 5km 圆形覆盖范围             │ │
│ (1-10 km)        │  │   - POI 标记点                   │ │
│                  │  │                                 │ │
│ 🏢 业态分类      │  └─────────────────────────────────┘ │
│ ☑ 写字楼         │                                       │
│ ☑ 产业园         │  ┌─────────────────────────────────┐ │
│ ☑ 商业综合体     │  │ 搜索结果表格                     │ │
│ ☑ 酒店           │  │ 项目名 | 业态 | 地址 | 距离      │ │
│ ☑ 教育机构       │  │ ──────────────────────────────  │ │
│ ☑ 医疗设施       │  │ [结果行 1]                       │ │
│ ☑ 餐饮娱乐       │  │ [结果行 2]                       │ │
│                  │  │ ...                              │ │
│ 📝 其他 POI      │  │ [加载更多] [导出 Excel]          │ │
│ 输入框 + 帮助    │  │ [POI 查询工具]                   │ │
│ (支持多个编码)   │  └─────────────────────────────────┘ │
│                  │                                       │
│ [全选] [清空]    │                                       │
│ [搜索] 按钮      │                                       │
│                  │                                       │
└──────────────────┴──────────────────────────────────────┘
```

### 4.2 "其他 POI"输入框功能

用户可以在"其他 POI"输入框中：

1. **输入单个编码**: `120201` → 搜索商务写字楼
2. **输入多个编码**: `120201,120100,200100` → 同时搜索多种业态
3. **输入编码范围**: `120200-120203` → 自动展开为 `120200,120201,120202,120203`
4. **混合输入**: `120201,200100-200102` → 混合单个和范围编码

输入框下方提供一个 **"查看 POI 分类"** 按钮，点击打开 POI 查询面板。

### 4.3 POI 查询面板

POI 查询面板是一个 **模态框**，包含：

1. **POI 分类表**: 显示所有高德 POI 分类及对应编码（可搜索、可排序）
2. **搜索框**: 按关键词搜索 POI（如输入"写字楼"查找对应编码）
3. **复制按钮**: 一键复制 POI 编码到自定义输入框
4. **下载按钮**: 下载完整的高德 POI 分类 Excel 文件

### 4.4 交互流程

1. **用户输入地址** → 地图自动定位到该地址
2. **用户调整搜索半径** → 地图上的圆形覆盖范围实时更新
3. **用户选择业态** → 勾选预设业态或在"其他 POI"中输入自定义编码
4. **用户点击"查看 POI 分类"** → 打开 POI 查询面板，浏览或搜索 POI
5. **用户点击"搜索"** → 应用调用高德 API，获取 POI 数据
6. **结果展示** → 表格显示所有符合条件的项目
7. **用户导出** → 点击"导出 Excel"下载文件

---

## 五、高德地图 API 集成

### 5.1 必需的 API 密钥

- **高德地图 Key**: 用于调用地图 JS API 和 Web 服务 API

### 5.2 关键 API 接口

#### 1. 周边搜索 API (Around Search)
**用途**: 在指定中心点周围搜索 POI

**请求参数**:
- `location`: 中心点坐标 (lng,lat)
- `radius`: 搜索半径 (单位：米)
- `types`: POI 类型编码 (多个用 `|` 分隔)
- `pagesize`: 每页返回条数 (最多 20)
- `pagenum`: 页码
- `extensions`: 返回数据详度 (`base` 或 `all`)

**示例**:
```
https://restapi.amap.com/v3/place/around?
  location=116.481488,39.990464
  &radius=5000
  &types=120201|120100|200100
  &pagesize=20
  &pagenum=1
  &extensions=all
  &key=YOUR_API_KEY
```

**返回字段**:
- `name`: POI 名称
- `type`: POI 类型编码
- `location`: 坐标 (lng,lat)
- `address`: 详细地址
- `distance`: 距离中心点的距离 (单位：米)

#### 2. 地理编码 API (Geocoding)
**用途**: 将地址转换为坐标

**请求参数**:
- `address`: 地址文本
- `city`: 城市名称

#### 3. 地图 JS API
**用途**: 前端地图展示和交互

**关键方法**:
```javascript
// 初始化地图
const map = new AMap.Map('map-container', {
  zoom: 12,
  center: [116.481488, 39.990464]
});

// 添加标记
const marker = new AMap.Marker({
  position: [116.481488, 39.990464],
  title: '项目名称'
});
marker.setMap(map);

// 绘制圆形
const circle = new AMap.Circle({
  center: [116.481488, 39.990464],
  radius: 5000,
  fillColor: '#0066ff',
  fillOpacity: 0.1,
  strokeColor: '#0066ff',
  strokeWeight: 2
});
circle.setMap(map);

// 地址搜索
const placeSearch = new AMap.PlaceSearch({
  city: '全国'
});
placeSearch.search('地址', (status, result) => {
  if (status === 'complete' && result.poiList.length > 0) {
    const location = result.poiList[0].location;
    map.setCenter(location);
  }
});
```

---

## 六、数据处理流程

### 6.1 搜索流程

```
用户输入 → 地址转坐标 → 调用周边搜索 API → 获取 POI 列表
  ↓
POI 类型编码映射 → 业态分类 → 数据去重 → 结果排序 → 表格展示
```

### 6.2 自定义 POI 编码处理

```
用户输入 (如: "120201,200100-200102")
  ↓
解析编码 (分割 "," 和 "-")
  ↓
展开范围 (120200-120203 → 120200,120201,120202,120203)
  ↓
验证编码 (检查是否为有效的高德 POI 编码)
  ↓
合并编码 (预设业态编码 + 自定义编码)
  ↓
调用 API
```

### 6.3 数据去重

由于高德 API 可能返回重复数据，需要按 **POI ID** 进行去重：

```javascript
const uniquePOIs = Array.from(
  new Map(pois.map(poi => [poi.id, poi])).values()
);
```

### 6.4 距离计算

高德 API 返回的 `distance` 字段已是直线距离（单位：米），需要转换为公里：

```javascript
const distanceKm = (poi.distance / 1000).toFixed(2);
```

---

## 七、Excel 导出格式

### 导出表头

| 序号 | 项目名称 | 业态分类 | 详细地址 | 距离中心点(km) | 纬度 | 经度 | 高德POI ID |
|:---|:---|:---|:---|:---|:---|:---|:---|
| 1 | 项目 A | 写字楼 | 北京市朝阳区... | 2.35 | 39.9904 | 116.4815 | 12345678 |
| 2 | 项目 B | 商业综合体 | 北京市朝阳区... | 3.12 | 39.9850 | 116.4900 | 87654321 |

### 使用 XLSX 库导出

```javascript
// 引入 XLSX 库（CDN）
// <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.min.js"></script>

class ExportManager {
  static exportToExcel(data, fileName) {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'POI 数据');
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  }
}

// 调用
const excelData = results.map((poi, index) => ({
  序号: index + 1,
  项目名称: poi.name,
  业态分类: POI_CODE_TO_CATEGORY[poi.type] || '其他',
  详细地址: poi.address,
  距离中心点km: (poi.distance / 1000).toFixed(2),
  纬度: poi.location.lat,
  经度: poi.location.lng,
  高德POIID: poi.id
}));

ExportManager.exportToExcel(excelData, `地块周边业态_${new Date().toISOString().split('T')[0]}`);
```

---

## 八、配置文件示例

### config.js

```javascript
// 配置文件
const CONFIG = {
  // 高德地图 API Key
  AMAP_KEY: 'YOUR_AMAP_KEY_HERE',
  
  // 默认搜索半径（公里）
  DEFAULT_RADIUS: 5,
  
  // 地图初始缩放级别
  MAP_ZOOM: 12,
  
  // POI 业态分类映射
  POI_CATEGORIES: {
    '写字楼': ['120201'],
    '产业园': ['120100'],
    '商业综合体': ['200100', '200101', '200102'],
    '酒店': ['100100', '100101', '100102', '100103', '100104', '100105'],
    '教育机构': ['141201', '141202', '141203', '141204'],
    '医疗设施': ['170000'],
    '餐饮娱乐': ['200200', '200201', '200202', '200203']
  },
  
  // 高德 API 端点
  AMAP_API_ENDPOINTS: {
    AROUND_SEARCH: 'https://restapi.amap.com/v3/place/around',
    GEOCODING: 'https://restapi.amap.com/v3/geocode/geo'
  },
  
  // 应用配置
  APP: {
    MAX_RESULTS: 500,
    PAGE_SIZE: 20,
    DEBOUNCE_DELAY: 300
  }
};
```

---

## 九、部署指南

### 9.1 本地测试

1. 在项目根目录启动一个简单的 HTTP 服务器：
   ```bash
   # 使用 Python 3
   python3 -m http.server 8000
   
   # 或使用 Python 2
   python -m SimpleHTTPServer 8000
   
   # 或使用 Node.js (如果已安装)
   npx http-server
   ```

2. 在浏览器中打开 `http://localhost:8000`

### 9.2 公开发布

#### 方案 1: GitHub Pages（推荐）
1. 创建 GitHub 仓库 `poi-survey-tool`
2. 上传所有文件到 `main` 分支
3. 在仓库设置中启用 GitHub Pages，选择 `main` 分支
4. 访问 `https://yourusername.github.io/poi-survey-tool`

#### 方案 2: Netlify
1. 连接 GitHub 仓库到 Netlify
2. 构建设置：无需构建命令（保持默认）
3. 发布目录：`.`（根目录）
4. 自动部署

#### 方案 3: Vercel
1. 导入 GitHub 仓库到 Vercel
2. 框架选择：其他（Other）
3. 自动部署

### 9.3 配置 API Key

为了安全起见，建议将 API Key 存储在环境变量中：

1. 创建 `.env` 文件（本地开发）：
   ```
   AMAP_KEY=YOUR_AMAP_KEY_HERE
   ```

2. 在 `config.js` 中读取环境变量：
   ```javascript
   const CONFIG = {
     AMAP_KEY: process.env.AMAP_KEY || 'YOUR_AMAP_KEY_HERE',
     // ...
   };
   ```

3. 在部署平台中配置环境变量（GitHub Secrets、Netlify 环境变量等）

---

## 十、文件结构可迁移性

### 10.1 迁移到 React 的步骤

该项目设计支持平滑迁移到 React。迁移步骤如下：

1. **创建 React 项目**:
   ```bash
   npx create-react-app poi-survey-tool
   cd poi-survey-tool
   ```

2. **复制模块**:
   - 将 `js/map-manager.js` 转换为 React Hook: `src/hooks/useMapManager.js`
   - 将 `js/search-manager.js` 转换为 React Hook: `src/hooks/useSearchManager.js`
   - 将 `js/ui-manager.js` 转换为 React 组件: `src/components/UIManager.jsx`
   - 将 `js/export-manager.js` 转换为 React 工具: `src/utils/exportManager.js`

3. **创建 React 组件**:
   ```
   src/
   ├── components/
   │   ├── MapContainer.jsx
   │   ├── SidebarPanel.jsx
   │   ├── CategorySelector.jsx
   │   ├── ResultsTable.jsx
   │   ├── POIQueryPanel.jsx
   │   └── App.jsx
   ├── hooks/
   │   ├── useMapManager.js
   │   ├── useSearchManager.js
   │   └── useUIManager.js
   ├── utils/
   │   ├── config.js
   │   ├── exportManager.js
   │   └── utils.js
   └── App.css
   ```

4. **迁移样式**:
   - 将 `css/` 中的样式转换为 CSS Modules 或 styled-components

5. **迁移数据**:
   - 将 `data/` 中的 JSON 文件复制到 `src/data/`

### 10.2 迁移到 Vue 的步骤

类似的迁移步骤也适用于 Vue：

1. **创建 Vue 项目**:
   ```bash
   npm create vite@latest poi-survey-tool -- --template vue
   cd poi-survey-tool
   npm install
   ```

2. **转换为 Vue Composables**:
   - `js/map-manager.js` → `src/composables/useMapManager.js`
   - `js/search-manager.js` → `src/composables/useSearchManager.js`

3. **创建 Vue 组件**:
   ```
   src/
   ├── components/
   │   ├── MapContainer.vue
   │   ├── SidebarPanel.vue
   │   ├── CategorySelector.vue
   │   ├── ResultsTable.vue
   │   ├── POIQueryPanel.vue
   │   └── App.vue
   ├── composables/
   │   ├── useMapManager.js
   │   ├── useSearchManager.js
   │   └── useUIManager.js
   ├── utils/
   │   ├── config.js
   │   ├── exportManager.js
   │   └── utils.js
   └── App.vue
   ```

---

## 十一、开发注意事项

### 11.1 API 调用限制

- 高德地图免费版 API 有**日调用量限制**（通常为 100 万次/天）
- 周边搜索单次最多返回 20 条结果，需要分页多次调用
- 建议实现**请求缓存**和**防抖**机制，避免重复调用

### 11.2 CORS 问题

高德地图 JS API 不存在 CORS 问题（直接加载），但 Web 服务 API 调用需要注意：
- 如果从浏览器直接调用 Web 服务 API，需要配置 **IP 白名单**
- 建议在后端代理 API 调用，或使用高德提供的 **JSONP** 方式

### 11.3 性能优化

- **地图加载**: 使用异步加载，避免阻塞页面渲染
- **搜索结果**: 实现虚拟滚动（Virtual Scrolling），处理大量数据时保持流畅
- **API 调用**: 实现请求队列和速率限制，避免频繁调用
- **缓存**: 使用 LocalStorage 缓存搜索历史和结果

### 11.4 用户体验

- 搜索过程中显示 **加载动画**
- 提供 **搜索历史** 快速重新搜索
- 支持 **导出前预览** 功能
- 实现 **错误提示** 和 **重试机制**
- 支持 **键盘快捷键**（如 Enter 搜索、Esc 关闭面板）

### 11.5 浏览器兼容性

- 支持 Chrome、Firefox、Safari、Edge 的最新版本
- 使用 Polyfill 支持 IE 11（如需要）
- 测试响应式设计在各种设备上的表现

---

## 十二、扩展功能（可选）

1. **热力图展示**: 显示不同业态的密度分布
2. **路线规划**: 计算从中心点到各 POI 的驾车/步行距离
3. **数据对比**: 支持多个地块的业态对比分析
4. **自定义业态**: 允许用户自定义业态分类映射
5. **数据缓存**: 本地保存历史搜索结果，支持离线查看
6. **批量导入**: 支持导入多个地块地址，批量生成报告
7. **地图标注**: 支持在地图上标注自定义位置
8. **数据分析**: 提供业态分布图表和统计分析

---

## 十三、项目交付清单

- ✅ 完整的 HTML/CSS/JavaScript 项目代码
- ✅ POI 分类映射表配置文件
- ✅ 高德地图 API 集成模块
- ✅ 搜索、展示、导出功能
- ✅ 自定义 POI 输入功能
- ✅ 内嵌 POI 查询面板
- ✅ 响应式 UI 设计（支持桌面、平板、手机）
- ✅ 使用文档和 API 集成说明
- ✅ 部署指南（GitHub Pages、Netlify、Vercel）
- ✅ 迁移指南（React、Vue）

---

## 十四、参考资源

- [高德地图 API 官方文档](https://amap.apifox.cn/doc-539873)
- [高德地图 POI 分类编码表](https://amap.apifox.cn/doc-541084)
- [高德地图 JS API 2.0](https://a.amap.com/jsapi/static/doc/index.html)
- [XLSX 库文档](https://github.com/SheetJS/sheetjs)
- [Vanilla JavaScript 最佳实践](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide)
- [响应式设计指南](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)
- [GitHub Pages 部署指南](https://pages.github.com/)
- [Netlify 部署指南](https://docs.netlify.com/)

---

**项目状态**: 待 Vibe Coding 实现  
**最后更新**: 2026-04-08  
**版本**: v2.0

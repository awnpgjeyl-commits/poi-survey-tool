const CONFIG = {
    BAIDU_AK: 'Sr3FSlQEfJVlMl6zupdMRCvXmFGc9xR2',

    DEFAULT_RADIUS: 5,
    MAX_RADIUS: 10,
    MIN_RADIUS: 1,

    MAP_ZOOM: 12,
    MIN_ZOOM: 3,
    MAX_ZOOM: 18,

    BAIDU_POI_CATEGORIES: {
        '美食': ['中餐厅', '外国餐厅', '小吃快餐店', '蛋糕甜品店', '咖啡厅', '茶座', '酒吧'],
        '酒店': ['星级酒店', '快捷酒店', '公寓式酒店', '民宿'],
        '购物': ['购物中心', '百货商场', '超市', '便利店', '商铺', '市场'],
        '生活服务': ['通讯营业厅', '邮局', '物流公司', '房产中介', '维修点', '家政服务'],
        '医疗': ['综合医院', '专科医院', '诊所', '药店', '体检机构'],
        '教育培训': ['高等院校', '中学', '小学', '幼儿园', '培训机构'],
        '公司企业': ['公司', '园区', '写字楼'],
        '交通设施': ['机场', '火车站', '地铁站', '停车场', '加油站'],
        '金融': ['银行', 'ATM', '信用社', '投资理财'],
        '房地产': ['写字楼', '住宅区', '宿舍'],
        '政府机构': ['中央机构', '各级政府', '行政单位', '公检法机构'],
        '休闲娱乐': ['电影院', 'KTV', '剧院', '洗浴按摩', '休闲广场'],
        '运动健身': ['体育场馆', '健身中心'],
        '旅游景点': ['公园', '动物园', '植物园', '博物馆', '文物古迹', '风景区']
    },

    AMAP_API_ENDPOINTS: {
        AROUND_SEARCH: 'https://restapi.amap.com/v3/place/around',
        GEOCODING: 'https://restapi.amap.com/v3/geocode/geo',
        PLACE_SEARCH: 'https://restapi.amap.com/v3/place/text'
    },

    APP: {
        MAX_RESULTS: 500,
        PAGE_SIZE: 20,
        DEBOUNCE_DELAY: 300,
        REQUEST_TIMEOUT: 10000
    },

    UI: {
        RESULTS_PER_PAGE: 20,
        SORT_BY_DISTANCE: true
    }
};

CONFIG.POI_CODE_TO_CATEGORY = {};
Object.entries(CONFIG.POI_CATEGORIES).forEach(([category, codes]) => {
    codes.forEach(code => {
        CONFIG.POI_CODE_TO_CATEGORY[code] = category;
    });
});

const POI_CATEGORY_MAPPING = CONFIG.POI_CATEGORIES;
const POI_CODE_TO_CATEGORY = CONFIG.POI_CODE_TO_CATEGORY;

const BAIDU_AK = CONFIG.BAIDU_AK;
const DEFAULT_RADIUS = CONFIG.DEFAULT_RADIUS;
const MAX_RADIUS = CONFIG.MAX_RADIUS;
const MAP_ZOOM = CONFIG.MAP_ZOOM;
const APP_CONFIG = CONFIG.APP;

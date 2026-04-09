const CONFIG = {
    AMAP_KEY: '8d2ec8f6481066c9caca19e60a91b616',
    AMAP_WEB_SERVICE_KEY: 'f7350cc1851c2cfaf6ced3375537dba4',
    SECURITY_CODE: 'e1bd931b49ec6dbb047b6ad21d30296a',

    DEFAULT_RADIUS: 5,
    MAX_RADIUS: 10,
    MIN_RADIUS: 1,

    MAP_ZOOM: 12,
    MIN_ZOOM: 3,
    MAX_ZOOM: 18,

    POI_CATEGORIES: {
        '写字楼': ['120201'],
        '产业园': ['120100'],
        '商业综合体': ['200100', '200101', '200102'],
        '酒店': ['100100', '100101', '100102', '100103', '100104', '100105'],
        '教育机构': ['141201', '141202', '141203', '141204'],
        '医疗设施': ['170000'],
        '餐饮娱乐': ['200200', '200201', '200202', '200203']
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

const AMAP_KEY = CONFIG.AMAP_KEY;
const AMAP_WEB_SERVICE_KEY = CONFIG.AMAP_WEB_SERVICE_KEY;
const SECURITY_CODE = CONFIG.SECURITY_CODE;
const DEFAULT_RADIUS = CONFIG.DEFAULT_RADIUS;
const MAX_RADIUS = CONFIG.MAX_RADIUS;
const MAP_ZOOM = CONFIG.MAP_ZOOM;
const AMAP_API_ENDPOINTS = CONFIG.AMAP_API_ENDPOINTS;
const APP_CONFIG = CONFIG.APP;

class SearchManager {
    constructor(config) {
        this.config = config;
        this.results = [];
        this.loading = false;
        this.totalCount = 0;
    }

    async search(center, radius, selectedCategories, customPoiCodes = '') {
        if (!center) {
            throw new Error('请先在地图上定位中心点');
        }

        if (!selectedCategories || selectedCategories.length === 0) {
            if (!customPoiCodes || customPoiCodes.trim() === '') {
                throw new Error('请至少选择一个业态分类');
            }
        }

        this.loading = true;
        this.results = [];

        // 百度地图使用分类名称
        const poiTypes = selectedCategories.length > 0 ? selectedCategories : customPoiCodes.split(',').map(s => s.trim());
        
        if (!poiTypes || poiTypes.length === 0) {
            throw new Error('无效的 POI 类型');
        }

        const radiusMeters = radius * 1000;
        const location = center;

        try {
            const allResults = await this.fetchAllPages(location, radiusMeters, poiTypes);

            this.results = this.processResults(allResults);
            this.totalCount = this.results.length;

            this.results = sortPOIsByDistance(this.results, true);

            return this.results;
        } catch (error) {
            console.error('搜索失败:', error);
            throw error;
        } finally {
            this.loading = false;
        }
    }

    async fetchAllPages(location, radius, poiTypes) {
        const allPOIs = [];
        let pageNum = 1;
        const maxPages = Math.ceil(this.config.APP.MAX_RESULTS / this.config.APP.PAGE_SIZE);

        // 百度地图 API 每次返回固定数量，需要分页获取
        while (pageNum <= maxPages) {
            const pageResults = await this.fetchPage(location, radius, poiTypes, pageNum);

            if (pageResults && pageResults.length > 0) {
                allPOIs.push(...pageResults);

                if (pageResults.length < this.config.APP.PAGE_SIZE) {
                    break;
                } else {
                    pageNum++;
                }
            } else {
                break;
            }
        }

        return allPOIs;
    }

    async fetchPage(location, radius, poiTypes, pageNum) {
        // 百度地图周边搜索 API
        const url = 'https://api.map.baidu.com/place/v2/search';
        
        // 合并所有 POI 类型，用 '|' 连接
        const typesString = poiTypes.join('|');

        const params = {
            query: typesString,
            scope: 2,
            page_size: this.config.APP.PAGE_SIZE,
            page_num: pageNum - 1,
            location: `${location.lat},${location.lng}`,
            radius: radius,
            ak: this.config.BAIDU_AK || 'Sr3FSlQEfJVlMl6zupdMRCvXmFGc9xR2',
            output: 'json'
        };

        try {
            const response = await axios.get(url, {
                params: params,
                timeout: this.config.APP.REQUEST_TIMEOUT
            });

            if (response.data && response.data.status === 0) {
                if (response.data.results && response.data.results.length > 0) {
                    return response.data.results.map(poi => ({
                        name: poi.name,
                        location: new BMap.Point(poi.location.lng, poi.location.lat),
                        address: poi.address,
                        category: poi.detail_info?.type || poi.type || '',
                        distance: poi.distance || 0,
                        telephone: poi.telephone || '',
                        uid: poi.uid
                    }));
                }
                return [];
            } else {
                const errorMsg = response.data?.message || 'API 返回错误';
                throw new Error(errorMsg);
            }
        } catch (error) {
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            }
            throw error;
        }
    }

    processResults(pois) {
        if (!pois || pois.length === 0) {
            return [];
        }

        const uniquePOIs = [];
        const seenNames = new Set();

        pois.forEach(poi => {
            const key = `${poi.name}_${poi.address}`;
            if (!seenNames.has(key)) {
                seenNames.add(key);
                uniquePOIs.push(poi);
            }
        });

        return uniquePOIs.map((poi, index) => ({
            id: index + 1,
            name: poi.name,
            category: poi.category,
            address: poi.address,
            distance: (poi.distance / 1000).toFixed(2),
            location: poi.location,
            telephone: poi.telephone,
            uid: poi.uid
        }));
    }

    getCategoryStats() {
        const stats = {};

        this.results.forEach(poi => {
            const category = poi.category || '未知';
            if (!stats[category]) {
                stats[category] = 0;
            }
            stats[category]++;
        });

        return stats;
    }
}

window.SearchManager = SearchManager;

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

        const poiTypes = buildPOITypesString(selectedCategories, customPoiCodes);
        if (!poiTypes) {
            throw new Error('无效的 POI 类型');
        }

        const radiusMeters = radius * 1000;
        const location = `${center.getLng()},${center.getLat()}`;

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
        let page = 1;
        let hasMore = true;
        const maxPages = Math.ceil(this.config.APP.MAX_RESULTS / this.config.APP.PAGE_SIZE);

        while (hasMore && page <= maxPages) {
            const pageResults = await this.fetchPage(location, radius, poiTypes, page);

            if (pageResults && pageResults.length > 0) {
                allPOIs.push(...pageResults);

                if (pageResults.length < this.config.APP.PAGE_SIZE) {
                    hasMore = false;
                } else {
                    page++;
                }
            } else {
                hasMore = false;
            }
        }

        return allPOIs;
    }

    async fetchPage(location, radius, poiTypes, pageNum) {
        const params = {
            key: AMAP_WEB_SERVICE_KEY,
            location: location,
            radius: radius,
            types: poiTypes,
            pagesize: this.config.APP.PAGE_SIZE,
            pagenum: pageNum,
            extensions: 'all'
        };

        try {
            const response = await axios.get(AMAP_API_ENDPOINTS.AROUND_SEARCH, {
                params: params,
                timeout: this.config.APP.REQUEST_TIMEOUT
            });

            if (response.data && response.data.status === '1') {
                if (response.data.pois && response.data.pois.length > 0) {
                    return response.data.pois;
                }
                return [];
            } else {
                const errorMsg = response.data?.info || 'API 返回错误';
                throw new Error(errorMsg);
            }
        } catch (error) {
            if (error.response?.data?.info) {
                throw new Error(error.response.data.info);
            }
            throw error;
        }
    }

    processResults(pois) {
        const deduplicated = deduplicatePOIs(pois);

        return deduplicated.map(poi => {
            const location = this.parseLocation(poi.location);
            const category = getCategoryByPOICode(poi.type);

            return {
                id: poi.id,
                name: poi.name,
                type: poi.type,
                typecode: poi.typecode,
                category: category,
                address: poi.address || '',
                location: location,
                distance: parseFloat(poi.distance) || 0,
                cityname: poi.cityname || '',
                adname: poi.adname || '',
                pname: poi.pname || ''
            };
        });
    }

    parseLocation(locationStr) {
        if (!locationStr) {
            return { lng: 0, lat: 0 };
        }

        const parts = locationStr.split(',');
        if (parts.length === 2) {
            return {
                lng: parseFloat(parts[0]),
                lat: parseFloat(parts[1])
            };
        }

        return { lng: 0, lat: 0 };
    }

    getResults(page = 1, itemsPerPage = null) {
        const perPage = itemsPerPage || CONFIG.UI.RESULTS_PER_PAGE;
        const startIndex = (page - 1) * perPage;
        const endIndex = startIndex + perPage;

        return {
            items: this.results.slice(startIndex, endIndex),
            total: this.results.length,
            page: page,
            totalPages: Math.ceil(this.results.length / perPage),
            hasNextPage: endIndex < this.results.length,
            hasPrevPage: page > 1
        };
    }

    filterByCategory(category) {
        if (!category) {
            return this.results;
        }
        return this.results.filter(poi => poi.category === category);
    }

    getCategoryStats() {
        const stats = {};
        this.results.forEach(poi => {
            const category = poi.category;
            if (!stats[category]) {
                stats[category] = {
                    count: 0,
                    items: []
                };
            }
            stats[category].count++;
            stats[category].items.push(poi);
        });
        return stats;
    }

    getTotalCount() {
        return this.totalCount;
    }

    clearResults() {
        this.results = [];
        this.totalCount = 0;
    }

    isLoading() {
        return this.loading;
    }
}

window.SearchManager = SearchManager;

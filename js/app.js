class POISurveyApp {
    constructor() {
        this.mapManager = null;
        this.searchManager = null;
        this.uiManager = null;
        this.poiQueryPanel = null;
        this.currentLocationInfo = null;
        this.allResults = [];
        this.init();
    }

    init() {
        this.initModules();
        this.setupEventHandlers();
        this.initMap();
        console.log('地块周边业态调查工具已初始化');
    }

    initModules() {
        this.mapManager = new MapManager('map-container', CONFIG);
        this.searchManager = new SearchManager(CONFIG);
        this.uiManager = new UIManager();
        this.poiQueryPanel = new POIQueryPanel(CONFIG);
    }

    setupEventHandlers() {
        this.uiManager.bindEvents({
            onAddressSearch: (address) => this.handleAddressSearch(address),
            onRadiusChange: (radius) => this.handleRadiusChange(radius),
            onSearch: () => this.handleSearch(),
            onExport: () => this.handleExport(),
            onPOIQuery: () => this.handlePOIQuery()
        });

        this.uiManager.onPageChange = (page) => {
            this.handlePageChange(page);
        };

        this.mapManager.onLocationChange = (lnglat) => {
            this.handleLocationChange(lnglat);
        };

        this.mapManager.onMapClick = (lnglat) => {
            this.handleMapClick(lnglat);
        };
    }

    initMap() {
        const checkMapReady = setInterval(() => {
            if (this.mapManager && this.mapManager.map) {
                clearInterval(checkMapReady);
                console.log('地图已就绪');
            }
        }, 100);

        setTimeout(() => {
            clearInterval(checkMapReady);
        }, 5000);
    }

    async handleAddressSearch(address) {
        if (!address || address.trim() === '') {
            showToast('请输入地址', 'error');
            return;
        }

        this.uiManager.showLoading(true);

        try {
            const result = await this.mapManager.searchAddress(address);

            this.currentLocationInfo = {
                name: result.name,
                address: result.address,
                lng: result.location.getLng(),
                lat: result.location.getLat(),
                city: result.city,
                radius: this.uiManager.getRadius()
            };

            this.uiManager.updateLocationDisplay(this.currentLocationInfo);

            const mapCenter = this.mapManager.getCenter();
            if (mapCenter) {
                const reverseResult = await this.mapManager.reverseGeocode(mapCenter);
                if (reverseResult) {
                    this.currentLocationInfo.fullAddress = reverseResult.address;
                }
            }

        } catch (error) {
            console.error('地址搜索失败:', error);
            showToast('地址搜索失败: ' + error.message, 'error');
        } finally {
            this.uiManager.showLoading(false);
        }
    }

    handleRadiusChange(radius) {
        this.mapManager.setRadius(radius);
    }

    async handleSearch() {
        const center = this.mapManager.getCenter();

        if (!center) {
            showToast('请先在地图上定位中心点', 'error');
            return;
        }

        const selectedCategories = this.uiManager.getSelectedCategories();
        const customPoiCodes = this.uiManager.getCustomPOICodes();

        if ((!selectedCategories || selectedCategories.length === 0) && !customPoiCodes) {
            showToast('请至少选择一个业态分类或输入自定义POI编码', 'error');
            return;
        }

        this.uiManager.showLoading(true);
        this.uiManager.setSearchButtonState(true);

        try {
            const radius = this.uiManager.getRadius();

            const results = await this.searchManager.search(
                center,
                radius,
                selectedCategories,
                customPoiCodes
            );

            this.allResults = results;

            this.mapManager.addPOIMarkers(results);

            this.uiManager.updateResults(results, 1);
            this.uiManager.enableExport(true);

            const stats = this.searchManager.getCategoryStats();
            console.log('搜索完成，分类统计:', stats);

            showToast(`搜索完成，共找到 ${results.length} 个结果`, 'success');

        } catch (error) {
            console.error('搜索失败:', error);
            showToast('搜索失败: ' + error.message, 'error');
        } finally {
            this.uiManager.showLoading(false);
            this.uiManager.setSearchButtonState(false);
        }
    }

    handleExport() {
        if (!this.allResults || this.allResults.length === 0) {
            showToast('没有可导出的数据', 'error');
            return;
        }

        ExportManager.exportToExcel(this.allResults, '地块周边业态调查');
    }

    handlePOIQuery() {
        this.poiQueryPanel.open();
    }

    handleLocationChange(lnglat) {
        console.log('中心点变化:', lnglat.getLng(), lnglat.getLat());
    }

    async handleMapClick(lnglat) {
        const locationInfo = await this.mapManager.reverseGeocode(lnglat);

        if (locationInfo) {
            this.currentLocationInfo = {
                name: locationInfo.district || '未知位置',
                address: locationInfo.address,
                lng: lnglat.getLng(),
                lat: lnglat.getLat(),
                fullAddress: locationInfo.address,
                radius: this.uiManager.getRadius()
            };

            this.uiManager.updateLocationDisplay(this.currentLocationInfo);
        }
    }

    handlePageChange(page) {
        const pageResults = this.searchManager.getResults(page);
        this.uiManager.updateResults(this.allResults, page);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new POISurveyApp();
});

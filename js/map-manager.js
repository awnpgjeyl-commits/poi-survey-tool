class MapManager {
    constructor(containerId, config) {
        this.containerId = containerId;
        this.config = config;
        this.map = null;
        this.centerMarker = null;
        this.circleOverlay = null;
        this.poiMarkers = [];
        this.currentCenter = null;
        this.currentRadius = config.DEFAULT_RADIUS || 5;
        this.placeSearch = null;
        this.geocoder = null;
        this.onLocationChange = null;
        this.onMapClick = null;
        this.init();
    }

    init() {
        if (typeof AMap === 'undefined') {
            console.error('高德地图 API 未加载');
            return;
        }

        this.map = new AMap.Map(this.containerId, {
            zoom: this.config.MAP_ZOOM || 12,
            center: [116.397428, 39.90923],
            viewMode: '2D',
            mapStyle: 'amap://styles/normal',
            resizeEnable: true,
            showIndoorMap: false
        });

        this.map.on('complete', () => {
            console.log('地图加载完成');
        });

        this.initPlugins();
        this.bindEvents();
    }

    initPlugins() {
        AMap.plugin(['AMap.PlaceSearch', 'AMap.Geocoder'], () => {
            this.placeSearch = new AMap.PlaceSearch({
                city: '全国',
                citylimit: false,
                pageSize: 20,
                pageIndex: 1,
                extensions: 'all'
            });

            this.geocoder = new AMap.Geocoder({
                city: '全国',
                radius: 1000
            });
        });
    }

    bindEvents() {
        this.map.on('click', (e) => {
            if (this.onMapClick) {
                this.onMapClick(e.lnglat);
            }
            this.setCenter(e.lnglat);
        });

        this.map.on('moveend', () => {
            const center = this.map.getCenter();
            if (this.onLocationChange) {
                this.onLocationChange(center);
            }
        });
    }

    setCenter(location) {
        const lnglat = this.parseLngLat(location);
        if (!lnglat) return;

        this.currentCenter = lnglat;
        this.map.setCenter(lnglat);

        this.updateCenterMarker(lnglat);
        this.updateCircleOverlay(lnglat, this.currentRadius);

        if (this.onLocationChange) {
            this.onLocationChange(lnglat);
        }
    }

    setRadius(radius) {
        this.currentRadius = radius;
        if (this.currentCenter) {
            this.updateCircleOverlay(this.currentCenter, radius);
        }
    }

    parseLngLat(location) {
        if (!location) return null;

        if (Array.isArray(location) && location.length >= 2) {
            return new AMap.LngLat(location[0], location[1]);
        }

        if (typeof location === 'object' && location.lng !== undefined) {
            return new AMap.LngLat(location.lng, location.lat);
        }

        if (typeof location === 'string') {
            const parts = location.split(',');
            if (parts.length === 2) {
                const lng = parseFloat(parts[0]);
                const lat = parseFloat(parts[1]);
                if (!isNaN(lng) && !isNaN(lat)) {
                    return new AMap.LngLat(lng, lat);
                }
            }
        }

        return null;
    }

    updateCenterMarker(lnglat) {
        if (this.centerMarker) {
            this.centerMarker.setMap(null);
        }

        this.centerMarker = new AMap.Marker({
            position: lnglat,
            title: '中心点',
            content: '<div class="center-marker"></div>',
            offset: new AMap.Pixel(-12, -12)
        });

        this.centerMarker.setMap(this.map);
    }

    updateCircleOverlay(lnglat, radiusKm) {
        if (this.circleOverlay) {
            this.circleOverlay.setMap(null);
        }

        const radiusMeters = radiusKm * 1000;

        this.circleOverlay = new AMap.Circle({
            center: lnglat,
            radius: radiusMeters,
            fillColor: 'rgba(0, 102, 255, 0.1)',
            fillOpacity: 0.2,
            strokeColor: '#0066ff',
            strokeWeight: 2,
            strokeOpacity: 0.8,
            strokeStyle: 'dashed',
            strokeDasharray: [5, 5]
        });

        this.circleOverlay.setMap(this.map);
    }

    async searchAddress(address) {
        if (!this.placeSearch) {
            console.error('PlaceSearch 插件未初始化');
            return null;
        }

        return new Promise((resolve, reject) => {
            this.placeSearch.search(address, (status, result) => {
                if (status === 'complete' && result.poiList && result.poiList.pois.length > 0) {
                    const firstPoi = result.poiList.pois[0];
                    const location = firstPoi.location;
                    this.setCenter([location.getLng(), location.getLat()]);
                    resolve({
                        name: firstPoi.name,
                        address: firstPoi.address,
                        location: location,
                        city: result.city || ''
                    });
                } else {
                    reject(new Error('未找到地址'));
                }
            });
        });
    }

    async reverseGeocode(lnglat) {
        if (!this.geocoder) {
            return null;
        }

        const position = this.parseLngLat(lnglat);
        if (!position) return null;

        return new Promise((resolve) => {
            this.geocoder.getAddress(position, (status, result) => {
                if (status === 'complete' && result.regeocode) {
                    resolve({
                        address: result.regeocode.formattedAddress,
                        province: result.regeocode.addressComponent.province,
                        city: result.regeocode.addressComponent.city,
                        district: result.regeocode.addressComponent.district
                    });
                } else {
                    resolve(null);
                }
            });
        });
    }

    addPOIMarkers(pois) {
        this.clearPOIMarkers();

        pois.forEach(poi => {
            const category = poi.category || '其他';
            const icon = getPoiIcon(category);

            const marker = new AMap.Marker({
                position: new AMap.LngLat(poi.location.lng, poi.location.lat),
                title: poi.name,
                content: `<div class="poi-marker-icon ${category}">${icon}</div>`,
                offset: new AMap.Pixel(-16, -16)
            });

            const infoWindow = new AMap.InfoWindow({
                isCustom: false,
                content: this.createInfoWindowContent(poi),
                offset: new AMap.Pixel(0, -30)
            });

            marker.on('click', () => {
                infoWindow.open(this.map, marker.getPosition());
            });

            marker.setMap(this.map);
            this.poiMarkers.push(marker);
        });

        if (pois.length > 0) {
            this.fitMapToMarkers();
        }
    }

    createInfoWindowContent(poi) {
        return `
            <div class="map-info-window">
                <div class="info-title">${poi.name}</div>
                <div class="info-content">
                    <div>业态: ${poi.category}</div>
                    <div>地址: ${formatAddress(poi.address)}</div>
                    <div>距离: ${formatDistance(poi.distance)} km</div>
                </div>
            </div>
        `;
    }

    clearPOIMarkers() {
        this.poiMarkers.forEach(marker => {
            marker.setMap(null);
        });
        this.poiMarkers = [];
    }

    fitMapToMarkers() {
        if (this.poiMarkers.length === 0) return;

        const positions = this.poiMarkers.map(m => m.getPosition());
        if (this.currentCenter) {
            positions.push(this.currentCenter);
        }

        this.map.setFitView(positions);
    }

    getCenter() {
        return this.currentCenter;
    }

    getRadius() {
        return this.currentRadius;
    }

    zoomIn() {
        const currentZoom = this.map.getZoom();
        if (currentZoom < this.config.MAX_ZOOM || 18) {
            this.map.zoomIn();
        }
    }

    zoomOut() {
        const currentZoom = this.map.getZoom();
        if (currentZoom > this.config.MIN_ZOOM || 3) {
            this.map.zoomOut();
        }
    }

    destroy() {
        this.clearPOIMarkers();
        if (this.centerMarker) {
            this.centerMarker.setMap(null);
        }
        if (this.circleOverlay) {
            this.circleOverlay.setMap(null);
        }
        if (this.map) {
            this.map.destroy();
        }
    }
}

window.MapManager = MapManager;

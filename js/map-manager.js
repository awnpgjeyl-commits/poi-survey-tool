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
        this.geocoder = null;
        this.localSearch = null;
        this.onLocationChange = null;
        this.onMapClick = null;
        this.init();
    }

    init() {
        if (typeof BMap === 'undefined') {
            console.log('百度地图 API 加载中，等待...');
            setTimeout(() => this.init(), 100);
            return;
        }

        // 初始化百度地图
        this.map = new BMap.Map(this.containerId);
        const point = new BMap.Point(116.404, 39.915);
        this.map.centerAndZoom(point, 12);
        this.map.enableScrollWheelZoom(true);

        this.map.addEventListener('load', () => {
            console.log('百度地图加载完成');
            this.initTools();
        });

        this.bindEvents();
    }

    initTools() {
        // 初始化地理编码
        this.geocoder = new BMap.Geocoder();
        console.log('地理编码工具初始化完成');
    }

    bindEvents() {
        this.map.addEventListener('click', (e) => {
            if (this.onMapClick) {
                this.onMapClick(e.point);
            }
            this.setCenter(e.point);
        });

        this.map.addEventListener('moveend', () => {
            const center = this.map.getCenter();
            if (this.onLocationChange) {
                this.onLocationChange(center);
            }
        });
    }

    setCenter(location) {
        const point = this.parsePoint(location);
        if (!point) return;

        this.currentCenter = point;
        this.map.setCenter(point);

        this.updateCenterMarker(point);
        this.updateCircleOverlay(point, this.currentRadius);

        if (this.onLocationChange) {
            this.onLocationChange(point);
        }
    }

    setRadius(radius) {
        this.currentRadius = radius;
        if (this.currentCenter) {
            this.updateCircleOverlay(this.currentCenter, radius);
        }
    }

    parsePoint(location) {
        if (!location) return null;

        if (location instanceof BMap.Point) {
            return location;
        }

        if (typeof location === 'object' && location.lng && location.lat) {
            return new BMap.Point(location.lng, location.lat);
        }

        return null;
    }

    updateCenterMarker(point) {
        if (this.centerMarker) {
            this.map.removeOverlay(this.centerMarker);
        }

        this.centerMarker = new BMap.Marker(point);
        this.map.addOverlay(this.centerMarker);
    }

    updateCircleOverlay(point, radius) {
        if (this.circleOverlay) {
            this.map.removeOverlay(this.circleOverlay);
        }

        this.circleOverlay = new BMap.Circle(point, radius * 1000, {
            fillColor: 'rgba(0, 102, 255, 0.2)',
            fillOpacity: 0.3,
            strokeColor: 'rgba(0, 102, 255, 0.8)',
            strokeWeight: 2,
            strokeOpacity: 0.8
        });

        this.map.addOverlay(this.circleOverlay);
    }

    async searchAddress(address) {
        return new Promise((resolve, reject) => {
            this.geocoder.getPoint(address, (point) => {
                if (point) {
                    this.geocoder.getLocation(point, (result) => {
                        if (result) {
                            const addressResult = {
                                name: address,
                                address: result.address,
                                location: point,
                                city: result.city
                            };
                            this.setCenter(point);
                            resolve(addressResult);
                        } else {
                            reject(new Error('未找到地址'));
                        }
                    });
                } else {
                    reject(new Error('未找到地址'));
                }
            }, '全国');
        });
    }

    addPOIMarkers(pois) {
        this.clearPOIMarkers();

        pois.forEach((poi, index) => {
            const point = new BMap.Point(poi.location.lng, poi.location.lat);
            
            const marker = new BMap.Marker(point);
            marker.addEventListener('click', () => {
                this.showPOIInfoWindow(poi, point);
            });

            this.map.addOverlay(marker);
            this.poiMarkers.push(marker);
        });

        console.log(`添加了 ${pois.length} 个 POI 标记`);
    }

    showPOIInfoWindow(poi, point) {
        const opts = {
            width: 300,
            height: 150,
            title: poi.name
        };

        const content = `
            <div style="padding: 10px;">
                <p><strong>名称:</strong> ${poi.name}</p>
                <p><strong>分类:</strong> ${poi.category || '未知'}</p>
                <p><strong>地址:</strong> ${poi.address}</p>
                <p><strong>距离:</strong> ${poi.distance}m</p>
            </div>
        `;

        const infoWindow = new BMap.InfoWindow(content, opts);
        this.map.openInfoWindow(infoWindow, point);
    }

    clearPOIMarkers() {
        this.poiMarkers.forEach(marker => {
            this.map.removeOverlay(marker);
        });
        this.poiMarkers = [];
    }

    getCenter() {
        return this.currentCenter;
    }

    getRadius() {
        return this.currentRadius;
    }

    getMap() {
        return this.map;
    }
}

window.MapManager = MapManager;

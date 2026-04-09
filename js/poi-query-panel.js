class POIQueryPanel {
    constructor(config) {
        this.config = config;
        this.elements = {};
        this.poiData = null;
        this.cacheElements();
        this.init();
    }

    cacheElements() {
        this.elements = {
            modal: document.getElementById('poi-query-modal'),
            closeBtn: document.getElementById('close-modal'),
            searchInput: document.getElementById('poi-search-input'),
            resultsContainer: document.getElementById('poi-results')
        };
    }

    init() {
        if (!this.elements.modal) return;

        this.elements.closeBtn.addEventListener('click', () => {
            this.close();
        });

        this.elements.modal.addEventListener('click', (e) => {
            if (e.target === this.elements.modal) {
                this.close();
            }
        });

        const debouncedSearch = debounce((keyword) => {
            this.search(keyword);
        }, 300);

        this.elements.searchInput.addEventListener('input', (e) => {
            const keyword = e.target.value.trim();
            debouncedSearch(keyword);
        });

        this.loadDefaultPOIData();
    }

    loadDefaultPOIData() {
        this.poiData = this.getDefaultPOICategories();
    }

    getDefaultPOICategories() {
        return {
            '写字楼': {
                code: '120201',
                name: '商务写字楼',
                parent: '商务住宅',
                level: 3
            },
            '产业园': {
                code: '120100',
                name: '产业园区',
                parent: '商务住宅',
                level: 3
            },
            '商业综合体': [
                {
                    code: '200100',
                    name: '购物中心',
                    parent: '商业',
                    level: 3
                },
                {
                    code: '200101',
                    name: '百货',
                    parent: '商业',
                    level: 3
                },
                {
                    code: '200102',
                    name: '大型超市',
                    parent: '商业',
                    level: 3
                }
            ],
            '酒店': [
                {
                    code: '100100',
                    name: '宾馆酒店',
                    parent: '住宿服务',
                    level: 3
                },
                {
                    code: '100101',
                    name: '星级酒店',
                    parent: '住宿服务',
                    level: 3
                },
                {
                    code: '100102',
                    name: '经济型连锁酒店',
                    parent: '住宿服务',
                    level: 3
                },
                {
                    code: '100103',
                    name: '快捷酒店',
                    parent: '住宿服务',
                    level: 3
                },
                {
                    code: '100104',
                    name: '公寓式酒店',
                    parent: '住宿服务',
                    level: 3
                },
                {
                    code: '100105',
                    name: '民宿',
                    parent: '住宿服务',
                    level: 3
                }
            ],
            '教育机构': [
                {
                    code: '141201',
                    name: '高等院校',
                    parent: '科教文化服务',
                    level: 3
                },
                {
                    code: '141202',
                    name: '中学',
                    parent: '科教文化服务',
                    level: 3
                },
                {
                    code: '141203',
                    name: '小学',
                    parent: '科教文化服务',
                    level: 3
                },
                {
                    code: '141204',
                    name: '幼儿园',
                    parent: '科教文化服务',
                    level: 3
                }
            ],
            '医疗设施': {
                code: '170000',
                name: '医疗卫生',
                parent: '医疗保健',
                level: 2
            },
            '餐饮娱乐': [
                {
                    code: '200200',
                    name: '餐饮',
                    parent: '商业',
                    level: 2
                },
                {
                    code: '200201',
                    name: '中餐厅',
                    parent: '商业',
                    level: 3
                },
                {
                    code: '200202',
                    name: '西餐厅',
                    parent: '商业',
                    level: 3
                },
                {
                    code: '200203',
                    name: '快餐厅',
                    parent: '商业',
                    level: 3
                }
            ]
        };
    }

    open() {
        this.elements.modal.classList.add('show');
        this.elements.searchInput.focus();
    }

    close() {
        this.elements.modal.classList.remove('show');
        this.elements.searchInput.value = '';
        this.elements.resultsContainer.innerHTML = '<p class="poi-hint">请输入关键词搜索POI分类</p>';
    }

    search(keyword) {
        if (!keyword) {
            this.showAll();
            return;
        }

        const results = [];
        const lowerKeyword = keyword.toLowerCase();

        Object.entries(this.poiData).forEach(([category, items]) => {
            const itemArray = Array.isArray(items) ? items : [items];

            itemArray.forEach(item => {
                const matchName = item.name.toLowerCase().includes(lowerKeyword);
                const matchCode = item.code.includes(keyword);
                const matchCategory = category.toLowerCase().includes(lowerKeyword);

                if (matchName || matchCode || matchCategory) {
                    results.push({
                        category: category,
                        ...item
                    });
                }
            });
        });

        this.renderResults(results);
    }

    showAll() {
        const results = [];

        Object.entries(this.poiData).forEach(([category, items]) => {
            const itemArray = Array.isArray(items) ? items : [items];

            itemArray.forEach(item => {
                results.push({
                    category: category,
                    ...item
                });
            });
        });

        this.renderResults(results);
    }

    renderResults(results) {
        if (!results || results.length === 0) {
            this.elements.resultsContainer.innerHTML = '<p class="poi-hint">未找到匹配的POI分类</p>';
            return;
        }

        const html = results.map(item => `
            <div class="poi-item" data-code="${item.code}">
                <div class="poi-item-name">${item.name}</div>
                <div class="poi-item-code">
                    编码: ${item.code} | 分类: ${item.category}
                </div>
            </div>
        `).join('');

        this.elements.resultsContainer.innerHTML = html;

        this.elements.resultsContainer.querySelectorAll('.poi-item').forEach(el => {
            el.addEventListener('click', () => {
                const code = el.dataset.code;
                this.copyToInput(code);
            });
        });
    }

    copyToInput(code) {
        const customInput = document.getElementById('custom-poi-input');
        if (customInput) {
            const currentValue = customInput.value.trim();
            if (currentValue) {
                customInput.value = `${currentValue},${code}`;
            } else {
                customInput.value = code;
            }
        }

        this.close();
        showToast(`已复制POI编码: ${code}`, 'success');
    }

    downloadPOITable() {
        const data = [];

        Object.entries(this.poiData).forEach(([category, items]) => {
            const itemArray = Array.isArray(items) ? items : [items];

            itemArray.forEach(item => {
                data.push({
                    '用户业态分类': category,
                    'POI编码': item.code,
                    'POI名称': item.name,
                    '父级分类': item.parent,
                    '分类级别': item.level
                });
            });
        });

        ExportManager.exportToExcel(data, 'POI分类表');
    }
}

window.POIQueryPanel = POIQueryPanel;

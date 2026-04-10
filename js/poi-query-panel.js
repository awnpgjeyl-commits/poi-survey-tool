class POIQueryPanel {
    constructor(config) {
        this.config = config;
        this.elements = {};
        this.selectedCategories = [];
        this.cacheElements();
        this.init();
    }

    cacheElements() {
        this.elements = {
            modal: document.getElementById('poi-query-modal'),
            closeBtn: document.getElementById('close-modal'),
            categorySelect: document.getElementById('poi-category-select'),
            subCategoryList: document.getElementById('poi-subcategory-list'),
            searchInput: document.getElementById('poi-search-input'),
            confirmBtn: document.getElementById('poi-confirm-btn'),
            resultsContainer: document.getElementById('poi-results')
        };
    }

    init() {
        if (!this.elements.modal) return;

        // 关闭按钮
        this.elements.closeBtn.addEventListener('click', () => {
            this.close();
        });

        // 点击模态框背景关闭
        this.elements.modal.addEventListener('click', (e) => {
            if (e.target === this.elements.modal) {
                this.close();
            }
        });

        // 一级分类选择变化
        this.elements.categorySelect.addEventListener('change', (e) => {
            const category = e.target.value;
            if (category) {
                this.renderSubCategories(category);
            }
        });

        // 搜索输入
        const debouncedSearch = debounce((keyword) => {
            this.filterSubCategories(keyword);
        }, 300);

        this.elements.searchInput.addEventListener('input', (e) => {
            const keyword = e.target.value.trim();
            debouncedSearch(keyword);
        });

        // 确认按钮
        this.elements.confirmBtn.addEventListener('click', () => {
            this.confirmSelection();
        });

        // 初始化一级分类下拉菜单
        this.initCategorySelect();
    }

    initCategorySelect() {
        const categories = Object.keys(this.config.BAIDU_POI_CATEGORIES);
        const options = categories.map(cat => 
            `<option value="${cat}">${cat}</option>`
        ).join('');
        
        this.elements.categorySelect.innerHTML = 
            '<option value="">请选择一级分类</option>' + options;
    }

    renderSubCategories(category) {
        const subCategories = this.config.BAIDU_POI_CATEGORIES[category];
        if (!subCategories) return;

        const html = subCategories.map(sub => `
            <label class="subcategory-item">
                <input type="checkbox" value="${sub}" data-category="${category}">
                <span>${sub}</span>
            </label>
        `).join('');

        this.elements.subCategoryList.innerHTML = html;
        
        // 清空搜索框
        this.elements.searchInput.value = '';
    }

    filterSubCategories(keyword) {
        const checkboxes = this.elements.subCategoryList.querySelectorAll('.subcategory-item');
        
        if (!keyword) {
            checkboxes.forEach(el => el.style.display = 'block');
            return;
        }

        const lowerKeyword = keyword.toLowerCase();
        checkboxes.forEach(el => {
            const text = el.textContent.toLowerCase();
            el.style.display = text.includes(lowerKeyword) ? 'block' : 'none';
        });
    }

    confirmSelection() {
        const checkboxes = this.elements.subCategoryList.querySelectorAll('input[type="checkbox"]:checked');
        
        if (checkboxes.length === 0) {
            showToast('请至少选择一个二级分类', 'error');
            return;
        }

        this.selectedCategories = Array.from(checkboxes).map(cb => ({
            category: cb.dataset.category,
            subCategory: cb.value
        }));

        // 填充到搜索框
        const searchValue = this.selectedCategories
            .map(item => item.subCategory)
            .join(',');

        const customInput = document.getElementById('custom-poi-input');
        if (customInput) {
            customInput.value = searchValue;
        }

        this.close();
        showToast(`已选择 ${checkboxes.length} 个分类`, 'success');
    }

    open() {
        this.elements.modal.classList.add('show');
        // 重置状态
        this.elements.categorySelect.value = '';
        this.elements.subCategoryList.innerHTML = '<p class="poi-hint">请先选择一级分类</p>';
        this.elements.searchInput.value = '';
        this.selectedCategories = [];
    }

    close() {
        this.elements.modal.classList.remove('show');
    }
}

window.POIQueryPanel = POIQueryPanel;

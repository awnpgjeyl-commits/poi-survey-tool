class UIManager {
    constructor() {
        this.elements = {};
        this.currentPage = 1;
        this.itemsPerPage = CONFIG.UI.RESULTS_PER_PAGE;
        this.cacheElements();
    }

    cacheElements() {
        this.elements = {
            addressInput: document.getElementById('address-input'),
            searchAddressBtn: document.getElementById('search-address-btn'),
            currentLocation: document.getElementById('current-location'),
            radiusSlider: document.getElementById('radius-slider'),
            radiusValue: document.getElementById('radius-value'),
            categoryCheckboxes: document.querySelectorAll('input[name="category"]'),
            selectAllBtn: document.getElementById('select-all-btn'),
            clearAllBtn: document.getElementById('clear-all-btn'),
            customPoiInput: document.getElementById('custom-poi-input'),
            poiQueryBtn: document.getElementById('poi-query-btn'),
            searchBtn: document.getElementById('search-btn'),
            resultsBody: document.getElementById('results-body'),
            resultsCount: document.getElementById('results-count'),
            exportBtn: document.getElementById('export-btn'),
            pagination: document.getElementById('pagination'),
            loadingOverlay: document.getElementById('loading-overlay')
        };
    }

    bindEvents(handlers) {
        this.elements.searchAddressBtn.addEventListener('click', () => {
            const address = this.elements.addressInput.value.trim();
            if (address && handlers.onAddressSearch) {
                handlers.onAddressSearch(address);
            }
        });

        this.elements.addressInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const address = this.elements.addressInput.value.trim();
                if (address && handlers.onAddressSearch) {
                    handlers.onAddressSearch(address);
                }
            }
        });

        this.elements.radiusSlider.addEventListener('input', (e) => {
            const value = e.target.value;
            this.elements.radiusValue.textContent = `${value} km`;
            if (handlers.onRadiusChange) {
                handlers.onRadiusChange(parseInt(value));
            }
        });

        this.elements.selectAllBtn.addEventListener('click', () => {
            this.checkAllCategories(true);
        });

        this.elements.clearAllBtn.addEventListener('click', () => {
            this.checkAllCategories(false);
        });

        this.elements.searchBtn.addEventListener('click', () => {
            if (handlers.onSearch) {
                handlers.onSearch();
            }
        });

        this.elements.exportBtn.addEventListener('click', () => {
            if (handlers.onExport) {
                handlers.onExport();
            }
        });

        this.elements.poiQueryBtn.addEventListener('click', () => {
            if (handlers.onPOIQuery) {
                handlers.onPOIQuery();
            }
        });

        document.addEventListener('keypress', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    checkAllCategories(check) {
        this.elements.categoryCheckboxes.forEach(checkbox => {
            checkbox.checked = check;
        });
    }

    getSelectedCategories() {
        const selected = [];
        this.elements.categoryCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                selected.push(checkbox.value);
            }
        });
        return selected;
    }

    getCustomPOICodes() {
        return this.elements.customPoiInput.value.trim();
    }

    getRadius() {
        return parseInt(this.elements.radiusSlider.value);
    }

    updateLocationDisplay(locationInfo) {
        if (!locationInfo) {
            this.elements.currentLocation.textContent = '';
            return;
        }

        let displayText = '';
        if (locationInfo.name) {
            displayText += locationInfo.name;
        }
        if (locationInfo.address) {
            displayText += ` (${locationInfo.address})`;
        }
        if (locationInfo.lng && locationInfo.lat) {
            displayText += ` [${locationInfo.lng.toFixed(6)}, ${locationInfo.lat.toFixed(6)}]`;
        }

        this.elements.currentLocation.textContent = displayText;
    }

    updateResults(results, page = 1) {
        this.currentPage = page;
        this.renderTable(results);
        this.renderPagination(results);
        this.updateResultsCount(results.length);
    }

    renderTable(results) {
        const tbody = this.elements.resultsBody;

        if (!results || results.length === 0) {
            tbody.innerHTML = `
                <tr class="empty-row">
                    <td colspan="5">暂无搜索结果</td>
                </tr>
            `;
            return;
        }

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;

        const html = results.map((poi, index) => `
            <tr data-index="${startIndex + index}">
                <td>${startIndex + index + 1}</td>
                <td>${this.escapeHtml(poi.name)}</td>
                <td>${this.escapeHtml(poi.category)}</td>
                <td>${this.escapeHtml(formatAddress(poi.address))}</td>
                <td>${formatDistance(poi.distance)}</td>
            </tr>
        `).join('');

        tbody.innerHTML = html;
    }

    renderPagination(results) {
        const totalPages = Math.ceil(results.length / this.itemsPerPage);
        const pagination = this.elements.pagination;

        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }

        let html = '';

        html += `<button class="pagination-btn" ${this.currentPage === 1 ? 'disabled' : ''} data-page="prev">上一页</button>`;

        const maxVisiblePages = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        if (startPage > 1) {
            html += `<button class="pagination-btn" data-page="1">1</button>`;
            if (startPage > 2) {
                html += `<span class="pagination-ellipsis">...</span>`;
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            html += `<button class="pagination-btn ${i === this.currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                html += `<span class="pagination-ellipsis">...</span>`;
            }
            html += `<button class="pagination-btn" data-page="${totalPages}">${totalPages}</button>`;
        }

        html += `<button class="pagination-btn" ${this.currentPage === totalPages ? 'disabled' : ''} data-page="next">下一页</button>`;

        pagination.innerHTML = html;

        pagination.querySelectorAll('.pagination-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = e.target.dataset.page;
                if (page === 'prev') {
                    this.changePage(this.currentPage - 1);
                } else if (page === 'next') {
                    this.changePage(this.currentPage + 1);
                } else {
                    this.changePage(parseInt(page));
                }
            });
        });
    }

    changePage(page) {
        this.currentPage = page;
        if (this.onPageChange) {
            this.onPageChange(page);
        }
    }

    updateResultsCount(count) {
        this.elements.resultsCount.textContent = `${count} 条结果`;
    }

    enableExport(enabled = true) {
        this.elements.exportBtn.disabled = !enabled;
    }

    showLoading(show = true) {
        if (show) {
            this.elements.loadingOverlay.classList.remove('hidden');
        } else {
            this.elements.loadingOverlay.classList.add('hidden');
        }
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
        }
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    setSearchButtonState(loading) {
        if (loading) {
            this.elements.searchBtn.disabled = true;
            this.elements.searchBtn.textContent = '搜索中...';
        } else {
            this.elements.searchBtn.disabled = false;
            this.elements.searchBtn.textContent = '开始搜索';
        }
    }
}

window.UIManager = UIManager;

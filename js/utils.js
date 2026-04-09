function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

function parseCustomPOICodes(input) {
    if (!input || typeof input !== 'string') {
        return [];
    }

    const codes = [];
    const parts = input.split(/[,|]/);

    parts.forEach(part => {
        part = part.trim();
        if (!part) return;

        if (part.includes('-')) {
            const rangeParts = part.split('-');
            if (rangeParts.length === 2) {
                const start = parseInt(rangeParts[0], 10);
                const end = parseInt(rangeParts[1], 10);
                if (!isNaN(start) && !isNaN(end) && start <= end) {
                    for (let i = start; i <= end; i++) {
                        codes.push(String(i).padStart(6, '0'));
                    }
                }
            }
        } else if (/^\d+$/.test(part)) {
            codes.push(part.padStart(6, '0'));
        }
    });

    return [...new Set(codes)];
}

function getCategoryByPOICode(code) {
    return POI_CODE_TO_CATEGORY[code] || '其他';
}

function deduplicatePOIs(pois) {
    const seen = new Map();
    pois.forEach(poi => {
        if (!seen.has(poi.id)) {
            seen.set(poi.id, poi);
        }
    });
    return Array.from(seen.values());
}

function sortPOIsByDistance(pois, ascending = true) {
    return [...pois].sort((a, b) => {
        const distA = parseFloat(a.distance) || 0;
        const distB = parseFloat(b.distance) || 0;
        return ascending ? distA - distB : distB - distA;
    });
}

function formatDistance(meters) {
    const metersNum = parseFloat(meters);
    if (isNaN(metersNum)) return '0';
    if (metersNum >= 1000) {
        return (metersNum / 1000).toFixed(2);
    }
    return metersNum.toFixed(0);
}

function formatAddress(address) {
    if (!address || address === 'undefined' || address === 'null') {
        return '暂无地址';
    }
    return address;
}

function validatePOICode(code) {
    return /^\d{6}$/.test(code);
}

function validateRadius(radius) {
    const num = parseFloat(radius);
    return !isNaN(num) && num >= CONFIG.MIN_RADIUS && num <= CONFIG.MAX_RADIUS;
}

function buildPOITypesString(selectedCategories, customCodes = []) {
    const types = [];

    selectedCategories.forEach(category => {
        const codes = CONFIG.POI_CATEGORIES[category];
        if (codes) {
            types.push(...codes);
        }
    });

    const parsedCustom = parseCustomPOICodes(customCodes);
    types.push(...parsedCustom);

    return [...new Set(types)].join('|');
}

function createErrorMessage(error) {
    if (error.response) {
        const status = error.response.status;
        if (status === 404) return '请求的资源不存在';
        if (status === 403) return 'API密钥无效或已过期';
        if (status === 429) return '请求过于频繁，请稍后重试';
        return `服务器错误: ${status}`;
    } else if (error.request) {
        return '网络连接失败，请检查网络';
    } else if (error.message) {
        return error.message;
    }
    return '未知错误';
}

function showToast(message, type = 'error', duration = 3000) {
    const existingToast = document.querySelector('.error-toast');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = `error-toast`;
    toast.style.background = type === 'error' ? '#dc3545' : type === 'success' ? '#28a745' : '#ffc107';
    toast.style.color = type === 'error' || type === 'success' ? 'white' : '#212529';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, duration);
}

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function getPoiIcon(category) {
    const icons = {
        '写字楼': '🏢',
        '产业园': '🏭',
        '商业综合体': '🏬',
        '酒店': '🏨',
        '教育机构': '🏫',
        '医疗设施': '🏥',
        '餐饮娱乐': '🍽️',
        '其他': '📍'
    };
    return icons[category] || '📍';
}

function calculatePagination(totalItems, currentPage, itemsPerPage) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

    return {
        totalPages,
        currentPage,
        startIndex,
        endIndex,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1
    };
}

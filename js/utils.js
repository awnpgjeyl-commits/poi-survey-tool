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

function sortPOIsByDistance(pois, ascending = true) {
    if (!pois || pois.length === 0) return pois;
    
    return pois.sort((a, b) => {
        const distA = parseFloat(a.distance) || 0;
        const distB = parseFloat(b.distance) || 0;
        return ascending ? distA - distB : distB - distA;
    });
}

function parseCustomPOICodes(input) {
    if (!input || typeof input !== 'string') {
        return [];
    }

    // 百度地图模式：直接返回分类名称数组
    const categories = input.split(',').map(s => s.trim()).filter(s => s);
    return categories;
}

function deduplicatePOIs(pois) {
    const seen = new Map();
    pois.forEach(poi => {
        if (!seen.has(poi.name + poi.address)) {
            seen.set(poi.name + poi.address, poi);
        }
    });
    return Array.from(seen.values());
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

function buildPOITypesString(selectedCategories, customCodes = '') {
    // 百度地图模式：直接使用分类名称
    if (selectedCategories && selectedCategories.length > 0) {
        return selectedCategories.join('|');
    }
    
    // 从自定义输入获取
    const custom = parseCustomPOICodes(customCodes);
    if (custom.length > 0) {
        return custom.join('|');
    }
    
    return '';
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

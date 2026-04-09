class ExportManager {
    static exportToExcel(data, fileName) {
        if (!data || data.length === 0) {
            showToast('没有可导出的数据', 'error');
            return;
        }

        const excelData = data.map((poi, index) => ({
            '序号': index + 1,
            '项目名称': poi.name,
            '业态分类': poi.category,
            '详细地址': formatAddress(poi.address),
            '距离中心点(km)': formatDistance(poi.distance),
            '纬度': poi.location.lat,
            '经度': poi.location.lng,
            '高德POIID': poi.id
        }));

        try {
            const worksheet = XLSX.utils.json_to_sheet(excelData);

            const columnWidths = [
                { wch: 8 },
                { wch: 30 },
                { wch: 12 },
                { wch: 40 },
                { wch: 12 },
                { wch: 12 },
                { wch: 12 },
                { wch: 20 }
            ];
            worksheet['!cols'] = columnWidths;

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'POI数据');

            const date = new Date().toISOString().split('T')[0];
            const finalFileName = fileName || `地块周边业态_${date}`;

            XLSX.writeFile(workbook, `${finalFileName}.xlsx`);

            showToast('导出成功！', 'success');
        } catch (error) {
            console.error('导出失败:', error);
            showToast('导出失败: ' + error.message, 'error');
        }
    }

    static exportToCSV(data, fileName) {
        if (!data || data.length === 0) {
            showToast('没有可导出的数据', 'error');
            return;
        }

        const headers = ['序号', '项目名称', '业态分类', '详细地址', '距离中心点(km)', '纬度', '经度', '高德POIID'];
        const rows = data.map((poi, index) => [
            index + 1,
            poi.name,
            poi.category,
            formatAddress(poi.address),
            formatDistance(poi.distance),
            poi.location.lat,
            poi.location.lng,
            poi.id
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        const date = new Date().toISOString().split('T')[0];
        const finalFileName = fileName || `地块周边业态_${date}`;
        link.download = `${finalFileName}.csv`;
        link.click();
        URL.revokeObjectURL(link.href);

        showToast('导出成功！', 'success');
    }

    static generateReport(data, locationInfo) {
        if (!data || data.length === 0) {
            return null;
        }

        const categoryStats = {};
        data.forEach(poi => {
            const category = poi.category;
            if (!categoryStats[category]) {
                categoryStats[category] = 0;
            }
            categoryStats[category]++;
        });

        const report = {
            location: locationInfo,
            totalCount: data.length,
            categoryStats: categoryStats,
            radius: locationInfo.radius || 'N/A',
            exportTime: new Date().toISOString()
        };

        return report;
    }
}

window.ExportManager = ExportManager;

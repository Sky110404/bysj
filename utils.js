// utils.js - 通用工具模块

/**
 * 显示通知消息
 * @param {string} message - 消息内容
 * @param {string} type - 类型: 'info' | 'success' | 'error' | 'warning'
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

/**
 * 导出数据到 Excel
 * @param {Array<Array>} data - 二维数组，第一行为表头
 * @param {string} filename - 文件名，如 '考勤.xlsx'
 */
function exportToExcel(data, filename) {
    if (typeof XLSX === 'undefined') {
        showNotification('缺少 Excel 导出库，请检查网络', 'error');
        return;
    }
    
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, filename);
}

/**
 * 下载考勤导入模板
 */
function downloadTemplate() {
    const headers = ['工号', '姓名', '部门', '日期', '上班时间', '下班时间', '状态'];
    const sampleData = [
        ['001', '张三', '技术部', '2026-06-01', '09:05', '18:10', '迟到'],
        ['002', '李四', '人事部', '2026-06-01', '08:55', '17:50', '正常'],
        ['003', '王五', '财务部', '2026-06-01', '-', '-', '缺勤']
    ];
    const data = [headers, ...sampleData];
    exportToExcel(data, '考勤导入模板.xlsx');
}

// 模态框工具函数（可选增强）
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}
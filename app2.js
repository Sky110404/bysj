// ==================== 页面加载 ====================

document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initHeaderNavigation();
    
    // 加载初始数据
    loadDashboard();
    //  为员工搜索框添加实时搜索功能
    const employeeSearchInput = document.getElementById('employee-search');
    if (employeeSearchInput) {
        employeeSearchInput.addEventListener('input', loadEmployees);
    }
    // 设置今天的日期为默认值
    document.getElementById('attendance-date').valueAsDate = new Date();
    document.getElementById('clockin-time').value = new Date().toISOString().slice(0, 16);
    
    // 填充个人考勤查询的员工下拉框
    fillPersonalAttendanceEmployeeDropdown();
    
    // 填充个薪资查询的员工下拉框
    fillPersonalSalaryEmployeeDropdown();
    
    // 初始化导入功能
    setupFileUploadListener();
    initializeDragAndDrop();
});

// 初始化侧边栏导航
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            navigateTo(page);
        });
    });
}

// 初始化头部导航
function initHeaderNavigation() {
    const headerLinks = document.querySelectorAll('header nav a');
    headerLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            // 从href获取目标页面（去除#符号）
            const targetPage = this.getAttribute('href').substring(1);
            navigateTo(targetPage);
        });
    });
}

// 页面导航
function navigateTo(pageName) {
    // 隐藏所有页面
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // 显示目标页面
    const targetPage = document.getElementById(`page-${pageName}`);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // 更新侧边栏导航链接状态
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-page') === pageName) {
            link.classList.add('active');
        }
    });
    
    // 更新头部导航链接状态
    document.querySelectorAll('header nav a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${pageName}`) {
            link.classList.add('active');
        }
    });
    
    // 根据页面加载对应的数据
    switch(pageName) {
        case 'employees':
            loadEmployees();
            break;
        case 'attendance':
            loadAttendance();
            fillPersonalAttendanceEmployeeDropdown();
            break;
        case 'leave':
            loadLeaves();
            break;
        case 'overtime':
            loadOvertime();
            break;
        case 'salary':
            loadSalaryWithEmployeeFilter();
             fillPersonalSalaryEmployeeDropdown();
            break;
        case 'reports':
            loadReports();
            break;
        case 'dashboard':
            loadDashboard();
            break;
        case 'settings':
            loadSettings();
            break;
    }
}


// ==================== 薪资管理 ====================

// 修改loadSalary函数，支持员工筛选
function loadSalary() {
    const salaryRecords = dataManager.getSalary();
    const month = document.getElementById('salary-month').value;
    const department = document.getElementById('salary-department').value;
    const employeeFilter = document.getElementById('salary-employee-filter'); // 员工筛选
    
    // 过滤数据
    let filteredRecords = salaryRecords.filter(s => s.month === month);
    if (department) {
        filteredRecords = filteredRecords.filter(s => s.department === department);
    }
    // 如果有员工筛选，则进一步筛选
    if (employeeFilter && employeeFilter.value) {
        filteredRecords = filteredRecords.filter(s => s.employeeId == employeeFilter.value);
    }
    
    const tbody = document.getElementById('salary-table');
    tbody.innerHTML = filteredRecords.map(s => {
        // 构建操作按钮
        let actionButtons = `<button class="btn btn-sm" onclick="viewSalary(${s.id})">查看</button>`;
        if (s.status === '待发放') {
            actionButtons += ` <button class="btn btn-sm btn-success" onclick="markSalaryAsPaid(${s.id})">发放</button>`;
        }
        
        return `
            <tr>
                <td>${dataManager.getEmployeeById(s.employeeId)?.code || '-'}</td>
                <td>${s.employeeName}</td>
                <td>${s.department}</td>
                <td>¥${s.baseSalary.toLocaleString()}</td>
                <td>¥${s.overtimePay.toLocaleString()}</td>
                <td>¥${s.bonus.toLocaleString()}</td>
                <td>¥${s.transportationAllowance.toLocaleString()}</td>
                <td>¥${s.mealAllowance.toLocaleString()}</td>
                <td>¥${s.socialSecurityDeduction.toLocaleString()}</td>
                <td>¥${s.housingFundDeduction.toLocaleString()}</td>
                <td>¥${s.tax.toLocaleString()}</td>
                <td>¥${s.deduction.toLocaleString()}</td>
                <td style="font-weight: bold; color: var(--success-color);">¥${s.totalSalary.toLocaleString()}</td>
                <td><span class="badge badge-${s.status === '已发放' ? 'success' : s.status === '待发放' ? 'warning' : 'info'}">${s.status}</span></td>
                <td>${actionButtons}</td>
            </tr>
        `;
    }).join('');
}
// 为薪资页面添加员工筛选下拉框
function loadSalaryWithEmployeeFilter() {
    // 先加载员工下拉框
    const employeeFilter = document.getElementById('salary-employee-filter');
    if (employeeFilter) {
        const employees = dataManager.getEmployees();
        employeeFilter.innerHTML = '<option value="">所有员工</option>';
        employees.forEach(emp => {
            const option = document.createElement('option');
            option.value = emp.id;
            option.textContent = `${emp.name} (${emp.code})`;
            employeeFilter.appendChild(option);
        });
    }
    
    // 然后加载薪资数据
    loadSalary();
}

// 为薪资页面的筛选事件添加监听器
document.addEventListener('DOMContentLoaded', function() {
    // 添加员工筛选事件监听器
    const employeeFilter = document.getElementById('salary-employee-filter');
    if (employeeFilter) {
        employeeFilter.addEventListener('change', loadSalary);
    }
});

// 个人薪资查询功能
function searchPersonalSalary() {
    const employeeId = document.getElementById('personal-salary-employee').value;
    const month = document.getElementById('personal-salary-month').value;
    
    if (!employeeId || !month) {
        showNotification('请选择员工和月份', 'error');
        return;
    }
    
    const salaryRecord = dataManager.getSalaryByEmployeeAndMonth(parseInt(employeeId), month);
    const tbody = document.getElementById('salary-table');
    
    if (salaryRecord) {
        // 显示单个员工的薪资记录
        tbody.innerHTML = `
            <tr>
                <td>${dataManager.getEmployeeById(salaryRecord.employeeId)?.code || '-'}</td>
                <td>${salaryRecord.employeeName}</td>
                <td>${salaryRecord.department}</td>
                <td>¥${salaryRecord.baseSalary.toLocaleString()}</td>
                <td>¥${salaryRecord.overtimePay.toLocaleString()}</td>
                <td>¥${salaryRecord.bonus.toLocaleString()}</td>
                <td>¥${salaryRecord.transportationAllowance.toLocaleString()}</td>
                <td>¥${salaryRecord.mealAllowance.toLocaleString()}</td>
                <td>¥${salaryRecord.socialSecurityDeduction.toLocaleString()}</td>
                <td>¥${salaryRecord.housingFundDeduction.toLocaleString()}</td>
                <td>¥${salaryRecord.tax.toLocaleString()}</td>
                <td>¥${salaryRecord.deduction.toLocaleString()}</td>
                <td style="font-weight: bold; color: var(--success-color);">¥${salaryRecord.totalSalary.toLocaleString()}</td>
                <td><span class="badge badge-${salaryRecord.status === '已发放' ? 'success' : salaryRecord.status === '待发放' ? 'warning' : 'info'}">${salaryRecord.status}</span></td>
                <td>
                    <button class="btn btn-sm" onclick="viewSalary(${salaryRecord.id})">查看</button>
                </td>
            </tr>
        `;
    } else {
        tbody.innerHTML = '<tr><td colspan="15">未找到该员工在该月份的薪资记录</td></tr>';
    }
}

// 填充个薪资查询的员工下拉框
function fillPersonalSalaryEmployeeDropdown() {
    const employeeSelect = document.getElementById('personal-salary-employee');
    if (!employeeSelect) return;
    
    const employees = dataManager.getEmployees().filter(e => e.status === '在职');
    
    // 清空现有选项
    employeeSelect.innerHTML = '<option value="">选择员工</option>';
    
    // 添加员工选项
    employees.forEach(emp => {
        const option = document.createElement('option');
        option.value = emp.id;
        option.textContent = `${emp.name} (${emp.code})`;
        employeeSelect.appendChild(option);
    });
}

// 修改calculateSalary函数，确保数据正确映射到表格列
function calculateSalary() {
    const month = document.getElementById('salary-month').value;
    const department = document.getElementById('salary-department').value;
    
    // 调用 dataManager 计算并保存薪资记录
    dataManager.calculateSalary(month, department);
    
    // 【关键修改】: 不再手动渲染表格，而是调用 loadSalary 来刷新
    loadSalary();
    
    showNotification('薪资计算完成', 'success');
}

// 查看薪资详情
function viewSalary(id) {
    const salary = dataManager.getSalary().find(s => s.id === id);
    if (salary) {
        alert(`薪资详情\n\n员工：${salary.employeeName}\n部门：${salary.department}\n月份：${salary.month}\n\n基本工资：¥${salary.baseSalary.toLocaleString()}\n加班费：¥${salary.overtimePay.toLocaleString()}\n奖金：¥${salary.bonus.toLocaleString()}\n交通补贴：¥${salary.transportationAllowance.toLocaleString()}\n餐补：¥${salary.mealAllowance.toLocaleString()}\n社保扣款：¥${salary.socialSecurityDeduction.toLocaleString()}\n公积金扣款：¥${salary.housingFundDeduction.toLocaleString()}\n个税：¥${salary.tax.toLocaleString()}\n其他扣款：¥${salary.deduction.toLocaleString()}\n\n实发工资：¥${salary.totalSalary.toLocaleString()}`);
    }
}

// 生成工资单 - 修复显示问题
function generateSalarySheet() {
    const month = document.getElementById('salary-month').value;
    const department = document.getElementById('salary-department').value;
    
    // 获取所有符合条件的员工
    const employees = dataManager.getEmployees().filter(e => 
        e.status === '在职' && (!department || e.department === department)
    );
    
    // 弹出选择员工的对话框
    const employeeListHtml = employees.map(emp => 
        `<label style="display: block; margin: 5px 0;">
            <input type="checkbox" name="selectedEmployees" value="${emp.id}" checked>
            ${emp.name} (${emp.code})
        </label>`
    ).join('');
    
    // 创建模态框让用户选择员工
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
    `;
    
    modal.innerHTML = `
        <div style="
            background: white;
            padding: 20px;
            border-radius: 8px;
            max-width: 500px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
        ">
            <h3>选择要生成工资单的员工</h3>
            <div style="margin: 15px 0;">
                ${employeeListHtml || '<p>没有找到符合条件的员工</p>'}
            </div>
            <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
                <button class="btn" onclick="selectAllEmployees()" style="padding: 8px 16px;">全选</button>
                <button class="btn btn-accent" onclick="unselectAllEmployees()" style="padding: 8px 16px;">取消全选</button>
                <button class="btn btn-success" onclick="processSelectedEmployees('${month}')" style="padding: 8px 16px;">生成工资单</button>
                <button class="btn" onclick="closeEmployeeSelectionModal()" style="padding: 8px 16px;">取消</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// 全选员工
function selectAllEmployees() {
    const checkboxes = document.querySelectorAll('input[name="selectedEmployees"]');
    checkboxes.forEach(checkbox => checkbox.checked = true);
}

// 取消全选
function unselectAllEmployees() {
    const checkboxes = document.querySelectorAll('input[name="selectedEmployees"]');
    checkboxes.forEach(checkbox => checkbox.checked = false);
}

// 关闭员工选择模态框
function closeEmployeeSelectionModal() {
    const modal = document.querySelector('div[style*="position: fixed"]');
    if (modal) {
        document.body.removeChild(modal);
    }
}

// 处理选中的员工并生成工资单 - 修复显示问题
function processSelectedEmployees(month) {
    const selectedIds = Array.from(document.querySelectorAll('input[name="selectedEmployees"]:checked'))
        .map(cb => parseInt(cb.value));
    
    if (selectedIds.length === 0) {
        showNotification('请至少选择一名员工', 'error');
        return;
    }
    
    // 创建工资单容器
    const slipsContainer = document.createElement('div');
    slipsContainer.id = 'salary-slips-container';
    slipsContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.8);
        display: none;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        overflow: auto;
    `;
    
    let allSlipsContent = '';
    
    // 为每个选中的员工生成工资单
    selectedIds.forEach((employeeId, index) => {
        const slip = dataManager.generateSalarySlip(employeeId, month);
        if (slip) {
            // 创建工资单HTML内容
            const slipContent = `
                <div class="salary-slip" style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ccc; font-family: Arial, sans-serif; background: white;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h2>工资单</h2>
                        <p>${dataManager.getSettings().companyName}</p>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                        <div>
                            <p><strong>员工姓名:</strong> ${slip.employee.name}</p>
                            <p><strong>工号:</strong> ${slip.employee.code}</p>
                            <p><strong>部门:</strong> ${slip.employee.department}</p>
                            <p><strong>职位:</strong> ${slip.employee.position}</p>
                        </div>
                        <div>
                            <p><strong>发放月份:</strong> ${slip.salary.month}</p>
                            <p><strong>发放日期:</strong> ${new Date().toISOString().split('T')[0]}</p>
                        </div>
                    </div>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                        <thead>
                            <tr style="background-color: #f2f2f2;">
                                <th style="border: 1px solid #ddd; padding: 8px;">项目</th>
                                <th style="border: 1px solid #ddd; padding: 8px;">金额</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="border: 1px solid #ddd; padding: 8px;">基本工资</td>
                                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${slip.salary.baseSalary.toLocaleString()}</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #ddd; padding: 8px;">加班费</td>
                                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${slip.salary.overtimePay.toLocaleString()}</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #ddd; padding: 8px;">奖金</td>
                                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${slip.salary.bonus.toLocaleString()}</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #ddd; padding: 8px;">交通补贴</td>
                                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${slip.salary.transportationAllowance.toLocaleString()}</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #ddd; padding: 8px;">餐补</td>
                                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${slip.salary.mealAllowance.toLocaleString()}</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #ddd; padding: 8px;">社保扣款</td>
                                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${slip.salary.socialSecurityDeduction.toLocaleString()}</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #ddd; padding: 8px;">公积金扣款</td>
                                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${slip.salary.housingFundDeduction.toLocaleString()}</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #ddd; padding: 8px;">个税</td>
                                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${slip.salary.tax.toLocaleString()}</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #ddd; padding: 8px;">其他扣款</td>
                                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${slip.salary.deduction.toLocaleString()}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div style="text-align: right; margin-bottom: 20px;">
                        <p style="font-size: 18px; font-weight: bold;">实发工资: ¥${slip.salary.totalSalary.toLocaleString()}</p>
                    </div>
                    <div style="margin-bottom: 20px;">
                        <h3>考勤详情</h3>
                        <p>正常出勤: ${slip.attendance.normalAttendance}天</p>
                        <p>迟到次数: ${slip.attendance.lateCount}次</p>
                        <p>早退次数: ${slip.attendance.earlyLeaveCount}次</p>
                        <p>缺勤次数: ${slip.attendance.absentCount}次</p>
                        <p>总工作时长: ${slip.attendance.totalWorkHours.toFixed(2)}小时</p>
                    </div>
                </div>
            `;
            
            allSlipsContent += slipContent;
        }
    });
    
    slipsContainer.innerHTML = `
        <div style="width: 100%; max-width: 800px; padding: 20px; background: white; border-radius: 8px; max-height: 90vh; overflow-y: auto;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2>工资单预览</h2>
                <button class="btn" onclick="printSalarySlips()" style="margin-left: 10px;">打印</button>
                <button class="btn btn-accent" onclick="closeSalarySlips()" style="margin-left: 10px;">关闭</button>
            </div>
            <div id="slips-content">
                ${allSlipsContent}
            </div>
        </div>
    `;
    
    document.body.appendChild(slipsContainer);
    slipsContainer.style.display = 'flex';
}

// 打印工资单
function printSalarySlips() {
    const printWindow = window.open('', '_blank');
    const slipsContent = document.getElementById('slips-content').innerHTML;
    
    printWindow.document.write(`
        <html>
        <head>
            <title>工资单</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .salary-slip { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ccc; background: white; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                .center { text-align: center; }
            </style>
        </head>
        <body>
            ${slipsContent}
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
}

// 关闭工资单窗口
function closeSalarySlips() {
    const slipsContainer = document.getElementById('salary-slips-container');
    if (slipsContainer) {
        slipsContainer.remove();
    }
}

// 导出薪资报表
function exportSalary() {
    const month = document.getElementById('salary-month').value;
    const department = document.getElementById('salary-department').value;
    
    const salaryRecords = dataManager.getSalary().filter(s => s.month === month);
    const filteredRecords = department ? salaryRecords.filter(s => s.department === department) : salaryRecords;
    
    const headers = ['员工工号', '姓名', '部门', '基本工资', '加班费', '奖金', '交通补贴', '餐补', '社保扣款', '公积金扣款', '个税', '其他扣款', '实发工资', '状态'];
    const data = [headers];
    
    filteredRecords.forEach(s => {
        data.push([
            dataManager.getEmployeeById(s.employeeId)?.code || '-',
            s.employeeName,
            s.department,
            s.baseSalary,
            s.overtimePay,
            s.bonus,
            s.transportationAllowance,
            s.mealAllowance,
            s.socialSecurityDeduction,
            s.housingFundDeduction,
            s.tax,
            s.deduction,
            s.totalSalary,
            s.status
        ]);
    });
    
    exportToExcel(data, `薪资报表_${month}.xlsx`);
    showNotification('薪资报表导出成功', 'success');
}
// 【新增】标记薪资为已发放
function markSalaryAsPaid(salaryId) {
    // 弹出确认框
    if (!confirm('确定要将此薪资标记为“已发放”吗？')) {
        return;
    }

    // 调用 dataManager 的方法更新状态
    const success = dataManager.updateSalaryStatus(salaryId, '已发放');
    
    if (success) {
        showNotification('薪资状态已更新为“已发放”', 'success');
        // 重新加载当前页面的数据以刷新表格
        const activePage = document.querySelector('.page.active').id.replace('page-', '');
        navigateTo(activePage);
    } else {
        showNotification('更新失败，请稍后重试', 'error');
    }
}
// ==================== 报表分析 ====================

function loadReports() {
    // 加载报表数据
    const month = document.getElementById('report-month').value;
    const reportType = document.getElementById('report-type').value;
    const reportPeriod = document.getElementById('report-period').value;
    
    let reportContent = '';
    
    switch(reportType) {
        case 'attendance':
            reportContent = generateAttendanceReport(month);
            break;
        case 'salary':
            reportContent = generateSalaryReport(month);
            break;
        case 'department':
            reportContent = generateDepartmentReport(month);
            break;
    }
    
    document.getElementById('report-content').innerHTML = reportContent;
}

function generateReport() {
    const reportType = document.getElementById('report-type').value;
    const month = document.getElementById('report-month').value;
    const reportPeriod = document.getElementById('report-period').value;
    
    // 对于薪资报表，排除日和周报表选项
    if (reportType === 'salary' && (reportPeriod === 'daily' || reportPeriod === 'weekly')) {
        showNotification('薪资报表不支持日、周统计', 'warning');
        return;
    }
    
    let reportContent = '';
    
    switch(reportType) {
        case 'attendance':
            reportContent = generateAttendanceReport(month);
            break;
        case 'salary':
            reportContent = generateSalaryReport(month);
            break;
        case 'department':
            reportContent = generateDepartmentReport(month);
            break;
    }
    
    document.getElementById('report-content').innerHTML = reportContent;
}

function generateAttendanceReport(month) {
    const attendance = dataManager.getAttendance().filter(a => a.date.startsWith(month));
    const employees = dataManager.getEmployees();
    
    // 统计各项数据
    const totalAttendance = attendance.length;
    const normalAttendance = attendance.filter(a => a.status === '正常').length;
    const lateCount = attendance.filter(a => a.status === '迟到').length;
    const earlyLeaveCount = attendance.filter(a => a.status === '早退').length;
    const absentCount = attendance.filter(a => a.status === '缺勤').length;
    
    return `
        <h4>${month} 考勤统计报表</h4>
        <table style="margin-top: 1rem;">
            <thead>
                <tr>
                    <th>指标</th>
                    <th>数量</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>总考勤记录</td>
                    <td>${totalAttendance}条</td>
                </tr>
                <tr>
                    <td>正常出勤</td>
                    <td style="color: var(--success-color);">${normalAttendance}条</td>
                </tr>
                <tr>
                    <td>迟到次数</td>
                    <td style="color: var(--warning-color);">${lateCount}次</td>
                </tr>
                <tr>
                    <td>早退次数</td>
                    <td style="color: var(--warning-color);">${earlyLeaveCount}次</td>
                </tr>
                <tr>
                    <td>缺勤次数</td>
                    <td style="color: var(--accent-color);">${absentCount}次</td>
                </tr>
            </tbody>
        </table>
    `;
}

function generateSalaryReport(month) {
    // 修正：使用正确的筛选条件
    const salaryRecords = dataManager.getSalary().filter(s => s.month === month);
    
    const totalBaseSalary = salaryRecords.reduce((sum, s) => sum + s.baseSalary, 0);
    const totalOvertimePay = salaryRecords.reduce((sum, s) => sum + s.overtimePay, 0);
    const totalBonus = salaryRecords.reduce((sum, s) => sum + s.bonus, 0);
    const totalTransportationAllowance = salaryRecords.reduce((sum, s) => sum + s.transportationAllowance, 0);
    const totalMealAllowance = salaryRecords.reduce((sum, s) => sum + s.mealAllowance, 0);
    const totalSocialSecurityDeduction = salaryRecords.reduce((sum, s) => sum + s.socialSecurityDeduction, 0);
    const totalHousingFundDeduction = salaryRecords.reduce((sum, s) => sum + s.housingFundDeduction, 0);
    const totalTax = salaryRecords.reduce((sum, s) => sum + s.tax, 0);
    const totalDeduction = salaryRecords.reduce((sum, s) => sum + s.deduction, 0);
    const totalSalary = salaryRecords.reduce((sum, s) => sum + s.totalSalary, 0);
    
    return `
        <h4>${month} 薪资统计报表</h4>
        <table style="margin-top: 1rem;">
            <thead>
                <tr>
                    <th>指标</th>
                    <th>金额</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>发放人数</td>
                    <td>${salaryRecords.length}人</td>
                </tr>
                <tr>
                    <td>基本工资总额</td>
                    <td>¥${totalBaseSalary.toLocaleString()}</td>
                </tr>
                <tr>
                    <td>加班费总额</td>
                    <td>¥${totalOvertimePay.toLocaleString()}</td>
                </tr>
                <tr>
                    <td>奖金总额</td>
                    <td>¥${totalBonus.toLocaleString()}</td>
                </tr>
                <tr>
                    <td>交通补贴总额</td>
                    <td>¥${totalTransportationAllowance.toLocaleString()}</td>
                </tr>
                <tr>
                    <td>餐补总额</td>
                    <td>¥${totalMealAllowance.toLocaleString()}</td>
                </tr>
                <tr>
                    <td>社保扣款总额</td>
                    <td>¥${totalSocialSecurityDeduction.toLocaleString()}</td>
                </tr>
                <tr>
                    <td>公积金扣款总额</td>
                    <td>¥${totalHousingFundDeduction.toLocaleString()}</td>
                </tr>
                <tr>
                    <td>个税总额</td>
                    <td>¥${totalTax.toLocaleString()}</td>
                </tr>
                <tr>
                    <td>其他扣款总额</td>
                    <td>¥${totalDeduction.toLocaleString()}</td>
                </tr>
                <tr>
                    <td>实发工资总额</td>
                    <td style="font-weight: bold; color: var(--success-color);">¥${totalSalary.toLocaleString()}</td>
                </tr>
            </tbody>
        </table>
    `;
}

function generateDepartmentReport(month) {
    const employees = dataManager.getEmployees().filter(e => e.status === '在职');
    const departments = [...new Set(employees.map(e => e.department))];
    
    let departmentStats = departments.map(dept => {
        const deptEmployees = employees.filter(e => e.department === dept);
        const avgSalary = deptEmployees.reduce((sum, e) => sum + e.salary, 0) / deptEmployees.length;
        
        return {
            department: dept,
            employeeCount: deptEmployees.length,
            avgSalary: Math.round(avgSalary)
        };
    });
    
    return `
        <h4>部门统计报表</h4>
        <table style="margin-top: 1rem;">
            <thead>
                <tr>
                    <th>部门</th>
                    <th>员工数</th>
                    <th>平均工资</th>
                </tr>
            </thead>
            <tbody>
                ${departmentStats.map(stat => `
                    <tr>
                        <td>${stat.department}</td>
                        <td>${stat.employeeCount}人</td>
                        <td>¥${stat.avgSalary.toLocaleString()}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// 导出报表
function exportReport() {
    const reportType = document.getElementById('report-type').value;
    const month = document.getElementById('report-month').value;
    let data = [];
    let headers = [];
    let filename = '';
    
    switch(reportType) {
        case 'attendance':
            headers = ['员工工号', '姓名', '部门', '日期', '上班时间', '下班时间', '工作时长', '状态'];
            data = [headers];
            const attendance = dataManager.getAttendance().filter(a => a.date.startsWith(month));
            attendance.forEach(a => {
                data.push([
                    dataManager.getEmployeeById(a.employeeId)?.code || '-',
                    a.employeeName, a.department, a.date, a.clockIn, a.clockOut, a.workHours, a.status
                ]);
            });
            filename = `考勤记录_${month}.xlsx`;
            break;
        case 'salary':
            const salaryRecords = dataManager.getSalary().filter(s => s.month === month);
            headers = ['员工工号', '姓名', '部门', '基本工资', '加班费', '奖金', '交通补贴', '餐补', '社保扣款', '公积金扣款', '个税', '其他扣款', '实发工资', '状态'];
            data = [headers];
            salaryRecords.forEach(s => {
                data.push([
                    dataManager.getEmployeeById(s.employeeId)?.code || '-',
                    s.employeeName, s.department, s.baseSalary, s.overtimePay, s.bonus, s.transportationAllowance, s.mealAllowance, s.socialSecurityDeduction, s.housingFundDeduction, s.tax, s.deduction, s.totalSalary, s.status
                ]);
            });
            filename = `薪资记录_${month}.xlsx`;
            break;
        case 'department':
            const employees = dataManager.getEmployees().filter(e => e.status === '在职');
            headers = ['部门', '员工数', '平均工资'];
            data = [headers];
            const departments = [...new Set(employees.map(e => e.department))];
            departments.forEach(dept => {
                const deptEmployees = employees.filter(e => e.department === dept);
                const avgSalary = deptEmployees.reduce((sum, e) => sum + e.salary, 0) / deptEmployees.length;
                data.push([dept, deptEmployees.length, Math.round(avgSalary)]);
            });
            filename = `部门统计_${month}.xlsx`;
            break;
    }
    
    exportToExcel(data, filename);
    showNotification('报表导出成功', 'success');
}

// Excel导出函数
function exportToExcel(data, filename) {
    if (typeof XLSX === 'undefined') {
        showNotification('SheetJS库未加载，请稍后重试', 'error');
        return;
    }
    
    try {
        const ws = XLSX.utils.aoa_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        XLSX.writeFile(wb, filename);
    } catch (error) {
        showNotification(`导出失败: ${error.message}`, 'error');
    }
}

// ==================== 系统设置 ====================

function loadSettings() {
    const settings = dataManager.getSettings();
    
    // 填充考勤设置
    document.getElementById('work-start-time').value = settings.workStartTime;
    document.getElementById('work-end-time').value = settings.workEndTime;
    document.getElementById('late-threshold').value = settings.lateThreshold;
    document.getElementById('early-leave-threshold').value = settings.earlyLeaveThreshold;
    
    // 填充薪资设置
    document.getElementById('overtime-rate').value = settings.overtimeRate;
    document.getElementById('weekend-overtime-rate').value = settings.weekendOvertimeRate;
    document.getElementById('holiday-overtime-rate').value = settings.holidayOvertimeRate;
    document.getElementById('transportation-allowance').value = settings.transportationAllowance;
    document.getElementById('meal-allowance').value = settings.mealAllowance;
    document.getElementById('social-security-rate').value = settings.socialSecurityRate;
    document.getElementById('housing-fund-rate').value = settings.housingFundRate;
    
    // 填充系统管理
    document.getElementById('company-name').value = settings.companyName;
    document.getElementById('admin-email').value = settings.adminEmail;
    
    // 加载用户数据
    loadUsers();
}

function saveSettings() {
    const settings = {
        workStartTime: document.getElementById('work-start-time').value,
        workEndTime: document.getElementById('work-end-time').value,
        lateThreshold: parseInt(document.getElementById('late-threshold').value),
        earlyLeaveThreshold: parseInt(document.getElementById('early-leave-threshold').value),
        overtimeRate: parseFloat(document.getElementById('overtime-rate').value),
        weekendOvertimeRate: parseFloat(document.getElementById('weekend-overtime-rate').value),
        holidayOvertimeRate: parseFloat(document.getElementById('holiday-overtime-rate').value),
        transportationAllowance: parseInt(document.getElementById('transportation-allowance').value),
        mealAllowance: parseInt(document.getElementById('meal-allowance').value),
        socialSecurityRate: parseFloat(document.getElementById('social-security-rate').value),
        housingFundRate: parseFloat(document.getElementById('housing-fund-rate').value),
        companyName: document.getElementById('company-name').value,
        adminEmail: document.getElementById('admin-email').value
    };
    
    dataManager.updateSettings(settings);
    showNotification('设置保存成功', 'success');
}

function resetData() {
    if (confirm('确定要重置所有数据吗？此操作不可恢复！')) {
        localStorage.clear();
        dataManager.initializeData();
        loadDashboard();
        showNotification('数据已重置', 'success');
    }
}

// 用户管理功能
function loadUsers() {
    const users = dataManager.getUsers();
    const tbody = document.getElementById('user-table');
    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.username}</td>
            <td>${user.role}</td>
            <td><button class="btn btn-sm btn-accent" onclick="deleteUser('${user.username}')">删除</button></td>
        </tr>
    `).join('');
}

function addUser() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
        showNotification('请输入用户名和密码', 'error');
        return;
    }
    
    const user = {
        username: username,
        password: password,
        role: '普通用户'
    };
    
    const result = dataManager.addUser(user);
    if (result) {
        showNotification('用户添加成功', 'success');
        loadUsers();
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
    } else {
        showNotification('用户名已存在', 'error');
    }
}

function deleteUser(username) {
    if (confirm(`确定要删除用户 ${username} 吗？`)) {
        const users = dataManager.getUsers();
        const filteredUsers = users.filter(u => u.username !== username);
        localStorage.setItem('users', JSON.stringify(filteredUsers));
        loadUsers();
        showNotification('用户删除成功', 'success');
    }
}

// ==================== 控制面板 ====================

function loadDashboard() {
    const stats = dataManager.getDashboardStats();
    
    // 更新统计卡片
    document.querySelector('.stat-card:nth-child(1) p').textContent = `${stats.attendanceRate}%`;
    document.querySelector('.stat-card:nth-child(2) p').textContent = `${stats.lateCount}人`;
    document.querySelector('.stat-card:nth-child(3) p').textContent = `${stats.pendingLeaves}条`;
    document.querySelector('.stat-card:nth-child(4) p').textContent = `¥${stats.totalSalary.toLocaleString()}`;
    
    // 更新考勤异常表格
    const tbody = document.getElementById('dashboard-exceptions');
    tbody.innerHTML = stats.exceptions.map(e => `
        <tr>
            <td>${dataManager.getEmployeeById(e.employeeId)?.code || '-'}</td>
            <td>${e.employeeName}</td>
            <td>${e.date}</td>
            <td><span class="badge badge-${e.status === '缺勤' ? 'danger' : 'warning'}">${e.status}</span></td>
            <td><span class="badge badge-info">未处理</span></td>
            <td><button class="btn btn-sm" onclick="navigateTo('attendance')">处理</button></td>
        </tr>
    `).join('');
}

// ==================== 通用功能 ====================

// 显示通知
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// 填充个人考勤查询的员工下拉框
function fillPersonalAttendanceEmployeeDropdown() {
    const employeeSelect = document.getElementById('personal-attendance-employee');
    const employees = dataManager.getEmployees().filter(e => e.status === '在职');
    
    // 清空现有选项
    employeeSelect.innerHTML = '<option value="">选择员工</option>';
    
    // 添加员工选项
    employees.forEach(emp => {
        const option = document.createElement('option');
        option.value = emp.id;
        option.textContent = `${emp.name} (${emp.code})`;
        employeeSelect.appendChild(option);
    });
}

// 添加个人考勤查询功能
function searchPersonalAttendance() {
    const employeeId = document.getElementById('personal-attendance-employee').value;
    const startDate = document.getElementById('personal-attendance-start-date').value;
    const endDate = document.getElementById('personal-attendance-end-date').value;
    
    if (!employeeId) {
        showNotification('请选择员工', 'error');
        return;
    }
    
    const attendance = dataManager.getAttendanceByEmployee(parseInt(employeeId), startDate, endDate);
    const tbody = document.getElementById('attendance-table');
    
    // 按员工和日期分组，将上下班记录合并到一行
    const groupedAttendance = {};
    attendance.forEach(record => {
        const key = `${record.employeeId}-${record.date}`;
        if (!groupedAttendance[key]) {
            groupedAttendance[key] = [];
        }
        groupedAttendance[key].push(record);
    });
    
    // 生成表格行
    tbody.innerHTML = Object.values(groupedAttendance).map(records => {
        const firstRecord = records[0];
        const clockIn = records.find(r => r.clockIn && r.clockIn !== '-')?.clockIn || '-';
        const clockOut = records.find(r => r.clockOut && r.clockOut !== '-')?.clockOut || '-';
        const workHours = firstRecord.workHours || 0.0;
        const status = firstRecord.status || '缺勤';
        const date = firstRecord.date;
        const employeeName = firstRecord.employeeName;
        const department = firstRecord.department;
        const id = firstRecord.id;
        const code = dataManager.getEmployeeById(firstRecord.employeeId)?.code || '-';
        
        return `
            <tr>
                <td>${code}</td>
                <td>${employeeName}</td>
                <td>${department}</td>
                <td>${date}</td>
                <td>${clockIn}</td>
                <td>${clockOut}</td>
                <td>${workHours}h</td>
                <td><span class="badge badge-${status === '正常' ? 'success' : 'warning'}">${status}</span></td>
                <td>
                    <button class="btn btn-sm" onclick="viewAttendance(${id})">查看</button>
                </td>
            </tr>
        `;
    }).join('');
}
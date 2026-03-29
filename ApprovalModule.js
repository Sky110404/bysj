// ApprovalModule.js - 请假与加班审批模块

class ApprovalModule {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.typeMap = {
            'leave': {
                title: '请假',
                modalId: 'leave-modal',
                employeeSelectId: 'leave-employee',
                formId: 'leave-form',
                tableId: 'leave-table',
                statusField: 'status',
                loadFn: () => this.loadLeaves(),
                searchFn: () => this.searchLeaves()
            },
            'overtime': {
                title: '加班',
                modalId: 'overtime-modal',
                employeeSelectId: 'overtime-employee',
                formId: 'overtime-form',
                tableId: 'overtime-table',
                statusField: 'status',
                loadFn: () => this.loadOvertime(),
                searchFn: () => this.searchOvertime()
                
            }
        };
        // 为请假管理的“查询”按钮绑定点击事件
        const leaveSearchBtn = document.getElementById('leave-search-btn');
        if (leaveSearchBtn) {
            leaveSearchBtn.addEventListener('click', () => this.searchLeaves());
        }
        // === 新增代码结束 ===
    }

    // ========== 通用方法 ==========

    _openModal(type) {
        const config = this.typeMap[type];
        const modal = document.getElementById(config.modalId);
        const select = document.getElementById(config.employeeSelectId);
        const employees = this.dataManager.getEmployees().filter(e => e.status === '在职');
        select.innerHTML = employees.map(e => 
            `<option value="${e.id}">${e.name} (${e.code})</option>`
        ).join('');
        modal.classList.add('active');
    }

    _closeModal(type) {
        document.getElementById(this.typeMap[type].modalId).classList.remove('active');
    }

    _renderTable(type, records) {
        const config = this.typeMap[type];
        const tbody = document.getElementById(config.tableId);
        if (!tbody) return;

        tbody.innerHTML = records.map(record => {
            const code = this.dataManager.getEmployeeById(record.employeeId)?.code || '-';
            const statusClass = record[config.statusField] === '已批准' ? 'success' : 
                               record[config.statusField] === '已拒绝' ? 'danger' : 'warning';
            
            let actionBtns = '';
            if (record[config.statusField] === '待审核') {
                actionBtns = `
                    <div class="btn-group">
                        <button class="btn btn-sm btn-success" onclick="approvalModule.approve${this._capitalize(type)}(${record.id})">批准</button>
                        <button class="btn btn-sm btn-accent" onclick="approvalModule.reject${this._capitalize(type)}(${record.id})">拒绝</button>
                    </div>
                `;
            } else {
                actionBtns = '-';
            }

            if (type === 'leave') {
                return `
                    <tr>
                        <td>${code}</td>
                        <td>${record.employeeName}</td>
                        <td>${record.type}</td>
                        <td>${record.startDate}</td>
                        <td>${record.endDate}</td>
                        <td>${record.days}天</td>
                        <td>${record.reason}</td>
                        <td><span class="badge badge-${statusClass}">${record[config.statusField]}</span></td>
                        <td>${actionBtns}</td>
                    </tr>
                `;
            } else { // overtime
                return `
                    <tr>
                        <td>${code}</td>
                        <td>${record.employeeName}</td>
                        <td>${record.date}</td>
                        <td>${record.startTime}</td>
                        <td>${record.endTime}</td>
                        <td>${record.hours}h</td>
                        <td>${record.reason}</td>
                        <td><span class="badge badge-${statusClass}">${record[config.statusField]}</span></td>
                        <td>${actionBtns}</td>
                    </tr>
                `;
            }
        }).join('');
    }

    _capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // ========== 请假管理 ==========

    loadLeaves() {
        this.searchLeaves();
    }

    searchLeaves() {
    const statusFilter = document.getElementById('leave-status-filter')?.value || '';
    // 修正：使用正确的输入框ID 'leave-search'
    const searchValue = document.getElementById('leave-search')?.value.toLowerCase() || '';
    let leaves = this.dataManager.getLeaves();

    if (statusFilter) leaves = leaves.filter(l => l.status === statusFilter);
    if (searchValue) leaves = leaves.filter(l => l.employeeName.toLowerCase().includes(searchValue));

    this._renderTable('leave', leaves);
}

    openLeaveModal() {
        this._openModal('leave');
    }

    closeLeaveModal() {
        this._closeModal('leave');
    }

    saveLeave(event) {
        event.preventDefault();
        const employeeId = parseInt(document.getElementById('leave-employee').value);
        const employee = this.dataManager.getEmployeeById(employeeId);
        
        const leaveData = {
            employeeId,
            employeeName: employee.name,
            type: document.getElementById('leave-type').value,
            startDate: document.getElementById('leave-start-date').value,
            endDate: document.getElementById('leave-end-date').value,
            days: parseFloat(document.getElementById('leave-days').value),
            reason: document.getElementById('leave-reason').value
        };

        this.dataManager.addLeave(leaveData);
        showNotification('请假申请提交成功', 'success');
        this.closeLeaveModal();
        this.loadLeaves();
        loadDashboard();
    }

    approveLeave(id) {
        this.dataManager.updateLeaveStatus(id, '已批准');
        showNotification('请假已批准', 'success');
        this.loadLeaves();
    }

    rejectLeave(id) {
        this.dataManager.updateLeaveStatus(id, '已拒绝');
        showNotification('请假已拒绝', 'error');
        this.loadLeaves();
    }

    // ========== 加班管理 ==========

    loadOvertime() {
        this.searchOvertime();
    }

    searchOvertime() {
        const searchValue = document.getElementById('overtime-search')?.value.toLowerCase() || '';
        const month = document.getElementById('overtime-month')?.value || '';
        let overtime = this.dataManager.getOvertime();

        if (searchValue) overtime = overtime.filter(o => o.employeeName.toLowerCase().includes(searchValue));
        if (month) overtime = overtime.filter(o => o.date.startsWith(month));

        this._renderTable('overtime', overtime);
    }

    openOvertimeModal() {
        this._openModal('overtime');
    }

    closeOvertimeModal() {
        this._closeModal('overtime');
    }

    saveOvertime(event) {
        event.preventDefault();
        const employeeId = parseInt(document.getElementById('overtime-employee').value);
        const employee = this.dataManager.getEmployeeById(employeeId);
        
        const overtimeData = {
            employeeId,
            employeeName: employee.name,
            date: document.getElementById('overtime-date').value,
            startTime: document.getElementById('overtime-start-time').value,
            endTime: document.getElementById('overtime-end-time').value,
            hours: parseFloat(document.getElementById('overtime-hours').value),
            reason: document.getElementById('overtime-reason').value
        };

        this.dataManager.addOvertime(overtimeData);
        showNotification('加班申请提交成功', 'success');
        this.closeOvertimeModal();
        this.loadOvertime();
        loadDashboard();
    }

    approveOvertime(id) {
        this.dataManager.updateOvertimeStatus(id, '已批准');
        showNotification('加班已批准', 'success');
        this.loadOvertime();
    }

    rejectOvertime(id) {
        this.dataManager.updateOvertimeStatus(id, '已拒绝');
        showNotification('加班已拒绝', 'error');
        this.loadOvertime();
    }
}

// 全局实例
const approvalModule = new ApprovalModule(dataManager);

// 兼容旧函数名（入口适配器）
function loadLeaves() { approvalModule.loadLeaves(); }
function searchLeaves() { approvalModule.searchLeaves(); }
function openLeaveModal() { approvalModule.openLeaveModal(); }
function closeLeaveModal() { approvalModule.closeLeaveModal(); }
function saveLeave(event) { approvalModule.saveLeave(event); }
function approveLeave(id) { approvalModule.approveLeave(id); }
function rejectLeave(id) { approvalModule.rejectLeave(id); }

function loadOvertime() { approvalModule.loadOvertime(); }
function searchOvertime() { approvalModule.searchOvertime(); }
function openOvertimeModal() { approvalModule.openOvertimeModal(); }
function closeOvertimeModal() { approvalModule.closeOvertimeModal(); }
function saveOvertime(event) { approvalModule.saveOvertime(event); }
function approveOvertime(id) { approvalModule.approveOvertime(id); }
function rejectOvertime(id) { approvalModule.rejectOvertime(id); }
// EmployeeModule.js - 员工管理模块

class EmployeeModule {
    constructor(dataManager) {
        this.dataManager = dataManager;
    }

    // 加载并渲染员工列表（支持搜索和部门筛选）
    loadEmployees() {
        let employees = this.dataManager.getEmployees();
        
        const searchValue = document.getElementById('employee-search')?.value.toLowerCase() || '';
        const departmentFilter = document.getElementById('employee-department-filter')?.value || '';

        if (searchValue) {
            employees = employees.filter(e =>
                e.name.toLowerCase().includes(searchValue) ||
                e.code.toLowerCase().includes(searchValue) ||
                e.department.toLowerCase().includes(searchValue)
            );
        }
        if (departmentFilter) {
            employees = employees.filter(e => e.department === departmentFilter);
        }

        const tbody = document.getElementById('employee-table');
        if (!tbody) return;

        tbody.innerHTML = employees.map(emp => `
            <tr>
                <td>${emp.code}</td>
                <td>${emp.name}</td>
                <td>${emp.department}</td>
                <td>${emp.position}</td>
                <td>${emp.joinDate}</td>
                <td>
                    <span class="badge badge-${emp.status === '在职' ? 'success' : emp.status === '离职' ? 'danger' : 'warning'}">
                        ${emp.status}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm" onclick="employeeModule.editEmployee(${emp.id})">编辑</button>
                    <button class="btn btn-sm btn-accent" onclick="employeeModule.deleteEmployee(${emp.id})">删除</button>
                </td>
            </tr>
        `).join('');
    }

    // 打开员工模态框（新增或编辑）
    openEmployeeModal(employeeId = null) {
        const modal = document.getElementById('employee-modal');
        const title = document.getElementById('employee-modal-title');
        const form = document.getElementById('employee-form');
        form.reset();

        if (employeeId !== null) {
            // 编辑模式
            const employee = this.dataManager.getEmployeeById(employeeId);
            if (!employee) return;
            title.textContent = '编辑员工';
            document.getElementById('employee-id').value = employee.id;
            document.getElementById('employee-code').value = employee.code;
            document.getElementById('employee-name').value = employee.name;
            document.getElementById('employee-department').value = employee.department;
            document.getElementById('employee-position').value = employee.position;
            document.getElementById('employee-join-date').value = employee.joinDate;
            document.getElementById('employee-salary').value = employee.salary;
            document.getElementById('employee-phone').value = employee.phone || '';
            document.getElementById('employee-status').value = employee.status;
        } else {
            // 新增模式
            title.textContent = '新增员工';
            document.getElementById('employee-id').value = '';
        }

        modal.classList.add('active');
    }

    closeEmployeeModal() {
        document.getElementById('employee-modal').classList.remove('active');
    }

    // 保存员工（新增或更新）
    saveEmployee(event) {
        event.preventDefault();
        const id = document.getElementById('employee-id').value;
        const employeeData = {
            code: document.getElementById('employee-code').value,
            name: document.getElementById('employee-name').value,
            department: document.getElementById('employee-department').value,
            position: document.getElementById('employee-position').value,
            joinDate: document.getElementById('employee-join-date').value,
            salary: parseFloat(document.getElementById('employee-salary').value),
            phone: document.getElementById('employee-phone').value,
            status: document.getElementById('employee-status').value
        };

        if (id) {
            // 更新
            this.dataManager.updateEmployee(parseInt(id), employeeData);
            showNotification('员工信息更新成功', 'success');
        } else {
            // 新增
            this.dataManager.addEmployee(employeeData);
            showNotification('员工添加成功', 'success');
        }

        this.closeEmployeeModal();
        this.loadEmployees();
        // 刷新依赖员工数据的下拉框
        this.fillAllEmployeeDropdowns();
    }

    editEmployee(id) {
        this.openEmployeeModal(id);
    }

    deleteEmployee(id) {
        if (confirm('确定要删除该员工吗？')) {
            this.dataManager.deleteEmployee(id);
            showNotification('员工删除成功', 'success');
            this.loadEmployees();
            this.fillAllEmployeeDropdowns();
        }
    }

    // 导出员工数据
    exportEmployees() {
        const employees = this.dataManager.getEmployees();
        const headers = ['工号', '姓名', '部门', '职位', '入职日期', '基本工资', '联系电话', '状态'];
        const rows = employees.map(emp => [
            emp.code,
            emp.name,
            emp.department,
            emp.position,
            emp.joinDate,
            emp.salary,
            emp.phone || '-',
            emp.status
        ]);
        const data = [headers, ...rows];
        exportToExcel(data, '员工信息.xlsx');
        showNotification('员工数据导出成功', 'success');
    }

    // 填充所有员工下拉框（复用）
    fillAllEmployeeDropdowns() {
        this.fillDropdown('personal-attendance-employee');
        this.fillDropdown('personal-salary-employee');
        this.fillDropdown('clockin-employee');
        this.fillDropdown('leave-employee');
        this.fillDropdown('overtime-employee');
        this.fillDropdown('salary-employee-filter');
    }

    // 通用下拉框填充方法
    fillDropdown(selectId) {
        const select = document.getElementById(selectId);
        if (!select) return;

        const employees = this.dataManager.getEmployees().filter(e => e.status === '在职');
        select.innerHTML = '<option value="">选择员工</option>';
        employees.forEach(emp => {
            const option = document.createElement('option');
            option.value = emp.id;
            option.textContent = `${emp.name} (${emp.code})`;
            select.appendChild(option);
        });
    }
}

// 全局实例（供 HTML onclick 调用）
const employeeModule = new EmployeeModule(dataManager);

// 兼容旧函数名（入口适配器）
function loadEmployees() { employeeModule.loadEmployees(); }
function openEmployeeModal() { employeeModule.openEmployeeModal(); }
function closeEmployeeModal() { employeeModule.closeEmployeeModal(); }
function saveEmployee(event) { employeeModule.saveEmployee(event); }
function editEmployee(id) { employeeModule.editEmployee(id); }
function deleteEmployee(id) { employeeModule.deleteEmployee(id); }
function exportEmployees() { employeeModule.exportEmployees(); }
function fillPersonalAttendanceEmployeeDropdown() { 
    employeeModule.fillDropdown('personal-attendance-employee'); 
}
function fillPersonalSalaryEmployeeDropdown() { 
    employeeModule.fillDropdown('personal-salary-employee'); 
}
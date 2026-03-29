// AttendanceModule.js - 考勤管理模块

class AttendanceModule {
    constructor(dataManager) {
        this.dataManager = dataManager;
    }

  // 加载并渲染考勤列表（支持分组）
loadAttendance() {
    // 直接从 dataManager 获取最新数据
    const allAttendanceData = dataManager.getAttendance();
    console.log("【详细调试】loadAttendance 获取到的完整数据:");
    console.table(allAttendanceData); // This will show a nice table in the console

    const tbody = document.getElementById('attendance-table');
    if (!tbody) {
        console.error("【错误】未找到 ID 为 'attendance-table' 的元素");
        return;
    }

    // 如果没有任何数据，显示空状态
    if (allAttendanceData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; color: #999;">暂无考勤记录</td></tr>';
        return;
    }

    // 简单地遍历所有记录并渲染，不做任何分组或复杂逻辑
    tbody.innerHTML = allAttendanceData.map((record, index) => {
        // Log each record individually
        console.log(`【记录 ${index}】`, record);

        // 确保每个字段都有默认值
        const code = dataManager.getEmployeeById(record.employeeId)?.code || 'N/A';
        const name = record.employeeName || '未知';
        const dept = record.department || '未知';
        const date = record.date || '1970-01-01';
        const clockIn = record.clockIn || '-';
        const clockOut = record.clockOut || '-';
        const workHours = (record.workHours !== undefined) ? record.workHours.toFixed(1) : '0.0';
        const status = record.status || '缺勤';

        // Log the final values used for rendering
        console.log(`【渲染值】Code: ${code}, Status: ${status}`);

        return `
            <tr>
                <td>${code}</td>
                <td>${name}</td>
                <td>${dept}</td>
                <td>${date}</td>
                <td>${clockIn}</td>
                <td>${clockOut}</td>
                <td>${workHours}h</td>
                <td><span class="badge badge-${status === '正常' ? 'success' : status === '迟到' || status === '早退' ? 'warning' : 'danger'}">${status}</span></td>
                <td>
                    <button class="btn btn-sm" onclick="attendanceModule.viewAttendance(${record.id})">查看</button>
                    <button class="btn btn-sm btn-accent" onclick="attendanceModule.deleteAttendance(${record.id})">删除</button>
                </td>
            </tr>
        `;
    }).join('');
}
// 查询考勤
searchAttendance() {
    const startDate = document.getElementById('attendance-start-date').value;
    const endDate = document.getElementById('attendance-end-date').value;
    const dept = document.getElementById('attendance-department-filter').value;
    const status = document.getElementById('attendance-status-filter').value;
    const empSearch = document.getElementById('employee-search-attendance')?.value || '';

    // 使用 dataManager 的 getAttendance 方法获取所有数据，然后进行前端过滤
    let attendance = this.dataManager.getAttendance();

    // 应用日期范围过滤
    if (startDate) {
        attendance = attendance.filter(a => a.date >= startDate);
    }
    if (endDate) {
        attendance = attendance.filter(a => a.date <= endDate);
    }

    // 应用部门过滤
    if (dept) {
        attendance = attendance.filter(a => a.department === dept);
    }

    // 应用状态过滤
    if (status) {
        attendance = attendance.filter(a => a.status === status);
    }

    // 应用员工姓名/ID 搜索
    if (empSearch) {
        attendance = attendance.filter(a =>
            a.employeeName.toLowerCase().includes(empSearch.toLowerCase()) ||
            (a.employeeId && a.employeeId.toString().includes(empSearch))
        );
    }

    // 调用私有方法渲染表格
    this._renderAttendanceTable(attendance);
}

    // 私有方法：渲染考勤表格
    _renderAttendanceTable(attendance) {
        const grouped = {};
        attendance.forEach(record => {
            const key = `${record.employeeId}-${record.date}`;
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(record);
        });

        const tbody = document.getElementById('attendance-table');
        tbody.innerHTML = Object.values(grouped).map(records => {
            const first = records[0];
            const clockIn = records.find(r => r.clockIn && r.clockIn !== '-')?.clockIn || '-';
            const clockOut = records.find(r => r.clockOut && r.clockOut !== '-')?.clockOut || '-';
            const workHours = first.workHours || 0.0;
            const status = first.status || '缺勤';
            const code = this.dataManager.getEmployeeById(first.employeeId)?.code || '-';

            return `
                <tr>
                    <td>${code}</td>
                    <td>${first.employeeName}</td>
                    <td>${first.department}</td>
                    <td>${first.date}</td>
                    <td>${clockIn}</td>
                    <td>${clockOut}</td>
                    <td>${workHours}h</td>
                    <td><span class="badge badge-${status === '正常' ? 'success' : 'warning'}">${status}</span></td>
                    <td>
                        <button class="btn btn-sm" onclick="attendanceModule.viewAttendance(${first.id})">查看</button>
                        <button class="btn btn-sm btn-accent" onclick="attendanceModule.deleteAttendance(${first.id})">删除</button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // 打开打卡模态框
    openClockInModal() {
        const modal = document.getElementById('clockin-modal');
        const select = document.getElementById('clockin-employee');
        const employees = this.dataManager.getEmployees().filter(e => e.status === '在职');
        select.innerHTML = employees.map(e => 
            `<option value="${e.id}">${e.name} (${e.code})</option>`
        ).join('');
        document.getElementById('clockin-time').value = new Date().toISOString().slice(0, 16);
        modal.classList.add('active');
    }

    closeClockInModal() {
        document.getElementById('clockin-modal').classList.remove('active');
    }

    // 保存打卡
    saveClockIn(event) {
        event.preventDefault();
        const employeeId = parseInt(document.getElementById('clockin-employee').value);
        const clockType = document.getElementById('clockin-type').value;
        const clockTime = document.getElementById('clockin-time').value;
        const remark = document.getElementById('clockin-remark').value;

        const employee = this.dataManager.getEmployeeById(employeeId);
        const [date, time] = clockTime.split('T');

        const record = {
            employeeId,
            employeeName: employee.name,
            department: employee.department,
            date,
            clockIn: clockType === '上班' ? time : '-',
            clockOut: clockType === '下班' ? time : '-',
            clockType,
            remark
        };

        this.dataManager.addAttendance(record);
        showNotification('打卡成功', 'success');
        this.closeClockInModal();
        this.loadAttendance();
        loadDashboard(); // 更新控制面板
    }

    viewAttendance(id) {
        const record = this.dataManager.getAttendance().find(a => a.id === id);
        if (record) {
            alert(`考勤详情\n\n员工：${record.employeeName}\n日期：${record.date}\n上班：${record.clockIn}\n下班：${record.clockOut}\n状态：${record.status}\n工作时长：${record.workHours}小时`);
        }
    }

    deleteAttendance(id) {
        if (!confirm('确定要删除这条考勤记录吗？此操作不可恢复。')) return;

        const attendance = this.dataManager.getAttendance();
        const index = attendance.findIndex(a => a.id === id);
        if (index !== -1) {
            attendance.splice(index, 1);
            localStorage.setItem('attendance', JSON.stringify(attendance));
            this.loadAttendance();
            loadDashboard();
            showNotification('考勤记录删除成功', 'success');
        } else {
            showNotification('未找到要删除的考勤记录', 'error');
        }
    }

    // ====== 考勤导入功能 ======

    importAttendance() {
        document.getElementById('import-modal').classList.add('active');
    }

    closeImportModal() {
        document.getElementById('import-modal').classList.remove('active');
        this.resetImportForm();
        const fileInput = document.getElementById('import-file');
        if (fileInput) {
            fileInput.value = '';
            const dt = new DataTransfer();
            fileInput.files = dt.files;
        }
    }

    resetImportForm() {
        const elements = {
            'file-info': 'none',
            'import-progress': 'none',
            'import-results': 'none'
        };
        for (const [id, display] of Object.entries(elements)) {
            const el = document.getElementById(id);
            if (el) el.style.display = display;
        }
        const checkboxes = ['overwrite-existing', 'skip-errors'];
        checkboxes.forEach(id => {
            const cb = document.getElementById(id);
            if (cb) cb.checked = true;
        });
    }

    setupFileUploadListener() {
        const fileInput = document.getElementById('import-file');
        if (!fileInput) return;
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const info = document.getElementById('file-info');
                if (info) {
                    info.innerHTML = `<strong>已选择文件:</strong> ${file.name} (${(file.size / 1024).toFixed(2)} KB)`;
                    info.style.display = 'block';
                }
            }
        });
    }

    initializeDragAndDrop() {
        const area = document.getElementById('file-upload-area');
        if (!area) return;

        const preventDefaults = (e) => { e.preventDefault(); e.stopPropagation(); };
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            area.addEventListener(eventName, preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            area.addEventListener(eventName, () => area.classList.add('drag-over'), false);
        });
        ['dragleave', 'drop'].forEach(eventName => {
            area.addEventListener(eventName, () => area.classList.remove('drag-over'), false);
        });

        area.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length) {
                document.getElementById('import-file').files = files;
                document.getElementById('import-file').dispatchEvent(new Event('change'));
            }
        }, false);
    }

    async startImport() {
        const fileInput = document.getElementById('import-file');
        const file = fileInput.files[0];
        if (!file) {
            showNotification('请选择一个文件', 'error');
            return;
        }

        try {
            const progress = document.getElementById('import-progress');
            if (progress) {
                progress.style.display = 'block';
                document.getElementById('progress-fill').style.width = '0%';
                document.getElementById('progress-text').textContent = '正在解析文件...';
            }

            const { records, errors } = await this.parseAttendanceFile(file);
            if (records.length === 0) {
                showNotification('文件中没有有效的考勤数据', 'warning');
                this.closeImportModal();
                return;
            }

            await this.processAttendanceImport(records, errors);
        } catch (error) {
            console.error('导入过程出错:', error);
            showNotification(`导入失败: ${error.message}`, 'error');
            const progress = document.getElementById('import-progress');
            if (progress) progress.style.display = 'none';
        }
    }

    parseAttendanceFile(file) {
        return new Promise((resolve, reject) => {
            if (typeof XLSX === 'undefined') {
                reject(new Error('SheetJS库未加载'));
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheet = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true });

                    if (jsonData.length < 2) {
                        reject(new Error('文件为空或格式不正确'));
                        return;
                    }

                    const headers = jsonData[0].map(h => h.toString().trim());
                    const rows = jsonData.slice(1);
                    const records = [];
                    const errors = [];

                    const columnMap = {
                        'employeeId': ['工号', '员工编号', 'ID'],
                        'employeeName': ['姓名', '员工姓名'],
                        'department': ['部门', '所属部门'],
                        'date': ['日期', '考勤日期', 'Date'],
                        'clockIn': ['上班时间', '上班打卡', 'Clock In'],
                        'clockOut': ['下班时间', '下班打卡', 'Clock Out'],
                        'status': ['状态', '考勤状态']
                    };

                    const headerToProp = {};
                    headers.forEach((header, idx) => {
                        for (const [prop, names] of Object.entries(columnMap)) {
                            if (names.includes(header)) {
                                headerToProp[idx] = prop;
                                break;
                            }
                        }
                    });

                    rows.forEach((row, i) => {
                        try {
                            const record = {};
                            row.forEach((cell, cellIdx) => {
                                const prop = headerToProp[cellIdx];
                                if (prop) {
                                    let value = cell;
                                    if (prop === 'date') value = this.excelDateToJSDate(cell);
                                    if ((prop === 'clockIn' || prop === 'clockOut') && typeof value === 'number') {
                                        const totalMins = Math.floor(value * 24 * 60);
                                        const hours = String(Math.floor(totalMins / 60)).padStart(2, '0');
                                        const mins = String(totalMins % 60).padStart(2, '0');
                                        value = `${hours}:${mins}`;
                                    }
                                    record[prop] = value;
                                }
                            });

                            if (!record.employeeId && !record.employeeName) throw new Error('缺少员工信息');
                            if (!record.date) throw new Error('缺少日期');
                            records.push(record);
                        } catch (err) {
                            errors.push({ row: i + 2, error: `第 ${i + 2} 行: ${err.message}` });
                        }
                    });

                    resolve({ records, errors });
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = () => reject(new Error('文件读取失败'));
            reader.readAsArrayBuffer(file);
        });
    }

    excelDateToJSDate(serial) {
        if (typeof serial !== 'number') {
            if (typeof serial === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(serial)) return serial;
            return serial;
        }
        const utcDays = Math.floor(serial - 25569);
        const dateInfo = new Date(utcDays * 86400 * 1000);
        const year = dateInfo.getFullYear();
        const month = String(dateInfo.getMonth() + 1).padStart(2, '0');
        const day = String(dateInfo.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

async processAttendanceImport(records, errors) {
    const overwrite = document.getElementById('overwrite-existing').checked;
    const skipErrors = document.getElementById('skip-errors').checked;
    let successCount = 0;
    const importErrors = [];

    // 获取当前所有考勤记录，用于检查重复
    const currentAttendance = this.dataManager.getAttendance();
    const settings = this.dataManager.getSettings();

    for (let i = 0; i < records.length; i++) {
        const record = records[i];
        try {
            // 绑定员工信息
            this.bindEmployeeInfo(record);

            // 检查是否已存在相同员工同一天的记录
            const existingRecord = currentAttendance.find(a => 
                a.employeeId == record.employeeId && a.date === record.date
            );

            if (existingRecord) {
                if (!overwrite) {
                    if (!skipErrors) {
                        importErrors.push({ record, error: `重复记录: ${record.employeeName || record.employeeId} ${record.date}` });
                    }
                    continue;
                } else {
                    // 如果选择覆盖，则先删除旧记录
                    this.dataManager.deleteAttendance(existingRecord.id);
                }
            }

            // 手动计算工作时长和状态
            let workHours = 0.0;
            let status = '缺勤';

            const clockIn = record.clockIn || '-';
            const clockOut = record.clockOut || '-';

            // 计算工作时长
            if (clockIn !== '-' && clockOut !== '-') {
                workHours = this.calculateWorkHours(clockIn, clockOut);
            }

            // 判断考勤状态
            if (clockIn !== '-' && clockOut !== '-') {
                status = '正常'; // 先设为正常

                // 检查迟到
                const workStartTime = new Date(`2000-01-01 ${settings.workStartTime}`);
                const clockInTime = new Date(`2000-01-01 ${clockIn}`);
                const lateMinutes = (clockInTime - workStartTime) / (1000 * 60);
                if (lateMinutes > settings.lateThreshold) {
                    status = '迟到';
                }

                // 检查早退
                const workEndTime = new Date(`2000-01-01 ${settings.workEndTime}`);
                const clockOutTime = new Date(`2000-01-01 ${clockOut}`);
                const earlyLeaveMinutes = (workEndTime - clockOutTime) / (1000 * 60);
                if (earlyLeaveMinutes > settings.earlyLeaveThreshold) {
                    status = '早退';
                }
            } else if (clockIn !== '-' || clockOut !== '-') {
                // 只有上班或只有下班，也视为缺勤（或可自定义为其他状态）
                status = '缺勤';
            }

            // 创建最终的新记录
            const newRecord = {
                employeeId: record.employeeId,
                employeeName: record.employeeName,
                department: record.department,
                date: record.date,
                clockIn: clockIn,
                clockOut: clockOut,
                workHours: workHours,
                status: status,
                remark: record.remark || '',
                id: Date.now() + i // 确保ID唯一
            };

            // 直接推送到考勤数组，不再依赖 addAttendance 的复杂逻辑
            const attendance = this.dataManager.getAttendance();
            attendance.push(newRecord);
            localStorage.setItem('attendance', JSON.stringify(attendance));

            successCount++;

        } catch (err) {
            const errorMsg = `处理第 ${i + 1} 条记录时出错: ${err.message}`;
            importErrors.push({ record, error: errorMsg });
            if (!skipErrors) continue;
        }
    }

    const allErrors = [...errors, ...importErrors];
    const resultsDiv = document.getElementById('import-results');
    resultsDiv.style.display = 'block';
    resultsDiv.innerHTML = `
        <h4>导入完成</h4>
        <p>成功: ${successCount} 条</p>
        <p>失败: ${allErrors.length} 条</p>
        ${allErrors.length > 0 ? `<p style="color: var(--accent-color);">错误详情: ${allErrors.map(e => e.error).join(', ')}</p>` : ''}
    `;

    // 刷新UI
    this.loadAttendance();
    showNotification(`导入完成! 成功: ${successCount} 条, 失败: ${allErrors.length} 条`, 'success');
    setTimeout(() => this.closeImportModal(), 2000);
}

    bindEmployeeInfo(record) {
        let employee = null;
        if (record.employeeId && !isNaN(record.employeeId)) {
            employee = this.dataManager.getEmployeeById(parseInt(record.employeeId));
        }
        if (!employee && record.employeeId) {
            const all = this.dataManager.getEmployees();
            employee = all.find(emp => emp.code.toString() === record.employeeId.toString());
        }
        if (!employee && record.employeeName) {
            const all = this.dataManager.getEmployees();
            employee = all.find(emp => emp.name === record.employeeName);
        }
        if (employee) {
            record.employeeId = employee.id;
            record.employeeName = employee.name;
            record.department = employee.department;
        } else {
            console.warn('未找到匹配的员工:', record);
        }
    }

    calculateWorkHours(clockIn, clockOut) {
        try {
            const [inH, inM] = clockIn.split(':').map(Number);
            const [outH, outM] = clockOut.split(':').map(Number);
            const inTime = new Date(2000, 0, 1, inH, inM);
            const outTime = new Date(2000, 0, 1, outH, outM);
            if (outTime < inTime) outTime.setDate(outTime.getDate() + 1);
            const diffMins = Math.floor((outTime - inTime) / (1000 * 60));
            return parseFloat((diffMins / 60).toFixed(1));
        } catch (err) {
            console.error('计算工作时长出错:', err);
            return 0.0;
        }
    }
}

// 全局实例
const attendanceModule = new AttendanceModule(dataManager);

// 兼容旧函数名（入口适配器）
function loadAttendance() { attendanceModule.loadAttendance(); }
function searchAttendance() { attendanceModule.searchAttendance(); }
function openClockInModal() { attendanceModule.openClockInModal(); }
function closeClockInModal() { attendanceModule.closeClockInModal(); }
function saveClockIn(event) { attendanceModule.saveClockIn(event); }
function viewAttendance(id) { attendanceModule.viewAttendance(id); }
function deleteAttendance(id) { attendanceModule.deleteAttendance(id); }
function importAttendance() { attendanceModule.importAttendance(); }
function closeImportModal() { attendanceModule.closeImportModal(); }
function setupFileUploadListener() { attendanceModule.setupFileUploadListener(); }
function initializeDragAndDrop() { attendanceModule.initializeDragAndDrop(); }
function startImport() { attendanceModule.startImport(); }
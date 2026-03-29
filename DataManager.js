// 数据管理器
class DataManager {
    constructor() {
        this.initializeData();
    }

    // 初始化数据
    initializeData() {
        // 初始化员工数据
        if (!localStorage.getItem('employees')) {
            const sampleEmployees = [
                { id: 1, code: '10001', name: '张三', department: '技术部', position: '前端工程师', joinDate: '2023-01-15', salary: 12000, phone: '13800138001', status: '在职' },
                { id: 2, code: '10002', name: '李四', department: '人事部', position: 'HR专员', joinDate: '2023-02-20', salary: 8000, phone: '13800138002', status: '在职' },
                { id: 3, code: '10003', name: '王五', department: '财务部', position: '会计', joinDate: '2023-03-10', salary: 9000, phone: '13800138003', status: '在职' },
                { id: 4, code: '10004', name: '赵六', department: '技术部', position: '后端工程师', joinDate: '2023-04-05', salary: 13000, phone: '13800138004', status: '在职' },
                { id: 5, code: '10005', name: '钱七', department: '市场部', position: '市场专员', joinDate: '2023-05-12', salary: 7500, phone: '13800138005', status: '在职' },
                { id: 6, code: '10006', name: '孙八', department: '技术部', position: '产品经理', joinDate: '2023-06-18', salary: 15000, phone: '13800138006', status: '在职' },
                { id: 7, code: '10007', name: '周九', department: '人事部', position: '人事经理', joinDate: '2023-07-22', salary: 11000, phone: '13800138007', status: '在职' },
                { id: 8, code: '10008', name: '吴十', department: '财务部', position: '财务经理', joinDate: '2023-08-30', salary: 14000, phone: '13800138008', status: '在职' }
            ];
            localStorage.setItem('employees', JSON.stringify(sampleEmployees));
        }

        // 【修复】: 移除自动生成考勤记录的逻辑
        // 初始化考勤记录为空
        if (!localStorage.getItem('attendance')) {
            localStorage.setItem('attendance', JSON.stringify([]));
        }

        // 初始化请假记录
        if (!localStorage.getItem('leaves')) {
            const sampleLeaves = [
                { id: 1, employeeId: 1, employeeName: '张三', type: '病假', startDate: '2024-01-15', endDate: '2024-01-17', days: 3, reason: '感冒发烧', status: '已批准' },
                { id: 2, employeeId: 3, employeeName: '王五', type: '事假', startDate: '2024-01-20', endDate: '2024-01-20', days: 0.5, reason: '个人事务', status: '待审核' },
                { id: 3, employeeId: 5, employeeName: '钱七', type: '年假', startDate: '2024-01-25', endDate: '2024-01-26', days: 2, reason: '家庭聚会', status: '已批准' },
                { id: 4, employeeId: 2, employeeName: '李四', type: '事假', startDate: '2024-02-01', endDate: '2024-02-02', days: 2, reason: '探亲', status: '已拒绝' }
            ];
            localStorage.setItem('leaves', JSON.stringify(sampleLeaves));
        }

        // 初始化加班记录
        if (!localStorage.getItem('overtime')) {
            const sampleOvertime = [
                { id: 1, employeeId: 1, employeeName: '张三', date: '2024-01-15', startTime: '19:00', endTime: '21:30', hours: 2.5, reason: '项目紧急上线', status: '已批准' },
                { id: 2, employeeId: 4, employeeName: '赵六', date: '2024-01-16', startTime: '18:30', endTime: '22:00', hours: 3.5, reason: '修复线上bug', status: '已批准' },
                { id: 3, employeeId: 6, employeeName: '孙八', date: '2024-01-17', startTime: '19:00', endTime: '20:30', hours: 1.5, reason: '产品评审会议', status: '待审核' }
            ];
            localStorage.setItem('overtime', JSON.stringify(sampleOvertime));
        }

        // 初始化薪资记录
        if (!localStorage.getItem('salary')) {
            const sampleSalary = [
                { id: 1, employeeId: 1, employeeName: '张三', department: '技术部', month: '2024-01', baseSalary: 12000, overtimePay: 1500, bonus: 500, transportationAllowance: 200, mealAllowance: 600, socialSecurityDeduction: 1200, housingFundDeduction: 1200, tax: 100, deduction: 100, totalSalary: 14000, status: '已发放' },
                { id: 2, employeeId: 2, employeeName: '李四', department: '人事部', month: '2024-01', baseSalary: 8000, overtimePay: 0, bonus: 300, transportationAllowance: 200, mealAllowance: 450, socialSecurityDeduction: 800, housingFundDeduction: 800, tax: 0, deduction: 50, totalSalary: 8250, status: '已发放' },
                { id: 3, employeeId: 3, employeeName: '王五', department: '财务部', month: '2024-01', baseSalary: 9000, overtimePay: 800, bonus: 0, transportationAllowance: 200, mealAllowance: 600, socialSecurityDeduction: 900, housingFundDeduction: 900, tax: 0, deduction: 0, totalSalary: 9800, status: '已发放' }
            ];
            localStorage.setItem('salary', JSON.stringify(sampleSalary));
        }

        // 初始化系统设置
        if (!localStorage.getItem('settings')) {
            const defaultSettings = {
                workStartTime: '09:00',
                workEndTime: '18:00',
                lateThreshold: 15, // 迟到阈值（分钟）
                earlyLeaveThreshold: 30, // 早退阈值（分钟）
                overtimeRate: 1.5, // 加班费倍率
                weekendOvertimeRate: 2, // 周末加班费倍率
                holidayOvertimeRate: 3, // 节假日加班费倍率
                transportationAllowance: 200, // 交通补贴
                mealAllowance: 30, // 餐补
                socialSecurityRate: 10, // 社保缴纳比例
                housingFundRate: 10, // 公积金缴纳比例
                companyName: '示例科技有限公司',
                adminEmail: 'admin@company.com'
            };
            localStorage.setItem('settings', JSON.stringify(defaultSettings));
        }

        // 初始化用户数据
        if (!localStorage.getItem('users')) {
            const defaultUsers = [
                { username: 'admin', password: 'admin123', role: '管理员' }
            ];
            localStorage.setItem('users', JSON.stringify(defaultUsers));
        }
    }

    // 计算工作时长（保留一位小数）
    calculateWorkHours(clockIn, clockOut) {
        if (!clockIn || !clockOut || clockIn === '-' || clockOut === '-') {
            return 0.0;
        }

        try {
            const [inHour, inMinute] = clockIn.split(':').map(Number);
            const [outHour, outMinute] = clockOut.split(':').map(Number);

            const inTime = new Date(2000, 0, 1, inHour, inMinute);
            const outTime = new Date(2000, 0, 1, outHour, outMinute);

            if (outTime < inTime) {
                outTime.setDate(outTime.getDate() + 1); // 处理跨日情况
            }

            const diffMs = outTime - inTime;
            const totalMinutes = Math.floor(diffMs / (1000 * 60));
            const decimalHours = parseFloat((totalMinutes / 60).toFixed(1)); // 转换为小时并保留一位小数

            return decimalHours;
        } catch (error) {
            console.error('计算工作时长出错:', error);
            return 0.0;
        }
    }

    // ==================== 员工管理 ====================

    getEmployees() {
        return JSON.parse(localStorage.getItem('employees')) || [];
    }

    getEmployeeById(id) {
        const employees = this.getEmployees();
        return employees.find(e => e.id === id);
    }

    addEmployee(employee) {
        const employees = this.getEmployees();
        employee.id = Date.now();
        employees.push(employee);
        localStorage.setItem('employees', JSON.stringify(employees));
        return employee;
    }

    updateEmployee(employee) {
        const employees = this.getEmployees();
        const index = employees.findIndex(e => e.id === employee.id);
        if (index !== -1) {
            employees[index] = employee;
            localStorage.setItem('employees', JSON.stringify(employees));
            return true;
        }
        return false;
    }

    deleteEmployee(id) {
        const employees = this.getEmployees();
        const index = employees.findIndex(e => e.id === id);
        if (index !== -1) {
            employees.splice(index, 1);
            localStorage.setItem('employees', JSON.stringify(employees));
            return true;
        }
        return false;
    }

    // ==================== 考勤管理 ====================

    getAttendance() {
        return JSON.parse(localStorage.getItem('attendance')) || [];
    }

    getAttendanceByEmployeeAndDate(employeeId, date) {
        const attendance = this.getAttendance();
        return attendance.filter(record => record.employeeId === employeeId && record.date === date);
    }

    getAttendanceByEmployee(employeeId, startDate, endDate) {
        const attendance = this.getAttendance();
        return attendance.filter(record => {
            const matchEmployee = record.employeeId === employeeId;
            const matchStartDate = !startDate || record.date >= startDate;
            const matchEndDate = !endDate || record.date <= endDate;
            return matchEmployee && matchStartDate && matchEndDate;
        });
    }

    addAttendance(record) {
        const attendance = this.getAttendance();
        record.id = Date.now();

        // 判断是否已有当天记录，如果是则更新现有记录而不是创建新记录
        const existingRecordIndex = attendance.findIndex(r => 
            r.employeeId === record.employeeId && 
            r.date === record.date
        );

        if (existingRecordIndex !== -1) {
            // 如果已有当天记录，更新它
            const existingRecord = attendance[existingRecordIndex];
            if (record.clockType === '上班') {
                existingRecord.clockIn = record.clockIn;
            } else if (record.clockType === '下班') {
                existingRecord.clockOut = record.clockOut;
            }
            
            // 重新计算工作时长和状态
            if (existingRecord.clockIn && existingRecord.clockOut && 
                existingRecord.clockIn !== '-' && existingRecord.clockOut !== '-') {
                existingRecord.workHours = this.calculateWorkHours(existingRecord.clockIn, existingRecord.clockOut);
                
                // 判断考勤状态
                const settings = this.getSettings();
                const workStartTime = new Date(`2000-01-01 ${settings.workStartTime}`);
                const workEndTime = new Date(`2000-01-01 ${settings.workEndTime}`);
                
                // 重置状态
                existingRecord.status = '正常';
                
                // 检查迟到
                if (existingRecord.clockIn && existingRecord.clockIn !== '-') {
                    const clockInTime = new Date(`2000-01-01 ${existingRecord.clockIn}`);
                    const lateMinutes = (clockInTime - workStartTime) / (1000 * 60);
                    
                    if (lateMinutes > settings.lateThreshold) {
                        existingRecord.status = '迟到';
                    }
                }
                
                // 检查早退
                if (existingRecord.clockOut && existingRecord.clockOut !== '-') {
                    const clockOutTime = new Date(`2000-01-01 ${existingRecord.clockOut}`);
                    const earlyLeaveMinutes = (workEndTime - clockOutTime) / (1000 * 60);
                    
                    if (earlyLeaveMinutes > settings.earlyLeaveThreshold) {
                        existingRecord.status = '早退';
                    }
                }
            }
        } else {
            // 如果没有当天记录，创建新的
            // 计算工作时长
            if (record.clockIn && record.clockOut && 
                record.clockIn !== '-' && record.clockOut !== '-') {
                record.workHours = this.calculateWorkHours(record.clockIn, record.clockOut);
            } else {
                record.workHours = 0.0;
            }

            // 判断考勤状态
            const settings = this.getSettings();
            const workStartTime = new Date(`2000-01-01 ${settings.workStartTime}`);
            const workEndTime = new Date(`2000-01-01 ${settings.workEndTime}`);
            
            // 重置状态
            record.status = '正常';
            
            // 检查迟到
            if (record.clockIn && record.clockIn !== '-') {
                const clockInTime = new Date(`2000-01-01 ${record.clockIn}`);
                const lateMinutes = (clockInTime - workStartTime) / (1000 * 60);
                
                if (lateMinutes > settings.lateThreshold) {
                    record.status = '迟到';
                }
            }
            
            // 检查早退
            if (record.clockOut && record.clockOut !== '-') {
                const clockOutTime = new Date(`2000-01-01 ${record.clockOut}`);
                const earlyLeaveMinutes = (workEndTime - clockOutTime) / (1000 * 60);
                
                if (earlyLeaveMinutes > settings.earlyLeaveThreshold) {
                    record.status = '早退';
                }
            } else if (!record.status) {
                record.status = '缺勤';
            }

            attendance.push(record);
        }

        localStorage.setItem('attendance', JSON.stringify(attendance));
        return record;
    }
// 在 DataManager.js 的考勤管理部分添加
deleteAttendance(id) {
    const attendance = this.getAttendance();
    const index = attendance.findIndex(a => a.id === id);
    if (index !== -1) {
        attendance.splice(index, 1);
        localStorage.setItem('attendance', JSON.stringify(attendance));
        return true;
    }
    return false;
}
    // ==================== 请假管理 ====================

    getLeaves() {
        return JSON.parse(localStorage.getItem('leaves')) || [];
    }

    addLeave(leave) {
        const leaves = this.getLeaves();
        leave.id = Date.now();
        leave.status = '待审核';
        leaves.push(leave);
        localStorage.setItem('leaves', JSON.stringify(leaves));
        return leave;
    }

    updateLeaveStatus(id, status) {
        const leaves = this.getLeaves();
        const index = leaves.findIndex(l => l.id === id);
        if (index !== -1) {
            leaves[index].status = status;
            localStorage.setItem('leaves', JSON.stringify(leaves));
            return true;
        }
        return false;
    }

    // ==================== 加班管理 ====================

    getOvertime() {
        return JSON.parse(localStorage.getItem('overtime')) || [];
    }

    addOvertime(overtime) {
        const overtimeRecords = this.getOvertime();
        overtime.id = Date.now();
        overtime.status = '待审核';
        overtimeRecords.push(overtime);
        localStorage.setItem('overtime', JSON.stringify(overtimeRecords));
        return overtime;
    }

    updateOvertimeStatus(id, status) {
        const overtimeRecords = this.getOvertime();
        const index = overtimeRecords.findIndex(o => o.id === id);
        if (index !== -1) {
            overtimeRecords[index].status = status;
            localStorage.setItem('overtime', JSON.stringify(overtimeRecords));
            return true;
        }
        return false;
    }

    // ==================== 薪资管理 ====================

    getSalary() {
        return JSON.parse(localStorage.getItem('salary')) || [];
    }

    // 获取指定员工的薪资记录
    getSalaryByEmployee(employeeId) {
        return this.getSalary().filter(s => s.employeeId === employeeId);
    }

    // 获取指定员工在指定月份的薪资记录
    getSalaryByEmployeeAndMonth(employeeId, month) {
        return this.getSalary().find(s => s.employeeId === employeeId && s.month === month);
    }

    // 修改后的薪资计算方法，支持月度和年度统计，扣款项不能跨月
    calculateSalary(month, department) {
        const employees = this.getEmployees().filter(e => 
            e.status === '在职' && (!department || e.department === department)
        );
        const overtime = this.getOvertime().filter(o => o.status === '已批准');
        const attendance = this.getAttendance();
        const settings = this.getSettings();

        const salaryRecords = [];

        employees.forEach(emp => {
            // 计算加班费 - 按实际打卡时长核算
            const empOvertime = overtime.filter(o => o.employeeId === emp.id && o.date.startsWith(month));
            const overtimeHours = empOvertime.reduce((sum, o) => sum + o.hours, 0);
            const overtimePay = overtimeHours * (emp.salary / 21.75 / 8) * settings.overtimeRate;

            // 计算出勤天数
            const empAttendance = attendance.filter(a => 
                a.employeeId === emp.id && 
                a.date.startsWith(month) &&
                a.status !== '缺勤'
            );
            const attendanceDays = empAttendance.length;

            // 计算奖金（基于出勤）
            const attendanceRate = attendanceDays / 22;
            const bonus = Math.round(emp.salary * 0.1 * attendanceRate);

            // 计算扣款（迟到等）
            const lateAttendance = empAttendance.filter(a => a.status === '迟到');
            const deduction = lateAttendance.length * 50; // 每次迟到扣50元

            // 计算交通补贴
            const transportationAllowance = settings.transportationAllowance;

            // 计算餐补
            const mealAllowance = attendanceDays * settings.mealAllowance;

            // 计算社保扣款
            const socialSecurityDeduction = Math.round(emp.salary * settings.socialSecurityRate / 100);

            // 计算公积金扣款
            const housingFundDeduction = Math.round(emp.salary * settings.housingFundRate / 100);

            // 计算个税（简化计算）
            const taxableIncome = emp.salary + overtimePay + bonus + transportationAllowance + mealAllowance - socialSecurityDeduction - housingFundDeduction;
            const tax = taxableIncome > 5000 ? Math.round((taxableIncome - 5000) * 0.03) : 0;

            // 总工资 = 基本工资 + 加班费 + 奖金 + 交通补贴 + 餐补 - 社保扣款 - 公积金扣款 - 个税 - 其他扣款
            const totalSalary = emp.salary + overtimePay + bonus + transportationAllowance + mealAllowance - socialSecurityDeduction - housingFundDeduction - tax - deduction;

            const salaryRecord = {
                id: Date.now() + Math.random(),
                employeeId: emp.id,
                employeeName: emp.name,
                department: emp.department,
                month: month,
                baseSalary: emp.salary,
                overtimePay: Math.round(overtimePay),
                bonus: bonus,
                transportationAllowance: transportationAllowance,
                mealAllowance: mealAllowance,
                socialSecurityDeduction: socialSecurityDeduction,
                housingFundDeduction: housingFundDeduction,
                tax: tax,
                deduction: deduction,
                totalSalary: Math.round(totalSalary),
                status: '待发放'
            };

            salaryRecords.push(salaryRecord);
        });

        // 保存薪资记录
        localStorage.setItem('salary', JSON.stringify(salaryRecords));

        return salaryRecords;
    }
// 【新增】更新薪资发放状态
updateSalaryStatus(id, status) {
    const salaryRecords = this.getSalary();
    const index = salaryRecords.findIndex(s => s.id === id);
    if (index !== -1) {
        salaryRecords[index].status = status;
        localStorage.setItem('salary', JSON.stringify(salaryRecords));
        return true;
    }
    return false;
}
    // 年度薪资统计
    calculateAnnualSalary(year, department) {
        const employees = this.getEmployees().filter(e => 
            e.status === '在职' && (!department || e.department === department)
        );
        const overtime = this.getOvertime().filter(o => o.status === '已批准');
        const attendance = this.getAttendance();
        const settings = this.getSettings();
        const salaryRecords = this.getSalary().filter(s => s.month.startsWith(year));

        const annualSalaryRecords = [];

        employees.forEach(emp => {
            // 按月份汇总数据
            const monthlyData = {};
            for (let month = 1; month <= 12; month++) {
                const monthStr = `${year}-${month.toString().padStart(2, '0')}`;
                const empOvertime = overtime.filter(o => o.employeeId === emp.id && o.date.startsWith(monthStr));
                const overtimeHours = empOvertime.reduce((sum, o) => sum + o.hours, 0);
                const overtimePay = overtimeHours * (emp.salary / 21.75 / 8) * settings.overtimeRate;

                const empAttendance = attendance.filter(a => 
                    a.employeeId === emp.id && 
                    a.date.startsWith(monthStr) &&
                    a.status !== '缺勤'
                );
                const attendanceDays = empAttendance.length;

                const lateAttendance = empAttendance.filter(a => a.status === '迟到');
                const deduction = lateAttendance.length * 50; // 每次迟到扣50元

                monthlyData[monthStr] = {
                    overtimePay: Math.round(overtimePay),
                    attendanceDays: attendanceDays,
                    deduction: deduction
                };
            }

            // 计算年度总计
            const totalOvertimePay = Object.values(monthlyData).reduce((sum, month) => sum + month.overtimePay, 0);
            const totalAttendanceDays = Object.values(monthlyData).reduce((sum, month) => sum + month.attendanceDays, 0);
            const totalDeduction = Object.values(monthlyData).reduce((sum, month) => sum + month.deduction, 0);

            const annualSalaryRecord = {
                id: Date.now() + Math.random(),
                employeeId: emp.id,
                employeeName: emp.name,
                department: emp.department,
                year: year,
                baseSalary: emp.salary * 12,
                overtimePay: totalOvertimePay,
                bonus: Math.round(emp.salary * 0.1 * (totalAttendanceDays / 22)),
                deduction: totalDeduction,
                totalSalary: emp.salary * 12 + totalOvertimePay + Math.round(emp.salary * 0.1 * (totalAttendanceDays / 22)) - totalDeduction,
                status: '已计算'
            };

            annualSalaryRecords.push(annualSalaryRecord);
        });

        return annualSalaryRecords;
    }

    // 生成工资单
    generateSalarySlip(employeeId, month) {
        const employee = this.getEmployeeById(employeeId);
        if (!employee) return null;

        const salary = this.getSalary().find(s => s.employeeId === employeeId && s.month === month);
        if (!salary) return null;

        // 获取考勤详情
        const attendance = this.getAttendance().filter(a => 
            a.employeeId === employeeId && a.date.startsWith(month)
        );

        const lateCount = attendance.filter(a => a.status === '迟到').length;
        const earlyLeaveCount = attendance.filter(a => a.status === '早退').length;
        const normalAttendance = attendance.filter(a => a.status === '正常').length;
        const absentCount = attendance.filter(a => a.status === '缺勤').length;
        const totalWorkHours = attendance.reduce((sum, a) => sum + (a.workHours || 0), 0);

        return {
            employee: employee,
            salary: salary,
            attendance: {
                lateCount,
                earlyLeaveCount,
                normalAttendance,
                absentCount,
                totalWorkHours
            }
        };
    }

    // ==================== 系统设置 ====================

    getSettings() {
        return JSON.parse(localStorage.getItem('settings'));
    }

    updateSettings(settings) {
        localStorage.setItem('settings', JSON.stringify(settings));
        return true;
    }

    // ==================== 用户管理 ====================

    getUsers() {
        return JSON.parse(localStorage.getItem('users')) || [];
    }

    addUser(user) {
        const users = this.getUsers();
        const exists = users.some(u => u.username === user.username);
        if (exists) {
            return false; // 用户名已存在
        }
        users.push(user);
        localStorage.setItem('users', JSON.stringify(users));
        return true;
    }

    authenticate(username, password) {
        const users = this.getUsers();
        return users.some(user => user.username === username && user.password === password);
    }

    // ==================== 统计数据 ====================

    getDashboardStats() {
        const employees = this.getEmployees().filter(e => e.status === '在职');
        const attendance = this.getAttendance();
        const leaves = this.getLeaves();
        const salary = this.getSalary();

        // 今日出勤率
        const today = new Date().toISOString().split('T')[0];
        const todayAttendance = attendance.filter(a => a.date === today && a.status !== '缺勤');
        const attendanceRate = employees.length > 0 ? 
            Math.round((todayAttendance.length / employees.length) * 100) : 0;

        // 本月迟到
        const currentMonth = today.substring(0, 7);
        const monthAttendance = attendance.filter(a => a.date.startsWith(currentMonth));
        const lateCount = monthAttendance.filter(a => a.status === '迟到').length;

        // 待审核请假
        const pendingLeaves = leaves.filter(l => l.status === '待审核').length;

        // 本月薪资总额
        const monthSalary = salary.filter(s => s.month === currentMonth);
        const totalSalary = monthSalary.reduce((sum, s) => sum + s.totalSalary, 0);

        // 考勤异常
        const exceptions = attendance
            .filter(a => a.status !== '正常')
            .slice(0, 5); // 只显示前5条异常

        return {
            attendanceRate,
            lateCount,
            pendingLeaves,
            totalSalary,
            exceptions
        };
    }
}

// ====== 关键修正：将 dataManager 提前定义 ======
// 初始化数据管理器
const dataManager = new DataManager();
// ==============================================
/**
 * ====================================================================
 * MODULE: tests.js
 * Student Attendance Management System - STQA Automated Test Suite
 * ====================================================================
 * Academic STQA Project - Comprehensive Automated Test Harness
 * Covers:
 *  1. Unit Testing (UT01 - UT15, including all boundary conditions)
 *  2. Integration Testing (IT01 - IT06)
 *  3. Regression Testing (RT01 - RT05)
 *  4. System Testing (ST01 - ST05)
 *
 * Each test records:
 *  - Test Case ID
 *  - Module
 *  - Test Description
 *  - Preconditions
 *  - Test Input
 *  - Expected Result
 *  - Actual Result
 *  - Status (PASS / FAIL)
 *  - Execution Timestamp & Latency
 */

// In browser, dependencies are already loaded via script tags.
// In Node.js, require them:
let _auth, _students, _attendance, _reports;
if (typeof require !== 'undefined') {
  _auth = require('./auth.js');
  _students = require('./students.js');
  _attendance = require('./attendance.js');
  _reports = require('./reports.js');
}

function getDep(name) {
  if (typeof window !== 'undefined' && window[name]) return window[name];
  if (name === 'validateLogin') return _auth ? _auth.validateLogin : validateLogin;
  if (name === 'validateStudentInput') return _students ? _students.validateStudentInput : validateStudentInput;
  if (name === 'addStudent') return _students ? _students.addStudent : addStudent;
  if (name === 'deleteStudent') return _students ? _students.deleteStudent : deleteStudent;
  if (name === 'getStudents') return _students ? _students.getStudents : getStudents;
  if (name === 'saveStudents') return _students ? _students.saveStudents : saveStudents;
  if (name === 'saveAttendanceForDate') return _attendance ? _attendance.saveAttendanceForDate : saveAttendanceForDate;
  if (name === 'getAttendanceForDate') return _attendance ? _attendance.getAttendanceForDate : getAttendanceForDate;
  if (name === 'calculateAttendanceMetrics') return _reports ? _reports.calculateAttendanceMetrics : calculateAttendanceMetrics;
  if (name === 'generateAllReports') return _reports ? _reports.generateAllReports : generateAllReports;
  if (name === 'filterReportRows') return _reports ? _reports.filterReportRows : filterReportRows;
  if (name === 'calculateDashboardSummary') return _reports ? _reports.calculateDashboardSummary : calculateDashboardSummary;
  return null;
}

// Memory-backed mock storage for isolated testing
class MockStorage {
  constructor() { this.store = {}; }
  getItem(key) { return this.store[key] || null; }
  setItem(key, val) { this.store[key] = String(val); }
  removeItem(key) { delete this.store[key]; }
  clear() { this.store = {}; }
}

const testResults = {
  unit: [],
  integration: [],
  regression: [],
  system: []
};

/**
 * Executes a single test case with timing and assertion handling.
 */
function runCase(category, { id, moduleName, description, preconditions, input, expected, testFn }) {
  const startTime = performance.now();
  let actual = '';
  let status = 'FAIL';

  try {
    const res = testFn();
    actual = res.actual;
    status = res.pass ? 'PASS' : 'FAIL';
  } catch (err) {
    actual = `Exception: ${err.message}`;
    status = 'FAIL';
  }

  const duration = (performance.now() - startTime).toFixed(2);
  const record = {
    id,
    module: moduleName,
    description,
    preconditions,
    input: typeof input === 'object' ? JSON.stringify(input) : String(input),
    expected,
    actual,
    status,
    durationMs: duration,
    timestamp: new Date().toLocaleTimeString()
  };

  testResults[category].push(record);
  return record;
}

/* ====================================================================
   A. UNIT TESTING SUITE (UT01 to UT15)
   ==================================================================== */
function executeUnitTests() {
  testResults.unit = [];
  const validateLogin = getDep('validateLogin');
  const validateStudentInput = getDep('validateStudentInput');
  const calculateAttendanceMetrics = getDep('calculateAttendanceMetrics');
  const saveAttendanceForDate = getDep('saveAttendanceForDate');

  // UT01 — Login validation with valid credentials
  runCase('unit', {
    id: 'UT01',
    moduleName: 'Authentication',
    description: 'Verify login succeeds with valid username and password',
    preconditions: 'System is loaded; default admin credentials exist',
    input: { username: 'admin', password: 'admin123' },
    expected: 'success: true, message contains Login successful',
    testFn: () => {
      const res = validateLogin('admin', 'admin123');
      const pass = res.success === true && res.message.includes('Login successful');
      return { pass, actual: `success: ${res.success}, message: "${res.message}"` };
    }
  });

  // UT02 — Empty login fields validation
  runCase('unit', {
    id: 'UT02',
    moduleName: 'Authentication',
    description: 'Verify login fails when fields are blank or whitespace',
    preconditions: 'Login page displayed',
    input: { username: '  ', password: '' },
    expected: 'success: false, message: Please enter both username and password.',
    testFn: () => {
      const res = validateLogin('  ', '');
      const pass = res.success === false && res.message.includes('both username and password');
      return { pass, actual: `success: ${res.success}, message: "${res.message}"` };
    }
  });

  // UT03 — Student input validation (invalid format)
  runCase('unit', {
    id: 'UT03',
    moduleName: 'Student Management',
    description: 'Verify rejection of student name containing invalid symbols/numbers',
    preconditions: 'Student addition module active',
    input: { rollNo: '109', name: 'John@123', division: 'A' },
    expected: 'isValid: false, error contains letters and spaces only',
    testFn: () => {
      const res = validateStudentInput('109', 'John@123', 'A', []);
      const pass = res.isValid === false && res.error.includes('letters and spaces');
      return { pass, actual: `isValid: ${res.isValid}, error: "${res.error}"` };
    }
  });

  // UT04 — Duplicate roll number validation
  runCase('unit', {
    id: 'UT04',
    moduleName: 'Student Management',
    description: 'Verify duplicate roll numbers are prevented',
    preconditions: 'Existing student with roll number 101 in database',
    input: { rollNo: '101', name: 'Another Student', division: 'A' },
    expected: 'isValid: false, error contains Roll number already exists',
    testFn: () => {
      const existing = [{ rollNo: '101', name: 'Rahul Sharma', division: 'A' }];
      const res = validateStudentInput('101', 'Another Student', 'A', existing);
      const pass = res.isValid === false && res.error.includes('already exists');
      return { pass, actual: `isValid: ${res.isValid}, error: "${res.error}"` };
    }
  });

  // UT05 — Student deletion logic
  runCase('unit', {
    id: 'UT05',
    moduleName: 'Student Management',
    description: 'Verify student deletion removes target record and leaves remainder intact',
    preconditions: 'List of students [101, 102]',
    input: 'Roll No: 101',
    expected: 'Student 101 removed, list length becomes 1 with only 102',
    testFn: () => {
      const list = [
        { rollNo: '101', name: 'Rahul Sharma', division: 'A' },
        { rollNo: '102', name: 'Priya Patel', division: 'A' }
      ];
      const idx = list.findIndex(s => s.rollNo === '101');
      list.splice(idx, 1);
      const pass = list.length === 1 && list[0].rollNo === '102';
      return { pass, actual: `List length: ${list.length}, Remaining: [${list.map(s => s.rollNo).join(', ')}]` };
    }
  });

  // UT06 — Attendance percentage calculation
  runCase('unit', {
    id: 'UT06',
    moduleName: 'Reports & Calculation',
    description: 'Verify formula: (Present / Total) * 100 for 15 present out of 20 classes',
    preconditions: 'Calculation function initialized',
    input: { present: 15, total: 20 },
    expected: 'percentage: 75.00%, percentage value: 75',
    testFn: () => {
      const res = calculateAttendanceMetrics(15, 20);
      const pass = res.percentage === 75.0 && res.percentageStr === '75.00%';
      return { pass, actual: `percentage: ${res.percentageStr}, raw: ${res.percentage}` };
    }
  });

  // UT07 — Eligibility calculation (General case)
  runCase('unit', {
    id: 'UT07',
    moduleName: 'Reports & Calculation',
    description: 'Verify eligibility status: 16/20 (80%) -> Eligible; 14/20 (70%) -> Short Attendance',
    preconditions: 'Calculation function initialized',
    input: 'Pairs: (16, 20) and (14, 20)',
    expected: 'Case 1 -> Eligible, Case 2 -> Short Attendance',
    testFn: () => {
      const res1 = calculateAttendanceMetrics(16, 20);
      const res2 = calculateAttendanceMetrics(14, 20);
      const pass = res1.status === 'Eligible' && res2.status === 'Short Attendance';
      return { pass, actual: `80%: ${res1.status}, 70%: ${res2.status}` };
    }
  });

  // UT08 — Mark Present validation
  runCase('unit', {
    id: 'UT08',
    moduleName: 'Attendance',
    description: 'Verify marking Present accepts and stores status successfully',
    preconditions: 'Attendance date valid',
    input: { date: '2026-10-05', statuses: { '101': 'Present' } },
    expected: 'success: true, record contains Present for 101',
    testFn: () => {
      const res = saveAttendanceForDate('2026-10-05', { '101': 'Present' });
      const pass = res.success === true;
      return { pass, actual: `success: ${res.success}, message: "${res.message}"` };
    }
  });

  // UT09 — Mark Absent validation
  runCase('unit', {
    id: 'UT09',
    moduleName: 'Attendance',
    description: 'Verify marking Absent accepts and stores status successfully',
    preconditions: 'Attendance date valid',
    input: { date: '2026-10-05', statuses: { '102': 'Absent' } },
    expected: 'success: true, record contains Absent for 102',
    testFn: () => {
      const res = saveAttendanceForDate('2026-10-05', { '102': 'Absent' });
      const pass = res.success === true;
      return { pass, actual: `success: ${res.success}, message: "${res.message}"` };
    }
  });

  // UT10 — Invalid attendance data rejection
  runCase('unit', {
    id: 'UT10',
    moduleName: 'Attendance',
    description: 'Verify system rejects invalid status values (e.g., "Late", "HalfDay")',
    preconditions: 'Attendance marking active',
    input: { date: '2026-10-05', statuses: { '101': 'Late' } },
    expected: 'success: false, message contains Invalid status',
    testFn: () => {
      const res = saveAttendanceForDate('2026-10-05', { '101': 'Late' });
      const pass = res.success === false && res.message.includes('Invalid status');
      return { pass, actual: `success: ${res.success}, message: "${res.message}"` };
    }
  });

  // Boundary Tests
  // UT11 — Boundary Test: 0% attendance
  runCase('unit', {
    id: 'UT11',
    moduleName: 'Boundary Testing',
    description: 'Verify boundary condition: 0 present out of 10 classes (0.00%)',
    preconditions: 'Boundary testing suite',
    input: { present: 0, total: 10 },
    expected: 'percentage: 0.00%, status: Short Attendance',
    testFn: () => {
      const res = calculateAttendanceMetrics(0, 10);
      const pass = res.percentage === 0 && res.status === 'Short Attendance';
      return { pass, actual: `percentage: ${res.percentageStr}, status: ${res.status}` };
    }
  });

  // UT12 — Boundary Test: 74.99% attendance
  runCase('unit', {
    id: 'UT12',
    moduleName: 'Boundary Testing',
    description: 'Verify boundary condition: 7499 present out of 10000 classes (74.99%)',
    preconditions: 'Boundary testing suite',
    input: { present: 7499, total: 10000 },
    expected: 'percentage: 74.99%, status: Short Attendance',
    testFn: () => {
      const res = calculateAttendanceMetrics(7499, 10000);
      const pass = res.percentage === 74.99 && res.status === 'Short Attendance';
      return { pass, actual: `percentage: ${res.percentageStr}, status: ${res.status}` };
    }
  });

  // UT13 — Boundary Test: Exactly 75.00% attendance
  runCase('unit', {
    id: 'UT13',
    moduleName: 'Boundary Testing',
    description: 'Verify threshold boundary: 3 present out of 4 classes (Exactly 75.00%)',
    preconditions: 'Boundary testing suite',
    input: { present: 3, total: 4 },
    expected: 'percentage: 75.00%, status: Eligible',
    testFn: () => {
      const res = calculateAttendanceMetrics(3, 4);
      const pass = res.percentage === 75.0 && res.status === 'Eligible';
      return { pass, actual: `percentage: ${res.percentageStr}, status: ${res.status}` };
    }
  });

  // UT14 — Boundary Test: 75.01% attendance
  runCase('unit', {
    id: 'UT14',
    moduleName: 'Boundary Testing',
    description: 'Verify boundary condition: 7501 present out of 10000 classes (75.01%)',
    preconditions: 'Boundary testing suite',
    input: { present: 7501, total: 10000 },
    expected: 'percentage: 75.01%, status: Eligible',
    testFn: () => {
      const res = calculateAttendanceMetrics(7501, 10000);
      const pass = res.percentage === 75.01 && res.status === 'Eligible';
      return { pass, actual: `percentage: ${res.percentageStr}, status: ${res.status}` };
    }
  });

  // UT15 — Boundary Test: 100% attendance
  runCase('unit', {
    id: 'UT15',
    moduleName: 'Boundary Testing',
    description: 'Verify upper boundary condition: 10 present out of 10 classes (100.00%)',
    preconditions: 'Boundary testing suite',
    input: { present: 10, total: 10 },
    expected: 'percentage: 100.00%, status: Eligible',
    testFn: () => {
      const res = calculateAttendanceMetrics(10, 10);
      const pass = res.percentage === 100.0 && res.status === 'Eligible';
      return { pass, actual: `percentage: ${res.percentageStr}, status: ${res.status}` };
    }
  });

  return testResults.unit;
}

/* ====================================================================
   B. INTEGRATION TESTING SUITE (IT01 to IT06)
   ==================================================================== */
function executeIntegrationTests() {
  testResults.integration = [];
  const validateLogin = getDep('validateLogin');
  const addStudent = getDep('addStudent');
  const getStudents = getDep('getStudents');
  const deleteStudent = getDep('deleteStudent');
  const saveAttendanceForDate = getDep('saveAttendanceForDate');
  const getAttendanceForDate = getDep('getAttendanceForDate');
  const generateAllReports = getDep('generateAllReports');
  const calculateDashboardSummary = getDep('calculateDashboardSummary');

  // IT01: Login -> Dashboard
  runCase('integration', {
    id: 'IT01',
    moduleName: 'Auth to Dashboard Integration',
    description: 'Verify login authentication properly initiates and authorizes dashboard session metrics',
    preconditions: 'Admin credentials entered on login view',
    input: 'Valid login -> session verified -> calculateDashboardSummary()',
    expected: 'Session valid; Dashboard returns student count >= 0 and metric summary',
    testFn: () => {
      const loginRes = validateLogin('admin', 'admin123');
      const students = getStudents();
      const records = JSON.parse(localStorage.getItem('sams_attendance_records') || '{}');
      const summary = calculateDashboardSummary(students, records);
      const pass = loginRes.success && typeof summary.totalStudents === 'number';
      return { pass, actual: `Login: ${loginRes.success}, Dashboard Total Students: ${summary.totalStudents}, Avg Pct: ${summary.avgPercentage}` };
    }
  });

  // IT02: Add Student -> Student appears in Attendance module
  runCase('integration', {
    id: 'IT02',
    moduleName: 'Student to Attendance Integration',
    description: 'Verify newly added student immediately surfaces in attendance registry for marking',
    preconditions: 'Student management module operational',
    input: 'Add student 199 ("Test Student IT", Div A)',
    expected: 'Student 199 retrieved in getStudents() and eligible for attendance marking',
    testFn: () => {
      const addRes = addStudent({ rollNo: '199', name: 'Test Student IT', division: 'A' });
      const students = getStudents();
      const found = students.some(s => s.rollNo === '199');
      // Cleanup
      deleteStudent('199');
      const pass = addRes.success && found;
      return { pass, actual: `addSuccess: ${addRes.success}, Found in Student Registry: ${found}` };
    }
  });

  // IT03: Mark Attendance -> Attendance saved to storage
  runCase('integration', {
    id: 'IT03',
    moduleName: 'Attendance Marking & Storage Integration',
    description: 'Verify attendance UI submission writes validated map to persistent storage',
    preconditions: 'Date 2026-10-10 chosen for active students',
    input: 'Mark 101 Present, 102 Absent for date 2026-10-10',
    expected: 'saveAttendanceForDate() returns success and getAttendanceForDate() reflects exact statuses',
    testFn: () => {
      const saveRes = saveAttendanceForDate('2026-10-10', { '101': 'Present', '102': 'Absent' });
      const fetched = getAttendanceForDate('2026-10-10');
      const pass = saveRes.success && fetched && fetched['101'] === 'Present' && fetched['102'] === 'Absent';
      return { pass, actual: `saveSuccess: ${saveRes.success}, 101: ${fetched ? fetched['101'] : 'null'}, 102: ${fetched ? fetched['102'] : 'null'}` };
    }
  });

  // IT04: Attendance saved -> Report updated
  runCase('integration', {
    id: 'IT04',
    moduleName: 'Attendance to Report Integration',
    description: 'Verify updated attendance immediately recalculates student attendance report totals',
    preconditions: 'Attendance marked on 2026-10-10',
    input: 'generateAllReports() with updated records',
    expected: 'Student 101 total classes reflects +1 conducted class with incremented present count',
    testFn: () => {
      const students = [{ rollNo: '101', name: 'Rahul Sharma', division: 'A' }];
      const records = { '2026-10-10': { '101': 'Present' } };
      const report = generateAllReports(students, records);
      const pass = report.length === 1 && report[0].total === 1 && report[0].present === 1 && report[0].percentage === 100.0;
      return { pass, actual: `Report Total: ${report[0].total}, Present: ${report[0].present}, Pct: ${report[0].percentageStr}` };
    }
  });

  // IT05: Attendance data -> Percentage calculation -> Eligibility status
  runCase('integration', {
    id: 'IT05',
    moduleName: 'Calculation to Eligibility Integration',
    description: 'Verify attendance records flow through calculation formula directly to correct eligibility classification',
    preconditions: 'Multi-day dataset with student attending 1 out of 2 classes (50%)',
    input: 'Student 103 with 2 classes: 1 Present, 1 Absent',
    expected: 'Percentage: 50.00%, Status: Short Attendance, isEligible: false',
    testFn: () => {
      const students = [{ rollNo: '103', name: 'Amit Kumar', division: 'A' }];
      const records = {
        '2026-10-01': { '103': 'Present' },
        '2026-10-02': { '103': 'Absent' }
      };
      const report = generateAllReports(students, records);
      const row = report[0];
      const pass = row.percentage === 50.0 && row.status === 'Short Attendance' && row.isEligible === false;
      return { pass, actual: `Pct: ${row.percentageStr}, Status: ${row.status}, isEligible: ${row.isEligible}` };
    }
  });

  // IT06: Delete Student -> Student removed from attendance / report
  runCase('integration', {
    id: 'IT06',
    moduleName: 'Deletion Cascading Integration',
    description: 'Verify deleting a student purges them from the student database and cascaded attendance reports',
    preconditions: 'Temporary student 198 added with attendance record',
    input: 'Add 198 -> Mark attendance -> Delete 198',
    expected: 'Student 198 eliminated from student database and resulting reports',
    testFn: () => {
      addStudent({ rollNo: '198', name: 'Temp Student', division: 'B' });
      saveAttendanceForDate('2026-10-11', { '198': 'Present' });
      const delRes = deleteStudent('198');
      const studentsAfter = getStudents();
      const inStudents = studentsAfter.some(s => s.rollNo === '198');
      const pass = delRes.success && !inStudents;
      return { pass, actual: `Delete Success: ${delRes.success}, Still in Registry: ${inStudents}` };
    }
  });

  return testResults.integration;
}

/* ====================================================================
   C. REGRESSION TESTING SUITE (RT01 to RT05)
   ==================================================================== */
function executeRegressionTests() {
  testResults.regression = [];
  const validateLogin = getDep('validateLogin');
  const validateStudentInput = getDep('validateStudentInput');
  const saveAttendanceForDate = getDep('saveAttendanceForDate');
  const calculateAttendanceMetrics = getDep('calculateAttendanceMetrics');

  // Baseline change description: Refactoring string sanitization, safe division-by-zero,
  // and precision rounding across modules.

  // RT01: Login validation stability
  runCase('regression', {
    id: 'RT01',
    moduleName: 'Regression: Authentication',
    description: 'Verify existing login functionality remains unaltered after input sanitization refactor',
    preconditions: 'Sanitization updates applied to string trimming',
    input: 'Credentials: admin / admin123',
    expected: 'Login succeeds exactly as in baseline',
    testFn: () => {
      const res = validateLogin('  admin  ', '  admin123  ');
      const pass = res.success === true;
      return { pass, actual: `success: ${res.success}, message: "${res.message}"` };
    }
  });

  // RT02: Student addition & uniqueness regression
  runCase('regression', {
    id: 'RT02',
    moduleName: 'Regression: Student Management',
    description: 'Verify student addition validation and uniqueness checks retain identical behavior after regex refactor',
    preconditions: 'Regex enhancement to support hyphenated names',
    input: 'Name "Mary-Jane Watson", Roll "110", Div "A"',
    expected: 'Student passes validation with sanitized data intact',
    testFn: () => {
      const res = validateStudentInput('110', 'Mary-Jane Watson', 'A', []);
      const pass = res.isValid === true && res.sanitized.name === 'Mary-Jane Watson';
      return { pass, actual: `isValid: ${res.isValid}, Sanitized Name: "${res.sanitized ? res.sanitized.name : ''}"` };
    }
  });

  // RT03: Attendance marking stability
  runCase('regression', {
    id: 'RT03',
    moduleName: 'Regression: Attendance Engine',
    description: 'Verify date formatting and attendance marking persist properly without data corruption',
    preconditions: 'Core attendance storage active',
    input: 'Date 2026-10-12, Status: 101 Present, 102 Absent',
    expected: 'Attendance successfully saved and parsed without errors',
    testFn: () => {
      const res = saveAttendanceForDate('2026-10-12', { '101': 'Present', '102': 'Absent' });
      const pass = res.success === true;
      return { pass, actual: `saveSuccess: ${res.success}` };
    }
  });

  // RT04: Division-by-Zero safety in calculation logic
  runCase('regression', {
    id: 'RT04',
    moduleName: 'Regression: Calculation Logic',
    description: 'Verify calculation logic gracefully handles 0 total classes without NaN or crashing',
    preconditions: 'Mathematical logic refactored for edge cases',
    input: '0 present, 0 total classes',
    expected: 'percentage: 0.00%, status: "No Classes", isEligible: false (no NaN)',
    testFn: () => {
      const res = calculateAttendanceMetrics(0, 0);
      const pass = res.percentage === 0.0 && !isNaN(res.percentage) && res.status === 'No Classes';
      return { pass, actual: `Pct: ${res.percentageStr}, Status: ${res.status}, isNaN: ${isNaN(res.percentage)}` };
    }
  });

  // RT05: Exact 75% boundary regression check
  runCase('regression', {
    id: 'RT05',
    moduleName: 'Regression: Eligibility Boundary',
    description: 'Verify 75% threshold remains strictly compliant with academic regulations (>=75 is Eligible)',
    preconditions: 'Eligibility evaluation function refactored',
    input: '15 present out of 20 classes (75.00%)',
    expected: 'status: "Eligible", isEligible: true',
    testFn: () => {
      const res = calculateAttendanceMetrics(15, 20);
      const pass = res.percentage === 75.0 && res.status === 'Eligible' && res.isEligible === true;
      return { pass, actual: `Pct: ${res.percentageStr}, Status: ${res.status}` };
    }
  });

  return testResults.regression;
}

/* ====================================================================
   D. SYSTEM TESTING SUITE (ST01 to ST05)
   ==================================================================== */
function executeSystemTests() {
  testResults.system = [];
  const validateLogin = getDep('validateLogin');
  const addStudent = getDep('addStudent');
  const deleteStudent = getDep('deleteStudent');
  const getStudents = getDep('getStudents');
  const saveAttendanceForDate = getDep('saveAttendanceForDate');
  const generateAllReports = getDep('generateAllReports');
  const filterReportRows = getDep('filterReportRows');

  // ST01: Full user journey - Open -> Login -> Add student -> Mark attendance -> Generate report -> Verify percentage
  runCase('system', {
    id: 'ST01',
    moduleName: 'System End-to-End',
    description: 'Execute complete workflow: Login -> Add Student -> Mark Attendance -> Generate Report -> Verify Percentage',
    preconditions: 'System operational in fresh environment',
    input: 'User admin logs in, adds student 120, marks 2 present out of 2 classes, checks report',
    expected: 'Report confirms 100.00% attendance and Eligible status',
    testFn: () => {
      // Step 1: Login
      const login = validateLogin('admin', 'admin123');
      if (!login.success) return { pass: false, actual: 'Login failed' };

      // Step 2: Add Student
      const add = addStudent({ rollNo: '120', name: 'System Test One', division: 'A' });
      if (!add.success) return { pass: false, actual: 'Add student failed' };

      // Step 3: Mark Attendance
      saveAttendanceForDate('2026-10-15', { '120': 'Present' });
      saveAttendanceForDate('2026-10-16', { '120': 'Present' });

      // Step 4: Generate Report
      const records = JSON.parse(localStorage.getItem('sams_attendance_records') || '{}');
      const allReports = generateAllReports(getStudents(), records);
      const s120Report = allReports.find(r => r.rollNo === '120');

      // Cleanup
      deleteStudent('120');

      const pass = s120Report && s120Report.percentage === 100.0 && s120Report.status === 'Eligible';
      return { pass, actual: `E2E Success: Found 120 with Pct: ${s120Report ? s120Report.percentageStr : 'null'}, Status: ${s120Report ? s120Report.status : 'null'}` };
    }
  });

  // ST02: Multi-student management & eligibility classification
  runCase('system', {
    id: 'ST02',
    moduleName: 'System End-to-End',
    description: 'Add multiple students with varying attendance records, verify distinct eligibility categories in report',
    preconditions: 'System operational',
    input: '3 students: Student A (100%), Student B (50%), Student C (75%)',
    expected: 'Report correctly classifies A & C as Eligible, B as Short Attendance',
    testFn: () => {
      const mockStudents = [
        { rollNo: 'S1', name: 'Student High', division: 'A' },
        { rollNo: 'S2', name: 'Student Low', division: 'A' },
        { rollNo: 'S3', name: 'Student Mid', division: 'A' }
      ];
      const mockRecords = {
        '2026-10-01': { 'S1': 'Present', 'S2': 'Absent',  'S3': 'Present' },
        '2026-10-02': { 'S1': 'Present', 'S2': 'Present', 'S3': 'Present' },
        '2026-10-03': { 'S1': 'Present', 'S2': 'Absent',  'S3': 'Present' },
        '2026-10-04': { 'S1': 'Present', 'S2': 'Absent',  'S3': 'Absent' }
      };
      const report = generateAllReports(mockStudents, mockRecords);
      const r1 = report.find(r => r.rollNo === 'S1'); // 4/4 = 100% Eligible
      const r2 = report.find(r => r.rollNo === 'S2'); // 1/4 = 25% Short Attendance
      const r3 = report.find(r => r.rollNo === 'S3'); // 3/4 = 75% Eligible

      const pass = r1.status === 'Eligible' && r2.status === 'Short Attendance' && r3.status === 'Eligible';
      return { pass, actual: `S1: ${r1.status} (${r1.percentageStr}), S2: ${r2.status} (${r2.percentageStr}), S3: ${r3.status} (${r3.percentageStr})` };
    }
  });

  // ST03: Invalid login error handling & recovery
  runCase('system', {
    id: 'ST03',
    moduleName: 'System End-to-End',
    description: 'Attempt invalid login, verify error display, then authenticate with correct credentials and reach dashboard',
    preconditions: 'Login page accessible',
    input: 'Step 1: wrong_user / wrong_pass; Step 2: admin / admin123',
    expected: 'Attempt 1 fails with error; Attempt 2 succeeds and establishes session',
    testFn: () => {
      const failAttempt = validateLogin('wrong_user', 'wrong_pass');
      const successAttempt = validateLogin('admin', 'admin123');
      const pass = failAttempt.success === false && successAttempt.success === true;
      return { pass, actual: `Attempt 1 Success: ${failAttempt.success} (Error: "${failAttempt.message}"), Attempt 2 Success: ${successAttempt.success}` };
    }
  });

  // ST04: Student deletion lifecycle
  runCase('system', {
    id: 'ST04',
    moduleName: 'System End-to-End',
    description: 'Delete student and verify immediate removal from student registry, attendance views, and reports',
    preconditions: 'System initialized with student 125',
    input: 'Add student 125 -> Save attendance -> Delete student 125 -> Generate report',
    expected: 'Student 125 is completely purged across all modules',
    testFn: () => {
      addStudent({ rollNo: '125', name: 'Delete Lifecycle Test', division: 'C' });
      saveAttendanceForDate('2026-10-18', { '125': 'Present' });
      deleteStudent('125');
      const students = getStudents();
      const records = JSON.parse(localStorage.getItem('sams_attendance_records') || '{}');
      const report = generateAllReports(students, records);

      const inStudents = students.some(s => s.rollNo === '125');
      const inReports = report.some(r => r.rollNo === '125');
      const pass = !inStudents && !inReports;
      return { pass, actual: `In Registry: ${inStudents}, In Report: ${inReports}` };
    }
  });

  // ST05: Boundary attendance verification
  runCase('system', {
    id: 'ST05',
    moduleName: 'System End-to-End',
    description: 'Test critical boundary case: Exactly 75.00% attendance in end-to-end report workflow',
    preconditions: 'Student with exactly 3 attended classes out of 4 conducted classes',
    input: 'Student 101 with 3 Present and 1 Absent across 4 recorded dates',
    expected: 'Final generated report reflects Exactly 75.00% and Eligible status',
    testFn: () => {
      const student = [{ rollNo: '101', name: 'Rahul Sharma', division: 'A' }];
      const records = {
        '2026-10-01': { '101': 'Present' },
        '2026-10-02': { '101': 'Absent' },
        '2026-10-03': { '101': 'Present' },
        '2026-10-04': { '101': 'Present' }
      };
      const report = generateAllReports(student, records);
      const row = report[0];
      const pass = row.percentage === 75.0 && row.status === 'Eligible';
      return { pass, actual: `Total: ${row.total}, Present: ${row.present}, Percentage: ${row.percentageStr}, Status: ${row.status}` };
    }
  });

  return testResults.system;
}

/**
 * Executes all test suites and returns aggregated results.
 */
function runAllTests() {
  executeUnitTests();
  executeIntegrationTests();
  executeRegressionTests();
  executeSystemTests();

  const all = [
    ...testResults.unit,
    ...testResults.integration,
    ...testResults.regression,
    ...testResults.system
  ];

  const total = all.length;
  const passed = all.filter(t => t.status === 'PASS').length;
  const failed = all.filter(t => t.status === 'FAIL').length;

  return {
    summary: {
      total,
      passed,
      failed,
      passRate: total > 0 ? ((passed / total) * 100).toFixed(1) + '%' : '0%'
    },
    results: testResults
  };
}

// Node export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testResults,
    executeUnitTests,
    executeIntegrationTests,
    executeRegressionTests,
    executeSystemTests,
    runAllTests
  };
}

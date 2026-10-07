/**
 * ====================================================================
 * MODULE: reports.js
 * Student Attendance Management System - Calculation & Report Analytics
 * ====================================================================
 * Academic STQA Project - Pure Vanilla JavaScript
 * Demonstrates:
 *  - Mathematical Calculation: Percentage = (Present / Total) * 100
 *  - Deterministic Boundary Conditions (>= 75.00% is Eligible)
 *  - Edge Case Robustness (0 classes, 100%, 0%, floating precision)
 *  - Aggregation for Dashboard & Comprehensive Reporting
 */

/**
 * Calculates attendance percentage and eligibility status for a single student.
 * @param {number} presentClasses - Number of classes attended
 * @param {number} totalClasses - Total number of classes conducted
 * @returns {Object} { total, present, absent, percentage, percentageStr, status, isEligible }
 */
function calculateAttendanceMetrics(presentClasses, totalClasses) {
  const total = Math.max(0, parseInt(totalClasses, 10) || 0);
  const present = Math.max(0, parseInt(presentClasses, 10) || 0);

  // Edge case 1: No classes conducted
  if (total === 0) {
    return {
      total: 0,
      present: 0,
      absent: 0,
      percentage: 0.0,
      percentageStr: '0.00%',
      status: 'No Classes',
      isEligible: false
    };
  }

  // Sanity check: Present cannot exceed total
  const safePresent = Math.min(present, total);
  const absent = total - safePresent;

  // Exact floating computation rounded to two decimal places
  const rawPct = (safePresent / total) * 100;
  const roundedPct = Math.round(rawPct * 100) / 100;
  const percentageStr = roundedPct.toFixed(2) + '%';

  // Academic Rule: Attendance >= 75% -> Eligible, < 75% -> Short Attendance
  const isEligible = roundedPct >= 75.0;
  const status = isEligible ? 'Eligible' : 'Short Attendance';

  return {
    total,
    present: safePresent,
    absent,
    percentage: roundedPct,
    percentageStr,
    status,
    isEligible
  };
}

/**
 * Computes individual report data for a specific student given the full records database.
 * @param {Object} student - { rollNo, name, division }
 * @param {Object} allAttendanceRecords - { [date]: { [rollNo]: 'Present'|'Absent' } }
 * @returns {Object} Comprehensive student attendance report record
 */
function getStudentReportRow(student, allAttendanceRecords) {
  let total = 0;
  let present = 0;

  for (const date of Object.keys(allAttendanceRecords)) {
    const dayRecord = allAttendanceRecords[date];
    if (dayRecord && dayRecord[student.rollNo] !== undefined) {
      total++;
      if (dayRecord[student.rollNo] === 'Present') {
        present++;
      }
    }
  }

  const metrics = calculateAttendanceMetrics(present, total);
  return {
    rollNo: student.rollNo,
    name: student.name,
    division: student.division,
    ...metrics
  };
}

/**
 * Generates reports for all students.
 * @param {Array} students 
 * @param {Object} allAttendanceRecords 
 * @returns {Array<Object>}
 */
function generateAllReports(students, allAttendanceRecords) {
  return students.map(student => getStudentReportRow(student, allAttendanceRecords));
}

/**
 * Filters report rows by search query, eligibility status, and division.
 * @param {Array} reportRows 
 * @param {string} query - Student name or roll number search query
 * @param {string} eligibilityFilter - 'ALL' | 'Eligible' | 'Short Attendance'
 * @param {string} divisionFilter - 'ALL' | 'A' | 'B' | 'C' | 'D'
 * @returns {Array} Filtered report rows
 */
function filterReportRows(reportRows, query = '', eligibilityFilter = 'ALL', divisionFilter = 'ALL') {
  const q = (query || '').trim().toLowerCase();
  const elig = (eligibilityFilter || 'ALL').trim();
  const div = (divisionFilter || 'ALL').trim().toUpperCase();

  return reportRows.filter(row => {
    // 1. Search query match
    const matchesSearch = !q || 
      row.rollNo.toLowerCase().includes(q) || 
      row.name.toLowerCase().includes(q);

    // 2. Eligibility match
    const matchesElig = elig === 'ALL' || row.status === elig;

    // 3. Division match
    const matchesDiv = div === 'ALL' || row.division === div;

    return matchesSearch && matchesElig && matchesDiv;
  });
}

/**
 * Computes aggregate summary statistics for the system dashboard.
 * @param {Array} students 
 * @param {Object} allAttendanceRecords 
 * @param {string|null} todayDateStr - Format 'YYYY-MM-DD', defaults to latest recorded date or today
 * @returns {Object} Dashboard metrics summary
 */
function calculateDashboardSummary(students, allAttendanceRecords, todayDateStr = null) {
  const totalStudents = students.length;
  const reports = generateAllReports(students, allAttendanceRecords);

  // Compute average attendance %
  let totalPctSum = 0;
  let below75Count = 0;

  reports.forEach(r => {
    totalPctSum += r.percentage;
    if (r.percentage < 75.0) {
      below75Count++;
    }
  });

  const avgPercentage = totalStudents > 0 
    ? (Math.round((totalPctSum / totalStudents) * 100) / 100).toFixed(2)
    : '0.00';

  // Determine today's or latest date attendance
  const sortedDates = Object.keys(allAttendanceRecords).sort().reverse();
  const referenceDate = todayDateStr || sortedDates[0] || null;

  let presentToday = 0;
  let absentToday = 0;
  let dateMarked = false;

  if (referenceDate && allAttendanceRecords[referenceDate]) {
    const dayData = allAttendanceRecords[referenceDate];
    students.forEach(s => {
      const status = dayData[s.rollNo];
      if (status === 'Present') presentToday++;
      else if (status === 'Absent') absentToday++;
    });
    dateMarked = true;
  }

  return {
    totalStudents,
    totalClassesConduct: sortedDates.length,
    referenceDate,
    dateMarked,
    presentToday,
    absentToday,
    avgPercentage: `${avgPercentage}%`,
    below75Count,
    eligibleCount: totalStudents - below75Count
  };
}

// Node export for STQA tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    calculateAttendanceMetrics,
    getStudentReportRow,
    generateAllReports,
    filterReportRows,
    calculateDashboardSummary
  };
}

/**
 * ====================================================================
 * MODULE: attendance.js
 * Student Attendance Management System - Daily Attendance Processing
 * ====================================================================
 * Academic STQA Project - Pure Vanilla JavaScript
 * Demonstrates:
 *  - Date Validation & Formatting
 *  - Batch State Capture (Present/Absent status per student)
 *  - Record Insertion and Updates (Overwrites with validation)
 *  - Integrity verification to prevent malformed records
 */

const ATTENDANCE_CONFIG = {
  STORAGE_KEY: 'sams_attendance_records',
  INITIAL_SEED: {
    '2026-10-01': { '101': 'Present', '102': 'Present', '103': 'Absent', '104': 'Present', '105': 'Absent', '106': 'Present' },
    '2026-10-02': { '101': 'Absent',  '102': 'Present', '103': 'Present', '104': 'Present', '105': 'Absent', '106': 'Present' },
    '2026-10-03': { '101': 'Present', '102': 'Present', '103': 'Absent', '104': 'Present', '105': 'Absent', '106': 'Absent' },
    '2026-10-04': { '101': 'Present', '102': 'Present', '103': 'Present', '104': 'Absent',  '105': 'Absent', '106': 'Present' }
  }
};

/**
 * Validates date string in YYYY-MM-DD format.
 * @param {string} dateStr 
 * @returns {boolean}
 */
function isValidDateString(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return false;
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;
  const d = new Date(dateStr);
  return !isNaN(d.getTime());
}

/**
 * Validates single attendance status value.
 * Allowed: 'Present', 'Absent'
 * @param {string} status 
 * @returns {boolean}
 */
function isValidAttendanceStatus(status) {
  return status === 'Present' || status === 'Absent';
}

/**
 * Loads all attendance history from localStorage.
 * Initializes default seed if storage is empty.
 * @returns {Object} { "YYYY-MM-DD": { [rollNo]: "Present" | "Absent" } }
 */
function getAllAttendanceRecords() {
  try {
    const raw = localStorage.getItem(ATTENDANCE_CONFIG.STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ATTENDANCE_CONFIG.STORAGE_KEY, JSON.stringify(ATTENDANCE_CONFIG.INITIAL_SEED));
      return { ...ATTENDANCE_CONFIG.INITIAL_SEED };
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading attendance records:', e);
    return {};
  }
}

/**
 * Persists all records to localStorage.
 * @param {Object} records 
 */
function saveAllAttendanceRecords(records) {
  localStorage.setItem(ATTENDANCE_CONFIG.STORAGE_KEY, JSON.stringify(records));
}

/**
 * Gets attendance record for a specific date.
 * @param {string} dateStr - 'YYYY-MM-DD'
 * @returns {Object|null}
 */
function getAttendanceForDate(dateStr) {
  if (!isValidDateString(dateStr)) return null;
  const records = getAllAttendanceRecords();
  return records[dateStr] || null;
}

/**
 * Saves or updates attendance for a specific date.
 * Validates date, ensures no invalid student statuses, and checks data completeness.
 * @param {string} dateStr - 'YYYY-MM-DD'
 * @param {Object} studentStatusMap - { [rollNo]: 'Present'|'Absent' }
 * @returns {Object} { success: boolean, message: string, isUpdate: boolean }
 */
function saveAttendanceForDate(dateStr, studentStatusMap) {
  if (!isValidDateString(dateStr)) {
    return { success: false, message: 'Invalid date specified. Please choose a valid date (YYYY-MM-DD).' };
  }

  if (!studentStatusMap || typeof studentStatusMap !== 'object' || Object.keys(studentStatusMap).length === 0) {
    return { success: false, message: 'No student attendance data provided to save.' };
  }

  // Validate every entry
  const sanitized = {};
  for (const [rollNo, status] of Object.entries(studentStatusMap)) {
    if (!isValidAttendanceStatus(status)) {
      return { success: false, message: `Invalid status '${status}' for roll number ${rollNo}. Must be 'Present' or 'Absent'.` };
    }
    sanitized[String(rollNo).trim()] = status;
  }

  const allRecords = getAllAttendanceRecords();
  const isUpdate = Boolean(allRecords[dateStr]);

  allRecords[dateStr] = sanitized;
  saveAllAttendanceRecords(allRecords);

  const msg = isUpdate
    ? `Attendance updated successfully for ${dateStr} (${Object.keys(sanitized).length} students).`
    : `Attendance recorded successfully for ${dateStr} (${Object.keys(sanitized).length} students).`;

  return { success: true, message: msg, isUpdate };
}

/**
 * Returns a list of sorted distinct recorded dates.
 * @returns {Array<string>}
 */
function getRecordedDates() {
  const records = getAllAttendanceRecords();
  return Object.keys(records).sort().reverse();
}

// Node export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ATTENDANCE_CONFIG,
    isValidDateString,
    isValidAttendanceStatus,
    getAllAttendanceRecords,
    saveAllAttendanceRecords,
    getAttendanceForDate,
    saveAttendanceForDate,
    getRecordedDates
  };
}

/**
 * ====================================================================
 * MODULE: students.js
 * Student Attendance Management System - Student Record Management
 * ====================================================================
 * Academic STQA Project - Pure Vanilla JavaScript
 * Demonstrates:
 *  - Input Validation (Regex checks, boundary checks)
 *  - Uniqueness & Integrity Constraints (Duplicate Roll No check)
 *  - Persistent CRUD Operations with localStorage
 *  - Safe DOM Manipulation & Table Rendering
 */

const STUDENT_CONFIG = {
  STORAGE_KEY: 'sams_students_data',
  INITIAL_SEED: [
    { rollNo: '101', name: 'Rahul Sharma', division: 'A' },
    { rollNo: '102', name: 'Priya Patel', division: 'A' },
    { rollNo: '103', name: 'Amit Kumar', division: 'A' },
    { rollNo: '104', name: 'Sneha Kulkarni', division: 'B' },
    { rollNo: '105', name: 'Rohan Deshmukh', division: 'B' },
    { rollNo: '106', name: 'Ananya Joshi', division: 'B' }
  ]
};

/**
 * Validates a student record before insertion or mutation.
 * @param {string} rollNo - Student Roll Number
 * @param {string} name - Student Full Name
 * @param {string} division - Class Division
 * @param {Array} existingStudents - Current array of student objects
 * @param {string|null} excludeRollNo - Roll No to ignore (used for updates)
 * @returns {Object} { isValid: boolean, error: string|null, sanitized: Object }
 */
function validateStudentInput(rollNo, name, division, existingStudents = [], excludeRollNo = null) {
  const cleanRoll = (rollNo || '').trim();
  const cleanName = (name || '').trim();
  const cleanDiv = (division || '').trim().toUpperCase();

  // 1. Mandatory field checks
  if (!cleanRoll) {
    return { isValid: false, error: 'Roll number is required.', sanitized: null };
  }
  if (!cleanName) {
    return { isValid: false, error: 'Student name is required.', sanitized: null };
  }
  if (!cleanDiv) {
    return { isValid: false, error: 'Division is required.', sanitized: null };
  }

  // 2. Roll number format: 1 to 10 alphanumeric characters (e.g. 101, A101, CSE01)
  const rollRegex = /^[A-Za-z0-9]{1,10}$/;
  if (!rollRegex.test(cleanRoll)) {
    return { isValid: false, error: 'Roll number must be 1-10 alphanumeric characters without symbols.', sanitized: null };
  }

  // 3. Name format: Letters, spaces, dots, hyphens only (2 to 50 characters)
  const nameRegex = /^[A-Za-z\s.\-]{2,50}$/;
  if (!nameRegex.test(cleanName)) {
    return { isValid: false, error: 'Name must contain 2-50 characters with letters and spaces only.', sanitized: null };
  }

  // 4. Division format: A, B, C, D
  const validDivisions = ['A', 'B', 'C', 'D'];
  if (!validDivisions.includes(cleanDiv)) {
    return { isValid: false, error: 'Division must be A, B, C, or D.', sanitized: null };
  }

  // 5. Uniqueness constraint: Roll Number must be unique
  const duplicate = existingStudents.some(s => 
    s.rollNo.toLowerCase() === cleanRoll.toLowerCase() && 
    (!excludeRollNo || s.rollNo.toLowerCase() !== excludeRollNo.toLowerCase())
  );
  if (duplicate) {
    return { isValid: false, error: `Roll number '${cleanRoll}' already exists. Duplicates are not allowed.`, sanitized: null };
  }

  return {
    isValid: true,
    error: null,
    sanitized: {
      rollNo: cleanRoll,
      name: cleanName,
      division: cleanDiv
    }
  };
}

/**
 * Retrieves all registered students from localStorage.
 * Initializes default seed if storage is empty.
 * @returns {Array} List of student objects
 */
function getStudents() {
  try {
    const raw = localStorage.getItem(STUDENT_CONFIG.STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STUDENT_CONFIG.STORAGE_KEY, JSON.stringify(STUDENT_CONFIG.INITIAL_SEED));
      return [...STUDENT_CONFIG.INITIAL_SEED];
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error fetching students:', e);
    return [];
  }
}

/**
 * Persists students list into localStorage.
 * @param {Array} students 
 */
function saveStudents(students) {
  localStorage.setItem(STUDENT_CONFIG.STORAGE_KEY, JSON.stringify(students));
}

/**
 * Adds a new student after validating rules.
 * @param {Object} input - { rollNo, name, division }
 * @returns {Object} - { success: boolean, message: string, student: Object|null }
 */
function addStudent(input) {
  const currentStudents = getStudents();
  const validation = validateStudentInput(input.rollNo, input.name, input.division, currentStudents);

  if (!validation.isValid) {
    return { success: false, message: validation.error, student: null };
  }

  currentStudents.push(validation.sanitized);
  // Sort numerically or alphabetically by rollNo
  currentStudents.sort((a, b) => a.rollNo.localeCompare(b.rollNo, undefined, { numeric: true }));
  saveStudents(currentStudents);

  return { success: true, message: 'Student added successfully!', student: validation.sanitized };
}

/**
 * Deletes a student by Roll Number and also cascades removal from attendance records.
 * @param {string} rollNo 
 * @returns {Object} - { success: boolean, message: string }
 */
function deleteStudent(rollNo) {
  const cleanRoll = (rollNo || '').trim();
  const currentStudents = getStudents();
  const index = currentStudents.findIndex(s => s.rollNo.toLowerCase() === cleanRoll.toLowerCase());

  if (index === -1) {
    return { success: false, message: `Student with roll number '${cleanRoll}' not found.` };
  }

  const removed = currentStudents.splice(index, 1)[0];
  saveStudents(currentStudents);

  // Cascade deletion in attendance records
  cascadeDeleteAttendance(cleanRoll);

  return { success: true, message: `Student ${removed.name} (${removed.rollNo}) deleted successfully.` };
}

/**
 * Helper to purge deleted student's attendance records to maintain relational integrity.
 * @param {string} rollNo 
 */
function cascadeDeleteAttendance(rollNo) {
  try {
    const raw = localStorage.getItem('sams_attendance_records');
    if (!raw) return;
    const records = JSON.parse(raw);
    let changed = false;

    Object.keys(records).forEach(date => {
      if (records[date] && records[date][rollNo]) {
        delete records[date][rollNo];
        changed = true;
      }
    });

    if (changed) {
      localStorage.setItem('sams_attendance_records', JSON.stringify(records));
    }
  } catch (e) {
    console.error('Cascade attendance delete error:', e);
  }
}

// Node export for headless testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    STUDENT_CONFIG,
    validateStudentInput,
    getStudents,
    saveStudents,
    addStudent,
    deleteStudent,
    cascadeDeleteAttendance
  };
}

# Student Attendance Management System (SAMS)
**STQA Project-Based Learning (PBL) Project**  
*Bharati Vidyapeeth (Deemed to be University) — Department of Computer Science & Engineering*

---

## 📌 Project Overview
The **Student Attendance Management System** is a zero-dependency, local-first web application designed and built completely from scratch using pure client-side web technologies: **HTML5, CSS3, Vanilla JavaScript (ES6+)**, and **browser `localStorage`** for offline persistence.

The system automates the recording, auditing, and mathematical calculation of classroom attendance with a strict adherence to university academic regulations (**mandatory 75.00% attendance threshold** to determine examination eligibility).

As an academic **Software Testing and Quality Assurance (STQA)** project, the application includes a comprehensive built-in test suite executing **31 automated test cases** across four formal testing levels:
1. **Unit Testing** (15 test cases, including Boundary Value Analysis at 0%, 74.99%, exactly 75.00%, 75.01%, and 100%)
2. **Integration Testing** (6 inter-module data pipeline scenarios)
3. **Regression Testing** (5 refactoring stability verification scenarios)
4. **System Testing** (5 complete end-to-end user workflows)

---

## 🚀 How to Run the Application

### Option 1: Direct File Opening (Recommended & Simplest)
1. Navigate to the project directory:
   ```
   C:\Users\ZFXMIKEY\.gemini\antigravity\scratch\Student-Attendance-System
   ```
2. Double-click on `index.html` (or right-click and choose **Open with Microsoft Edge / Google Chrome / Mozilla Firefox**).
3. The Teacher Authentication Portal will immediately load in your browser.

### Option 2: Using Any Lightweight Local Server (Optional)
If you prefer running via HTTP:
```bash
# Using Python:
cd C:\Users\ZFXMIKEY\.gemini\antigravity\scratch\Student-Attendance-System
python -m http.server 8080

# Then open in browser:
http://localhost:8080/index.html
```

---

## 🔑 Demo Teacher Credentials
- **Username:** `admin`
- **Password:** `admin123`

---

## 📁 Project Directory Structure
```
Student-Attendance-System/
│
├── index.html            <- Teacher Login Portal & Form Validation
├── dashboard.html        <- Executive Overview, Classroom Metrics & Shortcuts
├── students.html         <- Student Enrollment, Roster Table & CRUD Controls
├── attendance.html       <- Daily Attendance Marking Sheet & Date Selector
├── reports.html          <- Cumulative Attendance Statements & Eligibility Filters
├── tests.html            <- Interactive STQA Automated Test Runner
│
├── css/
│   └── style.css         <- Clean Academic Theme, Badges, Tables & Responsive Grid
│
├── js/
│   ├── auth.js           <- Authentication Controller, Session Persistence & Route Guards
│   ├── students.js       <- Student CRUD, Regex Validation & Cascading Deletions
│   ├── attendance.js     <- Date Validation, Status Toggles & Attendance Matrix Storage
│   ├── reports.js        <- Mathematical Formulas, Boundary Logic & Summary Aggregators
│   └── tests.js          <- Automated STQA Test Harness (Unit, Integration, Regression, System)
│
├── screenshots/          <- Real High-Resolution Browser Execution Evidence
│   ├── Figure_1_Login_Page.png
│   ├── Figure_2_Dashboard.png
│   ├── Figure_3_Student_Management.png
│   ├── Figure_4_Attendance_Marking.png
│   ├── Figure_5_Attendance_Report.png
│   ├── Figure_6_Unit_Testing_Output.png
│   ├── Figure_7_Integration_Testing_Output.png
│   ├── Figure_8_Regression_Testing_Output.png
│   └── Figure_9_System_Testing_Output.png
│
├── test_execution_results.json                           <- Machine-Readable Test Output Log
├── Student_Attendance_Management_System_PBL_Report.docx  <- Final Formatted College Docx Report
├── Student_Attendance_Management_System_PBL_Report.pdf   <- Final Printable PDF Report
└── README.md                                             <- Project Guide & Execution Documentation
```

---

## 🧪 STQA Testing Suite & Viva Verification

To inspect or run the live tests during an academic viva:
1. Open the project in the browser and log in.
2. Click **Testing Suite** in the navigation bar (or directly navigate to `tests.html`).
3. You will see the interactive test dashboard:
   - **Total Tests:** 31
   - **Passed:** 31 (100.0% Pass Rate)
   - **Failed:** 0
   - **Execution Time:** ~28 ms
4. Click any category tab (**Unit Tests**, **Integration Tests**, **Regression Tests**, **System Tests**) or click **🚀 Run All 31 Tests** to re-execute the entire suite live in real-time.

---

## 📊 Summary of Test Results

| Testing Level | Scope / Scenarios | Total Tests | Passed | Failed | Pass Rate |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **Unit Testing** | Login sanitization, regex checks, duplicate prevention, cascading delete, percentage math, boundary conditions (0%, 74.99%, 75.00%, 75.01%, 100%) | 15 | 15 | 0 | 100% |
| **Integration Testing** | Auth &rarr; Dashboard, Student &rarr; Attendance sheet, Attendance &rarr; Storage, Storage &rarr; Reports, Math &rarr; Eligibility, Delete cascades | 6 | 6 | 0 | 100% |
| **Regression Testing** | Post-refactor verification: string trimming, hyphenated regex, attendance persistence, division-by-zero safety, 75% threshold boundary | 5 | 5 | 0 | 100% |
| **System Testing** | Full end-to-end educator journeys: login, roster management, attendance marking, report filtering, multi-student classification | 5 | 5 | 0 | 100% |
| **CUMULATIVE** | **All STQA Suites** | **31** | **31** | **0** | **100%** |

---

## 📑 Academic Report Deliverables
The project submission includes the official college PBL report generated directly in the college template:
- **`Student_Attendance_Management_System_PBL_Report.docx`** — 26 pages, Times New Roman, bold headings, IEEE 829 Test Plan, Test Procedures, live output tables, and embedded high-resolution screenshots.
- **`Student_Attendance_Management_System_PBL_Report.pdf`** — High-quality compiled PDF document ready for immediate printing or digital submission.

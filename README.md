# Project Concepts: Tuition Fees Management System

This document outlines the core concepts, objects, and contextual information integral to the Tuition Fees Management System project.

---

## 1. Objects

- **Student**
  - Attributes: `student_id`, `name`, `phone_no`, `email`, `school_name`, `board`, `standard_id`, `medium`, `subjects`, `total_fees`
  - Context: Represents a student enrolled in the tuition center.

- **Faculty (ExternalFaculty)**
  - Attributes: `id`, `faculty_name`, `faculty_subject`, `student_count`, `total_fees`, `payable_fees`, `paid_amount`, `remaining_amount`
  - Context: Represents an external faculty member and their associated subjects and payment details.

- **Subject**
  - Attributes: `id`, `subject_name`
  - Context: Represents a subject taught at the tuition center.

- **Standard**
  - Attributes: `id`, `standard_name`
  - Context: Represents a class/grade level.

- **Fee Structure**
  - Attributes: `id`, `Standard`, `[subject columns]`
  - Context: Represents the fee mapping for each standard and subject.

- **StudentSubjects**
  - Attributes: `student_id`, `subject_id`, `externalfaculty_id`
  - Context: Maps students to their chosen subjects and the faculty assigned.

- **Student Payments**
  - Attributes: `name`, `student_id`, `total_amt`, `remaining_amt`, `amt_paid`, `payment_mode`, `cheque_no`, `trans_id`, `date`, `installments`, `subject_name`, `collected_by`, `receipt_number`, `bank_name`
  - Context: Tracks payment transactions for students.

- **Faculty Payment History**
  - Attributes: `faculty_id`, `faculty_name`, `paid_amount`, `remaining_amount`, `payment_date`, `payment_type`, `bank_name`, `upi_id`, `cheque_no`
  - Context: Tracks payment transactions for faculty.

---

## 2. Context

- **Backend (Node.js/Express)**
  - Handles REST API endpoints for CRUD operations on students, faculty, subjects, standards, fee structure, and payments.
  - Generates PDF receipts for student payments.
  - Sends payment receipts via email using Nodemailer.
  - Imports student data from Excel files.
  - Uses MySQL for data storage.

- **Frontend (React)**
  - Provides forms and dashboards for managing students, faculty, subjects, standards, and fee structure.
  - Fetches and displays data from backend APIs.
  - Allows adding, editing, and deleting records.
  - Handles authentication and protected routes.

---

## 3. Important Information

- **Authentication**
  - JWT-based authentication for protected backend routes.

- **PDF Generation**
  - Uses `pdfkit` to generate payment receipts.
  - Receipts are saved to a specified directory and can be emailed to students.

- **File Uploads**
  - Uses `multer` for handling Excel file uploads for bulk student import.

- **Database Tables**
  - `studentinfo`, `externalfaculty`, `submaster`, `stdmaster`, `feestructure`, `studentsubjects`, `student_payments`, `faculty_payment_history`

- **API Endpoints**
  - `/studentinfo`, `/add-faculty`, `/add-subject`, `/add-standard`, `/feestructure`, `/student-details/:studentId`, `/generateReceipt`, `/sendReceipt`, `/import-excel`, `/faculty-payment`, etc.

- **Error Handling**
  - All endpoints return appropriate HTTP status codes and error messages for missing or invalid data.

- **Frontend Styling**
  - Uses CSS modules and inline styles for form and table layouts.

---

## 4. Example API Usage

- **Add Student:**  
  `POST /studentinfo`  
  Body: `{ student_id, name, phone_no, ... }`

- **Add Faculty:**  
  `POST /add-faculty`  
  Body: `{ faculty_name, faculty_subject, ... }`

- **Add Subject:**  
  `POST /add-subject`  
  Body: `{ subject_name }`

- **Fetch Standards:**  
  `GET /standards`

- **Fetch Subjects:**  
  `GET /subjects`

---

## 5. Additional Notes

- All sensitive credentials (e.g., email passwords) are stored in `.env` and not committed to version control.
- The project is structured with clear separation between backend and frontend code.
- The backend supports both individual and bulk operations (via Excel import).

---

For more details, refer to the codebase and the [README.md](frontend/README.md) in the

import express from 'express';
import bodyParser from 'body-parser';
import PDFDocument from 'pdfkit';
import connection from './db.js'; // Ensure the file extension is included for ES modules
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import nodemailer from 'nodemailer';
import wbm from 'wbm';
import dotenv from 'dotenv';
import axios from 'axios';
import SerialPort from 'serialport';
import multer from 'multer';
import xlsx from 'xlsx';
import fetch from 'node-fetch';

dotenv.config();

const app = express();




// Middleware
app.use(cors());
app.use(bodyParser.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Specify the directory for file uploads
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Generate a unique filename
  },
});

const upload = multer({ storage });

// Test route
app.get("/", (req, res) => {
  res.send("Backend is working!");
});


app.post("/studentinfo", (req, res) => {
  console.log("Request received:", req.body);

  const {
    student_id,
    name,
    phone_no,
    email,
    school_name,
    board,
    standard_id,
    medium,
    subjects,
  } = req.body;

  if (!student_id || !name || !phone_no || !email || !school_name || !board || !standard_id || !medium) {
    console.error("Validation failed: Missing required fields");
    return res.status(400).send("Missing required fields");
  }

  const studentQuery = `
    INSERT INTO studentinfo 
    (student_id, name, phone_no, email, school_name, board, standard_id, medium, total_fees) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  connection.query(studentQuery, [student_id, name, phone_no, email, school_name, board, standard_id, medium, 0], async (err, result) => {
    if (err) {
      console.error("Database error while inserting student:", err.message);
      return res.status(500).send(`Database error: ${err.message}`);
    }

    const insertedStudentId = result.insertId;
    console.log("Inserted student ID:", insertedStudentId);

    if (!Array.isArray(subjects) || subjects.length === 0) {
      return res.status(201).json({
        message: "Student added successfully without subjects!",
        studentId: insertedStudentId,
      });
    }

    try {
      let totalFees = 0;
      
      // Fetch standard_name using standard_id
      const standardQuery = "SELECT standard_name FROM stdmaster WHERE id = ? LIMIT 1";
      connection.query(standardQuery, [standard_id], async (err, stdResult) => {
        if (err || stdResult.length === 0) {
          console.error("Standard not found");
          return res.status(500).send("Standard not found");
        }

        const standardName = stdResult[0].standard_name;
        console.log("Standard Name:", standardName);

        const subjectFacultyPairs = await Promise.all(subjects.map(async (subject_id) => {
          return new Promise((resolve, reject) => {
            const subjectQuery = "SELECT subject_name FROM submaster WHERE id = ? LIMIT 1";
            connection.query(subjectQuery, [subject_id], (err, result) => {
              if (err) return reject(err);
              const subjectName = result.length > 0 ? result[0].subject_name : null;
              if (!subjectName) return reject(new Error("Subject not found"));

              const facultyQuery = "SELECT id FROM ExternalFaculty WHERE faculty_subject = ? LIMIT 1";
              connection.query(facultyQuery, [subjectName], (err, facultyResult) => {
                if (err) return reject(err);
                const externalfaculty_id = facultyResult.length > 0 ? facultyResult[0].id : null;
                
                console.log(`Executing: SELECT ${subjectName} FROM feestructure WHERE Standard = '${standardName}'`);
                const feeQuery = `SELECT COALESCE(${subjectName}, 0) AS fee FROM feestructure WHERE Standard = ?`;
                
                connection.query(feeQuery, [standardName], (err, feeResult) => {
                  if (err) return reject(err);
                  const fee = feeResult.length > 0 ? feeResult[0].fee || 0 : 0;
                  totalFees += fee;

                  console.log(`Subject: ${subjectName}, Faculty ID: ${externalfaculty_id}, Fee: ${fee}`);
                  resolve([insertedStudentId, subject_id, externalfaculty_id]);
                });
              });
            });
          });
        }));

        console.log("Total Fees:", totalFees);

        const subjectInsertQuery = `INSERT INTO StudentSubjects (student_id, subject_id, externalfaculty_id) VALUES ?`;
        connection.query(subjectInsertQuery, [subjectFacultyPairs], (err) => {
          if (err) {
            console.error("Database error while inserting subjects:", err.message);
            return res.status(500).send(`Database error: ${err.message}`);
          }

          const updateFeesQuery = "UPDATE studentinfo SET total_fees = ? WHERE id = ?";
          connection.query(updateFeesQuery, [totalFees, insertedStudentId], (err) => {
            if (err) {
              console.error("Error updating total fees:", err.message);
              return res.status(500).send(`Error updating fees: ${err.message}`);
            }

            res.status(201).json({
              message: "Student, subjects, and fees recorded successfully!",
              studentId: insertedStudentId,
              totalFees: totalFees,
            });
          });
        });
      });
    } catch (error) {
      console.error("Error processing subjects and fees:", error);
      return res.status(500).send("Error processing subjects and fees.");
    }
  });
});





// Fetch all standards (standard_name)
app.get('/standards', (req, res) => {
  connection.query('SELECT * FROM stdmaster', (err, results) => {
    if (err) {
      console.error('Error querying standards:', err.stack);
      return res.status(500).send('Error querying the database');
    }
    res.json(results);  // Send the results as a JSON response
  });
});

// Fetch all subjects (subject_name)
app.get('/subjects', (req, res) => {
  connection.query('SELECT * FROM submaster', (err, results) => {
    if (err) {
      console.error('Error querying subjects:', err.stack);
      return res.status(500).send('Error querying the database');
    }
    res.json(results);  // Send the results as a JSON response
  });
});

// Fetch student count based on subject ID
// app.get('/student-count/:subjectId', (req, res) => {
//   const { subjectId } = req.params;

//   const query = 'SELECT COUNT(*) AS count FROM studentinfo WHERE subject_id = ?';

//   connection.query(query, [subjectId], (err, results) => {
//     if (err) {
//       console.error('Error querying student count:', err.stack);
//       return res.status(500).send('Error querying the database');
//     }

//     const count = results[0]?.count || 0; // Extract count from query result
//     res.json({ count });  // Send the count as a JSON response
//   });
// });

app.get('/student-count/:subjectId', (req, res) => {
  console.log("Hellllllloo");
  
  const { subjectId } = req.params;

  const query = `
    SELECT COUNT(*) AS count
    FROM studentsubjects
    WHERE subject_id = ?
  `;

  connection.query(query, [subjectId], (err, results) => {
    if (err) {
      console.error('Error querying student count:', err.stack);
      return res.status(500).send('Error querying the database');
    }
    console.log("results", results);
    
    const count = results[0]?.count; // Extract count from query result
    res.json({ count }); // Send the count as a JSON response
  });
});

// Start the server
const PORT = 3001;
app.listen(PORT, () => {
  console.log('Server is running on port ${PORT}');
});

// Additional routes (faculty, standards, subjects, etc.) remain unchanged
app.post("/add-faculty", (req, res) => {
  console.log("Request body:", req.body);  // Log the incoming request body
  const {
    faculty_name,
    faculty_subject,
    student_count,
    total_fees,
    payable_fees,
    paid_amount,
    remaining_amount,
  } = req.body;

  const query = `
    INSERT INTO ExternalFaculty (
      faculty_name,
      faculty_subject,
      student_count,
      total_fees,
      payable_fees,
      paid_amount,
      remaining_amount
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  connection.query(
    query,
    [
      faculty_name,
      faculty_subject,
      student_count,
      total_fees,
      payable_fees,
      paid_amount,
      remaining_amount,
    ],
    (err, result) => {
      if (err) {
        console.error("Error inserting data:", err.message);
        res.status(500).send("Error inserting data into database.");
      } else {
        console.log("Insert result:", result);
        res.status(200).send("Faculty data added successfully.");
      }
    }
  );
});

app.get('/get-faculty', (req, res) => {
  connection.query('SELECT id, faculty_name, faculty_subject, student_count, total_fees, payable_fees, paid_amount, remaining_amount FROM externalfaculty', (err, results) => {
    if (err) {
      console.error('Error fetching faculty data:', err);
      return res.status(500).json({ message: 'Failed to fetch faculty data' });
    }
    console.log('Received request for faculty data');
    res.json(results); // Send response with faculty data
  });
});



app.get('/get-subjects/:facultyId', (req, res) => {
  const { facultyId } = req.params;
  const query = 'SELECT faculty_subject FROM externalfaculty WHERE id = ?';

  connection.query(query, [facultyId], (err, results) => {
    if (err) {
      console.error('Error fetching subjects data:', err);
      return res.status(500).json({ message: 'Failed to fetch subjects data' });
    }
    if (results.length > 0) {
      // Assuming faculty_subject is a comma-separated list of subjects
      const subjects = results[0].faculty_subject.split(',').map(subject => ({
        id: subject.trim(), // Use subject as the ID
        subject_name: subject.trim(), // Name the subject for display
      }));
      res.json(subjects); // Send subjects data
    } else {
      res.status(404).json({ message: 'No subjects found for this faculty.' });
    }
  });
});




app.get('/get-students/:facultyId', (req, res) => {
  const { facultyId, subjectId } = req.params;
  console.log('Received facultyId:', facultyId);

  

  
  const query = `
    SELECT ef.faculty_name AS FacultyName,
           ef.faculty_subject AS FacultySubject,
           ef.student_count AS StudentCount,
           ef.total_fees AS TotalFees,
           ef.payable_fees AS PayableFees,
           ef.paid_amount AS PaidAmount,
           ef.remaining_amount AS RemainingAmount,
           s.name AS StudentName,
           s.phone_no AS PhoneNo,
           s.email AS Email,
           s.school_name AS SchoolName,
           s.board AS Board,
           s.standard_id AS StandardID,
           ss.subject_id AS SubjectID
    FROM studentsubjects ss
    JOIN externalfaculty ef ON ss.externalfaculty_id = ef.id
    JOIN studentinfo s ON ss.student_id = s.id
    WHERE ef.id = ? ;
  `;
  
  connection.query(query, [parseInt(facultyId), parseInt(subjectId)], (err, results) => {
    if (err) {
      console.error('Error fetching student data:', err);
      return res.status(500).json({ message: 'Failed to fetch student data' });
    }
    console.log('Query Results:', results);
    res.json(results);
  });});



// Fetch students based on faculty and subject
app.get('/view-students', (req, res) => {
  const { facultyName, facultySubject } = req.query;

  if (!facultyName || !facultySubject) {
    return res.status(400).json({ message: 'Invalid faculty name or subject.' });
  }

  const query = 'SELECT * FROM students WHERE faculty_name = ? AND faculty_subject = ?';
  connection.query(query, [facultyName, facultySubject], (err, results) => {
    if (err) {
      console.error('Error fetching students:', err);
      return res.status(500).json({ message: 'Error fetching students.' });
    }
    res.json(results);  // Send the fetched students
  });
});

// In your backend API route
app.get("/fetch-students/:facultyId/:subjectId", async (req, res) => {
  const { subjectId } = req.params; // Use subjectId instead of facultySubject

  console.log('Fetching students for Subject ID: ${subjectId}'); // Debug log

  try {
    const query = `
      SELECT id, name, phone_no, email, school_name, board, standard_id, subject_id, medium, 
             discount, total_fees, shift, reference, paid_amount, remaining_amount, fees_date, 
             due_date, payment_mode, transaction_id, academic_year 
      FROM student_info 
      WHERE subject_id = ?
    `;
    const [students] = await db.execute(query, [subjectId]);

    if (students.length === 0) {
      console.log('No students found for this subject ID.');
    } else {
      console.log('Students fetched:', students);
    }

    res.json(students); // Send the students data
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ error: "Failed to fetch students." });
  }
});

// Modify the paymentinfo endpoint to include receipt number generation
app.post("/paymentinfo", (req, res) => {
  const { 
    name, 
    student_id, 
    total_amt, 
    remaining_amt, 
    amt_paid, 
    payment_mode, 
    cheque_no, 
    trans_id, 
    date, 
    installments, 
    subject_name, 
    collected_by, 
    bank_name // Add bank_name to destructured fields
  } = req.body;

  if (!student_id || !total_amt || !amt_paid || !payment_mode || !date || !installments || !collected_by) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  const checkQuery = `SELECT * FROM student_payments WHERE name = ? ORDER BY date DESC LIMIT 1;`;

  connection.query(checkQuery, [name], (err, results) => {
    if (err) {
      console.error("Error checking student payment record:", err);
      return res.status(500).json({ error: "Error checking student payment record." });
    }

    let newRemainingAmt = results.length === 0 ? total_amt - amt_paid : results[0].remaining_amt - amt_paid;

    // Generate a unique receipt number
    const receiptNumber = `REC-${Date.now()}`;

    const insertQuery = `
      INSERT INTO student_payments (
        name, 
        student_id, 
        total_amt, 
        remaining_amt, 
        amt_paid, 
        payment_mode, 
        cheque_no, 
        trans_id, 
        date, 
        installments, 
        subject_name, 
        collected_by, 
        receipt_number, 
        bank_name  -- Include bank_name in the query
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    connection.query(
      insertQuery,
      [
        name || "Unknown", 
        student_id, 
        total_amt, 
        newRemainingAmt, 
        amt_paid, 
        payment_mode, 
        cheque_no || null, 
        trans_id || null, 
        date, 
        installments, 
        subject_name || 1, 
        collected_by, 
        receiptNumber, 
        payment_mode === "Cheque" ? bank_name : null // Save bank_name only if payment mode is "Cheque"
      ],
      (err) => {
        if (err) {
          console.error("Error inserting payment data:", err);
          return res.status(500).json({ error: "Failed to insert payment data." });
        }
        res.status(201).json({ message: "Payment information saved successfully!", receiptNumber });
      }
    );
  });
});




app.get('/student-details/:studentId', (req, res) => {
  const { studentId } = req.params;

  const query = `
    SELECT 
    si.name,
    si.phone_no,
    si.email,
    si.school_name,
    si.board,
    si.standard_id,
    si.medium,
    sp.total_amt,
    sp.remaining_amt,
    sp.amt_paid,
    sp.payment_mode,
    sp.cheque_no,
    sp.trans_id,
    sp.date
FROM 
    studentinfo si
INNER JOIN 
    student_payments sp ON si.student_id = sp.student_id
WHERE 
    si.name LIKE ?;

  `;

  connection.query(query, [studentId], (err, results) => {
    if (err || results.length === 0) {
      console.error("Error fetching student details:", err || "No student found.");
      return res.status(500).json({ error: "Failed to generate receipt. Student not found or database error." });
    } else if (results.length === 0) {
      res.status(404).json({ message: "Student not found. Please check the Student ID." });
    } else {
      res.status(200).json(results[0]); // Return the last installment information
    }
  });
});


app.get('/generateReceipt', (req, res) => {
  const { student_id } = req.query;

  console.log("Received student_id:", student_id); // Debug log

  if (!student_id) {
    console.error("Missing student ID.");
    return res.status(400).json({ error: "Missing student ID." });
  }

  const query = `
    SELECT 
      si.name,
      sp.receipt_number,
      sp.date,
      sp.amt_paid,
      sp.remaining_amt,
      sp.payment_mode,
      sp.cheque_no,
      sp.trans_id
    FROM 
      studentinfo si
    INNER JOIN 
      student_payments sp ON si.student_id = sp.student_id
    WHERE 
      si.student_id = ?
    ORDER BY 
      sp.date DESC
    LIMIT 1;
  `;

  connection.query(query, [student_id], (err, results) => {
    if (err) {
      console.error("Database error:", err.message);
      return res.status(500).json({ error: "Failed to fetch student details." });
    }

    if (results.length === 0) {
      console.error("No student found for student_id:", student_id);
      return res.status(404).json({ error: "Student not found." });
    }

    const student = results[0];
    const filePath = `./receipts/${student.receipt_number}.pdf`;

    // Ensure the receipts directory exists
    if (!fs.existsSync('./receipts')) {
      fs.mkdirSync('./receipts', { recursive: true });
    }

    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(filePath));

    // Add content to the PDF
    doc.fontSize(16).text(`Receipt Number: ${student.receipt_number}`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Student Name: ${student.name}`);
    doc.text(`Student ID: ${student_id}`);
    doc.text(`Payment Mode: ${student.payment_mode}`);
    doc.text(`Amount Paid: ₹${student.amt_paid}`);
    doc.text(`Remaining Amount: ₹${student.remaining_amt}`);
    if (student.payment_mode === 'Cheque') {
      doc.text(`Cheque Number: ${student.cheque_no}`);
    } else if (student.payment_mode === 'Online') {
      doc.text(`Transaction ID: ${student.trans_id}`);
    }
    doc.text(`Date: ${student.date}`);
    doc.moveDown();
    doc.text("Thank you for your payment!");

    // Finalize the PDF document
    doc.end();

    // Wait for PDF to be written to disk before sending the response
    doc.on('finish', () => {
      console.log("PDF generation finished. File is ready for download."); // Debug log
      res.download(filePath, `${student.receipt_number}.pdf`, (err) => {
        if (err) {
          console.error("Error sending receipt:", err);
          res.status(500).json({ error: "Failed to download the receipt." });
        } else {
          console.log("Receipt downloaded successfully."); // Debug log
        }
        // Optionally, delete the file after sending the response
        fs.unlinkSync(filePath);
      });
    });
  });
});

app.get('/generateReceipt', (req, res) => {
  const { receipt_number } = req.query;

  console.log("Received receipt_number:", receipt_number); // Debug log

  if (!receipt_number) {
    console.error("Missing receipt number.");
    return res.status(400).json({ error: "Missing receipt number." });
  }

  const query = `
    SELECT 
      si.name,
      sp.receipt_number,
      sp.date,
      sp.amt_paid,
      sp.remaining_amt,
      sp.payment_mode,
      sp.cheque_no,
      sp.trans_id
    FROM 
      studentinfo si
    INNER JOIN 
      student_payments sp ON si.student_id = sp.student_id
    WHERE 
      sp.receipt_number = ?
    LIMIT 1;
  `;

  connection.query(query, [receipt_number], (err, results) => {
    if (err) {
      console.error("Database error:", err.message);
      return res.status(500).json({ error: "Failed to fetch receipt details." });
    }

    if (results.length === 0) {
      console.error("No receipt found for receipt_number:", receipt_number);
      return res.status(404).json({ error: "Receipt not found." });
    }

    const receipt = results[0];
    const filePath = `./receipts/${receipt.receipt_number}.pdf`;

    // Ensure the receipts directory exists
    if (!fs.existsSync('./receipts')) {
      fs.mkdirSync('./receipts', { recursive: true });
    }

    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(filePath));

    // Add content to the PDF
    doc.fontSize(16).text(`Receipt Number: ${receipt.receipt_number}`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Student Name: ${receipt.name}`);
    doc.text(`Payment Mode: ${receipt.payment_mode}`);
    doc.text(`Amount Paid: ₹${receipt.amt_paid}`);
    doc.text(`Remaining Amount: ₹${receipt.remaining_amt}`);
    if (receipt.payment_mode === 'Cheque') {
      doc.text(`Cheque Number: ${receipt.cheque_no}`);
    } else if (receipt.payment_mode === 'Online') {
      doc.text(`Transaction ID: ${receipt.trans_id}`);
    }
    doc.text(`Date: ${receipt.date}`);
    doc.moveDown();
    doc.text("Thank you for your payment!");

    // Finalize the PDF document
    doc.end();

    // Wait for PDF to be written to disk before sending the response
    doc.on('finish', () => {
      console.log("PDF generation finished. File is ready for download."); // Debug log
      res.download(filePath, `${receipt.receipt_number}.pdf`, (err) => {
        if (err) {
          console.error("Error sending receipt:", err);
          res.status(500).json({ error: "Failed to download the receipt." });
        } else {
          console.log("Receipt downloaded successfully."); // Debug log
        }
        // Optionally, delete the file after sending the response
        fs.unlinkSync(filePath);
      });
    });
  });
});




// Update faculty details
app.put("/update-faculty/:id", (req, res) => {
  const { id } = req.params;
  const {
    faculty_name,
    faculty_subject,
    student_count,
    total_fees,
    payable_fees,
    paid_amount,
    remaining_amount,
  } = req.body;

  console.log("Update request received for ID:", id);
  console.log("Request body:", req.body);

  if (!id) {
    return res.status(400).json({ error: "Missing faculty ID." });
  }

  if (
    !faculty_name ||
    !faculty_subject ||
    student_count === undefined ||
    total_fees === undefined ||
    payable_fees === undefined ||
    paid_amount === undefined ||
    remaining_amount === undefined
  ) {
    return res.status(400).json({ error: "Missing required fields for updating faculty." });
  }

  const updateQuery = `
    UPDATE ExternalFaculty
    SET
      faculty_name = ?,
      faculty_subject = ?,
      student_count = ?,
      total_fees = ?,
      payable_fees = ?,
      paid_amount = ?,
      remaining_amount = ?
    WHERE id = ?
  `;

  connection.query(
    updateQuery,
    [
      faculty_name,
      faculty_subject,
      student_count,
      total_fees,
      payable_fees,
      paid_amount,
      remaining_amount,
      id,
    ],
    (err, result) => {
      if (err) {
        console.error("Error updating faculty:", err.message);
        return res.status(500).json({ error: "Failed to update faculty details." });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Faculty not found." });
      }

      console.log("Faculty updated successfully:", result);
      res.status(200).json({ message: "Faculty details updated successfully." });
    }
  );
});

app.put("/update-faculty/:id", async (req, res) => {
  try {
    const response = await fetch(`http://localhost:3001/update-faculty/${editingId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedFormData),
    });

    const data = await response.json();
    console.log("Update successful:", data);
    res.status(200).json(data);
  } catch (error) {
    console.error("Error updating faculty:", error);
    res.status(500).json({ error: "Failed to update faculty." });
  }
});

let isEditing = false; // Initialize isEditing as false or true based on your logic

if (isEditing) {
  console.log("Updating faculty with ID:", editingId);
  console.log("Data being sent:", updatedFormData);

  const response = await fetch(`http://localhost:3001/update-faculty/${editingId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedFormData),
  });
}

if (isEditing) {
  console.log("Updating faculty with ID:", editingId);
  console.log("Data being sent:", updatedFormData);

  response = await fetch(`http://localhost:3001/update-faculty/${editingId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedFormData),
  });
}

// Delete faculty details
app.delete("/delete-faculty/:id", (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: "Missing faculty ID for deletion." });
  }

  const deleteQuery = "DELETE FROM ExternalFaculty WHERE id = ?";

  connection.query(deleteQuery, [id], (err, result) => {
    if (err) {
      console.error("Error deleting faculty:", err.message);
      return res.status(500).json({ error: "Failed to delete faculty data." });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Faculty not found." });
    }

    res.status(200).json({ message: "Faculty data deleted successfully." });
  });
});





// Route to fetch students based on faculty
app.get("/view-students/:facultyId", (req, res) => {
  const { facultyId } = req.params;

  if (!facultyId) {
    return res.status(400).json({ error: "Missing faculty ID." });
  }

  const query = `
    SELECT s.student_id, s.student_name, s.subject, s.email, s.phone
    FROM studentinfo AS s
    INNER JOIN submaster AS sm ON s.subject_id = sm.subject_id
    INNER JOIN externalfaculty AS f ON f.faculty_subject = sm.subject_name
    WHERE f.id = ?;
  `;

  connection.query(query, [facultyId], (err, results) => {
    if (err) {
      console.error("Error fetching students:", err.message);
      return res.status(500).json({ error: "Failed to fetch student data." });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "No students found for this faculty." });
    }

    res.status(200).json(results);
  });
});

app.get('/feestructure', (req, res) => {
  const query = 'SELECT * FROM feestructure';
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching feestructure data:', err);
      res.status(500).json({ error: 'Failed to fetch data' });
    } else {
      res.status(200).json(results);
    }
  });
});




import os from 'os';



// Modified version of the post route to use a specific directory (E:\receipt)


app.post("/sendReceipt", async (req, res) => {
  const { studentEmail, studentId, delayTime } = req.body;

  if (!studentEmail || !studentId) {
    return res.status(400).json({ error: "Missing student email or ID." });
  }

  const pdfDirectory = "E:\\receipt";

  // Helper: wait for given ms
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  let latestPdfPath = getLatestPdf(pdfDirectory);

  // If not found, retry after delay
  if (!latestPdfPath) {
    await wait(2000);
    latestPdfPath = getLatestPdf(pdfDirectory);
  }

  if (!latestPdfPath) {
    return res.status(404).json({ error: "No PDF found in E:\\receipt directory." });
  }

  const delay = delayTime || 5000;

  try {
    await wait(delay);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "pdevanshu78@gmail.com",
        pass: "qlkguznmejxcuxqf",
      },
    });

    const mailOptions = {
      from: "pdevanshu78@gmail.com",
      to: studentEmail,
      subject: "Your Payment Receipt",
      text: `Dear Student,\n\nPlease find your payment receipt attached.\n\nThank you for your payment.\n\nBest regards,\nJG Tuition`,
      attachments: [
        {
          filename: path.basename(latestPdfPath),
          path: latestPdfPath,
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: "Receipt sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).json({ error: "Failed to send receipt email." });
  }
});

// Waits for the latest PDF file to appear within given seconds
function waitForPdf(directory, maxWaitSeconds = 5) {
  return new Promise((resolve) => {
    const interval = 1000;
    let waited = 0;

    const check = () => {
      const latestPdf = getLatestPdf(directory);
      if (latestPdf) {
        resolve(latestPdf);
      } else if (waited >= maxWaitSeconds * 1000) {
        resolve(null); // Timed out
      } else {
        waited += interval;
        setTimeout(check, interval);
      }
    };

    check();
  });
}

// Helper to get latest PDF
function getLatestPdf(directory) {
  try {
    let files = fs.readdirSync(directory);
    let pdfFiles = files
      .filter(file => file.endsWith(".pdf"))
      .map(file => ({
        file,
        time: fs.statSync(path.join(directory, file)).mtime.getTime(),
      }));

    pdfFiles.sort((a, b) => b.time - a.time);

    return pdfFiles.length > 0 ? path.join(directory, pdfFiles[0].file) : null;
  } catch (err) {
    console.error("Error reading PDF directory:", err);
    return null;
  }
}



app.get('/studentfeesdetails/:studentId', (req, res) => {
  const { studentId } = req.params;

  const query = `
SELECT 
    si.name, 
    si.student_id,
    si.email, 
    si.total_fees AS total_amount,  -- Get total_fees directly from studentinfo
    COALESCE(sp.remaining_amt, si.total_fees) AS remaining_amt,  -- Use remaining_amt from student_payments or total_fees if no record exists
    CASE 
        WHEN sp.name IS NOT NULL THEN 'from student_payments'
        ELSE 'from studentinfo'
    END AS source
FROM studentinfo si
LEFT JOIN (
    SELECT sp1.name, 
           sp1.remaining_amt  -- Get the remaining_amt from the last payment record
    FROM student_payments sp1
    WHERE sp1.date = (
        SELECT MAX(sp2.date) 
        FROM student_payments sp2 
        WHERE sp2.name = sp1.name
    )
) sp ON si.name = sp.name
WHERE si.name = ?;
  `;
  

  connection.query(query, [studentId], (err, results) => {
    if (err) {
      console.error("Database error:", err.message);
      res.status(500).json({ message: "Database error" });
    } else if (results.length === 0) {
      res.status(404).json({ message: "Student not found. Please check the Student ID." });
    } else {
      res.status(200).json(results[0]); // Return the last installment information
    }
  });
});





app.post("/add-standard", (req, res) => {
    const { standard_name } = req.body;

    console.log("Received request to add standard:", standard_name); // Debug log

    if (!standard_name) {
        console.error("Standard name is missing.");
        return res.status(400).json({ error: "Standard name is required." });
    }

    const checkQuery = `SELECT * FROM stdmaster WHERE standard_name = ?;`;
    connection.query(checkQuery, [standard_name], (err, results) => {
        if (err) {
            console.error("Error checking standard:", err);
            return res.status(500).json({ error: "Error checking standard." });
        }

        if (results.length > 0) {
            console.error("Standard already exists:", standard_name);
            return res.status(400).json({ error: "Standard already exists." });
        }

        const insertQuery = `INSERT INTO stdmaster (standard_name) VALUES (?);`;
        connection.query(insertQuery, [standard_name], (err, result) => {
            if (err) {
                console.error("Error inserting standard:", err);
                return res.status(500).json({ error: "Failed to insert standard." });
            }

            console.log("Standard added successfully:", standard_name);
            res.status(201).json({ message: "Standard added successfully!" });
        });
    });
});




//tej vadu

// API to Import Excel Data
app.post("/import-excel", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "❌ Please upload an Excel file." });
  }

  const filePath = req.file.path;

  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const jsonData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "" });

    if (jsonData.length === 0) {
      return res.status(400).json({ error: "❌ Excel file is empty." });
    }

    const requiredFields = [
      "name", "phone_no", "email", "school_name", "board",
      "standard_id", "medium", "transaction_id", "student_id",
      "externalfaculty_id", "total_fees"
    ];

    const existingFields = Object.keys(jsonData[0]).map(field => field.toLowerCase().trim());
    console.log("🟢 Excel Headers:", existingFields);

    const missingFields = requiredFields.filter(field => !existingFields.includes(field.toLowerCase()));

    if (missingFields.length > 0) {
      console.log("❌ Missing Fields:", missingFields);
      return res.status(400).json({ error: `Missing fields: ${missingFields.join(", ")}` });
    }

    const insertQuery = `
      INSERT INTO studentinfo (name, phone_no, email, school_name, board, 
        standard_id, medium, transaction_id, student_id, externalfaculty_id, total_fees) 
      VALUES ?
    `;

    const values = jsonData.map(row => [
      row.name || null,
      row.phone_no || null,
      row.email || null,
      row.school_name || null,
      row.board || null,
      row.standard_id || null,
      row.medium || null,
      row.transaction_id || null,
      row.student_id || null,
      row.externalfaculty_id || null,
      row.total_fees || null
    ]);

    connection.query(insertQuery, [values], (err, result) => {
      fs.unlinkSync(filePath);

      if (err) {
        console.error("❌ MySQL Error:", err);
        return res.status(500).json({ error: "❌ Failed to import data." });
      }
      res.status(200).json({ message: "✅ Data imported successfully!", affectedRows: result.affectedRows });
    });

  } catch (error) {
    console.error("❌ Excel Parsing Error:", error);
    fs.unlinkSync(filePath);
    res.status(500).json({ error: "❌ Error processing the file." });
  }
});




app.get('/studentAllView', (req, res) => {
  const { standard } = req.query;
  console.log("Received request for standard:", standard);

  let query = 'SELECT * FROM studentinfo';
  let values = [];

  if (standard && standard !== 'All') {
    query += ' WHERE standard_id = ?';
    values.push(parseInt(standard));
  }

  connection.query(query, values, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: 'Failed to fetch student data' });
    }

    console.log("Query results:", results);
    res.status(200).json(results);
  });
});




app.get("/faculty-details", (req, res) => {
  const { faculty_name } = req.query;
  console.log("Received request for faculty details:", faculty_name); // Log the incoming request

  if (!faculty_name) {
    console.error("Faculty name is missing in the request."); // Log missing faculty name
    return res.status(400).json({ error: "Faculty name is required." });
  }

  const getFacultyQuery = `
    SELECT id, faculty_name, remaining_amount 
    FROM externalfaculty 
    WHERE faculty_name = ? 
    LIMIT 1
  `;

  connection.query(getFacultyQuery, [faculty_name], (err, facultyResults) => {
    if (err) {
      console.error("Error fetching faculty details from database:", err); // Log database error
      return res.status(500).json({ error: "Error fetching faculty details." });
    }

    if (facultyResults.length === 0) {
      console.error("No faculty found for name:", faculty_name); // Log no results found
      return res.status(404).json({ error: "Faculty not found." });
    }

    const faculty_id = facultyResults[0].id;
    const initialRemainingAmount = facultyResults[0].remaining_amount;

    const checkPaymentHistoryQuery = `
      SELECT remaining_amount 
      FROM faculty_payment_history 
      WHERE faculty_id = ? 
      ORDER BY payment_date DESC 
      LIMIT 1
    `;

    connection.query(checkPaymentHistoryQuery, [faculty_id], (err, paymentHistoryResults) => {
      if (err) {
        console.error("Error checking payment history:", err); // Log database error
        return res.status(500).json({ error: "Error checking payment history." });
      }

      if (paymentHistoryResults.length === 0) {
        console.log("No payment history found. Returning initial remaining amount."); // Log no payment history
        return res.json({
          id: faculty_id,
          faculty_name: facultyResults[0].faculty_name,
          remaining_amount: initialRemainingAmount,
          source: "externalfaculty",
        });
      }

      const remainingAmount = paymentHistoryResults[0].remaining_amount;
      console.log("Returning remaining amount from payment history:", remainingAmount); // Log payment history result
      res.json({
        id: faculty_id,
        faculty_name: facultyResults[0].faculty_name,
        remaining_amount: remainingAmount,
        source: "faculty_payment_history",
      });
    });
  });
});


app.post("/faculty-payment", (req, res) => {
  const {
    faculty_name,
    paid_amount,
    remaining_amount,
    payment_date,
    payment_type,
    bank_name,
    upi_id,
    cheque_no, // Add cheque_no to destructured fields
  } = req.body;

  console.log("Received payment data:", req.body); // Log the incoming request body

  if (!faculty_name || !paid_amount || !payment_date || !payment_type) {
    console.error("Missing required fields in payment data."); // Log missing fields
    return res.status(400).json({ error: "Missing required fields." });
  }

  // Step 1: Fetch faculty_id and current remaining_amount from the externalfaculty table
  const getFacultyIdQuery = `
    SELECT id, remaining_amount FROM externalfaculty WHERE faculty_name = ? LIMIT 1
  `;

  connection.query(getFacultyIdQuery, [faculty_name], (err, results) => {
    if (err) {
      console.error("Error fetching faculty ID:", err); // Log database error
      return res.status(500).json({ error: "Error fetching faculty ID." });
    }

    if (results.length === 0) {
      console.error("Faculty not found for name:", faculty_name); // Log no results found
      return res.status(404).json({ error: "Faculty not found." });
    }

    const faculty_id = results[0].id; // Extract the faculty_id
    const currentRemainingAmount = results[0].remaining_amount; // Get the current remaining amount

    // Step 2: Calculate the new remaining amount
    const newRemainingAmount = currentRemainingAmount - paid_amount;

    // Step 3: Insert payment data into the faculty_payment_history table
    const insertPaymentQuery = `
      INSERT INTO faculty_payment_history (faculty_id, faculty_name, paid_amount, remaining_amount, payment_date, payment_type, bank_name, upi_id, cheque_no)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    connection.query(
      insertPaymentQuery,
      [faculty_id, faculty_name, paid_amount, newRemainingAmount, payment_date, payment_type, bank_name, upi_id, cheque_no || null],
      (err, results) => {
        if (err) {
          console.error("Error inserting payment data into database:", err); // Log database error
          return res.status(500).json({ error: "Failed to save payment." });
        }

        // Step 4: Update the remaining_amount in the externalfaculty table
        const updateRemainingAmountQuery = `
          UPDATE externalfaculty SET remaining_amount = ? WHERE id = ?
        `;

        connection.query(updateRemainingAmountQuery, [newRemainingAmount, faculty_id], (err) => {
          if (err) {
            console.error("Error updating remaining amount in externalfaculty:", err); // Log database error
            return res.status(500).json({ error: "Failed to update remaining amount." });
          }

          console.log("Payment saved successfully and remaining amount updated:", results); // Log successful insertion
          res.status(201).json({ message: "Payment saved successfully!" });
        });
      }
    );
  });
});

app.post("/add-subject", (req, res) => {
    const { subject_name } = req.body;

    console.log("Received request to add subject:", subject_name);

    if (!subject_name) {
        console.error("Subject name is missing.");
        return res.status(400).json({ error: "Subject name is required." });
    }

    const checkQuery = `SELECT * FROM submaster WHERE subject_name = ?;`;
    connection.query(checkQuery, [subject_name], (err, results) => {
        if (err) {
            console.error("Error checking subject:", err);
            return res.status(500).json({ error: "Error checking subject." });
        }

        if (results.length > 0) {
            console.error("Subject already exists:", subject_name);
            return res.status(400).json({ error: "Subject already exists." });
        }

        const insertQuery = `INSERT INTO submaster (subject_name) VALUES (?);`;
        connection.query(insertQuery, [subject_name], (err, result) => {
            if (err) {
                console.error("Error inserting subject:", err);
                return res.status(500).json({ error: "Failed to insert subject." });
            }

            console.log("Subject added successfully:", subject_name);
            res.status(201).json({ message: "Subject added successfully!" });
        });
    });
});

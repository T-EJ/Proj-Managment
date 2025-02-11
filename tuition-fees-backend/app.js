const express = require('express');
const bodyParser = require('body-parser');
const PDFDocument = require("pdfkit");
const connection = require('./db'); // Connect to MySQL database
const cors = require('cors');
const path = require("path");
const fs = require("fs");
const nodemailer = require('nodemailer');
const wbm = require('wbm');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

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

app.post("/paymentinfo", (req, res) => {
  const { name,student_id, total_amt, remaining_amt, amt_paid, payment_mode, cheque_no, trans_id, date, installments } = req.body;

  // Validate required fields
  if (!student_id || !total_amt || !amt_paid || !payment_mode || !date || !installments) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  // Check if payment record already exists for the student
  const checkQuery = `
    SELECT * FROM student_payments WHERE name = ? ORDER BY date DESC LIMIT 1;
  `;

  connection.query(checkQuery, [name], (err, results) => {
    if (err) {
      console.error("Error checking student payment record:", err);
      return res.status(500).json({ error: "Error checking student payment record." });
    }

    let newRemainingAmt;

    if (results.length === 0) {
      // First time payment, set remaining amount as total amount minus amt_paid
      newRemainingAmt = total_amt - amt_paid;  // Subtract amt_paid from total_amt for the first payment
    } else {
      // Payment record exists, calculate remaining amount
      newRemainingAmt = results[0].remaining_amt - amt_paid;
    }

    // Insert the payment record, including installments
    const insertQuery = `
      INSERT INTO student_payments (name,student_id, total_amt, remaining_amt, amt_paid, payment_mode, cheque_no, trans_id, date, installments)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    connection.query(
      insertQuery,
      [name || "Unknown", student_id,total_amt, newRemainingAmt, amt_paid, payment_mode, cheque_no || null, trans_id || null, date, installments || 1],
      (err) => {
        if (err) {
          console.error("Error inserting payment data:", err);
          return res.status(500).json({ error: "Failed to insert payment data." });
        }
        res.status(201).json({ message: "Payment information saved successfully!" });
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




app.get('/generateReceipt', (req, res) => {
  const { student_id } = req.query;

  if (!student_id) {
    return res.status(400).json({ error: "Missing student ID." });
  }

  // Query to fetch the latest payment details
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
      sp.date,
      sp.installments
    FROM 
      studentinfo si
    INNER JOIN 
      student_payments sp ON si.student_id = sp.student_id
    WHERE 
      si.name = ? 
    ORDER BY 
      sp.date DESC
    LIMIT 1;
  `;

  connection.query(query, [student_id], (err, results) => {
    if (err) {
      console.error("Database error:", err.message);
      return res.status(500).json({ error: "Failed to fetch student details." });
    } else if (results.length === 0) {
      return res.status(404).json({ error: "Student not found." });
    }

    const student = results[0];

    // Create the PDF document
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    // Set the directory and file path for saving the PDF
    const directory = "E:\\receipt";
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
    const filePath = path.join(directory, `Receipt_${student_id}.pdf`);

    // Write the PDF to the specified directory
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    doc.image('F:\\JG tution\\Proj-Managment\\frontend\\public\\logo.png', { // Replace with your logo path
      fit: [100, 100], // Adjust size as needed
      align: 'center',
      valign: 'center'
    });

    doc.moveDown(0.5); // Small space after logo

    doc
      .font('Helvetica-Bold')
      .fontSize(20)
      .fillColor('#000') // Black
      .text("JG Tuition", { align: "center" });

    doc
      .font('Helvetica')
      .fontSize(12)
      .fillColor('#555') // Gray
      .text("LET YOUR CHILD GROW", { align: "center" });

    doc.moveDown(1);


  


    doc.fontSize(10).text(`Date: ${student.date}`, { align: 'right' }); // Format the date

    doc.moveDown(1);

    // Main Content Area
    doc
      .font('Helvetica')
      .fontSize(12)
      .fillColor('#000')
      .text(`Received with thanks from: ${student.name}`, { align: 'left' });

    doc.moveDown(0.5);

    doc.text(`Std: ${student.standard_id}  `, { align: 'left' }); // Add placeholders

    doc.moveDown(1);

    doc.font('Helvetica-Bold').text(`Amount paid: ${student.amt_paid}`, { align: 'left' }); // Amount paid
    doc.moveDown(1);
    doc.font('Helvetica-Bold').text(`Remaining amount: ${student.remaining_amt}`, { align: 'left' });
    doc.moveDown(1);

    doc.font('Helvetica').fontSize(12).text(`by ${student.payment_mode} ${student.payment_mode === 'Cheque' ? `/ Cheque No. ${student.cheque_no}` : student.payment_mode === 'Online' ? `/ Transaction ID. ${student.trans_id}` : ''}`, { align: 'left' });

    doc.moveDown(1);

    doc.font('Helvetica').fontSize(12).text(`Rs. ${student.amt_paid} /-`, { align: 'right' }); // Amount with currency symbol

    doc.moveDown(2);

    doc.fontSize(10).text('*Subject to realization of Cheque.', { align: 'left' });
    doc.fontSize(10).text('Fees once paid will not be refundable at any circumstances.', { align: 'left' });

    doc.moveDown(1);


    doc.font('Helvetica').fontSize(12).text('Receiver\'s Sign. _________________________', { align: 'right' });

    // Footer
    const footerY = doc.y + 20; // Adjust as needed
    doc.moveTo(50, footerY)
      .lineTo(550, footerY) // Draw a line
      .stroke();

    doc.moveDown(1);
    doc.moveDown(1);
    doc.font('Helvetica').fontSize(10).text('104, Aishwarya Complex, Maninagar, Ahmedabad-380008.', { align: 'center' });


    doc.end();

    // Wait for the write stream to finish
    writeStream.on('finish', () => {
      res.status(200).json({ message: `Receipt saved to ${filePath}` });
    });

    writeStream.on('error', (err) => {
      console.error("Error writing PDF:", err);
      res.status(500).json({ error: "Failed to write receipt to file." });
    });
  });
});






// Update faculty details
app.put("/update-faculty/:id", (req, res) => {
  const { id } = req.params; // The faculty ID from the URL
  const {
    faculty_name,
    faculty_subject,
    student_count,
    total_fees,
    payable_fees,
    paid_amount,
    remaining_amount,
  } = req.body;

  // Validate required fields
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

      res.status(200).json({ message: "Faculty details updated successfully." });
    }
  );
});



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




const os = require('os');



// Modified version of the post route to use a specific directory (E:\receipt)
app.post("/sendReceipt", async (req, res) => {
  const { studentEmail, studentId, delayTime } = req.body;

  if (!studentEmail || !studentId) {
    return res.status(400).json({ error: "Missing student email or ID." });
  }

  // Use the specific directory where PDFs are stored
  const pdfDirectory = "E:\\receipt";
  let latestPdfPath = getLatestPdf(pdfDirectory);

  if (!latestPdfPath) {
    // Retry to get the latest file after a small delay (e.g., 2 seconds)
    setTimeout(() => {
      latestPdfPath = getLatestPdf(pdfDirectory);
      if (!latestPdfPath) {
        return res.status(404).json({ error: "No PDF found in E:\\receipt directory." });
      }
    }, 2000); // Retry after 2 seconds

    return res.status(500).json({ error: "PDF not found. Retrying..." });
  }

  // If delayTime is not provided, default to 5 seconds (5000 ms)
  const delay = delayTime || 5000;

  try {
    // Set a timeout for the delay before sending the email
    setTimeout(async () => {
      // Nodemailer transporter setup
      const transporter = nodemailer.createTransport({
        service: "gmail", // Using Gmail service
        auth: {
          user: "pdevanshu78@gmail.com", // Replace with your email
          pass: "qlkguznmejxcuxqf", // Replace with your App Password
        },
      });

      // Email options
      const mailOptions = {
        from: "pdevanshu78@gmail.com", // Replace with your email
        to: studentEmail,
        subject: "Your Payment Receipt",
        text: `Dear Student,\n\nPlease find your payment receipt attached.\n\nThank you for your payment.\n\nBest regards,\nJG Tuition`,
        attachments: [
          {
            filename: path.basename(latestPdfPath), // Use the actual file name
            path: latestPdfPath, // Use the path to the latest PDF
          },
        ],
      };

      // Send email
      await transporter.sendMail(mailOptions);

      // Send response
      res.status(200).json({ message: "Receipt sent successfully after delay!" });
    }, delay); // Delay is in milliseconds (e.g., 5000 ms = 5 seconds)

  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send receipt email." });
  }
});

// Helper function to get the latest PDF from a specific directory
function getLatestPdf(directory) {
  let files = fs.readdirSync(directory);

  // Filter only .pdf files
  let pdfFiles = files
    .filter((file) => file.endsWith(".pdf"))
    .map((file) => ({
      file: file,
      time: fs.statSync(path.join(directory, file)).mtime.getTime(),
    }));

  // Sort files by modification time, descending (most recent first)
  pdfFiles.sort((a, b) => b.time - a.time);

  if (pdfFiles.length > 0) {
    return path.join(directory, pdfFiles[0]?.file);
  } else {
    return null; // Return null if no PDF found
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

  // Validate required fields
  if (!standard_name) {
    return res.status(400).json({ error: "Standard name is required." });
  }

  // Check if the standard already exists
  const checkQuery = `
    SELECT * FROM stdmaster WHERE standard_name = ?;
  `;

  connection.query(checkQuery, [standard_name], (err, results) => {
    if (err) {
      console.error("Error checking standard:", err);
      return res.status(500).json({ error: "Error checking standard." });
    }

    if (results.length > 0) {
      return res.status(400).json({ error: "Standard already exists." });
    }

    // Insert the new standard into the stdmaster table
    const insertQuery = `
      INSERT INTO stdmaster (standard_name)
      VALUES (?);
    `;

    connection.query(insertQuery, [standard_name], (err, result) => {
      if (err) {
        console.error("Error inserting standard:", err);
        return res.status(500).json({ error: "Failed to insert standard." });
      }

      res.status(201).json({ message: "Standard added successfully!" });
    });
  });
});
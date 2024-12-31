const express = require('express');
const bodyParser = require('body-parser');
const connection = require('./db'); // Connect to MySQL database
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Test route
app.get("/", (req, res) => {
  res.send("Backend is working!");
});

// Route to insert student data
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
    subjects, // Expecting an array of subject IDs
  } = req.body;

  // Validate required fields
  if (!student_id || !name || !phone_no || !email || !school_name || !board || !standard_id || !medium) {
    console.error("Validation failed: Missing required fields");
    return res.status(400).send("Missing required fields");
  }

  const studentQuery = `
    INSERT INTO studentinfo 
    (student_id, name, phone_no, email, school_name, board, standard_id, medium) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  connection.query(
    studentQuery,
    [student_id, name, phone_no, email, school_name, board, standard_id, medium],
    (err, result) => {
      if (err) {
        console.error("Database error while inserting student:", err.message);
        return res.status(500).send(`Database error: ${err.message}`);
      }
      const insertedStudentId = result.insertId;
      console.log("Inserted student ID:", insertedStudentId);

      if (Array.isArray(subjects) && subjects.length > 0) {
        const subjectRecords = subjects.map((subjectId) => [insertedStudentId, subjectId]);

        const subjectQuery = `
          INSERT INTO StudentSubjects (student_id, subject_id) VALUES ?
        `;

        connection.query(subjectQuery, [subjectRecords], (err) => {
          if (err) {
            console.error("Database error while inserting subjects:", err.message);
            return res.status(500).send(`Database error: ${err.message}`);
          }

          res.status(201).json({
            message: "Student and subjects added successfully!",
            studentId: insertedStudentId,
          });
        });
      } else {
        res.status(201).json({
          message: "Student added successfully without subjects!",
          studentId: insertedStudentId,
        });
      }
    }
  );
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
app.get('/student-count/:subjectId', (req, res) => {
  const { subjectId } = req.params;

  const query = 'SELECT COUNT(*) AS count FROM studentinfo WHERE subject_id = ?';

  connection.query(query, [subjectId], (err, results) => {
    if (err) {
      console.error('Error querying student count:', err.stack);
      return res.status(500).send('Error querying the database');
    }

    const count = results[0]?.count || 0; // Extract count from query result
    res.json({ count });  // Send the count as a JSON response
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




app.get('/get-students/:facultyId/:subjectId', (req, res) => {
  const { facultyId, subjectId } = req.params;

  console.log('Received facultyId:', facultyId);
  console.log('Received subjectId:', subjectId);

  const query = `
  SELECT 
    si.name AS student_name,
    ef.remaining_amount
  FROM 
    StudentInfo si
  JOIN 
    SubMaster sm ON si.subject_id = sm.id
  JOIN 
    ExternalFaculty ef ON sm.subject_name = ef.faculty_subject
  WHERE 
    ef.id = ? 
`;

  console.log("Executing query:", query);
  console.log("With parameters:", [facultyId, subjectId]);

  connection.query(query, [facultyId, subjectId], (err, results) => {
    if (err) {
      console.error('Error fetching student data:', err);
      return res.status(500).json({ message: 'Failed to fetch student data' });
    }

    console.log('Query Results:', results); // Log the query results
    res.json(results); // Send only student names
  });
});

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

app.get("/paymentinfo", (req, res) => {
  res.json({ message: "Payment info page" });
});

app.post("/paymentinfo", (req, res) => {
  const { student_id, total_amt, remaining_amt, amt_paid, payment_mode, cheque_no, trans_id, date } = req.body;

  if (!student_id || !total_amt || !remaining_amt || !amt_paid || !payment_mode || !date) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  const query = `
    INSERT INTO student_payments (student_id, total_amt, remaining_amt, amt_paid, payment_mode, cheque_no, trans_id, date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  connection.query(
    query,
    [student_id, total_amt, remaining_amt, amt_paid, payment_mode, cheque_no || null, trans_id || null, date],
    (err) => {
      if (err) {
        console.error("Error inserting payment data:", err);
        return res.status(500).json({ error: "Failed to insert payment data." });
      }
      res.status(201).json({ message: "Payment information saved successfully!" });
    }
  );
});

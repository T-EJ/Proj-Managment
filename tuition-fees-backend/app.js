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
  console.log("Request received:", req.body); // Debugging

  const {
    name,
    phone_no,
    email,
    school_name,
    board,
    standard_id,
    subject_id,
    medium,
    discount = 0.0,
    total_fees,
    shift,
    reference = null,
    paid_amount = 0.0,
    remaining_amount,
    fees_date,
    due_date,
    payment_mode,
    transaction_id = null,
    academic_year,
  } = req.body;

  // Validate required fields
  if (
    !name || !phone_no || !email || !school_name || !board || !medium || 
    !total_fees || !remaining_amount || !fees_date || !due_date || 
    !payment_mode || !academic_year
  ) {
    console.error("Validation failed: Missing required fields");
    return res.status(400).send("Missing required fields");
  }

  const query = `
    INSERT INTO studentinfo 
    (name, phone_no, email, school_name, board, standard_id, subject_id, medium, discount, total_fees, shift, reference, paid_amount, remaining_amount, fees_date, due_date, payment_mode, transaction_id, academic_year) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  connection.query(
    query,
    [
      name,
      phone_no,
      email,
      school_name,
      board,
      standard_id,
      subject_id,
      medium,
      discount,
      total_fees,
      shift,
      reference,
      paid_amount,
      remaining_amount,
      fees_date,
      due_date,
      payment_mode,
      transaction_id,
      academic_year,
    ],
    (err, result) => {
      if (err) {
        console.error("Database error:", err.message);
        return res.status(500).send(`Database error: ${err.message}`);
      }
      res.status(200).send("Student data inserted successfully");
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
  console.log(`Server is running on port ${PORT}`);
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

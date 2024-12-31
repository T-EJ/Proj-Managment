const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
const port = 3001;

// Enable CORS
app.use(cors());
app.use(express.json());

// MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root", 
  password: "password", 
  database: "faculty_db",
});

db.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL database.");
});

// Add Faculty
app.post("/add-faculty", (req, res) => {
  const {
    faculty_name,
    faculty_subject,
    student_count,
    total_fees,
    payable_fees,
    paid_amount,
    remaining_amount,
  } = req.body;

  const query =
    "INSERT INTO faculty (faculty_name, faculty_subject, student_count, total_fees, payable_fees, paid_amount, remaining_amount) VALUES (?, ?, ?, ?, ?, ?, ?)";
  db.query(
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
        console.error("Error inserting data:", err);
        res.status(500).send("Failed to add faculty data.");
      } else {
        res.status(200).send("Faculty data added successfully!");
      }
    }
  );
});

// Get Faculty
app.get("/get-faculty", (req, res) => {
  db.query("SELECT * FROM faculty", (err, results) => {
    if (err) {
      console.error("Error fetching faculty data:", err);
      res.status(500).send("Failed to fetch faculty data.");
    } else {
      res.status(200).json(results);
    }
  });
});

// Delete Faculty
app.delete("/delete-faculty/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM faculty WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error("Error deleting faculty data:", err);
      res.status(500).send("Failed to delete faculty data.");
    } else {
      res.status(200).send("Faculty data deleted successfully.");
    }
  });
});

// Fetch Students
app.get("/fetch-students/:subjectId", (req, res) => {
  const { subjectId } = req.params;
  db.query("SELECT * FROM students WHERE subject_id = ?", [subjectId], (err, results) => {
    if (err) {
      console.error("Error fetching students:", err);
      res.status(500).send("Failed to fetch students.");
    } else {
      res.status(200).json(results);
    }
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

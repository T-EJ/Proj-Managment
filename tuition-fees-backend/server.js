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






const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const PDFDocument = require("pdfkit");
const cors = require("cors");
const fs = require("fs");

// const app = express();
// app.use(bodyParser.json());
// app.use(cors());

// // Database connection
// const db = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "", // Replace with your database password
//   database: "your_database_name", // Replace with your database name
// });

// API endpoint to save payment info
// app.post("/paymentinfo", (req, res) => {
//   const { student_id, total_amt, remaining_amt, amt_paid, payment_mode, cheque_no, trans_id, date } = req.body;

//   const query = `
//     INSERT INTO student_payments (student_id, total_amt, remaining_amt, amt_paid, payment_mode, cheque_no, trans_id, date)
//     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

//   db.query(query, [student_id, total_amt, remaining_amt, amt_paid, payment_mode, cheque_no, trans_id, date], (err, results) => {
//     if (err) {
//       console.error("Error inserting payment info:", err);
//       return res.status(500).json({ error: "Failed to save payment information." });
//     } else {
//       res.status(200).json({ message: "Payment information saved successfully!" });
//     }
//   });
// });

const cors = require('cors');
app.use(cors());


const PDFDocument = require("pdfkit");
const fs = require("fs");
app.get("/generateReceipt", (req, res) => {
  const student_id = req.query.student_id;

  const query = `
    SELECT si.name, si.standard_id, si.subject_id, si.medium,
           sp.total_amt, sp.remaining_amt, sp.amt_paid, sp.payment_mode, sp.cheque_no, sp.trans_id, sp.date
    FROM studentinfo si
    INNER JOIN student_payments sp ON si.id = sp.student_id
    WHERE si.id = ?`;

  db.query(query, [student_id], (err, results) => {
    if (err || results.length === 0) {
      console.error(err || "No student found.");
      res.status(500).json({ error: "Failed to generate receipt." });
    } else {
      const student = results[0];
      const doc = new PDFDocument();
      const filePath = `Receipt_${student_id}.pdf`;

      doc.pipe(fs.createWriteStream(filePath));
      doc.pipe(res);

      // Receipt Header
      doc.fontSize(18).text("JG Group Tuition", { align: "center", underline: true });
      doc.fontSize(12).text("LET YOUR CHILD GROW", { align: "center" });
      doc.text("104, Aishwarya Complex, Maninagar, Ahmedabad-380008", { align: "center" });
      doc.moveDown(1);

      // Receipt Details
      doc.text(`Receipt No.: ${Math.floor(Math.random() * 1000)}`, { continued: true });
      doc.text(`Date: ${student.date}`, { align: "right" });

      // Student Information
      doc.moveDown(1);
      doc.text(`Received with thanks from: ${student.name}`);
      doc.text(`Std.: ${student.standard_id}`);
      doc.text(`Subject: ${student.subject_id}`);
      doc.moveDown(1);

      // Payment Details
      doc.text(`The sum of Rupees: ${toWords(student.amt_paid)} only.`);
      doc.text(`By Cash/Cheque/Online/Draft: ${student.payment_mode}`);
      if (student.payment_mode === "Cheque") {
        doc.text(`Cheque No.: ${student.cheque_no}`);
      }
      if (student.payment_mode === "Online") {
        doc.text(`Transaction ID: ${student.trans_id}`);
      }
      doc.text(`Amount (in numbers): Rs. ${student.amt_paid}/-`, { continued: true });
      doc.text(`Remaining Amount: Rs. ${student.remaining_amt}/-`, { align: "right" });

      // Footer
      doc.moveDown(2);
      doc.text("Receiver's Sign", { align: "right" });
      doc.end();
    }
  });
});

// Utility function to convert numbers to words
function toWords(num) {
  const ones = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", 
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", 
    "Eighteen", "Nineteen",
  ];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  if (num < 20) return ones[num];
  if (num < 100) return `${tens[Math.floor(num / 10)]} ${ones[num % 10]}`;
  if (num < 1000) return `${ones[Math.floor(num / 100)]} Hundred ${toWords(num % 100)}`;
  return `${toWords(Math.floor(num / 1000))} Thousand ${toWords(num % 1000)}`;
}

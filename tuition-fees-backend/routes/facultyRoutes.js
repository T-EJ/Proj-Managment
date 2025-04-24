const express = require('express');
const router = express.Router(); // Define the router
const connection = require('../db'); // Import the MySQL connection

// In routes/facultyRoutes.js (your Express route handler)
router.post('/faculties', (req, res) => {
    const { faculty_name, faculty_subject, student_count, total_fees, payable_fees, paid_amount, remaining_amount } = req.body;

    console.log('Received data:', req.body); // Debugging

    if (!faculty_name || !faculty_subject || !student_count || !total_fees || !payable_fees || !remaining_amount) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    const query = `
        INSERT INTO faculty_data 
        (faculty_name, faculty_subject, student_count, total_fees, payable_fees, paid_amount, remaining_amount) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    connection.query(
        query,
        [faculty_name, faculty_subject, student_count, total_fees, payable_fees, paid_amount || 0.0, remaining_amount],
        (err, result) => {
            if (err) {
                console.error('Error inserting faculty:', err.message);
                return res.status(500).json({ message: 'Error inserting data' });
            }
            console.log('Insert successful, result:', result); // Debugging
            res.status(201).json({ message: 'Faculty added successfully', id: result.insertId });
        }
    );
});

router.put("/faculties/:id", async (req, res) => {
    const { id } = req.params;
    const { faculty_name, faculty_subject, student_count, total_fees, payable_fees, paid_amount, remaining_amount } = req.body;
  
    try {
      // Fetch the current faculty data before updating
      const [currentData] = await connection.promise().query(
        "SELECT * FROM faculty_data WHERE id = ?",
        [id]
      );
  
      if (currentData.length === 0) {
        return res.status(404).json({ message: "Faculty not found" });
      }
  
      const { faculty_name: currentName, paid_amount: currentPaid, remaining_amount: currentRemaining } = currentData[0];
  
      // Log the current data into the payment history table
      const paymentDate = new Date();
      await connection.promise().query(
        `
        INSERT INTO faculty_payment_history (faculty_id, faculty_name, paid_amount, remaining_amount, payment_date)
        VALUES (?, ?, ?, ?, ?)
        `,
        [id, currentName, currentPaid, currentRemaining, paymentDate]
      );
  
      // Update the faculty data
      await connection.promise().query(
        `
        UPDATE faculty_data
        SET faculty_name = ?, faculty_subject = ?, student_count = ?, total_fees = ?, payable_fees = ?, paid_amount = ?, remaining_amount = ?
        WHERE id = ?
        `,
        [faculty_name, faculty_subject, student_count, total_fees, payable_fees, paid_amount, remaining_amount, id]
      );
  
      res.status(200).json({ message: "Faculty updated successfully" });
    } catch (error) {
      console.error("Error updating faculty:", error);
      res.status(500).json({ error: "Failed to update faculty" });
    }
  });

router.post("/log-payment-history/:id", async (req, res) => {
    const { id } = req.params;
    const { faculty_name, paid_amount, remaining_amount } = req.body;

    try {
        const paymentDate = new Date(); // Current date and time
        const query = `
            INSERT INTO faculty_payment_history (faculty_id, faculty_name, paid_amount, remaining_amount, payment_date)
            VALUES (?, ?, ?, ?, ?)
        `;
        const values = [id, faculty_name, paid_amount, remaining_amount, paymentDate];

        await connection.promise().query(query, values); // Use connection.promise()
        res.status(200).json({ message: "Payment history logged successfully!" });
    } catch (error) {
        console.error("Error logging payment history:", error.stack); // Log the full error stack
        res.status(500).json({ error: "Failed to log payment history." });
    }
});
  
  module.exports = router;
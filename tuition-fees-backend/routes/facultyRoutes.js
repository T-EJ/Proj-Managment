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

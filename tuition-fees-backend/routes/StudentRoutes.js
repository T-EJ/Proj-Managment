const express = require('express');
const router = express.Router();
const StudentInfo = require('../models/StudentInfo');

// Get all students
router.get('/students', async (req, res) => {
    try {
        const students = await StudentInfo.find().populate('standard subject');
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a specific student by ID
router.get('/students/:id', async (req, res) => {
    try {
        const student = await StudentInfo.findById(req.params.id).populate('standard subject');
        if (student) {
            res.json(student);
        } else {
            res.status(404).json({ message: 'Student not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get student count based on subject
router.get('/student-count/:subjectId', async (req, res) => {
    const { subjectId } = req.params;

    try {
        const studentCount = await StudentInfo.countDocuments({ subject: subjectId });
        res.status(200).json({ count: studentCount });
    } catch (error) {
        console.error("Error fetching student count:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;

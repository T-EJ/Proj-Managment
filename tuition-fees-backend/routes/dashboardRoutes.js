const express = require('express');
const router = express.Router();
const StudentInfo = require('../models/StudentInfo');
const ExternalFaculty = require('../models/ExternalFaculty');

router.get('/dashboard', async (req, res) => {
    try {
        const students = await StudentInfo.countDocuments();
        const faculties = await ExternalFaculty.countDocuments();
        const total_fees = await StudentInfo.aggregate([{ $group: { _id: null, total: { $sum: '$total_fees' } } }]);
        const total_paid = await StudentInfo.aggregate([{ $group: { _id: null, total: { $sum: '$paid_amount' } } }]);
        const total_remaining = await StudentInfo.aggregate([{ $group: { _id: null, total: { $sum: '$remaining_amount' } } }]);

        res.json({
            total_students: students,
            total_faculties: faculties,
            total_fees: total_fees[0] ? total_fees[0].total : 0,
            total_paid: total_paid[0] ? total_paid[0].total : 0,
            total_remaining: total_remaining[0] ? total_remaining[0].total : 0,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;

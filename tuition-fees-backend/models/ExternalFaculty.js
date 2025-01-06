const mongoose = require('mongoose');

const externalFacultySchema = new mongoose.Schema({
    faculty_name: { type: String, required: true },
    faculty_subject: { type: String, required: true },
    student_count: { type: Number, required: true },
    total_fees: { type: Number, required: true },
    payable_fees: { type: Number, required: true },
    paid_amount: { type: Number, default: 0.0 },
    remaining_amount: { type: Number, required: true }
});

module.exports = mongoose.model('ExternalFaculty', externalFacultySchema);

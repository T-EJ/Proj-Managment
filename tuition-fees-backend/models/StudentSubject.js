const mongoose = require('mongoose');

const StudentSubjectsSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentInfo', required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'SubMaster', required: true }
});

module.exports = mongoose.model('StudentSubjects', StudentSubjectsSchema);
const mongoose = require('mongoose');

const stdMasterSchema = new mongoose.Schema({
    standard_name: { type: String, required: true },
    academic_year: { type: String, required: true }
});

module.exports = mongoose.model('StdMaster', stdMasterSchema);

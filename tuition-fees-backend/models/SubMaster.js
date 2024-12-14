const mongoose = require('mongoose');

const subMasterSchema = new mongoose.Schema({
    subject_name: { type: String, required: true },
    fee_amount: { type: Number, required: true }
});

module.exports = mongoose.model('SubMaster', subMasterSchema);

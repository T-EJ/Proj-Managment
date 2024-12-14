const mongoose = require('mongoose');

const studentInfoSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone_no: { type: String, required: true },
    email: { type: String, required: true },
    school_name: { type: String, required: true },
    board: { type: String, required: true },
    standard: { type: mongoose.Schema.Types.ObjectId, ref: 'StdMaster', required: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'SubMaster', required: true },
    medium: { type: String, required: true },
    discount: { type: Number, default: 0.0 },
    total_fees: { type: Number, required: true },
    shift: { type: String, enum: ['Morning', 'Evening'], required: true },
    reference: { type: String, default: '' },
    paid_amount: { type: Number, default: 0.0 },
    remaining_amount: { type: Number, required: true },
    fees_date: { type: Date, default: Date.now },
    due_date: { type: Date, required: true },
    payment_mode: { type: String, enum: ['Cash', 'UPI', 'Card'], required: true },
    transaction_id: { type: String, default: '' }
});

module.exports = mongoose.model('StudentInfo', studentInfoSchema);

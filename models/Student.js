const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    rollNumber: { type: String, required: true },
    // Update tenantId to institute
    institute: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Institute',
        required: true,
        index: true
    },
    course: { type: String, required: true },
    session: { type: String, required: true },
    feesPaid: { type: Boolean, default: false }
});

module.exports = mongoose.model('Student', studentSchema);
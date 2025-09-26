const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true },
    institute: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Institute',
        required: true,
        index: true
    },
    // Add this teacher field
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // It refers to the User model
        required: false // A course might exist before a teacher is assigned
    }
});

module.exports = mongoose.model('Course', courseSchema);
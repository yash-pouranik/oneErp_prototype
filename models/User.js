const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    // Replace tenantId string with a proper database reference
    institute: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Institute', // This links to the Institute model
        required: true
    },
    role: {
        type: String,
        enum: ['institute_admin', 'super_admin'], // Defines user permissions
        required: true
    }
});

// Password hashing pre-save hook remains the same
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

module.exports = mongoose.model('User', userSchema);
const mongoose = require('mongoose');
const instituteSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    subdomain: { type: String, required: true, unique: true, lowercase: true },
    status: { type: String, enum: ['pending', 'active', 'suspended'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Institute', instituteSchema);
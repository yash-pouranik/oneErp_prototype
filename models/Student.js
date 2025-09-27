const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');


const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    rollNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    enrollmentNumber: {
      type: String,
      unique: true,
      sparse: true, // optional if not all students have this
    },
    institute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institute",
      required: true,
      index: true,
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    department: {
      type: String,
    },
    session: {
      type: String,
      required: true, // e.g. "2024-2028"
    },
    session: {
      type: String,
      required: true, // e.g. "2024-2028"
    },
    currentSemester: { // Changed from 'year' to 'currentSemester'
      type: Number, 
      required: true
    },
    section: {
      type: String, // e.g. "A", "B"
    },
    dob: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
        type: String,
        required: true
    },
    phone: {
      type: String,
    },
    address: {
      type: String,
    },
    guardianName: {
      type: String,
    },
    guardianContact: {
      type: String,
    },
    feesPaid: {
      type: Boolean,
      default: false,
    },
    admissionDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["active", "graduated", "left", "suspended"],
      default: "active",
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

studentSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});


module.exports = mongoose.model("Student", studentSchema);
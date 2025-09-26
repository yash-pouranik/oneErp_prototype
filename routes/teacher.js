const express = require('express');
const { isLoggedIn } = require('../middleware/auth');
const Subject = require('../models/Subject'); // Use Subject model
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const router = express.Router();

router.use(isLoggedIn);

router.get('/dashboard', async (req, res) => {
    const mySubjects = await Subject.find({ teacher: req.session.userId }).populate('course');
    res.render('teacher-dashboard', { mySubjects });
});

// --- Attendance Management ---
router.get('/attendance', async (req, res) => {
    const mySubjects = await Subject.find({ teacher: req.session.userId }).populate('course');
    res.render('attendance-select-subject', { mySubjects });
});

router.get('/attendance/:subjectId', async (req, res) => {
    const subject = await Subject.findById(req.params.subjectId).populate('course');
    
    // Find students who are in the same course AND the same semester as the subject
    const students = await Student.find({
        institute: req.session.instituteId,
        course: subject.course._id,
        currentSemester: subject.semester // This is the crucial matching condition
    });
    
    res.render('take-attendance', { subject, students });
});

router.post('/attendance/:subjectId', async (req, res) => {
    const { subjectId } = req.params;
    const { date, attendance } = req.body;
    const subject = await Subject.findById(subjectId);

    for (const studentId in attendance) {
        await Attendance.updateOne(
            { student: studentId, course: subject.course, date: new Date(date) }, // Store main course ID
            { $set: { status: attendance[studentId], teacher: req.session.userId, institute: req.session.instituteId } },
            { upsert: true }
        );
    }
    res.redirect('/teacher/attendance');
});

module.exports = router;
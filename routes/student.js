const express = require('express');
const { isLoggedIn } = require('../middleware/auth');
const Student = require('../models/Student');
const Subject = require('../models/Subject');
const Attendance = require('../models/Attendance');
const router = express.Router();

router.use(isLoggedIn);

router.get('/dashboard', async (req, res) => {
    // Get student's details
    const student = await Student.findById(req.session.userId).populate("course");

    // Find subjects for the student's course and semester
    const subjects = await Subject.find({
        course: student.course._id,
        semester: student.currentSemester
    });
    

    // Calculate attendance for each subject
    const attendanceSummary = await Promise.all(subjects.map(async (subject) => {
        const totalClasses = await Attendance.countDocuments({ student: student._id, course: subject.course });
        const presentClasses = await Attendance.countDocuments({ student: student._id, course: subject.course, status: 'Present' });
        const percentage = totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 0;
        return {
            subjectName: subject.name,
            total: totalClasses,
            present: presentClasses,
            percentage: percentage.toFixed(2)
        };
    }));

    res.render('student-dashboard', { student, attendanceSummary });
});

module.exports = router;
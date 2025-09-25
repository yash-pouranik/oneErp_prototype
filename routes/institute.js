const express = require('express');
const { isLoggedIn, isInstituteAdmin } = require('../middleware/auth');
const Student = require('../models/Student');
const router = express.Router();

// Protect all routes in this file
router.use(isLoggedIn, isInstituteAdmin);

// GET /dashboard
router.get('/', async (req, res) => {
    const students = await Student.find({ institute: req.session.instituteId });

    const studentsByCourseAndSession = students.reduce((acc, student) => {
        const { course, session } = student;
        if (!acc[course]) {
            acc[course] = {};
        }
        if (!acc[course][session]) {
            acc[course][session] = [];
        }
        acc[course][session].push(student);
        return acc;
    }, {});

    res.render('dashboard', { students, studentsByCourseAndSession });
});

// POST /dashboard/students
router.post('/students', async (req, res) => {
    const { name, rollNumber, course, session, feesPaid } = req.body;
    const newStudent = new Student({
        name,
        rollNumber,
        institute: req.session.instituteId, // Link student to the admin's institute
        course,
        session,
        feesPaid: feesPaid === 'on'
    });
    await newStudent.save();
    res.redirect('/dashboard');
});

module.exports = router;
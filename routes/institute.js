const express = require('express');
const { isLoggedIn, isInstituteAdmin } = require('../middleware/auth');
const Student = require('../models/Student');
const router = express.Router();

// Protect all routes in this file
router.use(isLoggedIn, isInstituteAdmin);

// GET /dashboard
router.get('/', async (req, res) => {
    const students = await Student.find({ institute: req.session.instituteId });
    res.render('dashboard', { students });
});

// POST /dashboard/students
router.post('/students', async (req, res) => {
    const { name, rollNumber } = req.body;
    const newStudent = new Student({
        name,
        rollNumber,
        institute: req.session.instituteId // Link student to the admin's institute
    });
    await newStudent.save();
    res.redirect('/dashboard');
});

module.exports = router;
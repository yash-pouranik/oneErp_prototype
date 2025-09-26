const express = require('express');
const { isLoggedIn, isInstituteAdmin } = require('../middleware/auth');
const Student = require('../models/Student');
const Course = require('../models/Course');
const User = require('../models/User');
const router = express.Router();

router.use(isLoggedIn, isInstituteAdmin);

router.get('/', async (req, res) => {
    const students = await Student.find({ institute: req.session.instituteId });
    res.render('dashboard', { students });
});

router.get('/students', async (req, res) => {
    res.redirect("/dashboard");
})


router.post('/students', async (req, res) => {
    const { name, rollNumber, course, session, feesPaid } = req.body;
    await new Student({
        name,
        rollNumber,
        course,
        session,
        feesPaid: feesPaid === 'on',
        institute: req.session.instituteId
    }).save();
    res.redirect('/dashboard');
});

// --- Course Management ---
router.get('/courses', async (req, res) => {
    // We need to fetch both courses and teachers
    const courses = await Course.find({ institute: req.session.instituteId }).populate('teacher');
    const teachers = await User.find({ institute: req.session.instituteId, role: 'teacher' });
    res.render('courses', { courses, teachers });
});

router.post('/courses', async (req, res) => {
    const { name, code } = req.body;
    await new Course({
        name,
        code,
        institute: req.session.instituteId
    }).save();
    res.redirect('/dashboard/courses');
});

// New route to handle the assignment
router.post('/courses/assign-teacher', async (req, res) => {
    const { courseId, teacherId } = req.body;
    await Course.findByIdAndUpdate(courseId, { teacher: teacherId });
    res.redirect('/dashboard/courses');
});


// --- Teacher Management ---
router.get('/teachers', async (req, res) => {
    const teachers = await User.find({ institute: req.session.instituteId, role: 'teacher' });
    res.render('teachers', { teachers });
});

router.post('/teachers', async (req, res) => {
    const { name, email, password } = req.body;
    await new User({
        name,
        email,
        password,
        role: 'teacher',
        institute: req.session.instituteId
    }).save();
    res.redirect('/dashboard/teachers');
});

module.exports = router;
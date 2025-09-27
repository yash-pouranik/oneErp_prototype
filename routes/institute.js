const express = require('express');
const mongoose = require('mongoose');
const { isLoggedIn, isInstituteAdmin } = require('../middleware/auth');
const Student = require('../models/Student');
const Subject = require('../models/Subject');
const Course = require('../models/Course');
const User = require('../models/User');
const router = express.Router();

router.use(isLoggedIn, isInstituteAdmin);

router.get('/', async (req, res) => {
    try {
        const instituteId = req.session.instituteId;

        // Perform all analytics queries
        const totalStudents = await Student.countDocuments({ institute: instituteId });
        const feesPaidCount = await Student.countDocuments({ institute: instituteId, feesPaid: true });

        const studentsByCourse = await Student.aggregate([
            { $match: { institute: new mongoose.Types.ObjectId(instituteId) } },
            { $group: { _id: '$course', count: { $sum: 1 } } }
        ]);

        const studentsBySession = await Student.aggregate([
            { $match: { institute: new mongoose.Types.ObjectId(instituteId) } },
            { $group: { _id: '$session', count: { $sum: 1 } } }
        ]);

        res.render('dashboard', {
            totalStudents,
            feesPaidCount,
            studentsByCourse,
            studentsBySession
        });
    } catch (error) {
        console.error("Dashboard Error:", error);
        res.status(500).send("Error loading dashboard data.");
    }
});


router.get('/subjects', async (req, res) => {
    const subjects = await Subject.find({ institute: req.session.instituteId }).populate('course').populate('teacher');
    const courses = await Course.find({ institute: req.session.instituteId });
    const teachers = await User.find({ institute: req.session.instituteId, role: 'teacher' });
    res.render('subjects', { subjects, courses, teachers });
});

router.post('/subjects', async (req, res) => {
    const { name, code, course, year , semester} = req.body;
    await new Subject({
        name,
        code,
        course,
        year,
        semester,
        institute: req.session.instituteId
    }).save();
    res.redirect('/dashboard/subjects');
});

router.post('/subjects/assign-teacher', async (req, res) => {
    const { subjectId, teacherId } = req.body;
    await Subject.findByIdAndUpdate(subjectId, { teacher: teacherId });
    res.redirect('/dashboard/subjects');
});









router.get('/students', async (req, res) => {
    const students = await Student.find({ institute: req.session.instituteId });
    res.render('students', { students });
});

router.get('/students/add', async (req, res) => {
    // Fetch the list of courses for the dropdown menu
    const courses = await Course.find({ institute: req.session.instituteId });
    console.log(courses, req.session.instituteId)
    res.render('add-student', { courses }); // Pass courses to the EJS file
});

router.post('/students/add', async (req, res) => {
    // Create a new student object from the request body
    const studentData = { ...req.body, institute: req.session.instituteId };
    studentData.feesPaid = req.body.feesPaid === 'on'; // Handle checkbox
    await new Student(studentData).save();
    res.redirect('/dashboard/students');
});

router.get('/students/:id/edit', async (req, res) => {
    const student = await Student.findById(req.params.id);
    res.render('edit-student', { student });
});

router.post('/students/:id/edit', async (req, res) => {
    const studentData = { ...req.body };
    studentData.feesPaid = req.body.feesPaid === 'on';
    await Student.findByIdAndUpdate(req.params.id, studentData);
    res.redirect('/dashboard/students');
});

router.post('/students/:id/delete', async (req, res) => {
    await Student.findByIdAndDelete(req.params.id);
    res.redirect('/dashboard/students');
});

// --- Course Management ---
router.get('/courses', async (req, res) => {
    console.log(req.session.instituteId);
    // We need to fetch both courses and teachers
    const courses = await Course.find({ institute: req.session.instituteId });
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
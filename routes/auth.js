const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Institute = require('../models/Institute');
const Student = require('../models/Student'); // Import Student model

const router = express.Router();
router.get('/', (req, res) => {
    res.render('landing');
});

router.get('/login', (req, res) => res.render('login', { error: null }));

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // 1. Check if it's an Admin or Teacher
        let user = await User.findOne({ email }).populate('institute');
        
        if (user) {
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.render('login', { error: 'Invalid credentials.' });
            }

            // **BUG FIX:** Check if the institute is active before creating a session
            if (user.role !== 'super_admin' && user.institute.status !== 'active') {
                return res.render('login', { error: 'Your institute has not been approved yet. Please wait for approval.' });
            }

            // --- If password is correct and institute is active, create session ---
            req.session.userId = user._id;
            req.session.role = user.role;
            req.session.userName = user.name;
            req.session.instituteId = user.institute._id;
            req.session.instituteName = user.institute.name;
            
            if (user.role === 'super_admin') return res.redirect('/super-admin/dashboard');
            if (user.role === 'institute_admin') return res.redirect('/dashboard');
            if (user.role === 'teacher') return res.redirect('/teacher/dashboard');
        }

        // 2. If not an admin/teacher, check if it's a Student
        let student = await Student.findOne({ email }).populate('institute');
        if (student) {
            const isMatch = await bcrypt.compare(password, student.password);
            if (!isMatch) return res.render('login', { error: 'Invalid credentials.' });

            // **BUG FIX:** Also check if student's institute is active
            if (student.institute.status !== 'active') {
                return res.render('login', { error: 'Your institute has not been approved yet. Please wait for approval.' });
            }

            // Create session for the student
            req.session.userId = student._id;
            req.session.role = 'student'; // Set role manually
            req.session.userName = student.name;
            req.session.instituteId = student.institute._id;
            req.session.instituteName = student.institute.name;

            return res.redirect('/student/dashboard');
        }

        // 3. If no user or student found at all
        return res.render('login', { error: 'Invalid credentials.' });

    } catch (error) {
        console.log(error);
        res.render('login', { error: 'An error occurred.' });
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/login'));
});

router.get('/signup', (req, res) => res.render('signup', { error: null }));

router.post('/signup', async (req, res) => {
    try {
        // Destructure all fields from the form body
        const { instituteName, subdomain, adminName, email, password } = req.body;
        
        const existingInstitute = await Institute.findOne({ subdomain });
        const existingUser = await User.findOne({ email });
        if (existingInstitute || existingUser) {
            return res.render('signup', { error: 'Subdomain or email already in use.' });
        }

        const newInstitute = new Institute({ name: instituteName, subdomain });
        await newInstitute.save();

        const newAdmin = new User({
            name: adminName, // Use the new adminName field here
            email,
            password,
            institute: newInstitute._id,
            role: 'institute_admin'
        });
        await newAdmin.save();
        
        res.render('thank-you');
    } catch (error) {
        res.render('signup', { error: 'Failed to register. Please try again.' });
    }
});

module.exports = router;
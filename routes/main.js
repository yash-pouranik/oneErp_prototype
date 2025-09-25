const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Student = require('../models/Student');
const router = express.Router();

// Middleware to check if the user is logged in
const isLoggedIn = (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    next();
};

// --- Page Routes ---
router.get('/', (req, res) => {
    res.redirect('/login');
});

router.get('/login', (req, res) => {
    res.render('login', { error: null });
});

router.get('/dashboard', isLoggedIn, async (req, res) => {
    try {
        const tenantId = req.session.tenantId;
        const students = await Student.find({ tenantId: tenantId });
        res.render('dashboard', {
            collegeName: tenantId,
            students: students
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error fetching dashboard data.");
    }
});

// --- Authentication Routes ---
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.render('login', { error: 'Invalid email or password.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render('login', { error: 'Invalid email or password.' });
        }

        // Set session variables
        req.session.userId = user._id;
        req.session.tenantId = user.tenantId;

        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        res.render('login', { error: 'An error occurred. Please try again.' });
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/dashboard');
        }
        res.clearCookie('connect.sid'); // Clears the session cookie
        res.redirect('/login');
    });
});

// --- Student Management Route ---
router.post('/students', isLoggedIn, async (req, res) => {
    try {
        const { name, rollNumber } = req.body;
        const tenantId = req.session.tenantId;

        const newStudent = new Student({
            name,
            rollNumber,
            tenantId // Automatically assign the tenantId from the logged-in user's session
        });

        await newStudent.save();
        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        res.status(500).send("Failed to add student.");
    }
});

module.exports = router;
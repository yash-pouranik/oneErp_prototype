const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Institute = require('../models/Institute');
const router = express.Router();

// --- Login / Logout ---
router.get('/login', (req, res) => res.render('login', { error: null }));

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).populate('institute');
        if (!user) return res.render('login', { error: 'Invalid credentials.' });

        // For institute admins, check if their institute is active
        if (user.role === 'institute_admin' && user.institute.status !== 'active') {
            return res.render('login', { error: 'Your institute is not yet approved or has been suspended.' });
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.render('login', { error: 'Invalid credentials.' });

        req.session.userId = user._id;
        req.session.role = user.role;
        req.session.instituteId = user.institute._id;
        req.session.instituteName = user.institute.name;

        if (user.role === 'super_admin') return res.redirect('/super-admin/dashboard');
        if (user.role === 'institute_admin') return res.redirect('/dashboard');
        
    } catch (error) {
        res.render('login', { error: 'An error occurred.' });
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/login'));
});

// --- Institute Signup ---
router.get('/signup', (req, res) => res.render('signup', { error: null }));

router.post('/signup', async (req, res) => {
    try {
        const { instituteName, subdomain, email, password } = req.body;
        
        // Check if subdomain or email already exists
        const existingInstitute = await Institute.findOne({ subdomain });
        const existingUser = await User.findOne({ email });
        if (existingInstitute || existingUser) {
            return res.render('signup', { error: 'Subdomain or email already in use.' });
        }

        // Create new institute (pending) and admin user
        const newInstitute = new Institute({ name: instituteName, subdomain });
        await newInstitute.save();

        const newAdmin = new User({
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
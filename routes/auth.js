const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Institute = require('../models/Institute');
const router = express.Router();

router.get('/login', (req, res) => res.render('login', { error: null }));

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).populate('institute');
        if (!user) return res.render('login', { error: 'Invalid credentials.' });

        if (user.role === 'institute_admin' && user.institute.status !== 'active') {
            return res.render('login', { error: 'Your institute is not yet approved.' });
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.render('login', { error: 'Invalid credentials.' });

        req.session.userId = user._id;
        req.session.role = user.role;
        req.session.instituteId = user.institute._id;
        req.session.instituteName = user.institute.name;
        req.session.userName = user.name;

        if (user.role === 'super_admin') return res.redirect('/super-admin/dashboard');
        if (user.role === 'institute_admin') return res.redirect('/dashboard');
        if (user.role === 'teacher') return res.redirect('/teacher/dashboard'); // Add this line
        
    } catch (error) {
        res.render('login', { error: 'An error occurred.' });
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/login'));
});

router.get('/signup', (req, res) => res.render('signup', { error: null }));

router.post('/signup', async (req, res) => {
    try {
        const { instituteName, subdomain, adminName, email, password } = req.body;
        
        const existingInstitute = await Institute.findOne({ subdomain });
        if (existingInstitute) {
            return res.render('signup', { error: 'Subdomain already in use.' });
        }

        const newInstitute = new Institute({ name: instituteName, subdomain });
        await newInstitute.save();

        const newAdmin = new User({
            name: adminName,
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
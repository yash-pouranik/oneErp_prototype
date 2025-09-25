const express = require('express');
const { isLoggedIn, isSuperAdmin } = require('../middleware/auth');
const Institute = require('../models/Institute');
const router = express.Router();

// Protect all routes in this file
router.use(isLoggedIn, isSuperAdmin);

// GET /super-admin/dashboard
router.get('/dashboard', async (req, res) => {
    const pendingInstitutes = await Institute.find({ status: 'pending' });
    res.render('super-admin-dashboard', { institutes: pendingInstitutes });
});

// POST /super-admin/approve/:id
router.post('/approve/:id', async (req, res) => {
    await Institute.findByIdAndUpdate(req.params.id, { status: 'active' });
    res.redirect('/super-admin/dashboard');
});

module.exports = router;
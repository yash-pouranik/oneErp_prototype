const express = require('express');
const { isLoggedIn } = require('../middleware/auth');
const Course = require('../models/Course'); // Import the Course model
const router = express.Router();

router.use(isLoggedIn);

router.get('/dashboard', async (req, res) => {
    // Find courses where the teacher field matches the logged-in user's ID
    const myCourses = await Course.find({ teacher: req.session.userId });
    res.render('teacher-dashboard', { myCourses });
});

module.exports = router;
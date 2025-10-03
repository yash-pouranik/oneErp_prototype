const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const path = require('path');
const flash = require('connect-flash');
require('dotenv').config(); // Load .env variables

const app = express();

// Use Render's port or fallback to 3000 locally
const PORT = process.env.PORT || 3000;

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// Import routes
const authRoutes = require('./routes/auth');
const instituteRoutes = require('./routes/institute');
const superAdminRoutes = require('./routes/superAdmin');
const teacherRoutes = require('./routes/teacher');
const studentRoutes = require('./routes/student');

app.use(express.static('public'));

// --- Database Connection ---
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB connected.'))
    .catch(err => console.error('MongoDB connection error:', err));

// --- Middlewares ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(session({
    secret: process.env.SESSION_SECRET || 'default-secret-key',
    resave: false,
    saveUninitialized: false,
}));

app.use(flash());

// Middleware to pass session data to all views
app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});

// --- Routes ---
app.use('/', authRoutes);
app.use('/dashboard', instituteRoutes);
app.use('/super-admin', superAdminRoutes);
app.use('/teacher', teacherRoutes);
app.use('/student', studentRoutes);

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Run "node setup.js" to create the super admin user.');
});

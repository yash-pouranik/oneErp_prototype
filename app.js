const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const path = require('path');



// Import routes
const authRoutes = require('./routes/auth');
const instituteRoutes = require('./routes/institute');
const superAdminRoutes = require('./routes/superAdmin');

const app = express();
const PORT = 3000;

app.use(express.static('public'));



// --- Database Connection ---
const MONGO_URI = 'mongodb://localhost:27017/one_erp_v2_db';
mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB connected.'))
    .catch(err => console.error('MongoDB connection error:', err));

// --- Middlewares ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'a-much-better-sih-secret-key-for-v2',
    resave: false,
    saveUninitialized: false,
}));

// Middleware to pass session data to all views
app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});

// --- Routes ---
app.use('/', authRoutes);
app.use('/dashboard', instituteRoutes);
app.use('/super-admin', superAdminRoutes);

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Run "node setup.js" to create the super admin user.');
});
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Institute = require('./models/Institute');

const MONGO_URI = process.env.MONGO_URI;

const setup = async () => {
    await mongoose.connect(MONGO_URI);
    console.log('Database connected for setup.');

    try {
        // Clear previous data for a clean slate
        await User.deleteMany({});
        await Institute.deleteMany({});
        
        // 1. Create a "dummy" institute for the super admin
        const adminInstitute = new Institute({
            name: 'Platform Administration',
            subdomain: 'admin',
            status: 'active'
        });
        await adminInstitute.save();
        
        // 2. Create the super admin user
        const superAdmin = new User({
            name: 'Super Admin',
            email: process.env.SUPER_ADMIN_EMAIL,
            password: process.env.SUPER_ADMIN_PASSWORD,
            institute: adminInstitute._id,
            role: 'super_admin'
        });
        await superAdmin.save();

        console.log('✅ Super admin setup complete!');
        console.log(`Email: ${process.env.SUPER_ADMIN_EMAIL}`);
        console.log(`Password: ${process.env.SUPER_ADMIN_PASSWORD}`);

    } catch (error) {
        console.error('Error during setup:', error);
    } finally {
        await mongoose.connection.close();
    }
};

setup();

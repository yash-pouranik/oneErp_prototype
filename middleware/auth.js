exports.isLoggedIn = (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    next();
};

exports.isInstituteAdmin = (req, res, next) => {
    if (req.session.role !== 'institute_admin') {
        return res.status(403).send('Access Denied: You are not an Institute Admin.');
    }
    next();
};

exports.isSuperAdmin = (req, res, next) => {
    if (req.session.role !== 'super_admin') {
        return res.status(403).send('Access Denied: You are not a Super Admin.');
    }
    next();
};
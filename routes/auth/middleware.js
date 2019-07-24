function isAuthenticated() {
    return (req, res, next) => {
        if (req.isAuthenticated()) {
            return next();
        }
        return res.redirect('/console/login');
    };
}

function isAdmin() {
    return (req, res, next) => {
        if (req.isAuthenticated() && req.user != null) {
            if (req.user.admin) {
                return next();
            } else {
                return res.redirect('/console');
            }
        } else {
            return res.redirect('/console');
        }
    }
}

module.exports = { isAuthenticated, isAdmin };
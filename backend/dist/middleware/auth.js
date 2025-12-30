"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = exports.isAuthenticated = void 0;
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated() && req.user) {
        return next();
    }
    res.status(401).json({ error: 'Unauthorized. Please login first.' });
};
exports.isAuthenticated = isAuthenticated;
const isAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user && req.user.role === 'ADMIN') {
        return next();
    }
    res.status(403).json({ error: 'Forbidden. Admin access required.' });
};
exports.isAdmin = isAdmin;
//# sourceMappingURL=auth.js.map
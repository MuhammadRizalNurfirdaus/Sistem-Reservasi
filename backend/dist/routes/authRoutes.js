"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const auth_js_1 = require("../middleware/auth.js");
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Configure Multer
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/avatars';
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'avatar-' + uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path_1.default.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed!'));
    }
});
const router = (0, express_1.Router)();
// Initiate Google OAuth login
router.get('/google', passport_1.default.authenticate('google', {
    scope: ['profile', 'email']
}));
// Register with email/password
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        // Check if user exists
        const existing = await prisma.user.findUnique({
            where: { email }
        });
        if (existing) {
            return res.status(400).json({ error: 'Email already registered' });
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword
            }
        });
        // Login after register
        req.login(user, (err) => {
            if (err)
                throw err;
            res.status(201).json({ user });
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});
// Login with email/password
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt for:', email);
        const user = await prisma.user.findUnique({
            where: { email }
        });
        if (!user) {
            console.log('User not found:', email);
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        if (!user.password) {
            console.log('User has no password set (OAuth user?):', email);
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const isValid = await bcrypt_1.default.compare(password, user.password);
        if (!isValid) {
            console.log('Invalid password for:', email);
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        console.log('Password valid, logging in:', email);
        // Passport login
        req.login(user, (err) => {
            if (err)
                return next(err);
            res.json({ user });
        });
    }
    catch (error) {
        next(error);
    }
});
// Google OAuth callback
router.get('/google/callback', passport_1.default.authenticate('google', {
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed`
}), (req, res) => {
    // Successful authentication
    res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
});
// Get current user
router.get('/me', (req, res) => {
    if (req.isAuthenticated() && req.user) {
        res.json({
            user: {
                id: req.user.id,
                email: req.user.email,
                name: req.user.name,
                avatar: req.user.avatar,
                role: req.user.role
            }
        });
    }
    else {
        res.json({ user: null });
    }
});
// Logout
router.post('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.session.destroy((err) => {
            if (err) {
                console.error('Session destroy error:', err);
            }
            res.clearCookie('connect.sid');
            res.json({ message: 'Logged out successfully' });
        });
    });
});
// Update profile
router.put('/me', auth_js_1.isAuthenticated, upload.single('avatar'), async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Unauthorized' });
        const { name, password, confirmPassword } = req.body;
        const updateData = { name };
        // Password update
        if (password) {
            if (password !== confirmPassword) {
                return res.status(400).json({ error: 'Passwords do not match' });
            }
            updateData.password = await bcrypt_1.default.hash(password, 10);
        }
        // Avatar update
        if (req.file) {
            // Should ideally delete old avatar here but skipping for simplicity
            updateData.avatar = `${process.env.API_URL || 'http://localhost:5000'}/uploads/avatars/${req.file.filename}`;
        }
        const user = await prisma.user.update({
            where: { id: req.user.id },
            data: updateData
        });
        // Update session user
        req.login(user, (err) => {
            if (err)
                console.error('Session update error:', err);
            res.json({
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    avatar: user.avatar,
                    role: user.role
                }
            });
        });
    }
    catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});
exports.default = router;
//# sourceMappingURL=authRoutes.js.map
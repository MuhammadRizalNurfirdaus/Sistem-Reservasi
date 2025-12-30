import passport from 'passport';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { isAuthenticated } from '../middleware/auth.js';
import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/avatars';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed!'));
    }
});

const router = Router();

// Initiate Google OAuth login
router.get('/google',
    passport.authenticate('google', {
        scope: ['profile', 'email']
    })
);

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

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword
            }
        });

        // Login after register
        req.login(user, (err) => {
            if (err) throw err;
            res.status(201).json({ user });
        });
    } catch (error) {
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

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            console.log('Invalid password for:', email);
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        console.log('Password valid, logging in:', email);
        // Passport login
        req.login(user, (err) => {
            if (err) return next(err);
            res.json({ user });
        });
    } catch (error) {
        next(error);
    }
});

// Google OAuth callback
router.get('/google/callback',
    passport.authenticate('google', {
        failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed`
    }),
    (req, res) => {
        // Successful authentication
        res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
    }
);

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
    } else {
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
router.put('/me', isAuthenticated, upload.single('avatar'), async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

        const { name, password, confirmPassword } = req.body;
        const updateData: any = { name };

        // Password update
        if (password) {
            if (password !== confirmPassword) {
                return res.status(400).json({ error: 'Passwords do not match' });
            }
            updateData.password = await bcrypt.hash(password, 10);
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
            if (err) console.error('Session update error:', err);
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

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

export default router;

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// In-memory user store (replace with database in production)
const users = new Map();

// JWT secret (should be in environment variable in production)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Register new user
router.post('/register', async (req, res) => {
    try {
        const { name, phone, password, language = 'en' } = req.body;

        // Validation
        if (!phone || !password) {
            return res.status(400).json({
                success: false,
                message: 'Phone number and password are required'
            });
        }

        // Check if user already exists
        if (users.has(phone)) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this phone number'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = {
            name: name || 'User',
            phone,
            password: hashedPassword,
            language,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
        };

        users.set(phone, user);

        // Generate JWT token
        const token = jwt.sign(
            { phone, name: user.name },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                token,
                user: {
                    name: user.name,
                    phone: user.phone,
                    language: user.language
                }
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Error registering user'
        });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { phone, password } = req.body;

        // Validation
        if (!phone || !password) {
            return res.status(400).json({
                success: false,
                message: 'Phone number and password are required'
            });
        }

        // Check if user exists
        const user = users.get(phone);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Update last login
        user.lastLogin = new Date().toISOString();
        users.set(phone, user);

        // Generate JWT token
        const token = jwt.sign(
            { phone, name: user.name },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: {
                    name: user.name,
                    phone: user.phone,
                    language: user.language
                }
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging in'
        });
    }
});

// Verify token middleware
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'No token provided'
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
};

// Get current user profile
router.get('/me', verifyToken, (req, res) => {
    const user = users.get(req.user.phone);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }

    res.json({
        success: true,
        data: {
            name: user.name,
            phone: user.phone,
            language: user.language,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin
        }
    });
});

module.exports = router;
module.exports.verifyToken = verifyToken;

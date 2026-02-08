const express = require('express');
const router = express.Router();
const { verifyToken } = require('./auth');

// In-memory store for report history
// Structure: Map<phoneNumber, Array<Report>>
const reportHistory = new Map();

// Save a report
router.post('/', verifyToken, (req, res) => {
    try {
        const { phone } = req.user;
        const report = req.body;

        if (!report) {
            return res.status(400).json({
                success: false,
                message: 'Report data is required'
            });
        }

        // Add ID and timestamp if not present
        const reportWithMeta = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            savedAt: new Date().toISOString(),
            ...report
        };

        // Get user's history or initialize it
        if (!reportHistory.has(phone)) {
            reportHistory.set(phone, []);
        }

        const userHistory = reportHistory.get(phone);
        userHistory.unshift(reportWithMeta); // Add to beginning

        // Limit history size (optional, e.g., 50 items)
        if (userHistory.length > 50) {
            userHistory.pop();
        }

        res.status(201).json({
            success: true,
            message: 'Report saved successfully',
            data: reportWithMeta
        });
    } catch (error) {
        console.error('Save report error:', error);
        res.status(500).json({
            success: false,
            message: 'Error saving report'
        });
    }
});

// Get user's history
router.get('/', verifyToken, (req, res) => {
    try {
        const { phone } = req.user;
        const history = reportHistory.get(phone) || [];

        res.json({
            success: true,
            data: history
        });
    } catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching history'
        });
    }
});

// Delete a report
router.delete('/:id', verifyToken, (req, res) => {
    try {
        const { phone } = req.user;
        const { id } = req.params;

        if (!reportHistory.has(phone)) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }

        const userHistory = reportHistory.get(phone);
        const initialLength = userHistory.length;

        // Filter out the report to delete
        const updatedHistory = userHistory.filter(report => report.id !== id);

        if (updatedHistory.length === initialLength) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }

        reportHistory.set(phone, updatedHistory);

        res.json({
            success: true,
            message: 'Report deleted successfully'
        });
    } catch (error) {
        console.error('Delete report error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting report'
        });
    }
});

// Clear all history
router.delete('/', verifyToken, (req, res) => {
    try {
        const { phone } = req.user;
        reportHistory.delete(phone);

        res.json({
            success: true,
            message: 'History cleared successfully'
        });
    } catch (error) {
        console.error('Clear history error:', error);
        res.status(500).json({
            success: false,
            message: 'Error clearing history'
        });
    }
});

module.exports = router;

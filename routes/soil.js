const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Configure multer for soil image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Ensure the directory exists (handled in main server.js or check here)
        cb(null, './uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, 'soil-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only images are allowed'));
    }
});

// Mock database for soil analysis results
const getSoilAnalysis = (language) => {
    const titles = {
        en: { type: 'Loamy Soil', status: 'Healthy' },
        hi: { type: 'दोमट मिट्टी', status: 'स्वस्थ' },
        ta: { type: 'களிமண் சேற்று மண்', status: 'ஆரோக்கியமான' }
    };

    const recommendations = {
        en: ['Add organic compost', 'Maintain pH level between 6.0-7.0', 'Rotate crops annually'],
        hi: ['जैविक खाद डालें', 'पीएच स्तर 6.0-7.0 के बीच रखें', 'सालाना फसल चक्र अपनाएं'],
        ta: ['இயற்கை உரம் சேர்க்கவும்', 'pH அளவை 6.0-7.0 இடையே பராமரிக்கவும்', 'ஆண்டுதோறும் பயிர் சுழற்சி செய்யவும்']
    };

    const selectedTitle = titles[language] || titles.en;
    const selectedRecs = recommendations[language] || recommendations.en;

    return {
        soilType: selectedTitle.type,
        status: selectedTitle.status,
        phLevel: (6.0 + Math.random() * 1.5).toFixed(1),
        nitrogen: 'Medium',
        phosphorus: 'High',
        potassium: 'Medium',
        recommendations: selectedRecs
    };
};

router.post('/analyze', upload.single('image'), (req, res) => {
    try {
        const { language = 'en' } = req.body;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image uploaded'
            });
        }

        // In a real app, we would process the image here with an AI model
        const analysisResult = getSoilAnalysis(language);

        res.json({
            success: true,
            data: {
                ...analysisResult,
                imageUrl: `/uploads/${req.file.filename}`
            }
        });
    } catch (error) {
        console.error('Soil analysis error:', error);
        res.status(500).json({
            success: false,
            message: 'Error analyzing soil'
        });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();

// Mock data for nearby agricultural specialists
const getNearbySpecialists = (language = 'en') => {
    const specialists = [
        {
            id: 1,
            name: language === 'hi' ? 'डॉ. आर. सिंह' : language === 'ta' ? 'டாக்டர் ஆர். சிங்' : 'Dr. R. Singh',
            role: language === 'hi' ? 'कृषि विज्ञानी' : language === 'ta' ? 'வேளாண்மை நிபுணர்' : 'Agronomist',
            distance: '2.5 km',
            phone: '+91-9876543210',
            email: 'r.singh@agri.in',
            specialization: language === 'hi' ? 'फसल रोग प्रबंधन' : language === 'ta' ? 'பயிர் நோய் மேலாண்மை' : 'Crop Disease Management',
            rating: 4.8,
            availability: language === 'hi' ? 'सोम-शुक्र, 9AM-5PM' : language === 'ta' ? 'திங்கள்-வெள்ளி, 9AM-5PM' : 'Mon-Fri, 9AM-5PM',
            lat: 26.8467 + (Math.random() - 0.5) * 0.05,
            lon: 80.9462 + (Math.random() - 0.5) * 0.05
        },
        {
            id: 2,
            name: language === 'hi' ? 'किसान सेवा केंद्र' : language === 'ta' ? 'கிசான் சேவா கேந்திரா' : 'Kisan Seva Kendra',
            role: language === 'hi' ? 'सहायता केंद्र' : language === 'ta' ? 'ஆதரவு மையம்' : 'Support Center',
            distance: '4.0 km',
            phone: '1800-123-456',
            email: 'support@kisanseva.in',
            specialization: language === 'hi' ? 'सामान्य परामर्श और सरकारी योजनाएं' : language === 'ta' ? 'பொது ஆலோசனை மற்றும் அரசு திட்டங்கள்' : 'General Consultation & Govt Schemes',
            rating: 4.5,
            availability: language === 'hi' ? 'प्रतिदिन, 8AM-8PM' : language === 'ta' ? 'தினசரி, 8AM-8PM' : 'Daily, 8AM-8PM',
            lat: 26.8467 + (Math.random() - 0.5) * 0.08,
            lon: 80.9462 + (Math.random() - 0.5) * 0.08
        },
        {
            id: 3,
            name: language === 'hi' ? 'प्रिया पटेल' : language === 'ta' ? 'பிரியா படேல்' : 'Priya Patel',
            role: language === 'hi' ? 'पादप रोग विशेषज्ञ' : language === 'ta' ? 'தாவர நோயியல் நிபுணர்' : 'Plant Pathologist',
            distance: '8.2 km',
            phone: '+91-9988776655',
            email: 'priya.patel@agri.in',
            specialization: language === 'hi' ? 'कीट नियंत्रण और जैविक समाधान' : language === 'ta' ? 'பூச்சி கட்டுப்பாடு மற்றும் கரிம தீர்வுகள்' : 'Pest Control & Organic Solutions',
            rating: 4.9,
            availability: language === 'hi' ? 'मंगल-शनि, 10AM-4PM' : language === 'ta' ? 'செவ்வாய்-சனி, 10AM-4PM' : 'Tue-Sat, 10AM-4PM',
            lat: 26.8467 + (Math.random() - 0.5) * 0.12,
            lon: 80.9462 + (Math.random() - 0.5) * 0.12
        },
        {
            id: 4,
            name: language === 'hi' ? 'ग्राम सहकारी' : language === 'ta' ? 'கிராம கூட்டுறவு' : 'Village Co-op',
            role: language === 'hi' ? 'सामान्य सहायता' : language === 'ta' ? 'பொது ஆதரவு' : 'General Support',
            distance: '1.5 km',
            phone: '+91-9812345678',
            email: 'coop@village.in',
            specialization: language === 'hi' ? 'उपकरण किराया और बीज आपूर्ति' : language === 'ta' ? 'கருவி வாடகை மற்றும் விதை வழங்கல்' : 'Equipment Rental & Seed Supply',
            rating: 4.3,
            availability: language === 'hi' ? 'सोम-शनि, 7AM-7PM' : language === 'ta' ? 'திங்கள்-சனி, 7AM-7PM' : 'Mon-Sat, 7AM-7PM',
            lat: 26.8467 + (Math.random() - 0.5) * 0.03,
            lon: 80.9462 + (Math.random() - 0.5) * 0.03
        },
        {
            id: 5,
            name: language === 'hi' ? 'राज वर्मा' : language === 'ta' ? 'ராஜ் வர்மா' : 'Raj Verma',
            role: language === 'hi' ? 'मिट्टी विशेषज्ञ' : language === 'ta' ? 'மண் நிபுணர்' : 'Soil Specialist',
            distance: '6.5 km',
            phone: '+91-9123456789',
            email: 'raj.verma@soil.in',
            specialization: language === 'hi' ? 'मिट्टी परीक्षण और उर्वरक सिफारिशें' : language === 'ta' ? 'மண் பரிசோதனை மற்றும் உர பரிந்துரைகள்' : 'Soil Testing & Fertilizer Recommendations',
            rating: 4.7,
            availability: language === 'hi' ? 'बुध-रविवार, 9AM-6PM' : language === 'ta' ? 'புதன்-ஞாயிறு, 9AM-6PM' : 'Wed-Sun, 9AM-6PM',
            lat: 26.8467 + (Math.random() - 0.5) * 0.1,
            lon: 80.9462 + (Math.random() - 0.5) * 0.1
        }
    ];

    return specialists;
};

// Get nearby specialists
router.get('/specialists', (req, res) => {
    try {
        const { lat, lon, radius = 10, language = 'en' } = req.query;

        // In production, filter by actual location
        const specialists = getNearbySpecialists(language);

        res.json({
            success: true,
            data: specialists,
            count: specialists.length
        });
    } catch (error) {
        console.error('Get specialists error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching specialists'
        });
    }
});

// Get specialist by ID
router.get('/specialists/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { language = 'en' } = req.query;

        const specialists = getNearbySpecialists(language);
        const specialist = specialists.find(s => s.id === parseInt(id));

        if (!specialist) {
            return res.status(404).json({
                success: false,
                message: 'Specialist not found'
            });
        }

        res.json({
            success: true,
            data: specialist
        });
    } catch (error) {
        console.error('Get specialist error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching specialist'
        });
    }
});

// Get agricultural supply stores
router.get('/stores', (req, res) => {
    try {
        const { language = 'en' } = req.query;

        const stores = [
            {
                id: 1,
                name: language === 'hi' ? 'कृषि भंडार' : language === 'ta' ? 'வேளாண் கடை' : 'Agri Store',
                type: language === 'hi' ? 'बीज और उर्वरक' : language === 'ta' ? 'விதைகள் மற்றும் உரங்கள்' : 'Seeds & Fertilizers',
                distance: '3.2 km',
                phone: '+91-9876543210',
                address: language === 'hi' ? 'बाजार रोड, लखनऊ' : language === 'ta' ? 'சந்தை சாலை, லக்னோ' : 'Market Road, Lucknow',
                rating: 4.6,
                lat: 26.8467 + (Math.random() - 0.5) * 0.06,
                lon: 80.9462 + (Math.random() - 0.5) * 0.06
            },
            {
                id: 2,
                name: language === 'hi' ? 'किसान दुकान' : language === 'ta' ? 'கிசான் கடை' : 'Kisan Shop',
                type: language === 'hi' ? 'कृषि उपकरण' : language === 'ta' ? 'வேளாண் கருவிகள்' : 'Farm Equipment',
                distance: '5.8 km',
                phone: '+91-9988776655',
                address: language === 'hi' ? 'स्टेशन रोड, लखनऊ' : language === 'ta' ? 'நிலையம் சாலை, லக்னோ' : 'Station Road, Lucknow',
                rating: 4.4,
                lat: 26.8467 + (Math.random() - 0.5) * 0.09,
                lon: 80.9462 + (Math.random() - 0.5) * 0.09
            }
        ];

        res.json({
            success: true,
            data: stores,
            count: stores.length
        });
    } catch (error) {
        console.error('Get stores error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching stores'
        });
    }
});

module.exports = router;

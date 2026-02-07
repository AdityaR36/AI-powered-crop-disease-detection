const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const roboflowService = require('../services/roboflow.service');

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = './uploads/plants';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'plant-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files (JPEG, JPG, PNG) are allowed!'));
        }
    }
});

// Disease database with multilingual support
const getDiseaseDB = (lang = 'en') => [
    {
        id: 'healthy',
        name: lang === 'hi' ? 'स्वस्थ पौधा' : lang === 'ta' ? 'ஆரோக்கியமான தாவரம்' : 'Healthy Plant',
        status: 'healthy',
        confidence: 98.5,
        description: lang === 'hi'
            ? 'आपका पौधा जोरदार और स्वस्थ दिखता है। कोई रोगजनक या पोषक तत्वों की कमी नहीं पाई गई।'
            : lang === 'ta'
                ? 'உங்கள் தாவரம் ஆரோக்கியமாகத் தெரிகிறது. நோய்க்கிருமிகள் அல்லது ஊட்டச்சத்து குறைபாடுகள் எதுவும் கண்டறியப்படவில்லை.'
                : 'Your plant looks vigorous and healthy. No signs of pathogens or nutrient deficiencies found.',
        symptoms: lang === 'hi'
            ? ['चमकदार हरी पत्तियां', 'मजबूत तने', 'कोई मलिनकिरण नहीं']
            : lang === 'ta'
                ? ['துடிப்பான பச்சை இலைகள்', 'வலுவான தண்டுகள்', 'நிறமாற்றம் இல்லை']
                : ['Vibrant green leaves', 'Strong stems', 'No discoloration'],
        treatment: lang === 'hi'
            ? ['नियमित रूप से पानी देना जारी रखें।', 'वर्तमान धूप के संपर्क को बनाए रखें।', 'हमेशा की तरह कीटों की निगरानी करें।']
            : lang === 'ta'
                ? ['வழக்கமான நீர்ப்பாசன அட்டவணையைத் தொடரவும்.', 'சூரிய ஒளியைப் பராமரிக்கவும்.', 'வழக்கம் போல் பூச்சிகளைக் கண்காணிக்கவும்.']
                : ['Continue regular watering schedule.', 'Maintain current sunlight exposure.', 'Monitor for pests as usual.'],
        severity: 'low'
    },
    {
        id: 'early_blight',
        name: lang === 'hi' ? 'अर्ली ब्लाइट (झुलसा रोग)' : lang === 'ta' ? 'ஆரம்ப ப்ளைட்' : 'Early Blight',
        status: 'disease',
        confidence: 89.2,
        description: lang === 'hi'
            ? 'टमाटर और आलू को प्रभावित करने वाला एक सामान्य कवक रोग। यह पत्तियों पर संकेंद्रित छल्ले का कारण बनता है।'
            : lang === 'ta'
                ? 'தக்காளி மற்றும் உருளைக்கிழங்கை பாதிக்கும் ஒரு பொதுவான பூஞ்சை நோய். இது இலைகளில் வளையங்களை ஏற்படுத்துகிறது.'
                : 'A common fungal disease affecting tomatoes and potatoes. It causes concentric rings on leaves.',
        symptoms: lang === 'hi'
            ? ['संकेंद्रित छल्लों के साथ गहरे भूरे रंग के धब्बे', 'निचली पत्तियों का पीला पड़ना', 'तने के नासूर']
            : lang === 'ta'
                ? ['இலைகளில் அடர் பழுப்பு நிற புள்ளிகள்', 'கீழ் இலைகள் மஞ்சள் நிறமாக மாறுதல்', 'தண்டு புண்கள்']
                : ['Dark brown spots with concentric rings', 'Yellowing of lower leaves', 'Stem cankers'],
        treatment: lang === 'hi'
            ? ['संक्रमित निचली पत्तियों को हटा दें।', 'तांबे आधारित कवकनाशी का प्रयोग करें।', 'पौधे के चारों ओर अच्छी हवा का संचार सुनिश्चित करें।', 'ऊपर से पानी देने से बचें।']
            : lang === 'ta'
                ? ['பாதிக்கப்பட்ட கீழ் இலைகளை அகற்றவும்.', 'செப்பு அடிப்படையிலான பூஞ்சைக் கொல்லிகளைப் பயன்படுத்துங்கள்.', 'தாவரத்தைச் சுற்றி நல்ல காற்று சுழற்சியை உறுதி செய்யுங்கள்.']
                : ['Remove infected lower leaves.', 'Apply copper-based fungicides.', 'Ensure good air circulation around the plant.', 'Avoid overhead watering.'],
        severity: 'medium'
    },
    {
        id: 'powdery_mildew',
        name: lang === 'hi' ? 'पाउडरी मिलड्यू (चूर्णी फफूँद)' : lang === 'ta' ? 'நுண்துகள் பூஞ்சை காளான்' : 'Powdery Mildew',
        status: 'disease',
        confidence: 92.1,
        description: lang === 'hi'
            ? 'एक कवक रोग जो पत्तियों और तनों पर एक विशिष्ट सफेद पाउडर जैसा विकास प्रदर्शित करता है।'
            : lang === 'ta'
                ? 'இலைகள் மற்றும் தண்டுகளில் ஒரு தனித்துவமான வெள்ளை தூள் வளர்ச்சியைக் காட்டும் ஒரு பூஞ்சை நோய்.'
                : 'A fungal disease that displays a distinctive white powdery growth on leaves and stems.',
        symptoms: lang === 'hi'
            ? ['सफेद पाउडर के धब्बे', 'पत्तियों का मुड़ना', 'रुका हुआ विकास']
            : lang === 'ta'
                ? ['வெள்ளை தூள் புள்ளிகள்', 'இலை சுருட்டுதல்', 'வளர்ச்சி குன்றியது']
                : ['White powdery spots', 'Leaf curling or twisting', 'Stunted growth'],
        treatment: lang === 'hi'
            ? ['नीम का तेल या सल्फर कवकनाशी लगाएं।', 'गंभीर रूप से संक्रमित भागों को हटा दें।', 'पत्तियों पर नहीं, बल्कि जड़ में पानी दें।', 'धूप का संपर्क बढ़ाएँ।']
            : lang === 'ta'
                ? ['வேப்ப எண்ணெய் அல்லது சல்பர் பூஞ்சைக் கொல்லிகளைப் பயன்படுத்துங்கள்.', 'பெரிதும் பாதிக்கப்பட்ட பகுதிகளை அகற்றவும்.', 'சூரிய ஒளியை அதிகரிக்கவும்.']
                : ['Apply neem oil or sulfur fungicides.', 'Remove severely infected parts.', 'Water at the base, not on leaves.', 'Increase sunlight exposure.'],
        severity: 'medium'
    },
    {
        id: 'late_blight',
        name: lang === 'hi' ? 'लेट ब्लाइट (पछेती झुलसा)' : lang === 'ta' ? 'லேட் ப்ளைட்' : 'Late Blight',
        status: 'critical',
        confidence: 85.7,
        description: lang === 'hi'
            ? 'एक गंभीर बीमारी जो फसलों को तेजी से नष्ट कर सकती है। यह बड़े, गहरे पानी से लथपथ धब्बों के रूप में दिखाई देता है।'
            : lang === 'ta'
                ? 'பயிர்களை விரைவாக அழிக்கும் ஒரு தீவிர நோய். இது பெரிய, இருண்ட நீர் நனைந்த புள்ளிகளாகத் தோன்றுகிறது.'
                : 'A serious disease that can destroy crops rapidly. It appears as large, dark water-soaked spots.',
        symptoms: lang === 'hi'
            ? ['पत्तियों पर बड़े भूरे रंग के धब्बे', 'नीचे की तरफ सफेद कवक वृद्धि', 'फलों/कंदों का सड़ना']
            : lang === 'ta'
                ? ['இலைகளில் பெரிய பழுப்பு நிற கறைகள்', 'அடிப்பகுதிகளில் வெள்ளை பூஞ்சை வளர்ச்சி', 'அழுகும் பழம்/கிழங்குகள்']
                : ['Large brown blotches on leaves', 'White fungal growth on undersides', 'Rotting fruit/tubers'],
        treatment: lang === 'hi'
            ? ['संक्रमित पौधों को तुरंत नष्ट करें (खाद न बनाएं)।', 'निवारक कवकनाशी लागू करें।', 'अगले सीजन में प्रतिरोधी किस्में लगाएं।']
            : lang === 'ta'
                ? ['பாதிக்கப்பட்ட தாவரங்களை உடனடியாக அழிக்கவும்.', 'தடுப்பு பூஞ்சைக் கொல்லியைப் பயன்படுத்துங்கள்.', 'அடுத்த பருவத்தில் எதிர்ப்பு ரகங்களை நடவும்.']
                : ['Destroy infected plants immediately (do not compost).', 'Apply preventive fungicide.', 'Plant resistant varieties next season.'],
        severity: 'critical'
    },
    {
        id: 'bacterial_spot',
        name: lang === 'hi' ? 'बैक्टीरियल स्पॉट' : lang === 'ta' ? 'பாக்டீரியா புள்ளி' : 'Bacterial Spot',
        status: 'disease',
        confidence: 87.3,
        description: lang === 'hi'
            ? 'गर्म, आर्द्र परिस्थितियों में फैलने वाला एक बैक्टीरियल संक्रमण।'
            : lang === 'ta'
                ? 'வெப்பமான, ஈரமான சூழ்நிலைகளில் பரவும் ஒரு பாக்டீரியா தொற்று.'
                : 'A bacterial infection that thrives in warm, humid conditions.',
        symptoms: lang === 'hi'
            ? ['छोटे, गोलाकार धब्बे', 'पत्ती के किनारों का भूरा होना', 'फलों पर उभरे हुए धब्बे']
            : lang === 'ta'
                ? ['சிறிய, வட்ட வடிவ புள்ளிகள்', 'இலை விளிம்புகள் பழுப்பு நிறமாதல்', 'பழங்களில் உயர்த்தப்பட்ட புள்ளிகள்']
                : ['Small, circular spots', 'Browning of leaf edges', 'Raised spots on fruit'],
        treatment: lang === 'hi'
            ? ['तांबे आधारित स्प्रे का उपयोग करें।', 'संक्रमित पौधों को हटाएं।', 'उचित दूरी सुनिश्चित करें।', 'प्रतिरोधी किस्में लगाएं।']
            : lang === 'ta'
                ? ['செப்பு அடிப்படையிலான தெளிப்பைப் பயன்படுத்துங்கள்.', 'பாதிக்கப்பட்ட தாவரங்களை அகற்றவும்.', 'சரியான இடைவெளியை உறுதி செய்யுங்கள்.']
                : ['Use copper-based spray.', 'Remove infected plants.', 'Ensure proper spacing.', 'Plant resistant varieties.'],
        severity: 'medium'
    },
    {
        id: 'leaf_curl',
        name: lang === 'hi' ? 'पत्ती मोड़' : lang === 'ta' ? 'இலை சுருள்' : 'Leaf Curl',
        status: 'disease',
        confidence: 90.8,
        description: lang === 'hi'
            ? 'एक वायरल बीमारी जो पत्तियों को मुड़ने और विकृत होने का कारण बनती है।'
            : lang === 'ta'
                ? 'இலைகளை சுருட்டி சிதைக்கும் ஒரு வைரஸ் நோய்.'
                : 'A viral disease that causes leaves to curl and become distorted.',
        symptoms: lang === 'hi'
            ? ['पत्तियों का मुड़ना', 'पीला पड़ना और विकृति', 'रुका हुआ विकास']
            : lang === 'ta'
                ? ['இலை சுருட்டுதல்', 'மஞ்சள் நிறம் மற்றும் சிதைவு', 'வளர்ச்சி குன்றியது']
                : ['Curling of leaves', 'Yellowing and distortion', 'Stunted growth'],
        treatment: lang === 'hi'
            ? ['संक्रमित पौधों को हटाएं।', 'वेक्टर कीटों को नियंत्रित करें।', 'रोग-मुक्त बीज का उपयोग करें।', 'प्रतिरोधी किस्में लगाएं।']
            : lang === 'ta'
                ? ['பாதிக்கப்பட்ட தாவரங்களை அகற்றவும்.', 'வெக்டர் பூச்சிகளைக் கட்டுப்படுத்துங்கள்.', 'நோய் இல்லாத விதைகளைப் பயன்படுத்துங்கள்.']
                : ['Remove infected plants.', 'Control vector insects.', 'Use disease-free seeds.', 'Plant resistant varieties.'],
        severity: 'medium'
    }
];

// Analyze plant disease from uploaded image
router.post('/analyze', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file uploaded'
            });
        }

        const language = req.body.language || 'en';
        const imagePath = req.file.path;
        const imageUrl = `/uploads/plants/${req.file.filename}`;

        let detectedDisease = null;
        let usedRoboflow = false;

        // Try to use Roboflow AI for detection
        if (roboflowService.isConfigured()) {
            try {
                console.log('Analyzing image with Roboflow AI...');
                const roboflowResult = await roboflowService.analyzeImage(imagePath);

                if (roboflowResult.detected) {
                    // Map Roboflow class to our disease database
                    const diseaseId = roboflowService.mapDiseaseClass(roboflowResult.disease);
                    const diseases = getDiseaseDB(language);
                    const matchedDisease = diseases.find(d => d.id === diseaseId);

                    if (matchedDisease) {
                        detectedDisease = {
                            ...matchedDisease,
                            confidence: roboflowResult.confidence,
                            aiSource: roboflowResult.source || 'roboflow',
                            roboflowDetails: roboflowResult.details
                        };
                        usedRoboflow = true;
                        console.log(`Roboflow detected (${roboflowResult.source || 'unknown'}): ${roboflowResult.disease} (${roboflowResult.confidence.toFixed(2)}%)`);
                    }
                } else {
                    console.log('Roboflow returned no detection, using fallback');
                }
            } catch (roboflowError) {
                console.error('Roboflow error, falling back to mock data:', roboflowError.message);
            }
        } else {
            console.log('Roboflow not configured, using mock detection');
        }

        // Fallback to mock detection if Roboflow failed or not configured
        if (!detectedDisease) {
            const diseases = getDiseaseDB(language);
            const randomIndex = Math.floor(Math.random() * diseases.length);
            detectedDisease = {
                ...diseases[randomIndex],
                aiSource: 'mock'
            };
            console.log('Using mock detection (fallback)');
        }

        res.json({
            success: true,
            data: {
                ...detectedDisease,
                imageUrl,
                analyzedAt: new Date().toISOString(),
                recommendations: detectedDisease.treatment,
                usedAI: usedRoboflow
            }
        });
    } catch (error) {
        console.error('Disease analysis error:', error);
        res.status(500).json({
            success: false,
            message: 'Error analyzing plant image'
        });
    }
});

// Get all diseases in database
router.get('/diseases', (req, res) => {
    try {
        const language = req.query.language || 'en';
        const diseases = getDiseaseDB(language);

        res.json({
            success: true,
            data: diseases
        });
    } catch (error) {
        console.error('Get diseases error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching diseases'
        });
    }
});

// Get disease by ID
router.get('/diseases/:id', (req, res) => {
    try {
        const language = req.query.language || 'en';
        const diseases = getDiseaseDB(language);
        const disease = diseases.find(d => d.id === req.params.id);

        if (!disease) {
            return res.status(404).json({
                success: false,
                message: 'Disease not found'
            });
        }

        res.json({
            success: true,
            data: disease
        });
    } catch (error) {
        console.error('Get disease error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching disease'
        });
    }
});

module.exports = router;

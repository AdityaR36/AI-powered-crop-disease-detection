const express = require('express');
const router = express.Router();

// SMS sending (using Twilio or similar service in production)
router.post('/send', async (req, res) => {
    try {
        const { phone, message, language = 'en' } = req.body;

        if (!phone || !message) {
            return res.status(400).json({
                success: false,
                message: language === 'hi'
                    ? 'फोन नंबर और संदेश आवश्यक हैं'
                    : language === 'ta'
                        ? 'தொலைபேசி எண் மற்றும் செய்தி தேவை'
                        : 'Phone number and message are required'
            });
        }

        // In production, integrate with SMS service like Twilio
        // const twilio = require('twilio');
        // const client = twilio(accountSid, authToken);
        // await client.messages.create({
        //   body: message,
        //   from: twilioNumber,
        //   to: phone
        // });

        // For now, simulate SMS sending
        console.log(`SMS sent to ${phone}: ${message}`);

        res.json({
            success: true,
            message: language === 'hi'
                ? 'संदेश सफलतापूर्वक भेजा गया'
                : language === 'ta'
                    ? 'செய்தி வெற்றிகரமாக அனுப்பப்பட்டது'
                    : 'Message sent successfully',
            data: {
                recipient: phone,
                sentAt: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('SMS send error:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending SMS'
        });
    }
});

// Share disease report via SMS
router.post('/share-report', async (req, res) => {
    try {
        const { phone, diseaseId, diseaseName, recommendations, language = 'en' } = req.body;

        if (!phone || !diseaseName) {
            return res.status(400).json({
                success: false,
                message: 'Phone number and disease information are required'
            });
        }

        // Format message based on language
        let message = '';

        if (language === 'hi') {
            message = `फ्लोरागार्ड रिपोर्ट\n\nपता लगाया गया: ${diseaseName}\n\n`;
            if (recommendations && recommendations.length > 0) {
                message += 'उपचार:\n';
                recommendations.slice(0, 2).forEach((rec, i) => {
                    message += `${i + 1}. ${rec}\n`;
                });
            }
            message += '\nअधिक जानकारी के लिए FloraGuard ऐप देखें।';
        } else if (language === 'ta') {
            message = `FloraGuard அறிக்கை\n\nகண்டறியப்பட்டது: ${diseaseName}\n\n`;
            if (recommendations && recommendations.length > 0) {
                message += 'சிகிச்சை:\n';
                recommendations.slice(0, 2).forEach((rec, i) => {
                    message += `${i + 1}. ${rec}\n`;
                });
            }
            message += '\nமேலும் தகவலுக்கு FloraGuard பயன்பாட்டைப் பார்க்கவும்.';
        } else {
            message = `FloraGuard Report\n\nDetected: ${diseaseName}\n\n`;
            if (recommendations && recommendations.length > 0) {
                message += 'Treatment:\n';
                recommendations.slice(0, 2).forEach((rec, i) => {
                    message += `${i + 1}. ${rec}\n`;
                });
            }
            message += '\nSee FloraGuard app for more info.';
        }

        // Simulate SMS sending
        console.log(`Report SMS sent to ${phone}:\n${message}`);

        res.json({
            success: true,
            message: language === 'hi'
                ? 'रिपोर्ट सफलतापूर्वक साझा की गई'
                : language === 'ta'
                    ? 'அறிக்கை வெற்றிகரமாகப் பகிரப்பட்டது'
                    : 'Report shared successfully',
            data: {
                recipient: phone,
                sentAt: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Share report error:', error);
        res.status(500).json({
            success: false,
            message: 'Error sharing report'
        });
    }
});

module.exports = router;

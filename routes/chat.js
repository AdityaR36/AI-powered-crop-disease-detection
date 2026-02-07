const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');

// Initialize Anthropic client
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || ''
});

// Conversation history storage (in production, use a database)
const conversations = new Map();

// System prompts for different languages
const getSystemPrompt = (language, location) => {
    const prompts = {
        en: `You are Kisan Sahayak, a helpful agricultural AI assistant specializing in Indian farming practices. You provide advice on:
- Crop selection and seasonal planting
- Pest and disease management
- Soil health and fertilization
- Weather-based farming recommendations
- Irrigation practices
- Government schemes and subsidies for farmers
- Organic farming techniques
- Post-harvest management

${location ? `The farmer is located in: ${location}. Provide location-specific advice when relevant.` : ''}

Keep responses concise, practical, and easy to understand. Use simple language suitable for farmers with varying education levels. When discussing technical topics, explain in simple terms. Always prioritize sustainable and cost-effective solutions.`,

        hi: `आप किसान सहायक हैं, एक सहायक कृषि AI सहायक जो भारतीय कृषि प्रथाओं में विशेषज्ञता रखता है। आप सलाह देते हैं:
- फसल चयन और मौसमी रोपण
- कीट और रोग प्रबंधन
- मिट्टी स्वास्थ्य और उर्वरक
- मौसम आधारित कृषि सिफारिशें
- सिंचाई प्रथाएं
- किसानों के लिए सरकारी योजनाएं और सब्सिडी
- जैविक कृषि तकनीक
- कटाई के बाद प्रबंधन

${location ? `किसान यहां स्थित है: ${location}। प्रासंगिक होने पर स्थान-विशिष्ट सलाह दें।` : ''}

संक्षिप्त, व्यावहारिक और समझने में आसान प्रतिक्रियाएं रखें। विभिन्न शिक्षा स्तरों वाले किसानों के लिए सरल भाषा का प्रयोग करें।`,

        ta: `நீங்கள் கிசான் சஹாயக், இந்திய விவசாய நடைமுறைகளில் நிபுணத்துவம் பெற்ற ஒரு உதவிகரமான வேளாண் AI உதவியாளர். நீங்கள் ஆலோசனை வழங்குகிறீர்கள்:
- பயிர் தேர்வு மற்றும் பருவகால நடவு
- பூச்சி மற்றும் நோய் மேலாண்மை
- மண் ஆரோக்கியம் மற்றும் உரமிடுதல்
- வானிலை அடிப்படையிலான விவசாய பரிந்துரைகள்
- நீர்ப்பாசன நடைமுறைகள்
- விவசாயிகளுக்கான அரசு திட்டங்கள் மற்றும் மானியங்கள்
- இயற்கை விவசாய நுட்பங்கள்
- அறுவடைக்குப் பிந்தைய மேலாண்மை

${location ? `விவசாயி இங்கு அமைந்துள்ளார்: ${location}. பொருத்தமான போது இருப்பிட-குறிப்பிட்ட ஆலோசனை வழங்கவும்.` : ''}

பதில்களை சுருக்கமாக, நடைமுறையாக மற்றும் புரிந்துகொள்ள எளிதாக வைத்திருங்கள்.`
    };

    return prompts[language] || prompts.en;
};

// Chat endpoint
router.post('/message', async (req, res) => {
    try {
        const { message, conversationId, language = 'en', location } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Message is required'
            });
        }

        // Get or create conversation history
        const convId = conversationId || `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        let history = conversations.get(convId) || [];

        // Add user message to history
        history.push({
            role: 'user',
            content: message
        });

        try {
            // Call Claude API
            const response = await anthropic.messages.create({
                model: 'claude-3-sonnet-20240229', // Updated model name
                max_tokens: 1024,
                system: getSystemPrompt(language, location),
                messages: history
            });

            const assistantMessage = response.content[0].text;

            // Add assistant response to history
            history.push({
                role: 'assistant',
                content: assistantMessage
            });

            // Keep only last 20 messages to prevent token overflow
            if (history.length > 20) {
                history = history.slice(-20);
            }

            // Save conversation history
            conversations.set(convId, history);

            res.json({
                success: true,
                data: {
                    response: assistantMessage,
                    conversationId: convId,
                    timestamp: new Date().toISOString()
                }
            });
        } catch (apiError) {
            console.error('Claude API error:', apiError);

            // Fallback response if API fails
            const fallbackResponses = {
                en: "I'm having trouble connecting right now. Please try again in a moment. In the meantime, you can explore our disease detection and soil analysis features.",
                hi: "मुझे अभी कनेक्ट करने में परेशानी हो रही है। कृपया एक क्षण में पुनः प्रयास करें। इस बीच, आप हमारी बीमारी का पता लगाने और मिट्टी विश्लेषण सुविधाओं का पता लगा सकते हैं।",
                ta: "எனக்கு இப்போது இணைப்பதில் சிக்கல் உள்ளது. தயவுசெய்து சிறிது நேரத்தில் மீண்டும் முயற்சிக்கவும். இதற்கிடையில், எங்கள் நோய் கண்டறிதல் மற்றும் மண் பகுப்பாய்வு அம்சங்களை ஆராயலாம்."
            };

            res.json({
                success: true,
                data: {
                    response: fallbackResponses[language] || fallbackResponses.en,
                    conversationId: convId,
                    timestamp: new Date().toISOString(),
                    fallback: true
                }
            });
        }
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing chat message'
        });
    }
});

// Clear conversation
router.delete('/conversation/:id', (req, res) => {
    try {
        const { id } = req.params;

        if (conversations.has(id)) {
            conversations.delete(id);
            res.json({
                success: true,
                message: 'Conversation cleared'
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }
    } catch (error) {
        console.error('Clear conversation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error clearing conversation'
        });
    }
});

// Get suggested questions
router.get('/suggestions', (req, res) => {
    try {
        const { language = 'en' } = req.query;

        const suggestions = {
            en: [
                "What crops are best for the current season?",
                "How can I improve my soil quality?",
                "What are common pests in my area?",
                "Tell me about government schemes for farmers",
                "How much water does my crop need?"
            ],
            hi: [
                "वर्तमान मौसम के लिए कौन सी फसलें सबसे अच्छी हैं?",
                "मैं अपनी मिट्टी की गुणवत्ता कैसे सुधार सकता हूं?",
                "मेरे क्षेत्र में आम कीट कौन से हैं?",
                "किसानों के लिए सरकारी योजनाओं के बारे में बताएं",
                "मेरी फसल को कितना पानी चाहिए?"
            ],
            ta: [
                "தற்போதைய பருவத்திற்கு எந்த பயிர்கள் சிறந்தவை?",
                "எனது மண் தரத்தை எவ்வாறு மேம்படுத்துவது?",
                "எனது பகுதியில் பொதுவான பூச்சிகள் என்ன?",
                "விவசாயிகளுக்கான அரசு திட்டங்களைப் பற்றி சொல்லுங்கள்",
                "எனது பயிருக்கு எவ்வளவு தண்ணீர் தேவை?"
            ]
        };

        res.json({
            success: true,
            data: suggestions[language] || suggestions.en
        });
    } catch (error) {
        console.error('Suggestions error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching suggestions'
        });
    }
});

module.exports = router;

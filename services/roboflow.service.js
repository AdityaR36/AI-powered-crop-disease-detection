const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

class RoboflowService {
    constructor() {
        this.apiUrl = process.env.ROBOFLOW_API_URL || 'https://detect.roboflow.com';
        this.workflowUrl = process.env.ROBOFLOW_WORKFLOW_URL || 'https://serverless.roboflow.com';
        this.apiKey = process.env.ROBOFLOW_API_KEY;
        this.workspaceName = process.env.ROBOFLOW_WORKSPACE || 'kart-app-dev';
        this.workflowId = process.env.ROBOFLOW_WORKFLOW_ID || 'detect-and-classify';
    }

    /**
     * Analyze plant image using Roboflow workflow
     * @param {string} imagePath - Path to the uploaded image
     * @returns {Promise<Object>} Detection results
     */
    async analyzeImage(imagePath) {
        try {
            if (!this.apiKey) {
                throw new Error('Roboflow API key not configured');
            }

            // Read image file as base64
            const imageBuffer = fs.readFileSync(imagePath);
            const base64Image = imageBuffer.toString('base64');

            // Call Roboflow workflow API
            const response = await axios.post(
                `${this.workflowUrl}/${this.workspaceName}/${this.workflowId}`,
                {
                    api_key: this.apiKey,
                    inputs: {
                        image: {
                            type: 'base64',
                            value: base64Image
                        }
                    }
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    timeout: 30000 // 30 second timeout
                }
            );

            return this.parseWorkflowResponse(response.data);
        } catch (error) {
            console.error('Roboflow API Error:', error.message);

            if (error.response) {
                console.error('Response status:', error.response.status);
                console.error('Response data:', error.response.data);
            }

            throw new Error(`Roboflow analysis failed: ${error.message}`);
        }
    }

    /**
     * Parse Roboflow workflow response
     * @param {Object} data - Raw API response
     * @returns {Object} Normalized detection results
     */
    parseWorkflowResponse(data) {
        try {
            // Extract predictions from workflow response
            // The structure may vary based on your workflow configuration
            const predictions = data.outputs || data.predictions || [];

            if (!predictions || predictions.length === 0) {
                return {
                    detected: false,
                    disease: 'healthy',
                    confidence: 0,
                    details: null
                };
            }

            // Get the top prediction
            const topPrediction = Array.isArray(predictions) ? predictions[0] : predictions;

            return {
                detected: true,
                disease: topPrediction.class || topPrediction.predicted_class || 'unknown',
                confidence: (topPrediction.confidence || topPrediction.score || 0) * 100,
                details: topPrediction,
                allPredictions: predictions
            };
        } catch (error) {
            console.error('Error parsing Roboflow response:', error);
            return {
                detected: false,
                disease: 'unknown',
                confidence: 0,
                details: null,
                error: error.message
            };
        }
    }

    /**
     * Map Roboflow disease class to internal disease ID
     * @param {string} roboflowClass - Disease class from Roboflow
     * @returns {string} Internal disease ID
     */
    mapDiseaseClass(roboflowClass) {
        const classMap = {
            'healthy': 'healthy',
            'early_blight': 'early_blight',
            'early blight': 'early_blight',
            'late_blight': 'late_blight',
            'late blight': 'late_blight',
            'powdery_mildew': 'powdery_mildew',
            'powdery mildew': 'powdery_mildew',
            'bacterial_spot': 'bacterial_spot',
            'bacterial spot': 'bacterial_spot',
            'leaf_curl': 'leaf_curl',
            'leaf curl': 'leaf_curl'
        };

        const normalized = roboflowClass.toLowerCase().trim();
        return classMap[normalized] || 'healthy';
    }

    /**
     * Check if Roboflow service is configured and available
     * @returns {boolean}
     */
    isConfigured() {
        return !!this.apiKey;
    }
}

module.exports = new RoboflowService();

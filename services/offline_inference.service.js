const ort = require('onnxruntime-node');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

/**
 * Service for running offline inference using ONNX Runtime
 */
class OfflineInferenceService {
    constructor() {
        this.session = null;
        this.modelPath = process.env.MODEL_PATH || './models/crop-disease-model.onnx';
        this.inputSize = parseInt(process.env.MODEL_INPUT_SIZE || '640', 10);
        this.isInitialized = false;
        
        // Disease class labels (update based on your model)
        this.classLabels = [
            'healthy',
            'early_blight',
            'late_blight',
            'powdery_mildew',
            'bacterial_spot',
            'leaf_curl'
        ];
    }

    /**
     * Initialize the ONNX model session
     * @returns {Promise<boolean>} Success status
     */
    async initialize() {
        try {
            if (this.isInitialized) {
                return true;
            }

            // Check if model file exists
            if (!fs.existsSync(this.modelPath)) {
                console.warn(`Model file not found at: ${this.modelPath}`);
                return false;
            }

            console.log(`Loading ONNX model from: ${this.modelPath}`);
            
            // Create ONNX inference session
            this.session = await ort.InferenceSession.create(this.modelPath, {
                executionProviders: ['cpu'],
                graphOptimizationLevel: 'all'
            });

            this.isInitialized = true;
            console.log('✓ Offline model loaded successfully');
            
            // Log model input/output info
            console.log('Model inputs:', this.session.inputNames);
            console.log('Model outputs:', this.session.outputNames);
            
            return true;
        } catch (error) {
            console.error('Failed to initialize offline model:', error.message);
            this.isInitialized = false;
            return false;
        }
    }

    /**
     * Preprocess image for model input
     * @param {string} imagePath - Path to the image file
     * @returns {Promise<Object>} Preprocessed tensor
     */
    async preprocessImage(imagePath) {
        try {
            // Read and resize image
            const imageBuffer = await sharp(imagePath)
                .resize(this.inputSize, this.inputSize, {
                    fit: 'fill',
                    background: { r: 114, g: 114, b: 114 }
                })
                .raw()
                .toBuffer({ resolveWithObject: true });

            const { data, info } = imageBuffer;
            
            // Convert to float32 and normalize to [0, 1]
            const float32Data = new Float32Array(data.length);
            for (let i = 0; i < data.length; i++) {
                float32Data[i] = data[i] / 255.0;
            }

            // Reshape to [1, 3, height, width] (NCHW format for ONNX)
            const rgbData = new Float32Array(3 * this.inputSize * this.inputSize);
            const pixelCount = this.inputSize * this.inputSize;
            
            for (let i = 0; i < pixelCount; i++) {
                rgbData[i] = float32Data[i * 3];                    // R channel
                rgbData[pixelCount + i] = float32Data[i * 3 + 1];  // G channel
                rgbData[pixelCount * 2 + i] = float32Data[i * 3 + 2]; // B channel
            }

            // Create tensor
            const tensor = new ort.Tensor('float32', rgbData, [1, 3, this.inputSize, this.inputSize]);
            
            return tensor;
        } catch (error) {
            console.error('Image preprocessing error:', error);
            throw new Error(`Failed to preprocess image: ${error.message}`);
        }
    }

    /**
     * Run inference on preprocessed image
     * @param {string} imagePath - Path to the image file
     * @returns {Promise<Object>} Prediction results
     */
    async predict(imagePath) {
        try {
            // Initialize model if not already done
            if (!this.isInitialized) {
                const initialized = await this.initialize();
                if (!initialized) {
                    throw new Error('Model initialization failed');
                }
            }

            // Preprocess image
            const inputTensor = await this.preprocessImage(imagePath);
            
            // Get input name from model
            const inputName = this.session.inputNames[0];
            
            // Run inference
            console.log('Running offline inference...');
            const feeds = { [inputName]: inputTensor };
            const results = await this.session.run(feeds);
            
            // Get output tensor
            const outputName = this.session.outputNames[0];
            const output = results[outputName];
            
            // Post-process results
            const predictions = this.postProcess(output);
            
            console.log('✓ Offline inference completed');
            return predictions;
        } catch (error) {
            console.error('Prediction error:', error);
            throw new Error(`Offline inference failed: ${error.message}`);
        }
    }

    /**
     * Post-process model output to extract predictions
     * @param {Tensor} output - Raw model output tensor
     * @returns {Object} Processed predictions
     */
    postProcess(output) {
        try {
            const data = output.data;
            
            // Find class with highest confidence
            let maxConfidence = 0;
            let maxIndex = 0;
            
            for (let i = 0; i < data.length; i++) {
                if (data[i] > maxConfidence) {
                    maxConfidence = data[i];
                    maxIndex = i;
                }
            }

            // Get all predictions above threshold
            const threshold = 0.1;
            const allPredictions = [];
            
            for (let i = 0; i < Math.min(data.length, this.classLabels.length); i++) {
                if (data[i] >= threshold) {
                    allPredictions.push({
                        class: this.classLabels[i] || `class_${i}`,
                        confidence: data[i],
                        score: data[i]
                    });
                }
            }

            // Sort by confidence
            allPredictions.sort((a, b) => b.confidence - a.confidence);

            const predictedClass = this.classLabels[maxIndex] || 'unknown';
            const confidence = maxConfidence;

            return {
                detected: confidence > 0.3,
                disease: predictedClass,
                confidence: confidence * 100, // Convert to percentage
                details: {
                    class: predictedClass,
                    predicted_class: predictedClass,
                    confidence: confidence,
                    score: confidence
                },
                allPredictions: allPredictions
            };
        } catch (error) {
            console.error('Post-processing error:', error);
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
     * Check if offline model is available and initialized
     * @returns {boolean}
     */
    isAvailable() {
        return this.isInitialized && this.session !== null;
    }

    /**
     * Update class labels from metadata file
     * @param {Array<string>} labels - Array of class labels
     */
    setClassLabels(labels) {
        if (Array.isArray(labels) && labels.length > 0) {
            this.classLabels = labels;
            console.log('Updated class labels:', this.classLabels);
        }
    }

    /**
     * Load class labels from metadata file if available
     */
    async loadMetadata() {
        try {
            const metadataPath = path.join(path.dirname(this.modelPath), 'metadata.json');
            
            if (fs.existsSync(metadataPath)) {
                const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
                
                if (metadata.classes) {
                    this.setClassLabels(metadata.classes);
                }
                
                if (metadata.inputSize) {
                    this.inputSize = metadata.inputSize;
                }
                
                console.log('Loaded metadata from:', metadataPath);
            }
        } catch (error) {
            console.warn('Could not load metadata:', error.message);
        }
    }
}

module.exports = new OfflineInferenceService();

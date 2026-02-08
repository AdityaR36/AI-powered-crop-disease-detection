const axios = require('axios');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

/**
 * Interactive script to download ONNX model from Roboflow
 * Usage: node services/model_downloader.js
 */

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function downloadModel() {
    console.log('\n=== Roboflow Model Downloader ===\n');
    console.log('This script will help you download your Roboflow model in ONNX format.\n');

    try {
        // Get user inputs
        const apiKey = await question('Enter your Roboflow API Key: ');
        const workspace = await question('Enter your Workspace ID (e.g., kart-app-dev): ');
        const projectId = await question('Enter your Project ID: ');
        const version = await question('Enter model version (e.g., 1): ');

        console.log('\nDownloading model...');

        // Construct Roboflow API URL for ONNX export
        const exportUrl = `https://api.roboflow.com/${workspace}/${projectId}/${version}/onnx`;

        // Download the model zip
        const response = await axios({
            method: 'get',
            url: exportUrl,
            params: { api_key: apiKey },
            responseType: 'stream'
        });

        // Create models directory if it doesn't exist
        const modelsDir = path.join(__dirname, '..', 'models');
        if (!fs.existsSync(modelsDir)) {
            fs.mkdirSync(modelsDir, { recursive: true });
        }

        // Save the zip file
        const zipPath = path.join(modelsDir, 'model-download.zip');
        const writer = fs.createWriteStream(zipPath);

        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        console.log('✓ Model downloaded successfully!');
        console.log(`  Saved to: ${zipPath}`);
        console.log('\nNext steps:');
        console.log('1. Extract the zip file');
        console.log('2. Find the .onnx file inside');
        console.log('3. Rename it to "crop-disease-model.onnx"');
        console.log('4. Place it in the models/ directory');
        console.log('5. Update your .env file with USE_OFFLINE_MODEL=true');
        console.log('\nAlternatively, you can manually export from Roboflow dashboard:');
        console.log('  https://app.roboflow.com/' + workspace + '/' + projectId + '/' + version);

    } catch (error) {
        console.error('\n✗ Error downloading model:', error.message);

        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }

        console.log('\n=== Manual Download Instructions ===');
        console.log('If the automated download failed, you can manually download:');
        console.log('1. Go to https://app.roboflow.com/');
        console.log('2. Navigate to your project and version');
        console.log('3. Click "Export"');
        console.log('4. Select "ONNX" format');
        console.log('5. Download and extract the model');
        console.log('6. Place the .onnx file in the models/ directory');
    } finally {
        rl.close();
    }
}

// Additional function to create example metadata
function createExampleMetadata() {
    const metadataPath = path.join(__dirname, '..', 'models', 'example-metadata.json');

    const exampleMetadata = {
        classes: [
            'healthy',
            'early_blight',
            'late_blight',
            'powdery_mildew',
            'bacterial_spot',
            'leaf_curl'
        ],
        inputSize: 640,
        modelVersion: '1',
        exportedAt: new Date().toISOString(),
        notes: 'Update this file with your actual model metadata'
    };

    fs.writeFileSync(metadataPath, JSON.stringify(exampleMetadata, null, 2));
    console.log('\n✓ Created example metadata file:', metadataPath);
}

// Run the downloader
if (require.main === module) {
    downloadModel().then(() => {
        createExampleMetadata();
        console.log('\nDone!');
        process.exit(0);
    }).catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

module.exports = { downloadModel };

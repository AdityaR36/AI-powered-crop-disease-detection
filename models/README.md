# Models Directory

This directory contains the ONNX model files for offline inference.

## Setup Instructions

1. **Export your Roboflow model in ONNX format:**
   - Go to your Roboflow project dashboard
   - Navigate to the "Versions" tab
   - Select your trained model version
   - Click "Export"
   - Choose "ONNX" as the export format
   - Download the exported model

2. **Place the model file here:**
   - Copy the downloaded `.onnx` file to this directory
   - Rename it to `crop-disease-model.onnx` (or update `MODEL_PATH` in `.env`)

3. **Update .env configuration:**
   ```env
   USE_OFFLINE_MODEL=true
   MODEL_PATH=./models/crop-disease-model.onnx
   MODEL_INPUT_SIZE=640
   ```

4. **Restart your server:**
   ```bash
   npm run server
   ```

## Troubleshooting

- **Model not loading**: Check that the file path in `.env` matches the actual file location
- **Inference errors**: Verify the model input size matches your Roboflow model configuration
- **Memory issues**: ONNX models can be memory-intensive. Ensure adequate RAM is available

## Alternative: Use the Model Downloader

You can also use the automated model downloader script:

```bash
node services/model_downloader.js
```

Follow the prompts to download your model directly from Roboflow.

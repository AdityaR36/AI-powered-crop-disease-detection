# Offline Model Setup Guide

## Overview
This guide will help you set up the AI-powered crop disease detection system to work offline using a locally downloaded Roboflow model.

## Prerequisites
- Node.js installed
- Access to your Roboflow project
- At least 500MB of free disk space for the model file

---

## Step 1: Export Your Model from Roboflow

### Option A: Using Roboflow Dashboard (Recommended)

1. **Login to Roboflow:**
   - Go to [https://app.roboflow.com/](https://app.roboflow.com/)
   - Sign in to your account

2. **Navigate to Your Project:**
   - Select your workspace (e.g., `kart-app-dev`)
   - Choose your crop disease detection project
   - Select the trained model version you want to export

3. **Export as ONNX:**
   - Click the **"Export"** button
   - Choose **"ONNX"** as the export format
   - Click **"Download"** to get the model file

4. **Extract the Model:**
   - Unzip the downloaded file
   - Find the `.onnx` file inside (usually named something like `model.onnx`)

### Option B: Using the Model Downloader Script

Run the automated downloader script:

```bash
node services/model_downloader.js
```

Follow the prompts to enter:
- Your Roboflow API Key
- Workspace ID
- Project ID
- Model version

The script will download the model and provide instructions for the next steps.

---

## Step 2: Place the Model File

1. **Copy the ONNX file** to the `models/` directory in your project:
   ```
   AI-powered-crop-disease-detection/
   └── models/
       └── crop-disease-model.onnx  <-- Place your model here
   ```

2. **Rename the file** to `crop-disease-model.onnx` (or update the `MODEL_PATH` in `.env` to match your filename)

---

## Step 3: Configure Model Metadata (Optional but Recommended)

Create a `metadata.json` file in the `models/` directory with your model's class labels:

```json
{
  "classes": [
    "healthy",
    "early_blight",
    "late_blight",
    "powdery_mildew",
    "bacterial_spot",
    "leaf_curl"
  ],
  "inputSize": 640,
  "modelVersion": "1",
  "exportedAt": "2026-02-08T00:00:00.000Z",
  "notes": "Crop disease detection model v1"
}
```

**Important:** Update the `classes` array to match your actual model's output classes in the correct order.

---

## Step 4: Update Environment Configuration

Edit your `.env` file and set:

```env
# Enable offline model
USE_OFFLINE_MODEL=true

# Model file path (relative to project root)
MODEL_PATH=./models/crop-disease-model.onnx

# Model input size (usually 640, check your Roboflow export settings)
MODEL_INPUT_SIZE=640
```

---

## Step 5: Install Dependencies

If you haven't already, install the required packages:

```bash
npm install
```

This will install:
- `onnxruntime-node` - For running ONNX models
- `sharp` - For image preprocessing
- `ndarray` - For tensor operations

---

## Step 6: Start the Server

Start your backend server:

```bash
npm run server
```

Look for these success messages in the console:

```
Loading ONNX model from: ./models/crop-disease-model.onnx
✓ Offline model loaded successfully
Model inputs: ['images']
Model outputs: ['output0']
```

---

## Step 7: Test Offline Inference

1. **Upload a test image** using your frontend or API client
2. **Check the server logs** for:
   ```
   Attempting offline inference...
   Running offline inference...
   ✓ Offline inference completed
   ✓ Using offline model inference
   Roboflow detected (offline): early_blight (89.23%)
   ```

3. **Verify the response** includes:
   ```json
   {
     "success": true,
     "data": {
       "aiSource": "offline",
       "disease": "Early Blight",
       "confidence": 89.2,
       ...
     }
   }
   ```

---

## Fallback Behavior

The system implements a graceful fallback chain:

1. **Offline Model** (if `USE_OFFLINE_MODEL=true` and model available)
   - Fastest response
   - No internet required
   - Runs locally

2. **Online Roboflow API** (if offline model fails)
   - Requires internet
   - Uses your API key
   - Falls back automatically

3. **Mock Data** (if both fail)
   - Always available
   - Random disease prediction
   - For testing only

---

## Troubleshooting

### Model Not Loading

**Error:** `Model file not found at: ./models/crop-disease-model.onnx`

**Solution:** 
- Verify the file exists in the `models/` directory
- Check the filename matches `MODEL_PATH` in `.env`
- Ensure the file has `.onnx` extension

---

### Wrong Predictions

**Issue:** Model predictions don't match expected classes

**Solution:**
- Create `models/metadata.json` with correct class labels
- Ensure classes are in the same order as your Roboflow model output
- Restart the server after updating metadata

---

### Out of Memory Errors

**Error:** `Cannot allocate memory`

**Solution:**
- Close other applications to free up RAM
- ONNX models can use 500MB-2GB of memory
- Consider using a smaller model or reducing input size

---

### Slow Inference

**Issue:** Offline inference takes too long

**Solution:**
- First inference is slower (model loading)
- Subsequent inferences should be faster (cached)
- Consider reducing `MODEL_INPUT_SIZE` in `.env`
- Ensure you're using CPU efficiently (no other heavy processes)

---

### Falling Back to Online API

**Logs show:** `Offline inference failed... Falling back to online API`

**Solution:**
- Check server logs for specific error messages
- Verify model file is not corrupted (try re-downloading)
- Ensure all dependencies are installed: `npm install`
- Check `models/metadata.json` format if you created one

---

## Switching Between Offline and Online

To **disable offline mode** and use only the cloud API:

```env
USE_OFFLINE_MODEL=false
```

To **re-enable offline mode:**

```env
USE_OFFLINE_MODEL=true
```

Restart the server after changing this setting.

---

## Performance Comparison

| Mode | Response Time | Internet Required | Accuracy |
|------|--------------|-------------------|----------|
| Offline | ~500ms-2s | ❌ No | Same as online |
| Online | ~1s-5s | ✅ Yes | Reference |
| Mock | ~50ms | ❌ No | Random (testing only) |

---

## Advanced Configuration

### Using a Different Model Path

```env
MODEL_PATH=./my-models/custom-model.onnx
```

### Adjusting Input Size

If your model was trained with a different input size:

```env
MODEL_INPUT_SIZE=416  # or 512, 1024, etc.
```

### Checking Inference Mode at Runtime

The service exposes a method to check the current mode:

```javascript
const roboflowService = require('./services/roboflow.service');
console.log(roboflowService.getInferenceMode()); 
// Returns: 'offline', 'online', or 'unavailable'
```

---

## Next Steps

- Test with various plant images
- Compare offline vs online predictions
- Optimize model input size for your use case
- Consider training a new model version if accuracy needs improvement

---

## Support

If you encounter issues not covered in this guide:

1. Check the server logs for detailed error messages
2. Verify all dependencies are installed correctly
3. Ensure your ONNX model is compatible with `onnxruntime-node`
4. Try re-exporting your model from Roboflow

For Roboflow-specific questions, visit: [https://docs.roboflow.com/](https://docs.roboflow.com/)

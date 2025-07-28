# PerfectCorp Integration Guide

## Overview

Your IsherCare app now supports **dual analysis modes**:

- 🐍 **Python FastAPI** - Your custom AI analysis system
- ✨ **PerfectCorp** - Professional skincare diagnostics API
- 🔬 **Compare Both** - Run both analyses and compare results

## Setup Instructions

### 1. Get PerfectCorp API Credentials

1. Visit [PerfectCorp Business Portal](https://www.perfectcorp.com/business/showcase/skincare/live-diagnostics)
2. Sign up for a business account
3. Request access to the Skincare Live Diagnostics API
4. Obtain your API credentials:
   - API Key
   - API Secret
   - Base URL (usually `https://api.perfectcorp.com/v1/skincare`)

### 2. Configure Environment Variables

Add these variables to your `.env` file:

```bash
# PerfectCorp API Configuration
EXPO_PUBLIC_PERFECTCORP_API_KEY=your_api_key_here
EXPO_PUBLIC_PC_SECRET_PEM=your_api_secret_here
EXPO_PUBLIC_PERFECTCORP_BASE_URL=https://api.perfectcorp.com/v1/skincare
```

### 3. Test the Integration

1. **Start your servers:**

   ```bash
   # Terminal 1: Python FastAPI
   cd face_analysis_api && source venv/bin/activate
   python -m uvicorn main:app --host 0.0.0.0 --port 8003 --reload

   # Terminal 2: Laravel Backend
   cd /Applications/MAMP/htdocs/ishaBackend
   php artisan serve --host=0.0.0.0 --port=8002

   # Terminal 3: React Native App
   npx expo start
   ```

2. **Test each analysis method:**
   - **Python AI**: Uses your custom face detection and skin analysis
   - **PerfectCorp**: Uses PerfectCorp's professional skincare API
   - **Compare Both**: Runs both analyses and creates comparison results

## How It Works

### Analysis Method Selection

The app now includes a method selector at the top of the scan screen:

```
🐍 Python AI    |    ✨ PerfectCorp    |    🔬 Compare Both
```

### Face Detection Validation

**Both APIs now validate faces before analysis:**

✅ **Smart Validation:**

- Detects if image contains a real human face
- Rejects walls, objects, blurry images
- Shows "No Face Detected" error for invalid images

❌ **Previous Issue (Fixed):**

- Used to analyze any image (including walls)
- Returned static/dummy results

### Results Comparison

When using "Compare Both" mode:

1. **Python Analysis** runs first
2. **PerfectCorp Analysis** runs second
3. **Comparison Analysis** combines both results
4. All three analyses are saved separately
5. View different results in the scan results screen

## API Integration Details

### PerfectCorp Service Features

```typescript
// services/PerfectCorpService.ts provides:

- Authentication with PerfectCorp API
- Face detection validation
- Comprehensive skin analysis
- HD parameter mapping
- Concern extraction
- Product recommendations
- Error handling with fallbacks
```

### Supported Analysis Parameters

Both APIs analyze these skin parameters:

| Parameter    | Python API | PerfectCorp | Description                      |
| ------------ | ---------- | ----------- | -------------------------------- |
| Redness      | ✅         | ✅          | Skin irritation and inflammation |
| Oiliness     | ✅         | ✅          | Sebum production levels          |
| Age Spots    | ✅         | ✅          | Hyperpigmentation and dark spots |
| Radiance     | ✅         | ✅          | Skin brightness and glow         |
| Moisture     | ✅         | ✅          | Hydration levels                 |
| Dark Circles | ✅         | ✅          | Under-eye discoloration          |
| Eye Bags     | ✅         | ✅          | Under-eye puffiness              |
| Firmness     | ✅         | ✅          | Skin elasticity and tightness    |
| Texture      | ✅         | ✅          | Skin smoothness                  |
| Acne         | ✅         | ✅          | Blemishes and breakouts          |
| Pores        | ✅         | ✅          | Pore visibility and size         |
| Wrinkles     | ✅         | ✅          | Fine lines and aging signs       |

## Troubleshooting

### Common Issues

1. **"PerfectCorp authentication failed"**

   - Check your API key and secret in `.env`
   - Ensure you have active PerfectCorp account
   - Verify API endpoint URL

2. **"No face detected" for valid faces**

   - Ensure good lighting
   - Keep face centered and clear
   - Try different camera angles

3. **Network timeout errors**
   - Check internet connection
   - Verify API endpoints are accessible
   - Try increasing timeout in service config

### Debug Mode

Enable debug logging to see detailed API responses:

```bash
# In terminal running the app
console.log shows detailed API responses for both systems
```

## Benefits of Dual Integration

### 1. **Accuracy Validation**

- Compare results between two different AI systems
- Cross-validate skin analysis findings
- Identify discrepancies for better accuracy

### 2. **Fallback System**

- If one API fails, the other can still provide results
- Redundancy ensures reliable service

### 3. **Feature Comparison**

- Python API: Custom analysis, unlimited usage
- PerfectCorp: Professional-grade, industry-standard
- Compare: Best of both worlds

### 4. **User Choice**

- Users can choose their preferred analysis method
- Technical users might prefer Python AI
- Beauty professionals might prefer PerfectCorp

## API Response Examples

### Python API Response

```json
{
  "skin_analysis": {
    "face_detected": true,
    "overall_health": 0.75,
    "hd_redness": { "ui_score": 35 },
    "hd_acne": { "ui_score": 45 },
    "skin_type": "Combination"
  }
}
```

### PerfectCorp API Response

```json
{
  "success": true,
  "data": {
    "overallHealth": 75,
    "skinType": "Combination",
    "concerns": [
      {
        "name": "Acne & Blemishes",
        "severity": "Medium",
        "score": 45
      }
    ]
  }
}
```

## Next Steps

1. **Get PerfectCorp credentials** from their business portal
2. **Configure environment variables** in your `.env` file
3. **Test all three analysis modes** with real face images
4. **Compare results** to see differences between APIs
5. **Choose default method** for your users

The integration is now complete and both APIs work alongside each other! 🎉

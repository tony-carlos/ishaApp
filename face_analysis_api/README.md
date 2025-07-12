# IsherCare Face Analysis API

A comprehensive face analysis API built with Python, FastAPI, and computer vision libraries. This API provides advanced facial feature detection, skin analysis, age estimation, and expression recognition.

## Features

### 🔍 Face Detection

- High-accuracy face detection using MediaPipe
- Facial landmark detection (468 points)
- Face quality assessment
- Multiple face handling

### 🧴 Skin Analysis

- **Comprehensive skin health assessment**
- Acne and blemish detection
- Wrinkle and fine line analysis
- Pore visibility assessment
- Skin texture evaluation
- Moisture level analysis
- Radiance and glow measurement
- Age spot detection
- Skin tone and undertone analysis
- Personalized skincare recommendations

### 👤 Facial Features Analysis

- Face shape classification (Round, Oval, Square, Heart, etc.)
- Eye analysis (shape, size, color detection)
- Nose analysis (width, length classification)
- Lip analysis (shape, fullness)
- Jawline definition assessment
- Cheekbone prominence analysis

### 🎂 Age Estimation

- AI-powered age estimation
- Confidence scoring
- Age range prediction
- Age group classification

### 😊 Expression Analysis

- Emotion detection (Happy, Sad, Angry, Surprise, Fear, Disgust, Neutral)
- Facial Action Unit (AU) analysis
- Expression intensity measurement
- Real-time emotion scoring

## Quick Start

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- OpenCV system dependencies

### Installation

1. **Clone or download the API files**

   ```bash
   cd face_analysis_api
   ```

2. **Run the setup script**

   ```bash
   python setup.py
   ```

3. **Activate the virtual environment**

   ```bash
   # On macOS/Linux
   source venv/bin/activate

   # On Windows
   venv\Scripts\activate
   ```

4. **Start the API server**
   ```bash
   python main.py
   ```

The API will be available at `http://localhost:8000`

### API Documentation

Once the server is running, visit:

- **Interactive API docs**: `http://localhost:8000/docs`
- **Alternative docs**: `http://localhost:8000/redoc`

## API Endpoints

### Health Check

```http
GET /health
```

Returns the health status of all analysis services.

### Face Detection

```http
POST /analyze/face-detection
Content-Type: multipart/form-data

{
  "file": <image_file>
}
```

### Skin Analysis

```http
POST /analyze/skin-analysis
Content-Type: multipart/form-data

{
  "file": <image_file>
}
```

### Facial Features Analysis

```http
POST /analyze/facial-features
Content-Type: multipart/form-data

{
  "file": <image_file>
}
```

### Age Estimation

```http
POST /analyze/age-estimation
Content-Type: multipart/form-data

{
  "file": <image_file>
}
```

### Expression Analysis

```http
POST /analyze/expression
Content-Type: multipart/form-data

{
  "file": <image_file>
}
```

### Comprehensive Analysis

```http
POST /analyze/comprehensive
Content-Type: multipart/form-data

{
  "file": <image_file>
}
```

## Response Format

All endpoints return JSON responses with the following structure:

```json
{
  "face_detection": {
    "has_face": true,
    "face_count": 1,
    "confidence": 0.95,
    "bounding_boxes": [...],
    "landmarks": {...},
    "message": "Face detected with high confidence"
  },
  "skin_analysis": {
    "hd_redness": {
      "raw_score": 0.2,
      "ui_score": 20.0,
      "severity": "Low",
      "confidence": 0.8
    },
    "skin_tone": {
      "category": "Fair",
      "hex": "#F4C2A1",
      "rgb": {"r": 244, "g": 194, "b": 161},
      "undertone": "Warm"
    },
    "skin_type": "Normal",
    "overall_health": 0.85,
    "recommended_treatments": [...]
  },
  "facial_features": {...},
  "age_estimation": {...},
  "expression_analysis": {...},
  "processing_time": 2.34,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Integration with React Native

The API is designed to integrate seamlessly with the IsherCare React Native app. Use the `PythonFaceAnalysisService` class:

```typescript
import pythonFaceAnalysisService from './services/PythonFaceAnalysisService';

// Perform comprehensive analysis
const result = await pythonFaceAnalysisService.analyzeFace(imageUri);

if (result.success) {
  console.log('Analysis completed:', result.data);
} else {
  console.error('Analysis failed:', result.error);
}
```

## Configuration

Edit the `.env` file to configure the API:

```env
# Server Configuration
HOST=0.0.0.0
PORT=8000
DEBUG=True

# API Configuration
MAX_UPLOAD_SIZE=10MB
MAX_CONCURRENT_REQUESTS=10

# Analysis Configuration
ENABLE_FACE_DETECTION=True
ENABLE_SKIN_ANALYSIS=True
ENABLE_FACIAL_FEATURES=True
ENABLE_AGE_ESTIMATION=True
ENABLE_EXPRESSION_ANALYSIS=True

# Performance Configuration
ENABLE_CACHING=True
CACHE_EXPIRY_SECONDS=3600
```

## Performance Optimization

- **Caching**: Results are cached for improved performance
- **Parallel Processing**: Multiple analyses run concurrently
- **Image Optimization**: Automatic image resizing and compression
- **Memory Management**: Efficient memory usage with cleanup

## Error Handling

The API provides comprehensive error handling:

- **400 Bad Request**: Invalid image format or missing file
- **413 Payload Too Large**: Image file too large
- **500 Internal Server Error**: Analysis processing error
- **503 Service Unavailable**: Service temporarily unavailable

## Deployment

### Local Development

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Production Deployment

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Docker Deployment

```bash
# Build Docker image
docker build -t ishercare-face-api .

# Run container
docker run -p 8000:8000 ishercare-face-api
```

## System Requirements

### Minimum Requirements

- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 2GB free space
- **Python**: 3.8+

### Recommended Requirements

- **CPU**: 4+ cores
- **RAM**: 8GB+
- **Storage**: 5GB+ free space
- **GPU**: Optional, for improved performance

## Troubleshooting

### Common Issues

1. **OpenCV Installation Issues**

   ```bash
   # Ubuntu/Debian
   sudo apt-get install libopencv-dev python3-opencv

   # macOS
   brew install opencv
   ```

2. **MediaPipe Installation Issues**

   ```bash
   pip install --upgrade mediapipe
   ```

3. **Memory Issues**

   - Reduce image size before analysis
   - Increase system memory
   - Enable image optimization

4. **Performance Issues**
   - Enable caching
   - Increase worker processes
   - Use GPU acceleration if available

### Logging

Logs are stored in the `logs/` directory:

- `logs/api.log`: General API logs
- `logs/analysis.log`: Analysis processing logs
- `logs/error.log`: Error logs

## API Limits

- **Maximum image size**: 10MB
- **Supported formats**: JPEG, PNG, BMP, TIFF
- **Maximum resolution**: 4096x4096
- **Concurrent requests**: 10 (configurable)

## Security

- **CORS**: Configurable origin restrictions
- **Rate limiting**: Prevents API abuse
- **Input validation**: Comprehensive file validation
- **Error sanitization**: Sensitive information protection

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:

- Create an issue in the repository
- Contact the development team
- Check the troubleshooting guide

---

**Built with ❤️ for IsherCare**

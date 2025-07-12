"""
Face Detection Service using OpenCV (simplified for Python 3.13 compatibility)
"""

import cv2
import numpy as np
from typing import Dict, List, Optional, Tuple
import time
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class FaceDetectionService:
    def __init__(self):
        """Initialize OpenCV face detection"""
        self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        self.eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')
        
        logger.info("Face Detection Service initialized successfully")

    async def health_check(self) -> Dict[str, str]:
        """Check if the service is healthy"""
        try:
            # Test with a simple image
            test_image = np.zeros((100, 100, 3), dtype=np.uint8)
            gray = cv2.cvtColor(test_image, cv2.COLOR_BGR2GRAY)
            self.face_cascade.detectMultiScale(gray)
            return {"status": "healthy", "message": "Face detection models loaded successfully"}
        except Exception as e:
            return {"status": "unhealthy", "message": f"Face detection service error: {str(e)}"}

    async def detect_faces(self, image: np.ndarray) -> Dict:
        """
        Detect faces in an image and extract basic landmarks
        
        Args:
            image: OpenCV image array (BGR format)
            
        Returns:
            Dictionary with face detection results
        """
        start_time = time.time()
        
        try:
            # Convert to grayscale for detection
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            height, width = image.shape[:2]
            
            # Detect faces
            faces = self.face_cascade.detectMultiScale(
                gray,
                scaleFactor=1.1,
                minNeighbors=5,
                minSize=(30, 30)
            )
            
            # Process results
            faces_found = []
            landmarks_data = None
            
            if len(faces) > 0:
                for (x, y, w, h) in faces:
                    faces_found.append({
                        'x': float(x),
                        'y': float(y),
                        'width': float(w),
                        'height': float(h)
                    })
                
                # Extract basic landmarks for the largest face
                if faces_found:
                    largest_face = max(faces_found, key=lambda f: f['width'] * f['height'])
                    landmarks_data = self._extract_basic_landmarks(largest_face, width, height)
            
            # Calculate confidence
            confidence = self._calculate_confidence(faces, image)
            
            # Generate message
            message = self._generate_message(len(faces_found), confidence)
            
            processing_time = time.time() - start_time
            
            result = {
                'face_detection': {
                    'has_face': len(faces_found) > 0,
                    'face_count': len(faces_found),
                    'confidence': confidence,
                    'bounding_boxes': faces_found,
                    'landmarks': landmarks_data,
                    'message': message
                },
                'processing_time': processing_time,
                'timestamp': datetime.utcnow().isoformat()
            }
            
            return result
            
        except Exception as e:
            logger.error(f"Face detection error: {str(e)}")
            return {
                'face_detection': {
                    'has_face': False,
                    'face_count': 0,
                    'confidence': 0.0,
                    'bounding_boxes': [],
                    'landmarks': None,
                    'message': f"Face detection failed: {str(e)}"
                },
                'processing_time': time.time() - start_time,
                'timestamp': datetime.utcnow().isoformat()
            }

    def _extract_basic_landmarks(self, face_bbox: Dict, width: int, height: int) -> Dict:
        """Extract basic facial landmarks using geometric approximation"""
        x, y, w, h = face_bbox['x'], face_bbox['y'], face_bbox['width'], face_bbox['height']
        
        # Basic landmark positions based on typical face proportions
        landmarks = {
            'left_eye': [{'x': x + w * 0.3, 'y': y + h * 0.4}],
            'right_eye': [{'x': x + w * 0.7, 'y': y + h * 0.4}],
            'nose': [
                {'x': x + w * 0.5, 'y': y + h * 0.55},
                {'x': x + w * 0.45, 'y': y + h * 0.6},
                {'x': x + w * 0.55, 'y': y + h * 0.6}
            ],
            'mouth': [
                {'x': x + w * 0.35, 'y': y + h * 0.75},
                {'x': x + w * 0.5, 'y': y + h * 0.78},
                {'x': x + w * 0.65, 'y': y + h * 0.75}
            ],
            'jawline': [
                {'x': x + w * 0.1, 'y': y + h * 0.6},
                {'x': x + w * 0.2, 'y': y + h * 0.8},
                {'x': x + w * 0.5, 'y': y + h * 0.95},
                {'x': x + w * 0.8, 'y': y + h * 0.8},
                {'x': x + w * 0.9, 'y': y + h * 0.6}
            ],
            'eyebrows': [
                {'x': x + w * 0.25, 'y': y + h * 0.3},
                {'x': x + w * 0.35, 'y': y + h * 0.25},
                {'x': x + w * 0.65, 'y': y + h * 0.25},
                {'x': x + w * 0.75, 'y': y + h * 0.3}
            ],
            'face_outline': [
                {'x': x, 'y': y + h * 0.2},
                {'x': x, 'y': y + h * 0.8},
                {'x': x + w * 0.2, 'y': y + h},
                {'x': x + w * 0.8, 'y': y + h},
                {'x': x + w, 'y': y + h * 0.8},
                {'x': x + w, 'y': y + h * 0.2},
                {'x': x + w * 0.8, 'y': y},
                {'x': x + w * 0.2, 'y': y}
            ]
        }
        
        return landmarks

    def _calculate_confidence(self, faces, image: np.ndarray) -> float:
        """Calculate overall confidence score for face detection"""
        if len(faces) == 0:
            return 0.0
        
        confidence = 0.5  # Base confidence for detection
        
        # Size factor - larger faces get higher confidence
        largest_face = max(faces, key=lambda f: f[2] * f[3])
        face_area = largest_face[2] * largest_face[3]
        image_area = image.shape[0] * image.shape[1]
        size_ratio = face_area / image_area
        
        if size_ratio > 0.1:  # Face is more than 10% of image
            confidence += 0.3
        elif size_ratio > 0.05:  # Face is more than 5% of image
            confidence += 0.2
        else:
            confidence += 0.1
        
        # Image quality factors
        height, width = image.shape[:2]
        
        # Resolution factor
        if width >= 640 and height >= 480:
            confidence += 0.1
        elif width >= 320 and height >= 240:
            confidence += 0.05
        
        # Brightness factor
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        brightness = np.mean(gray)
        if 50 <= brightness <= 200:  # Good brightness range
            confidence += 0.1
        
        return round(min(1.0, confidence), 3)

    def _generate_message(self, face_count: int, confidence: float) -> str:
        """Generate appropriate message based on detection results"""
        if face_count == 0:
            return "No face detected. Please ensure the image contains a clear, well-lit face."
        elif face_count == 1:
            if confidence >= 0.8:
                return f"Face detected with high confidence ({confidence:.1%}). Excellent quality for analysis."
            elif confidence >= 0.6:
                return f"Face detected with good confidence ({confidence:.1%}). Suitable for analysis."
            else:
                return f"Face detected with low confidence ({confidence:.1%}). Consider improving lighting or image quality."
        else:
            return f"Multiple faces detected ({face_count}). Using the most prominent face for analysis."

    def get_face_region(self, image: np.ndarray, bounding_box: Dict) -> np.ndarray:
        """Extract face region from image using bounding box"""
        x = int(bounding_box['x'])
        y = int(bounding_box['y'])
        w = int(bounding_box['width'])
        h = int(bounding_box['height'])
        
        # Ensure coordinates are within image bounds
        height, width = image.shape[:2]
        x = max(0, min(x, width - 1))
        y = max(0, min(y, height - 1))
        w = max(1, min(w, width - x))
        h = max(1, min(h, height - y))
        
        return image[y:y+h, x:x+w]

    def analyze_face_quality(self, image: np.ndarray, bounding_box: Dict) -> Dict:
        """Analyze the quality of detected face for further processing"""
        face_region = self.get_face_region(image, bounding_box)
        
        # Convert to grayscale for analysis
        gray_face = cv2.cvtColor(face_region, cv2.COLOR_BGR2GRAY)
        
        # Calculate various quality metrics
        # Brightness
        brightness = np.mean(gray_face)
        
        # Contrast
        contrast = np.std(gray_face)
        
        # Sharpness (Laplacian variance)
        sharpness = cv2.Laplacian(gray_face, cv2.CV_64F).var()
        
        # Size adequacy
        height, width = face_region.shape[:2]
        size_score = min(1.0, (width * height) / (200 * 200))
        
        # Overall quality score
        quality_score = (
            min(1.0, brightness / 128) * 0.3 +
            min(1.0, contrast / 64) * 0.2 +
            min(1.0, sharpness / 100) * 0.3 +
            size_score * 0.2
        )
        
        return {
            'brightness': round(brightness, 2),
            'contrast': round(contrast, 2),
            'sharpness': round(sharpness, 2),
            'size_score': round(size_score, 3),
            'quality_score': round(quality_score, 3),
            'recommendations': self._generate_quality_recommendations(
                brightness, contrast, sharpness, size_score
            )
        }

    def _generate_quality_recommendations(self, brightness: float, contrast: float, 
                                        sharpness: float, size_score: float) -> List[str]:
        """Generate recommendations to improve face image quality"""
        recommendations = []
        
        if brightness < 80:
            recommendations.append("Increase lighting - image appears too dark")
        elif brightness > 180:
            recommendations.append("Reduce lighting - image appears too bright")
        
        if contrast < 40:
            recommendations.append("Improve contrast - image appears too flat")
        
        if sharpness < 50:
            recommendations.append("Improve focus - image appears blurry")
        
        if size_score < 0.5:
            recommendations.append("Move closer to camera - face appears too small")
        
        if not recommendations:
            recommendations.append("Image quality is good for analysis")
        
        return recommendations 
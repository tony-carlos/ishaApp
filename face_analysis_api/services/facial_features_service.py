"""
Facial Features Analysis Service using Computer Vision
"""

import cv2
import numpy as np
from typing import Dict, List, Optional, Tuple
import time
import logging
from datetime import datetime
import math

logger = logging.getLogger(__name__)

class FacialFeaturesService:
    def __init__(self):
        """Initialize facial features analysis service"""
        self.face_shape_analyzer = FaceShapeAnalyzer()
        self.eye_analyzer = EyeAnalyzer()
        self.nose_analyzer = NoseAnalyzer()
        self.lip_analyzer = LipAnalyzer()
        self.jawline_analyzer = JawlineAnalyzer()
        
        logger.info("Facial Features Analysis Service initialized successfully")

    async def health_check(self) -> Dict[str, str]:
        """Check if the service is healthy"""
        try:
            # Test with a simple image
            test_image = np.zeros((100, 100, 3), dtype=np.uint8)
            await self.analyze_features(test_image)
            return {"status": "healthy", "message": "Facial features analysis service ready"}
        except Exception as e:
            return {"status": "unhealthy", "message": f"Facial features service error: {str(e)}"}

    async def analyze_features(self, image: np.ndarray) -> Dict:
        """
        Analyze facial features
        
        Args:
            image: OpenCV image array (BGR format)
            
        Returns:
            Dictionary with facial features analysis results
        """
        start_time = time.time()
        
        try:
            # Convert to RGB if needed
            if len(image.shape) == 3 and image.shape[2] == 3:
                rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            else:
                rgb_image = image
            
            # Detect face landmarks (using a simple approach)
            landmarks = self._detect_facial_landmarks(rgb_image)
            
            if not landmarks:
                return self._get_default_features_analysis(start_time)
            
            # Analyze different facial features
            face_shape = self.face_shape_analyzer.analyze(rgb_image, landmarks)
            left_eye = self.eye_analyzer.analyze(rgb_image, landmarks, 'left')
            right_eye = self.eye_analyzer.analyze(rgb_image, landmarks, 'right')
            nose = self.nose_analyzer.analyze(rgb_image, landmarks)
            lips = self.lip_analyzer.analyze(rgb_image, landmarks)
            jawline = self.jawline_analyzer.analyze(rgb_image, landmarks)
            
            processing_time = time.time() - start_time
            
            result = {
                'facial_features': {
                    'face_shape': face_shape,
                    'left_eye': left_eye,
                    'right_eye': right_eye,
                    'nose_width': nose['width_category'],
                    'nose_length': nose['length_category'],
                    'lip_shape': lips['shape'],
                    'lip_fullness': lips['fullness'],
                    'cheekbone_prominence': self._analyze_cheekbones(rgb_image, landmarks),
                    'jawline_definition': jawline['definition']
                },
                'processing_time': processing_time,
                'timestamp': datetime.utcnow().isoformat()
            }
            
            return result
            
        except Exception as e:
            logger.error(f"Facial features analysis error: {str(e)}")
            return self._get_default_features_analysis(start_time)

    def _detect_facial_landmarks(self, image: np.ndarray) -> Optional[Dict]:
        """Detect facial landmarks using simplified approach"""
        # This is a simplified landmark detection
        # In a real implementation, you'd use MediaPipe or dlib
        
        gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        height, width = gray.shape
        
        # Use face detection to estimate landmark positions
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        faces = face_cascade.detectMultiScale(gray, 1.3, 5)
        
        if len(faces) == 0:
            return None
        
        # Use the largest face
        face = max(faces, key=lambda f: f[2] * f[3])
        x, y, w, h = face
        
        # Estimate landmark positions based on face bounding box
        landmarks = {
            'left_eye': (x + w * 0.35, y + h * 0.35),
            'right_eye': (x + w * 0.65, y + h * 0.35),
            'nose_tip': (x + w * 0.5, y + h * 0.55),
            'mouth_center': (x + w * 0.5, y + h * 0.75),
            'left_mouth': (x + w * 0.4, y + h * 0.75),
            'right_mouth': (x + w * 0.6, y + h * 0.75),
            'chin': (x + w * 0.5, y + h * 0.95),
            'left_cheek': (x + w * 0.25, y + h * 0.6),
            'right_cheek': (x + w * 0.75, y + h * 0.6),
            'forehead': (x + w * 0.5, y + h * 0.15),
            'face_bounds': (x, y, w, h)
        }
        
        return landmarks

    def _analyze_cheekbones(self, image: np.ndarray, landmarks: Dict) -> str:
        """Analyze cheekbone prominence"""
        if not landmarks:
            return "Average"
        
        left_cheek = landmarks.get('left_cheek')
        right_cheek = landmarks.get('right_cheek')
        nose_tip = landmarks.get('nose_tip')
        
        if not all([left_cheek, right_cheek, nose_tip]):
            return "Average"
        
        # Calculate the distance from cheekbones to nose
        left_distance = np.linalg.norm(np.array(left_cheek) - np.array(nose_tip))
        right_distance = np.linalg.norm(np.array(right_cheek) - np.array(nose_tip))
        
        avg_distance = (left_distance + right_distance) / 2
        
        # Analyze image intensity at cheekbone areas
        gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        
        # Extract regions around cheekbones
        left_region = self._extract_region(gray, left_cheek, 20)
        right_region = self._extract_region(gray, right_cheek, 20)
        
        # Calculate prominence based on contrast
        if left_region.size > 0 and right_region.size > 0:
            left_contrast = np.std(left_region)
            right_contrast = np.std(right_region)
            avg_contrast = (left_contrast + right_contrast) / 2
            
            if avg_contrast > 25:
                return "High"
            elif avg_contrast > 15:
                return "Average"
            else:
                return "Low"
        
        return "Average"

    def _extract_region(self, image: np.ndarray, center: Tuple[float, float], radius: int) -> np.ndarray:
        """Extract a circular region from image"""
        height, width = image.shape[:2]
        cx, cy = int(center[0]), int(center[1])
        
        # Ensure region is within bounds
        x1 = max(0, cx - radius)
        y1 = max(0, cy - radius)
        x2 = min(width, cx + radius)
        y2 = min(height, cy + radius)
        
        return image[y1:y2, x1:x2]

    def _get_default_features_analysis(self, start_time: float) -> Dict:
        """Get default features analysis for error cases"""
        return {
            'facial_features': {
                'face_shape': {
                    'type': 'Oval',
                    'confidence': 0.0,
                    'measurements': {'width': 0, 'height': 0, 'aspect_ratio': 0}
                },
                'left_eye': {
                    'shape': 'Almond',
                    'size': 'Average',
                    'color': 'Brown',
                    'color_hex': '#8B4513',
                    'open_probability': 0.5
                },
                'right_eye': {
                    'shape': 'Almond',
                    'size': 'Average',
                    'color': 'Brown',
                    'color_hex': '#8B4513',
                    'open_probability': 0.5
                },
                'nose_width': 'Average',
                'nose_length': 'Average',
                'lip_shape': 'Average',
                'lip_fullness': 'Average',
                'cheekbone_prominence': 'Average',
                'jawline_definition': 'Average'
            },
            'processing_time': time.time() - start_time,
            'timestamp': datetime.utcnow().isoformat()
        }


class FaceShapeAnalyzer:
    def __init__(self):
        self.shape_ratios = {
            'Round': {'min_ratio': 0.9, 'max_ratio': 1.1},
            'Oval': {'min_ratio': 1.2, 'max_ratio': 1.4},
            'Square': {'min_ratio': 0.9, 'max_ratio': 1.1},
            'Oblong': {'min_ratio': 1.4, 'max_ratio': 1.8},
            'Heart': {'min_ratio': 1.1, 'max_ratio': 1.3},
            'Diamond': {'min_ratio': 1.1, 'max_ratio': 1.3}
        }

    def analyze(self, image: np.ndarray, landmarks: Dict) -> Dict:
        """Analyze face shape"""
        if not landmarks or 'face_bounds' not in landmarks:
            return self._get_default_shape()
        
        x, y, w, h = landmarks['face_bounds']
        aspect_ratio = h / w if w > 0 else 1.0
        
        # Determine face shape based on aspect ratio
        best_shape = 'Oval'
        best_confidence = 0.0
        
        for shape, ratios in self.shape_ratios.items():
            if ratios['min_ratio'] <= aspect_ratio <= ratios['max_ratio']:
                # Calculate confidence based on how close to center of range
                center = (ratios['min_ratio'] + ratios['max_ratio']) / 2
                distance = abs(aspect_ratio - center)
                range_size = ratios['max_ratio'] - ratios['min_ratio']
                confidence = 1 - (distance / (range_size / 2))
                
                if confidence > best_confidence:
                    best_confidence = confidence
                    best_shape = shape
        
        # Additional analysis for more accuracy
        jawline_width = self._analyze_jawline_width(image, landmarks)
        forehead_width = self._analyze_forehead_width(image, landmarks)
        
        # Refine shape based on width ratios
        if jawline_width and forehead_width:
            width_ratio = forehead_width / jawline_width
            
            if width_ratio > 1.15:
                best_shape = 'Heart'
                best_confidence = min(best_confidence + 0.2, 1.0)
            elif width_ratio < 0.85:
                best_shape = 'Diamond'
                best_confidence = min(best_confidence + 0.1, 1.0)
        
        return {
            'type': best_shape,
            'confidence': round(best_confidence, 3),
            'measurements': {
                'width': w,
                'height': h,
                'aspect_ratio': round(aspect_ratio, 3)
            }
        }

    def _analyze_jawline_width(self, image: np.ndarray, landmarks: Dict) -> Optional[float]:
        """Analyze jawline width"""
        if 'chin' in landmarks and 'face_bounds' in landmarks:
            _, _, w, _ = landmarks['face_bounds']
            return w * 0.8  # Approximate jawline width
        return None

    def _analyze_forehead_width(self, image: np.ndarray, landmarks: Dict) -> Optional[float]:
        """Analyze forehead width"""
        if 'forehead' in landmarks and 'face_bounds' in landmarks:
            _, _, w, _ = landmarks['face_bounds']
            return w * 0.9  # Approximate forehead width
        return None

    def _get_default_shape(self) -> Dict:
        """Get default shape analysis"""
        return {
            'type': 'Oval',
            'confidence': 0.0,
            'measurements': {'width': 0, 'height': 0, 'aspect_ratio': 0}
        }


class EyeAnalyzer:
    def analyze(self, image: np.ndarray, landmarks: Dict, eye_side: str) -> Dict:
        """Analyze eye features"""
        eye_key = f'{eye_side}_eye'
        
        if not landmarks or eye_key not in landmarks:
            return self._get_default_eye()
        
        eye_center = landmarks[eye_key]
        
        # Extract eye region
        eye_region = self._extract_eye_region(image, eye_center)
        
        # Analyze eye shape
        eye_shape = self._analyze_eye_shape(eye_region)
        
        # Analyze eye size
        eye_size = self._analyze_eye_size(eye_region)
        
        # Analyze eye color
        eye_color, color_hex = self._analyze_eye_color(eye_region)
        
        # Analyze open probability
        open_probability = self._analyze_open_probability(eye_region)
        
        return {
            'shape': eye_shape,
            'size': eye_size,
            'color': eye_color,
            'color_hex': color_hex,
            'open_probability': open_probability
        }

    def _extract_eye_region(self, image: np.ndarray, eye_center: Tuple[float, float]) -> np.ndarray:
        """Extract eye region from image"""
        height, width = image.shape[:2]
        cx, cy = int(eye_center[0]), int(eye_center[1])
        
        # Define eye region (approximately 40x20 pixels)
        eye_width, eye_height = 40, 20
        
        x1 = max(0, cx - eye_width // 2)
        y1 = max(0, cy - eye_height // 2)
        x2 = min(width, cx + eye_width // 2)
        y2 = min(height, cy + eye_height // 2)
        
        return image[y1:y2, x1:x2]

    def _analyze_eye_shape(self, eye_region: np.ndarray) -> str:
        """Analyze eye shape"""
        if eye_region.size == 0:
            return 'Almond'
        
        # Analyze aspect ratio of eye region
        height, width = eye_region.shape[:2]
        aspect_ratio = width / height if height > 0 else 2.0
        
        if aspect_ratio > 2.5:
            return 'Narrow'
        elif aspect_ratio < 1.8:
            return 'Round'
        else:
            return 'Almond'

    def _analyze_eye_size(self, eye_region: np.ndarray) -> str:
        """Analyze eye size"""
        if eye_region.size == 0:
            return 'Average'
        
        # Calculate area of eye region
        area = eye_region.shape[0] * eye_region.shape[1]
        
        if area > 1000:
            return 'Big'
        elif area < 600:
            return 'Small'
        else:
            return 'Average'

    def _analyze_eye_color(self, eye_region: np.ndarray) -> Tuple[str, str]:
        """Analyze eye color"""
        if eye_region.size == 0:
            return 'Brown', '#8B4513'
        
        # Focus on center of eye region (iris area)
        center_h, center_w = eye_region.shape[:2]
        iris_region = eye_region[
            center_h//4:3*center_h//4,
            center_w//4:3*center_w//4
        ]
        
        if iris_region.size == 0:
            return 'Brown', '#8B4513'
        
        # Calculate average color
        avg_color = np.mean(iris_region.reshape(-1, 3), axis=0)
        r, g, b = avg_color.astype(int)
        
        # Convert to hex
        hex_color = f'#{r:02x}{g:02x}{b:02x}'
        
        # Determine eye color category
        if b > r and b > g:
            if b > 150:
                return 'Blue', hex_color
            else:
                return 'Gray', hex_color
        elif g > r and g > b:
            return 'Green', hex_color
        elif r > 100 and g > 80 and b < 60:
            return 'Hazel', hex_color
        else:
            return 'Brown', hex_color

    def _analyze_open_probability(self, eye_region: np.ndarray) -> float:
        """Analyze probability that eye is open"""
        if eye_region.size == 0:
            return 0.5
        
        # Convert to grayscale
        gray = cv2.cvtColor(eye_region, cv2.COLOR_RGB2GRAY)
        
        # Calculate vertical intensity variation
        vertical_profile = np.mean(gray, axis=1)
        variation = np.std(vertical_profile)
        
        # Higher variation suggests open eye
        open_probability = min(1.0, variation / 30)
        
        return round(open_probability, 3)

    def _get_default_eye(self) -> Dict:
        """Get default eye analysis"""
        return {
            'shape': 'Almond',
            'size': 'Average',
            'color': 'Brown',
            'color_hex': '#8B4513',
            'open_probability': 0.5
        }


class NoseAnalyzer:
    def analyze(self, image: np.ndarray, landmarks: Dict) -> Dict:
        """Analyze nose features"""
        if not landmarks or 'nose_tip' not in landmarks:
            return self._get_default_nose()
        
        nose_tip = landmarks['nose_tip']
        face_bounds = landmarks.get('face_bounds', (0, 0, 100, 100))
        
        # Extract nose region
        nose_region = self._extract_nose_region(image, nose_tip, face_bounds)
        
        # Analyze nose width
        width_category = self._analyze_nose_width(nose_region, face_bounds)
        
        # Analyze nose length
        length_category = self._analyze_nose_length(nose_region, face_bounds)
        
        return {
            'width_category': width_category,
            'length_category': length_category
        }

    def _extract_nose_region(self, image: np.ndarray, nose_tip: Tuple[float, float], 
                           face_bounds: Tuple[int, int, int, int]) -> np.ndarray:
        """Extract nose region from image"""
        height, width = image.shape[:2]
        cx, cy = int(nose_tip[0]), int(nose_tip[1])
        
        # Define nose region based on face size
        _, _, face_w, face_h = face_bounds
        nose_width = max(30, face_w // 4)
        nose_height = max(40, face_h // 3)
        
        x1 = max(0, cx - nose_width // 2)
        y1 = max(0, cy - nose_height // 2)
        x2 = min(width, cx + nose_width // 2)
        y2 = min(height, cy + nose_height // 2)
        
        return image[y1:y2, x1:x2]

    def _analyze_nose_width(self, nose_region: np.ndarray, face_bounds: Tuple[int, int, int, int]) -> str:
        """Analyze nose width"""
        if nose_region.size == 0:
            return 'Average'
        
        _, _, face_w, _ = face_bounds
        nose_width = nose_region.shape[1]
        
        # Calculate width ratio relative to face
        width_ratio = nose_width / face_w if face_w > 0 else 0.25
        
        if width_ratio > 0.3:
            return 'Broad'
        elif width_ratio < 0.2:
            return 'Narrow'
        else:
            return 'Average'

    def _analyze_nose_length(self, nose_region: np.ndarray, face_bounds: Tuple[int, int, int, int]) -> str:
        """Analyze nose length"""
        if nose_region.size == 0:
            return 'Average'
        
        _, _, _, face_h = face_bounds
        nose_height = nose_region.shape[0]
        
        # Calculate length ratio relative to face
        length_ratio = nose_height / face_h if face_h > 0 else 0.33
        
        if length_ratio > 0.4:
            return 'Long'
        elif length_ratio < 0.25:
            return 'Short'
        else:
            return 'Average'

    def _get_default_nose(self) -> Dict:
        """Get default nose analysis"""
        return {
            'width_category': 'Average',
            'length_category': 'Average'
        }


class LipAnalyzer:
    def analyze(self, image: np.ndarray, landmarks: Dict) -> Dict:
        """Analyze lip features"""
        if not landmarks or 'mouth_center' not in landmarks:
            return self._get_default_lips()
        
        mouth_center = landmarks['mouth_center']
        left_mouth = landmarks.get('left_mouth', mouth_center)
        right_mouth = landmarks.get('right_mouth', mouth_center)
        
        # Extract lip region
        lip_region = self._extract_lip_region(image, mouth_center, left_mouth, right_mouth)
        
        # Analyze lip shape
        lip_shape = self._analyze_lip_shape(lip_region)
        
        # Analyze lip fullness
        lip_fullness = self._analyze_lip_fullness(lip_region)
        
        return {
            'shape': lip_shape,
            'fullness': lip_fullness
        }

    def _extract_lip_region(self, image: np.ndarray, mouth_center: Tuple[float, float],
                           left_mouth: Tuple[float, float], right_mouth: Tuple[float, float]) -> np.ndarray:
        """Extract lip region from image"""
        height, width = image.shape[:2]
        cx, cy = int(mouth_center[0]), int(mouth_center[1])
        
        # Calculate mouth width
        mouth_width = int(abs(right_mouth[0] - left_mouth[0]))
        mouth_height = max(20, mouth_width // 3)
        
        x1 = max(0, cx - mouth_width // 2)
        y1 = max(0, cy - mouth_height // 2)
        x2 = min(width, cx + mouth_width // 2)
        y2 = min(height, cy + mouth_height // 2)
        
        return image[y1:y2, x1:x2]

    def _analyze_lip_shape(self, lip_region: np.ndarray) -> str:
        """Analyze lip shape"""
        if lip_region.size == 0:
            return 'Average'
        
        # Analyze aspect ratio
        height, width = lip_region.shape[:2]
        aspect_ratio = width / height if height > 0 else 3.0
        
        if aspect_ratio > 4.0:
            return 'Wide'
        elif aspect_ratio < 2.5:
            return 'Round'
        else:
            return 'Average'

    def _analyze_lip_fullness(self, lip_region: np.ndarray) -> str:
        """Analyze lip fullness"""
        if lip_region.size == 0:
            return 'Average'
        
        # Analyze vertical thickness
        height = lip_region.shape[0]
        
        if height > 25:
            return 'Full'
        elif height < 15:
            return 'Thin'
        else:
            return 'Average'

    def _get_default_lips(self) -> Dict:
        """Get default lip analysis"""
        return {
            'shape': 'Average',
            'fullness': 'Average'
        }


class JawlineAnalyzer:
    def analyze(self, image: np.ndarray, landmarks: Dict) -> Dict:
        """Analyze jawline definition"""
        if not landmarks or 'chin' not in landmarks:
            return {'definition': 'Average'}
        
        chin = landmarks['chin']
        face_bounds = landmarks.get('face_bounds', (0, 0, 100, 100))
        
        # Extract jawline region
        jawline_region = self._extract_jawline_region(image, chin, face_bounds)
        
        # Analyze definition
        definition = self._analyze_jawline_definition(jawline_region)
        
        return {
            'definition': definition
        }

    def _extract_jawline_region(self, image: np.ndarray, chin: Tuple[float, float],
                               face_bounds: Tuple[int, int, int, int]) -> np.ndarray:
        """Extract jawline region from image"""
        height, width = image.shape[:2]
        cx, cy = int(chin[0]), int(chin[1])
        
        # Define jawline region
        _, _, face_w, face_h = face_bounds
        jaw_width = max(60, face_w // 2)
        jaw_height = max(40, face_h // 4)
        
        x1 = max(0, cx - jaw_width // 2)
        y1 = max(0, cy - jaw_height // 2)
        x2 = min(width, cx + jaw_width // 2)
        y2 = min(height, cy + jaw_height // 2)
        
        return image[y1:y2, x1:x2]

    def _analyze_jawline_definition(self, jawline_region: np.ndarray) -> str:
        """Analyze jawline definition"""
        if jawline_region.size == 0:
            return 'Average'
        
        # Convert to grayscale
        gray = cv2.cvtColor(jawline_region, cv2.COLOR_RGB2GRAY)
        
        # Calculate edge strength
        edges = cv2.Canny(gray, 50, 150)
        edge_strength = np.sum(edges) / edges.size
        
        if edge_strength > 0.1:
            return 'Sharp'
        elif edge_strength < 0.05:
            return 'Soft'
        else:
            return 'Average' 
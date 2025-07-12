"""
Age Estimation Service using Computer Vision
"""

import cv2
import numpy as np
from typing import Dict, List, Optional, Tuple
import time
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class AgeEstimationService:
    def __init__(self):
        """Initialize age estimation service"""
        self.age_indicators = {
            'wrinkles': {'weight': 0.3, 'base_age': 30},
            'skin_texture': {'weight': 0.2, 'base_age': 25},
            'eye_area': {'weight': 0.15, 'base_age': 35},
            'facial_volume': {'weight': 0.15, 'base_age': 40},
            'hair_characteristics': {'weight': 0.1, 'base_age': 30},
            'skin_tone': {'weight': 0.1, 'base_age': 25}
        }
        
        logger.info("Age Estimation Service initialized successfully")

    async def health_check(self) -> Dict[str, str]:
        """Check if the service is healthy"""
        try:
            # Test with a simple image
            test_image = np.zeros((100, 100, 3), dtype=np.uint8)
            await self.estimate_age(test_image)
            return {"status": "healthy", "message": "Age estimation service ready"}
        except Exception as e:
            return {"status": "unhealthy", "message": f"Age estimation service error: {str(e)}"}

    async def estimate_age(self, image: np.ndarray) -> Dict:
        """
        Estimate age from facial features
        
        Args:
            image: OpenCV image array (BGR format)
            
        Returns:
            Dictionary with age estimation results
        """
        start_time = time.time()
        
        try:
            # Convert to RGB if needed
            if len(image.shape) == 3 and image.shape[2] == 3:
                rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            else:
                rgb_image = image
            
            # Detect face region
            face_region, face_bbox = self._detect_face_region(rgb_image)
            
            if face_region is None:
                return self._get_default_age_estimation(start_time)
            
            # Analyze different age indicators
            wrinkle_score = self._analyze_wrinkles(face_region)
            texture_score = self._analyze_skin_texture(face_region)
            eye_area_score = self._analyze_eye_area(face_region, face_bbox)
            volume_score = self._analyze_facial_volume(face_region)
            hair_score = self._analyze_hair_characteristics(rgb_image, face_bbox)
            skin_tone_score = self._analyze_skin_tone(face_region)
            
            # Calculate weighted age estimate
            estimated_age = self._calculate_weighted_age(
                wrinkle_score, texture_score, eye_area_score,
                volume_score, hair_score, skin_tone_score
            )
            
            # Determine age range and confidence
            age_range = self._calculate_age_range(estimated_age)
            confidence = self._calculate_confidence(
                wrinkle_score, texture_score, eye_area_score,
                volume_score, hair_score, skin_tone_score
            )
            
            # Determine age group
            age_group = self._determine_age_group(estimated_age)
            
            processing_time = time.time() - start_time
            
            result = {
                'age_estimation': {
                    'estimated_age': round(estimated_age, 1),
                    'age_range': age_range,
                    'confidence': round(confidence, 3),
                    'age_group': age_group
                },
                'processing_time': processing_time,
                'timestamp': datetime.utcnow().isoformat()
            }
            
            return result
            
        except Exception as e:
            logger.error(f"Age estimation error: {str(e)}")
            return self._get_default_age_estimation(start_time)

    def _detect_face_region(self, image: np.ndarray) -> Tuple[Optional[np.ndarray], Optional[Tuple[int, int, int, int]]]:
        """Detect face region in image"""
        gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        
        # Use Haar cascade for face detection
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        faces = face_cascade.detectMultiScale(gray, 1.3, 5)
        
        if len(faces) == 0:
            return None, None
        
        # Use the largest face
        face = max(faces, key=lambda f: f[2] * f[3])
        x, y, w, h = face
        
        # Extract face region with some padding
        padding = 20
        x1 = max(0, x - padding)
        y1 = max(0, y - padding)
        x2 = min(image.shape[1], x + w + padding)
        y2 = min(image.shape[0], y + h + padding)
        
        face_region = image[y1:y2, x1:x2]
        
        return face_region, (x, y, w, h)

    def _analyze_wrinkles(self, face_region: np.ndarray) -> float:
        """Analyze wrinkle density and depth"""
        if face_region.size == 0:
            return 0.0
        
        gray = cv2.cvtColor(face_region, cv2.COLOR_RGB2GRAY)
        
        # Use Hessian-based line detection for wrinkles
        # Calculate second derivatives
        xx = cv2.Sobel(cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3), cv2.CV_64F, 1, 0, ksize=3)
        xy = cv2.Sobel(cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3), cv2.CV_64F, 0, 1, ksize=3)
        yy = cv2.Sobel(cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3), cv2.CV_64F, 0, 1, ksize=3)
        
        # Calculate eigenvalues for ridge detection
        trace = xx + yy
        det = xx * yy - xy * xy
        
        # Wrinkle strength
        wrinkle_strength = np.abs(trace - np.sqrt(np.clip(trace**2 - 4*det, 0, None)))
        wrinkle_strength = np.nan_to_num(wrinkle_strength)
        
        # Normalize and return score
        wrinkle_score = np.mean(wrinkle_strength) / 50
        
        return min(1.0, wrinkle_score)

    def _analyze_skin_texture(self, face_region: np.ndarray) -> float:
        """Analyze skin texture roughness"""
        if face_region.size == 0:
            return 0.0
        
        gray = cv2.cvtColor(face_region, cv2.COLOR_RGB2GRAY)
        
        # Calculate texture using Local Binary Pattern
        from skimage import feature
        
        # LBP for texture analysis
        lbp = feature.local_binary_pattern(gray, 8, 1, method='uniform')
        
        # Calculate texture roughness
        lbp_var = np.var(lbp)
        texture_score = lbp_var / 100
        
        return min(1.0, texture_score)

    def _analyze_eye_area(self, face_region: np.ndarray, face_bbox: Tuple[int, int, int, int]) -> float:
        """Analyze eye area for aging signs"""
        if face_region.size == 0:
            return 0.0
        
        height, width = face_region.shape[:2]
        
        # Define eye regions (approximate)
        left_eye_region = face_region[
            int(height * 0.25):int(height * 0.45),
            int(width * 0.2):int(width * 0.45)
        ]
        
        right_eye_region = face_region[
            int(height * 0.25):int(height * 0.45),
            int(width * 0.55):int(width * 0.8)
        ]
        
        # Analyze both eye regions
        scores = []
        for eye_region in [left_eye_region, right_eye_region]:
            if eye_region.size > 0:
                gray_eye = cv2.cvtColor(eye_region, cv2.COLOR_RGB2GRAY)
                
                # Look for dark circles and bags
                mean_brightness = np.mean(gray_eye)
                std_brightness = np.std(gray_eye)
                
                # Dark areas indicate aging
                dark_score = (128 - mean_brightness) / 128
                variation_score = std_brightness / 64
                
                eye_score = (dark_score + variation_score) / 2
                scores.append(min(1.0, eye_score))
        
        return np.mean(scores) if scores else 0.0

    def _analyze_facial_volume(self, face_region: np.ndarray) -> float:
        """Analyze facial volume loss (cheek and temple areas)"""
        if face_region.size == 0:
            return 0.0
        
        gray = cv2.cvtColor(face_region, cv2.COLOR_RGB2GRAY)
        height, width = gray.shape
        
        # Define cheek regions
        left_cheek = gray[
            int(height * 0.4):int(height * 0.7),
            int(width * 0.1):int(width * 0.4)
        ]
        
        right_cheek = gray[
            int(height * 0.4):int(height * 0.7),
            int(width * 0.6):int(width * 0.9)
        ]
        
        # Analyze volume using brightness gradients
        volume_scores = []
        
        for cheek in [left_cheek, right_cheek]:
            if cheek.size > 0:
                # Calculate gradients
                grad_x = cv2.Sobel(cheek, cv2.CV_64F, 1, 0, ksize=3)
                grad_y = cv2.Sobel(cheek, cv2.CV_64F, 0, 1, ksize=3)
                
                # Volume loss creates more pronounced gradients
                gradient_magnitude = np.sqrt(grad_x**2 + grad_y**2)
                volume_score = np.mean(gradient_magnitude) / 50
                
                volume_scores.append(min(1.0, volume_score))
        
        return np.mean(volume_scores) if volume_scores else 0.0

    def _analyze_hair_characteristics(self, image: np.ndarray, face_bbox: Tuple[int, int, int, int]) -> float:
        """Analyze hair characteristics for aging signs"""
        if face_bbox is None:
            return 0.0
        
        x, y, w, h = face_bbox
        
        # Define hair region (above the face)
        hair_region = image[
            max(0, y - h//2):y + h//4,
            max(0, x - w//4):min(image.shape[1], x + w + w//4)
        ]
        
        if hair_region.size == 0:
            return 0.0
        
        # Convert to grayscale for hair analysis
        gray_hair = cv2.cvtColor(hair_region, cv2.COLOR_RGB2GRAY)
        
        # Analyze hair density and color
        hair_density = np.std(gray_hair)  # Hair creates more variation
        hair_brightness = np.mean(gray_hair)  # Gray hair is brighter
        
        # Calculate aging score
        density_score = 1 - min(1.0, hair_density / 50)  # Lower density = older
        brightness_score = min(1.0, hair_brightness / 150)  # Brighter = grayer = older
        
        return (density_score + brightness_score) / 2

    def _analyze_skin_tone(self, face_region: np.ndarray) -> float:
        """Analyze skin tone for aging indicators"""
        if face_region.size == 0:
            return 0.0
        
        # Convert to LAB color space
        lab = cv2.cvtColor(face_region, cv2.COLOR_RGB2LAB)
        
        # Extract L, A, B channels
        l_channel = lab[:, :, 0]
        a_channel = lab[:, :, 1]
        b_channel = lab[:, :, 2]
        
        # Analyze skin tone characteristics
        # Older skin tends to have more yellow (higher b values)
        # and less uniform color distribution
        
        yellowness = np.mean(b_channel) - 128  # B channel centered at 128
        color_uniformity = 1 - (np.std(l_channel) / 64)
        
        # Calculate aging score
        yellow_score = min(1.0, yellowness / 20)
        uniformity_score = 1 - color_uniformity
        
        return (yellow_score + uniformity_score) / 2

    def _calculate_weighted_age(self, wrinkle_score: float, texture_score: float,
                              eye_area_score: float, volume_score: float,
                              hair_score: float, skin_tone_score: float) -> float:
        """Calculate weighted age estimate"""
        base_age = 25  # Base age for young adult
        
        # Calculate age contributions from each factor
        wrinkle_age = base_age + (wrinkle_score * 40)  # Wrinkles add 0-40 years
        texture_age = base_age + (texture_score * 30)  # Texture adds 0-30 years
        eye_age = base_age + (eye_area_score * 35)     # Eye area adds 0-35 years
        volume_age = base_age + (volume_score * 25)    # Volume loss adds 0-25 years
        hair_age = base_age + (hair_score * 30)        # Hair adds 0-30 years
        skin_tone_age = base_age + (skin_tone_score * 20)  # Skin tone adds 0-20 years
        
        # Weight the contributions
        weighted_age = (
            wrinkle_age * self.age_indicators['wrinkles']['weight'] +
            texture_age * self.age_indicators['skin_texture']['weight'] +
            eye_age * self.age_indicators['eye_area']['weight'] +
            volume_age * self.age_indicators['facial_volume']['weight'] +
            hair_age * self.age_indicators['hair_characteristics']['weight'] +
            skin_tone_age * self.age_indicators['skin_tone']['weight']
        )
        
        # Clamp to reasonable range
        return max(18, min(80, weighted_age))

    def _calculate_age_range(self, estimated_age: float) -> Dict[str, float]:
        """Calculate age range with confidence bounds"""
        margin = 5  # ±5 years margin
        
        return {
            'min_age': max(18, estimated_age - margin),
            'max_age': min(80, estimated_age + margin),
            'most_likely': estimated_age
        }

    def _calculate_confidence(self, wrinkle_score: float, texture_score: float,
                            eye_area_score: float, volume_score: float,
                            hair_score: float, skin_tone_score: float) -> float:
        """Calculate confidence in age estimation"""
        # Confidence based on consistency of indicators
        scores = [wrinkle_score, texture_score, eye_area_score, 
                 volume_score, hair_score, skin_tone_score]
        
        # Higher standard deviation means less consistent indicators
        score_std = np.std(scores)
        
        # Convert to confidence (lower std = higher confidence)
        confidence = 1 - min(1.0, score_std)
        
        return max(0.3, confidence)  # Minimum confidence of 30%

    def _determine_age_group(self, estimated_age: float) -> str:
        """Determine age group category"""
        if estimated_age < 25:
            return "Young Adult (18-24)"
        elif estimated_age < 35:
            return "Adult (25-34)"
        elif estimated_age < 45:
            return "Middle-aged (35-44)"
        elif estimated_age < 55:
            return "Mature (45-54)"
        elif estimated_age < 65:
            return "Senior (55-64)"
        else:
            return "Elderly (65+)"

    def _get_default_age_estimation(self, start_time: float) -> Dict:
        """Get default age estimation for error cases"""
        return {
            'age_estimation': {
                'estimated_age': 30.0,
                'age_range': {'min_age': 25, 'max_age': 35, 'most_likely': 30.0},
                'confidence': 0.0,
                'age_group': "Adult (25-34)"
            },
            'processing_time': time.time() - start_time,
            'timestamp': datetime.utcnow().isoformat()
        } 
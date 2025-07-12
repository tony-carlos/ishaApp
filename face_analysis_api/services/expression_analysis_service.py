"""
Expression Analysis Service using Computer Vision
"""

import cv2
import numpy as np
from typing import Dict, List, Optional, Tuple
import time
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class ExpressionAnalysisService:
    def __init__(self):
        """Initialize expression analysis service"""
        self.emotions = {
            'happy': {'mouth_up': True, 'eyes_narrow': True, 'cheeks_up': True},
            'sad': {'mouth_down': True, 'eyes_narrow': False, 'eyebrows_down': True},
            'angry': {'mouth_down': True, 'eyebrows_down': True, 'eyes_narrow': True},
            'surprise': {'mouth_open': True, 'eyes_wide': True, 'eyebrows_up': True},
            'fear': {'mouth_open': True, 'eyes_wide': True, 'eyebrows_up': True},
            'disgust': {'mouth_down': True, 'nose_wrinkle': True, 'eyebrows_down': True},
            'neutral': {'balanced': True}
        }
        
        self.facial_action_units = {
            'AU1': 'Inner Brow Raiser',
            'AU2': 'Outer Brow Raiser',
            'AU4': 'Brow Lowerer',
            'AU5': 'Upper Lid Raiser',
            'AU6': 'Cheek Raiser',
            'AU7': 'Lid Tightener',
            'AU9': 'Nose Wrinkler',
            'AU10': 'Upper Lip Raiser',
            'AU12': 'Lip Corner Puller',
            'AU15': 'Lip Corner Depressor',
            'AU17': 'Chin Raiser',
            'AU20': 'Lip Stretcher',
            'AU25': 'Lips Part',
            'AU26': 'Jaw Drop'
        }
        
        logger.info("Expression Analysis Service initialized successfully")

    async def health_check(self) -> Dict[str, str]:
        """Check if the service is healthy"""
        try:
            # Test with a simple image
            test_image = np.zeros((100, 100, 3), dtype=np.uint8)
            await self.analyze_expression(test_image)
            return {"status": "healthy", "message": "Expression analysis service ready"}
        except Exception as e:
            return {"status": "unhealthy", "message": f"Expression analysis service error: {str(e)}"}

    async def analyze_expression(self, image: np.ndarray) -> Dict:
        """
        Analyze facial expressions and emotions
        
        Args:
            image: OpenCV image array (BGR format)
            
        Returns:
            Dictionary with expression analysis results
        """
        start_time = time.time()
        
        try:
            # Convert to RGB if needed
            if len(image.shape) == 3 and image.shape[2] == 3:
                rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            else:
                rgb_image = image
            
            # Detect face region and landmarks
            face_region, face_bbox, landmarks = self._detect_face_and_landmarks(rgb_image)
            
            if face_region is None:
                return self._get_default_expression_analysis(start_time)
            
            # Analyze facial action units
            action_units = self._analyze_facial_action_units(face_region, landmarks)
            
            # Detect emotions based on facial features
            emotions = self._detect_emotions(face_region, landmarks, action_units)
            
            # Calculate expression intensity
            expression_intensity = self._calculate_expression_intensity(action_units)
            
            # Determine dominant emotion
            dominant_emotion = max(emotions, key=lambda x: x['confidence'])
            
            processing_time = time.time() - start_time
            
            result = {
                'expression_analysis': {
                    'dominant_emotion': dominant_emotion['name'],
                    'emotions': emotions,
                    'expression_intensity': round(expression_intensity, 3),
                    'facial_action_units': action_units
                },
                'processing_time': processing_time,
                'timestamp': datetime.utcnow().isoformat()
            }
            
            return result
            
        except Exception as e:
            logger.error(f"Expression analysis error: {str(e)}")
            return self._get_default_expression_analysis(start_time)

    def _detect_face_and_landmarks(self, image: np.ndarray) -> Tuple[Optional[np.ndarray], Optional[Tuple[int, int, int, int]], Optional[Dict]]:
        """Detect face region and estimate landmarks"""
        gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        
        # Use Haar cascade for face detection
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        faces = face_cascade.detectMultiScale(gray, 1.3, 5)
        
        if len(faces) == 0:
            return None, None, None
        
        # Use the largest face
        face = max(faces, key=lambda f: f[2] * f[3])
        x, y, w, h = face
        
        # Extract face region
        face_region = image[y:y+h, x:x+w]
        
        # Estimate landmark positions
        landmarks = self._estimate_landmarks(x, y, w, h)
        
        return face_region, (x, y, w, h), landmarks

    def _estimate_landmarks(self, x: int, y: int, w: int, h: int) -> Dict:
        """Estimate facial landmark positions"""
        landmarks = {
            'left_eye': (x + w * 0.35, y + h * 0.35),
            'right_eye': (x + w * 0.65, y + h * 0.35),
            'left_eyebrow': (x + w * 0.3, y + h * 0.25),
            'right_eyebrow': (x + w * 0.7, y + h * 0.25),
            'nose_tip': (x + w * 0.5, y + h * 0.55),
            'mouth_left': (x + w * 0.35, y + h * 0.75),
            'mouth_right': (x + w * 0.65, y + h * 0.75),
            'mouth_center': (x + w * 0.5, y + h * 0.75),
            'chin': (x + w * 0.5, y + h * 0.9),
            'left_cheek': (x + w * 0.25, y + h * 0.6),
            'right_cheek': (x + w * 0.75, y + h * 0.6)
        }
        
        return landmarks

    def _analyze_facial_action_units(self, face_region: np.ndarray, landmarks: Dict) -> Dict[str, float]:
        """Analyze facial action units"""
        if face_region.size == 0 or not landmarks:
            return {au: 0.0 for au in self.facial_action_units.keys()}
        
        height, width = face_region.shape[:2]
        gray = cv2.cvtColor(face_region, cv2.COLOR_RGB2GRAY)
        
        action_units = {}
        
        # AU1 & AU2: Inner and Outer Brow Raiser
        action_units['AU1'] = self._analyze_inner_brow_raiser(gray, height, width)
        action_units['AU2'] = self._analyze_outer_brow_raiser(gray, height, width)
        
        # AU4: Brow Lowerer
        action_units['AU4'] = self._analyze_brow_lowerer(gray, height, width)
        
        # AU5: Upper Lid Raiser
        action_units['AU5'] = self._analyze_upper_lid_raiser(gray, height, width)
        
        # AU6: Cheek Raiser
        action_units['AU6'] = self._analyze_cheek_raiser(gray, height, width)
        
        # AU7: Lid Tightener
        action_units['AU7'] = self._analyze_lid_tightener(gray, height, width)
        
        # AU9: Nose Wrinkler
        action_units['AU9'] = self._analyze_nose_wrinkler(gray, height, width)
        
        # AU10: Upper Lip Raiser
        action_units['AU10'] = self._analyze_upper_lip_raiser(gray, height, width)
        
        # AU12: Lip Corner Puller
        action_units['AU12'] = self._analyze_lip_corner_puller(gray, height, width)
        
        # AU15: Lip Corner Depressor
        action_units['AU15'] = self._analyze_lip_corner_depressor(gray, height, width)
        
        # AU17: Chin Raiser
        action_units['AU17'] = self._analyze_chin_raiser(gray, height, width)
        
        # AU20: Lip Stretcher
        action_units['AU20'] = self._analyze_lip_stretcher(gray, height, width)
        
        # AU25: Lips Part
        action_units['AU25'] = self._analyze_lips_part(gray, height, width)
        
        # AU26: Jaw Drop
        action_units['AU26'] = self._analyze_jaw_drop(gray, height, width)
        
        return action_units

    def _analyze_inner_brow_raiser(self, gray: np.ndarray, height: int, width: int) -> float:
        """Analyze inner brow raiser (AU1)"""
        # Focus on inner eyebrow region
        inner_brow_region = gray[
            int(height * 0.15):int(height * 0.35),
            int(width * 0.4):int(width * 0.6)
        ]
        
        if inner_brow_region.size == 0:
            return 0.0
        
        # Calculate vertical gradients (upward movement)
        grad_y = cv2.Sobel(inner_brow_region, cv2.CV_64F, 0, 1, ksize=3)
        upward_movement = np.mean(grad_y[grad_y > 0])
        
        return min(1.0, upward_movement / 50)

    def _analyze_outer_brow_raiser(self, gray: np.ndarray, height: int, width: int) -> float:
        """Analyze outer brow raiser (AU2)"""
        # Focus on outer eyebrow regions
        left_outer_brow = gray[
            int(height * 0.15):int(height * 0.35),
            int(width * 0.2):int(width * 0.4)
        ]
        
        right_outer_brow = gray[
            int(height * 0.15):int(height * 0.35),
            int(width * 0.6):int(width * 0.8)
        ]
        
        scores = []
        for region in [left_outer_brow, right_outer_brow]:
            if region.size > 0:
                grad_y = cv2.Sobel(region, cv2.CV_64F, 0, 1, ksize=3)
                upward_movement = np.mean(grad_y[grad_y > 0])
                scores.append(min(1.0, upward_movement / 50))
        
        return np.mean(scores) if scores else 0.0

    def _analyze_brow_lowerer(self, gray: np.ndarray, height: int, width: int) -> float:
        """Analyze brow lowerer (AU4)"""
        # Focus on entire eyebrow region
        eyebrow_region = gray[
            int(height * 0.15):int(height * 0.35),
            int(width * 0.2):int(width * 0.8)
        ]
        
        if eyebrow_region.size == 0:
            return 0.0
        
        # Calculate downward gradients
        grad_y = cv2.Sobel(eyebrow_region, cv2.CV_64F, 0, 1, ksize=3)
        downward_movement = np.mean(grad_y[grad_y < 0])
        
        return min(1.0, abs(downward_movement) / 50)

    def _analyze_upper_lid_raiser(self, gray: np.ndarray, height: int, width: int) -> float:
        """Analyze upper lid raiser (AU5)"""
        # Focus on upper eyelid regions
        left_upper_lid = gray[
            int(height * 0.25):int(height * 0.4),
            int(width * 0.25):int(width * 0.45)
        ]
        
        right_upper_lid = gray[
            int(height * 0.25):int(height * 0.4),
            int(width * 0.55):int(width * 0.75)
        ]
        
        scores = []
        for region in [left_upper_lid, right_upper_lid]:
            if region.size > 0:
                # Calculate openness based on brightness variation
                brightness_std = np.std(region)
                scores.append(min(1.0, brightness_std / 30))
        
        return np.mean(scores) if scores else 0.0

    def _analyze_cheek_raiser(self, gray: np.ndarray, height: int, width: int) -> float:
        """Analyze cheek raiser (AU6)"""
        # Focus on cheek regions
        left_cheek = gray[
            int(height * 0.4):int(height * 0.7),
            int(width * 0.1):int(width * 0.4)
        ]
        
        right_cheek = gray[
            int(height * 0.4):int(height * 0.7),
            int(width * 0.6):int(width * 0.9)
        ]
        
        scores = []
        for region in [left_cheek, right_cheek]:
            if region.size > 0:
                # Calculate upward movement in cheeks
                grad_y = cv2.Sobel(region, cv2.CV_64F, 0, 1, ksize=3)
                upward_movement = np.mean(grad_y[grad_y > 0])
                scores.append(min(1.0, upward_movement / 40))
        
        return np.mean(scores) if scores else 0.0

    def _analyze_lid_tightener(self, gray: np.ndarray, height: int, width: int) -> float:
        """Analyze lid tightener (AU7)"""
        # Focus on eye regions
        left_eye = gray[
            int(height * 0.3):int(height * 0.45),
            int(width * 0.25):int(width * 0.45)
        ]
        
        right_eye = gray[
            int(height * 0.3):int(height * 0.45),
            int(width * 0.55):int(width * 0.75)
        ]
        
        scores = []
        for region in [left_eye, right_eye]:
            if region.size > 0:
                # Calculate tension based on edge strength
                edges = cv2.Canny(region, 50, 150)
                edge_density = np.sum(edges) / edges.size
                scores.append(min(1.0, edge_density * 5))
        
        return np.mean(scores) if scores else 0.0

    def _analyze_nose_wrinkler(self, gray: np.ndarray, height: int, width: int) -> float:
        """Analyze nose wrinkler (AU9)"""
        # Focus on nose region
        nose_region = gray[
            int(height * 0.4):int(height * 0.65),
            int(width * 0.4):int(width * 0.6)
        ]
        
        if nose_region.size == 0:
            return 0.0
        
        # Calculate wrinkle patterns
        grad_x = cv2.Sobel(nose_region, cv2.CV_64F, 1, 0, ksize=3)
        grad_y = cv2.Sobel(nose_region, cv2.CV_64F, 0, 1, ksize=3)
        gradient_magnitude = np.sqrt(grad_x**2 + grad_y**2)
        
        wrinkle_strength = np.mean(gradient_magnitude)
        
        return min(1.0, wrinkle_strength / 30)

    def _analyze_upper_lip_raiser(self, gray: np.ndarray, height: int, width: int) -> float:
        """Analyze upper lip raiser (AU10)"""
        # Focus on upper lip region
        upper_lip_region = gray[
            int(height * 0.65):int(height * 0.75),
            int(width * 0.35):int(width * 0.65)
        ]
        
        if upper_lip_region.size == 0:
            return 0.0
        
        # Calculate upward movement
        grad_y = cv2.Sobel(upper_lip_region, cv2.CV_64F, 0, 1, ksize=3)
        upward_movement = np.mean(grad_y[grad_y > 0])
        
        return min(1.0, upward_movement / 40)

    def _analyze_lip_corner_puller(self, gray: np.ndarray, height: int, width: int) -> float:
        """Analyze lip corner puller (AU12)"""
        # Focus on mouth corners
        left_corner = gray[
            int(height * 0.7):int(height * 0.8),
            int(width * 0.3):int(width * 0.4)
        ]
        
        right_corner = gray[
            int(height * 0.7):int(height * 0.8),
            int(width * 0.6):int(width * 0.7)
        ]
        
        scores = []
        for region in [left_corner, right_corner]:
            if region.size > 0:
                # Calculate upward pulling motion
                grad_y = cv2.Sobel(region, cv2.CV_64F, 0, 1, ksize=3)
                upward_pull = np.mean(grad_y[grad_y > 0])
                scores.append(min(1.0, upward_pull / 30))
        
        return np.mean(scores) if scores else 0.0

    def _analyze_lip_corner_depressor(self, gray: np.ndarray, height: int, width: int) -> float:
        """Analyze lip corner depressor (AU15)"""
        # Focus on mouth corners
        left_corner = gray[
            int(height * 0.7):int(height * 0.8),
            int(width * 0.3):int(width * 0.4)
        ]
        
        right_corner = gray[
            int(height * 0.7):int(height * 0.8),
            int(width * 0.6):int(width * 0.7)
        ]
        
        scores = []
        for region in [left_corner, right_corner]:
            if region.size > 0:
                # Calculate downward pulling motion
                grad_y = cv2.Sobel(region, cv2.CV_64F, 0, 1, ksize=3)
                downward_pull = np.mean(grad_y[grad_y < 0])
                scores.append(min(1.0, abs(downward_pull) / 30))
        
        return np.mean(scores) if scores else 0.0

    def _analyze_chin_raiser(self, gray: np.ndarray, height: int, width: int) -> float:
        """Analyze chin raiser (AU17)"""
        # Focus on chin region
        chin_region = gray[
            int(height * 0.8):int(height * 0.95),
            int(width * 0.35):int(width * 0.65)
        ]
        
        if chin_region.size == 0:
            return 0.0
        
        # Calculate upward movement
        grad_y = cv2.Sobel(chin_region, cv2.CV_64F, 0, 1, ksize=3)
        upward_movement = np.mean(grad_y[grad_y > 0])
        
        return min(1.0, upward_movement / 40)

    def _analyze_lip_stretcher(self, gray: np.ndarray, height: int, width: int) -> float:
        """Analyze lip stretcher (AU20)"""
        # Focus on mouth region
        mouth_region = gray[
            int(height * 0.7):int(height * 0.8),
            int(width * 0.3):int(width * 0.7)
        ]
        
        if mouth_region.size == 0:
            return 0.0
        
        # Calculate horizontal stretching
        grad_x = cv2.Sobel(mouth_region, cv2.CV_64F, 1, 0, ksize=3)
        horizontal_stretch = np.mean(np.abs(grad_x))
        
        return min(1.0, horizontal_stretch / 40)

    def _analyze_lips_part(self, gray: np.ndarray, height: int, width: int) -> float:
        """Analyze lips part (AU25)"""
        # Focus on mouth center
        mouth_center = gray[
            int(height * 0.72):int(height * 0.78),
            int(width * 0.45):int(width * 0.55)
        ]
        
        if mouth_center.size == 0:
            return 0.0
        
        # Calculate mouth opening based on darkness
        mouth_openness = (128 - np.mean(mouth_center)) / 128
        
        return max(0.0, min(1.0, mouth_openness))

    def _analyze_jaw_drop(self, gray: np.ndarray, height: int, width: int) -> float:
        """Analyze jaw drop (AU26)"""
        # Focus on lower mouth region
        lower_mouth = gray[
            int(height * 0.75):int(height * 0.9),
            int(width * 0.4):int(width * 0.6)
        ]
        
        if lower_mouth.size == 0:
            return 0.0
        
        # Calculate jaw opening based on darkness and height
        jaw_openness = (128 - np.mean(lower_mouth)) / 128
        
        return max(0.0, min(1.0, jaw_openness))

    def _detect_emotions(self, face_region: np.ndarray, landmarks: Dict, action_units: Dict[str, float]) -> List[Dict]:
        """Detect emotions based on facial action units"""
        emotions = []
        
        # Happy: AU6 (cheek raiser) + AU12 (lip corner puller)
        happy_score = (action_units.get('AU6', 0) + action_units.get('AU12', 0)) / 2
        emotions.append({'name': 'happy', 'confidence': round(happy_score, 3)})
        
        # Sad: AU15 (lip corner depressor) + AU1 (inner brow raiser)
        sad_score = (action_units.get('AU15', 0) + action_units.get('AU1', 0)) / 2
        emotions.append({'name': 'sad', 'confidence': round(sad_score, 3)})
        
        # Angry: AU4 (brow lowerer) + AU15 (lip corner depressor)
        angry_score = (action_units.get('AU4', 0) + action_units.get('AU15', 0)) / 2
        emotions.append({'name': 'angry', 'confidence': round(angry_score, 3)})
        
        # Surprise: AU1 (inner brow raiser) + AU2 (outer brow raiser) + AU5 (upper lid raiser) + AU25 (lips part)
        surprise_score = (action_units.get('AU1', 0) + action_units.get('AU2', 0) + 
                         action_units.get('AU5', 0) + action_units.get('AU25', 0)) / 4
        emotions.append({'name': 'surprise', 'confidence': round(surprise_score, 3)})
        
        # Fear: AU1 (inner brow raiser) + AU5 (upper lid raiser) + AU20 (lip stretcher)
        fear_score = (action_units.get('AU1', 0) + action_units.get('AU5', 0) + 
                     action_units.get('AU20', 0)) / 3
        emotions.append({'name': 'fear', 'confidence': round(fear_score, 3)})
        
        # Disgust: AU9 (nose wrinkler) + AU10 (upper lip raiser)
        disgust_score = (action_units.get('AU9', 0) + action_units.get('AU10', 0)) / 2
        emotions.append({'name': 'disgust', 'confidence': round(disgust_score, 3)})
        
        # Neutral: Low activity across all action units
        neutral_score = 1 - (sum(action_units.values()) / len(action_units))
        emotions.append({'name': 'neutral', 'confidence': round(max(0, neutral_score), 3)})
        
        return emotions

    def _calculate_expression_intensity(self, action_units: Dict[str, float]) -> float:
        """Calculate overall expression intensity"""
        # Sum of all action unit activations
        total_intensity = sum(action_units.values())
        
        # Normalize by number of action units
        normalized_intensity = total_intensity / len(action_units)
        
        return min(1.0, normalized_intensity)

    def _get_default_expression_analysis(self, start_time: float) -> Dict:
        """Get default expression analysis for error cases"""
        return {
            'expression_analysis': {
                'dominant_emotion': 'neutral',
                'emotions': [
                    {'name': 'neutral', 'confidence': 1.0},
                    {'name': 'happy', 'confidence': 0.0},
                    {'name': 'sad', 'confidence': 0.0},
                    {'name': 'angry', 'confidence': 0.0},
                    {'name': 'surprise', 'confidence': 0.0},
                    {'name': 'fear', 'confidence': 0.0},
                    {'name': 'disgust', 'confidence': 0.0}
                ],
                'expression_intensity': 0.0,
                'facial_action_units': {au: 0.0 for au in self.facial_action_units.keys()}
            },
            'processing_time': time.time() - start_time,
            'timestamp': datetime.utcnow().isoformat()
        } 
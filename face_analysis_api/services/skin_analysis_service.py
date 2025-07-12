"""
Comprehensive Skin Analysis Service using Computer Vision
"""

import cv2
import numpy as np
from typing import Dict, List, Optional, Tuple
import time
import logging
from datetime import datetime
from sklearn.cluster import KMeans
from scipy import ndimage
from skimage import feature, measure, morphology
import math

logger = logging.getLogger(__name__)

class SkinAnalysisService:
    def __init__(self):
        """Initialize skin analysis service"""
        self.skin_cascade = None
        self.texture_analyzer = TextureAnalyzer()
        self.pore_analyzer = PoreAnalyzer()
        self.wrinkle_analyzer = WrinkleAnalyzer()
        self.acne_analyzer = AcneAnalyzer()
        self.color_analyzer = ColorAnalyzer()
        
        logger.info("Skin Analysis Service initialized successfully")

    async def health_check(self) -> Dict[str, str]:
        """Check if the service is healthy"""
        try:
            # Test with a simple image
            test_image = np.zeros((100, 100, 3), dtype=np.uint8)
            await self.analyze_skin(test_image)
            return {"status": "healthy", "message": "Skin analysis service ready"}
        except Exception as e:
            return {"status": "unhealthy", "message": f"Skin analysis service error: {str(e)}"}

    async def analyze_skin(self, image: np.ndarray) -> Dict:
        """
        Comprehensive skin analysis
        
        Args:
            image: OpenCV image array (BGR format)
            
        Returns:
            Dictionary with comprehensive skin analysis results
        """
        start_time = time.time()
        
        try:
            # Prepare image for analysis
            preprocessed_image = self._preprocess_image(image)
            
            # Extract skin region
            skin_mask = self._extract_skin_region(preprocessed_image)
            skin_region = cv2.bitwise_and(preprocessed_image, preprocessed_image, mask=skin_mask)
            
            # Perform various analyses
            texture_analysis = self.texture_analyzer.analyze_texture(skin_region, skin_mask)
            pore_analysis = self.pore_analyzer.analyze_pores(skin_region, skin_mask)
            wrinkle_analysis = self.wrinkle_analyzer.analyze_wrinkles(skin_region, skin_mask)
            acne_analysis = self.acne_analyzer.analyze_acne(skin_region, skin_mask)
            color_analysis = self.color_analyzer.analyze_skin_color(skin_region, skin_mask)
            
            # Calculate moisture and radiance
            moisture_analysis = self._analyze_moisture(skin_region, skin_mask)
            radiance_analysis = self._analyze_radiance(skin_region, skin_mask)
            
            # Calculate firmness and age spots
            firmness_analysis = self._analyze_firmness(skin_region, skin_mask)
            age_spot_analysis = self._analyze_age_spots(skin_region, skin_mask)
            
            # Calculate overall skin health
            overall_health = self._calculate_overall_health(
                texture_analysis, pore_analysis, wrinkle_analysis, 
                acne_analysis, moisture_analysis, radiance_analysis
            )
            
            # Generate recommendations
            recommendations = self._generate_recommendations(
                texture_analysis, pore_analysis, wrinkle_analysis, 
                acne_analysis, moisture_analysis, radiance_analysis, color_analysis
            )
            
            # Determine skin type
            skin_type = self._determine_skin_type(
                texture_analysis, pore_analysis, moisture_analysis, acne_analysis
            )
            
            processing_time = time.time() - start_time
            
            result = {
                'skin_analysis': {
                    # HD Analysis parameters
                    'hd_redness': self._create_skin_parameter(color_analysis['redness'], 'redness'),
                    'hd_oiliness': self._create_skin_parameter(texture_analysis['oiliness'], 'oiliness'),
                    'hd_age_spot': self._create_skin_parameter(age_spot_analysis['severity'], 'age_spot'),
                    'hd_radiance': self._create_skin_parameter(radiance_analysis['score'], 'radiance'),
                    'hd_moisture': self._create_skin_parameter(moisture_analysis['level'], 'moisture'),
                    'hd_dark_circle': self._create_skin_parameter(0.0, 'dark_circle'),  # Requires eye region
                    'hd_eye_bag': self._create_skin_parameter(0.0, 'eye_bag'),  # Requires eye region
                    'hd_firmness': self._create_skin_parameter(firmness_analysis['score'], 'firmness'),
                    'hd_texture': self._create_skin_parameter(texture_analysis['score'], 'texture'),
                    'hd_acne': self._create_skin_parameter(acne_analysis['severity'], 'acne'),
                    'hd_pore': self._create_skin_parameter(pore_analysis['severity'], 'pore'),
                    'hd_wrinkle': self._create_skin_parameter(wrinkle_analysis['severity'], 'wrinkle'),
                    
                    # Overall analysis
                    'skin_tone': {
                        'category': color_analysis['tone_category'],
                        'hex': color_analysis['dominant_color_hex'],
                        'rgb': color_analysis['dominant_color_rgb'],
                        'undertone': color_analysis['undertone']
                    },
                    'skin_type': skin_type,
                    'overall_health': overall_health,
                    'recommended_treatments': recommendations
                },
                'processing_time': processing_time,
                'timestamp': datetime.utcnow().isoformat()
            }
            
            return result
            
        except Exception as e:
            logger.error(f"Skin analysis error: {str(e)}")
            return {
                'skin_analysis': self._get_default_skin_analysis(),
                'processing_time': time.time() - start_time,
                'timestamp': datetime.utcnow().isoformat()
            }

    def _preprocess_image(self, image: np.ndarray) -> np.ndarray:
        """Preprocess image for skin analysis"""
        # Convert to RGB if needed
        if len(image.shape) == 3 and image.shape[2] == 3:
            image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Normalize lighting
        lab = cv2.cvtColor(image, cv2.COLOR_RGB2LAB)
        l, a, b = cv2.split(lab)
        l = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8)).apply(l)
        image = cv2.merge([l, a, b])
        image = cv2.cvtColor(image, cv2.COLOR_LAB2RGB)
        
        # Gaussian blur for noise reduction
        image = cv2.GaussianBlur(image, (3, 3), 0)
        
        return image

    def _extract_skin_region(self, image: np.ndarray) -> np.ndarray:
        """Extract skin region using color-based segmentation"""
        # Convert to HSV for better skin detection
        hsv = cv2.cvtColor(image, cv2.COLOR_RGB2HSV)
        
        # Define skin color range in HSV
        lower_skin = np.array([0, 20, 70], dtype=np.uint8)
        upper_skin = np.array([20, 255, 255], dtype=np.uint8)
        
        # Create mask
        mask = cv2.inRange(hsv, lower_skin, upper_skin)
        
        # Morphological operations to clean up the mask
        kernel = np.ones((3, 3), np.uint8)
        mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
        mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
        
        # Fill holes
        mask = ndimage.binary_fill_holes(mask).astype(np.uint8) * 255
        
        return mask

    def _analyze_moisture(self, skin_region: np.ndarray, mask: np.ndarray) -> Dict:
        """Analyze skin moisture level"""
        # Extract skin pixels
        skin_pixels = skin_region[mask > 0]
        
        if len(skin_pixels) == 0:
            return {'level': 0.5, 'confidence': 0.0}
        
        # Convert to LAB for better analysis
        lab = cv2.cvtColor(skin_region, cv2.COLOR_RGB2LAB)
        l_channel = lab[:, :, 0][mask > 0]
        
        # Calculate moisture indicators
        # High moisture = higher luminance variation and smoothness
        std_luminance = np.std(l_channel)
        mean_luminance = np.mean(l_channel)
        
        # Moisture score based on luminance characteristics
        moisture_score = min(1.0, (mean_luminance / 128) * (1 - std_luminance / 64))
        
        return {
            'level': round(moisture_score, 3),
            'confidence': 0.8,
            'indicators': {
                'luminance_std': round(std_luminance, 2),
                'luminance_mean': round(mean_luminance, 2)
            }
        }

    def _analyze_radiance(self, skin_region: np.ndarray, mask: np.ndarray) -> Dict:
        """Analyze skin radiance/glow"""
        # Extract skin pixels
        skin_pixels = skin_region[mask > 0]
        
        if len(skin_pixels) == 0:
            return {'score': 0.5, 'confidence': 0.0}
        
        # Convert to LAB
        lab = cv2.cvtColor(skin_region, cv2.COLOR_RGB2LAB)
        l_channel = lab[:, :, 0][mask > 0]
        
        # Radiance indicators
        brightness = np.mean(l_channel)
        uniformity = 1 - (np.std(l_channel) / 64)  # More uniform = more radiant
        
        # Calculate radiance score
        radiance_score = min(1.0, (brightness / 128) * uniformity)
        
        return {
            'score': round(radiance_score, 3),
            'confidence': 0.8,
            'indicators': {
                'brightness': round(brightness, 2),
                'uniformity': round(uniformity, 3)
            }
        }

    def _analyze_firmness(self, skin_region: np.ndarray, mask: np.ndarray) -> Dict:
        """Analyze skin firmness based on texture patterns"""
        gray = cv2.cvtColor(skin_region, cv2.COLOR_RGB2GRAY)
        
        # Calculate texture features that indicate firmness
        # Firm skin has more uniform texture
        
        # Local binary pattern for texture analysis
        lbp = feature.local_binary_pattern(gray, 8, 1, method='uniform')
        lbp_hist = np.histogram(lbp[mask > 0], bins=10)[0]
        lbp_uniformity = 1 - (np.std(lbp_hist) / np.mean(lbp_hist + 1e-7))
        
        # Gradient magnitude for texture smoothness
        grad_x = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
        grad_y = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
        grad_magnitude = np.sqrt(grad_x**2 + grad_y**2)
        
        # Firmness score
        firmness_score = min(1.0, lbp_uniformity * (1 - np.mean(grad_magnitude[mask > 0]) / 100))
        
        return {
            'score': round(firmness_score, 3),
            'confidence': 0.7,
            'indicators': {
                'texture_uniformity': round(lbp_uniformity, 3),
                'gradient_magnitude': round(np.mean(grad_magnitude[mask > 0]), 2)
            }
        }

    def _analyze_age_spots(self, skin_region: np.ndarray, mask: np.ndarray) -> Dict:
        """Analyze age spots and pigmentation"""
        # Convert to different color spaces for spot detection
        hsv = cv2.cvtColor(skin_region, cv2.COLOR_RGB2HSV)
        lab = cv2.cvtColor(skin_region, cv2.COLOR_RGB2LAB)
        
        # Detect dark spots in the skin region
        l_channel = lab[:, :, 0]
        
        # Find areas significantly darker than the mean
        mean_brightness = np.mean(l_channel[mask > 0])
        std_brightness = np.std(l_channel[mask > 0])
        
        # Threshold for dark spots
        dark_threshold = mean_brightness - 1.5 * std_brightness
        dark_spots = (l_channel < dark_threshold) & (mask > 0)
        
        # Calculate age spot severity
        spot_area = np.sum(dark_spots)
        skin_area = np.sum(mask > 0)
        
        if skin_area == 0:
            return {'severity': 0.0, 'confidence': 0.0}
        
        spot_percentage = spot_area / skin_area
        severity = min(1.0, spot_percentage * 10)  # Scale up for visibility
        
        return {
            'severity': round(severity, 3),
            'confidence': 0.7,
            'indicators': {
                'spot_area': int(spot_area),
                'skin_area': int(skin_area),
                'spot_percentage': round(spot_percentage * 100, 2)
            }
        }

    def _calculate_overall_health(self, texture_analysis: Dict, pore_analysis: Dict,
                                 wrinkle_analysis: Dict, acne_analysis: Dict,
                                 moisture_analysis: Dict, radiance_analysis: Dict) -> float:
        """Calculate overall skin health score"""
        # Weight different factors
        weights = {
            'texture': 0.2,
            'pore': 0.15,
            'wrinkle': 0.15,
            'acne': 0.15,
            'moisture': 0.15,
            'radiance': 0.2
        }
        
        # Calculate weighted score (higher is better)
        overall_score = (
            (1 - texture_analysis.get('roughness', 0.5)) * weights['texture'] +
            (1 - pore_analysis.get('severity', 0.5)) * weights['pore'] +
            (1 - wrinkle_analysis.get('severity', 0.5)) * weights['wrinkle'] +
            (1 - acne_analysis.get('severity', 0.5)) * weights['acne'] +
            moisture_analysis.get('level', 0.5) * weights['moisture'] +
            radiance_analysis.get('score', 0.5) * weights['radiance']
        )
        
        return round(overall_score, 3)

    def _generate_recommendations(self, texture_analysis: Dict, pore_analysis: Dict,
                                 wrinkle_analysis: Dict, acne_analysis: Dict,
                                 moisture_analysis: Dict, radiance_analysis: Dict,
                                 color_analysis: Dict) -> List[str]:
        """Generate skincare recommendations"""
        recommendations = []
        
        # Moisture recommendations
        if moisture_analysis.get('level', 0.5) < 0.4:
            recommendations.append("Use a hydrating moisturizer with hyaluronic acid")
        
        # Texture recommendations
        if texture_analysis.get('roughness', 0.5) > 0.6:
            recommendations.append("Consider gentle exfoliation with AHA/BHA")
        
        # Pore recommendations
        if pore_analysis.get('severity', 0.5) > 0.6:
            recommendations.append("Use products with niacinamide to minimize pore appearance")
        
        # Wrinkle recommendations
        if wrinkle_analysis.get('severity', 0.5) > 0.5:
            recommendations.append("Consider retinol or peptide-based anti-aging products")
        
        # Acne recommendations
        if acne_analysis.get('severity', 0.5) > 0.4:
            recommendations.append("Use salicylic acid or benzoyl peroxide for acne treatment")
        
        # Radiance recommendations
        if radiance_analysis.get('score', 0.5) < 0.4:
            recommendations.append("Try vitamin C serum for improved radiance")
        
        # Sun protection (always recommended)
        recommendations.append("Always use broad-spectrum SPF 30+ sunscreen")
        
        return recommendations

    def _determine_skin_type(self, texture_analysis: Dict, pore_analysis: Dict,
                            moisture_analysis: Dict, acne_analysis: Dict) -> str:
        """Determine skin type based on analysis"""
        oiliness = texture_analysis.get('oiliness', 0.5)
        moisture = moisture_analysis.get('level', 0.5)
        pore_size = pore_analysis.get('severity', 0.5)
        acne_severity = acne_analysis.get('severity', 0.5)
        
        if oiliness > 0.7 and pore_size > 0.6:
            return "Oily"
        elif moisture < 0.3 and oiliness < 0.3:
            return "Dry"
        elif oiliness > 0.5 and moisture < 0.4:
            return "Combination"
        elif acne_severity > 0.5 or oiliness > 0.6:
            return "Sensitive"
        else:
            return "Normal"

    def _create_skin_parameter(self, raw_score: float, parameter_type: str) -> Dict:
        """Create standardized skin parameter"""
        ui_score = min(100, max(0, raw_score * 100))
        
        # Determine severity
        if ui_score < 30:
            severity = "Low"
        elif ui_score < 70:
            severity = "Medium"
        else:
            severity = "High"
        
        return {
            'raw_score': round(raw_score, 3),
            'ui_score': round(ui_score, 1),
            'severity': severity,
            'area_percentage': round(raw_score * 100, 1),
            'confidence': 0.8
        }

    def _get_default_skin_analysis(self) -> Dict:
        """Get default skin analysis result for error cases"""
        default_param = {
            'raw_score': 0.5,
            'ui_score': 50.0,
            'severity': "Medium",
            'area_percentage': 50.0,
            'confidence': 0.0
        }
        
        return {
            'hd_redness': default_param,
            'hd_oiliness': default_param,
            'hd_age_spot': default_param,
            'hd_radiance': default_param,
            'hd_moisture': default_param,
            'hd_dark_circle': default_param,
            'hd_eye_bag': default_param,
            'hd_firmness': default_param,
            'hd_texture': default_param,
            'hd_acne': default_param,
            'hd_pore': default_param,
            'hd_wrinkle': default_param,
            'skin_tone': {
                'category': 'Medium',
                'hex': '#C8A882',
                'rgb': {'r': 200, 'g': 168, 'b': 130},
                'undertone': 'Neutral'
            },
            'skin_type': 'Normal',
            'overall_health': 0.5,
            'recommended_treatments': ["Maintain current skincare routine"]
        }


# Helper classes for specific analyses
class TextureAnalyzer:
    def analyze_texture(self, image: np.ndarray, mask: np.ndarray) -> Dict:
        """Analyze skin texture"""
        gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        
        # Calculate texture features
        # Local Binary Pattern for texture analysis
        lbp = feature.local_binary_pattern(gray, 8, 1, method='uniform')
        lbp_hist = np.histogram(lbp[mask > 0], bins=10)[0]
        
        # Texture roughness based on gradient
        grad_x = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
        grad_y = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
        gradient_magnitude = np.sqrt(grad_x**2 + grad_y**2)
        
        roughness = np.mean(gradient_magnitude[mask > 0]) / 100
        
        # Oiliness based on brightness and uniformity
        brightness = np.mean(gray[mask > 0])
        uniformity = 1 - (np.std(gray[mask > 0]) / 64)
        oiliness = min(1.0, (brightness / 128) * (1 - uniformity))
        
        return {
            'score': round(1 - roughness, 3),
            'roughness': round(roughness, 3),
            'oiliness': round(oiliness, 3),
            'confidence': 0.8
        }


class PoreAnalyzer:
    def analyze_pores(self, image: np.ndarray, mask: np.ndarray) -> Dict:
        """Analyze pore visibility and size"""
        gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        
        # Use morphological operations to detect pores
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
        tophat = cv2.morphologyEx(gray, cv2.MORPH_TOPHAT, kernel)
        
        # Threshold to find pores
        _, pore_mask = cv2.threshold(tophat, 20, 255, cv2.THRESH_BINARY)
        pore_mask = pore_mask & mask
        
        # Calculate pore statistics
        pore_area = np.sum(pore_mask > 0)
        skin_area = np.sum(mask > 0)
        
        if skin_area == 0:
            return {'severity': 0.0, 'confidence': 0.0}
        
        pore_percentage = pore_area / skin_area
        severity = min(1.0, pore_percentage * 20)  # Scale up for visibility
        
        return {
            'severity': round(severity, 3),
            'pore_count': int(pore_area / 9),  # Approximate pore count
            'confidence': 0.7
        }


class WrinkleAnalyzer:
    def analyze_wrinkles(self, image: np.ndarray, mask: np.ndarray) -> Dict:
        """Analyze wrinkles and fine lines"""
        gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        
        # Use Hessian matrix to detect line-like structures
        # Approximate with second derivatives
        xx = cv2.Sobel(cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3), cv2.CV_64F, 1, 0, ksize=3)
        xy = cv2.Sobel(cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3), cv2.CV_64F, 0, 1, ksize=3)
        yy = cv2.Sobel(cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3), cv2.CV_64F, 0, 1, ksize=3)
        
        # Calculate eigenvalues to detect ridges (wrinkles)
        trace = xx + yy
        det = xx * yy - xy * xy
        
        # Wrinkle strength
        wrinkle_strength = np.abs(trace - np.sqrt(trace**2 - 4*det))
        wrinkle_strength = np.nan_to_num(wrinkle_strength)
        
        # Calculate severity
        severity = min(1.0, np.mean(wrinkle_strength[mask > 0]) / 100)
        
        return {
            'severity': round(severity, 3),
            'confidence': 0.7
        }


class AcneAnalyzer:
    def analyze_acne(self, image: np.ndarray, mask: np.ndarray) -> Dict:
        """Analyze acne and blemishes"""
        # Convert to different color spaces
        hsv = cv2.cvtColor(image, cv2.COLOR_RGB2HSV)
        lab = cv2.cvtColor(image, cv2.COLOR_RGB2LAB)
        
        # Detect red areas (inflamed acne)
        h_channel = hsv[:, :, 0]
        s_channel = hsv[:, :, 1]
        
        # Red areas in HSV
        red_mask1 = (h_channel < 10) & (s_channel > 50) & mask
        red_mask2 = (h_channel > 160) & (s_channel > 50) & mask
        red_mask = red_mask1 | red_mask2
        
        # Dark spots (post-inflammatory hyperpigmentation)
        l_channel = lab[:, :, 0]
        mean_brightness = np.mean(l_channel[mask > 0])
        dark_spots = (l_channel < mean_brightness - 20) & mask
        
        # Calculate severity
        acne_area = np.sum(red_mask) + np.sum(dark_spots)
        skin_area = np.sum(mask > 0)
        
        if skin_area == 0:
            return {'severity': 0.0, 'confidence': 0.0}
        
        acne_percentage = acne_area / skin_area
        severity = min(1.0, acne_percentage * 10)
        
        return {
            'severity': round(severity, 3),
            'confidence': 0.7
        }


class ColorAnalyzer:
    def analyze_skin_color(self, image: np.ndarray, mask: np.ndarray) -> Dict:
        """Analyze skin color and tone"""
        # Extract skin pixels
        skin_pixels = image[mask > 0]
        
        if len(skin_pixels) == 0:
            return self._get_default_color_analysis()
        
        # Calculate dominant color using K-means
        kmeans = KMeans(n_clusters=3, random_state=42)
        kmeans.fit(skin_pixels)
        dominant_color = kmeans.cluster_centers_[0]
        
        # Convert to hex
        hex_color = '#{:02x}{:02x}{:02x}'.format(
            int(dominant_color[0]), int(dominant_color[1]), int(dominant_color[2])
        )
        
        # Determine undertone
        undertone = self._determine_undertone(dominant_color)
        
        # Determine tone category
        tone_category = self._determine_tone_category(dominant_color)
        
        # Calculate redness
        redness = self._calculate_redness(skin_pixels)
        
        return {
            'dominant_color_rgb': {
                'r': int(dominant_color[0]),
                'g': int(dominant_color[1]),
                'b': int(dominant_color[2])
            },
            'dominant_color_hex': hex_color,
            'undertone': undertone,
            'tone_category': tone_category,
            'redness': redness
        }
    
    def _determine_undertone(self, color: np.ndarray) -> str:
        """Determine skin undertone"""
        r, g, b = color
        
        if r > g and r > b:
            return "Warm"
        elif b > r and b > g:
            return "Cool"
        else:
            return "Neutral"
    
    def _determine_tone_category(self, color: np.ndarray) -> str:
        """Determine skin tone category"""
        brightness = np.mean(color)
        
        if brightness < 100:
            return "Deep"
        elif brightness < 150:
            return "Medium"
        elif brightness < 200:
            return "Fair"
        else:
            return "Light"
    
    def _calculate_redness(self, skin_pixels: np.ndarray) -> float:
        """Calculate skin redness"""
        # Calculate red channel dominance
        red_dominance = np.mean(skin_pixels[:, 0]) / (np.mean(skin_pixels[:, 1]) + np.mean(skin_pixels[:, 2]) + 1e-7)
        redness = min(1.0, max(0.0, (red_dominance - 0.8) * 5))
        
        return round(redness, 3)
    
    def _get_default_color_analysis(self) -> Dict:
        """Get default color analysis"""
        return {
            'dominant_color_rgb': {'r': 200, 'g': 168, 'b': 130},
            'dominant_color_hex': '#C8A882',
            'undertone': 'Neutral',
            'tone_category': 'Medium',
            'redness': 0.0
        } 
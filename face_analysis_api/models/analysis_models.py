"""
Pydantic models for face analysis API responses
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class FaceShape(str, Enum):
    ROUND = "Round"
    OVAL = "Oval"
    SQUARE = "Square"
    OBLONG = "Oblong"
    HEART = "Heart"
    DIAMOND = "Diamond"

class EyeShape(str, Enum):
    ROUND = "Round"
    ALMOND = "Almond"
    NARROW = "Narrow"

class EyeSize(str, Enum):
    BIG = "Big"
    SMALL = "Small"
    AVERAGE = "Average"

class SkinType(str, Enum):
    OILY = "Oily"
    DRY = "Dry"
    COMBINATION = "Combination"
    NORMAL = "Normal"
    SENSITIVE = "Sensitive"

class Undertone(str, Enum):
    WARM = "Warm"
    COOL = "Cool"
    NEUTRAL = "Neutral"

class Severity(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"

class Point(BaseModel):
    x: float = Field(..., description="X coordinate")
    y: float = Field(..., description="Y coordinate")

class BoundingBox(BaseModel):
    x: float = Field(..., description="Top-left X coordinate")
    y: float = Field(..., description="Top-left Y coordinate")
    width: float = Field(..., description="Width of bounding box")
    height: float = Field(..., description="Height of bounding box")

class FaceLandmarks(BaseModel):
    left_eye: List[Point] = Field(..., description="Left eye landmarks")
    right_eye: List[Point] = Field(..., description="Right eye landmarks")
    nose: List[Point] = Field(..., description="Nose landmarks")
    mouth: List[Point] = Field(..., description="Mouth landmarks")
    jawline: List[Point] = Field(..., description="Jawline landmarks")
    eyebrows: List[Point] = Field(..., description="Eyebrow landmarks")
    face_outline: List[Point] = Field(..., description="Face outline landmarks")

class FaceDetection(BaseModel):
    has_face: bool = Field(..., description="Whether a face was detected")
    face_count: int = Field(..., description="Number of faces detected")
    confidence: float = Field(..., description="Detection confidence score")
    bounding_boxes: List[BoundingBox] = Field(..., description="Face bounding boxes")
    landmarks: Optional[FaceLandmarks] = Field(None, description="Facial landmarks")
    message: str = Field(..., description="Detection message")

class FaceAnalysisResponse(BaseModel):
    face_detection: FaceDetection
    processing_time: float = Field(..., description="Processing time in seconds")
    timestamp: str = Field(..., description="Analysis timestamp")

class SkinParameter(BaseModel):
    raw_score: float = Field(..., description="Raw analysis score")
    ui_score: float = Field(..., description="UI-friendly score (0-100)")
    severity: Optional[Severity] = Field(None, description="Severity level")
    area_percentage: Optional[float] = Field(None, description="Affected area percentage")
    confidence: float = Field(..., description="Analysis confidence")

class SkinTone(BaseModel):
    category: str = Field(..., description="Skin tone category")
    hex: str = Field(..., description="Hex color code")
    rgb: Dict[str, int] = Field(..., description="RGB color values")
    undertone: Undertone = Field(..., description="Skin undertone")

class SkinAnalysisResult(BaseModel):
    # HD Analysis
    hd_redness: SkinParameter
    hd_oiliness: SkinParameter
    hd_age_spot: SkinParameter
    hd_radiance: SkinParameter
    hd_moisture: SkinParameter
    hd_dark_circle: SkinParameter
    hd_eye_bag: SkinParameter
    hd_firmness: SkinParameter
    hd_texture: SkinParameter
    hd_acne: SkinParameter
    hd_pore: SkinParameter
    hd_wrinkle: SkinParameter
    
    # Overall Analysis
    skin_tone: SkinTone
    skin_type: SkinType
    overall_health: float = Field(..., description="Overall skin health score")
    recommended_treatments: List[str] = Field(..., description="Recommended treatments")

class SkinAnalysisResponse(BaseModel):
    skin_analysis: SkinAnalysisResult
    processing_time: float = Field(..., description="Processing time in seconds")
    timestamp: str = Field(..., description="Analysis timestamp")

class EyeAnalysis(BaseModel):
    shape: EyeShape = Field(..., description="Eye shape")
    size: EyeSize = Field(..., description="Eye size")
    color: str = Field(..., description="Eye color")
    color_hex: str = Field(..., description="Eye color hex code")
    open_probability: float = Field(..., description="Probability that eye is open")

class FaceShapeAnalysis(BaseModel):
    type: FaceShape = Field(..., description="Face shape type")
    confidence: float = Field(..., description="Classification confidence")
    measurements: Dict[str, float] = Field(..., description="Face measurements")

class FacialFeatures(BaseModel):
    face_shape: FaceShapeAnalysis
    left_eye: EyeAnalysis
    right_eye: EyeAnalysis
    nose_width: str = Field(..., description="Nose width classification")
    nose_length: str = Field(..., description="Nose length classification")
    lip_shape: str = Field(..., description="Lip shape classification")
    lip_fullness: str = Field(..., description="Lip fullness classification")
    cheekbone_prominence: str = Field(..., description="Cheekbone prominence")
    jawline_definition: str = Field(..., description="Jawline definition")

class FacialFeaturesResponse(BaseModel):
    facial_features: FacialFeatures
    processing_time: float = Field(..., description="Processing time in seconds")
    timestamp: str = Field(..., description="Analysis timestamp")

class AgeEstimation(BaseModel):
    estimated_age: float = Field(..., description="Estimated age")
    age_range: Dict[str, float] = Field(..., description="Age range with confidence")
    confidence: float = Field(..., description="Estimation confidence")
    age_group: str = Field(..., description="Age group classification")

class AgeEstimationResponse(BaseModel):
    age_estimation: AgeEstimation
    processing_time: float = Field(..., description="Processing time in seconds")
    timestamp: str = Field(..., description="Analysis timestamp")

class Emotion(BaseModel):
    name: str = Field(..., description="Emotion name")
    confidence: float = Field(..., description="Emotion confidence")

class ExpressionAnalysis(BaseModel):
    dominant_emotion: str = Field(..., description="Dominant emotion")
    emotions: List[Emotion] = Field(..., description="All detected emotions")
    expression_intensity: float = Field(..., description="Expression intensity")
    facial_action_units: Dict[str, float] = Field(..., description="Facial action units")

class ExpressionAnalysisResponse(BaseModel):
    expression_analysis: ExpressionAnalysis
    processing_time: float = Field(..., description="Processing time in seconds")
    timestamp: str = Field(..., description="Analysis timestamp")

class AnalysisMetadata(BaseModel):
    timestamp: str = Field(..., description="Analysis timestamp")
    image_size: Dict[str, int] = Field(..., description="Image dimensions")
    processing_time: str = Field(..., description="Total processing time")

class ComprehensiveAnalysisResponse(BaseModel):
    face_detection: Dict[str, Any] = Field(..., description="Face detection results")
    skin_analysis: Dict[str, Any] = Field(..., description="Skin analysis results")
    facial_features: Dict[str, Any] = Field(..., description="Facial features analysis")
    age_estimation: Dict[str, Any] = Field(..., description="Age estimation results")
    expression_analysis: Dict[str, Any] = Field(..., description="Expression analysis results")
    analysis_metadata: AnalysisMetadata = Field(..., description="Analysis metadata")

# Error Response Models
class ErrorResponse(BaseModel):
    error: str = Field(..., description="Error message")
    error_code: str = Field(..., description="Error code")
    timestamp: str = Field(..., description="Error timestamp")

class ValidationError(BaseModel):
    field: str = Field(..., description="Field with validation error")
    message: str = Field(..., description="Validation error message")

class ValidationErrorResponse(BaseModel):
    errors: List[ValidationError] = Field(..., description="List of validation errors")
    timestamp: str = Field(..., description="Error timestamp") 
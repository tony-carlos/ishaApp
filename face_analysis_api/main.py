"""
IsherCare Face Analysis API
A comprehensive face analysis service using computer vision
"""

from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import cv2
import numpy as np
from PIL import Image
import io
import base64
import asyncio
from typing import Optional, Dict, List
import logging
from datetime import datetime
import os

from services.face_detection_service import FaceDetectionService
from services.skin_analysis_service import SkinAnalysisService
from services.facial_features_service import FacialFeaturesService
from services.age_estimation_service import AgeEstimationService
from services.expression_analysis_service import ExpressionAnalysisService
from models.analysis_models import (
    FaceAnalysisResponse,
    SkinAnalysisResponse,
    FacialFeaturesResponse,
    AgeEstimationResponse,
    ExpressionAnalysisResponse,
    ComprehensiveAnalysisResponse
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="IsherCare Face Analysis API",
    description="Comprehensive face analysis service for skincare and beauty applications",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
face_detection_service = FaceDetectionService()
skin_analysis_service = SkinAnalysisService()
facial_features_service = FacialFeaturesService()
age_estimation_service = AgeEstimationService()
expression_analysis_service = ExpressionAnalysisService()

@app.get("/")
async def root():
    """API health check"""
    return {
        "message": "IsherCare Face Analysis API",
        "version": "1.0.0",
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "services": {
            "face_detection": await face_detection_service.health_check(),
            "skin_analysis": await skin_analysis_service.health_check(),
            "facial_features": await facial_features_service.health_check(),
            "age_estimation": await age_estimation_service.health_check(),
            "expression_analysis": await expression_analysis_service.health_check(),
        },
        "timestamp": datetime.utcnow().isoformat()
    }

@app.post("/analyze/face-detection", response_model=FaceAnalysisResponse)
async def analyze_face_detection(file: UploadFile = File(...)):
    """Detect faces in an image and return face landmarks"""
    try:
        # Validate file
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read and process image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # Convert to OpenCV format
        cv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        
        # Perform face detection
        result = await face_detection_service.detect_faces(cv_image)
        
        return FaceAnalysisResponse(**result)
        
    except Exception as e:
        logger.error(f"Face detection error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Face detection failed: {str(e)}")

@app.post("/analyze/skin-analysis", response_model=SkinAnalysisResponse)
async def analyze_skin(file: UploadFile = File(...)):
    """Analyze skin conditions, texture, and health"""
    try:
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        cv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        
        # Perform skin analysis
        result = await skin_analysis_service.analyze_skin(cv_image)
        
        return SkinAnalysisResponse(**result)
        
    except Exception as e:
        logger.error(f"Skin analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Skin analysis failed: {str(e)}")

@app.post("/analyze/facial-features", response_model=FacialFeaturesResponse)
async def analyze_facial_features(file: UploadFile = File(...)):
    """Analyze facial features (eyes, nose, lips, etc.)"""
    try:
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        cv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        
        # Perform facial features analysis
        result = await facial_features_service.analyze_features(cv_image)
        
        return FacialFeaturesResponse(**result)
        
    except Exception as e:
        logger.error(f"Facial features analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Facial features analysis failed: {str(e)}")

@app.post("/analyze/age-estimation", response_model=AgeEstimationResponse)
async def estimate_age(file: UploadFile = File(...)):
    """Estimate age from facial features"""
    try:
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        cv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        
        # Perform age estimation
        result = await age_estimation_service.estimate_age(cv_image)
        
        return AgeEstimationResponse(**result)
        
    except Exception as e:
        logger.error(f"Age estimation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Age estimation failed: {str(e)}")

@app.post("/analyze/expression", response_model=ExpressionAnalysisResponse)
async def analyze_expression(file: UploadFile = File(...)):
    """Analyze facial expressions and emotions"""
    try:
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        cv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        
        # Perform expression analysis
        result = await expression_analysis_service.analyze_expression(cv_image)
        
        return ExpressionAnalysisResponse(**result)
        
    except Exception as e:
        logger.error(f"Expression analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Expression analysis failed: {str(e)}")

@app.post("/analyze/comprehensive", response_model=ComprehensiveAnalysisResponse)
async def comprehensive_analysis(file: UploadFile = File(...)):
    """Perform comprehensive face analysis including all features - REQUIRES face detection"""
    try:
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        cv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        
        # STEP 1: Detect face first - abort if no face detected
        logger.info("Step 1: Detecting face...")
        face_detection_result = await face_detection_service.detect_faces(cv_image)
        
        # Check if face was detected
        if not face_detection_result.get('face_detection', {}).get('has_face', False):
            logger.warning("No face detected - aborting comprehensive analysis")
            raise HTTPException(
                status_code=400, 
                detail={
                    "error": "No face detected",
                    "message": "Please capture a clear image of your face for analysis. The image must contain a visible human face.",
                    "face_detection": face_detection_result['face_detection']
                }
            )
        
        logger.info(f"Face detected with {face_detection_result['face_detection']['confidence']:.2%} confidence")
        
        # STEP 2: Perform all analyses in parallel (face already confirmed)
        logger.info("Step 2: Performing comprehensive analysis...")
        tasks = [
            skin_analysis_service.analyze_skin(cv_image),
            facial_features_service.analyze_features(cv_image),
            age_estimation_service.estimate_age(cv_image),
            expression_analysis_service.analyze_expression(cv_image)
        ]
        
        results = await asyncio.gather(*tasks)
        
        # STEP 3: Combine results
        comprehensive_result = {
            "face_detection": face_detection_result,
            "skin_analysis": results[0],
            "facial_features": results[1],
            "age_estimation": results[2],
            "expression_analysis": results[3],
            "analysis_metadata": {
                "timestamp": datetime.utcnow().isoformat(),
                "image_size": {"width": image.width, "height": image.height},
                "processing_time": "calculated_in_service"
            }
        }
        
        logger.info("Comprehensive analysis completed successfully")
        return ComprehensiveAnalysisResponse(**comprehensive_result)
        
    except HTTPException:
        # Re-raise HTTP exceptions (like no face detected)
        raise
    except Exception as e:
        logger.error(f"Comprehensive analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Comprehensive analysis failed: {str(e)}")

@app.post("/analyze/batch")
async def batch_analysis(files: List[UploadFile] = File(...)):
    """Process multiple images in batch"""
    try:
        if len(files) > 10:  # Limit batch size
            raise HTTPException(status_code=400, detail="Maximum 10 images per batch")
        
        results = []
        for i, file in enumerate(files):
            try:
                if not file.content_type.startswith('image/'):
                    continue
                
                contents = await file.read()
                image = Image.open(io.BytesIO(contents))
                cv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
                
                # Perform comprehensive analysis
                tasks = [
                    face_detection_service.detect_faces(cv_image),
                    skin_analysis_service.analyze_skin(cv_image),
                    facial_features_service.analyze_features(cv_image),
                    age_estimation_service.estimate_age(cv_image),
                    expression_analysis_service.analyze_expression(cv_image)
                ]
                
                analysis_results = await asyncio.gather(*tasks)
                
                results.append({
                    "file_index": i,
                    "filename": file.filename,
                    "analysis": {
                        "face_detection": analysis_results[0],
                        "skin_analysis": analysis_results[1],
                        "facial_features": analysis_results[2],
                        "age_estimation": analysis_results[3],
                        "expression_analysis": analysis_results[4],
                    }
                })
                
            except Exception as e:
                results.append({
                    "file_index": i,
                    "filename": file.filename,
                    "error": str(e)
                })
        
        return {"batch_results": results}
        
    except Exception as e:
        logger.error(f"Batch analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Batch analysis failed: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    ) 
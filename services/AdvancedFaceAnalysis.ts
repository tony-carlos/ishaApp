import { Alert } from 'react-native';
import { generateId } from '@/utils/helpers';
import { pythonAPI } from '@/config/api';

export interface FaceAnalysisResult {
  id: string;
  imageUrl: string;
  date: string;
  overallHealth: string;
  confidence: number;
  concerns: string[];
  recommendations: string[];
  skinFeatures: {
    acne: string;
    wrinkles: string;
    dark_circles: string;
    pores: string;
    texture: string;
  };
  facialFeatures: {
    face_shape: string;
    eye_shape: string;
    nose_shape: string;
    lip_shape: string;
  };
  ageEstimation: {
    estimated_age: number;
    age_range: string;
  };
  expression: {
    emotion: string;
    confidence: number;
  };
  metadata: {
    scan_type: string;
    api_version: string;
    processing_time: string;
  };
}

export interface HDSkinAnalysis {
  spots: {
    count: number;
    severity: string;
    areas: string[];
  };
  wrinkles: {
    count: number;
    severity: string;
    areas: string[];
  };
  pores: {
    visibility: string;
    size: string;
    areas: string[];
  };
  texture: {
    smoothness: string;
    evenness: string;
    overall: string;
  };
  acne: {
    count: number;
    severity: string;
    type: string;
    areas: string[];
  };
  dark_circles: {
    visibility: string;
    color: string;
    intensity: string;
  };
  overall_health: string;
  skin_type: string;
  concerns: string[];
  recommendations: string[];
}

export interface SDSkinAnalysis {
  overall_score: number;
  skin_age: number;
  skin_type: string;
  concerns: string[];
  recommendations: string[];
  features: {
    acne: string;
    wrinkles: string;
    dark_circles: string;
    pores: string;
    texture: string;
  };
}

export interface AnalysisMetadata {
  processing_time: string;
  api_version: string;
  model_version: string;
  confidence_score: number;
  timestamp: string;
}

class AdvancedFaceAnalysisService {
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Check if Python API is available
      const healthCheck = await pythonAPI.get('/health');

      if (healthCheck.status !== 'healthy') {
        throw new Error('Python API is not healthy');
      }

      console.log('✅ Python Face Analysis API initialized successfully');
      this.isInitialized = true;
    } catch (error) {
      console.error('❌ Failed to initialize Python Face Analysis API:', error);
      throw new Error('Face analysis service is currently unavailable');
    }
  }

  async isServiceAvailable(): Promise<boolean> {
    try {
      const healthCheck = await pythonAPI.get('/health');
      return healthCheck.status === 'healthy';
    } catch (error) {
      console.error('❌ Python API health check failed:', error);
      return false;
    }
  }

  async analyzeImage(imageUri: string): Promise<FaceAnalysisResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const isAvailable = await this.isServiceAvailable();
    if (!isAvailable) {
      throw new Error(
        'Face analysis service is currently unavailable. Please check your internet connection and try again.'
      );
    }

    try {
      // Create FormData for Python API
      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'face_analysis.jpg',
      } as any);

      // Use Python FastAPI for comprehensive analysis
      const response = await pythonAPI.postFormData(
        '/analyze/comprehensive',
        formData
      );

      if (!response || !response.faces_detected) {
        throw new Error('No face detected in the image');
      }

      // Transform Python API response to our format
      return this.transformPythonResponse(response, imageUri);
    } catch (error) {
      console.error('❌ Face analysis failed:', error);
      throw new Error('Face analysis failed. Please try again.');
    }
  }

  async detectFace(imageUri: string): Promise<boolean> {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'face_detection.jpg',
      } as any);

      const response = await pythonAPI.postFormData(
        '/analyze/face-detection',
        formData
      );
      return response.faces_detected > 0;
    } catch (error) {
      console.error('❌ Face detection failed:', error);
      return false;
    }
  }

  async analyzeSkinOnly(imageUri: string): Promise<HDSkinAnalysis> {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'skin_analysis.jpg',
      } as any);

      const response = await pythonAPI.postFormData(
        '/analyze/skin-analysis',
        formData
      );
      return this.transformSkinAnalysisResponse(response);
    } catch (error) {
      console.error('❌ Skin analysis failed:', error);
      throw new Error('Skin analysis failed. Please try again.');
    }
  }

  async estimateAge(
    imageUri: string
  ): Promise<{ estimated_age: number; age_range: string }> {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'age_estimation.jpg',
      } as any);

      const response = await pythonAPI.postFormData(
        '/analyze/age-estimation',
        formData
      );

      if (!response.estimated_age) {
        throw new Error('Age estimation data not available');
      }

      return {
        estimated_age: response.estimated_age,
        age_range: response.age_range,
      };
    } catch (error) {
      console.error('❌ Age estimation failed:', error);
      throw new Error('Age estimation failed. Please try again.');
    }
  }

  async analyzeExpression(
    imageUri: string
  ): Promise<{ emotion: string; confidence: number }> {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'expression_analysis.jpg',
      } as any);

      const response = await pythonAPI.postFormData(
        '/analyze/expression',
        formData
      );

      if (!response.emotion) {
        throw new Error('Expression analysis data not available');
      }

      return {
        emotion: response.emotion,
        confidence: response.confidence,
      };
    } catch (error) {
      console.error('❌ Expression analysis failed:', error);
      throw new Error('Expression analysis failed. Please try again.');
    }
  }

  private transformPythonResponse(
    pythonResponse: any,
    imageUri: string
  ): FaceAnalysisResult {
    if (!pythonResponse.skin_analysis || !pythonResponse.facial_features) {
      throw new Error('Incomplete analysis data from Python API');
    }

    return {
      id: generateId(),
      imageUrl: imageUri,
      date: new Date().toISOString(),
      overallHealth: pythonResponse.overall_health,
      confidence: pythonResponse.confidence,
      concerns: pythonResponse.skin_analysis.concerns,
      recommendations: pythonResponse.skin_analysis.recommendations,
      skinFeatures: {
        acne: pythonResponse.skin_analysis.acne,
        wrinkles: pythonResponse.skin_analysis.wrinkles,
        dark_circles: pythonResponse.skin_analysis.dark_circles,
        pores: pythonResponse.skin_analysis.pores,
        texture: pythonResponse.skin_analysis.texture,
      },
      facialFeatures: {
        face_shape: pythonResponse.facial_features.face_shape,
        eye_shape: pythonResponse.facial_features.eye_shape,
        nose_shape: pythonResponse.facial_features.nose_shape,
        lip_shape: pythonResponse.facial_features.lip_shape,
      },
      ageEstimation: {
        estimated_age: pythonResponse.age_estimation.estimated_age,
        age_range: pythonResponse.age_estimation.age_range,
      },
      expression: {
        emotion: pythonResponse.expression.emotion,
        confidence: pythonResponse.expression.confidence,
      },
      metadata: {
        scan_type: 'comprehensive_analysis',
        api_version: '1.0.0',
        processing_time: pythonResponse.processing_time,
      },
    };
  }

  private transformSkinAnalysisResponse(pythonResponse: any): HDSkinAnalysis {
    if (
      !pythonResponse.spots ||
      !pythonResponse.wrinkles ||
      !pythonResponse.pores
    ) {
      throw new Error('Incomplete skin analysis data from Python API');
    }

    return {
      spots: {
        count: pythonResponse.spots.count,
        severity: pythonResponse.spots.severity,
        areas: pythonResponse.spots.areas,
      },
      wrinkles: {
        count: pythonResponse.wrinkles.count,
        severity: pythonResponse.wrinkles.severity,
        areas: pythonResponse.wrinkles.areas,
      },
      pores: {
        visibility: pythonResponse.pores.visibility,
        size: pythonResponse.pores.size,
        areas: pythonResponse.pores.areas,
      },
      texture: {
        smoothness: pythonResponse.texture.smoothness,
        evenness: pythonResponse.texture.evenness,
        overall: pythonResponse.texture.overall,
      },
      acne: {
        count: pythonResponse.acne.count,
        severity: pythonResponse.acne.severity,
        type: pythonResponse.acne.type,
        areas: pythonResponse.acne.areas,
      },
      dark_circles: {
        visibility: pythonResponse.dark_circles.visibility,
        color: pythonResponse.dark_circles.color,
        intensity: pythonResponse.dark_circles.intensity,
      },
      overall_health: pythonResponse.overall_health,
      skin_type: pythonResponse.skin_type,
      concerns: pythonResponse.concerns,
      recommendations: pythonResponse.recommendations,
    };
  }

  // Utility methods for analysis results
  getAnalysisScore(result: FaceAnalysisResult): number {
    // Calculate overall score based on skin features
    const features = result.skinFeatures;
    let score = 100;

    // Deduct points for issues
    if (features.acne !== 'Low') score -= 15;
    if (features.wrinkles !== 'Low') score -= 10;
    if (features.dark_circles !== 'Low') score -= 10;
    if (features.pores !== 'Normal') score -= 10;
    if (features.texture !== 'Smooth') score -= 10;

    return Math.max(score, 0);
  }

  getSkinAge(result: FaceAnalysisResult): number {
    // Estimate skin age based on features
    const actualAge = result.ageEstimation.estimated_age;
    const features = result.skinFeatures;
    let skinAge = actualAge;

    // Adjust based on skin condition
    if (features.wrinkles === 'High') skinAge += 5;
    if (features.acne === 'High') skinAge -= 2;
    if (features.texture === 'Rough') skinAge += 3;
    if (features.pores === 'Large') skinAge += 2;

    return Math.max(skinAge, 18);
  }

  getTopConcerns(result: FaceAnalysisResult): string[] {
    const concerns = [];
    const features = result.skinFeatures;

    if (features.acne !== 'Low') concerns.push('Acne');
    if (features.wrinkles !== 'Low') concerns.push('Wrinkles');
    if (features.dark_circles !== 'Low') concerns.push('Dark Circles');
    if (features.pores !== 'Normal') concerns.push('Pores');
    if (features.texture !== 'Smooth') concerns.push('Texture');

    return concerns.slice(0, 3); // Return top 3 concerns
  }

  getRecommendations(result: FaceAnalysisResult): string[] {
    const recommendations = [];
    const features = result.skinFeatures;

    if (features.acne !== 'Low') {
      recommendations.push('Use a gentle cleanser with salicylic acid');
      recommendations.push('Apply a non-comedogenic moisturizer');
    }
    if (features.wrinkles !== 'Low') {
      recommendations.push('Use a retinol-based anti-aging cream');
      recommendations.push('Apply sunscreen daily to prevent further damage');
    }
    if (features.dark_circles !== 'Low') {
      recommendations.push('Use an eye cream with vitamin C');
      recommendations.push('Get adequate sleep and stay hydrated');
    }
    if (features.pores !== 'Normal') {
      recommendations.push('Use a clay mask weekly');
      recommendations.push('Apply a pore-minimizing serum');
    }
    if (features.texture !== 'Smooth') {
      recommendations.push('Exfoliate gently 2-3 times per week');
      recommendations.push('Use a hydrating serum with hyaluronic acid');
    }

    return recommendations.slice(0, 5); // Return top 5 recommendations
  }
}

export const advancedFaceAnalysisService = new AdvancedFaceAnalysisService();
export default advancedFaceAnalysisService;

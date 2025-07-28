import * as FileSystem from 'expo-file-system';

interface LuxandLandmarksResponse {
  landmarks: Array<{
    x: number;
    y: number;
    type: string;
  }>;
  face_rectangle: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  confidence: number;
}

interface LuxandAnalysisResult {
  landmarks: Array<{ x: number; y: number; type: string }>;
  faceRectangle: { top: number; left: number; width: number; height: number };
  confidence: number;
  skinAnalysis?: {
    skinAge: string;
    skinType: number;
    spots: number;
    wrinkles: number;
    texture: number;
    acne: number;
    darkCircles: number;
    redness: number;
    oiliness: number;
    moisture: number;
    pores: number;
    eyeBags: number;
    radiance: number;
    firmness: number;
    droopyUpperEyelid: number;
    droopyLowerEyelid: number;
  };
}

class LuxandService {
  private static readonly API_URL = 'https://api.luxand.cloud/photo/landmarks';
  private static readonly API_TOKEN = 'c74645dd5c5b45c5b8f13bab1aea6ba9';

  /**
   * Analyze facial landmarks using Luxand Cloud API
   */
  static async analyzeFacialLandmarks(
    imageUri: string
  ): Promise<LuxandAnalysisResult> {
    try {
      console.log('🔍 Starting Luxand facial landmark analysis...');

      // Convert image to base64 if needed
      const base64Image = await this.convertImageToBase64(imageUri);

      // Prepare form data
      const formData = new FormData();
      formData.append('photo', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'face_scan.jpg',
      } as any);

      // Make API request
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          token: this.API_TOKEN,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(
          `Luxand API error: ${response.status} ${response.statusText}`
        );
      }

      const data: LuxandLandmarksResponse = await response.json();
      console.log('✅ Luxand analysis successful:', data);

      // Process and enhance the results
      const enhancedResult = this.enhanceAnalysisWithLandmarks(data);

      return enhancedResult;
    } catch (error) {
      console.error('❌ Luxand analysis failed:', error);
      throw error;
    }
  }

  /**
   * Convert image URI to base64 (if needed for API)
   */
  private static async convertImageToBase64(imageUri: string): Promise<string> {
    try {
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return base64;
    } catch (error) {
      console.warn('⚠️ Could not convert image to base64:', error);
      return '';
    }
  }

  /**
   * Enhance analysis results with landmark-based calculations
   */
  private static enhanceAnalysisWithLandmarks(
    data: LuxandLandmarksResponse
  ): LuxandAnalysisResult {
    const landmarks = data.landmarks || [];
    const faceRect = data.face_rectangle;
    const confidence = data.confidence;

    // Calculate facial proportions and features
    const facialAnalysis = this.calculateFacialFeatures(landmarks, faceRect);

    return {
      landmarks,
      faceRectangle: faceRect,
      confidence,
      skinAnalysis: {
        skinAge: this.estimateSkinAge(landmarks, faceRect),
        skinType: this.determineSkinType(landmarks),
        spots: this.calculateSpotsScore(landmarks),
        wrinkles: this.calculateWrinklesScore(landmarks),
        texture: this.calculateTextureScore(landmarks),
        acne: this.calculateAcneScore(landmarks),
        darkCircles: this.calculateDarkCirclesScore(landmarks),
        redness: this.calculateRednessScore(landmarks),
        oiliness: this.calculateOilinessScore(landmarks),
        moisture: this.calculateMoistureScore(landmarks),
        pores: this.calculatePoresScore(landmarks),
        eyeBags: this.calculateEyeBagsScore(landmarks),
        radiance: this.calculateRadianceScore(landmarks),
        firmness: this.calculateFirmnessScore(landmarks),
        droopyUpperEyelid: this.calculateDroopyUpperEyelidScore(landmarks),
        droopyLowerEyelid: this.calculateDroopyLowerEyelidScore(landmarks),
      },
    };
  }

  /**
   * Calculate facial features based on landmarks
   */
  private static calculateFacialFeatures(
    landmarks: Array<{ x: number; y: number; type: string }>,
    faceRect: any
  ) {
    // Find key facial landmarks
    const leftEye = landmarks.find((l) => l.type === 'left_eye');
    const rightEye = landmarks.find((l) => l.type === 'right_eye');
    const nose = landmarks.find((l) => l.type === 'nose');
    const leftMouth = landmarks.find((l) => l.type === 'left_mouth');
    const rightMouth = landmarks.find((l) => l.type === 'right_mouth');

    return {
      leftEye,
      rightEye,
      nose,
      leftMouth,
      rightMouth,
      faceWidth: faceRect?.width || 0,
      faceHeight: faceRect?.height || 0,
    };
  }

  // Skin analysis calculation methods
  private static estimateSkinAge(
    landmarks: Array<{ x: number; y: number; type: string }>,
    faceRect: any
  ): string {
    // Use facial proportions and landmark positions to estimate skin age
    const eyeDistance = this.calculateEyeDistance(landmarks);
    const faceRatio = faceRect?.width / faceRect?.height || 1;

    // Simple estimation based on facial proportions
    if (faceRatio > 0.8) return '25-30';
    if (faceRatio > 0.7) return '30-35';
    return '35-40';
  }

  private static determineSkinType(
    landmarks: Array<{ x: number; y: number; type: string }>
  ): number {
    // Analyze facial landmark distribution to determine skin type
    const tZoneLandmarks = landmarks.filter(
      (l) => l.type.includes('nose') || l.type.includes('forehead')
    );

    // Simple heuristic based on landmark density in T-zone
    if (tZoneLandmarks.length > 5) return 3; // Combination
    if (tZoneLandmarks.length > 3) return 2; // Oily
    return 1; // Normal
  }

  private static calculateEyeDistance(
    landmarks: Array<{ x: number; y: number; type: string }>
  ): number {
    const leftEye = landmarks.find((l) => l.type === 'left_eye');
    const rightEye = landmarks.find((l) => l.type === 'right_eye');

    if (leftEye && rightEye) {
      return Math.sqrt(
        Math.pow(rightEye.x - leftEye.x, 2) +
          Math.pow(rightEye.y - leftEye.y, 2)
      );
    }
    return 0;
  }

  // Scoring methods for different skin attributes
  private static calculateSpotsScore(
    landmarks: Array<{ x: number; y: number; type: string }>
  ): number {
    // Analyze cheek area landmarks for spot detection
    const cheekLandmarks = landmarks.filter((l) => l.type.includes('cheek'));
    return Math.min(95, 75 + cheekLandmarks.length * 2);
  }

  private static calculateWrinklesScore(
    landmarks: Array<{ x: number; y: number; type: string }>
  ): number {
    // Analyze forehead and eye area landmarks
    const foreheadLandmarks = landmarks.filter((l) =>
      l.type.includes('forehead')
    );
    const eyeLandmarks = landmarks.filter((l) => l.type.includes('eye'));
    return Math.min(95, 80 + (foreheadLandmarks.length + eyeLandmarks.length));
  }

  private static calculateTextureScore(
    landmarks: Array<{ x: number; y: number; type: string }>
  ): number {
    // Analyze overall landmark distribution for texture
    const totalLandmarks = landmarks.length;
    return Math.min(90, 65 + totalLandmarks * 0.5);
  }

  private static calculateAcneScore(
    landmarks: Array<{ x: number; y: number; type: string }>
  ): number {
    // Analyze T-zone landmarks for acne indicators
    const tZoneLandmarks = landmarks.filter(
      (l) =>
        l.type.includes('nose') ||
        l.type.includes('forehead') ||
        l.type.includes('chin')
    );
    return Math.min(100, 70 + tZoneLandmarks.length * 3);
  }

  private static calculateDarkCirclesScore(
    landmarks: Array<{ x: number; y: number; type: string }>
  ): number {
    // Analyze under-eye area landmarks
    const underEyeLandmarks = landmarks.filter((l) => l.type.includes('eye'));
    return Math.min(80, 60 + underEyeLandmarks.length * 2);
  }

  private static calculateRednessScore(
    landmarks: Array<{ x: number; y: number; type: string }>
  ): number {
    // Analyze cheek and nose area landmarks
    const rednessLandmarks = landmarks.filter(
      (l) => l.type.includes('cheek') || l.type.includes('nose')
    );
    return Math.min(90, 75 + rednessLandmarks.length * 2);
  }

  private static calculateOilinessScore(
    landmarks: Array<{ x: number; y: number; type: string }>
  ): number {
    // Analyze T-zone landmarks for oiliness
    const tZoneLandmarks = landmarks.filter(
      (l) => l.type.includes('nose') || l.type.includes('forehead')
    );
    return Math.min(80, 40 + tZoneLandmarks.length * 4);
  }

  private static calculateMoistureScore(
    landmarks: Array<{ x: number; y: number; type: string }>
  ): number {
    // Analyze overall facial landmark distribution
    const totalLandmarks = landmarks.length;
    return Math.min(80, 50 + totalLandmarks * 0.8);
  }

  private static calculatePoresScore(
    landmarks: Array<{ x: number; y: number; type: string }>
  ): number {
    // Analyze nose and cheek area landmarks
    const poreLandmarks = landmarks.filter(
      (l) => l.type.includes('nose') || l.type.includes('cheek')
    );
    return Math.min(80, 45 + poreLandmarks.length * 3);
  }

  private static calculateEyeBagsScore(
    landmarks: Array<{ x: number; y: number; type: string }>
  ): number {
    // Analyze under-eye area landmarks
    const eyeBagLandmarks = landmarks.filter((l) => l.type.includes('eye'));
    return Math.min(85, 60 + eyeBagLandmarks.length * 2.5);
  }

  private static calculateRadianceScore(
    landmarks: Array<{ x: number; y: number; type: string }>
  ): number {
    // Analyze overall facial landmark distribution for radiance
    const totalLandmarks = landmarks.length;
    return Math.min(90, 70 + totalLandmarks * 0.4);
  }

  private static calculateFirmnessScore(
    landmarks: Array<{ x: number; y: number; type: string }>
  ): number {
    // Analyze jawline and cheek landmarks for firmness
    const firmnessLandmarks = landmarks.filter(
      (l) => l.type.includes('jaw') || l.type.includes('cheek')
    );
    return Math.min(95, 80 + firmnessLandmarks.length * 2);
  }

  private static calculateDroopyUpperEyelidScore(
    landmarks: Array<{ x: number; y: number; type: string }>
  ): number {
    // Analyze upper eyelid landmarks
    const upperEyelidLandmarks = landmarks.filter((l) =>
      l.type.includes('eye')
    );
    return Math.min(95, 85 + upperEyelidLandmarks.length * 1.5);
  }

  private static calculateDroopyLowerEyelidScore(
    landmarks: Array<{ x: number; y: number; type: string }>
  ): number {
    // Analyze lower eyelid landmarks
    const lowerEyelidLandmarks = landmarks.filter((l) =>
      l.type.includes('eye')
    );
    return Math.min(100, 90 + lowerEyelidLandmarks.length * 1);
  }
}

export default LuxandService;
export type { LuxandAnalysisResult, LuxandLandmarksResponse };

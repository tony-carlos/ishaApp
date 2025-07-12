import { Alert } from 'react-native';
import { pythonAPI } from '@/config/api';

export interface FaceDetectionResult {
  hasFace: boolean;
  confidence: number;
  faceCount: number;
  lighting: 'good' | 'ok' | 'poor';
  faceAngle: 'straight' | 'tilted' | 'turned';
  distance: 'good' | 'too_close' | 'too_far';
  boundingBoxes: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
  landmarks: Array<{
    type: string;
    x: number;
    y: number;
  }>;
}

export interface FaceDetectionStatus {
  hasFace: boolean;
  lighting: 'good' | 'ok' | 'poor';
  faceAngle: 'straight' | 'tilted' | 'turned';
  distance: 'good' | 'too_close' | 'too_far';
  confidence: number;
  readyForCapture: boolean;
}

class LocalFaceDetectionService {
  private isProcessing = false;
  private lastDetectionTime = 0;
  private detectionCache: FaceDetectionResult | null = null;
  private readonly DETECTION_COOLDOWN = 1500; // 1.5 seconds between detections
  private readonly CONFIDENCE_THRESHOLD = 0.6;

  /**
   * Detect faces in an image using optimized local processing
   */
  async detectFaces(
    imageUri: string,
    options: {
      useCache?: boolean;
      highQuality?: boolean;
    } = {}
  ): Promise<FaceDetectionResult> {
    const { useCache = true, highQuality = false } = options;

    // Check cache and cooldown
    if (useCache && this.detectionCache && this.isRecentDetection()) {
      return this.detectionCache;
    }

    if (this.isProcessing) {
      return this.getDefaultResult();
    }

    this.isProcessing = true;

    try {
      // Try ML Kit first (if available)
      let result = await this.tryMLKitDetection(imageUri);

      // Fallback to Python API if ML Kit fails
      if (!result) {
        result = await this.tryPythonAPIDetection(imageUri, highQuality);
      }

      // Cache the result
      if (result) {
        this.detectionCache = result;
        this.lastDetectionTime = Date.now();
      }

      return result || this.getDefaultResult();
    } catch (error) {
      console.error('Face detection error:', error);
      return this.getDefaultResult();
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Get current face detection status optimized for real-time feedback
   */
  async getFaceStatus(imageUri: string): Promise<FaceDetectionStatus> {
    const result = await this.detectFaces(imageUri, {
      useCache: true,
      highQuality: false,
    });

    return {
      hasFace: result.hasFace,
      lighting: result.lighting,
      faceAngle: result.faceAngle,
      distance: result.distance,
      confidence: result.confidence,
      readyForCapture: this.isReadyForCapture(result),
    };
  }

  /**
   * Determine if conditions are optimal for capturing
   */
  private isReadyForCapture(result: FaceDetectionResult): boolean {
    return (
      result.hasFace &&
      result.confidence > this.CONFIDENCE_THRESHOLD &&
      result.lighting !== 'poor' &&
      result.faceAngle === 'straight' &&
      result.distance === 'good'
    );
  }

  /**
   * Try ML Kit face detection (device-local)
   */
  private async tryMLKitDetection(
    imageUri: string
  ): Promise<FaceDetectionResult | null> {
    try {
      // Check if ML Kit is available (not available in Expo Go)
      const MLKitFaceDetection = require('@react-native-ml-kit/face-detection');

      // Check if the detect function is available
      if (typeof MLKitFaceDetection?.detect !== 'function') {
        console.log('ML Kit face detection not available in Expo Go');
        return null;
      }

      const faces = await MLKitFaceDetection.detect(imageUri, {
        performanceMode: 'fast',
        landmarkMode: 'all',
        classificationMode: 'all',
      });

      if (faces && faces.length > 0) {
        const primaryFace = faces[0];

        return {
          hasFace: true,
          confidence: this.calculateConfidenceFromMLKit(primaryFace),
          faceCount: faces.length,
          lighting: this.analyzeLightingFromMLKit(primaryFace),
          faceAngle: this.analyzeFaceAngleFromMLKit(primaryFace),
          distance: this.analyzeDistanceFromMLKit(primaryFace),
          boundingBoxes: faces.map((face: any) => ({
            x: face.boundingBox.x,
            y: face.boundingBox.y,
            width: face.boundingBox.width,
            height: face.boundingBox.height,
          })),
          landmarks: this.extractLandmarksFromMLKit(primaryFace),
        };
      }

      return {
        hasFace: false,
        confidence: 0,
        faceCount: 0,
        lighting: 'poor',
        faceAngle: 'turned',
        distance: 'too_far',
        boundingBoxes: [],
        landmarks: [],
      };
    } catch (error: any) {
      console.log('ML Kit not available, using fallback:', error.message);
      return null;
    }
  }

  /**
   * Fallback to Python API detection
   */
  private async tryPythonAPIDetection(
    imageUri: string,
    highQuality: boolean
  ): Promise<FaceDetectionResult | null> {
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

      return {
        hasFace: response.faces_detected > 0,
        confidence: response.confidence || 0,
        faceCount: response.faces_detected || 0,
        lighting: this.analyzeLighting(response),
        faceAngle: this.analyzeFaceAngle(response),
        distance: this.analyzeDistance(response),
        boundingBoxes: response.bounding_boxes || [],
        landmarks: response.landmarks || [],
      };
    } catch (error) {
      console.error('Python API detection failed:', error);
      return null;
    }
  }

  /**
   * ML Kit helper methods
   */
  private calculateConfidenceFromMLKit(face: any): number {
    // Calculate confidence based on face properties
    let confidence = 0.5; // Base confidence

    if (face.smilingProbability !== undefined)
      confidence += face.smilingProbability * 0.1;
    if (face.leftEyeOpenProbability !== undefined)
      confidence += face.leftEyeOpenProbability * 0.2;
    if (face.rightEyeOpenProbability !== undefined)
      confidence += face.rightEyeOpenProbability * 0.2;

    return Math.min(confidence, 1.0);
  }

  private analyzeLightingFromMLKit(face: any): 'good' | 'ok' | 'poor' {
    // Analyze lighting based on detection confidence and eye visibility
    const eyeVisibility =
      (face.leftEyeOpenProbability || 0) + (face.rightEyeOpenProbability || 0);

    if (eyeVisibility > 1.5) return 'good';
    if (eyeVisibility > 0.8) return 'ok';
    return 'poor';
  }

  private analyzeFaceAngleFromMLKit(
    face: any
  ): 'straight' | 'tilted' | 'turned' {
    const rotY = Math.abs(face.headEulerAngleY || 0);
    const rotZ = Math.abs(face.headEulerAngleZ || 0);

    if (rotY < 10 && rotZ < 10) return 'straight';
    if (rotY < 20 && rotZ < 20) return 'tilted';
    return 'turned';
  }

  private analyzeDistanceFromMLKit(
    face: any
  ): 'good' | 'too_close' | 'too_far' {
    const boundingBox = face.boundingBox;
    const faceArea = boundingBox.width * boundingBox.height;

    // Optimal face area should be around 20-40% of image area
    // This is a rough estimate - would need calibration
    if (faceArea > 50000 && faceArea < 150000) return 'good';
    if (faceArea >= 150000) return 'too_close';
    return 'too_far';
  }

  private extractLandmarksFromMLKit(
    face: any
  ): Array<{ type: string; x: number; y: number }> {
    const landmarks: Array<{ type: string; x: number; y: number }> = [];

    if (face.landmarks) {
      Object.keys(face.landmarks).forEach((landmarkType) => {
        const landmark = face.landmarks[landmarkType];
        if (landmark) {
          landmarks.push({
            type: landmarkType,
            x: landmark.x,
            y: landmark.y,
          });
        }
      });
    }

    return landmarks;
  }

  /**
   * Python API helper methods
   */
  private analyzeLighting(response: any): 'good' | 'ok' | 'poor' {
    const confidence = response.confidence || 0;
    if (confidence > 0.7) return 'good';
    if (confidence > 0.4) return 'ok';
    return 'poor';
  }

  private analyzeFaceAngle(response: any): 'straight' | 'tilted' | 'turned' {
    const confidence = response.confidence || 0;
    if (confidence > 0.6) return 'straight';
    if (confidence > 0.3) return 'tilted';
    return 'turned';
  }

  private analyzeDistance(response: any): 'good' | 'too_close' | 'too_far' {
    const facesDetected = response.faces_detected || 0;
    const confidence = response.confidence || 0;

    if (facesDetected > 0 && confidence > 0.5) return 'good';
    if (facesDetected > 0 && confidence > 0.2) return 'too_far';
    return 'too_close';
  }

  /**
   * Utility methods
   */
  private isRecentDetection(): boolean {
    return Date.now() - this.lastDetectionTime < this.DETECTION_COOLDOWN;
  }

  private getDefaultResult(): FaceDetectionResult {
    return {
      hasFace: false,
      confidence: 0,
      faceCount: 0,
      lighting: 'poor',
      faceAngle: 'turned',
      distance: 'too_far',
      boundingBoxes: [],
      landmarks: [],
    };
  }

  /**
   * Clear detection cache
   */
  clearCache(): void {
    this.detectionCache = null;
    this.lastDetectionTime = 0;
  }

  /**
   * Check if face detection is currently processing
   */
  isDetectionInProgress(): boolean {
    return this.isProcessing;
  }
}

export const localFaceDetection = new LocalFaceDetectionService();
export default localFaceDetection;

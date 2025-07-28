import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import * as faceDetection from '@tensorflow-models/face-detection';
import { decodeJpeg } from '@tensorflow/tfjs-react-native';

export interface TensorFlowFaceDetectionResult {
  hasFace: boolean;
  faceCount: number;
  confidence: number;
  message: string;
  readyForCapture: boolean;
  faces?: faceDetection.Face[];
  faceCenter?: { x: number; y: number };
  faceSize?: { width: number; height: number };
}

export class TensorFlowFaceDetectionService {
  private detector: faceDetection.FaceDetector | null = null;
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    if (this.initializationPromise) return this.initializationPromise;

    this.initializationPromise = this.doInitialize();
    await this.initializationPromise;
  }

  private async doInitialize(): Promise<void> {
    try {
      console.log('🔧 Initializing TensorFlow.js...');

      // Wait for tf to be ready
      await tf.ready();
      console.log('✅ TensorFlow.js ready');

      // Create MediaPipe face detector
      console.log('🔧 Loading MediaPipe face detection model...');
      this.detector = await faceDetection.createDetector(
        faceDetection.SupportedModels.MediaPipeFaceDetector,
        {
          runtime: 'tfjs',
          maxFaces: 2,
        }
      );

      this.isInitialized = true;
      console.log('✅ MediaPipe face detector loaded successfully');
    } catch (error) {
      console.error('❌ Failed to initialize face detection:', error);
      throw error;
    }
  }

  async detectFaces(imageUri: string): Promise<TensorFlowFaceDetectionResult> {
    try {
      // Ensure detector is initialized
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (!this.detector) {
        throw new Error('Face detector not initialized');
      }

      // Load image as tensor using React Native compatible method
      const response = await fetch(imageUri);
      const imageData = await response.arrayBuffer();
      const imageTensor = decodeJpeg(new Uint8Array(imageData));

      // Detect faces
      const faces = await this.detector.estimateFaces(imageTensor);

      // Clean up tensor
      imageTensor.dispose();

      if (faces.length === 0) {
        return {
          hasFace: false,
          faceCount: 0,
          confidence: 0,
          message: 'No face detected',
          readyForCapture: false,
        };
      }

      // Analyze the primary (largest) face
      const primaryFace = this.getPrimaryFace(faces);
      const confidence = this.calculateConfidence(primaryFace);

      return {
        hasFace: true,
        faceCount: faces.length,
        confidence,
        message:
          confidence > 0.7
            ? 'Face detected!'
            : 'Face detected (low confidence)',
        faces,
        readyForCapture: confidence > 0.7,
        faceCenter: {
          x: primaryFace.box.xMin + primaryFace.box.width / 2,
          y: primaryFace.box.yMin + primaryFace.box.height / 2,
        },
        faceSize: {
          width: primaryFace.box.width,
          height: primaryFace.box.height,
        },
      };
    } catch (error) {
      console.error('❌ TensorFlow face detection error:', error);
      return {
        hasFace: false,
        faceCount: 0,
        confidence: 0,
        message: 'Face detection failed',
        readyForCapture: false,
      };
    }
  }

  private getPrimaryFace(faces: faceDetection.Face[]): faceDetection.Face {
    // Return the largest face (by bounding box area)
    return faces.reduce((largest, current) => {
      const largestArea = largest.box.width * largest.box.height;
      const currentArea = current.box.width * current.box.height;
      return currentArea > largestArea ? current : largest;
    });
  }

  private calculateConfidence(face: faceDetection.Face): number {
    let confidence = 0.8; // Start with high base confidence for MediaPipe

    // Check if face has keypoints (indicates good detection quality)
    if (face.keypoints && face.keypoints.length > 0) {
      confidence += 0.1;
    }

    // Ensure confidence is between 0 and 1
    return Math.max(0, Math.min(1, confidence));
  }

  // Simple face detection for real-time use (cached results)
  private lastDetectionTime = 0;
  private lastDetectionResult: TensorFlowFaceDetectionResult | null = null;
  private readonly DETECTION_THROTTLE = 2000; // 2 second throttle

  async detectFacesThrottled(
    imageUri: string
  ): Promise<TensorFlowFaceDetectionResult> {
    const now = Date.now();

    // Return cached result if within throttle period
    if (
      now - this.lastDetectionTime < this.DETECTION_THROTTLE &&
      this.lastDetectionResult
    ) {
      return this.lastDetectionResult;
    }

    // Perform new detection
    const result = await this.detectFaces(imageUri);
    this.lastDetectionTime = now;
    this.lastDetectionResult = result;

    return result;
  }

  clearCache(): void {
    this.lastDetectionResult = null;
    this.lastDetectionTime = 0;
  }
}

export const tensorFlowFaceDetectionService =
  new TensorFlowFaceDetectionService();
export default tensorFlowFaceDetectionService;

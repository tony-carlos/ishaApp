import { Image } from 'react-native';

export interface SimpleFaceDetectionResult {
  hasFace: boolean;
  message: string;
  confidence: number;
}

export class SimpleFaceDetectionService {
  // Simple image validation based on image dimensions and basic analysis
  async validateImage(imageUri: string): Promise<SimpleFaceDetectionResult> {
    try {
      return new Promise((resolve) => {
        Image.getSize(
          imageUri,
          (width, height) => {
            // Basic validation based on image dimensions
            const aspectRatio = width / height;

            // Add debugging information
            console.log('Image validation:', {
              width,
              height,
              aspectRatio: aspectRatio.toFixed(2),
              uri: imageUri,
            });

            // Face photos can have various aspect ratios (camera settings vary)
            const isReasonableSize = width >= 150 && height >= 150; // More lenient size requirement
            const isExtremeLandscape = aspectRatio > 3.0; // Only reject very wide landscape photos
            const isExtremePortrait = aspectRatio < 0.3; // Only reject very tall portrait photos

            let confidence = 0.5; // Base confidence
            let message = '';

            if (!isReasonableSize) {
              resolve({
                hasFace: false,
                message: `Image is too small (${width}x${height}). Please take a higher resolution photo.`,
                confidence: 0.1,
              });
              return;
            }

            if (isExtremeLandscape) {
              resolve({
                hasFace: false,
                message: `Image is too wide (ratio: ${aspectRatio.toFixed(
                  2
                )}). Please take a closer face photo.`,
                confidence: 0.3,
              });
              return;
            }

            if (isExtremePortrait) {
              resolve({
                hasFace: false,
                message: `Image is too tall (ratio: ${aspectRatio.toFixed(
                  2
                )}). Please take a face photo.`,
                confidence: 0.3,
              });
              return;
            }

            // If basic checks pass, assume it's likely a valid photo
            confidence = 0.8;
            message = `Image validation passed! (${width}x${height}, ratio: ${aspectRatio.toFixed(
              2
            )})`;

            resolve({
              hasFace: true,
              message,
              confidence,
            });
          },
          (error) => {
            console.error('Image validation error:', error);
            resolve({
              hasFace: false,
              message: 'Unable to validate image. Please try again.',
              confidence: 0.0,
            });
          }
        );
      });
    } catch (error) {
      console.error('Simple face detection error:', error);
      return {
        hasFace: false,
        message: 'Image validation failed. Please try again.',
        confidence: 0.0,
      };
    }
  }

  async isValidFaceImage(imageUri: string): Promise<boolean> {
    const result = await this.validateImage(imageUri);
    return result.hasFace && result.confidence > 0.5;
  }

  async validateFace(imageUri: string): Promise<boolean> {
    return this.isValidFaceImage(imageUri);
  }
}

export const simpleFaceDetectionService = new SimpleFaceDetectionService();
export default simpleFaceDetectionService;

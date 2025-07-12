import { Alert } from 'react-native';

interface NotificationOptions {
  title: string;
  message: string;
  onPress?: () => void;
  onDismiss?: () => void;
}

interface FaceDetectionAnalysis {
  hasFace: boolean;
  message: string;
  confidence: number;
  faceCount: number;
  skinConcerns?: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high';
    confidence: number;
    description: string;
  }>;
  skinType?: string;
  ageEstimate?: number;
  boundingBoxes?: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
  landmarks?: Array<{
    type: 'eye' | 'nose' | 'mouth' | 'cheek' | 'forehead';
    x: number;
    y: number;
  }>;
}

export class NotificationService {
  static showAlert(options: NotificationOptions) {
    const { title, message, onPress, onDismiss } = options;

    Alert.alert(
      title,
      message,
      [
        {
          text: 'OK',
          onPress: onPress || onDismiss,
        },
      ],
      { cancelable: true, onDismiss }
    );
  }

  static showConfirmation(
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
    confirmText: string = 'Yes',
    cancelText: string = 'No'
  ) {
    Alert.alert(
      title,
      message,
      [
        {
          text: cancelText,
          style: 'cancel',
          onPress: onCancel,
        },
        {
          text: confirmText,
          style: 'default',
          onPress: onConfirm,
        },
      ],
      { cancelable: true }
    );
  }

  static showFaceDetectionError(error: string, onRetry?: () => void) {
    Alert.alert(
      'Face Detection Error',
      error,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        ...(onRetry
          ? [
              {
                text: 'Retry',
                onPress: onRetry,
              },
            ]
          : []),
      ],
      { cancelable: true }
    );
  }

  static showAIFaceDetectionResults(
    analysis: FaceDetectionAnalysis,
    onRetry?: () => void,
    onContinue?: () => void
  ) {
    const { hasFace, message, confidence, faceCount } = analysis;

    if (hasFace) {
      // Success case
      const confidencePercentage = Math.round(confidence * 100);
      const title =
        faceCount > 1 ? '✨ Multiple Faces Detected!' : '✨ Face Detected!';
      const detailedMessage = `${message}\n\n${
        faceCount > 1
          ? `Found ${faceCount} faces in the image.`
          : 'Face detected successfully!'
      }\n\nConfidence: ${confidencePercentage}%`;

      Alert.alert(
        title,
        detailedMessage,
        [
          {
            text: 'Retake Photo',
            style: 'default',
            onPress: onRetry,
          },
          {
            text: 'Continue',
            style: 'default',
            onPress: onContinue,
          },
        ],
        { cancelable: false }
      );
    } else {
      // Error case
      const title = 'No Face Detected';
      const suggestions = this.getFaceDetectionSuggestions(confidence);
      const detailedMessage = `${message}\n\n${suggestions}`;

      Alert.alert(
        title,
        detailedMessage,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Try Again',
            style: 'default',
            onPress: onRetry,
          },
        ],
        { cancelable: true }
      );
    }
  }

  private static getFaceDetectionSuggestions(confidence: number): string {
    if (confidence < 0.2) {
      return '💡 Tips:\n• Ensure good lighting\n• Move closer to the camera\n• Make sure your face is clearly visible\n• Avoid shadows on your face';
    } else if (confidence < 0.4) {
      return '💡 Tips:\n• Try better lighting\n• Face the camera directly\n• Remove any obstructions\n• Use the front-facing camera';
    } else {
      return '💡 Tips:\n• Adjust your position slightly\n• Ensure your entire face is in frame\n• Try retaking the photo';
    }
  }

  static showFaceDetectionProgress(message: string = 'Analyzing face...') {
    // For progress notifications, you might want to use a toast library
    // For now, we'll use a simple alert that auto-dismisses
    setTimeout(() => {
      Alert.alert('🔍 AI Analysis', message, [{ text: 'OK' }]);
    }, 100);
  }

  static showAIFaceDetectionSuccess(analysis: FaceDetectionAnalysis) {
    const {
      confidence,
      faceCount,
      message,
      skinConcerns,
      skinType,
      ageEstimate,
    } = analysis;
    const confidencePercentage = Math.round(confidence * 100);

    const title = faceCount > 1 ? '🎉 Multiple Faces Detected!' : '🎉 Perfect!';
    let detailedMessage = `${message}\n\nReady for skin analysis!\n\nConfidence: ${confidencePercentage}%`;

    // Add Python API skin analysis details
    if (skinType && skinType !== 'unknown') {
      detailedMessage += `\n\nSkin Type: ${skinType}`;
    }

    if (ageEstimate && ageEstimate > 0) {
      detailedMessage += `\nEstimated Age: ${ageEstimate} years`;
    }

    if (skinConcerns && skinConcerns.length > 0) {
      detailedMessage += `\n\nSkin Concerns Detected:`;
      skinConcerns.forEach((concern, index) => {
        const severityEmoji =
          concern.severity === 'high'
            ? '🔴'
            : concern.severity === 'medium'
            ? '🟡'
            : '🟢';
        detailedMessage += `\n${severityEmoji} ${concern.type} (${concern.severity})`;
      });
    }

    Alert.alert(title, detailedMessage, [{ text: 'Continue' }]);
  }

  static showSuccess(message: string, onDismiss?: () => void) {
    Alert.alert(
      'Success',
      message,
      [
        {
          text: 'OK',
          onPress: onDismiss,
        },
      ],
      { cancelable: true }
    );
  }

  static showError(message: string, onDismiss?: () => void) {
    Alert.alert(
      'Error',
      message,
      [
        {
          text: 'OK',
          onPress: onDismiss,
        },
      ],
      { cancelable: true }
    );
  }

  static showWarning(message: string, onDismiss?: () => void) {
    Alert.alert(
      'Warning',
      message,
      [
        {
          text: 'OK',
          onPress: onDismiss,
        },
      ],
      { cancelable: true }
    );
  }

  static showAIAnalysisInProgress() {
    Alert.alert(
      '🤖 AI Analysis',
      'Advanced face detection in progress...\n\nThis may take a few moments.',
      [{ text: 'OK' }]
    );
  }

  static showDetailedFaceAnalysis(analysis: FaceDetectionAnalysis) {
    const { confidence, faceCount, boundingBoxes, landmarks } = analysis;

    let details = `Confidence: ${Math.round(confidence * 100)}%\n`;
    details += `Face Count: ${faceCount}\n`;

    if (boundingBoxes && boundingBoxes.length > 0) {
      details += `\nFace Locations:\n`;
      boundingBoxes.forEach((box, index) => {
        details += `Face ${index + 1}: (${box.x}, ${box.y}) ${box.width}x${
          box.height
        }\n`;
      });
    }

    if (landmarks && landmarks.length > 0) {
      details += `\nFacial Features: ${landmarks.length} landmarks detected\n`;
    }

    Alert.alert('📊 Detailed Analysis', details, [{ text: 'OK' }]);
  }
}

import { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
  Dimensions,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import Typography from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import Colors from '@/constants/Colors';
import { useUser } from '@/contexts/UserContext';
import {
  Camera as CameraIcon,
  CloudUpload as UploadCloud,
  ArrowRight,
  RotateCw,
  X,
} from 'lucide-react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { generateId } from '@/utils/helpers';
import { useSkinAnalysis } from '@/contexts/SkinAnalysisContext';
import { NotificationService } from '@/utils/notifications';
import { apiService } from '@/utils/api';
import { pythonAPI, API_CONFIG } from '@/config/api';
import localFaceDetection, {
  FaceDetectionStatus,
} from '@/services/LocalFaceDetection';

const { width, height } = Dimensions.get('window');

export default function ScanScreen() {
  const router = useRouter();
  const { user } = useUser();
  const { addAnalysis } = useSkinAnalysis();
  const [permission, requestPermission] = useCameraPermissions();

  const [cameraType, setCameraType] = useState<CameraType>('front');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isValidatingFace, setIsValidatingFace] = useState(false);

  // Real-time face detection states using local detection
  const [faceStatus, setFaceStatus] = useState<FaceDetectionStatus>({
    hasFace: false,
    lighting: 'poor',
    faceAngle: 'turned',
    distance: 'too_far',
    confidence: 0,
    readyForCapture: false,
  });
  const [autoCapturing, setAutoCapturing] = useState(false);
  const [countdownTimer, setCountdownTimer] = useState(0);
  const [detectionActive, setDetectionActive] = useState(false);

  const cameraRef = useRef<CameraView>(null);
  const faceDetectionInterval = useRef<ReturnType<typeof setInterval> | null>(
    null
  );
  const autoCapturePulse = useRef(new Animated.Value(1)).current;

  // Check camera permissions on mount
  useEffect(() => {
    if (permission && !permission.granted) {
      requestPermission();
    }
  }, [permission]);

  // Start real-time face detection when camera is active
  useEffect(() => {
    if (isCameraActive && !detectionActive) {
      // Add a small delay before starting detection to let camera stabilize
      const startTimer = setTimeout(() => {
        startRealTimeFaceDetection();
      }, 1000);
      return () => clearTimeout(startTimer);
    } else if (!isCameraActive) {
      stopRealTimeFaceDetection();
    }

    return () => {
      stopRealTimeFaceDetection();
    };
  }, [isCameraActive, detectionActive]);

  // Auto-capture when face conditions are optimal
  useEffect(() => {
    if (
      faceStatus.readyForCapture &&
      !autoCapturing &&
      !capturedImage &&
      isCameraActive
    ) {
      startAutoCapture();
    }
  }, [
    faceStatus.readyForCapture,
    autoCapturing,
    capturedImage,
    isCameraActive,
  ]);

  const startRealTimeFaceDetection = () => {
    if (faceDetectionInterval.current) {
      clearInterval(faceDetectionInterval.current);
    }

    setDetectionActive(true);

    // Use optimized local detection with caching - every 1 second
    faceDetectionInterval.current = setInterval(async () => {
      if (isCameraActive && !autoCapturing) {
        await detectFaceInRealTime();
      }
    }, 1000);
  };

  const stopRealTimeFaceDetection = () => {
    if (faceDetectionInterval.current) {
      clearInterval(faceDetectionInterval.current);
      faceDetectionInterval.current = null;
    }
    setDetectionActive(false);
    localFaceDetection.clearCache();
  };

  const detectFaceInRealTime = async () => {
    if (!cameraRef.current || !isCameraActive || autoCapturing) return;

    try {
      // Double-check camera is still active before taking photo
      if (!isCameraActive) return;

      // Take a quick photo for analysis (very low quality for speed)
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.1,
        base64: false,
        exif: false,
        skipProcessing: true,
      });

      // Check if camera is still active after async operation
      if (!isCameraActive) return;

      // Use local face detection service with caching
      const status = await localFaceDetection.getFaceStatus(photo.uri);
      setFaceStatus(status);
    } catch (error: any) {
      // Only log if it's not a camera unmounted error
      if (!error.message?.includes('unmounted')) {
        console.error('Real-time face detection error:', error);
      }
      // Don't reset status on error to avoid flickering
    }
  };

  const startAutoCapture = () => {
    setAutoCapturing(true);
    setCountdownTimer(3);

    // Stop face detection during auto-capture
    stopRealTimeFaceDetection();

    // Start countdown
    const countdown = setInterval(() => {
      setCountdownTimer((prev) => {
        if (prev <= 1) {
          clearInterval(countdown);
          handleAutoCapture();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(autoCapturePulse, {
          toValue: 1.2,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(autoCapturePulse, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const handleAutoCapture = async () => {
    if (!cameraRef.current) return;

    try {
      console.log('Auto-capturing...');
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        exif: false,
      });

      console.log('Photo auto-captured:', photo.uri);
      setCapturedImage(photo.uri);
      setIsCameraActive(false);
      setAutoCapturing(false);

      // Stop animations
      autoCapturePulse.stopAnimation();
      autoCapturePulse.setValue(1);

      // Automatically start analysis
      handleAnalyzeImage(photo.uri);
    } catch (error) {
      console.error('Auto-capture error:', error);
      setAutoCapturing(false);
      NotificationService.showError('Auto-capture failed. Please try again.');
    }
  };

  const handleStartCamera = async () => {
    if (!permission?.granted) {
      const permissionResult = await requestPermission();
      if (!permissionResult.granted) {
        NotificationService.showError(
          'Camera permission is required to take photos for skin analysis.'
        );
        return;
      }
    }
    setIsCameraActive(true);
  };

  const handleFlipCamera = () => {
    console.log('Flipping camera from', cameraType);
    setCameraType((current) => {
      const newType = current === 'front' ? 'back' : 'front';
      console.log('New camera type:', newType);
      return newType;
    });
  };

  const handleTakePicture = async () => {
    if (!cameraRef.current) {
      NotificationService.showError('Camera not ready. Please try again.');
      return;
    }

    try {
      console.log('Taking picture...');
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        exif: false,
      });

      console.log('Photo taken:', photo.uri);
      setCapturedImage(photo.uri);
      setIsCameraActive(false);
      // Automatically start analysis immediately after capture
      handleAnalyzeImage(photo.uri);
    } catch (error) {
      console.error('Error taking picture:', error);
      NotificationService.showError('Failed to take photo. Please try again.');
    }
  };

  const handleUploadImage = async () => {
    setIsUploading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setCapturedImage(result.assets[0].uri);
        // Automatically start analysis immediately after selecting image
        handleAnalyzeImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      NotificationService.showError(
        'Failed to upload image. Please try again.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  const validateFaceInImage = async (imageUri: string): Promise<boolean> => {
    setIsValidatingFace(true);

    // Show progress notification
    NotificationService.showFaceDetectionProgress('Analyzing face with AI...');

    try {
      // Use local face detection for validation (with higher quality)
      const result = await localFaceDetection.detectFaces(imageUri, {
        useCache: false,
        highQuality: true,
      });

      if (!result.hasFace || result.faceCount === 0) {
        Alert.alert(
          'No Face Detected',
          'Please ensure your face is clearly visible in the photo and try again.',
          [
            {
              text: 'Retake Photo',
              onPress: () => {
                setCapturedImage(null);
                setIsCameraActive(false);
              },
            },
          ]
        );
        return false;
      }

      // Show success message for successful face detection
      NotificationService.showSuccess(
        `Face detected successfully! Confidence: ${Math.round(
          result.confidence * 100
        )}%`
      );

      return true;
    } catch (error) {
      console.error('AI face validation failed:', error);
      NotificationService.showError(
        'Face validation failed. Please try again.'
      );
      return false;
    } finally {
      setIsValidatingFace(false);
    }
  };

  const createFormDataForImage = (imageUri: string): FormData => {
    const formData = new FormData();

    // Add image file
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'face-scan.jpg',
    } as any);

    // Add user data
    if (user?.id) {
      formData.append('user_id', user.id);
    }

    // Add metadata
    formData.append('scan_type', 'comprehensive_analysis');
    formData.append('timestamp', new Date().toISOString());

    return formData;
  };

  const saveScanToBackend = async (analysisData: any): Promise<void> => {
    try {
      const scanData = {
        user_id: user?.id,
        image_url: capturedImage,
        overall_health: analysisData.overall_health,
        confidence: analysisData.confidence,
        concerns: analysisData.concerns || [],
        recommendations: analysisData.recommendations || [],
        skin_features: analysisData.skinFeatures || {},
        facial_features: analysisData.facialFeatures || {},
        age_estimation: analysisData.ageEstimation || {},
        expression_analysis: analysisData.expressionAnalysis || {},
        scan_date: new Date().toISOString(),
      };

      await apiService.createSkinAnalysis(scanData);
      console.log('✅ Scan saved to backend successfully');
    } catch (error) {
      console.error('❌ Failed to save scan to backend:', error);
      // Don't throw error here - analysis data is still valid locally
    }
  };

  const handleAnalyzeImage = async (imageUri?: string) => {
    const targetImage = imageUri || capturedImage;
    if (!targetImage) {
      NotificationService.showError('No image to analyze');
      return;
    }

    // First validate face in image
    const hasFace = await validateFaceInImage(targetImage);
    if (!hasFace) {
      return;
    }

    setIsAnalyzing(true);
    console.log('🔍 Starting AI analysis...');

    try {
      // Create FormData for comprehensive analysis
      const formData = createFormDataForImage(targetImage);

      // Send to Python API for comprehensive analysis
      const analysisResponse = await pythonAPI.postFormData(
        '/analyze/comprehensive',
        formData
      );

      console.log('✅ Analysis completed:', analysisResponse);

      // Validate response data
      if (!analysisResponse.overall_health) {
        throw new Error('Incomplete analysis data received');
      }

      // Transform Python API response to match our app's format
      const transformedAnalysis = {
        id: generateId(),
        imageUrl: targetImage,
        date: new Date().toISOString(),
        overallHealth: analysisResponse.overall_health,
        confidence: analysisResponse.confidence,
        concerns: analysisResponse.skin_analysis?.concerns || [],
        recommendations: analysisResponse.skin_analysis?.recommendations || [],
        skinFeatures: {
          acne: analysisResponse.skin_analysis?.acne,
          wrinkles: analysisResponse.skin_analysis?.wrinkles,
          dark_circles: analysisResponse.skin_analysis?.dark_circles,
          pores: analysisResponse.skin_analysis?.pores,
          texture: analysisResponse.skin_analysis?.texture,
        },
        facialFeatures: {
          face_shape: analysisResponse.facial_features?.face_shape,
          eye_shape: analysisResponse.facial_features?.eye_shape,
          nose_shape: analysisResponse.facial_features?.nose_shape,
          lip_shape: analysisResponse.facial_features?.lip_shape,
        },
        ageEstimation: {
          estimated_age: analysisResponse.age_estimation?.estimated_age,
          age_range: analysisResponse.age_estimation?.age_range,
        },
        expressionAnalysis: {
          primary_expression:
            analysisResponse.expression_analysis?.primary_expression,
          confidence: analysisResponse.expression_analysis?.confidence,
        },
      };

      // Save to local context
      addAnalysis(transformedAnalysis);

      // Save to backend (don't wait for completion)
      saveScanToBackend(transformedAnalysis);

      // Show success notification
      NotificationService.showSuccess(
        'Analysis completed successfully! Check your results.'
      );

      // Navigate to results
      router.push('/scan-results');
    } catch (error) {
      console.error('❌ Analysis failed:', error);
      NotificationService.showError(
        'Analysis failed. Please try again or check your connection.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRetakePhoto = () => {
    setCapturedImage(null);
    setIsCameraActive(false);
    setAutoCapturing(false);
    setCountdownTimer(0);
    setDetectionActive(false);
    localFaceDetection.clearCache();
  };

  // Status indicator colors - Green when face detected, otherwise red/yellow
  const getStatusColor = (type: string) => {
    if (!faceStatus.hasFace) {
      return Colors.error.default;
    }

    switch (type) {
      case 'lighting':
        return faceStatus.lighting === 'good'
          ? Colors.success.default
          : faceStatus.lighting === 'ok'
          ? Colors.warning.default
          : Colors.error.default;
      case 'angle':
        return faceStatus.faceAngle === 'straight'
          ? Colors.success.default
          : Colors.error.default;
      case 'distance':
        return faceStatus.distance === 'good'
          ? Colors.success.default
          : Colors.error.default;
      default:
        return Colors.success.default;
    }
  };

  const getStatusText = (type: string) => {
    if (!faceStatus.hasFace) {
      return 'No Face';
    }

    switch (type) {
      case 'lighting':
        return faceStatus.lighting === 'good'
          ? 'Good'
          : faceStatus.lighting === 'ok'
          ? 'OK'
          : 'Poor';
      case 'angle':
        return faceStatus.faceAngle === 'straight'
          ? 'Good'
          : faceStatus.faceAngle === 'tilted'
          ? 'Adjust'
          : 'Turn Straight';
      case 'distance':
        return faceStatus.distance === 'good'
          ? 'Perfect'
          : faceStatus.distance === 'too_close'
          ? 'Move Back'
          : 'Come Closer';
      default:
        return 'Analyzing...';
    }
  };

  // Camera view with real-time face detection
  if (isCameraActive) {
    return (
      <View style={styles.container}>
        <CameraView style={styles.camera} facing={cameraType} ref={cameraRef} />

        {/* Overlay with absolute positioning */}
        <View style={styles.absoluteOverlay}>
          {/* Status Indicators */}
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusIndicator,
                { backgroundColor: getStatusColor('lighting') },
              ]}
            >
              <Typography variant="bodySmall" style={styles.statusText}>
                Lighting
              </Typography>
              <Typography variant="caption" style={styles.statusValue}>
                {getStatusText('lighting')}
              </Typography>
            </View>

            <View
              style={[
                styles.statusIndicator,
                { backgroundColor: getStatusColor('angle') },
              ]}
            >
              <Typography variant="bodySmall" style={styles.statusText}>
                Look Straight
              </Typography>
              <Typography variant="caption" style={styles.statusValue}>
                {getStatusText('angle')}
              </Typography>
            </View>

            <View
              style={[
                styles.statusIndicator,
                { backgroundColor: getStatusColor('distance') },
              ]}
            >
              <Typography variant="bodySmall" style={styles.statusText}>
                Face Position
              </Typography>
              <Typography variant="caption" style={styles.statusValue}>
                {getStatusText('distance')}
              </Typography>
            </View>
          </View>

          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setIsCameraActive(false)}
          >
            <X size={24} color={Colors.neutral.white} />
          </TouchableOpacity>

          {/* Face Detection Guide */}
          <View style={styles.faceScanGuide}>
            <Animated.View
              style={[
                styles.faceGuideCircle,
                {
                  transform: [{ scale: autoCapturing ? autoCapturePulse : 1 }],
                  borderColor: faceStatus.hasFace
                    ? Colors.success.default
                    : Colors.neutral.white,
                  borderWidth: faceStatus.hasFace ? 3 : 2,
                },
              ]}
            />

            {/* Face Detection Status */}
            <View style={styles.faceStatusContainer}>
              <View
                style={[
                  styles.faceStatusDot,
                  {
                    backgroundColor: faceStatus.hasFace
                      ? Colors.success.default
                      : Colors.error.default,
                  },
                ]}
              />
              <Typography variant="bodySmall" style={styles.faceStatusText}>
                {faceStatus.hasFace ? 'Face Detected' : 'No Face Detected'}
              </Typography>
              {faceStatus.readyForCapture && (
                <Typography
                  variant="caption"
                  style={[
                    styles.faceStatusText,
                    { color: Colors.success.default },
                  ]}
                >
                  • Ready for capture
                </Typography>
              )}
            </View>

            {/* Auto-capture countdown */}
            {autoCapturing && (
              <View style={styles.countdownContainer}>
                <Typography variant="h2" style={styles.countdownText}>
                  {countdownTimer}
                </Typography>
                <Typography variant="bodySmall" style={styles.countdownLabel}>
                  Auto-capturing...
                </Typography>
              </View>
            )}

            {/* Guidance Text */}
            <Typography variant="bodySmall" style={styles.guideText}>
              {autoCapturing
                ? 'Hold still! Auto-capturing in progress...'
                : faceStatus.readyForCapture
                ? 'Perfect! Get ready for auto-capture...'
                : 'Position your face in the circle for automatic capture'}
            </Typography>
          </View>

          {/* Camera Controls */}
          <View style={styles.cameraControls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={handleFlipCamera}
            >
              <RotateCw size={20} color={Colors.neutral.white} />
              <Typography variant="bodySmall" style={styles.controlText}>
                Flip
              </Typography>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.captureButton}
              onPress={handleTakePicture}
              disabled={autoCapturing}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => setIsCameraActive(false)}
            >
              <X size={20} color={Colors.neutral.white} />
              <Typography variant="bodySmall" style={styles.controlText}>
                Cancel
              </Typography>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.primary.light, Colors.background.primary]}
        style={styles.gradientBackground}
      />

      <View style={styles.content}>
        <View style={styles.header}>
          <Typography variant="h1" align="center">
            AI Face Analysis
          </Typography>
          <Typography variant="body" align="center" style={styles.subtitle}>
            Advanced local face detection with ML Kit and intelligent
            auto-capture
          </Typography>
        </View>

        <View style={styles.imageSection}>
          {capturedImage ? (
            <View style={styles.capturedImageContainer}>
              <Image
                source={{ uri: capturedImage }}
                style={styles.capturedImage}
              />
              <TouchableOpacity
                style={styles.retakeButton}
                onPress={handleRetakePhoto}
              >
                <Typography variant="bodySmall" color={Colors.primary.default}>
                  Retake
                </Typography>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.cameraOptions}>
              <TouchableOpacity
                style={styles.cameraOption}
                onPress={handleStartCamera}
              >
                <View style={styles.cameraIconContainer}>
                  <CameraIcon size={32} color={Colors.primary.default} />
                </View>
                <Typography variant="body" style={styles.cameraOptionText}>
                  Smart Auto-Capture
                </Typography>
                <Typography variant="caption" style={styles.cameraOptionHint}>
                  ML Kit powered face detection with automatic capture
                </Typography>
              </TouchableOpacity>

              <Typography variant="body" style={styles.orText}>
                OR
              </Typography>

              <TouchableOpacity
                style={styles.cameraOption}
                onPress={handleUploadImage}
                disabled={isUploading}
              >
                <View style={styles.cameraIconContainer}>
                  <UploadCloud size={32} color={Colors.primary.default} />
                </View>
                <Typography variant="body" style={styles.cameraOptionText}>
                  Upload a Photo
                </Typography>
                <Typography variant="caption" style={styles.cameraOptionHint}>
                  Choose a clear, front-facing photo
                </Typography>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Show analysis status */}
        {(isAnalyzing || isValidatingFace) && (
          <View style={styles.loadingSection}>
            <Typography
              variant="body"
              align="center"
              style={styles.loadingText}
            >
              {isValidatingFace ? 'Detecting face...' : 'Analyzing skin...'}
            </Typography>
          </View>
        )}

        <View style={styles.infoSection}>
          <Typography
            variant="bodySmall"
            color={Colors.text.tertiary}
            align="center"
          >
            Powered by ML Kit for instant on-device face detection with
            intelligent auto-capture and real-time feedback.
          </Typography>
          <Typography
            variant="caption"
            color={Colors.text.tertiary}
            align="center"
            style={styles.privacyNote}
          >
            All face detection runs locally on your device. Photos are only sent
            for analysis after capture. Complete privacy protection.
          </Typography>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
  },
  header: {
    marginBottom: 32,
  },
  subtitle: {
    marginTop: 8,
    opacity: 0.8,
  },
  imageSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  cameraOptions: {
    width: '100%',
    alignItems: 'center',
  },
  cameraOption: {
    width: '100%',
    backgroundColor: Colors.background.primary,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: Colors.neutral.darkest,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 16,
  },
  cameraIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  cameraOptionText: {
    marginBottom: 8,
    fontWeight: '600',
  },
  cameraOptionHint: {
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
  orText: {
    marginVertical: 16,
    fontWeight: '600',
    color: Colors.text.tertiary,
  },
  capturedImageContainer: {
    width: 280,
    height: 280,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 16,
  },
  capturedImage: {
    width: '100%',
    height: '100%',
  },
  retakeButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: Colors.neutral.white,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowColor: Colors.neutral.darkest,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  camera: {
    flex: 1,
  },
  absoluteOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
    padding: 24,
  },
  cameraHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 40,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
  },
  faceScanGuide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  faceGuideCircle: {
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 2,
    borderColor: Colors.neutral.white,
    backgroundColor: 'transparent',
  },
  guideText: {
    color: Colors.neutral.white,
    marginTop: 16,
    textAlign: 'center',
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    paddingBottom: 40,
  },
  controlButton: {
    alignItems: 'center',
    padding: 12,
    minWidth: 60,
  },
  controlText: {
    color: Colors.neutral.white,
    marginTop: 4,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: Colors.neutral.white,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.neutral.white,
  },
  loadingSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  loadingText: {
    color: Colors.primary.default,
    fontWeight: '600',
  },
  infoSection: {
    paddingHorizontal: 24,
  },
  privacyNote: {
    marginTop: 8,
    fontSize: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    marginBottom: 20,
  },
  statusIndicator: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  statusText: {
    color: Colors.neutral.white,
    marginBottom: 4,
  },
  statusValue: {
    color: Colors.neutral.white,
    fontWeight: 'bold',
  },
  faceStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  faceStatusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  faceStatusText: {
    color: Colors.neutral.white,
  },
  countdownContainer: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 50,
  },
  countdownText: {
    color: Colors.neutral.white,
    fontWeight: 'bold',
  },
  countdownLabel: {
    color: Colors.neutral.white,
    marginTop: 5,
  },
});

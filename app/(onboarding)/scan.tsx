import { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Dimensions,
  Text,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import Typography from '@/components/ui/Typography';
import Colors from '@/constants/Colors';
import { useUser } from '@/contexts/UserContext';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useSkinAnalysis } from '@/contexts/SkinAnalysisContext';
import { NotificationService } from '@/utils/notifications';
import tensorFlowFaceDetectionService, {
  TensorFlowFaceDetectionResult,
} from '@/services/TensorFlowFaceDetection';

const { width, height } = Dimensions.get('window');

export default function ScanScreen() {
  const router = useRouter();
  const { user } = useUser();
  const { addAnalysis } = useSkinAnalysis();
  const [permission, requestPermission] = useCameraPermissions();

  // Camera states
  const [cameraType, setCameraType] = useState<CameraType>('front');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isMounted, setIsMounted] = useState(true);

  // Face detection states
  const [faceDetection, setFaceDetection] =
    useState<TensorFlowFaceDetectionResult>({
      hasFace: false,
      faceCount: 0,
      confidence: 0,
      message: 'Position your face in the camera',
      readyForCapture: false,
    });
  const [isDetecting, setIsDetecting] = useState(false);

  const cameraRef = useRef<CameraView>(null);
  const detectionInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Camera dimensions to match screenshot
  const cameraHeight = height * 0.6; // 60% of screen height
  const cameraWidth = width - 60; // Full width minus padding

  // Start camera automatically
  useEffect(() => {
    handleStartCamera();

    return () => {
      setIsMounted(false);
      stopLiveFaceDetection();
    };
  }, []);

  // Initialize and start live face detection when camera starts
  useEffect(() => {
    if (isCameraActive && isMounted) {
      initializeFaceDetection();
      startLiveFaceDetection();
    } else {
      stopLiveFaceDetection();
    }

    return () => stopLiveFaceDetection();
  }, [isCameraActive, isMounted]);

  const initializeFaceDetection = async () => {
    try {
      console.log('🔧 Initializing TensorFlow face detection...');
      await tensorFlowFaceDetectionService.initialize();
      console.log('✅ TensorFlow face detection ready');
    } catch (error) {
      console.error('❌ Failed to initialize face detection:', error);
      NotificationService.showError('Face detection initialization failed');
    }
  };

  const startLiveFaceDetection = () => {
    // Detect faces every 3 seconds to prevent camera overload
    detectionInterval.current = setInterval(async () => {
      if (
        isCameraActive &&
        !isDetecting &&
        !isAnalyzing &&
        isMounted &&
        cameraRef.current
      ) {
        await performLiveFaceDetection();
      }
    }, 3000);
  };

  const stopLiveFaceDetection = () => {
    if (detectionInterval.current) {
      clearInterval(detectionInterval.current);
      detectionInterval.current = null;
    }
    tensorFlowFaceDetectionService.clearCache();
  };

  const performLiveFaceDetection = async () => {
    if (isDetecting || !isMounted || !cameraRef.current) return;

    setIsDetecting(true);
    try {
      // Add a small delay to prevent camera overload
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Take a low-quality photo for live detection
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.1,
        base64: false,
        exif: false,
        skipProcessing: true,
      });

      if (isMounted) {
        // Use throttled detection for performance
        const result =
          await tensorFlowFaceDetectionService.detectFacesThrottled(photo.uri);
        if (isMounted) {
          setFaceDetection(result);
        }
      }
    } catch (error) {
      if (isMounted) {
        // Only log errors that aren't related to camera being busy
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        if (
          !errorMessage.includes('Image could not be captured') &&
          !errorMessage.includes('Camera unmounted')
        ) {
          console.error('Live face detection error:', error);
        }
      }
      // Don't show error to user for live detection failures
    } finally {
      if (isMounted) {
        setIsDetecting(false);
      }
    }
  };

  const handleAnalyzeSkin = async () => {
    if (!faceDetection.hasFace) {
      NotificationService.showError(
        'No face detected. Please position your face in the camera.'
      );
      return;
    }

    setIsAnalyzing(true);

    try {
      if (!cameraRef.current || !isMounted) {
        throw new Error('Camera not available');
      }

      // Take high-quality photo for analysis
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        exif: false,
      });

      if (!isMounted) return;

      // Final validation
      const validation = await tensorFlowFaceDetectionService.detectFaces(
        photo.uri
      );

      if (!validation.hasFace) {
        NotificationService.showError(
          'Face not detected in captured image. Please try again.'
        );
        return;
      }

      NotificationService.showSuccess('Face detected! Analyzing skin...');

      // Navigate to results
      setTimeout(() => {
        if (isMounted) {
          router.push('/scan-results');
        }
      }, 1000);
    } catch (error) {
      console.error('Analysis error:', error);
      if (isMounted) {
        NotificationService.showError('Analysis failed. Please try again.');
      }
    } finally {
      if (isMounted) {
        setIsAnalyzing(false);
      }
    }
  };

  const handleStartCamera = async () => {
    if (!permission?.granted) {
      const permissionResult = await requestPermission();
      if (!permissionResult.granted) {
        NotificationService.showError('Camera permission is required.');
        return;
      }
    }
    setIsCameraActive(true);
  };

  const handleStopScanning = () => {
    setIsMounted(false);
    setIsCameraActive(false);
    stopLiveFaceDetection();
    // Navigate back to previous screen or home
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  // Calculate face bounding box for overlay (relative to camera view)
  const getFaceBoundingBox = () => {
    if (
      !faceDetection.hasFace ||
      !faceDetection.faceCenter ||
      !faceDetection.faceSize
    ) {
      return null;
    }

    const { faceCenter, faceSize } = faceDetection;

    // Convert face coordinates to camera view coordinates
    const scaleX = cameraWidth / 480; // Approximate camera resolution
    const scaleY = cameraHeight / 640;

    const boxWidth = Math.max(100, faceSize.width * scaleX);
    const boxHeight = Math.max(100, faceSize.height * scaleY);
    const boxLeft = Math.max(10, faceCenter.x * scaleX - boxWidth / 2);
    const boxTop = Math.max(10, faceCenter.y * scaleY - boxHeight / 2);

    return {
      left: Math.min(cameraWidth - boxWidth - 10, boxLeft),
      top: Math.min(cameraHeight - boxHeight - 10, boxTop),
      width: boxWidth,
      height: boxHeight,
    };
  };

  const faceBounds = getFaceBoundingBox();

  if (!isCameraActive) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Typography variant="h2" align="center" style={styles.loadingText}>
          Starting Camera...
        </Typography>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Camera Container - Rounded Rectangle */}
      <View style={styles.cameraContainer}>
        <CameraView style={styles.camera} facing={cameraType} ref={cameraRef} />

        {/* Face Detection Overlay */}
        {faceBounds && (
          <View
            style={[
              styles.faceBox,
              {
                left: faceBounds.left,
                top: faceBounds.top,
                width: faceBounds.width,
                height: faceBounds.height,
                borderColor:
                  faceDetection.confidence > 0.7 ? '#00FF00' : '#FFD700',
              },
            ]}
          />
        )}

        {/* Face Detection Status */}
        {!faceDetection.hasFace && (
          <View style={styles.noFaceOverlay}>
            <Text style={styles.noFaceText}>
              Position your face in the camera view
            </Text>
          </View>
        )}
      </View>

      {/* Control Buttons */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[styles.stopButton, isAnalyzing && styles.disabledButton]}
          onPress={handleStopScanning}
          disabled={isAnalyzing}
        >
          <View style={styles.stopIcon} />
          <Text style={styles.buttonText}>Stop</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.analyzeButton,
            (!faceDetection.hasFace || isAnalyzing) && styles.disabledButton,
          ]}
          onPress={handleAnalyzeSkin}
          disabled={!faceDetection.hasFace || isAnalyzing}
        >
          <Text style={styles.analyzeButtonText}>
            {isAnalyzing ? 'Analyzing...' : '✓ Analyze Skin'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Status Bar */}
      <View style={styles.statusBar}>
        <View style={styles.statusItem}>
          <View style={styles.statusIcon}>
            <Text style={styles.statusIconText}>ℹ️</Text>
          </View>
          <Text style={styles.statusText}>AI-powered</Text>
        </View>

        <View style={styles.statusItem}>
          <View style={styles.statusIcon}>
            <Text style={styles.statusIconText}>☀️</Text>
          </View>
          <Text style={styles.statusText}>Real-time</Text>
        </View>

        <View style={styles.statusItem}>
          <View style={styles.statusIcon}>
            <Text style={styles.statusIconText}>🔒</Text>
          </View>
          <Text style={styles.statusText}>Private</Text>
        </View>
      </View>

      {/* Permission Message */}
      <View style={styles.permissionMessage}>
        <Text style={styles.permissionText}>
          Please allow camera access when prompted
        </Text>
      </View>

      {/* Test Native Face Detection Button */}
      <View style={styles.testButtonContainer}>
        <TouchableOpacity
          style={styles.testButton}
          onPress={() => router.push('/(onboarding)/live-face-detection')}
        >
          <Text style={styles.testButtonText}>
            🔬 Test Native Face Detection
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 30,
    paddingTop: 40,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.primary.default,
  },
  cameraContainer: {
    height: height * 0.6,
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#000',
    position: 'relative',
    marginBottom: 30,
  },
  camera: {
    flex: 1,
  },
  faceBox: {
    position: 'absolute',
    borderWidth: 3,
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
    borderRadius: 8,
  },
  noFaceOverlay: {
    position: 'absolute',
    top: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  noFaceText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    overflow: 'hidden',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  stopButton: {
    backgroundColor: '#FF4444',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 100,
    justifyContent: 'center',
  },
  stopIcon: {
    width: 12,
    height: 12,
    backgroundColor: '#fff',
    borderRadius: 2,
    marginRight: 8,
  },
  analyzeButton: {
    backgroundColor: '#00AA44',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    minWidth: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  analyzeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusItem: {
    alignItems: 'center',
  },
  statusIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statusIconText: {
    fontSize: 16,
  },
  statusText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '500',
  },
  permissionMessage: {
    alignItems: 'center',
  },
  permissionText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.8,
  },
  testButtonContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  testButton: {
    backgroundColor: '#4444FF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    minWidth: 250,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

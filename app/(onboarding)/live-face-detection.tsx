import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import Svg, { Rect } from 'react-native-svg';
import Typography from '@/components/ui/Typography';
import Colors from '@/constants/Colors';
import { X } from '@/utils/icons';
import tensorFlowFaceDetectionService from '@/services/TensorFlowFaceDetection';

const { width, height } = Dimensions.get('window');

interface Face {
  bounds: {
    origin: { x: number; y: number };
    size: { width: number; height: number };
  };
  confidence: number;
}

function LiveFaceDetectionScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [faces, setFaces] = useState<Face[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isMounted, setIsMounted] = useState(true);
  const cameraRef = useRef<CameraView>(null);
  const detectionInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    (async () => {
      const { granted } = await requestPermission();
      if (!granted) {
        alert('Camera permission is required');
      }
    })();

    return () => {
      setIsMounted(false);
      if (detectionInterval.current) {
        clearInterval(detectionInterval.current);
      }
    };
  }, []);

  useEffect(() => {
    if (permission?.granted && isMounted) {
      startFaceDetection();
    }
    return () => {
      if (detectionInterval.current) {
        clearInterval(detectionInterval.current);
      }
    };
  }, [permission?.granted]);

  const startFaceDetection = () => {
    // Initialize TensorFlow
    tensorFlowFaceDetectionService.initialize().then(() => {
      // Start detection loop - reduced frequency to prevent camera overload
      detectionInterval.current = setInterval(async () => {
        if (!isDetecting && isMounted && cameraRef.current) {
          await detectFace();
        }
      }, 3000); // Check every 3 seconds instead of 1
    });
  };

  const detectFace = async () => {
    if (isDetecting || !isMounted || !cameraRef.current) return;

    setIsDetecting(true);
    try {
      // Add a small delay to prevent camera overload
      await new Promise((resolve) => setTimeout(resolve, 100));

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.1,
        base64: false,
        skipProcessing: true,
        exif: false,
      });

      if (!isMounted) return;

      const result = await tensorFlowFaceDetectionService.detectFacesThrottled(
        photo.uri
      );

      if (isMounted) {
        // Convert TensorFlow faces to our Face interface
        const convertedFaces: Face[] = (result.faces || []).map((face) => ({
          bounds: {
            origin: { x: face.box.xMin, y: face.box.yMin },
            size: {
              width: face.box.width,
              height: face.box.height,
            },
          },
          confidence: result.confidence,
        }));
        setFaces(convertedFaces);
      }
    } catch (error) {
      // Only log errors that aren't related to camera being busy
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (
        !errorMessage.includes('Image could not be captured') &&
        !errorMessage.includes('Camera unmounted')
      ) {
        console.error('Live face detection error:', error);
      }
    } finally {
      if (isMounted) {
        setIsDetecting(false);
      }
    }
  };

  const handleAnalyzeSkin = async () => {
    if (!isMounted || faces.length === 0) {
      alert('No face detected. Please position your face in the camera.');
      return;
    }

    setIsAnalyzing(true);

    try {
      const photo = await cameraRef.current?.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      if (!photo || !isMounted) return;

      const validation = await tensorFlowFaceDetectionService.detectFaces(
        photo.uri
      );

      if (!validation.hasFace) {
        alert('No face detected in the captured image. Please try again.');
        return;
      }

      if (isMounted) {
        router.push('/scan-results');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      if (isMounted) {
        alert('Failed to analyze image. Please try again.');
      }
    } finally {
      if (isMounted) {
        setIsAnalyzing(false);
      }
    }
  };

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(onboarding)/scan');
    }
  };

  if (!permission?.granted) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Typography variant="h2" align="center">
          Camera permission is required
        </Typography>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="front" />

      {/* Close Button */}
      <TouchableOpacity style={styles.closeButton} onPress={handleGoBack}>
        <X size={24} color={Colors.neutral.white} />
      </TouchableOpacity>

      {/* Face Detection Info Overlay */}
      <View style={styles.infoOverlay}>
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Live Face Detection</Text>
          <Text style={styles.infoText}>
            {faces.length > 0
              ? `✅ Detected ${faces.length} face(s)`
              : '❌ No face detected'}
          </Text>
          {faces.length > 0 && (
            <Text style={styles.detailText}>
              Confidence: {Math.round(faces[0].confidence * 100)}%
            </Text>
          )}
        </View>
      </View>

      {/* Draw Rectangles around faces */}
      <Svg height="100%" width="100%" style={styles.svgOverlay}>
        {faces.map((face, index) => {
          const { origin, size } = face.bounds;
          return (
            <Rect
              key={index}
              x={origin.x}
              y={origin.y}
              width={size.width}
              height={size.height}
              stroke="#00FF00"
              strokeWidth={3}
              fill="transparent"
              strokeDasharray="10,5"
            />
          );
        })}
      </Svg>

      {/* Control Buttons */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[styles.stopButton, isAnalyzing && styles.disabledButton]}
          onPress={handleGoBack}
          disabled={isAnalyzing}
        >
          <View style={styles.stopIcon} />
          <Text style={styles.buttonText}>Stop</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.analyzeButton,
            (faces.length === 0 || isAnalyzing) && styles.disabledButton,
          ]}
          onPress={handleAnalyzeSkin}
          disabled={faces.length === 0 || isAnalyzing}
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
            <Text style={styles.statusIconText}>🔴</Text>
          </View>
          <Text style={styles.statusText}>Live Detection</Text>
        </View>

        <View style={styles.statusItem}>
          <View style={styles.statusIcon}>
            <Text style={styles.statusIconText}>⚡</Text>
          </View>
          <Text style={styles.statusText}>TensorFlow.js</Text>
        </View>

        <View style={styles.statusItem}>
          <View style={styles.statusIcon}>
            <Text style={styles.statusIconText}>🔒</Text>
          </View>
          <Text style={styles.statusText}>Private</Text>
        </View>
      </View>

      {/* Guidance Message */}
      {faces.length === 0 && (
        <View style={styles.guidanceOverlay}>
          <Text style={styles.guidanceText}>
            Position your face in the camera view for real-time detection
          </Text>
        </View>
      )}
    </View>
  );
}

export default LiveFaceDetectionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: Colors.error.default,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: Colors.primary.default,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  backButtonText: {
    color: Colors.neutral.white,
    fontSize: 16,
    fontWeight: '600',
  },
  camera: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  infoOverlay: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 80,
    zIndex: 5,
  },
  infoContainer: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 10,
    padding: 15,
  },
  infoTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  infoText: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 3,
  },
  detailText: {
    color: '#00FF00',
    fontSize: 12,
  },
  svgOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 3,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    zIndex: 10,
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
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    zIndex: 10,
  },
  statusItem: {
    alignItems: 'center',
  },
  statusIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statusIconText: {
    fontSize: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  guidanceOverlay: {
    position: 'absolute',
    bottom: 200,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 10,
  },
  guidanceText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    overflow: 'hidden',
  },
});

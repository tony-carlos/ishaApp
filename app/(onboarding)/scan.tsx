import { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  Platform,
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
} from 'lucide-react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { mockApiCall, generateId } from '@/utils/helpers';
import { useSkinAnalysis } from '@/contexts/SkinAnalysisContext';

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

  const cameraRef = useRef(null);

  const handleStartCamera = async () => {
    if (!permission?.granted) {
      const permissionResult = await requestPermission();
      if (!permissionResult.granted) {
        return;
      }
    }
    setIsCameraActive(true);
  };

  const handleFlipCamera = () => {
    setCameraType((current) => (current === 'front' ? 'back' : 'front'));
  };

  const handleTakePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        setCapturedImage(photo.uri);
        setIsCameraActive(false);
      } catch (error) {
        console.error('Error taking picture:', error);
      }
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

      if (!result.canceled) {
        setCapturedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAnalyzeImage = async () => {
    if (!capturedImage) return;

    setIsAnalyzing(true);

    try {
      // Simulate API call to analyze image
      await mockApiCall(3000);

      // Create a mock analysis result
      const mockAnalysis = {
        id: generateId(),
        userId: user?.id || '',
        date: new Date().toISOString(),
        imageUrl: capturedImage,
        concerns: [
          {
            id: 'dryness',
            name: 'Dryness',
            severity: 'medium',
            description:
              'Your skin shows signs of dehydration in the cheek area.',
          },
          {
            id: 'texture',
            name: 'Uneven Texture',
            severity: 'low',
            description:
              'Mild texture irregularities detected in the forehead region.',
          },
        ],
        recommendations: [
          {
            id: 'rec1',
            type: 'product',
            description:
              'Add a hydrating serum with hyaluronic acid to your routine',
            priority: 'high',
          },
          {
            id: 'rec2',
            type: 'habit',
            description: 'Increase water intake throughout the day',
            priority: 'medium',
          },
          {
            id: 'rec3',
            type: 'product',
            description: 'Use a gentle chemical exfoliant twice weekly',
            priority: 'medium',
          },
        ],
        overallHealth: 72, // on a scale of 0-100
      };

      // Save analysis to context
      await addAnalysis(mockAnalysis);

      // Navigate to the scan results screen instead of tabs
      router.push('/(tabs)/scan-results');
    } catch (error) {
      console.error('Error analyzing image:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isCameraActive) {
    return (
      <View style={styles.container}>
        <CameraView style={styles.camera} type={cameraType} ref={cameraRef}>
          <View style={styles.cameraOverlay}>
            <View style={styles.faceScanGuide}>
              <View style={styles.faceGuideCircle} />
            </View>

            <View style={styles.cameraControls}>
              <TouchableOpacity
                style={styles.flipButton}
                onPress={handleFlipCamera}
              >
                <Typography variant="bodySmall" color={Colors.neutral.white}>
                  Flip
                </Typography>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.captureButton}
                onPress={handleTakePicture}
              >
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsCameraActive(false)}
              >
                <Typography variant="bodySmall" color={Colors.neutral.white}>
                  Cancel
                </Typography>
              </TouchableOpacity>
            </View>
          </View>
        </CameraView>
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
            Face Scan
          </Typography>
          <Typography variant="body" align="center" style={styles.subtitle}>
            Let our AI analyze your skin and provide personalized
            recommendations
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
                onPress={() => setCapturedImage(null)}
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
                  Take a Selfie
                </Typography>
                <Typography variant="caption" style={styles.cameraOptionHint}>
                  Use in good lighting for best results
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

        {capturedImage && (
          <Button
            label={isAnalyzing ? 'Analyzing...' : 'Analyze My Skin'}
            onPress={handleAnalyzeImage}
            variant="primary"
            size="lg"
            fullWidth
            loading={isAnalyzing}
            disabled={isAnalyzing}
            icon={<ArrowRight size={20} color={Colors.neutral.white} />}
            iconPosition="right"
            style={styles.button}
          />
        )}

        <View style={styles.infoSection}>
          <Typography
            variant="bodySmall"
            color={Colors.text.tertiary}
            align="center"
          >
            Your skin analysis helps us create personalized recommendations just
            for you.
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
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'space-between',
    padding: 24,
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
    borderStyle: 'dashed',
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
  },
  flipButton: {
    padding: 12,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButtonInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.neutral.white,
  },
  cancelButton: {
    padding: 12,
  },
  button: {
    marginBottom: 24,
  },
  infoSection: {
    paddingHorizontal: 24,
  },
});

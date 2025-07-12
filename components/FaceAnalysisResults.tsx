import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Dimensions,
  Alert,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import {
  FaceAnalysisResult,
  SkinParameter,
} from '../services/AdvancedFaceAnalysis';
import { Colors } from '../constants/Colors';

interface FaceAnalysisResultsProps {
  result: FaceAnalysisResult;
  visible: boolean;
  onClose: () => void;
}

const { width, height } = Dimensions.get('window');

export const FaceAnalysisResults: React.FC<FaceAnalysisResultsProps> = ({
  result,
  visible,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'facial' | 'skin' | 'images'
  >('overview');
  const [selectedImageType, setSelectedImageType] = useState<string | null>(
    null
  );
  const [showImageModal, setShowImageModal] = useState(false);

  const overallScore = useMemo(() => {
    return Math.round(result.skinAnalysis.overall.overallHealth);
  }, [result]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return Colors.success;
    if (score >= 60) return Colors.warning;
    return Colors.error;
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return ['#4CAF50', '#8BC34A'];
    if (score >= 60) return ['#FF9800', '#FFC107'];
    return ['#F44336', '#FF5722'];
  };

  const renderOverviewTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Overall Score Card */}
      <View style={styles.scoreCard}>
        <LinearGradient
          colors={getScoreGradient(overallScore)}
          style={styles.scoreGradient}
        >
          <Text style={styles.scoreTitle}>Overall Skin Health</Text>
          <Text style={styles.scoreValue}>{overallScore}/100</Text>
          <Text style={styles.scoreSubtitle}>
            {overallScore >= 80
              ? 'Excellent'
              : overallScore >= 60
              ? 'Good'
              : 'Needs Attention'}
          </Text>
        </LinearGradient>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Face Shape</Text>
          <Text style={styles.statValue}>
            {result.faceAttributes.faceShape.type}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Skin Type</Text>
          <Text style={styles.statValue}>
            {result.skinAnalysis.overall.skinType}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Skin Tone</Text>
          <Text style={styles.statValue}>
            {result.skinAnalysis.overall.skinTone.category}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Confidence</Text>
          <Text style={styles.statValue}>{result.confidence}%</Text>
        </View>
      </View>

      {/* Top Concerns */}
      <View style={styles.concernsSection}>
        <Text style={styles.sectionTitle}>Top Concerns</Text>
        {renderTopConcerns()}
      </View>

      {/* Recommendations */}
      <View style={styles.recommendationsSection}>
        <Text style={styles.sectionTitle}>Recommendations</Text>
        {result.skinAnalysis.overall.recommendedTreatments.map(
          (treatment, index) => (
            <View key={index} style={styles.recommendationItem}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={Colors.success}
              />
              <Text style={styles.recommendationText}>{treatment}</Text>
            </View>
          )
        )}
      </View>
    </ScrollView>
  );

  const renderFacialTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Face Shape Analysis */}
      <View style={styles.analysisSection}>
        <Text style={styles.sectionTitle}>Face Shape Analysis</Text>
        <View style={styles.faceShapeCard}>
          <View style={styles.faceShapeInfo}>
            <Text style={styles.faceShapeType}>
              {result.faceAttributes.faceShape.type}
            </Text>
            <Text style={styles.faceShapeConfidence}>
              {Math.round(result.faceAttributes.faceShape.confidence * 100)}%
              confidence
            </Text>
            <View style={styles.measurements}>
              <Text style={styles.measurementText}>
                Width:{' '}
                {result.faceAttributes.faceShape.measurements.width.toFixed(1)}
              </Text>
              <Text style={styles.measurementText}>
                Height:{' '}
                {result.faceAttributes.faceShape.measurements.height.toFixed(1)}
              </Text>
              <Text style={styles.measurementText}>
                Ratio:{' '}
                {result.faceAttributes.faceShape.measurements.aspectRatio.toFixed(
                  2
                )}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Eyes Analysis */}
      <View style={styles.analysisSection}>
        <Text style={styles.sectionTitle}>Eyes Analysis</Text>
        <View style={styles.eyesGrid}>
          <View style={styles.eyeFeature}>
            <Text style={styles.featureLabel}>Shape</Text>
            <Text style={styles.featureValue}>
              {result.faceAttributes.eyes.shape}
            </Text>
          </View>
          <View style={styles.eyeFeature}>
            <Text style={styles.featureLabel}>Size</Text>
            <Text style={styles.featureValue}>
              {result.faceAttributes.eyes.size}
            </Text>
          </View>
          <View style={styles.eyeFeature}>
            <Text style={styles.featureLabel}>Angle</Text>
            <Text style={styles.featureValue}>
              {result.faceAttributes.eyes.angle}
            </Text>
          </View>
          <View style={styles.eyeFeature}>
            <Text style={styles.featureLabel}>Distance</Text>
            <Text style={styles.featureValue}>
              {result.faceAttributes.eyes.distance}
            </Text>
          </View>
        </View>
      </View>

      {/* Nose Analysis */}
      <View style={styles.analysisSection}>
        <Text style={styles.sectionTitle}>Nose Analysis</Text>
        <View style={styles.noseGrid}>
          <View style={styles.noseFeature}>
            <Text style={styles.featureLabel}>Width</Text>
            <Text style={styles.featureValue}>
              {result.faceAttributes.nose.width}
            </Text>
          </View>
          <View style={styles.noseFeature}>
            <Text style={styles.featureLabel}>Length</Text>
            <Text style={styles.featureValue}>
              {result.faceAttributes.nose.length}
            </Text>
          </View>
        </View>
      </View>

      {/* Lips Analysis */}
      <View style={styles.analysisSection}>
        <Text style={styles.sectionTitle}>Lips Analysis</Text>
        <View style={styles.lipsInfo}>
          <Text style={styles.featureLabel}>
            Shape: {result.faceAttributes.lips.shape}
          </Text>
          <Text style={styles.featureLabel}>
            Width: {result.faceAttributes.lips.measurements.width.toFixed(1)}
          </Text>
          <Text style={styles.featureLabel}>
            Thickness:{' '}
            {result.faceAttributes.lips.measurements.thickness.toFixed(1)}
          </Text>
        </View>
      </View>

      {/* Eyebrows Analysis */}
      <View style={styles.analysisSection}>
        <Text style={styles.sectionTitle}>Eyebrows Analysis</Text>
        <View style={styles.eyebrowsGrid}>
          <View style={styles.eyebrowFeature}>
            <Text style={styles.featureLabel}>Shape</Text>
            <Text style={styles.featureValue}>
              {result.faceAttributes.eyebrows.shape}
            </Text>
          </View>
          <View style={styles.eyebrowFeature}>
            <Text style={styles.featureLabel}>Thickness</Text>
            <Text style={styles.featureValue}>
              {result.faceAttributes.eyebrows.thickness}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderSkinTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* HD Skin Analysis */}
      {result.skinAnalysis.hd && (
        <View style={styles.analysisSection}>
          <Text style={styles.sectionTitle}>HD Skin Analysis</Text>

          {/* Primary Skin Metrics */}
          <View style={styles.skinMetricsGrid}>
            {renderSkinParameter(
              'Radiance',
              result.skinAnalysis.hd.hd_radiance
            )}
            {renderSkinParameter(
              'Moisture',
              result.skinAnalysis.hd.hd_moisture
            )}
            {renderSkinParameter(
              'Firmness',
              result.skinAnalysis.hd.hd_firmness
            )}
            {renderSkinParameter(
              'Texture',
              result.skinAnalysis.hd.hd_texture.whole
            )}
          </View>

          {/* Secondary Skin Metrics */}
          <View style={styles.skinMetricsGrid}>
            {renderSkinParameter('Redness', result.skinAnalysis.hd.hd_redness)}
            {renderSkinParameter(
              'Oiliness',
              result.skinAnalysis.hd.hd_oiliness
            )}
            {renderSkinParameter(
              'Age Spots',
              result.skinAnalysis.hd.hd_age_spot
            )}
            {renderSkinParameter('Acne', result.skinAnalysis.hd.hd_acne.whole)}
          </View>

          {/* Pore Analysis */}
          <View style={styles.poreSection}>
            <Text style={styles.subsectionTitle}>Pore Analysis</Text>
            <View style={styles.poreGrid}>
              {renderSkinParameter(
                'Forehead',
                result.skinAnalysis.hd.hd_pore.forehead!
              )}
              {renderSkinParameter(
                'Nose',
                result.skinAnalysis.hd.hd_pore.nose!
              )}
              {renderSkinParameter(
                'Cheek',
                result.skinAnalysis.hd.hd_pore.cheek!
              )}
              {renderSkinParameter(
                'Overall',
                result.skinAnalysis.hd.hd_pore.whole
              )}
            </View>
          </View>

          {/* Wrinkle Analysis */}
          <View style={styles.wrinkleSection}>
            <Text style={styles.subsectionTitle}>Wrinkle Analysis</Text>
            <View style={styles.wrinkleGrid}>
              {renderSkinParameter(
                'Forehead',
                result.skinAnalysis.hd.hd_wrinkle.forehead!
              )}
              {renderSkinParameter(
                "Crow's Feet",
                result.skinAnalysis.hd.hd_wrinkle.crowfeet!
              )}
              {renderSkinParameter(
                'Nasolabial',
                result.skinAnalysis.hd.hd_wrinkle.nasolabial!
              )}
              {renderSkinParameter(
                'Overall',
                result.skinAnalysis.hd.hd_wrinkle.whole
              )}
            </View>
          </View>
        </View>
      )}

      {/* Eye Area Analysis */}
      <View style={styles.analysisSection}>
        <Text style={styles.sectionTitle}>Eye Area Analysis</Text>
        <View style={styles.eyeAreaGrid}>
          {result.skinAnalysis.hd && (
            <>
              {renderSkinParameter(
                'Dark Circles',
                result.skinAnalysis.hd.hd_dark_circle
              )}
              {renderSkinParameter(
                'Eye Bags',
                result.skinAnalysis.hd.hd_eye_bag
              )}
              {renderSkinParameter(
                'Upper Eyelid',
                result.skinAnalysis.hd.hd_droopy_upper_eyelid
              )}
              {renderSkinParameter(
                'Lower Eyelid',
                result.skinAnalysis.hd.hd_droopy_lower_eyelid
              )}
            </>
          )}
        </View>
      </View>
    </ScrollView>
  );

  const renderImagesTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Original vs Processed */}
      <View style={styles.imageSection}>
        <Text style={styles.sectionTitle}>Analysis Images</Text>
        <View style={styles.imageGrid}>
          <TouchableOpacity
            style={styles.imageCard}
            onPress={() =>
              openImageModal('Original', result.analysisImages.originalImage)
            }
          >
            <Image
              source={{ uri: result.analysisImages.originalImage }}
              style={styles.analysisImage}
            />
            <Text style={styles.imageLabel}>Original</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.imageCard}
            onPress={() =>
              openImageModal('Processed', result.analysisImages.processedImage)
            }
          >
            <Image
              source={{ uri: result.analysisImages.processedImage }}
              style={styles.analysisImage}
            />
            <Text style={styles.imageLabel}>Processed</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Enhanced Images */}
      {result.analysisImages.enhancedImages &&
        Object.keys(result.analysisImages.enhancedImages).length > 0 && (
          <View style={styles.imageSection}>
            <Text style={styles.sectionTitle}>Enhanced Images</Text>
            <View style={styles.enhancedImagesGrid}>
              {Object.entries(result.analysisImages.enhancedImages).map(
                ([key, uri]) =>
                  uri && (
                    <TouchableOpacity
                      key={key}
                      style={styles.enhancedImageCard}
                      onPress={() => openImageModal(key, uri)}
                    >
                      <Image source={{ uri }} style={styles.enhancedImage} />
                      <Text style={styles.enhancedImageLabel}>
                        {key
                          .replace(/([A-Z])/g, ' $1')
                          .replace(/^./, (str) => str.toUpperCase())}
                      </Text>
                    </TouchableOpacity>
                  )
              )}
            </View>
          </View>
        )}

      {/* Mask Images */}
      {Object.keys(result.analysisImages.maskImages).length > 0 && (
        <View style={styles.imageSection}>
          <Text style={styles.sectionTitle}>Analysis Masks</Text>
          <View style={styles.maskImagesGrid}>
            {Object.entries(result.analysisImages.maskImages).map(
              ([key, uri]) => (
                <TouchableOpacity
                  key={key}
                  style={styles.maskImageCard}
                  onPress={() => openImageModal(`${key} Mask`, uri)}
                >
                  <Image source={{ uri }} style={styles.maskImage} />
                  <Text style={styles.maskImageLabel}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>
        </View>
      )}
    </ScrollView>
  );

  const renderSkinParameter = (name: string, parameter: SkinParameter) => (
    <View style={styles.skinParameterCard}>
      <Text style={styles.parameterName}>{name}</Text>
      <View style={styles.parameterScores}>
        <Text style={styles.parameterScore}>{parameter.ui_score}</Text>
        <Text style={styles.parameterMaxScore}>/100</Text>
      </View>
      <View style={styles.parameterBar}>
        <View
          style={[
            styles.parameterBarFill,
            {
              width: `${parameter.ui_score}%`,
              backgroundColor: getScoreColor(parameter.ui_score),
            },
          ]}
        />
      </View>
      <Text
        style={[
          styles.parameterSeverity,
          { color: getScoreColor(parameter.ui_score) },
        ]}
      >
        {parameter.severity}
      </Text>
    </View>
  );

  const renderTopConcerns = () => {
    const concerns: Array<{ name: string; score: number; severity: string }> =
      [];

    if (result.skinAnalysis.hd) {
      concerns.push(
        {
          name: 'Pores',
          score: result.skinAnalysis.hd.hd_pore.whole.ui_score,
          severity: result.skinAnalysis.hd.hd_pore.whole.severity || 'Medium',
        },
        {
          name: 'Wrinkles',
          score: result.skinAnalysis.hd.hd_wrinkle.whole.ui_score,
          severity:
            result.skinAnalysis.hd.hd_wrinkle.whole.severity || 'Medium',
        },
        {
          name: 'Acne',
          score: result.skinAnalysis.hd.hd_acne.whole.ui_score,
          severity: result.skinAnalysis.hd.hd_acne.whole.severity || 'Medium',
        }
      );
    }

    // Sort by score (lower scores = more concerning)
    concerns.sort((a, b) => a.score - b.score);

    return concerns.slice(0, 3).map((concern, index) => (
      <View key={index} style={styles.concernItem}>
        <View style={styles.concernIcon}>
          <Ionicons
            name={
              concern.severity === 'High' ? 'warning' : 'information-circle'
            }
            size={20}
            color={getScoreColor(concern.score)}
          />
        </View>
        <View style={styles.concernInfo}>
          <Text style={styles.concernName}>{concern.name}</Text>
          <Text style={styles.concernScore}>Score: {concern.score}/100</Text>
        </View>
        <Text
          style={[
            styles.concernSeverity,
            { color: getScoreColor(concern.score) },
          ]}
        >
          {concern.severity}
        </Text>
      </View>
    ));
  };

  const openImageModal = (type: string, uri: string) => {
    setSelectedImageType(type);
    setShowImageModal(true);
  };

  const shareResults = async () => {
    try {
      const message =
        `My Face Analysis Results:\n\n` +
        `Overall Skin Health: ${overallScore}/100\n` +
        `Face Shape: ${result.faceAttributes.faceShape.type}\n` +
        `Skin Type: ${result.skinAnalysis.overall.skinType}\n` +
        `Confidence: ${result.confidence}%\n\n` +
        `Analyzed with IsherCare Advanced AI`;

      await Share.share({ message });
    } catch (error) {
      console.error('Error sharing results:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Face Analysis Results</Text>
          <TouchableOpacity onPress={shareResults} style={styles.shareButton}>
            <Ionicons name="share-outline" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabNavigation}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'overview' && styles.activeTab,
            ]}
            onPress={() => setActiveTab('overview')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'overview' && styles.activeTabText,
              ]}
            >
              Overview
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'facial' && styles.activeTab,
            ]}
            onPress={() => setActiveTab('facial')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'facial' && styles.activeTabText,
              ]}
            >
              Facial
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'skin' && styles.activeTab]}
            onPress={() => setActiveTab('skin')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'skin' && styles.activeTabText,
              ]}
            >
              Skin
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'images' && styles.activeTab,
            ]}
            onPress={() => setActiveTab('images')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'images' && styles.activeTabText,
              ]}
            >
              Images
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View style={styles.tabContainer}>
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'facial' && renderFacialTab()}
          {activeTab === 'skin' && renderSkinTab()}
          {activeTab === 'images' && renderImagesTab()}
        </View>

        {/* Image Modal */}
        <Modal visible={showImageModal} animationType="fade" transparent>
          <BlurView intensity={80} style={styles.modalOverlay}>
            <View style={styles.imageModalContainer}>
              <View style={styles.imageModalHeader}>
                <Text style={styles.imageModalTitle}>{selectedImageType}</Text>
                <TouchableOpacity
                  onPress={() => setShowImageModal(false)}
                  style={styles.imageModalClose}
                >
                  <Ionicons name="close" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
              </View>
              {selectedImageType && (
                <Image
                  source={{ uri: result.analysisImages.originalImage }}
                  style={styles.modalImage}
                  resizeMode="contain"
                />
              )}
            </View>
          </BlurView>
        </Modal>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  shareButton: {
    padding: 5,
  },
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  tabContainer: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    padding: 20,
  },
  scoreCard: {
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  scoreGradient: {
    padding: 30,
    alignItems: 'center',
  },
  scoreTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  scoreSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: Colors.surface,
    padding: 15,
    borderRadius: 15,
    margin: '1%',
    alignItems: 'center',
    elevation: 3,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 5,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 15,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  concernsSection: {
    marginBottom: 20,
  },
  concernItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  concernIcon: {
    marginRight: 12,
  },
  concernInfo: {
    flex: 1,
  },
  concernName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  concernScore: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  concernSeverity: {
    fontSize: 12,
    fontWeight: '600',
  },
  recommendationsSection: {
    marginBottom: 20,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  recommendationText: {
    fontSize: 16,
    color: Colors.textPrimary,
    marginLeft: 12,
    flex: 1,
  },
  analysisSection: {
    marginBottom: 30,
  },
  faceShapeCard: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  faceShapeInfo: {
    alignItems: 'center',
  },
  faceShapeType: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 5,
  },
  faceShapeConfidence: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 15,
  },
  measurements: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  measurementText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  eyesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  eyeFeature: {
    width: '48%',
    backgroundColor: Colors.surface,
    padding: 15,
    borderRadius: 12,
    margin: '1%',
    alignItems: 'center',
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  featureLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 5,
  },
  featureValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  noseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  noseFeature: {
    width: '48%',
    backgroundColor: Colors.surface,
    padding: 15,
    borderRadius: 12,
    margin: '1%',
    alignItems: 'center',
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  lipsInfo: {
    backgroundColor: Colors.surface,
    padding: 15,
    borderRadius: 12,
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  eyebrowsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  eyebrowFeature: {
    width: '48%',
    backgroundColor: Colors.surface,
    padding: 15,
    borderRadius: 12,
    margin: '1%',
    alignItems: 'center',
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  skinMetricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  skinParameterCard: {
    width: '48%',
    backgroundColor: Colors.surface,
    padding: 15,
    borderRadius: 12,
    margin: '1%',
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  parameterName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  parameterScores: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  parameterScore: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  parameterMaxScore: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  parameterBar: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    marginBottom: 8,
    overflow: 'hidden',
  },
  parameterBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  parameterSeverity: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  poreSection: {
    marginBottom: 20,
  },
  poreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  wrinkleSection: {
    marginBottom: 20,
  },
  wrinkleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  eyeAreaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  imageSection: {
    marginBottom: 30,
  },
  imageGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  imageCard: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  analysisImage: {
    width: '100%',
    height: 150,
  },
  imageLabel: {
    padding: 10,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  enhancedImagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  enhancedImageCard: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    margin: '1%',
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  enhancedImage: {
    width: '100%',
    height: 100,
  },
  enhancedImageLabel: {
    padding: 8,
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  maskImagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  maskImageCard: {
    width: '31%',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    margin: '1%',
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  maskImage: {
    width: '100%',
    height: 80,
  },
  maskImageLabel: {
    padding: 6,
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageModalContainer: {
    width: width * 0.9,
    height: height * 0.8,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  imageModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  imageModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  imageModalClose: {
    padding: 5,
  },
  modalImage: {
    flex: 1,
    width: '100%',
  },
});

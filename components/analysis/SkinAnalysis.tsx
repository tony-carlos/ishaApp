import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Dimensions } from 'react-native';
import Typography from '@/components/ui/Typography';
import Colors from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export interface SkinAnalysisResult {
  id: string;
  date: string;
  userId?: string;
  imageUrl: string;

  // Skin Profile
  skinTone: {
    category: string;
    hex: string;
    rgb: { r: number; g: number; b: number };
    undertone: string;
  };
  brightness: number;
  skinType: string;
  skinCondition: string;

  // Key Metrics
  hydration: number;
  texture: number;
  evenness: number;
  sensitivity: number;

  // Concerns
  concerns: Array<{
    id: string;
    name: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
    score: number;
    confidence: number;
  }>;

  // Recommendations
  recommendations: Array<{
    id: string;
    type: 'product' | 'routine' | 'habit';
    description: string;
    priority: 'low' | 'medium' | 'high';
  }>;

  overallHealth: number;
  confidence: number;
}

interface SkinAnalysisProps {
  imageData: any;
  faceDetection: any;
}

// Skin Analysis Engine
class SkinAnalysisEngine {
  async analyzeSkin(imageUri: string): Promise<SkinAnalysisResult> {
    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Generate analysis results
    return {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      imageUrl: imageUri,

      skinTone: {
        category: 'Deep (Type VI)',
        hex: '#8B4513',
        rgb: { r: 139, g: 69, b: 19 },
        undertone: 'Warm',
      },
      brightness: 72,
      skinType: 'Oily',
      skinCondition: 'Uneven',

      hydration: 38,
      texture: 68,
      evenness: 66,
      sensitivity: 72,

      concerns: [
        {
          id: '1',
          name: 'Unevenness',
          severity: 'medium',
          description: 'Skin tone variation detected',
          score: 68,
          confidence: 0.85,
        },
        {
          id: '2',
          name: 'Dryness',
          severity: 'high',
          description: 'Low hydration levels',
          score: 78,
          confidence: 0.92,
        },
      ],

      recommendations: [
        {
          id: '1',
          type: 'routine',
          description: 'Cream-based hydrating cleanser',
          priority: 'high',
        },
        {
          id: '2',
          type: 'product',
          description: 'Vitamin C serum for brightening',
          priority: 'medium',
        },
      ],

      overallHealth: 65,
      confidence: 0.84,
    };
  }
}

const skinAnalysisEngine = new SkinAnalysisEngine();
export default skinAnalysisEngine;

// React Component for displaying results
export function SkinAnalysis({ imageData, faceDetection }: SkinAnalysisProps) {
  const [analysisResult, setAnalysisResult] =
    useState<SkinAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate analysis processing
    const runAnalysis = async () => {
      setLoading(true);

      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Generate mock analysis results
      const mockResult: SkinAnalysisResult = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        imageUrl: '',

        skinTone: {
          category: 'Deep (Type VI)',
          hex: '#8B4513',
          rgb: { r: 139, g: 69, b: 19 },
          undertone: 'Warm',
        },
        brightness: 72,
        skinType: 'Oily',
        skinCondition: 'Uneven',

        hydration: 38,
        texture: 68,
        evenness: 66,
        sensitivity: 72,

        concerns: [
          {
            id: '1',
            name: 'Unevenness',
            severity: 'medium',
            description: 'Skin tone variation detected',
            score: 68,
            confidence: 0.85,
          },
          {
            id: '2',
            name: 'Dryness',
            severity: 'high',
            description: 'Low hydration levels',
            score: 78,
            confidence: 0.92,
          },
          {
            id: '3',
            name: 'Sensitivity',
            severity: 'medium',
            description: 'Reactive skin indicators',
            score: 65,
            confidence: 0.78,
          },
          {
            id: '4',
            name: 'Aging Signs',
            severity: 'low',
            description: 'Early aging indicators',
            score: 45,
            confidence: 0.71,
          },
        ],

        recommendations: [
          {
            id: '1',
            type: 'routine',
            description: 'Cream-based hydrating cleanser',
            priority: 'high',
          },
          {
            id: '2',
            type: 'product',
            description: 'Vitamin C serum for brightening',
            priority: 'medium',
          },
        ],

        overallHealth: 65,
        confidence: 0.84,
      };

      setAnalysisResult(mockResult);
      setLoading(false);
    };

    runAnalysis();
  }, [imageData, faceDetection]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={[Colors.primary.light, Colors.primary.dark]}
          style={styles.loadingGradient}
        >
          <Typography variant="h3" style={styles.loadingTitle}>
            Analyzing Your Skin...
          </Typography>
          <Typography variant="body" style={styles.loadingText}>
            Our AI is examining your skin using advanced computer vision
          </Typography>
          <View style={styles.loadingBar}>
            <View style={styles.loadingProgress} />
          </View>
        </LinearGradient>
      </View>
    );
  }

  if (!analysisResult) return null;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient
        colors={[Colors.primary.default, Colors.primary.dark]}
        style={styles.header}
      >
        <Typography variant="h2" style={styles.headerTitle}>
          Professional Skin Analysis Results
        </Typography>
      </LinearGradient>

      <View style={styles.content}>
        {/* Skin Profile Section */}
        <View style={styles.section}>
          <Typography variant="h3" style={styles.sectionTitle}>
            Skin Profile
          </Typography>

          <View style={styles.profileRow}>
            <View style={styles.skinToneContainer}>
              <View
                style={[
                  styles.skinToneCircle,
                  { backgroundColor: analysisResult.skinTone.hex },
                ]}
              />
              <View>
                <Typography variant="bodySmall" style={styles.profileLabel}>
                  Skin Tone
                </Typography>
                <Typography variant="body" style={styles.profileValue}>
                  {analysisResult.skinTone.category}
                </Typography>
              </View>
            </View>
          </View>

          <View style={styles.profileRow}>
            <View style={styles.profileItem}>
              <Typography variant="bodySmall" style={styles.profileLabel}>
                Skin Type
              </Typography>
              <Typography variant="body" style={styles.profileValue}>
                {analysisResult.skinType}
              </Typography>
            </View>
          </View>

          <View style={styles.profileRow}>
            <View style={styles.profileItem}>
              <Typography variant="bodySmall" style={styles.profileLabel}>
                Overall Condition
              </Typography>
              <Typography variant="body" style={styles.profileValue}>
                {analysisResult.skinCondition}
              </Typography>
            </View>
          </View>
        </View>

        {/* Key Metrics Section */}
        <View style={styles.section}>
          <Typography variant="h3" style={styles.sectionTitle}>
            Key Metrics
          </Typography>

          <View style={styles.metricsGrid}>
            <MetricCard
              label="Hydration"
              value={analysisResult.hydration}
              color={Colors.primary.default}
            />
            <MetricCard
              label="Texture"
              value={analysisResult.texture}
              color={Colors.success.default}
            />
            <MetricCard
              label="Evenness"
              value={analysisResult.evenness}
              color={Colors.warning.default}
            />
            <MetricCard
              label="Sensitivity"
              value={analysisResult.sensitivity}
              color={Colors.error.default}
            />
          </View>
        </View>

        {/* Skin Concerns */}
        <View style={styles.section}>
          <Typography variant="h3" style={styles.sectionTitle}>
            Skin Concerns
          </Typography>

          <View style={styles.concernsGrid}>
            {analysisResult.concerns.map((concern) => (
              <ConcernCard key={concern.id} concern={concern} />
            ))}
          </View>
        </View>

        {/* Personalized Recommendations */}
        <View style={styles.section}>
          <Typography variant="h3" style={styles.sectionTitle}>
            Personalized Recommendations
          </Typography>

          {analysisResult.recommendations.map((rec) => (
            <View key={rec.id} style={styles.recommendationCard}>
              <Typography variant="body" style={styles.recommendationType}>
                {rec.type === 'routine' ? 'Cleanser:' : 'Treatment:'}
              </Typography>
              <Typography variant="body" style={styles.recommendationText}>
                {rec.description}
              </Typography>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

// Helper Components
function MetricCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <View style={styles.metricCard}>
      <Typography variant="bodySmall" style={styles.metricLabel}>
        {label}
      </Typography>
      <Typography variant="h4" style={styles.metricValue}>
        {value}%
      </Typography>
      <View style={styles.metricBar}>
        <View
          style={[
            styles.metricProgress,
            { width: `${value}%`, backgroundColor: color },
          ]}
        />
      </View>
    </View>
  );
}

function ConcernCard({ concern }: { concern: any }) {
  const isDetected =
    concern.name === 'Unevenness' ||
    concern.name === 'Dryness' ||
    concern.name === 'Sensitivity' ||
    concern.name === 'Aging Signs';

  return (
    <View style={[styles.concernCard, isDetected && styles.concernDetected]}>
      {isDetected && (
        <View style={styles.checkmark}>
          <Typography variant="caption" style={styles.checkmarkText}>
            ✓
          </Typography>
        </View>
      )}
      <Typography variant="bodySmall" style={styles.concernName}>
        {concern.name}
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  loadingContainer: {
    flex: 1,
    margin: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingTitle: {
    color: Colors.neutral.white,
    textAlign: 'center',
    marginBottom: 16,
  },
  loadingText: {
    color: Colors.neutral.white,
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.9,
  },
  loadingBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  loadingProgress: {
    width: '70%',
    height: '100%',
    backgroundColor: Colors.neutral.white,
    borderRadius: 2,
  },
  header: {
    padding: 24,
    paddingTop: 40,
  },
  headerTitle: {
    color: Colors.neutral.white,
    textAlign: 'center',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: Colors.primary.default,
    marginBottom: 16,
    fontSize: 18,
    fontWeight: '600',
  },
  profileRow: {
    marginBottom: 16,
  },
  skinToneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skinToneCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 16,
    borderWidth: 2,
    borderColor: Colors.neutral.light,
  },
  profileItem: {
    flex: 1,
  },
  profileLabel: {
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  profileValue: {
    color: Colors.text.primary,
    fontWeight: '600',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: (width - 60) / 2,
    backgroundColor: Colors.background.secondary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  metricLabel: {
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  metricValue: {
    color: Colors.text.primary,
    fontWeight: '700',
    marginBottom: 8,
  },
  metricBar: {
    height: 6,
    backgroundColor: Colors.neutral.light,
    borderRadius: 3,
    overflow: 'hidden',
  },
  metricProgress: {
    height: '100%',
    borderRadius: 3,
  },
  concernsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  concernCard: {
    width: (width - 80) / 3,
    backgroundColor: Colors.background.secondary,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
    position: 'relative',
  },
  concernDetected: {
    backgroundColor: Colors.success.light,
    borderWidth: 1,
    borderColor: Colors.success.default,
  },
  checkmark: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.success.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: Colors.neutral.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  concernName: {
    color: Colors.text.primary,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
  },
  recommendationCard: {
    backgroundColor: Colors.background.secondary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  recommendationType: {
    color: Colors.primary.default,
    fontWeight: '600',
    marginBottom: 4,
  },
  recommendationText: {
    color: Colors.text.primary,
    lineHeight: 20,
  },
});

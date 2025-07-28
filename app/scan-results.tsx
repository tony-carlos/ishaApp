import { useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import Typography from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import Colors from '@/constants/Colors';
import { useSkinAnalysis } from '@/contexts/SkinAnalysisContext';
import { ArrowLeft, ChevronRight, Info, Alert } from '@/utils/icons';
import Card from '@/components/ui/Card';
import { LinearGradient } from 'expo-linear-gradient';

export default function ScanResultsScreen() {
  const router = useRouter();
  const { latestAnalysis } = useSkinAnalysis();

  useEffect(() => {
    // If there's no analysis, redirect to home
    if (!latestAnalysis) {
      router.replace('/(tabs)');
    }
  }, [latestAnalysis, router]);

  if (!latestAnalysis) {
    return null; // This will never render since we redirect in useEffect
  }

  // Helper function to get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return Colors.error.default;
      case 'medium':
        return Colors.warning.default;
      case 'low':
        return Colors.success.default;
      default:
        return Colors.primary.default;
    }
  };

  // Helper function to get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return Colors.primary.default;
      case 'medium':
        return Colors.secondary.default;
      case 'low':
        return Colors.text.tertiary;
      default:
        return Colors.text.primary;
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.primary.light, Colors.background.primary]}
        style={styles.headerGradient}
      />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push('/(tabs)')}
        >
          <ArrowLeft size={24} color={Colors.neutral.white} />
        </TouchableOpacity>
        <Typography variant="h3" color={Colors.neutral.white}>
          Skin Analysis Results
        </Typography>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.scoreCard}>
          <Typography
            variant="h1"
            align="center"
            color={Colors.primary.default}
          >
            {latestAnalysis.overallHealth}
          </Typography>
          <Typography variant="body" align="center">
            Skin Health Score
          </Typography>
        </Card>

        <View style={styles.imageSection}>
          <Image
            source={{ uri: latestAnalysis.imageUrl }}
            style={styles.skinImage}
            resizeMode="cover"
          />
        </View>

        <View style={styles.section}>
          <Typography variant="h2">Detected Concerns</Typography>
          {latestAnalysis.concerns.map((concern) => (
            <Card key={concern.id} style={styles.concernCard}>
              <View style={styles.concernHeader}>
                <Typography variant="h3">{concern.name}</Typography>
                <View
                  style={[
                    styles.severityTag,
                    { backgroundColor: getSeverityColor(concern.severity) },
                  ]}
                >
                  <Typography variant="caption" color={Colors.neutral.white}>
                    {concern.severity.toUpperCase()}
                  </Typography>
                </View>
              </View>
              <Typography variant="body" style={styles.concernDescription}>
                {concern.description}
              </Typography>
            </Card>
          ))}
        </View>

        <View style={styles.section}>
          <Typography variant="h2">Recommendations</Typography>
          {latestAnalysis.recommendations.map((rec) => (
            <Card key={rec.id} style={styles.recommendationCard}>
              <View style={styles.recommendationContent}>
                <View style={styles.recommendationIcon}>
                  {rec.type === 'product' ? (
                    <BookOpen size={24} color={Colors.primary.default} />
                  ) : (
                    <AlertCircle size={24} color={Colors.secondary.default} />
                  )}
                </View>
                <View style={styles.recommendationText}>
                  <Typography
                    variant="bodySmall"
                    color={getPriorityColor(rec.priority)}
                    style={styles.recommendationType}
                  >
                    {rec.type === 'product' ? 'PRODUCT' : 'HABIT'} •{' '}
                    {rec.priority.toUpperCase()} PRIORITY
                  </Typography>
                  <Typography variant="body">{rec.description}</Typography>
                </View>
                <ChevronRight size={20} color={Colors.neutral.medium} />
              </View>
            </Card>
          ))}
        </View>

        <Button
          label="Go to Home"
          onPress={() => router.push('/(tabs)')}
          variant="primary"
          size="lg"
          fullWidth
          style={styles.button}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    zIndex: 1,
  },
  backButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  scoreCard: {
    alignItems: 'center',
    padding: 24,
    marginBottom: 16,
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    shadowColor: Colors.neutral.darkest,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  imageSection: {
    marginBottom: 24,
  },
  skinImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
  },
  section: {
    marginBottom: 24,
  },
  concernCard: {
    marginBottom: 12,
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    padding: 16,
  },
  concernHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  severityTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  concernDescription: {
    color: Colors.text.secondary,
  },
  recommendationCard: {
    marginBottom: 12,
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    padding: 16,
  },
  recommendationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recommendationIcon: {
    marginRight: 12,
  },
  recommendationText: {
    flex: 1,
  },
  recommendationType: {
    marginBottom: 4,
    fontWeight: '600',
  },
  button: {
    marginTop: 16,
  },
});

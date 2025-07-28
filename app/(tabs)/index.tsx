import { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Typography from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Colors from '@/constants/Colors';
import { useUser } from '@/contexts/UserContext';
import { useSkinAnalysis } from '@/contexts/SkinAnalysisContext';
import { Camera, Alert, TrendingUp, Info, RotateCw } from '@/utils/icons';
import { LinearGradient } from 'expo-linear-gradient';
import { dailySkinTips } from '@/assets/data/skinTips';
import { formatDate } from '@/utils/helpers';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HomeScreen() {
  const { user } = useUser();
  const { latestAnalysis } = useSkinAnalysis();
  const [currentTip, setCurrentTip] = useState(dailySkinTips[0]);

  useEffect(() => {
    // Get a random tip on component mount
    const randomIndex = Math.floor(Math.random() * dailySkinTips.length);
    setCurrentTip(dailySkinTips[randomIndex]);
  }, []);

  const handleScanPress = () => {
    router.push('/(onboarding)/scan');
  };

  const renderWelcomeSection = () => (
    <View style={styles.welcomeSection}>
      <View style={styles.welcomeTextContainer}>
        <Typography variant="h1" style={styles.welcomeTitleBlack}>
          Hello, {user?.full_name?.split(' ')[0] || 'Beautiful'}! ✨
        </Typography>
        <Typography variant="body" style={styles.welcomeSubtitleBlack}>
          Your skin journey starts here
        </Typography>
      </View>
    </View>
  );

  const renderEmptyAnalysis = () => (
    <Card style={styles.emptyAnalysisCard} elevation={2}>
      <LinearGradient
        colors={[Colors.primary.light, Colors.background.primary]}
        style={styles.emptyAnalysisGradient}
      >
        <View style={styles.emptyIconContainer}>
          <Camera size={48} color={Colors.primary.default} />
        </View>
        <Typography variant="h3" align="center" style={styles.emptyTitle}>
          Ready for your first scan?
        </Typography>
        <Typography variant="body" align="center" style={styles.emptyText}>
          Get personalized skincare recommendations based on your unique skin
          analysis
        </Typography>
        <Button
          label="Take Your First Scan"
          variant="primary"
          size="lg"
          icon={<Camera size={20} color={Colors.neutral.white} />}
          iconPosition="left"
          style={styles.scanButton}
          onPress={handleScanPress}
        />
      </LinearGradient>
    </Card>
  );

  const renderAnalysisSummary = () => (
    <Card style={styles.analysisCard} elevation={3}>
      <LinearGradient
        colors={[Colors.success.light, Colors.background.primary]}
        style={styles.analysisGradient}
      >
        <View style={styles.analysisHeader}>
          <View style={styles.analysisHeaderLeft}>
            <Typography variant="overline" color={Colors.text.tertiary}>
              LATEST ANALYSIS
            </Typography>
            <Typography variant="h3" style={styles.analysisTitle}>
              Skin Health Score
            </Typography>
          </View>
          <View style={styles.scoreContainer}>
            <View style={styles.scoreCircle}>
              <Typography variant="h1" color={Colors.primary.default}>
                {latestAnalysis?.overallHealth || 0}
              </Typography>
              <Typography variant="caption" color={Colors.text.tertiary}>
                /100
              </Typography>
            </View>
            <TrendingUp size={20} color={Colors.success.default} />
          </View>
        </View>

        {latestAnalysis?.imageUrl && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: latestAnalysis.imageUrl }}
              style={styles.analysisImage}
            />
            <View style={styles.imageOverlay}>
              <Typography variant="caption" style={styles.imageDate}>
                {latestAnalysis
                  ? formatDate(new Date(latestAnalysis.date))
                  : 'No date'}
              </Typography>
            </View>
          </View>
        )}

        <View style={styles.concernsList}>
          <Typography variant="h4" style={styles.concernsTitle}>
            Key Concerns
          </Typography>

          {latestAnalysis?.concerns.slice(0, 3).map((concern, index) => (
            <View key={concern.id} style={styles.concernItem}>
              <View
                style={[
                  styles.concernIcon,
                  {
                    backgroundColor:
                      concern.severity === 'high'
                        ? Colors.error.light
                        : concern.severity === 'medium'
                        ? Colors.warning.light
                        : Colors.success.light,
                  },
                ]}
              >
                <AlertCircle
                  size={16}
                  color={
                    concern.severity === 'high'
                      ? Colors.error.default
                      : concern.severity === 'medium'
                      ? Colors.warning.default
                      : Colors.success.default
                  }
                />
              </View>
              <View style={styles.concernDetails}>
                <Typography variant="bodySmall" style={styles.concernName}>
                  {concern.name}
                </Typography>
                <Typography variant="caption" style={styles.concernDescription}>
                  {concern.description}
                </Typography>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.analysisActions}>
          <Button
            label="View Full Analysis"
            variant="outline"
            size="md"
            style={styles.viewButton}
            onPress={() => {
              router.push('/scan-results');
            }}
          />
          <Button
            label="New Scan"
            variant="primary"
            size="md"
            icon={<Camera size={16} color={Colors.neutral.white} />}
            iconPosition="left"
            style={styles.newScanButton}
            onPress={handleScanPress}
          />
        </View>
      </LinearGradient>
    </Card>
  );

  const renderDailyTip = () => (
    <Card style={styles.tipCard} elevation={2}>
      <LinearGradient
        colors={[Colors.accent.light, Colors.background.primary]}
        style={styles.tipGradient}
      >
        <View style={styles.tipHeader}>
          <View style={styles.tipTitleContainer}>
            <Info size={24} color={Colors.primary.default} />
            <Typography variant="h4" style={styles.tipHeaderTitle}>
              Daily Skincare Tip
            </Typography>
          </View>
          <TouchableOpacity
            onPress={() => {
              const randomIndex = Math.floor(
                Math.random() * dailySkinTips.length
              );
              setCurrentTip(dailySkinTips[randomIndex]);
            }}
          >
            <Typography variant="caption" style={styles.refreshText}>
              Refresh
            </Typography>
          </TouchableOpacity>
        </View>

        <Typography variant="body" style={styles.tipTitle}>
          {currentTip.title}
        </Typography>

        <Typography variant="bodySmall" style={styles.tipContent}>
          {currentTip.content}
        </Typography>
      </LinearGradient>
    </Card>
  );

  const renderTodayRoutine = () => (
    <Card style={styles.routineCard} elevation={2}>
      <View style={styles.routineHeader}>
        <View style={styles.routineTitleContainer}>
          <Info size={24} color={Colors.primary.default} />
          <Typography variant="h4" style={styles.routineTitle}>
            Today's Routine
          </Typography>
        </View>
        <TouchableOpacity onPress={() => {}}>
          <Typography variant="caption" style={styles.editText}>
            Edit
          </Typography>
        </TouchableOpacity>
      </View>

      <View style={styles.routineContent}>
        <View style={styles.routineSection}>
          <View style={styles.routineTimeHeader}>
            <Info size={20} color={Colors.warning.default} />
            <Typography variant="bodySmall" style={styles.routineTime}>
              MORNING ROUTINE
            </Typography>
          </View>
          <View style={styles.routineSteps}>
            <View style={styles.routineStep}>
              <View style={styles.stepNumber}>
                <Typography variant="caption" style={styles.stepNumberText}>
                  1
                </Typography>
              </View>
              <Typography variant="body">Gentle Cleanser</Typography>
            </View>
            <View style={styles.routineStep}>
              <View style={styles.stepNumber}>
                <Typography variant="caption" style={styles.stepNumberText}>
                  2
                </Typography>
              </View>
              <Typography variant="body">Vitamin C Serum</Typography>
            </View>
            <View style={styles.routineStep}>
              <View style={styles.stepNumber}>
                <Typography variant="caption" style={styles.stepNumberText}>
                  3
                </Typography>
              </View>
              <Typography variant="body">Moisturizer</Typography>
            </View>
            <View style={styles.routineStep}>
              <View style={styles.stepNumber}>
                <Typography variant="caption" style={styles.stepNumberText}>
                  4
                </Typography>
              </View>
              <Typography variant="body">Sunscreen SPF 30+</Typography>
            </View>
          </View>
        </View>

        <View style={styles.routineSection}>
          <View style={styles.routineTimeHeader}>
            <Info size={20} color={Colors.neutral.dark} />
            <Typography variant="bodySmall" style={styles.routineTime}>
              EVENING ROUTINE
            </Typography>
          </View>
          <View style={styles.routineSteps}>
            <View style={styles.routineStep}>
              <View style={styles.stepNumber}>
                <Typography variant="caption" style={styles.stepNumberText}>
                  1
                </Typography>
              </View>
              <Typography variant="body">Cleansing Oil</Typography>
            </View>
            <View style={styles.routineStep}>
              <View style={styles.stepNumber}>
                <Typography variant="caption" style={styles.stepNumberText}>
                  2
                </Typography>
              </View>
              <Typography variant="body">Foaming Cleanser</Typography>
            </View>
            <View style={styles.routineStep}>
              <View style={styles.stepNumber}>
                <Typography variant="caption" style={styles.stepNumberText}>
                  3
                </Typography>
              </View>
              <Typography variant="body">Retinol Serum</Typography>
            </View>
            <View style={styles.routineStep}>
              <View style={styles.stepNumber}>
                <Typography variant="caption" style={styles.stepNumberText}>
                  4
                </Typography>
              </View>
              <Typography variant="body">Night Cream</Typography>
            </View>
          </View>
        </View>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={[Colors.primary.light, Colors.background.primary]}
        style={styles.headerGradient}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderWelcomeSection()}

        <View style={styles.content}>
          {latestAnalysis ? renderAnalysisSummary() : renderEmptyAnalysis()}
          {renderDailyTip()}
          {renderTodayRoutine()}
        </View>
      </ScrollView>
    </SafeAreaView>
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
    height: 250,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  welcomeSection: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  welcomeTextContainer: {
    flex: 1,
  },
  welcomeTitle: {
    color: Colors.neutral.white,
    marginBottom: 4,
    fontSize: 28,
    fontWeight: '700',
  },
  welcomeTitleBlack: {
    color: Colors.text.primary,
    marginBottom: 4,
    fontSize: 28,
    fontWeight: '700',
  },
  welcomeSubtitle: {
    color: Colors.neutral.white,
    opacity: 0.9,
    fontSize: 16,
  },
  welcomeSubtitleBlack: {
    color: Colors.text.primary,
    opacity: 0.9,
    fontSize: 16,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.neutral.white,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.error.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationText: {
    color: Colors.neutral.white,
    fontSize: 12,
    fontWeight: '600',
  },

  content: {
    paddingHorizontal: 24,
  },
  emptyAnalysisCard: {
    marginBottom: 24,
    overflow: 'hidden',
  },
  emptyAnalysisGradient: {
    padding: 32,
    alignItems: 'center',
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    marginBottom: 12,
    fontSize: 24,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.8,
    lineHeight: 24,
  },
  scanButton: {
    paddingHorizontal: 48,
    paddingVertical: 16,
  },
  analysisCard: {
    marginBottom: 24,
    overflow: 'hidden',
  },
  analysisGradient: {
    padding: 24,
  },
  analysisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  analysisHeaderLeft: {
    flex: 1,
  },
  analysisTitle: {
    marginTop: 4,
  },
  scoreContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  scoreCircle: {
    alignItems: 'center',
    marginRight: 12,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  analysisImage: {
    width: '100%',
    height: 200,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 12,
  },
  imageDate: {
    color: Colors.neutral.white,
  },
  concernsList: {
    marginBottom: 24,
  },
  concernsTitle: {
    marginBottom: 16,
    fontSize: 18,
    fontWeight: '600',
  },
  concernItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  concernIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  concernDetails: {
    flex: 1,
  },
  concernName: {
    fontWeight: '600',
    marginBottom: 4,
  },
  concernDescription: {
    opacity: 0.8,
    lineHeight: 20,
  },
  analysisActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  viewButton: {
    flex: 1,
  },
  newScanButton: {
    flex: 1,
  },
  tipCard: {
    marginBottom: 24,
    overflow: 'hidden',
  },
  tipGradient: {
    padding: 24,
  },
  tipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tipTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipHeaderTitle: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: '600',
  },
  refreshText: {
    color: Colors.primary.default,
    fontWeight: '600',
  },
  tipTitle: {
    fontWeight: '600',
    marginBottom: 12,
    fontSize: 16,
  },
  tipContent: {
    opacity: 0.8,
    lineHeight: 22,
  },
  routineCard: {
    marginBottom: 24,
  },
  routineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  routineTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routineTitle: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: '600',
  },
  editText: {
    color: Colors.primary.default,
    fontWeight: '600',
  },
  routineContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  routineSection: {
    marginBottom: 24,
  },
  routineTimeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  routineTime: {
    color: Colors.primary.default,
    fontWeight: '700',
    marginLeft: 8,
  },
  routineSteps: {
    gap: 12,
  },
  routineStep: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary.default,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: Colors.neutral.white,
    fontWeight: '600',
  },
});

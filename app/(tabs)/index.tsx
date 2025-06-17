import { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Image } from 'react-native';
import Typography from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Colors from '@/constants/Colors';
import { useUser } from '@/contexts/UserContext';
import { useSkinAnalysis } from '@/contexts/SkinAnalysisContext';
import { CircleSlash, Camera, Droplets, Clock, CircleAlert as AlertCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { dailySkinTips } from '@/assets/data/skinTips';
import { formatDate } from '@/utils/helpers';

export default function HomeScreen() {
  const { user } = useUser();
  const { latestAnalysis } = useSkinAnalysis();
  const [currentTip, setCurrentTip] = useState(dailySkinTips[0]);
  
  useEffect(() => {
    // Get a random tip on component mount
    const randomIndex = Math.floor(Math.random() * dailySkinTips.length);
    setCurrentTip(dailySkinTips[randomIndex]);
  }, []);
  
  const renderEmptyAnalysis = () => (
    <Card style={styles.emptyAnalysisCard}>
      <View style={styles.emptyIconContainer}>
        <CircleSlash size={40} color={Colors.neutral.medium} />
      </View>
      <Typography variant="h3" align="center" style={styles.emptyTitle}>
        No Skin Analysis Yet
      </Typography>
      <Typography variant="body" align="center" style={styles.emptyText}>
        Take your first skin analysis scan to get personalized recommendations
      </Typography>
      <Button
        label="Take Skin Scan"
        variant="primary"
        size="md"
        icon={<Camera size={18} color={Colors.neutral.white} />}
        iconPosition="left"
        style={styles.scanButton}
        onPress={() => {/* Navigate to scan page */}}
      />
    </Card>
  );
  
  const renderAnalysisSummary = () => (
    <Card style={styles.analysisCard} elevation={2}>
      <View style={styles.analysisHeader}>
        <View>
          <Typography variant="overline" color={Colors.text.tertiary}>
            LATEST ANALYSIS
          </Typography>
          <Typography variant="h3">
            Skin Health Score
          </Typography>
        </View>
        <View style={styles.scoreContainer}>
          <Typography variant="display" color={Colors.primary.default}>
            {latestAnalysis?.overallHealth || 0}
          </Typography>
          <Typography variant="caption" color={Colors.text.tertiary}>
            out of 100
          </Typography>
        </View>
      </View>
      
      {latestAnalysis?.imageUrl && (
        <Image 
          source={{ uri: latestAnalysis.imageUrl }} 
          style={styles.analysisImage} 
        />
      )}
      
      <View style={styles.dateContainer}>
        <Typography variant="caption" color={Colors.text.tertiary}>
          {latestAnalysis ? formatDate(new Date(latestAnalysis.date)) : 'No date available'}
        </Typography>
      </View>
      
      <View style={styles.concernsList}>
        <Typography variant="h4" style={styles.concernsTitle}>
          Identified Concerns
        </Typography>
        
        {latestAnalysis?.concerns.map(concern => (
          <View key={concern.id} style={styles.concernItem}>
            <View style={styles.concernIcon}>
              <AlertCircle size={16} color={
                concern.severity === 'high' 
                  ? Colors.error.default 
                  : concern.severity === 'medium'
                  ? Colors.warning.default
                  : Colors.success.default
              } />
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
      
      <Button
        label="View Full Analysis"
        variant="outline"
        size="md"
        style={styles.viewButton}
        onPress={() => {/* Navigate to detailed analysis */}}
      />
    </Card>
  );
  
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.primary.light, Colors.background.primary]}
        style={styles.headerGradient}
      />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Typography variant="h2">
              Hello, {user?.fullName?.split(' ')[0] || 'there'}!
            </Typography>
            <Typography variant="body" style={styles.headerSubtitle}>
              Welcome to your skincare journey
            </Typography>
          </View>
        </View>
        
        <View style={styles.content}>
          {latestAnalysis ? renderAnalysisSummary() : renderEmptyAnalysis()}
          
          <Card style={styles.tipCard}>
            <View style={styles.tipHeader}>
              <Typography variant="h4">
                Daily Tip
              </Typography>
              <Droplets size={20} color={Colors.primary.default} />
            </View>
            
            <Typography variant="body" style={styles.tipTitle}>
              {currentTip.title}
            </Typography>
            
            <Typography variant="bodySmall" style={styles.tipContent}>
              {currentTip.content}
            </Typography>
          </Card>
          
          <Card style={styles.routineCard}>
            <View style={styles.routineHeader}>
              <Typography variant="h4">
                Today's Routine
              </Typography>
              <Clock size={20} color={Colors.primary.default} />
            </View>
            
            <View style={styles.routineContent}>
              <View style={styles.routineSection}>
                <Typography variant="bodySmall" style={styles.routineTime}>
                  MORNING
                </Typography>
                <View style={styles.routineSteps}>
                  <Typography variant="body">1. Gentle Cleanser</Typography>
                  <Typography variant="body">2. Vitamin C Serum</Typography>
                  <Typography variant="body">3. Moisturizer</Typography>
                  <Typography variant="body">4. Sunscreen</Typography>
                </View>
              </View>
              
              <View style={styles.routineSection}>
                <Typography variant="bodySmall" style={styles.routineTime}>
                  EVENING
                </Typography>
                <View style={styles.routineSteps}>
                  <Typography variant="body">1. Cleansing Oil</Typography>
                  <Typography variant="body">2. Foaming Cleanser</Typography>
                  <Typography variant="body">3. Retinol Serum</Typography>
                  <Typography variant="body">4. Night Cream</Typography>
                </View>
              </View>
            </View>
            
            <Button
              label="Edit Routine"
              variant="outline"
              size="sm"
              style={styles.routineButton}
              onPress={() => {/* Navigate to routine editor */}}
            />
          </Card>
        </View>
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
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerSubtitle: {
    opacity: 0.8,
    marginTop: 4,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  emptyAnalysisCard: {
    alignItems: 'center',
    padding: 24,
    marginBottom: 24,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.neutral.lightest,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.8,
  },
  scanButton: {
    paddingHorizontal: 32,
  },
  analysisCard: {
    marginBottom: 24,
    overflow: 'hidden',
  },
  analysisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  analysisImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  dateContainer: {
    marginBottom: 16,
  },
  concernsList: {
    marginBottom: 16,
  },
  concernsTitle: {
    marginBottom: 12,
  },
  concernItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  concernIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  concernDetails: {
    flex: 1,
  },
  concernName: {
    fontWeight: '500',
    marginBottom: 2,
  },
  concernDescription: {
    opacity: 0.8,
  },
  viewButton: {
    alignSelf: 'center',
  },
  tipCard: {
    marginBottom: 24,
  },
  tipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  tipContent: {
    opacity: 0.8,
  },
  routineCard: {
    marginBottom: 24,
  },
  routineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  routineContent: {
    marginBottom: 16,
  },
  routineSection: {
    marginBottom: 16,
  },
  routineTime: {
    color: Colors.primary.default,
    fontWeight: '600',
    marginBottom: 8,
  },
  routineSteps: {
    gap: 8,
  },
  routineButton: {
    alignSelf: 'center',
  },
});
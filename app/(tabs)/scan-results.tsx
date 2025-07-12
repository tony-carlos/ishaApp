// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
  RefreshControl,
  Share,
  Modal,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../constants/Colors';
import {
  FaceAnalysisResult,
  advancedFaceAnalysis,
} from '../../services/AdvancedFaceAnalysis';
import { FaceAnalysisResults } from '../../components/FaceAnalysisResults';

const { width } = Dimensions.get('window');

interface AnalysisHistory {
  id: string;
  result: FaceAnalysisResult;
  date: string;
  nickname?: string;
}

type FilterType = 'all' | 'recent' | 'best' | 'concerns';
type SortType = 'date' | 'score' | 'name';

export default function ScanResultsScreen() {
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedResult, setSelectedResult] =
    useState<FaceAnalysisResult | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortType, setSortType] = useState<SortType>('date');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>(
    []
  );
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    loadAnalysisHistory();
  }, []);

  const loadAnalysisHistory = async () => {
    try {
      setLoading(true);
      const stored = await AsyncStorage.getItem('analysis_history');
      if (stored) {
        const history: AnalysisHistory[] = JSON.parse(stored);
        setAnalysisHistory(history);
      }
    } catch (error) {
      console.error('Error loading analysis history:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnalysisHistory();
    setRefreshing(false);
  };

  const filteredAndSortedHistory = useMemo(() => {
    let filtered = analysisHistory;

    // Apply filters
    switch (filterType) {
      case 'recent':
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        filtered = filtered.filter((item) => new Date(item.date) > oneWeekAgo);
        break;
      case 'best':
        filtered = filtered.filter(
          (item) => item.result.skinAnalysis.overall.overallHealth >= 80
        );
        break;
      case 'concerns':
        filtered = filtered.filter(
          (item) => item.result.skinAnalysis.overall.overallHealth < 60
        );
        break;
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortType) {
        case 'date':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'score':
          return (
            b.result.skinAnalysis.overall.overallHealth -
            a.result.skinAnalysis.overall.overallHealth
          );
        case 'name':
          return (a.nickname || 'Unnamed').localeCompare(
            b.nickname || 'Unnamed'
          );
        default:
          return 0;
      }
    });

    return filtered;
  }, [analysisHistory, filterType, sortType]);

  const deleteAnalysis = async (id: string) => {
    Alert.alert(
      'Delete Analysis',
      'Are you sure you want to delete this face analysis?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedHistory = analysisHistory.filter(
              (item) => item.id !== id
            );
            setAnalysisHistory(updatedHistory);
            await AsyncStorage.setItem(
              'analysis_history',
              JSON.stringify(updatedHistory)
            );
          },
        },
      ]
    );
  };

  const exportAnalysis = async (analysis: AnalysisHistory) => {
    try {
      const exportData = {
        date: analysis.date,
        nickname: analysis.nickname,
        faceShape: analysis.result.faceAttributes.faceShape.type,
        skinType: analysis.result.skinAnalysis.overall.skinType,
        overallHealth: analysis.result.skinAnalysis.overall.overallHealth,
        confidence: analysis.result.confidence,
        recommendations:
          analysis.result.skinAnalysis.overall.recommendedTreatments,
      };

      await Share.share({
        message: `Face Analysis Report - ${
          analysis.nickname || 'Analysis'
        }\n\n${JSON.stringify(exportData, null, 2)}`,
      });
    } catch (error) {
      console.error('Error exporting analysis:', error);
    }
  };

  const toggleComparison = (id: string) => {
    if (selectedForComparison.includes(id)) {
      setSelectedForComparison((prev) => prev.filter((item) => item !== id));
    } else if (selectedForComparison.length < 2) {
      setSelectedForComparison((prev) => [...prev, id]);
    } else {
      Alert.alert(
        'Comparison Limit',
        'You can only compare up to 2 analyses at a time.'
      );
    }
  };

  const renderAnalysisCard = (item: AnalysisHistory) => {
    const isSelected = selectedForComparison.includes(item.id);
    const overallScore = item.result.skinAnalysis.overall.overallHealth;
    const scoreColor =
      overallScore >= 80
        ? Colors.success
        : overallScore >= 60
        ? Colors.warning
        : Colors.error;

    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.analysisCard as ViewStyle,
          isSelected && (styles.selectedCard as ViewStyle),
        ]}
        onPress={() => {
          setSelectedResult(item.result);
          setShowDetailModal(true);
        }}
        onLongPress={() => toggleComparison(item.id)}
      >
        <LinearGradient
          colors={['rgba(255,255,255,1)', 'rgba(248,250,252,1)']}
          style={styles.cardGradient}
        >
          {/* Header */}
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Text style={styles.cardTitle}>
                {item.nickname || `Analysis ${item.id.slice(-4)}`}
              </Text>
              <Text style={styles.cardDate}>
                {new Date(item.date).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => exportAnalysis(item)}
              >
                <Ionicons
                  name="share-outline"
                  size={16}
                  color={Colors.primary.default}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => deleteAnalysis(item.id)}
              >
                <Ionicons name="trash-outline" size={16} color={Colors.error} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Image */}
          <Image
            source={{ uri: item.result.analysisImages.originalImage }}
            style={styles.cardImage}
          />

          {/* Stats */}
          <View style={styles.cardStats}>
            <View style={styles.statItem}>
              <View
                style={[styles.scoreIndicator, { backgroundColor: scoreColor }]}
              >
                <Text style={styles.scoreText}>{overallScore}</Text>
              </View>
              <Text style={styles.statLabel}>Health Score</Text>
            </View>

            <View style={styles.statItem}>
              <Ionicons name="person" size={16} color={Colors.textSecondary} />
              <Text style={styles.statValue}>
                {item.result.faceAttributes.faceShape.type}
              </Text>
              <Text style={styles.statLabel}>Face Shape</Text>
            </View>

            <View style={styles.statItem}>
              <Ionicons name="water" size={16} color={Colors.textSecondary} />
              <Text style={styles.statValue}>
                {item.result.skinAnalysis.overall.skinType}
              </Text>
              <Text style={styles.statLabel}>Skin Type</Text>
            </View>
          </View>

          {/* Top Concerns Preview */}
          <View style={styles.concernsPreview}>
            <Text style={styles.concernsTitle}>Top Concerns:</Text>
            <View style={styles.concernsTags}>
              {getTopConcerns(item.result)
                .slice(0, 3)
                .map((concern, index) => (
                  <View key={index} style={styles.concernTag}>
                    <Text style={styles.concernTagText}>{concern.name}</Text>
                  </View>
                ))}
            </View>
          </View>

          {/* Selection Indicator */}
          {isSelected && (
            <View style={styles.selectionOverlay}>
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={Colors.primary}
              />
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderFilterModal = () => (
    <Modal visible={showFilters} animationType="slide" transparent>
      <BlurView intensity={80} style={styles.modalOverlay}>
        <View style={styles.filterModal}>
          <View style={styles.filterHeader}>
            <Text style={styles.filterTitle}>Filter & Sort</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Ionicons name="close" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Filters */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Filter by:</Text>
            <View style={styles.filterOptions}>
              {[
                { key: 'all', label: 'All Results' },
                { key: 'recent', label: 'Recent (7 days)' },
                { key: 'best', label: 'Best Scores (80+)' },
                { key: 'concerns', label: 'Needs Attention (<60)' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.filterOption,
                    filterType === option.key && styles.filterOptionActive,
                  ]}
                  onPress={() => setFilterType(option.key as FilterType)}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      filterType === option.key &&
                        styles.filterOptionTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Sort Options */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Sort by:</Text>
            <View style={styles.filterOptions}>
              {[
                { key: 'date', label: 'Date', icon: 'calendar' },
                { key: 'score', label: 'Health Score', icon: 'star' },
                { key: 'name', label: 'Name', icon: 'text' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.sortOption,
                    sortType === option.key && styles.sortOptionActive,
                  ]}
                  onPress={() => setSortType(option.key as SortType)}
                >
                  <Ionicons
                    name={option.icon as any}
                    size={16}
                    color={
                      sortType === option.key
                        ? Colors.white
                        : Colors.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.sortOptionText,
                      sortType === option.key && styles.sortOptionTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </BlurView>
    </Modal>
  );

  const renderComparisonView = () => {
    if (selectedForComparison.length !== 2) return null;

    const analysis1 = analysisHistory.find(
      (item) => item.id === selectedForComparison[0]
    );
    const analysis2 = analysisHistory.find(
      (item) => item.id === selectedForComparison[1]
    );

    if (!analysis1 || !analysis2) return null;

    return (
      <Modal visible={showComparison} animationType="slide">
        <View style={styles.comparisonContainer}>
          <View style={styles.comparisonHeader}>
            <Text style={styles.comparisonTitle}>Analysis Comparison</Text>
            <TouchableOpacity onPress={() => setShowComparison(false)}>
              <Ionicons name="close" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.comparisonContent}>
            {/* Images Comparison */}
            <View style={styles.imagesComparison}>
              <View style={styles.comparisonImageContainer}>
                <Image
                  source={{
                    uri: analysis1.result.analysisImages.originalImage,
                  }}
                  style={styles.comparisonImage}
                />
                <Text style={styles.comparisonImageLabel}>
                  {analysis1.nickname || 'Analysis 1'}
                </Text>
                <Text style={styles.comparisonImageDate}>
                  {new Date(analysis1.date).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.comparisonImageContainer}>
                <Image
                  source={{
                    uri: analysis2.result.analysisImages.originalImage,
                  }}
                  style={styles.comparisonImage}
                />
                <Text style={styles.comparisonImageLabel}>
                  {analysis2.nickname || 'Analysis 2'}
                </Text>
                <Text style={styles.comparisonImageDate}>
                  {new Date(analysis2.date).toLocaleDateString()}
                </Text>
              </View>
            </View>

            {/* Scores Comparison */}
            <View style={styles.scoresComparison}>
              <Text style={styles.comparisonSectionTitle}>Health Scores</Text>
              <View style={styles.scoresGrid}>
                <View style={styles.scoreComparison}>
                  <Text style={styles.scoreLabel}>Overall Health</Text>
                  <View style={styles.scoreValues}>
                    <Text style={styles.scoreValue}>
                      {analysis1.result.skinAnalysis.overall.overallHealth}
                    </Text>
                    <Text style={styles.scoreVs}>vs</Text>
                    <Text style={styles.scoreValue}>
                      {analysis2.result.skinAnalysis.overall.overallHealth}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Attributes Comparison */}
            <View style={styles.attributesComparison}>
              <Text style={styles.comparisonSectionTitle}>
                Facial Attributes
              </Text>
              <View style={styles.attributeRow}>
                <Text style={styles.attributeLabel}>Face Shape</Text>
                <Text style={styles.attributeValue}>
                  {analysis1.result.faceAttributes.faceShape.type}
                </Text>
                <Text style={styles.attributeValue}>
                  {analysis2.result.faceAttributes.faceShape.type}
                </Text>
              </View>
              <View style={styles.attributeRow}>
                <Text style={styles.attributeLabel}>Skin Type</Text>
                <Text style={styles.attributeValue}>
                  {analysis1.result.skinAnalysis.overall.skinType}
                </Text>
                <Text style={styles.attributeValue}>
                  {analysis2.result.skinAnalysis.overall.skinType}
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    );
  };

  const getTopConcerns = (result: FaceAnalysisResult) => {
    const concerns: Array<{ name: string; score: number }> = [];

    if (result.skinAnalysis.hd) {
      concerns.push(
        { name: 'Pores', score: result.skinAnalysis.hd.hd_pore.whole.ui_score },
        {
          name: 'Wrinkles',
          score: result.skinAnalysis.hd.hd_wrinkle.whole.ui_score,
        },
        { name: 'Acne', score: result.skinAnalysis.hd.hd_acne.whole.ui_score }
      );
    }

    return concerns.sort((a, b) => a.score - b.score);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analysis History</Text>
        <View style={styles.headerActions}>
          {selectedForComparison.length === 2 && (
            <TouchableOpacity
              style={styles.compareButton}
              onPress={() => setShowComparison(true)}
            >
              <Ionicons name="git-compare" size={20} color={Colors.primary} />
              <Text style={styles.compareButtonText}>Compare</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(true)}
          >
            <Ionicons name="filter" size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Summary */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{analysisHistory.length}</Text>
          <Text style={styles.statText}>Total Scans</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {analysisHistory.length > 0
              ? Math.round(
                  analysisHistory.reduce(
                    (sum, item) =>
                      sum + item.result.skinAnalysis.overall.overallHealth,
                    0
                  ) / analysisHistory.length
                )
              : 0}
          </Text>
          <Text style={styles.statText}>Avg Score</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {
              analysisHistory.filter(
                (item) => item.result.skinAnalysis.overall.overallHealth >= 80
              ).length
            }
          </Text>
          <Text style={styles.statText}>Excellent</Text>
        </View>
      </View>

      {/* Analysis List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Loading analysis history...</Text>
          </View>
        ) : filteredAndSortedHistory.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="analytics-outline"
              size={64}
              color={Colors.textSecondary}
            />
            <Text style={styles.emptyTitle}>No Analysis Found</Text>
            <Text style={styles.emptyText}>
              {analysisHistory.length === 0
                ? 'Take your first face scan to see results here'
                : 'No results match your current filters'}
            </Text>
          </View>
        ) : (
          filteredAndSortedHistory.map((item) => renderAnalysisCard(item))
        )}
      </ScrollView>

      {/* Filter Modal */}
      {renderFilterModal()}

      {/* Comparison Modal */}
      {renderComparisonView()}

      {/* Detail Modal */}
      {selectedResult && (
        <FaceAnalysisResults
          result={selectedResult}
          visible={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedResult(null);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 10,
  },
  compareButtonText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  filterButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    justifyContent: 'space-around',
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 15,
    minWidth: 80,
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  analysisCard: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  cardGradient: {
    padding: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  cardHeaderLeft: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  cardDate: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  cardActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  cardImage: {
    width: '100%',
    height: 200,
    borderRadius: 15,
    marginBottom: 15,
  },
  cardStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  scoreIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  scoreText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  statValue: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  concernsPreview: {
    marginBottom: 10,
  },
  concernsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  concernsTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  concernTag: {
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginRight: 6,
    marginBottom: 4,
  },
  concernTagText: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  selectionOverlay: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  filterModal: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  filterTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  filterSection: {
    marginBottom: 30,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 15,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterOption: {
    backgroundColor: Colors.background,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  filterOptionActive: {
    backgroundColor: Colors.primary,
  },
  filterOptionText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  filterOptionTextActive: {
    color: Colors.white,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  sortOptionActive: {
    backgroundColor: Colors.primary,
  },
  sortOptionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 6,
  },
  sortOptionTextActive: {
    color: Colors.white,
  },
  comparisonContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  comparisonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  comparisonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  comparisonContent: {
    flex: 1,
    padding: 20,
  },
  imagesComparison: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  comparisonImageContainer: {
    width: '48%',
    alignItems: 'center',
  },
  comparisonImage: {
    width: '100%',
    height: 200,
    borderRadius: 15,
    marginBottom: 10,
  },
  comparisonImageLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  comparisonImageDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  scoresComparison: {
    marginBottom: 30,
  },
  comparisonSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 15,
  },
  scoresGrid: {
    backgroundColor: Colors.surface,
    padding: 15,
    borderRadius: 15,
  },
  scoreComparison: {
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  scoreValues: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginHorizontal: 20,
  },
  scoreVs: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  attributesComparison: {
    marginBottom: 30,
  },
  attributeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  attributeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
  },
  attributeValue: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
    textAlign: 'center',
  },
});

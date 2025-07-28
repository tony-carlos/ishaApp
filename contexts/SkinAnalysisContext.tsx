import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { SkinAnalysis } from '@/types';
import apiService from '@/utils/api';
import { useUser } from './UserContext';

interface SkinAnalysisContextType {
  analyses: SkinAnalysis[];
  latestAnalysis: SkinAnalysis | null;
  addAnalysis: (analysis: Omit<SkinAnalysis, 'id' | 'userId'>) => Promise<void>;
  getAnalysisByDate: (date: string) => SkinAnalysis | undefined;
  isLoading: boolean;
  refreshAnalyses: () => Promise<void>;
}

const SkinAnalysisContext = createContext<SkinAnalysisContextType | undefined>(
  undefined
);

export function SkinAnalysisProvider({ children }: { children: ReactNode }) {
  const [analyses, setAnalyses] = useState<SkinAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated } = useUser();

  // Get the latest analysis
  const latestAnalysis =
    analyses.length > 0
      ? analyses.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )[0]
      : null;

  const loadAnalyses = async () => {
    if (!isAuthenticated || !user?.id) return;

    try {
      setIsLoading(true);
      const response = await apiService.getSkinAnalyses(user.id);
      if (response.success && response.data) {
        setAnalyses(response.data);
      }
    } catch (error) {
      console.error('Failed to load skin analyses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAnalyses = async () => {
    await loadAnalyses();
  };

  // Load analyses when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      loadAnalyses();
    } else {
      setAnalyses([]);
    }
  }, [isAuthenticated, user]);

  const addAnalysis = async (
    analysisData: Omit<SkinAnalysis, 'id' | 'userId'>
  ) => {
    if (!user) {
      console.warn('User not authenticated, storing analysis locally only');
    }

    try {
      // Create a complete analysis object for local storage
      const completeAnalysis: SkinAnalysis = {
        id: `analysis_${Date.now()}`,
        userId: user?.id || 'anonymous',
        ...analysisData,
      };

      // Add to local state immediately
      setAnalyses((prev) => [completeAnalysis, ...prev]);

      console.log('✅ Analysis added to local storage successfully');

      // Try to save to backend in the background (don't block on this)
      if (user?.id) {
        try {
          // Prepare backend-compatible data structure
          const backendData = {
            user_id: user.id,
            image_url: analysisData.imageUrl,
            overall_health: analysisData.overallHealth,
            analysis_date: analysisData.date,
            // Convert concerns to JSON string for backend
            concerns: JSON.stringify(analysisData.concerns || []),
            // Convert recommendations to JSON string for backend
            recommendations: JSON.stringify(analysisData.recommendations || []),
            // Add optional comprehensive data as JSON
            skin_type: (analysisData as any).skinType || null,
            hd_analysis: JSON.stringify((analysisData as any).hdAnalysis || {}),
            skin_tone: JSON.stringify((analysisData as any).skinTone || {}),
            facial_features: JSON.stringify(
              (analysisData as any).facialFeatures || {}
            ),
            age_estimation: JSON.stringify(
              (analysisData as any).ageEstimation || {}
            ),
            expression_analysis: JSON.stringify(
              (analysisData as any).expressionAnalysis || {}
            ),
          };

          const response = await apiService.createSkinAnalysis(backendData);

          if (response.success) {
            console.log('✅ Analysis also saved to backend');
          }
        } catch (backendError) {
          console.warn(
            '⚠️ Failed to save to backend, but analysis is stored locally:',
            backendError
          );
        }
      }
    } catch (error) {
      console.error('Failed to add skin analysis:', error);
      throw new Error('Failed to add skin analysis');
    }
  };

  const getAnalysisByDate = (date: string) => {
    return analyses.find((analysis) => analysis.date === date);
  };

  return (
    <SkinAnalysisContext.Provider
      value={{
        analyses,
        latestAnalysis,
        addAnalysis,
        getAnalysisByDate,
        isLoading,
        refreshAnalyses,
      }}
    >
      {children}
    </SkinAnalysisContext.Provider>
  );
}

export function useSkinAnalysis() {
  const context = useContext(SkinAnalysisContext);
  if (context === undefined) {
    throw new Error(
      'useSkinAnalysis must be used within a SkinAnalysisProvider'
    );
  }
  return context;
}

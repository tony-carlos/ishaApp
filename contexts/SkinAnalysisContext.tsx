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
    if (!user) throw new Error('User not authenticated');

    try {
      setIsLoading(true);

      // Create FormData for image upload
      const formData = new FormData();
      formData.append('user_id', user.id);
      formData.append('concerns', JSON.stringify(analysisData.concerns));
      formData.append(
        'recommendations',
        JSON.stringify(analysisData.recommendations)
      );
      formData.append('overall_health', analysisData.overallHealth.toString());

      // If there's an image URL, we need to handle it differently
      if (analysisData.imageUrl) {
        // For now, we'll use the analyzeImage endpoint which handles image upload
        // This is a simplified version - in production you'd handle the image properly
        const response = await apiService.createSkinAnalysis({
          user_id: user.id,
          image_url: analysisData.imageUrl,
          concerns: analysisData.concerns,
          recommendations: analysisData.recommendations,
          overall_health: analysisData.overallHealth,
          analysis_date: new Date().toISOString(),
        });

        if (response.success) {
          await refreshAnalyses(); // Reload analyses from server
        }
      }
    } catch (error) {
      console.error('Failed to add skin analysis:', error);
      throw new Error('Failed to add skin analysis');
    } finally {
      setIsLoading(false);
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

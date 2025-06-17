import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SkinAnalysis } from '@/types';

interface SkinAnalysisContextType {
  analyses: SkinAnalysis[];
  latestAnalysis: SkinAnalysis | null;
  addAnalysis: (analysis: SkinAnalysis) => Promise<void>;
  getAnalysisByDate: (date: string) => SkinAnalysis | undefined;
  isLoading: boolean;
}

const SkinAnalysisContext = createContext<SkinAnalysisContextType | undefined>(undefined);

export function SkinAnalysisProvider({ children }: { children: ReactNode }) {
  const [analyses, setAnalyses] = useState<SkinAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get the latest analysis
  const latestAnalysis = analyses.length > 0 
    ? analyses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] 
    : null;

  const loadAnalyses = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('skinAnalyses');
      if (jsonValue) {
        setAnalyses(JSON.parse(jsonValue));
      }
    } catch (error) {
      console.error('Failed to load skin analyses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load analyses from AsyncStorage on mount
  useEffect(() => {
    loadAnalyses();
  }, []);

  const addAnalysis = async (analysis: SkinAnalysis) => {
    try {
      const updatedAnalyses = [...analyses, analysis];
      await AsyncStorage.setItem('skinAnalyses', JSON.stringify(updatedAnalyses));
      setAnalyses(updatedAnalyses);
    } catch (error) {
      console.error('Failed to add skin analysis:', error);
      throw new Error('Failed to add skin analysis');
    }
  };

  const getAnalysisByDate = (date: string) => {
    return analyses.find(analysis => analysis.date === date);
  };

  return (
    <SkinAnalysisContext.Provider
      value={{
        analyses,
        latestAnalysis,
        addAnalysis,
        getAnalysisByDate,
        isLoading,
      }}
    >
      {children}
    </SkinAnalysisContext.Provider>
  );
}

export function useSkinAnalysis() {
  const context = useContext(SkinAnalysisContext);
  if (context === undefined) {
    throw new Error('useSkinAnalysis must be used within a SkinAnalysisProvider');
  }
  return context;
}
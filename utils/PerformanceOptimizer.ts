import { ImageManipulator } from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

export interface PerformanceMetrics {
  analysisTime: number;
  memoryUsage: number;
  cacheHitRate: number;
  imageOptimizationTime: number;
  errorRate: number;
}

export interface OptimizationOptions {
  maxImageSize: number;
  compressionQuality: number;
  enableCaching: boolean;
  maxCacheSize: number;
  enableMemoryOptimization: boolean;
}

export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private metrics: PerformanceMetrics = {
    analysisTime: 0,
    memoryUsage: 0,
    cacheHitRate: 0,
    imageOptimizationTime: 0,
    errorRate: 0,
  };

  private performanceHistory: PerformanceMetrics[] = [];
  private readonly maxHistorySize = 100;

  public static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  private constructor() {}

  /**
   * Optimize image for analysis based on target requirements
   */
  async optimizeImage(
    imageUri: string,
    options: OptimizationOptions = {
      maxImageSize: 1024,
      compressionQuality: 0.8,
      enableCaching: true,
      maxCacheSize: 50,
      enableMemoryOptimization: true,
    }
  ): Promise<string> {
    const startTime = Date.now();

    try {
      // Get image info
      const imageInfo = await FileSystem.getInfoAsync(imageUri);
      if (!imageInfo.exists) {
        throw new Error('Image file does not exist');
      }

      // Check if optimization is needed
      const needsOptimization = await this.checkIfOptimizationNeeded(
        imageUri,
        options
      );
      if (!needsOptimization) {
        return imageUri;
      }

      // Perform optimization
      const optimizedImage = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: options.maxImageSize } }],
        {
          compress: options.compressionQuality,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: false,
        }
      );

      // Update metrics
      this.metrics.imageOptimizationTime = Date.now() - startTime;

      return optimizedImage.uri;
    } catch (error) {
      console.error('Image optimization failed:', error);
      return imageUri; // Return original if optimization fails
    }
  }

  /**
   * Check if image needs optimization
   */
  private async checkIfOptimizationNeeded(
    imageUri: string,
    options: OptimizationOptions
  ): Promise<boolean> {
    try {
      const imageInfo = await FileSystem.getInfoAsync(imageUri);
      if (imageInfo.exists) {
        const fileSizeKB = imageInfo.size / 1024;

        // Check file size (optimize if > 2MB)
        if (fileSizeKB > 2048) {
          return true;
        }
      }

      // For more detailed checks, we'd need to get image dimensions
      // This is a simplified check based on file size
      return false;
    } catch (error) {
      console.warn('Could not check image optimization needs:', error);
      return false;
    }
  }

  /**
   * Monitor memory usage during analysis
   */
  startMemoryMonitoring(): void {
    // In a real implementation, this would use native memory monitoring
    // For now, we'll simulate memory tracking
    const memoryInterval = setInterval(() => {
      // Simulated memory usage tracking
      this.metrics.memoryUsage = Math.random() * 100; // 0-100MB
    }, 1000);

    // Clean up after 30 seconds
    setTimeout(() => {
      clearInterval(memoryInterval);
    }, 30000);
  }

  /**
   * Track analysis performance
   */
  trackAnalysisPerformance(analysisTime: number, success: boolean): void {
    this.metrics.analysisTime = analysisTime;

    // Update error rate
    const recentAnalyses = this.performanceHistory.slice(-20);
    const errorCount = recentAnalyses.filter((m) => m.errorRate > 0).length;
    this.metrics.errorRate = success ? 0 : errorCount / recentAnalyses.length;

    // Store in history
    this.addToHistory({ ...this.metrics });
  }

  /**
   * Calculate cache hit rate
   */
  updateCacheHitRate(hits: number, total: number): void {
    this.metrics.cacheHitRate = total > 0 ? hits / total : 0;
  }

  /**
   * Get current performance metrics
   */
  getCurrentMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Get performance history
   */
  getPerformanceHistory(): PerformanceMetrics[] {
    return [...this.performanceHistory];
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats(): {
    averageAnalysisTime: number;
    averageMemoryUsage: number;
    averageCacheHitRate: number;
    averageErrorRate: number;
    performanceTrend: 'improving' | 'stable' | 'declining';
  } {
    if (this.performanceHistory.length === 0) {
      return {
        averageAnalysisTime: 0,
        averageMemoryUsage: 0,
        averageCacheHitRate: 0,
        averageErrorRate: 0,
        performanceTrend: 'stable',
      };
    }

    const recent = this.performanceHistory.slice(-10);
    const older = this.performanceHistory.slice(-20, -10);

    const recentAvgTime =
      recent.reduce((sum, m) => sum + m.analysisTime, 0) / recent.length;
    const olderAvgTime =
      older.length > 0
        ? older.reduce((sum, m) => sum + m.analysisTime, 0) / older.length
        : recentAvgTime;

    let trend: 'improving' | 'stable' | 'declining' = 'stable';
    if (recentAvgTime < olderAvgTime * 0.9) {
      trend = 'improving';
    } else if (recentAvgTime > olderAvgTime * 1.1) {
      trend = 'declining';
    }

    return {
      averageAnalysisTime: recentAvgTime,
      averageMemoryUsage:
        recent.reduce((sum, m) => sum + m.memoryUsage, 0) / recent.length,
      averageCacheHitRate:
        recent.reduce((sum, m) => sum + m.cacheHitRate, 0) / recent.length,
      averageErrorRate:
        recent.reduce((sum, m) => sum + m.errorRate, 0) / recent.length,
      performanceTrend: trend,
    };
  }

  /**
   * Clean up temporary files and optimize memory
   */
  async cleanup(): Promise<void> {
    try {
      // Clean up temporary image files
      const tempDir = `${FileSystem.cacheDirectory}face-analysis/`;
      const tempDirInfo = await FileSystem.getInfoAsync(tempDir);

      if (tempDirInfo.exists) {
        await FileSystem.deleteAsync(tempDir, { idempotent: true });
      }

      // Reset metrics
      this.metrics = {
        analysisTime: 0,
        memoryUsage: 0,
        cacheHitRate: 0,
        imageOptimizationTime: 0,
        errorRate: 0,
      };
    } catch (error) {
      console.warn('Cleanup failed:', error);
    }
  }

  /**
   * Get optimization recommendations
   */
  getOptimizationRecommendations(): string[] {
    const recommendations: string[] = [];
    const stats = this.getPerformanceStats();

    if (stats.averageAnalysisTime > 5000) {
      recommendations.push(
        'Consider reducing image resolution to improve analysis speed'
      );
    }

    if (stats.averageMemoryUsage > 80) {
      recommendations.push(
        'High memory usage detected - consider clearing cache more frequently'
      );
    }

    if (stats.averageCacheHitRate < 0.5) {
      recommendations.push(
        'Low cache hit rate - consider increasing cache size'
      );
    }

    if (stats.averageErrorRate > 0.1) {
      recommendations.push(
        'High error rate detected - check image quality and lighting conditions'
      );
    }

    if (stats.performanceTrend === 'declining') {
      recommendations.push(
        'Performance is declining - consider system optimization'
      );
    }

    if (recommendations.length === 0) {
      recommendations.push('System is performing optimally');
    }

    return recommendations;
  }

  /**
   * Export performance data for analysis
   */
  exportPerformanceData(): string {
    const data = {
      currentMetrics: this.metrics,
      performanceHistory: this.performanceHistory,
      statistics: this.getPerformanceStats(),
      recommendations: this.getOptimizationRecommendations(),
      exportTime: new Date().toISOString(),
    };

    return JSON.stringify(data, null, 2);
  }

  /**
   * Add metrics to history
   */
  private addToHistory(metrics: PerformanceMetrics): void {
    this.performanceHistory.push(metrics);

    // Keep only recent history
    if (this.performanceHistory.length > this.maxHistorySize) {
      this.performanceHistory.shift();
    }
  }

  /**
   * Reset all performance data
   */
  reset(): void {
    this.metrics = {
      analysisTime: 0,
      memoryUsage: 0,
      cacheHitRate: 0,
      imageOptimizationTime: 0,
      errorRate: 0,
    };
    this.performanceHistory = [];
  }
}

export default PerformanceOptimizer;

/**
 * PerfectCorp Skincare Analysis Service
 * Integrates with PerfectCorp's YouCam Online Editor AI API for skincare analysis
 * Works alongside the Python FastAPI system for comparison
 */

import { Alert } from 'react-native';
// Removed NodeRSA import to fix React Native compatibility

export interface PerfectCorpAnalysisResult {
  success: boolean;
  data?: {
    skinType: string;
    skinTone: {
      category: string;
      hex: string;
      rgb: { r: number; g: number; b: number };
      undertone: string;
    };
    overallHealth: number;
    concerns: Array<{
      id: string;
      name: string;
      severity: 'low' | 'medium' | 'high';
      description: string;
      score: number;
      confidence: number;
    }>;
    recommendations: Array<{
      id: string;
      type: 'product' | 'routine' | 'habit';
      description: string;
      priority: 'low' | 'medium' | 'high';
    }>;
    hdAnalysis: {
      redness: number;
      oiliness: number;
      ageSpots: number;
      radiance: number;
      moisture: number;
      darkCircles: number;
      eyeBags: number;
      firmness: number;
      texture: number;
      acne: number;
      pores: number;
      wrinkles: number;
    };
    perfectCorpScore: number;
    analysisTimestamp: string;
  };
  error?: string;
  source: 'perfectcorp';
}

export interface PerfectCorpConfig {
  clientId: string;
  clientSecret: string;
  baseUrl: string;
  timeout: number;
}

class PerfectCorpAnalysisService {
  private config: PerfectCorpConfig;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    this.config = {
      clientId:
        process.env.EXPO_PUBLIC_PERFECTCORP_CLIENT_ID ||
        'Dah7ni74qwEHW9yTpE1VFXE8T1apiyzy',
      clientSecret:
        process.env.EXPO_PUBLIC_PERFECTCORP_CLIENT_SECRET ||
        'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCKJYsZ+bBk2USOgASmjucP5ZVCANu0lHb5vSICbFtFczvo3u3N1emcLCJHeLav72en/gCeuKPpWpk0Xu9CXPB+mksIul2J0NOMYEpF/h+4rQpkxGKPhNr/jFW8lMLVuYuvjLQsUyPQAvcrbKmG4C0s3tC08M/Rfn3x+IrKFUR+5wIDAQAB',
      baseUrl: 'https://yce-api-01.perfectcorp.com',
      timeout: 30000,
    };
  }

  /**
   * Authenticate with PerfectCorp API using simplified authentication
   * Note: RSA encryption removed for React Native compatibility
   */
  private async authenticate(): Promise<boolean> {
    try {
      // Check if we have a valid token
      if (this.accessToken && Date.now() < this.tokenExpiry) {
        return true;
      }

      // Simplified authentication without RSA encryption
      // In production, you would implement proper RSA encryption on the backend
      const timestamp = new Date().getTime();
      const payload = `client_id=${this.config.clientId}&timestamp=${timestamp}`;

      // For now, use base64 encoding instead of RSA encryption
      // In production, this should be handled by your backend with proper RSA
      const idToken = btoa(payload);

      console.log(
        '🔐 Generated simplified id_token for PerfectCorp authentication'
      );

      // Call the authentication API
      const response = await fetch(`${this.config.baseUrl}/api/auth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: this.config.clientId,
          id_token: idToken,
          grant_type: 'client_credentials',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Authentication failed: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in || 3600) * 1000 - 60000; // 1 minute buffer

      console.log('✅ PerfectCorp authenticated successfully');
      return true;
    } catch (error) {
      console.error('❌ PerfectCorp authentication failed:', error);
      return false;
    }
  }

  /**
   * Check if face is detected in image before analysis
   */
  private async detectFace(imageUri: string): Promise<boolean> {
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'face_detection.jpg',
      } as any);

      const response = await fetch(`${this.config.baseUrl}/api/face/detect`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        return false;
      }

      const result = await response.json();
      return result.faces_detected > 0 && result.confidence > 0.5;
    } catch (error) {
      console.error('PerfectCorp face detection error:', error);
      return false;
    }
  }

  /**
   * Analyze skin using PerfectCorp's Live Diagnostics API
   */
  async analyzeSkin(imageUri: string): Promise<PerfectCorpAnalysisResult> {
    console.log('🔄 Starting PerfectCorp skin analysis...');

    try {
      // Step 1: Authenticate
      const authenticated = await this.authenticate();
      if (!authenticated) {
        throw new Error('Failed to authenticate with PerfectCorp API');
      }

      // Step 2: Detect face first
      const hasFace = await this.detectFace(imageUri);
      if (!hasFace) {
        return {
          success: false,
          error:
            'No face detected in image. Please capture a clear photo of your face.',
          source: 'perfectcorp',
        };
      }

      // Step 3: Perform comprehensive skin analysis
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'skin_analysis.jpg',
      } as any);

      formData.append('analysis_type', 'comprehensive');
      formData.append('include_recommendations', 'true');
      formData.append('hd_analysis', 'true');

      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.config.timeout
      );

      const response = await fetch(
        `${this.config.baseUrl}/api/analysis/comprehensive`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
          body: formData,
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(
          `PerfectCorp API error: ${response.status} ${response.statusText}`
        );
      }

      const analysisData = await response.json();

      // Step 4: Transform PerfectCorp response to our format
      const transformedResult = this.transformPerfectCorpResponse(analysisData);

      console.log('✅ PerfectCorp analysis completed successfully');
      return {
        success: true,
        data: transformedResult,
        source: 'perfectcorp',
      };
    } catch (error: any) {
      console.error('❌ PerfectCorp analysis failed:', error);

      return {
        success: false,
        error: error.message || 'PerfectCorp analysis failed',
        source: 'perfectcorp',
      };
    }
  }

  /**
   * Transform PerfectCorp response to our standardized format
   */
  private transformPerfectCorpResponse(data: any): any {
    try {
      // Extract skin analysis data from PerfectCorp response
      const skinAnalysis = data.skin_analysis || {};
      const faceAnalysis = data.face_analysis || {};

      // Transform HD analysis parameters
      const hdAnalysis = {
        redness: this.mapPerfectCorpScore(skinAnalysis.redness || 0),
        oiliness: this.mapPerfectCorpScore(skinAnalysis.oiliness || 0),
        ageSpots: this.mapPerfectCorpScore(skinAnalysis.age_spots || 0),
        radiance: this.mapPerfectCorpScore(skinAnalysis.radiance || 0),
        moisture: this.mapPerfectCorpScore(skinAnalysis.moisture || 0),
        darkCircles: this.mapPerfectCorpScore(faceAnalysis.dark_circles || 0),
        eyeBags: this.mapPerfectCorpScore(faceAnalysis.eye_bags || 0),
        firmness: this.mapPerfectCorpScore(skinAnalysis.firmness || 0),
        texture: this.mapPerfectCorpScore(skinAnalysis.texture || 0),
        acne: this.mapPerfectCorpScore(skinAnalysis.acne || 0),
        pores: this.mapPerfectCorpScore(skinAnalysis.pores || 0),
        wrinkles: this.mapPerfectCorpScore(faceAnalysis.wrinkles || 0),
      };

      // Extract concerns
      const concerns = this.extractConcerns(hdAnalysis);

      // Generate recommendations based on concerns
      const recommendations = this.generateRecommendations(
        concerns,
        skinAnalysis.skin_type
      );

      // Calculate overall health score
      const overallHealth = this.calculateOverallHealth(hdAnalysis);

      return {
        skinType: skinAnalysis.skin_type || 'Normal',
        skinTone: {
          category: skinAnalysis.skin_tone?.category || 'Medium',
          hex: skinAnalysis.skin_tone?.hex || '#C8A882',
          rgb: skinAnalysis.skin_tone?.rgb || { r: 200, g: 168, b: 130 },
          undertone: skinAnalysis.skin_tone?.undertone || 'Neutral',
        },
        overallHealth,
        concerns,
        recommendations,
        hdAnalysis,
        perfectCorpScore: data.overall_score || overallHealth,
        analysisTimestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error transforming PerfectCorp response:', error);
      throw new Error('Failed to process PerfectCorp analysis results');
    }
  }

  /**
   * Map PerfectCorp scores (0-100) to our UI scale (0-100)
   */
  private mapPerfectCorpScore(score: number): number {
    // PerfectCorp typically returns scores 0-100
    // We'll keep the same scale but ensure it's within bounds
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Extract concerns from HD analysis
   */
  private extractConcerns(hdAnalysis: any): Array<any> {
    const concerns: Array<any> = [];
    const threshold = 40; // Concerns above this score are flagged

    const concernMapping = {
      acne: 'Acne & Blemishes',
      wrinkles: 'Wrinkles & Fine Lines',
      darkCircles: 'Dark Circles',
      pores: 'Enlarged Pores',
      redness: 'Redness & Irritation',
      ageSpots: 'Age Spots & Hyperpigmentation',
      oiliness: 'Excess Oil',
      texture: 'Uneven Texture',
      eyeBags: 'Eye Bags',
      firmness: 'Loss of Firmness',
    };

    Object.entries(hdAnalysis).forEach(([key, value]: [string, any]) => {
      if (
        value > threshold &&
        concernMapping[key as keyof typeof concernMapping]
      ) {
        concerns.push({
          id: `perfectcorp_${key}`,
          name: concernMapping[key as keyof typeof concernMapping],
          severity: value > 70 ? 'high' : value > 55 ? 'medium' : 'low',
          description: `${
            concernMapping[key as keyof typeof concernMapping]
          } detected with ${value}% severity`,
          score: value,
          confidence: 0.85, // PerfectCorp typically has high confidence
        });
      }
    });

    return concerns;
  }

  /**
   * Generate skincare recommendations
   */
  private generateRecommendations(
    concerns: any[],
    skinType: string
  ): Array<any> {
    const recommendations = [];

    // Add concern-specific recommendations
    concerns.forEach((concern, index) => {
      let recommendation = '';
      let priority: 'low' | 'medium' | 'high' = 'medium';

      switch (concern.name) {
        case 'Acne & Blemishes':
          recommendation =
            'Use a gentle salicylic acid cleanser and non-comedogenic moisturizer';
          priority = concern.severity === 'High' ? 'high' : 'medium';
          break;
        case 'Wrinkles & Fine Lines':
          recommendation =
            'Consider retinol-based products and maintain consistent sun protection';
          priority = concern.severity === 'High' ? 'high' : 'medium';
          break;
        case 'Dark Circles':
          recommendation =
            'Use an eye cream with caffeine or vitamin K to improve circulation';
          priority = 'medium';
          break;
        case 'Enlarged Pores':
          recommendation =
            'Use products with niacinamide and maintain gentle exfoliation routine';
          priority = 'medium';
          break;
        default:
          recommendation = `Address ${concern.name.toLowerCase()} with targeted skincare products`;
          priority = 'medium';
      }

      recommendations.push({
        id: `perfectcorp_${index}`,
        type: 'routine' as const,
        description: recommendation,
        priority,
      });
    });

    // Add skin type specific recommendation
    recommendations.push({
      id: 'perfectcorp_skintype',
      type: 'routine' as const,
      description: `For ${skinType} skin: Use products specifically formulated for your skin type`,
      priority: 'high' as const,
    });

    return recommendations;
  }

  /**
   * Calculate overall health score
   */
  private calculateOverallHealth(hdAnalysis: any): number {
    const scores = Object.values(hdAnalysis) as number[];
    const averageProblems =
      scores.reduce((sum, score) => sum + score, 0) / scores.length;

    // Convert to health score (100 - average problems)
    return Math.round(Math.max(0, Math.min(100, 100 - averageProblems)));
  }

  /**
   * Test PerfectCorp API authentication
   */
  async testAuthentication(): Promise<{
    success: boolean;
    message: string;
    token?: string;
  }> {
    try {
      console.log('🧪 Testing PerfectCorp authentication...');

      // Force new authentication
      this.accessToken = null;
      this.tokenExpiry = 0;

      const authenticated = await this.authenticate();
      if (!authenticated) {
        return {
          success: false,
          message: 'Authentication failed - unable to obtain access token',
        };
      }

      return {
        success: true,
        message: 'PerfectCorp authentication successful',
        token: 'token obtained successfully', // Token is available
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Authentication test failed: ${error.message || error}`,
      };
    }
  }

  /**
   * Check service health
   */
  async healthCheck(): Promise<{ healthy: boolean; message: string }> {
    try {
      const authenticated = await this.authenticate();
      if (!authenticated) {
        return { healthy: false, message: 'Authentication failed' };
      }

      return { healthy: true, message: 'PerfectCorp service is healthy' };
    } catch (error) {
      return { healthy: false, message: `Health check failed: ${error}` };
    }
  }
}

export const perfectCorpService = new PerfectCorpAnalysisService();
export default perfectCorpService;

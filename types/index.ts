export interface User {
  id: string;
  full_name: string;
  phone_number: string;
  email?: string;
  location: string;
  gender: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';
  age: number;
  is_for_self: boolean;
  skin_concerns: string[];
  has_routine: boolean;
  current_products: string[];
  sunscreen_frequency: 'never' | 'sometimes' | 'often' | 'always';
  role?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Dependent {
  id: string;
  user_id: string;
  full_name: string;
  relationship: string;
  gender: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';
  age: number;
  skin_concerns: string[];
  has_routine: boolean;
  current_products: string[];
  sunscreen_frequency: 'never' | 'sometimes' | 'often' | 'always';
}

export interface SkinConcern {
  id: string;
  name: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

export interface Recommendation {
  id: string;
  type: 'product' | 'habit' | 'routine';
  description: string;
  priority: 'low' | 'medium' | 'high';
}

export interface SkinAnalysis {
  id: string;
  userId: string;
  date: string;
  imageUrl: string;
  concerns: SkinConcern[];
  recommendations: Recommendation[];
  overallHealth: number; // 0-100 score
  // Comprehensive analysis data
  hdAnalysis?: {
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
  skinType?: string;
  skinTone?: {
    category: string;
    hex: string;
    rgb: { r: number; g: number; b: number };
    undertone: string;
  };
  facialFeatures?: any;
  ageEstimation?: any;
  expressionAnalysis?: any;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  ingredients?: string[];
  image_url?: string;
  skin_types?: string[];
  concerns?: string[];
  is_active: boolean;
  stock_quantity: number;
  rating: number;
  review_count: number;
}

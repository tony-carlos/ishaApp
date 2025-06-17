export interface User {
  id: string;
  fullName: string;
  phoneNumber: string;
  location: string;
  gender: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';
  age: number;
  isForSelf: boolean;
  skinConcerns: string[];
  hasRoutine: boolean;
  currentProducts: string[];
  sunscreenFrequency: 'never' | 'sometimes' | 'often' | 'always';
}

export interface Dependent {
  id: string;
  userId: string;
  fullName: string;
  relationship: string;
  age: number;
  gender: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';
  skinConcerns: string[];
  hasRoutine: boolean;
  currentProducts: string[];
  sunscreenFrequency: 'never' | 'sometimes' | 'often' | 'always';
}

export interface SkinAnalysis {
  id: string;
  userId: string;
  date: string;
  imageUrl: string;
  concerns: {
    id: string;
    name: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
  }[];
  recommendations: {
    id: string;
    type: 'product' | 'habit';
    description: string;
    priority: 'low' | 'medium' | 'high';
  }[];
  overallHealth: number;
}
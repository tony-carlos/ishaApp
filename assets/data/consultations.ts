export interface Dermatologist {
  id: string;
  name: string;
  specialty: string;
  imageUrl: string;
  bio: string;
  yearsExperience: number;
  rating: number;
  available: boolean;
}

export const dermatologists: Dermatologist[] = [];
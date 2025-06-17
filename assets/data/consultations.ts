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

export const dermatologists: Dermatologist[] = [
  {
    id: 'derm1',
    name: 'Dr. Sarah Kim',
    specialty: 'Acne & Rosacea',
    imageUrl: 'https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg',
    bio: 'Board-certified dermatologist specializing in acne, rosacea, and adult skin conditions with 12 years of experience.',
    yearsExperience: 12,
    rating: 4.9,
    available: true
  },
  {
    id: 'derm2',
    name: 'Dr. Michael Chen',
    specialty: 'Anti-Aging & Cosmetic',
    imageUrl: 'https://images.pexels.com/photos/5452268/pexels-photo-5452268.jpeg',
    bio: 'Expert in anti-aging treatments and cosmetic dermatology. Specializes in both preventative care and rejuvenation techniques.',
    yearsExperience: 15,
    rating: 4.8,
    available: true
  },
  {
    id: 'derm3',
    name: 'Dr. Aisha Johnson',
    specialty: 'Pigmentation & Melanin-Rich Skin',
    imageUrl: 'https://images.pexels.com/photos/6234612/pexels-photo-6234612.jpeg',
    bio: 'Specializes in treating skin conditions that affect melanin-rich skin, including hyperpigmentation and keloids.',
    yearsExperience: 10,
    rating: 4.9,
    available: false
  },
  {
    id: 'derm4',
    name: 'Dr. David Rodriguez',
    specialty: 'Sensitive Skin & Allergies',
    imageUrl: 'https://images.pexels.com/photos/5407203/pexels-photo-5407203.jpeg',
    bio: 'Focused on treating sensitive skin conditions, contact dermatitis, and allergy-related skin issues.',
    yearsExperience: 8,
    rating: 4.7,
    available: true
  },
  {
    id: 'derm5',
    name: 'Dr. Priya Patel',
    specialty: 'Holistic Dermatology',
    imageUrl: 'https://images.pexels.com/photos/5214959/pexels-photo-5214959.jpeg',
    bio: 'Combines traditional dermatology with holistic approaches, focusing on skin-gut connection and nutritional factors.',
    yearsExperience: 14,
    rating: 4.8,
    available: true
  }
];
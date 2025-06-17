export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  imageUrl: string;
  description: string;
  size: string;
  category: 'cleanser' | 'toner' | 'serum' | 'moisturizer' | 'sunscreen' | 'mask' | 'treatment';
  concerns: string[];
  ingredients: string[];
  rating: number;
}

export const skincareProducts: Product[] = [
  {
    id: 'p1',
    name: 'Gentle Hydrating Cleanser',
    brand: 'ISHER CARE',
    price: 24.99,
    imageUrl: 'https://images.pexels.com/photos/6621462/pexels-photo-6621462.jpeg',
    description: 'A gentle, hydrating facial cleanser that removes dirt and oil without stripping skin\'s natural moisture.',
    size: '200ml',
    category: 'cleanser',
    concerns: ['dryness', 'sensitivity'],
    ingredients: ['Glycerin', 'Ceramides', 'Hyaluronic Acid'],
    rating: 4.8
  },
  {
    id: 'p2',
    name: 'Clarifying Toner',
    brand: 'ISHER CARE',
    price: 19.99,
    imageUrl: 'https://images.pexels.com/photos/6621359/pexels-photo-6621359.jpeg',
    description: 'Balances skin\'s pH and removes remaining impurities after cleansing while preparing skin for treatments.',
    size: '150ml',
    category: 'toner',
    concerns: ['pores', 'oiliness', 'acne'],
    ingredients: ['Witch Hazel', 'Salicylic Acid', 'Niacinamide'],
    rating: 4.6
  },
  {
    id: 'p3',
    name: 'Vitamin C Brightening Serum',
    brand: 'ISHER CARE',
    price: 39.99,
    imageUrl: 'https://images.pexels.com/photos/5069606/pexels-photo-5069606.jpeg',
    description: 'Potent antioxidant serum that brightens skin tone, reduces dark spots, and protects against environmental damage.',
    size: '30ml',
    category: 'serum',
    concerns: ['dullness', 'pigmentation', 'uneven-tone'],
    ingredients: ['15% Vitamin C', 'Ferulic Acid', 'Vitamin E'],
    rating: 4.9
  },
  {
    id: 'p4',
    name: 'Hydrating Gel Moisturizer',
    brand: 'ISHER CARE',
    price: 32.99,
    imageUrl: 'https://images.pexels.com/photos/6621264/pexels-photo-6621264.jpeg',
    description: 'Lightweight gel moisturizer that provides all-day hydration without feeling heavy or greasy.',
    size: '50ml',
    category: 'moisturizer',
    concerns: ['dryness', 'dullness', 'oiliness'],
    ingredients: ['Hyaluronic Acid', 'Glycerin', 'Aloe Vera'],
    rating: 4.7
  },
  {
    id: 'p5',
    name: 'Broad Spectrum SPF 50',
    brand: 'ISHER CARE',
    price: 27.99,
    imageUrl: 'https://images.pexels.com/photos/4465124/pexels-photo-4465124.jpeg',
    description: 'Lightweight, non-greasy sunscreen that protects against UVA and UVB rays without leaving a white cast.',
    size: '50ml',
    category: 'sunscreen',
    concerns: ['sun-damage', 'pigmentation', 'aging'],
    ingredients: ['Zinc Oxide', 'Titanium Dioxide', 'Vitamin E'],
    rating: 4.8
  },
  {
    id: 'p6',
    name: 'Retinol Night Treatment',
    brand: 'ISHER CARE',
    price: 45.99,
    imageUrl: 'https://images.pexels.com/photos/6621444/pexels-photo-6621444.jpeg',
    description: 'Advanced retinol formula that reduces fine lines, evens skin tone, and improves texture while you sleep.',
    size: '30ml',
    category: 'treatment',
    concerns: ['wrinkles', 'texture', 'uneven-tone'],
    ingredients: ['0.5% Retinol', 'Peptides', 'Niacinamide'],
    rating: 4.9
  },
  {
    id: 'p7',
    name: 'Purifying Clay Mask',
    brand: 'ISHER CARE',
    price: 22.99,
    imageUrl: 'https://images.pexels.com/photos/3750640/pexels-photo-3750640.jpeg',
    description: 'Deep-cleansing mask that draws out impurities, reduces excess oil, and minimizes the appearance of pores.',
    size: '100ml',
    category: 'mask',
    concerns: ['pores', 'oiliness', 'acne'],
    ingredients: ['Kaolin Clay', 'Activated Charcoal', 'Tea Tree Oil'],
    rating: 4.6
  },
  {
    id: 'p8',
    name: 'Acne Spot Treatment',
    brand: 'ISHER CARE',
    price: 18.99,
    imageUrl: 'https://images.pexels.com/photos/5938482/pexels-photo-5938482.jpeg',
    description: 'Fast-acting formula that reduces inflammation and helps clear blemishes overnight.',
    size: '15ml',
    category: 'treatment',
    concerns: ['pimples', 'acne'],
    ingredients: ['Salicylic Acid', 'Sulfur', 'Zinc'],
    rating: 4.5
  }
];
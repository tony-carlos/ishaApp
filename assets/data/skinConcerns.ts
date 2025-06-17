export interface SkinConcern {
  id: string;
  title: string;
  description: string;
  imageUrl: any;
}

export const skinConcerns: SkinConcern[] = [
  {
    id: 'pimples',
    title: 'Pimples/Acne',
    description: 'Includes whiteheads, blackheads, and cystic acne',
    imageUrl: { uri: 'https://images.pexels.com/photos/7446693/pexels-photo-7446693.jpeg' },
  },
  {
    id: 'pores',
    title: 'Enlarged Pores',
    description: 'Visibly large openings in the skin',
    imageUrl: { uri: 'https://images.pexels.com/photos/5069492/pexels-photo-5069492.jpeg' },
  },
  {
    id: 'redness',
    title: 'Redness/Rosacea',
    description: 'Persistent redness, flushing, or visible blood vessels',
    imageUrl: { uri: 'https://images.pexels.com/photos/4939451/pexels-photo-4939451.jpeg' },
  },
  {
    id: 'dullness',
    title: 'Dullness',
    description: 'Lack of radiance or brightness in complexion',
    imageUrl: { uri: 'https://images.pexels.com/photos/5069493/pexels-photo-5069493.jpeg' },
  },
  {
    id: 'texture',
    title: 'Rough Texture',
    description: 'Uneven, bumpy skin surface',
    imageUrl: { uri: 'https://images.pexels.com/photos/5938412/pexels-photo-5938412.jpeg' },
  },
  {
    id: 'uneven-tone',
    title: 'Uneven Skin Tone',
    description: 'Discoloration or patchy skin color',
    imageUrl: { uri: 'https://images.pexels.com/photos/3373716/pexels-photo-3373716.jpeg' },
  },
  {
    id: 'pigmentation',
    title: 'Pigmentation',
    description: 'Dark spots, sun spots, or hyperpigmentation',
    imageUrl: { uri: 'https://images.pexels.com/photos/6663467/pexels-photo-6663467.jpeg' },
  },
  {
    id: 'wrinkles',
    title: 'Fine Lines & Wrinkles',
    description: 'Visible lines, creases, or folds in the skin',
    imageUrl: { uri: 'https://images.pexels.com/photos/3811742/pexels-photo-3811742.jpeg' },
  },
  {
    id: 'dryness',
    title: 'Dryness',
    description: 'Flaky, tight, or rough skin due to lack of moisture',
    imageUrl: { uri: 'https://images.pexels.com/photos/5257549/pexels-photo-5257549.jpeg' },
  },
  {
    id: 'dark-circles',
    title: 'Dark Circles',
    description: 'Darkness or shadows under the eyes',
    imageUrl: { uri: 'https://images.pexels.com/photos/5257640/pexels-photo-5257640.jpeg' },
  },
  {
    id: 'none',
    title: 'Nothing from above',
    description: 'My skin concern is not listed here',
    imageUrl: { uri: 'https://images.pexels.com/photos/3762553/pexels-photo-3762553.jpeg' },
  },
];
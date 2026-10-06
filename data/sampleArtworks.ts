import type { Artwork } from '@/lib/types';

// Placeholder images: public-domain paintings from the Art Institute of Chicago.

export const sampleArtworks: Artwork[] = [
  { id: 'sample-1', title: 'Golden Hour', medium: 'Acrylic on canvas', dimensions: '16 × 20 in', year: '2026', price: 42000, currency: 'usd', image: require('@/assets/artwork/golden-hour.jpg'), description: 'Warm layers of ochre and amber capture the last light of the day.', sold: false },
  { id: 'sample-2', title: 'Quiet Coast', medium: 'Oil on canvas', dimensions: '24 × 30 in', year: '2026', price: 68000, currency: 'usd', image: require('@/assets/artwork/quiet-coast.jpg'), description: 'A calm shoreline study built from soft blues and sea-glass greens.', sold: false },
  { id: 'sample-3', title: 'Bloom No. 3', medium: 'Watercolor on paper', dimensions: '11 × 14 in', year: '2025', price: 18000, currency: 'usd', image: require('@/assets/artwork/bloom.jpg'), description: 'Loose, expressive florals from an ongoing botanical series.', sold: true },
  { id: 'sample-4', title: 'City in Rain', medium: 'Mixed media', dimensions: '18 × 24 in', year: '2025', price: 51000, currency: 'usd', image: require('@/assets/artwork/city-in-rain.jpg'), description: 'Reflections, umbrellas, and neon blurred into an abstract street scene.', sold: false },
  { id: 'sample-5', title: 'Two Poplars', medium: 'Oil on panel', dimensions: '12 × 12 in', year: '2025', price: 26000, currency: 'usd', image: require('@/assets/artwork/two-poplars.jpg'), description: 'Bold color and loose brushwork in a small, energetic landscape.', sold: false },
  { id: 'sample-6', title: 'Sunday Table', medium: 'Gouache on paper', dimensions: '9 × 12 in', year: '2024', price: 15000, currency: 'usd', image: require('@/assets/artwork/sunday-table.jpg'), description: 'A warm, quiet still life of a table set for a family meal.', sold: false },
  { id: 'sample-7', title: 'Drift', medium: 'Acrylic on canvas', dimensions: '30 × 40 in', year: '2024', price: 95000, currency: 'usd', image: require('@/assets/artwork/drift.jpg'), description: 'A large abstract piece of sweeping, layered movement.', sold: true },
  { id: 'sample-8', title: 'Morning Window', medium: 'Oil on canvas', dimensions: '16 × 16 in', year: '2024', price: 34000, currency: 'usd', image: require('@/assets/artwork/morning-window.jpg'), description: 'Sunlight spilling across a windowsill full of plants.', sold: false },
];

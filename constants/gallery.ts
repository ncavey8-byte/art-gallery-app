import type { ArtworkCategory } from '@/lib/types';

export type GallerySection = {
  key: string;
  title: string;
  groups: { category: ArtworkCategory; title?: string }[];
};

export const gallerySections: GallerySection[] = [
  {
    key: 'pets',
    title: 'Pet Portraits',
    groups: [
      { category: 'pets-cats-dogs', title: 'Cats & Dogs' },
      { category: 'pets-other', title: 'Other Pets' },
    ],
  },
  { key: 'people', title: 'People Portraits', groups: [{ category: 'people' }] },
  { key: 'original', title: 'Original Works', groups: [{ category: 'original' }] },
];

export const categoryLabels: Record<ArtworkCategory, string> = {
  'pets-cats-dogs': 'Pet Portrait · Cats & Dogs',
  'pets-other': 'Pet Portrait · Other Pets',
  people: 'People Portrait',
  original: 'Original Work',
};

export const isPortrait = (category: ArtworkCategory) => category !== 'original';

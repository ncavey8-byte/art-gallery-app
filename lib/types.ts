import type { ImageSourcePropType } from 'react-native';

export type ArtworkCategory = 'pets-cats-dogs' | 'pets-other' | 'people' | 'original';

export type Artwork = {
  id: string;
  title: string;
  medium: string;
  dimensions: string;
  year: string;
  price: number; // in cents
  currency: string;
  image: string | ImageSourcePropType; // remote URL, or a bundled require() asset
  description: string;
  category: ArtworkCategory;
  sold: boolean;
};

export type CanvasSize = '10x10' | '20x20' | '30x30';
export type CommissionMedium = 'pencil' | 'oil';

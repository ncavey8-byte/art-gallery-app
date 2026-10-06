import type { ImageSourcePropType } from 'react-native';

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
  sold: boolean;
};

import type { ImageSourcePropType } from 'react-native';

import type { Artwork } from '@/lib/types';

// Remote URLs come from the API as strings; bundled require() assets resolve to
// a number on native and an object on web, so pass those through untouched.
export function imageSource(image: Artwork['image']): ImageSourcePropType {
  return typeof image === 'string' ? { uri: image } : image;
}

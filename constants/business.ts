import type { ImageSourcePropType } from 'react-native';

// Edit this file to update the About Us page and contact details.
export const business = {
  name: 'Emily Cavey',
  title: 'Emily Cavey - Fine Art',
  tagline: 'Pet portraits, people portraits and original works.',
  instagramHandle: 'art_em_c',
  instagramUrl: 'https://www.instagram.com/art_em_c/',
  email: 'hello@example.com',
  heroImage: require('@/assets/artwork/drift.jpg') as ImageSourcePropType,
  story: [
    'Every piece in this collection is an original, created by hand in our studio. We believe art should feel personal: something you discover, connect with, and live alongside for years.',
    'What started as a passion shared on Instagram has grown into a small art business. This app is the easiest way to browse what is currently available and bring a piece home.',
  ],
  offerings: [
    { title: 'Original works', body: 'One-of-a-kind pieces. When it is sold, it is gone.' },
    { title: 'Portrait commissions', body: 'Custom pencil or oil portraits of your pets and loved ones. Start a request from the Commission tab.' },
    { title: 'Careful shipping', body: 'Every artwork is packed by hand and shipped with tracking.' },
  ],
};

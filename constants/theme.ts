import { Platform } from 'react-native';

export const colors = {
  background: '#FAF7F2',
  surface: '#FFFFFF',
  text: '#1F1B16',
  muted: '#6B6259',
  border: '#E8E1D7',
  accent: '#B5562E',
  accentText: '#FFFFFF',
  sold: '#8A8178',
  success: '#2F6B4F',
};

export const serif = Platform.select({
  ios: 'Georgia',
  android: 'serif',
  default: 'Georgia, "Times New Roman", serif',
});

export function formatPrice(cents: number, currency = 'usd') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

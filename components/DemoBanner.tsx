import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/theme';
import { useArtworks } from '@/context/ArtworksContext';
import { isDemoMode } from '@/lib/api';

export function DemoBanner() {
  const { isSample } = useArtworks();
  if (!isSample) return null;
  return (
    <View style={styles.banner}>
      <Text style={styles.text}>{isDemoMode ? 'Preview mode: sample artwork. Payments and emails are not live yet.' : 'Preview mode: sample artwork. Payments are not live yet.'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { backgroundColor: '#F1E6D8', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 6, marginBottom: 16 },
  text: { color: colors.muted, fontSize: 13, textAlign: 'center' },
});

import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/theme';
import { isDemoMode } from '@/lib/api';

export function DemoBanner() {
  if (!isDemoMode) return null;
  return (
    <View style={styles.banner}>
      <Text style={styles.text}>Preview mode: sample artwork. Payments and emails are not live yet.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { backgroundColor: '#F1E6D8', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 6, marginBottom: 16 },
  text: { color: colors.muted, fontSize: 13, textAlign: 'center' },
});

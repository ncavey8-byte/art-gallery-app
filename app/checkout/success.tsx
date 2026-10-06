import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { colors, serif } from '@/constants/theme';
import { useArtworks } from '@/context/ArtworksContext';
import { useCart } from '@/context/CartContext';

export default function CheckoutSuccessScreen() {
  const { demo } = useLocalSearchParams<{ demo?: string }>();
  const { clear } = useCart();
  const { refresh } = useArtworks();

  useEffect(() => {
    clear();
    refresh();
  }, [clear, refresh]);

  return (
    <View style={styles.container}>
      <Text style={styles.check}>✓</Text>
      <Text style={styles.title}>Thank you for your order!</Text>
      <Text style={styles.body}>
        {demo
          ? 'This was a preview checkout, so no payment was taken. Once Stripe is connected, customers pay securely here.'
          : 'Your payment was successful. A receipt is on its way to your email, and we will be in touch with shipping details.'}
      </Text>
      <Button title="Back to the gallery" onPress={() => router.replace('/')} style={{ alignSelf: 'stretch' }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: colors.background },
  check: { fontSize: 48, color: colors.success, marginBottom: 12 },
  title: { fontFamily: serif, fontSize: 26, color: colors.text, textAlign: 'center' },
  body: { fontSize: 16, lineHeight: 24, color: colors.muted, textAlign: 'center', marginTop: 12, marginBottom: 28, maxWidth: 420 },
});

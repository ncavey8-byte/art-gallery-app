import * as Linking from 'expo-linking';
import { Link, router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { Alert, Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { DemoBanner } from '@/components/DemoBanner';
import { imageSource } from '@/lib/imageSource';
import { colors, formatPrice, serif } from '@/constants/theme';
import { useArtworks } from '@/context/ArtworksContext';
import { useCart } from '@/context/CartContext';
import { createCheckoutSession } from '@/lib/api';

function showError(message: string) {
  if (Platform.OS === 'web') window.alert(message);
  else Alert.alert('Checkout', message);
}

export default function CartScreen() {
  const { items, total, remove } = useCart();
  const { isSample } = useArtworks();
  const [loading, setLoading] = useState(false);

  async function checkout() {
    if (isSample) {
      router.replace({ pathname: '/checkout/success', params: { demo: '1' } });
      return;
    }
    setLoading(true);
    try {
      const successUrl = Linking.createURL('/checkout/success');
      const cancelUrl = Linking.createURL('/cart');
      const url = await createCheckoutSession({ artworkIds: items.map((a) => a.id), successUrl, cancelUrl });
      if (Platform.OS === 'web') {
        window.location.href = url;
        return;
      }
      const result = await WebBrowser.openAuthSessionAsync(url, successUrl);
      if (result.type === 'success' && result.url.startsWith(successUrl)) {
        router.replace('/checkout/success');
      }
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Could not start checkout');
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptyText}>Find a piece you love in the gallery.</Text>
        <Link href="/" asChild>
          <Button title="Browse the gallery" style={{ marginTop: 20, alignSelf: 'stretch' }} />
        </Link>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={styles.container}>
        <DemoBanner />
        {items.map((a) => (
          <View key={a.id} style={styles.row}>
            <Image source={imageSource(a.image)} style={styles.thumb} />
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{a.title}</Text>
              <Text style={styles.meta}>
                {a.medium} · {a.dimensions}
              </Text>
              <Text style={styles.price}>{formatPrice(a.price, a.currency)}</Text>
            </View>
            <Pressable onPress={() => remove(a.id)} hitSlop={10} accessibilityLabel={`Remove ${a.title}`}>
              <Text style={styles.remove}>Remove</Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal</Text>
          <Text style={styles.totalValue}>{formatPrice(total, items[0].currency)}</Text>
        </View>
        <Text style={styles.note}>Shipping and taxes are calculated at checkout.</Text>
        <Button title="Checkout" onPress={checkout} loading={loading} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, width: '100%', maxWidth: 720, alignSelf: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  thumb: { width: 72, height: 90, borderRadius: 4, backgroundColor: colors.border },
  title: { fontFamily: serif, fontSize: 17, color: colors.text },
  meta: { fontSize: 13, color: colors.muted, marginTop: 2 },
  price: { fontSize: 15, fontWeight: '600', color: colors.text, marginTop: 6 },
  remove: { color: colors.accent, fontSize: 14 },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface, width: '100%', maxWidth: 720, alignSelf: 'center' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  totalLabel: { fontSize: 17, color: colors.text },
  totalValue: { fontSize: 17, fontWeight: '700', color: colors.text },
  note: { fontSize: 13, color: colors.muted, marginTop: 4, marginBottom: 14 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: colors.background },
  emptyTitle: { fontFamily: serif, fontSize: 24, color: colors.text },
  emptyText: { fontSize: 15, color: colors.muted, marginTop: 6 },
});

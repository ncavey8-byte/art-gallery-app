import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { imageSource } from '@/lib/imageSource';
import { colors, formatPrice, serif } from '@/constants/theme';
import { useArtworks } from '@/context/ArtworksContext';
import { useCart } from '@/context/CartContext';

export default function ArtworkDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getById, loading } = useArtworks();
  const { add, has } = useCart();
  const artwork = getById(id);

  if (!artwork) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>{loading ? 'Loading…' : 'This artwork could not be found.'}</Text>
      </View>
    );
  }

  const inCart = has(artwork.id);

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.container}>
      <Stack.Screen options={{ title: artwork.title }} />
      <Image source={imageSource(artwork.image)} style={styles.image} resizeMode="cover" />
      <Text style={styles.title}>{artwork.title}</Text>
      <Text style={[styles.price, artwork.sold && styles.sold]}>
        {artwork.sold ? 'Sold' : formatPrice(artwork.price, artwork.currency)}
      </Text>

      <View style={styles.details}>
        <Detail label="Medium" value={artwork.medium} />
        <Detail label="Size" value={artwork.dimensions} />
        <Detail label="Year" value={artwork.year} />
      </View>

      <Text style={styles.description}>{artwork.description}</Text>

      {artwork.sold ? (
        <Button title="This piece has found a home" disabled />
      ) : inCart ? (
        <Button title="In your cart · View cart" variant="secondary" onPress={() => router.navigate('/cart')} />
      ) : (
        <View style={{ gap: 12 }}>
          <Button
            title="Buy now"
            onPress={() => {
              add(artwork);
              router.navigate('/cart');
            }}
          />
          <Button title="Add to cart" variant="secondary" onPress={() => add(artwork)} />
        </View>
      )}
    </ScrollView>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 48, width: '100%', maxWidth: 720, alignSelf: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  muted: { color: colors.muted },
  image: { width: '100%', aspectRatio: 4 / 5, borderRadius: 8, backgroundColor: colors.border },
  title: { fontFamily: serif, fontSize: 30, color: colors.text, marginTop: 20 },
  price: { fontSize: 20, fontWeight: '600', color: colors.text, marginTop: 6 },
  sold: { color: colors.sold },
  details: { marginVertical: 20, borderTopWidth: 1, borderTopColor: colors.border },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  detailLabel: { color: colors.muted, fontSize: 15 },
  detailValue: { color: colors.text, fontSize: 15 },
  description: { fontSize: 16, lineHeight: 25, color: colors.text, marginBottom: 24 },
});

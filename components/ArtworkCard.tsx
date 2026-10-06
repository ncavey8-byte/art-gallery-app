import { Link } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { imageSource } from '@/lib/imageSource';
import { colors, formatPrice, serif } from '@/constants/theme';
import type { Artwork } from '@/lib/types';

export function ArtworkCard({ artwork, width }: { artwork: Artwork; width: number }) {
  return (
    <Link href={{ pathname: '/art/[id]', params: { id: artwork.id } }} asChild>
      <Pressable style={({ pressed }) => [{ width, opacity: pressed ? 0.85 : 1 }]}>
        <View>
          <Image source={imageSource(artwork.image)} style={[styles.image, { width, height: width * 1.25 }]} />
          {artwork.sold && (
            <View style={styles.soldBadge}>
              <Text style={styles.soldText}>SOLD</Text>
            </View>
          )}
        </View>
        <Text style={styles.title} numberOfLines={1}>
          {artwork.title}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {artwork.medium}
        </Text>
        <Text style={[styles.price, artwork.sold && styles.priceSold]}>
          {formatPrice(artwork.price, artwork.currency)}
        </Text>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  image: { borderRadius: 6, backgroundColor: colors.border },
  soldBadge: { position: 'absolute', top: 10, left: 10, backgroundColor: colors.text, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  soldText: { color: '#fff', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  title: { fontFamily: serif, fontSize: 17, color: colors.text, marginTop: 10 },
  meta: { fontSize: 13, color: colors.muted, marginTop: 2 },
  price: { fontSize: 15, fontWeight: '600', color: colors.text, marginTop: 4 },
  priceSold: { color: colors.sold, textDecorationLine: 'line-through' },
});

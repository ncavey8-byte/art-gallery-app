import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { ArtworkCard } from '@/components/ArtworkCard';
import { Button } from '@/components/Button';
import { DemoBanner } from '@/components/DemoBanner';
import { business } from '@/constants/business';
import { colors, serif } from '@/constants/theme';
import { useArtworks } from '@/context/ArtworksContext';

const PADDING = 20;
const GAP = 16;
const MAX_WIDTH = 1100;

type Filter = 'available' | 'all';

export default function GalleryScreen() {
  const { artworks, loading, error, refresh } = useArtworks();
  const [filter, setFilter] = useState<Filter>('available');
  const { width } = useWindowDimensions();

  const contentWidth = Math.min(width, MAX_WIDTH) - PADDING * 2;
  const columns = contentWidth > 900 ? 4 : contentWidth > 600 ? 3 : 2;
  const cardWidth = (contentWidth - GAP * (columns - 1)) / columns;

  const visible = useMemo(() => (filter === 'available' ? artworks.filter((a) => !a.sold) : artworks), [artworks, filter]);

  if (loading && artworks.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (error && artworks.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>{error}</Text>
        <Button title="Try again" onPress={refresh} style={{ marginTop: 16 }} />
      </View>
    );
  }

  return (
    <FlatList
      key={columns}
      data={visible}
      numColumns={columns}
      keyExtractor={(a) => a.id}
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[styles.list, { width: contentWidth + PADDING * 2 }]}
      columnWrapperStyle={{ gap: GAP }}
      ItemSeparatorComponent={() => <View style={{ height: 24 }} />}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={colors.accent} />}
      ListHeaderComponent={
        <View style={styles.header}>
          <DemoBanner />
          <Text style={styles.brand}>{business.name}</Text>
          <Text style={styles.tagline}>{business.tagline}</Text>
          <View style={styles.filters}>
            {(['available', 'all'] as const).map((f) => (
              <Pressable key={f} onPress={() => setFilter(f)} style={[styles.chip, filter === f && styles.chipActive]}>
                <Text style={[styles.chipText, filter === f && styles.chipTextActive]}>
                  {f === 'available' ? `Available (${artworks.filter((a) => !a.sold).length})` : `All work (${artworks.length})`}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      }
      ListEmptyComponent={<Text style={styles.emptyText}>No artwork available right now. Check back soon!</Text>}
      renderItem={({ item }) => <ArtworkCard artwork={item} width={cardWidth} />}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: PADDING, paddingBottom: 40, alignSelf: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: colors.background },
  header: { marginBottom: 20 },
  brand: { fontFamily: serif, fontSize: 34, color: colors.text },
  tagline: { fontSize: 15, color: colors.muted, marginTop: 4 },
  filters: { flexDirection: 'row', gap: 8, marginTop: 18 },
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  chipActive: { backgroundColor: colors.text, borderColor: colors.text },
  chipText: { fontSize: 14, color: colors.text },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  emptyText: { color: colors.muted, fontSize: 15, textAlign: 'center' },
});

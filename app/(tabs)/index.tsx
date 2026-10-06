import { useRef } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { ArtworkCard } from '@/components/ArtworkCard';
import { Button } from '@/components/Button';
import { DemoBanner } from '@/components/DemoBanner';
import { business } from '@/constants/business';
import { gallerySections } from '@/constants/gallery';
import { colors, serif } from '@/constants/theme';
import { useArtworks } from '@/context/ArtworksContext';

const PADDING = 20;
const GAP = 16;
const MAX_WIDTH = 1100;

export default function GalleryScreen() {
  const { artworks, loading, error, refresh } = useArtworks();
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const sectionOffsets = useRef<Record<string, number>>({});

  const contentWidth = Math.min(width, MAX_WIDTH) - PADDING * 2;
  const columns = contentWidth > 900 ? 4 : contentWidth > 600 ? 3 : 2;
  const cardWidth = (contentWidth - GAP * (columns - 1)) / columns;

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
    <ScrollView
      ref={scrollRef}
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[styles.container, { width: contentWidth + PADDING * 2 }]}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={colors.accent} />}>
      <DemoBanner />
      <Text style={styles.tagline}>{business.tagline}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {gallerySections.map((section) => (
          <Pressable
            key={section.key}
            style={styles.chip}
            onPress={() => scrollRef.current?.scrollTo({ y: (sectionOffsets.current[section.key] ?? 0) - 8, animated: true })}>
            <Text style={styles.chipText}>{section.title}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {gallerySections.map((section) => (
        <View key={section.key} style={styles.section} onLayout={(e) => (sectionOffsets.current[section.key] = e.nativeEvent.layout.y)}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          {section.groups.map((group) => {
            const items = artworks
              .filter((a) => a.category === group.category)
              .sort((a, b) => Number(a.sold) - Number(b.sold));
            return (
              <View key={group.category} style={styles.group}>
                {group.title && <Text style={styles.groupTitle}>{group.title}</Text>}
                {items.length === 0 ? (
                  <Text style={styles.emptyText}>New pieces coming soon.</Text>
                ) : (
                  <View style={styles.grid}>
                    {items.map((item) => (
                      <ArtworkCard key={item.id} artwork={item} width={cardWidth} />
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: PADDING, paddingBottom: 48, alignSelf: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: colors.background },
  tagline: { fontSize: 15, color: colors.muted },
  chips: { gap: 8, paddingVertical: 16 },
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  chipText: { fontSize: 14, color: colors.text },
  section: { paddingTop: 12, marginBottom: 12 },
  sectionTitle: { fontFamily: serif, fontSize: 28, color: colors.text, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: colors.border, marginBottom: 16 },
  group: { marginBottom: 24 },
  groupTitle: { fontSize: 13, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', color: colors.accent, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: GAP, rowGap: 24 },
  emptyText: { color: colors.muted, fontSize: 15 },
});

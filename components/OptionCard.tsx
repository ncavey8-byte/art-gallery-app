import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, serif } from '@/constants/theme';

type Props = {
  title: string;
  description?: string;
  selected: boolean;
  onPress: () => void;
  visual?: ReactNode;
};

export function OptionCard({ title, description, selected, onPress, visual }: Props) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.card, selected && styles.selected, pressed && { opacity: 0.85 }]}>
      {visual && <View style={styles.visual}>{visual}</View>}
      <Text style={[styles.title, selected && styles.titleSelected]}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, minWidth: 96, padding: 14, borderRadius: 10, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center' },
  selected: { borderColor: colors.accent, backgroundColor: '#FBF0EA' },
  visual: { height: 44, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  title: { fontFamily: serif, fontSize: 17, color: colors.text, textAlign: 'center' },
  titleSelected: { color: colors.accent },
  description: { fontSize: 13, color: colors.muted, marginTop: 4, textAlign: 'center' },
});

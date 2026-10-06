import * as WebBrowser from 'expo-web-browser';
import { Image, Linking, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { business } from '@/constants/business';
import { colors, serif } from '@/constants/theme';

function openUrl(url: string) {
  if (Platform.OS === 'web') window.open(url, '_blank');
  else WebBrowser.openBrowserAsync(url);
}

export default function AboutScreen() {
  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.container}>
      <Image source={business.heroImage} style={styles.hero} />
      <Text style={styles.heading}>About {business.name}</Text>
      {business.story.map((p, i) => (
        <Text key={i} style={styles.paragraph}>
          {p}
        </Text>
      ))}

      <View style={styles.offerings}>
        {business.offerings.map((o) => (
          <View key={o.title} style={styles.offering}>
            <Text style={styles.offeringTitle}>{o.title}</Text>
            <Text style={styles.offeringBody}>{o.body}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.subheading}>Get in touch</Text>
      <Text style={styles.paragraph}>Questions about a piece, shipping, or commissions? We would love to hear from you.</Text>
      <Button title={`Follow @${business.instagramHandle} on Instagram`} onPress={() => openUrl(business.instagramUrl)} />
      <Button title="Email us" variant="secondary" onPress={() => Linking.openURL(`mailto:${business.email}`)} style={{ marginTop: 12 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 48, width: '100%', maxWidth: 720, alignSelf: 'center' },
  hero: { width: '100%', aspectRatio: 3 / 2, borderRadius: 8, backgroundColor: colors.border, marginBottom: 24 },
  heading: { fontFamily: serif, fontSize: 30, color: colors.text, marginBottom: 12 },
  subheading: { fontFamily: serif, fontSize: 24, color: colors.text, marginTop: 8, marginBottom: 8 },
  paragraph: { fontSize: 16, lineHeight: 25, color: colors.text, marginBottom: 14 },
  offerings: { gap: 12, marginVertical: 16 },
  offering: { backgroundColor: colors.surface, borderRadius: 8, padding: 16, borderWidth: 1, borderColor: colors.border },
  offeringTitle: { fontFamily: serif, fontSize: 18, color: colors.text, marginBottom: 4 },
  offeringBody: { fontSize: 15, lineHeight: 22, color: colors.muted },
});

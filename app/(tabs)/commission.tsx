import { useState, type ReactNode } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import { Button } from '@/components/Button';
import { DemoBanner } from '@/components/DemoBanner';
import { OptionCard } from '@/components/OptionCard';
import { colors, serif } from '@/constants/theme';
import { isDemoMode, submitCommission } from '@/lib/api';
import { pickPhotos, type CommissionPhoto } from '@/lib/photos';
import type { CanvasSize, CommissionMedium } from '@/lib/types';

const MAX_PHOTOS = 1;

const SIZES: { value: CanvasSize; label: string; preview: number }[] = [
  { value: '10x10', label: '10 × 10 in', preview: 18 },
  { value: '20x20', label: '20 × 20 in', preview: 30 },
  { value: '30x30', label: '30 × 30 in', preview: 42 },
];

const MEDIUMS: { value: CommissionMedium; label: string; description: string }[] = [
  { value: 'pencil', label: 'Pencil', description: 'Detailed graphite drawing' },
  { value: 'oil', label: 'Oil paint', description: 'Rich, full-color painting' },
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function showMessage(message: string) {
  if (Platform.OS === 'web') window.alert(message);
  else Alert.alert('Commission request', message);
}

export default function CommissionScreen() {
  const [canvasSize, setCanvasSize] = useState<CanvasSize | null>(null);
  const [medium, setMedium] = useState<CommissionMedium | null>(null);
  const [photos, setPhotos] = useState<CommissionPhoto[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const missing = [
    !canvasSize && 'a canvas size',
    !medium && 'pencil or oil paint',
    photos.length === 0 && 'a photo',
    !name.trim() && 'your name',
    !EMAIL_PATTERN.test(email.trim()) && 'a valid email',
  ].filter(Boolean) as string[];

  async function addPhotos(source: 'library' | 'camera') {
    try {
      const picked = await pickPhotos(source, MAX_PHOTOS);
      if (picked.length) setPhotos((prev) => [...prev, ...picked].slice(-MAX_PHOTOS));
    } catch (e) {
      showMessage(e instanceof Error ? e.message : 'Could not add that photo');
    }
  }

  async function submit() {
    if (!canvasSize || !medium || missing.length) return;
    setSubmitting(true);
    try {
      await submitCommission({ canvasSize, medium, name: name.trim(), email: email.trim(), phone: phone.trim(), notes: notes.trim(), photos });
      setSubmittedEmail(email.trim());
    } catch (e) {
      showMessage(e instanceof Error ? e.message : 'Could not send your request');
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setCanvasSize(null);
    setMedium(null);
    setPhotos([]);
    setName('');
    setEmail('');
    setPhone('');
    setNotes('');
    setSubmittedEmail(null);
  }

  if (submittedEmail) {
    return (
      <View style={styles.done}>
        <Text style={styles.check}>✓</Text>
        <Text style={styles.doneTitle}>Request sent!</Text>
        <Text style={styles.doneBody}>
          {isDemoMode
            ? 'Preview mode: no email was sent. Once email is connected, requests go straight to Emily.'
            : `Thank you! Emily will review your photo and reply to ${submittedEmail} with next steps.`}
        </Text>
        <Button title="Start another request" variant="secondary" onPress={reset} style={{ alignSelf: 'stretch' }} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <DemoBanner />
        <Text style={styles.intro}>
          A custom, hand-made portrait of your pet or loved one. Choose your options below and Emily will be in touch to confirm details and pricing.
        </Text>

        <Step number={1} title="Canvas size" done={!!canvasSize}>
          <View style={styles.row}>
            {SIZES.map((s) => (
              <OptionCard
                key={s.value}
                title={s.label}
                selected={canvasSize === s.value}
                onPress={() => setCanvasSize(s.value)}
                visual={<View style={[styles.sizePreview, { width: s.preview, height: s.preview }, canvasSize === s.value && styles.sizePreviewSelected]} />}
              />
            ))}
          </View>
        </Step>

        <Step number={2} title="Pencil or oil paint" done={!!medium}>
          <View style={styles.row}>
            {MEDIUMS.map((m) => (
              <OptionCard key={m.value} title={m.label} description={m.description} selected={medium === m.value} onPress={() => setMedium(m.value)} />
            ))}
          </View>
        </Step>

        <Step number={3} title="Upload your photo" done={photos.length > 0}>
          <Text style={styles.hint}>A clear, well-lit photo works best.</Text>
          {photos.length > 0 && (
            <View style={styles.photos}>
              {photos.map((p, i) => (
                <View key={`${p.uri}-${i}`}>
                  <Image source={{ uri: p.uri }} style={styles.photo} />
                  <Pressable
                    style={styles.removePhoto}
                    hitSlop={8}
                    accessibilityLabel={`Remove photo ${i + 1}`}
                    onPress={() => setPhotos((prev) => prev.filter((_, j) => j !== i))}>
                    <Text style={styles.removePhotoText}>×</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          )}
          <View style={styles.photoButtons}>
            <Button title={photos.length ? 'Replace photo' : 'Choose a photo'} variant="secondary" onPress={() => addPhotos('library')} style={{ flex: 1 }} />
            {Platform.OS !== 'web' && <Button title="Take a photo" variant="secondary" onPress={() => addPhotos('camera')} style={{ flex: 1 }} />}
          </View>
        </Step>

        <Step number={4} title="Your details" done={!!name.trim() && EMAIL_PATTERN.test(email.trim())}>
          <Field label="Name" value={name} onChangeText={setName} autoComplete="name" textContentType="name" />
          <Field label="Email" value={email} onChangeText={setEmail} autoComplete="email" keyboardType="email-address" autoCapitalize="none" textContentType="emailAddress" />
          <Field label="Phone (optional)" value={phone} onChangeText={setPhone} autoComplete="tel" keyboardType="phone-pad" textContentType="telephoneNumber" />
          <Field
            label="Notes (optional)"
            value={notes}
            onChangeText={setNotes}
            multiline
            placeholder="Tell Emily about your pet or person, and anything you'd like included."
            style={{ minHeight: 100, textAlignVertical: 'top' }}
          />
        </Step>

        {missing.length > 0 && <Text style={styles.missing}>To send your request, add {missing.join(', ')}.</Text>}
        <Button title="Send request" onPress={submit} loading={submitting} disabled={missing.length > 0} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Step({ number, title, done, children }: { number: number; title: string; done: boolean; children: ReactNode }) {
  return (
    <View style={styles.step}>
      <View style={styles.stepHeader}>
        <View style={[styles.stepNumber, done && styles.stepNumberDone]}>
          <Text style={[styles.stepNumberText, done && { color: '#fff' }]}>{done ? '✓' : number}</Text>
        </View>
        <Text style={styles.stepTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function Field({ label, style, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput placeholderTextColor={colors.muted} style={[styles.input, style]} {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 48, width: '100%', maxWidth: 720, alignSelf: 'center' },
  intro: { fontSize: 16, lineHeight: 24, color: colors.muted, marginBottom: 8 },
  step: { marginTop: 24 },
  stepHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  stepNumber: { width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, borderColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  stepNumberDone: { backgroundColor: colors.accent },
  stepNumberText: { color: colors.accent, fontWeight: '700', fontSize: 14 },
  stepTitle: { fontFamily: serif, fontSize: 21, color: colors.text },
  row: { flexDirection: 'row', gap: 10 },
  sizePreview: { borderWidth: 1.5, borderColor: colors.muted, borderRadius: 2 },
  sizePreviewSelected: { borderColor: colors.accent, backgroundColor: '#F3D9CB' },
  hint: { fontSize: 14, color: colors.muted, marginBottom: 12 },
  photos: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
  photo: { width: 140, height: 140, borderRadius: 8, backgroundColor: colors.border },
  removePhoto: { position: 'absolute', top: -6, right: -6, width: 24, height: 24, borderRadius: 12, backgroundColor: colors.text, alignItems: 'center', justifyContent: 'center' },
  removePhotoText: { color: '#fff', fontSize: 16, lineHeight: 18, fontWeight: '700' },
  photoButtons: { flexDirection: 'row', gap: 10 },
  label: { fontSize: 14, color: colors.text, marginBottom: 6, fontWeight: '500' },
  input: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12, fontSize: 16, color: colors.text },
  missing: { fontSize: 14, color: colors.muted, marginTop: 24, marginBottom: 12, textAlign: 'center' },
  done: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: colors.background },
  check: { fontSize: 48, color: colors.success, marginBottom: 12 },
  doneTitle: { fontFamily: serif, fontSize: 26, color: colors.text },
  doneBody: { fontSize: 16, lineHeight: 24, color: colors.muted, textAlign: 'center', marginTop: 12, marginBottom: 28, maxWidth: 420 },
});

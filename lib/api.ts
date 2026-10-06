import { Platform } from 'react-native';

import { sampleArtworks } from '@/data/sampleArtworks';
import type { CommissionPhoto } from '@/lib/photos';
import type { Artwork, CanvasSize, CommissionMedium } from '@/lib/types';

const API_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');

// Without a backend URL the app runs on sample data and checkout is simulated.
export const isDemoMode = !API_URL;

// `sample` is true when showing placeholder artwork because the shop (Stripe) isn't connected yet.
export async function fetchArtworks(): Promise<{ artworks: Artwork[]; sample: boolean }> {
  if (!API_URL) return { artworks: sampleArtworks, sample: true };
  const res = await fetch(`${API_URL}/artworks`);
  if (res.status === 503) return { artworks: sampleArtworks, sample: true };
  if (!res.ok) throw new Error(`Could not load artwork (${res.status})`);
  const data: { artworks: Artwork[] } = await res.json();
  return { artworks: data.artworks, sample: false };
}

export async function createCheckoutSession(params: {
  artworkIds: string[];
  successUrl: string;
  cancelUrl: string;
}): Promise<string> {
  const res = await fetch(`${API_URL}/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.url) throw new Error(data.error ?? 'Could not start checkout');
  return data.url;
}

export async function submitCommission(request: {
  canvasSize: CanvasSize;
  medium: CommissionMedium;
  name: string;
  email: string;
  phone: string;
  notes: string;
  photos: CommissionPhoto[];
}): Promise<void> {
  if (!API_URL) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return;
  }
  const form = new FormData();
  form.append('canvasSize', request.canvasSize);
  form.append('medium', request.medium);
  form.append('name', request.name);
  form.append('email', request.email);
  form.append('phone', request.phone);
  form.append('notes', request.notes);
  for (const photo of request.photos) {
    if (Platform.OS === 'web') {
      const blob = await (await fetch(photo.uri)).blob();
      form.append('photos', blob, photo.name);
    } else {
      // React Native's FormData accepts file descriptors in place of Blobs.
      form.append('photos', { uri: photo.uri, name: photo.name, type: photo.mimeType } as unknown as Blob);
    }
  }
  const res = await fetch(`${API_URL}/commission`, { method: 'POST', body: form });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? 'Could not send your request');
}

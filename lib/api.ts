import { sampleArtworks } from '@/data/sampleArtworks';
import type { Artwork } from '@/lib/types';

const API_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');

// Without a backend URL the app runs on sample data and checkout is simulated.
export const isDemoMode = !API_URL;

export async function fetchArtworks(): Promise<Artwork[]> {
  if (!API_URL) return sampleArtworks;
  const res = await fetch(`${API_URL}/artworks`);
  if (!res.ok) throw new Error(`Could not load artwork (${res.status})`);
  const data: { artworks: Artwork[] } = await res.json();
  return data.artworks;
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

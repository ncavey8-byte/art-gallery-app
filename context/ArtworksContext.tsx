import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { fetchArtworks } from '@/lib/api';
import type { Artwork } from '@/lib/types';

type ArtworksContextValue = {
  artworks: Artwork[];
  isSample: boolean;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  getById: (id: string) => Artwork | undefined;
};

const ArtworksContext = createContext<ArtworksContextValue | null>(null);

export function ArtworksProvider({ children }: { children: ReactNode }) {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [isSample, setIsSample] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchArtworks();
      setArtworks(result.artworks);
      setIsSample(result.sample);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ artworks, isSample, loading, error, refresh, getById: (id: string) => artworks.find((a) => a.id === id) }),
    [artworks, isSample, loading, error, refresh],
  );

  return <ArtworksContext.Provider value={value}>{children}</ArtworksContext.Provider>;
}

export function useArtworks() {
  const ctx = useContext(ArtworksContext);
  if (!ctx) throw new Error('useArtworks must be used inside ArtworksProvider');
  return ctx;
}

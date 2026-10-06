import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import type { Artwork } from '@/lib/types';

type CartContextValue = {
  items: Artwork[];
  total: number;
  add: (artwork: Artwork) => void;
  remove: (id: string) => void;
  clear: () => void;
  has: (id: string) => boolean;
};

const CartContext = createContext<CartContextValue | null>(null);

// Each artwork is an original, so the cart holds at most one of each piece.
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Artwork[]>([]);

  const add = useCallback((artwork: Artwork) => {
    setItems((prev) => (prev.some((a) => a.id === artwork.id) ? prev : [...prev, artwork]));
  }, []);
  const remove = useCallback((id: string) => setItems((prev) => prev.filter((a) => a.id !== id)), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({
      items,
      total: items.reduce((sum, a) => sum + a.price, 0),
      add,
      remove,
      clear,
      has: (id: string) => items.some((a) => a.id === id),
    }),
    [items, add, remove, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}

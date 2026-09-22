import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from "react";

export interface WatchlistItem {
  id: string;
  name: string;
  poster: string;
  backdrop?: string;
  year: number;
  rating: string;
  score: number;
  genres: string[];
  kind: "movie" | "series" | "anime";
  synopsis: string;
  media_type?: string;
}

interface WatchlistContextValue {
  items: WatchlistItem[];
  ids: Set<string>;
  toggle: (item: WatchlistItem) => void;
  add: (item: WatchlistItem) => void;
  remove: (id: string) => void;
  has: (id: string) => boolean;
}

const WatchlistContext = createContext<WatchlistContextValue | null>(null);

function getStorageKey(profileId: string | null): string {
  return `watchlist_${profileId || "default"}`;
}

function loadFromStorage(profileId: string | null): WatchlistItem[] {
  try {
    const raw = localStorage.getItem(getStorageKey(profileId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage(profileId: string | null, items: WatchlistItem[]): void {
  localStorage.setItem(getStorageKey(profileId), JSON.stringify(items));
}

export function WatchlistProvider({
  profileId,
  children,
}: {
  profileId: string | null;
  children: ReactNode;
}) {
  const [items, setItems] = useState<WatchlistItem[]>(() => loadFromStorage(profileId));

  const stableProfileId = profileId;

  const toggle = useCallback(
    (item: WatchlistItem) => {
      setItems((prev) => {
        const exists = prev.some((i) => String(i.id) === String(item.id));
        const next = exists
          ? prev.filter((i) => String(i.id) !== String(item.id))
          : [...prev, item];
        saveToStorage(stableProfileId, next);
        return next;
      });
    },
    [stableProfileId]
  );

  const add = useCallback(
    (item: WatchlistItem) => {
      setItems((prev) => {
        if (prev.some((i) => String(i.id) === String(item.id))) return prev;
        const next = [...prev, item];
        saveToStorage(stableProfileId, next);
        return next;
      });
    },
    [stableProfileId]
  );

  const remove = useCallback(
    (id: string) => {
      setItems((prev) => {
        const next = prev.filter((i) => String(i.id) !== String(id));
        saveToStorage(stableProfileId, next);
        return next;
      });
    },
    [stableProfileId]
  );

  const ids = useMemo(() => new Set(items.map((i) => String(i.id))), [items]);

  const has = useCallback((id: string) => ids.has(String(id)), [ids]);

  const value = useMemo(
    () => ({ items, ids, toggle, add, remove, has }),
    [items, ids, toggle, add, remove, has]
  );

  return (
    <WatchlistContext.Provider value={value}>{children}</WatchlistContext.Provider>
  );
}

export function useWatchlist(): WatchlistContextValue {
  const ctx = useContext(WatchlistContext);
  if (!ctx) throw new Error("useWatchlist must be used within a WatchlistProvider");
  return ctx;
}

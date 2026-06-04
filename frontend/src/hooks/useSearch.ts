// src/hooks/useSearch.ts
import { useMemo, useState } from 'react';

export function useSearch<T extends Record<string, any>>(
  items: T[],
  keys: (keyof T)[]
) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      keys.some((key) => {
        const val = item[key];
        if (val == null) return false;
        return String(val).toLowerCase().includes(q);
      })
    );
  }, [query, items, keys]);

  return { query, setQuery, filtered };
}
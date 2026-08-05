import { useState, useCallback, useMemo, useRef } from 'react';
import type { Village } from '@/types';

// ============================================================
//  useSearch Hook
//  Real-time search with Vietnamese text normalization.
// ============================================================

/**
 * Normalizes Vietnamese text for comparison:
 * - Strips diacritics
 * - Converts to lowercase
 */
function normalizeVietnamese(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

export function useSearch(villages: Village[]) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Pre-index normalized strings for all villages to make searching instant
  const indexedVillages = useMemo(() => {
    return villages.map(v => ({
      village: v,
      normalizedSearch: `${normalizeVietnamese(v.name)} ${normalizeVietnamese(v.description)} ${v.landmarks.map(normalizeVietnamese).join(' ')}`,
    }));
  }, [villages]);

  const results = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return villages;
    const normalized = normalizeVietnamese(trimmed);
    return indexedVillages
      .filter(item => item.normalizedSearch.includes(normalized))
      .map(item => item.village);
  }, [query, villages, indexedVillages]);

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
    setActiveIndex(0);
  }, []);

  const clearSearch = useCallback(() => {
    setQuery('');
    setActiveIndex(0);
    inputRef.current?.focus();
  }, []);

  const moveUp = useCallback(() => {
    setActiveIndex((i) => Math.max(0, i - 1));
  }, []);

  const moveDown = useCallback(() => {
    setActiveIndex((i) => Math.min(results.length - 1, i + 1));
  }, [results.length]);

  const hasResults = results.length > 0;
  const isFiltering = query.trim().length > 0;

  return {
    query,
    results,
    activeIndex,
    inputRef,
    hasResults,
    isFiltering,
    handleQueryChange,
    clearSearch,
    moveUp,
    moveDown,
    setActiveIndex,
  };
}

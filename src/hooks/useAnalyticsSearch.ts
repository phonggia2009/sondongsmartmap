import { useEffect } from 'react';
import { trackSearchLocation } from '@/utils/analytics';

/**
 * Debounces search query and sends a Vercel Analytics custom event
 * when user pauses typing for `delay` ms (default 800ms) with at least 2 characters.
 */
export function useAnalyticsSearch(query: string, category: string, delay: number = 800) {
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) return;

    const timer = setTimeout(() => {
      trackSearchLocation(trimmed, category);
    }, delay);

    return () => clearTimeout(timer);
  }, [query, category, delay]);
}

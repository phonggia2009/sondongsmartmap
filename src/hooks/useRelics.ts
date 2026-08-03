import { useQuery } from '@tanstack/react-query';
import { fetchRelics } from '@/services/dataService';

// ============================================================
//  useRelics Hook
//  Fetches and caches historical relics data via React Query.
//  Consistent with useSchools / useHealthStations pattern.
// ============================================================

const RELICS_QUERY_KEY = ['relics'] as const;

export function useRelics() {
  const query = useQuery({
    queryKey: RELICS_QUERY_KEY,
    queryFn: fetchRelics,
    staleTime: 10 * 60 * 1000, // 10 minutes cache
    gcTime: 30 * 60 * 1000,
    retry: 2,
    retryDelay: 1000,
  });

  return {
    relics: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error as Error | null,
  };
}

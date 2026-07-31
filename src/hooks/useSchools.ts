import { useQuery } from '@tanstack/react-query';
import { fetchSchools } from '@/services/dataService';

// ============================================================
//  useSchools Hook
//  Fetches and caches school GeoJSON data via React Query.
//  Consistent with useVillages pattern.
// ============================================================

const SCHOOLS_QUERY_KEY = ['schools'] as const;

export function useSchools() {
  const query = useQuery({
    queryKey: SCHOOLS_QUERY_KEY,
    queryFn: fetchSchools,
    staleTime: 10 * 60 * 1000,  // 10 minutes — school data rarely changes
    gcTime:   30 * 60 * 1000,   // 30 minutes cache
    retry: 2,
    retryDelay: 1000,
  });

  return {
    schools:   query.data ?? [],
    isLoading: query.isLoading,
    isError:   query.isError,
    error:     query.error as Error | null,
  };
}

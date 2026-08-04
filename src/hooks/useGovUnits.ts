import { useQuery } from '@tanstack/react-query';
import { fetchGovUnits } from '@/services/dataService';

// ============================================================
//  useGovUnits Hook
//  Fetches and caches administrative & public service units via React Query.
// ============================================================

const GOV_UNITS_QUERY_KEY = ['govUnits'] as const;

export function useGovUnits() {
  const query = useQuery({
    queryKey: GOV_UNITS_QUERY_KEY,
    queryFn: fetchGovUnits,
    staleTime: 10 * 60 * 1000, // 10 minutes cache
    gcTime: 30 * 60 * 1000,
    retry: 2,
    retryDelay: 1000,
  });

  return {
    items: query.data ?? [],
    govUnits: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error as Error | null,
  };
}

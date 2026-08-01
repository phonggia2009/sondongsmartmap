import { useQuery } from '@tanstack/react-query';
import { fetchHealthStations } from '@/services/dataService';

// ============================================================
//  useHealthStations Hook
//  Fetches and caches health station GeoJSON data via React Query.
//  Consistent with useSchools / useVillages pattern.
// ============================================================

const HEALTH_STATIONS_QUERY_KEY = ['healthStations'] as const;

export function useHealthStations() {
  const query = useQuery({
    queryKey: HEALTH_STATIONS_QUERY_KEY,
    queryFn: fetchHealthStations,
    staleTime: 10 * 60 * 1000, // 10 minutes cache
    gcTime: 30 * 60 * 1000,
    retry: 2,
    retryDelay: 1000,
  });

  return {
    healthStations: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error as Error | null,
  };
}

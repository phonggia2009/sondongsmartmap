import { useQuery } from '@tanstack/react-query';
import { fetchGeoJSONLayers, type GeoJSONLayersData } from '@/services/dataService';

// ============================================================
//  useGeoJSONLayers Hook
//  Fetches and caches commune boundary, village boundaries, and label points.
// ============================================================

const GEOJSON_LAYERS_QUERY_KEY = ['geojson-layers'] as const;

export function useGeoJSONLayers() {
  const query = useQuery({
    queryKey: GEOJSON_LAYERS_QUERY_KEY,
    queryFn: fetchGeoJSONLayers,
    staleTime: 30 * 60 * 1000, // 30 minutes — boundaries static data
    gcTime: 60 * 60 * 1000,
    retry: 2,
  });

  const data: GeoJSONLayersData = query.data ?? {
    ranhGioiXa: null,
    ranhGioiThon: null,
    thonNhanTen: null,
  };

  return {
    ranhGioiXaData: data.ranhGioiXa,
    ranhGioiThonData: data.ranhGioiThon,
    thonNhanTenData: data.thonNhanTen,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error as Error | null,
  };
}

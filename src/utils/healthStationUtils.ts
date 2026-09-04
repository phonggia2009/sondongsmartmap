import { useMemo } from 'react';
import type { POICategory, POILayerConfig } from '@/types/poi';
import { useHealthStations } from '@/hooks/useHealthStations';

// ============================================================
//  HEALTH STATION UTILITIES & POI CONFIG
// ============================================================

export const HEALTH_STATION_CATEGORIES: POICategory[] = [
  { id: 'Trạm y tế', name: 'Trạm Y Tế', color: '#ef4444', bgColor: '#fee2e2', icon: '🏥' },
];

export const DEFAULT_HEALTH_STATION_FILTERS: Record<string, boolean> = {
  'Trạm y tế': true,
};

export const healthStationConfig: POILayerConfig<any> = {
  id: 'healthStations',
  title: 'Danh Sách Trạm Y Tế',
  unitLabel: 'trạm',
  icon: '🏥',
  categories: HEALTH_STATION_CATEGORIES,
  useItems: () => {
    const { healthStations, isLoading, isError, error } = useHealthStations();
    const items = useMemo(
      () =>
        healthStations.map(h => ({
          ...h,
          categoryId: 'Trạm y tế',
        })),
      [healthStations]
    );
    return {
      items,
      isLoading,
      isError,
      error,
    };
  },
};

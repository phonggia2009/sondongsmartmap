import { memo, useCallback } from 'react';
import { useAppContext } from '@/context/useAppContext';
import { POILayerPanel } from './POILayerPanel';
import { healthStationConfig, HEALTH_STATION_CATEGORIES } from '@/utils/healthStationUtils';
import type { HealthStation } from '@/types';
import { Phone, UserCheck } from 'lucide-react';

// ============================================================
//  HealthStationSidebarContent
//  Sidebar content panel for health stations (Trạm Y Tế)
// ============================================================

interface HealthStationSidebarContentProps {
  onHealthStationSelect?: (station: HealthStation) => void;
}

export const HealthStationSidebarContent = memo(function HealthStationSidebarContent({
  onHealthStationSelect,
}: HealthStationSidebarContentProps) {
  const {
    selectedHealthStation,
    selectHealthStation,
    healthStationFilters,
    toggleHealthStationFilter,
    setHealthStationFilters,
    healthStationSearchQuery,
    setHealthStationSearchQuery,
  } = useAppContext();

  const handleToggleCategory = useCallback(
    (categoryId: string) => {
      toggleHealthStationFilter(categoryId);
    },
    [toggleHealthStationFilter]
  );

  const handleToggleAll = useCallback(
    (state: boolean) => {
      setHealthStationFilters(
        HEALTH_STATION_CATEGORIES.reduce((acc, cat) => {
          acc[cat.id] = state;
          return acc;
        }, {} as Record<string, boolean>)
      );
    },
    [setHealthStationFilters]
  );

  const handleSelectItem = useCallback(
    (item: HealthStation | null) => {
      selectHealthStation(item);
      if (item && onHealthStationSelect) {
        onHealthStationSelect(item);
      }
    },
    [selectHealthStation, onHealthStationSelect]
  );

  const renderItemSubtitle = useCallback((item: HealthStation) => {
    return (
      <div className="space-y-0.5 mt-0.5">
        {item.doctor && (
          <div className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300 font-medium">
            <UserCheck className="w-3 h-3 text-red-500 flex-shrink-0" />
            <span className="truncate">{item.doctor}</span>
          </div>
        )}
        {item.phone ? (
          <a
            href={`tel:${item.phone}`}
            onClick={e => e.stopPropagation()}
            className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 font-semibold hover:underline"
          >
            <Phone className="w-3 h-3 flex-shrink-0" />
            <span>SĐT: {item.phone}</span>
          </a>
        ) : (
          <div className="text-[11px] text-gray-400 italic">Chưa có SĐT</div>
        )}
      </div>
    );
  }, []);

  return (
    <POILayerPanel
      config={healthStationConfig}
      activeCategories={healthStationFilters}
      onToggleCategory={handleToggleCategory}
      onToggleAll={handleToggleAll}
      searchQuery={healthStationSearchQuery}
      onSearchQueryChange={setHealthStationSearchQuery}
      selectedItemId={selectedHealthStation?.id ?? null}
      onSelectItem={handleSelectItem}
      renderItemSubtitle={renderItemSubtitle}
    />
  );
});

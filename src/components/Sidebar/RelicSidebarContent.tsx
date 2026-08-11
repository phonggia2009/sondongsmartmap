import { memo, useCallback } from 'react';
import { useAppContext } from '@/context/AppContext';
import { POILayerPanel } from './POILayerPanel';
import { relicConfig, RELIC_CATEGORIES } from '@/utils/relicUtils';
import type { Relic, RelicType } from '@/types';
import { Landmark, Award, MapPin, Navigation } from 'lucide-react';
import { trackGetDirections } from '@/utils/analytics';

// ============================================================
//  RelicSidebarContent
//  Sidebar content panel for historical relics (Di tích)
// ============================================================

interface RelicSidebarContentProps {
  onRelicSelect?: (relic: Relic) => void;
}

export const RelicSidebarContent = memo(function RelicSidebarContent({
  onRelicSelect,
}: RelicSidebarContentProps) {
  const {
    selectedRelic,
    selectRelic,
    relicFilters,
    toggleRelicFilter,
    setRelicFilters,
    relicSearchQuery,
    setRelicSearchQuery,
  } = useAppContext();

  const handleToggleCategory = useCallback(
    (categoryId: string) => {
      toggleRelicFilter(categoryId as RelicType);
    },
    [toggleRelicFilter]
  );

  const handleToggleAll = useCallback(
    (state: boolean) => {
      setRelicFilters(
        RELIC_CATEGORIES.reduce((acc, cat) => {
          acc[cat.id as RelicType] = state;
          return acc;
        }, {} as Record<RelicType, boolean>)
      );
    },
    [setRelicFilters]
  );

  const handleSelectItem = useCallback(
    (item: Relic | null) => {
      selectRelic(item);
      if (item && onRelicSelect) {
        onRelicSelect(item);
      }
    },
    [selectRelic, onRelicSelect]
  );

  const renderItemSubtitle = useCallback((item: Relic) => {
    const isNational = item.rank === 'Quốc Gia';
    return (
      <div className="space-y-1 mt-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Rank Badge */}
          <span
            className={`
              inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
              ${isNational
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-300 dark:border-blue-700'
              }
            `}
          >
            <Award className="w-2.5 h-2.5" />
            {item.rank}
          </span>

          {/* Village */}
          <span className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
            <MapPin className="w-3 h-3 text-gray-400" />
            {item.village}
          </span>
        </div>

        {/* Decision No */}
        {item.decisionNo && (
          <div className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight truncate">
            <span className="font-semibold">QĐ:</span> {item.decisionNo}
          </div>
        )}

        {/* Directions Button */}
        <div className="pt-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              trackGetDirections(item.name, 'Di tích lịch sử');
              window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lng}`,
                '_blank'
              );
            }}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 border border-purple-200 dark:border-purple-800 transition-colors shadow-2xs"
          >
            <Navigation className="w-3 h-3" />
            <span>Chỉ đường</span>
          </button>
        </div>
      </div>
    );
  }, []);

  return (
    <POILayerPanel
      config={relicConfig}
      activeCategories={relicFilters as Record<string, boolean>}
      onToggleCategory={handleToggleCategory}
      onToggleAll={handleToggleAll}
      searchQuery={relicSearchQuery}
      onSearchQueryChange={setRelicSearchQuery}
      selectedItemId={selectedRelic?.id ?? null}
      onSelectItem={handleSelectItem}
      renderItemSubtitle={renderItemSubtitle}
    />
  );
});

import { memo, useCallback } from 'react';
import { useAppContext } from '@/context/AppContext';
import { POILayerPanel } from './POILayerPanel';
import { govUnitConfig, GOV_UNIT_CATEGORIES } from '@/utils/govUnitUtils';
import type { GovUnit, GovUnitCategory } from '@/types';
import { Building2, MapPin, Navigation } from 'lucide-react';

// ============================================================
//  GovUnitSidebarContent
//  Sidebar content panel for administrative & public service units (Đơn vị HCSN)
// ============================================================

interface GovUnitSidebarContentProps {
  onGovUnitSelect?: (unit: GovUnit) => void;
}

export const GovUnitSidebarContent = memo(function GovUnitSidebarContent({
  onGovUnitSelect,
}: GovUnitSidebarContentProps) {
  const {
    selectedGovUnit,
    selectGovUnit,
    govUnitFilters,
    toggleGovUnitFilter,
    setGovUnitFilters,
    govUnitSearchQuery,
    setGovUnitSearchQuery,
  } = useAppContext();

  const handleToggleCategory = useCallback(
    (categoryId: string) => {
      toggleGovUnitFilter(categoryId as GovUnitCategory);
    },
    [toggleGovUnitFilter]
  );

  const handleToggleAll = useCallback(
    (state: boolean) => {
      setGovUnitFilters(
        GOV_UNIT_CATEGORIES.reduce((acc, cat) => {
          acc[cat.id as GovUnitCategory] = state;
          return acc;
        }, {} as Record<GovUnitCategory, boolean>)
      );
    },
    [setGovUnitFilters]
  );

  const handleSelectItem = useCallback(
    (item: GovUnit | null) => {
      selectGovUnit(item);
      if (item && onGovUnitSelect) {
        onGovUnitSelect(item);
      }
    },
    [selectGovUnit, onGovUnitSelect]
  );

  const renderItemSubtitle = useCallback((item: GovUnit) => {
    return (
      <div className="space-y-1 mt-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Category Badge */}
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            <Building2 className="w-2.5 h-2.5" />
            {item.category}
          </span>

          {/* Address */}
          {item.address && (
            <span className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
              <MapPin className="w-3 h-3 text-gray-400" />
              {item.address}
            </span>
          )}
        </div>

        {/* Directions Button */}
        <div className="pt-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lng}`,
                '_blank'
              );
            }}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800 transition-colors shadow-2xs cursor-pointer"
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
      config={govUnitConfig}
      activeCategories={govUnitFilters as Record<string, boolean>}
      onToggleCategory={handleToggleCategory}
      onToggleAll={handleToggleAll}
      searchQuery={govUnitSearchQuery}
      onSearchQueryChange={setGovUnitSearchQuery}
      selectedItemId={selectedGovUnit?.id ?? null}
      onSelectItem={handleSelectItem}
      renderItemSubtitle={renderItemSubtitle}
    />
  );
});

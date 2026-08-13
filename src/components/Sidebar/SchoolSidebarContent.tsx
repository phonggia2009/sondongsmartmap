import { memo, useCallback } from 'react';
import { useAppContext } from '@/context/AppContext';
import { POILayerPanel } from './POILayerPanel';
import { schoolConfig, SCHOOL_CATEGORIES, getLevelColor } from '@/utils/schoolUtils';
import type { School, SchoolLevel } from '@/types';

// ============================================================
//  School Sidebar Content
//  Thin wrapper connecting POILayerPanel to AppContext for schools
// ============================================================

interface SchoolSidebarContentProps {
  onSchoolSelect?: (school: School) => void;
}

/**
 * Parses school name into new name and old name parts.
 * e.g. "Trường TH Sơn Đồng (TH Lại Yên cũ)"
 *   → { newName: "Trường TH Sơn Đồng", oldName: "TH Lại Yên cũ" }
 */
function parseSchoolName(fullName: string): { newName: string; oldName: string | null } {
  const match = fullName.match(/^(.+?)\s*\((.+)\)\s*$/);
  if (match) {
    return { newName: match[1].trim(), oldName: match[2].trim() };
  }
  return { newName: fullName, oldName: null };
}

/** Subtitle renderer: shows old name tag if available */
function SchoolSubtitle({ item }: { item: School }) {
  const { oldName } = parseSchoolName(item.name);
  const color = getLevelColor(item.level);

  return (
    <div className="flex flex-wrap items-center gap-1 mt-0.5">
      {/* Level badge */}
      <span
        className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide flex-shrink-0"
        style={{ color, backgroundColor: `${color}1a`, border: `1px solid ${color}44` }}
      >
        {item.level}
      </span>
      {/* Old name */}
      {oldName && (
        <span className="text-[11px] text-gray-400 dark:text-gov-500 italic leading-tight">
          Phân hiệu: {oldName}
        </span>
      )}
    </div>
  );
}

export const SchoolSidebarContent = memo(function SchoolSidebarContent({
  onSchoolSelect,
}: SchoolSidebarContentProps) {
  const { 
    selectedSchool, 
    selectSchool, 
    schoolFilters, 
    toggleSchoolFilter,
    setSchoolFilters,
    schoolSearchQuery,
    setSchoolSearchQuery,
  } = useAppContext();

  const handleToggleCategory = useCallback((categoryId: string) => {
    toggleSchoolFilter(categoryId as SchoolLevel);
  }, [toggleSchoolFilter]);

  const handleToggleAll = useCallback((state: boolean) => {
    setSchoolFilters(
      SCHOOL_CATEGORIES.reduce((acc, cat) => {
        acc[cat.id as SchoolLevel] = state;
        return acc;
      }, {} as Record<SchoolLevel, boolean>)
    );
  }, [setSchoolFilters]);

  const handleSelectItem = useCallback((item: School | null) => {
    selectSchool(item);
    if (item && onSchoolSelect) {
      onSchoolSelect(item);
    }
  }, [selectSchool, onSchoolSelect]);

  const renderSubtitle = useCallback(
    (item: School) => <SchoolSubtitle item={item} />,
    []
  );

  return (
    <POILayerPanel
      config={schoolConfig}
      activeCategories={schoolFilters as Record<string, boolean>}
      onToggleCategory={handleToggleCategory}
      onToggleAll={handleToggleAll}
      searchQuery={schoolSearchQuery}
      onSearchQueryChange={setSchoolSearchQuery}
      selectedItemId={selectedSchool?.id ?? null}
      onSelectItem={handleSelectItem}
      renderItemSubtitle={renderSubtitle}
    />
  );
});

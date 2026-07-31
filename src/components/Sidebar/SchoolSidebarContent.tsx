import { memo, useCallback } from 'react';
import { useAppContext } from '@/context/AppContext';
import { POILayerPanel } from './POILayerPanel';
import { schoolConfig, SCHOOL_CATEGORIES } from '@/utils/schoolUtils';
import type { SchoolLevel } from '@/types';

// ============================================================
//  School Sidebar Content
//  Thin wrapper connecting POILayerPanel to AppContext for schools
// ============================================================

export const SchoolSidebarContent = memo(function SchoolSidebarContent() {
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

  return (
    <POILayerPanel
      config={schoolConfig}
      activeCategories={schoolFilters as Record<string, boolean>}
      onToggleCategory={handleToggleCategory}
      onToggleAll={handleToggleAll}
      searchQuery={schoolSearchQuery}
      onSearchQueryChange={setSchoolSearchQuery}
      selectedItemId={selectedSchool?.id ?? null}
      onSelectItem={(item) => selectSchool(item as any)}
    />
  );
});

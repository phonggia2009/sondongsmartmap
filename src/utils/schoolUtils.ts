import { useMemo } from 'react';
import type { SchoolLevel } from '@/types';
import type { POICategory, POILayerConfig } from '@/types/poi';
import { useSchools } from '@/hooks/useSchools';

// ============================================================
//  SCHOOL UTILITIES & POI CONFIG
// ============================================================

export const SCHOOL_LEVELS: SchoolLevel[] = ['Mầm non', 'Tiểu học', 'THCS', 'THPT', 'Khác'];

export const SCHOOL_CATEGORIES: POICategory[] = [
  { id: 'Mầm non', name: 'Mầm non', color: '#22c55e', bgColor: '#dcfce7', icon: '🌱' },
  { id: 'Tiểu học', name: 'Tiểu học', color: '#3b82f6', bgColor: '#dbeafe', icon: '📚' },
  { id: 'THCS', name: 'THCS', color: '#f97316', bgColor: '#ffedd5', icon: '🎒' },
  { id: 'THPT', name: 'THPT', color: '#ef4444', bgColor: '#fee2e2', icon: '🎓' },
  { id: 'Khác', name: 'Khác', color: '#6b7280', bgColor: '#f3f4f6', icon: '🏫' },
];

export const DEFAULT_SCHOOL_FILTERS: Record<SchoolLevel, boolean> = SCHOOL_CATEGORIES.reduce(
  (acc, cat) => {
    acc[cat.id as SchoolLevel] = true;
    return acc;
  },
  {} as Record<SchoolLevel, boolean>
);

const CATEGORY_MAP = new Map<string, POICategory>(
  SCHOOL_CATEGORIES.map(cat => [cat.id, cat])
);

export const schoolConfig: POILayerConfig<any> = {
  id: 'schools',
  title: 'Danh Sách Trường',
  icon: '🏫',
  categories: SCHOOL_CATEGORIES,
  // We wrap useSchools to adapt to POILayerHookResult format
  useItems: () => {
    const { schools, isLoading, isError, error } = useSchools();
    const items = useMemo(
      () => schools.map(s => ({
        ...s,
        categoryId: s.level // Map level to categoryId for generic POI
      })),
      [schools]
    );
    return {
      items,
      isLoading,
      isError,
      error
    };
  }
};

export function getLevelCategory(level: SchoolLevel): POICategory {
  return CATEGORY_MAP.get(level) ?? {
    id: level,
    name: level,
    color: '#6b7280',
    bgColor: '#f3f4f6',
    icon: '🏫',
  };
}

export function getLevelColor(level: SchoolLevel): string {
  return getLevelCategory(level).color;
}

export function getLevelBgColor(level: SchoolLevel): string {
  return getLevelCategory(level).bgColor;
}

export function getLevelEmoji(level: SchoolLevel): string {
  return getLevelCategory(level).icon;
}

export function parseSchoolLevel(name: string): SchoolLevel {
  const lower = name.toLowerCase();
  if (lower.includes('mầm non'))  return 'Mầm non';
  if (lower.includes('thcs'))     return 'THCS';
  if (lower.includes('thpt'))     return 'THPT';
  if (lower.includes('tiểu học')) return 'Tiểu học';
  if (lower.includes('th '))      return 'Tiểu học';
  return 'Khác';
}

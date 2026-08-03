import { useMemo } from 'react';
import type { POICategory, POILayerConfig } from '@/types/poi';
import type { RelicType } from '@/types';
import { useRelics } from '@/hooks/useRelics';

// ============================================================
//  HISTORICAL RELIC UTILITIES & POI CONFIG
// ============================================================

export const RELIC_CATEGORIES: POICategory[] = [
  { id: 'Đình', name: 'Đình', color: '#8b5cf6', bgColor: '#f3e8ff', icon: '⛩️' },
  { id: 'Chùa', name: 'Chùa', color: '#d97706', bgColor: '#fef3c7', icon: '🛕' },
  { id: 'Đền, Quán', name: 'Đền, Quán', color: '#e11d48', bgColor: '#ffe4e6', icon: '🏛️' },
  { id: 'Lăng - Miếu - Nhà thờ', name: 'Lăng, Miếu, Nhà thờ', color: '#4f46e5', bgColor: '#e0e7ff', icon: '📜' },
];

export const DEFAULT_RELIC_FILTERS: Record<RelicType, boolean> = {
  'Đình': true,
  'Chùa': true,
  'Đền, Quán': true,
  'Lăng - Miếu - Nhà thờ': true,
};

export const relicConfig: POILayerConfig<any> = {
  id: 'relics',
  title: 'Danh Sách Di Tích',
  icon: '🏛️',
  categories: RELIC_CATEGORIES,
  useItems: () => {
    const { relics, isLoading, isError, error } = useRelics();
    const items = useMemo(
      () =>
        relics.map(r => ({
          ...r,
          categoryId: r.type,
        })),
      [relics]
    );
    return {
      items,
      isLoading,
      isError,
      error,
    };
  },
};

export function getRelicColor(type: RelicType): string {
  const cat = RELIC_CATEGORIES.find(c => c.id === type);
  return cat ? cat.color : '#8b5cf6';
}

export function getRelicBgColor(type: RelicType): string {
  const cat = RELIC_CATEGORIES.find(c => c.id === type);
  return cat ? cat.bgColor : '#f3e8ff';
}

export function getRelicEmoji(type: RelicType): string {
  const cat = RELIC_CATEGORIES.find(c => c.id === type);
  return cat ? cat.icon : '🏛️';
}

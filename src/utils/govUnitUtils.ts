import type { POICategory, POILayerConfig } from '@/types/poi';
import type { GovUnit, GovUnitCategory } from '@/types';
import { useGovUnits } from '@/hooks/useGovUnits';

export const GOV_UNIT_CATEGORIES: POICategory[] = [
  {
    id: 'Hành chính',
    name: 'Hành chính',
    color: '#3b82f6',     // Blue
    bgColor: '#dbeafe',   // Light blue
    icon: '🏢',
  },
  {
    id: 'Đảng - Đoàn thể',
    name: 'Đảng - Đoàn thể',
    color: '#ef4444',     // Red
    bgColor: '#fee2e2',   // Light red
    icon: '🏛️',
  },
  {
    id: 'Lực lượng vũ trang',
    name: 'Lực lượng vũ trang',
    color: '#10b981',     // Emerald Green
    bgColor: '#d1fae5',   // Light green
    icon: '🛡️',
  },
];

export const DEFAULT_GOV_UNIT_FILTERS: Record<GovUnitCategory, boolean> = {
  'Hành chính': true,
  'Đảng - Đoàn thể': true,
  'Lực lượng vũ trang': true,
};

export const getGovUnitCategoryColor = (category: GovUnitCategory): string => {
  const found = GOV_UNIT_CATEGORIES.find(c => c.id === category);
  return found?.color || '#3b82f6';
};

export const getGovUnitCategoryEmoji = (category: GovUnitCategory): string => {
  const found = GOV_UNIT_CATEGORIES.find(c => c.id === category);
  return found?.icon || '🏢';
};

export const govUnitConfig: POILayerConfig<GovUnit> = {
  id: 'govUnits',
  title: 'Đơn vị HCSN',
  icon: '🏢',
  categories: GOV_UNIT_CATEGORIES,
  useItems: useGovUnits,
};

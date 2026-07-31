import type { ReactNode } from 'react';

// ============================================================
//  GENERIC POI (Point of Interest) TYPES
// ============================================================

export interface POICategory {
  id: string;          // e.g. "Mầm non"
  name: string;        // e.g. "Mầm non"
  color: string;       // e.g. "#22c55e"
  bgColor: string;     // e.g. "#dcfce7"
  icon: string;        // e.g. "🌱"
}

export interface POIItem {
  id: string | number;
  name: string;
  categoryId: string;  // Maps to POICategory.id
  lat: number;
  lng: number;
  [key: string]: any;  // Allow additional specific fields
}

export interface POILayerHookResult<T extends POIItem = POIItem> {
  items: T[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

export interface POILayerConfig<T extends POIItem = POIItem> {
  id: string;                 // e.g. 'schools'
  title: string;              // e.g. 'Trường học'
  icon: ReactNode | string;   // e.g. '🏫' or a Lucide icon
  categories: POICategory[];
  useItems: () => POILayerHookResult<T>;
}

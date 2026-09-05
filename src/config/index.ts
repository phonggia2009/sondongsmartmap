import type { AppConfig } from '@/types';

// ============================================================
//  APPLICATION CONFIGURATION
//  Modify this file to customize the application without
//  touching any component source code.
// ============================================================

export const APP_CONFIG: AppConfig = {
  // ─── Identity ─────────────────────────────────────────────
  title: 'Bản đồ xã Sơn Đồng',
  subtitle: 'UBND Xã Sơn Đồng',
  organization: 'Bản đồ hành chính sau sáp nhập',
  logo: null, // Set to '/logo.png' if you have a logo

  // ─── Brand Colors ──────────────────────────────────────────
  colors: {
    primary: '#1e3a8a',   // Government deep blue
    accent: '#3b82f6',   // Interactive blue
    gold: '#f59e0b',   // Accent gold for highlights
  },

  // ─── Animation ─────────────────────────────────────────────
  animation: {
    duration: 400,        // milliseconds
    ease: 'easeInOut',
  },

  // ─── Public Asset Paths ────────────────────────────────────
  paths: {
    data: '/data',
  },
};

// ─── Derived helpers ───────────────────────────────────────────

/** Returns the full URL for the JSON data file */
export const getDataUrl = (): string =>
  `${APP_CONFIG.paths.data}/villages.json`;

/** Returns the full URL for schools GeoJSON file */
export const getSchoolsGeoJsonUrl = (): string =>
  `${APP_CONFIG.paths.data}/danhsachtruongsausapxep.geojson`;

/** Returns the full URL for commune boundary GeoJSON file */
export const getCommuneBoundaryGeoJsonUrl = (): string =>
  `${APP_CONFIG.paths.data}/danhgioixa.geojson`;

/** Returns the full URL for village boundaries GeoJSON file */
export const getVillageBoundariesGeoJsonUrl = (): string =>
  `${APP_CONFIG.paths.data}/ranhgioithon.geojson`;

/** Returns the full URL for village name label points GeoJSON file */
export const getVillageLabelsGeoJsonUrl = (): string =>
  `${APP_CONFIG.paths.data}/thon_nhan_ten.geojson`;

/** Returns the full URL for health stations (Trạm y tế) GeoJSON file */
export const getHealthStationsGeoJsonUrl = (): string =>
  `${APP_CONFIG.paths.data}/tramyte.geojson`;

/** Returns the full URL for relics (Di tích) JSON file */
export const getRelicsDataUrl = (): string =>
  `${APP_CONFIG.paths.data}/relics.json`;

/** Returns the full URL for administrative & public service units GeoJSON file */
export const getGovUnitsGeoJsonUrl = (): string =>
  `${APP_CONFIG.paths.data}/danhsachdonvihanhchinhsunghiep.geojson`;


/** Boundary direction labels in Vietnamese */
export const DIRECTION_LABELS: Record<string, string> = {
  north: 'Phía Bắc',
  south: 'Phía Nam',
  east: 'Phía Đông',
  west: 'Phía Tây',
};

export const DIRECTION_ICONS: Record<string, string> = {
  north: '↑',
  south: '↓',
  east: '→',
  west: '←',
};

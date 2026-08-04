// ============================================================
//  VILLAGE DATA TYPES
// ============================================================

export interface Village {
  id: number;
  name: string;
  image: string;           // filename only, e.g. "ngoai.png"
  area: string;            // e.g. "95 ha"
  partyMembers: number;
  households?: number;
  population?: number;
  communityCenter?: string;
  communityCenterAddress?: string;
  communityCenterCoords?: {
    lat: number;
    lng: number;
  };
  east: string;
  west: string;
  south: string;
  north: string;
  landmarks: string[];
  description: string;
  coordinates?: {          // future GIS support
    lat: number;
    lng: number;
  };
  polygon?: [number, number][];  // future GeoJSON support
  geojson_boundary_index?: number;
  geojson_label_index?: number;
}

// ============================================================
//  SCHOOL DATA TYPES
// ============================================================

export type SchoolLevel = 'Mầm non' | 'Tiểu học' | 'THCS' | 'THPT' | 'Khác';

export interface School {
  id: string;
  name: string;
  level: SchoolLevel;
  lat: number;
  lng: number;
// ============================================================
//  HEALTH STATION DATA TYPES
// ============================================================

export interface HealthStation {
  id: string;
  name: string;
  doctor?: string;
  phone?: string;
  lat: number;
  lng: number;
}

// ============================================================
//  HISTORICAL RELIC DATA TYPES
// ============================================================

export type RelicType = 'Đình' | 'Chùa' | 'Đền, Quán' | 'Lăng - Miếu - Nhà thờ';
export type RelicRank = 'Quốc Gia' | 'Thành phố' | 'Chưa xếp hạng';

export interface Relic {
  id: string;
  name: string;
  type: RelicType;
  rank: RelicRank;
  decisionNo: string;
  village: string;
  lat: number;
  lng: number;
  description?: string;
}


// ============================================================
//  APP CONFIGURATION TYPES
// ============================================================

export interface AnimationConfig {
  duration: number;
  ease: string;
}

export interface PathsConfig {
  maps: string;
  villages: string;
  data: string;
}

export interface ColorsConfig {
  primary: string;
  accent: string;
  gold: string;
}

export interface AppConfig {
  title: string;
  subtitle: string;
  organization: string;
  logo: string | null;
  colors: ColorsConfig;
  animation: AnimationConfig;
  paths: PathsConfig;
}

// ============================================================
//  UI STATE TYPES
// ============================================================

export type Theme = 'light' | 'dark';
export type PanelLayout = 'standard' | 'presentation' | 'compact';

// ============================================================
//  SEARCH TYPES
// ============================================================

export interface SearchState {
  query: string;
  results: Village[];
  activeIndex: number;
}

// ============================================================
//  VIEWER TYPES
// ============================================================

export interface ViewerState {
  scale: number;
  positionX: number;
  positionY: number;
}

// ============================================================
//  MAP OVERLAY TYPES (future GIS/GeoJSON support)
// ============================================================

export interface MapLayer {
  id: string;
  name: string;
  type: 'image' | 'geojson' | 'tile' | 'wms';
  visible: boolean;
  opacity: number;
  url?: string;
  data?: unknown;
}

export interface BoundaryDirection {
  direction: 'north' | 'south' | 'east' | 'west';
  label: string;
  value: string;
}

// ============================================================
//  ERROR TYPES
// ============================================================

export interface AppError {
  code: string;
  message: string;
  details?: string;
}

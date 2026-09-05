import { createContext, useContext } from 'react';
import type {
  Village,
  School,
  SchoolLevel,
  HealthStation,
  Relic,
  RelicType,
  GovUnit,
  GovUnitCategory,
} from '@/types';

// ============================================================
//  APP CONTEXT TYPES & HOOK
// ============================================================

export type SidebarTab = 'villages' | 'schools' | 'healthStations' | 'relics' | 'govUnits';

export interface AppContextValue {
  // Village selection
  selectedVillage: Village | null;
  selectVillage: (village: Village | null) => void;

  // School selection
  selectedSchool: School | null;
  selectSchool: (school: School | null) => void;

  // Health station selection
  selectedHealthStation: HealthStation | null;
  selectHealthStation: (station: HealthStation | null) => void;

  // Relic selection
  selectedRelic: Relic | null;
  selectRelic: (relic: Relic | null) => void;

  // GovUnit selection
  selectedGovUnit: GovUnit | null;
  selectGovUnit: (unit: GovUnit | null) => void;

  // School filters & search
  schoolFilters: Record<SchoolLevel, boolean>;
  toggleSchoolFilter: (level: SchoolLevel) => void;
  setSchoolFilters: React.Dispatch<React.SetStateAction<Record<SchoolLevel, boolean>>>;
  schoolSearchQuery: string;
  setSchoolSearchQuery: (query: string) => void;

  // Health station filters & search
  healthStationFilters: Record<string, boolean>;
  toggleHealthStationFilter: (category: string) => void;
  setHealthStationFilters: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  healthStationSearchQuery: string;
  setHealthStationSearchQuery: (query: string) => void;

  // Relic filters & search
  relicFilters: Record<RelicType, boolean>;
  toggleRelicFilter: (type: RelicType) => void;
  setRelicFilters: React.Dispatch<React.SetStateAction<Record<RelicType, boolean>>>;
  relicSearchQuery: string;
  setRelicSearchQuery: (query: string) => void;

  // GovUnit filters & search
  govUnitFilters: Record<GovUnitCategory, boolean>;
  toggleGovUnitFilter: (category: GovUnitCategory) => void;
  setGovUnitFilters: React.Dispatch<React.SetStateAction<Record<GovUnitCategory, boolean>>>;
  govUnitSearchQuery: string;
  setGovUnitSearchQuery: (query: string) => void;

  // View mode
  isOverview: boolean;

  // Sidebar
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  activeSidebarTab: SidebarTab;
  setActiveSidebarTab: (tab: SidebarTab) => void;

  // Search focus trigger (Ctrl+K)
  searchFocusTrigger: number;
  triggerFocusSearch: () => void;

  // Global Search Modal (Command Palette)
  isGlobalSearchOpen: boolean;
  openGlobalSearch: () => void;
  closeGlobalSearch: () => void;
  clearAllSelections: () => void;

  // Info panel
  infoPanelOpen: boolean;
  setInfoPanelOpen: (open: boolean) => void;
  toggleInfoPanel: () => void;

  // Theme
  isDark: boolean;
  toggleTheme: () => void;

  // Fullscreen
  isFullscreen: boolean;
  toggleFullscreen: () => void;

  // Onboarding Tour
  isTourOpen: boolean;
  startTour: () => void;
  closeTour: () => void;
  completeTour: () => void;
  hasSeenTour: boolean;
}

export const AppContext = createContext<AppContextValue | null>(null);

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useAppContext must be used inside AppProvider');
  }
  return ctx;
}

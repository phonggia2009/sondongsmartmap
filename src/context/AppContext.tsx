import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import type { Village, School, SchoolLevel, HealthStation, Relic, RelicType, GovUnit, GovUnitCategory } from '@/types';
import { useTheme } from '@/hooks/useTheme';
import { useFullscreen } from '@/hooks/useFullscreen';
import { DEFAULT_SCHOOL_FILTERS } from '@/utils/schoolUtils';
import { DEFAULT_HEALTH_STATION_FILTERS } from '@/utils/healthStationUtils';
import { DEFAULT_RELIC_FILTERS } from '@/utils/relicUtils';
import { DEFAULT_GOV_UNIT_FILTERS } from '@/utils/govUnitUtils';
import { trackViewLocation, trackOpenStoryMap } from '@/utils/analytics';
import { useAnalyticsSearch } from '@/hooks/useAnalyticsSearch';

// ============================================================
//  APP CONTEXT
//  Global UI state shared across all components.
// ============================================================

export type SidebarTab = 'villages' | 'schools' | 'healthStations' | 'relics' | 'govUnits';

interface AppContextValue {
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

const AppContext = createContext<AppContextValue | null>(null);

const TOUR_STORAGE_KEY = 'storymap_tour_seen';

export function AppProvider({ children }: { children: ReactNode }) {
  const [selectedVillage, setSelectedVillage]             = useState<Village | null>(null);
  const [selectedSchool, setSelectedSchool]               = useState<School | null>(null);
  const [selectedHealthStation, setSelectedHealthStation] = useState<HealthStation | null>(null);
  const [selectedRelic, setSelectedRelic]                 = useState<Relic | null>(null);
  const [selectedGovUnit, setSelectedGovUnit]             = useState<GovUnit | null>(null);

  const [schoolFilters, setSchoolFilters]                 = useState<Record<SchoolLevel, boolean>>(DEFAULT_SCHOOL_FILTERS);
  const [schoolSearchQuery, setSchoolSearchQuery]         = useState('');
  const handleSetSchoolSearchQuery = useCallback((query: string) => {
    setSchoolSearchQuery(query);
  }, []);

  const [healthStationFilters, setHealthStationFilters]         = useState<Record<string, boolean>>(DEFAULT_HEALTH_STATION_FILTERS);
  const [healthStationSearchQuery, setHealthStationSearchQuery] = useState('');
  const handleSetHealthStationSearchQuery = useCallback((query: string) => {
    setHealthStationSearchQuery(query);
  }, []);

  const [relicFilters, setRelicFilters]         = useState<Record<RelicType, boolean>>(DEFAULT_RELIC_FILTERS);
  const [relicSearchQuery, setRelicSearchQuery] = useState('');
  const handleSetRelicSearchQuery = useCallback((query: string) => {
    setRelicSearchQuery(query);
  }, []);

  const [govUnitFilters, setGovUnitFilters]         = useState<Record<GovUnitCategory, boolean>>(DEFAULT_GOV_UNIT_FILTERS);
  const [govUnitSearchQuery, setGovUnitSearchQuery] = useState('');
  const handleSetGovUnitSearchQuery = useCallback((query: string) => {
    setGovUnitSearchQuery(query);
  }, []);

  // Track search queries for POI layers
  useAnalyticsSearch(schoolSearchQuery, 'Trường học');
  useAnalyticsSearch(healthStationSearchQuery, 'Trạm Y tế');
  useAnalyticsSearch(relicSearchQuery, 'Di tích lịch sử');
  useAnalyticsSearch(govUnitSearchQuery, 'Cơ quan hành chính');

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSidebarTabState, setActiveSidebarTabState] = useState<SidebarTab>('villages');
  const [infoPanelOpen, setInfoPanelOpen]                = useState(true);

  // Onboarding Tour state
  const [isTourOpen, setIsTourOpen]   = useState(false);
  const [hasSeenTour, setHasSeenTour] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem(TOUR_STORAGE_KEY) === 'true';
  });

  React.useEffect(() => {
    if (!hasSeenTour) {
      const timer = setTimeout(() => {
        setIsTourOpen(true);
        trackOpenStoryMap();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [hasSeenTour]);

  const startTour = useCallback(() => {
    setIsTourOpen(true);
    trackOpenStoryMap();
  }, []);

  const closeTour = useCallback(() => {
    setIsTourOpen(false);
  }, []);

  const completeTour = useCallback(() => {
    setIsTourOpen(false);
    setHasSeenTour(true);
    try {
      localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    } catch (err) {
      console.error('Failed to save tour state to localStorage:', err);
    }
  }, []);

  const { isDark, toggle: toggleTheme }            = useTheme();
  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen();

  const setActiveSidebarTab = useCallback((tab: SidebarTab) => {
    setActiveSidebarTabState(prev => {
      if (prev !== tab) {
        // Deselect item when switching tabs to prevent state leakage between modes
        setSelectedVillage(null);
        setSelectedSchool(null);
        setSelectedHealthStation(null);
        setSelectedRelic(null);
        setSelectedGovUnit(null);
      }
      return tab;
    });
  }, []);

  const selectVillage = useCallback((village: Village | null) => {
    if (village && village.id !== selectedVillage?.id) {
      trackViewLocation(village.name, 'Thôn / Xã');
    }
    setSelectedVillage(village);
    if (village) {
      setSelectedSchool(null);
      setSelectedHealthStation(null);
      setSelectedRelic(null);
      setSelectedGovUnit(null);
    }
    setInfoPanelOpen(prev => {
      if (village === null) return false;
      return prev ? prev : true;
    });
  }, [selectedVillage]);

  const selectSchool = useCallback((school: School | null) => {
    if (school && school.id !== selectedSchool?.id) {
      trackViewLocation(school.name, 'Trường học');
    }
    setSelectedSchool(school);
    if (school) {
      setSelectedVillage(null);
      setSelectedHealthStation(null);
      setSelectedRelic(null);
      setSelectedGovUnit(null);
    }
  }, [selectedSchool]);

  const selectHealthStation = useCallback((station: HealthStation | null) => {
    if (station && station.id !== selectedHealthStation?.id) {
      trackViewLocation(station.name, 'Trạm Y tế');
    }
    setSelectedHealthStation(station);
    if (station) {
      setSelectedVillage(null);
      setSelectedSchool(null);
      setSelectedRelic(null);
      setSelectedGovUnit(null);
    }
  }, [selectedHealthStation]);

  const selectRelic = useCallback((relic: Relic | null) => {
    if (relic && relic.id !== selectedRelic?.id) {
      trackViewLocation(relic.name, 'Di tích lịch sử');
    }
    setSelectedRelic(relic);
    if (relic) {
      setSelectedVillage(null);
      setSelectedSchool(null);
      setSelectedHealthStation(null);
      setSelectedGovUnit(null);
    }
  }, [selectedRelic]);

  const selectGovUnit = useCallback((unit: GovUnit | null) => {
    if (unit && unit.id !== selectedGovUnit?.id) {
      trackViewLocation(unit.name, 'Cơ quan hành chính');
    }
    setSelectedGovUnit(unit);
    if (unit) {
      setSelectedVillage(null);
      setSelectedSchool(null);
      setSelectedHealthStation(null);
      setSelectedRelic(null);
    }
  }, [selectedGovUnit]);

  const toggleSchoolFilter = useCallback((level: SchoolLevel) => {
    setSchoolFilters(prev => ({ ...prev, [level]: !prev[level] }));
  }, []);

  const toggleHealthStationFilter = useCallback((category: string) => {
    setHealthStationFilters(prev => ({ ...prev, [category]: !prev[category] }));
  }, []);

  const toggleRelicFilter = useCallback((type: RelicType) => {
    setRelicFilters(prev => ({ ...prev, [type]: !prev[type] }));
  }, []);

  const toggleGovUnitFilter = useCallback((category: GovUnitCategory) => {
    setGovUnitFilters(prev => ({ ...prev, [category]: !prev[category] }));
  }, []);

  const toggleInfoPanel = useCallback(() => {
    setInfoPanelOpen(o => !o);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(o => !o);
  }, []);

  const value = useMemo<AppContextValue>(() => ({
    selectedVillage,
    selectVillage,
    selectedSchool,
    selectSchool,
    selectedHealthStation,
    selectHealthStation,
    selectedRelic,
    selectRelic,
    selectedGovUnit,
    selectGovUnit,
    schoolFilters,
    toggleSchoolFilter,
    setSchoolFilters,
    schoolSearchQuery,
    setSchoolSearchQuery: handleSetSchoolSearchQuery,
    healthStationFilters,
    toggleHealthStationFilter,
    setHealthStationFilters,
    healthStationSearchQuery,
    setHealthStationSearchQuery: handleSetHealthStationSearchQuery,
    relicFilters,
    toggleRelicFilter,
    setRelicFilters,
    relicSearchQuery,
    setRelicSearchQuery: handleSetRelicSearchQuery,
    govUnitFilters,
    toggleGovUnitFilter,
    setGovUnitFilters,
    govUnitSearchQuery,
    setGovUnitSearchQuery: handleSetGovUnitSearchQuery,
    isOverview: selectedVillage === null && selectedSchool === null && selectedHealthStation === null && selectedRelic === null && selectedGovUnit === null,
    sidebarOpen,
    setSidebarOpen,
    toggleSidebar,
    activeSidebarTab: activeSidebarTabState,
    setActiveSidebarTab,
    infoPanelOpen,
    setInfoPanelOpen,
    toggleInfoPanel,
    isDark,
    toggleTheme,
    isFullscreen,
    toggleFullscreen,
    isTourOpen,
    startTour,
    closeTour,
    completeTour,
    hasSeenTour,
  }), [
    selectedVillage, selectVillage,
    selectedSchool, selectSchool,
    selectedHealthStation, selectHealthStation,
    selectedRelic, selectRelic,
    selectedGovUnit, selectGovUnit,
    schoolFilters, toggleSchoolFilter, schoolSearchQuery, handleSetSchoolSearchQuery,
    healthStationFilters, toggleHealthStationFilter, healthStationSearchQuery, handleSetHealthStationSearchQuery,
    relicFilters, toggleRelicFilter, relicSearchQuery, handleSetRelicSearchQuery,
    govUnitFilters, toggleGovUnitFilter, govUnitSearchQuery, handleSetGovUnitSearchQuery,
    sidebarOpen, setSidebarOpen, toggleSidebar, activeSidebarTabState, setActiveSidebarTab,
    infoPanelOpen, setInfoPanelOpen, toggleInfoPanel,
    isDark, toggleTheme,
    isFullscreen, toggleFullscreen,
    isTourOpen, startTour, closeTour, completeTour, hasSeenTour,
  ]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useAppContext must be used inside AppProvider');
  }
  return ctx;
}


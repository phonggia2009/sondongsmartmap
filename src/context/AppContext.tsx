import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import type { Village, School, SchoolLevel, HealthStation } from '@/types';
import { useTheme } from '@/hooks/useTheme';
import { useFullscreen } from '@/hooks/useFullscreen';
import { DEFAULT_SCHOOL_FILTERS } from '@/utils/schoolUtils';
import { DEFAULT_HEALTH_STATION_FILTERS } from '@/utils/healthStationUtils';

// ============================================================
//  APP CONTEXT
//  Global UI state shared across all components.
// ============================================================

export type SidebarTab = 'villages' | 'schools' | 'healthStations';

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
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [hasSeenTour]);

  const startTour = useCallback(() => {
    setIsTourOpen(true);
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
      }
      return tab;
    });
  }, []);

  const selectVillage = useCallback((village: Village | null) => {
    setSelectedVillage(village);
    if (village) {
      setSelectedSchool(null);
      setSelectedHealthStation(null);
    }
    setInfoPanelOpen(prev => {
      if (village === null) return false;
      return prev ? prev : true;
    });
  }, []);

  const selectSchool = useCallback((school: School | null) => {
    setSelectedSchool(school);
    if (school) {
      setSelectedVillage(null);
      setSelectedHealthStation(null);
    }
  }, []);

  const selectHealthStation = useCallback((station: HealthStation | null) => {
    setSelectedHealthStation(station);
    if (station) {
      setSelectedVillage(null);
      setSelectedSchool(null);
    }
  }, []);

  const toggleSchoolFilter = useCallback((level: SchoolLevel) => {
    setSchoolFilters(prev => ({ ...prev, [level]: !prev[level] }));
  }, []);

  const toggleHealthStationFilter = useCallback((category: string) => {
    setHealthStationFilters(prev => ({ ...prev, [category]: !prev[category] }));
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
    isOverview: selectedVillage === null && selectedSchool === null && selectedHealthStation === null,
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
    schoolFilters, toggleSchoolFilter, schoolSearchQuery, handleSetSchoolSearchQuery,
    healthStationFilters, toggleHealthStationFilter, healthStationSearchQuery, handleSetHealthStationSearchQuery,
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


import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import type { Village, School, SchoolLevel } from '@/types';
import { useTheme } from '@/hooks/useTheme';
import { useFullscreen } from '@/hooks/useFullscreen';
import { DEFAULT_SCHOOL_FILTERS } from '@/utils/schoolUtils';

// ============================================================
//  APP CONTEXT
//  Global UI state shared across all components.
// ============================================================

interface AppContextValue {
  // Village selection
  selectedVillage: Village | null;
  selectVillage: (village: Village | null) => void;

  // School selection
  selectedSchool: School | null;
  selectSchool: (school: School | null) => void;

  // School filters & search
  schoolFilters: Record<SchoolLevel, boolean>;
  toggleSchoolFilter: (level: SchoolLevel) => void;
  setSchoolFilters: React.Dispatch<React.SetStateAction<Record<SchoolLevel, boolean>>>;
  schoolSearchQuery: string;
  setSchoolSearchQuery: (query: string) => void;

  // View mode
  isOverview: boolean;

  // Sidebar
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  activeSidebarTab: 'villages' | 'schools';
  setActiveSidebarTab: (tab: 'villages' | 'schools') => void;

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
  const [selectedVillage, setSelectedVillage] = useState<Village | null>(null);
  const [selectedSchool, setSelectedSchool]   = useState<School | null>(null);
  const [schoolFilters, setSchoolFilters]     = useState<Record<SchoolLevel, boolean>>(DEFAULT_SCHOOL_FILTERS);
  const [schoolSearchQuery, setSchoolSearchQuery] = useState('');
  const handleSetSchoolSearchQuery = useCallback((query: string) => {
    setSchoolSearchQuery(query);
  }, []);

  const [sidebarOpen,      setSidebarOpen]      = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 768 : true
  );
  const [activeSidebarTabState, setActiveSidebarTabState] = useState<'villages' | 'schools'>('villages');
  const [infoPanelOpen,    setInfoPanelOpen]    = useState(true);

  // Onboarding Tour state
  const [isTourOpen, setIsTourOpen] = useState(false);
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

  const { isDark, toggle: toggleTheme }         = useTheme();
  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen();

  const setActiveSidebarTab = useCallback((tab: 'villages' | 'schools') => {
    setActiveSidebarTabState(prev => {
      if (prev !== tab) {
        // Deselect item when switching tabs to prevent state leakage between modes
        setSelectedVillage(null);
        setSelectedSchool(null);
      }
      return tab;
    });
  }, []);

  const selectVillage = useCallback((village: Village | null) => {
    setSelectedVillage(village);
    if (village) setSelectedSchool(null);
    // Use functional form to avoid capturing infoPanelOpen in closure
    setInfoPanelOpen(prev => {
      if (village === null) return false;
      return prev ? prev : true; // open panel if not already open
    });
  }, []);

  const selectSchool = useCallback((school: School | null) => {
    setSelectedSchool(school);
    if (school) setSelectedVillage(null);
  }, []);

  const toggleSchoolFilter = useCallback((level: SchoolLevel) => {
    setSchoolFilters(prev => ({ ...prev, [level]: !prev[level] }));
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
    schoolFilters,
    toggleSchoolFilter,
    setSchoolFilters,
    schoolSearchQuery,
    setSchoolSearchQuery: handleSetSchoolSearchQuery,
    isOverview: selectedVillage === null && selectedSchool === null,
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
    schoolFilters, toggleSchoolFilter, schoolSearchQuery, handleSetSchoolSearchQuery,
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


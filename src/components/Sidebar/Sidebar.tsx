import { memo, useRef, useEffect, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Map,
  Home,
  GraduationCap,
  ChevronDown,
  Check,
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { SearchBox } from '@/components/SearchBox/SearchBox';
import { VillageCard } from '@/components/VillageCard/VillageCard';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { SchoolSidebarContent } from './SchoolSidebarContent';
import { useSearch } from '@/hooks/useSearch';
import type { Village, School } from '@/types';

// ============================================================
//  SIDEBAR LAYER REGISTRY — Easily extensible for future POI layers
//  (e.g., Hospitals, Relics, Admin centers)
// ============================================================

interface SidebarLayerOption {
  id: 'villages' | 'schools';
  title: string;
  subtitle: string;
  icon: typeof Map;
  activeColorClass: string;
  badgeBg: string;
}

const SIDEBAR_LAYERS: SidebarLayerOption[] = [
  {
    id: 'villages',
    title: 'Danh Sách Thôn',
    subtitle: 'Ranh giới hành chính thôn xã',
    icon: Map,
    activeColorClass: 'text-accent-500 dark:text-accent-400',
    badgeBg: 'bg-accent-500/10',
  },
  {
    id: 'schools',
    title: 'Danh Sách Trường',
    subtitle: 'Địa điểm mầm non, tiểu học, trung học...',
    icon: GraduationCap,
    activeColorClass: 'text-green-600 dark:text-green-400',
    badgeBg: 'bg-green-500/10',
  },
];

// ============================================================
//  Sidebar Component — Collapsible with icon strip
// ============================================================

interface SidebarProps {
  villages: Village[];
  onVillageSelect: (village: Village) => void;
  onSchoolSelect?: (school: School) => void;
  /** When true, always render the expanded layout regardless of sidebarOpen state.
   *  Used inside the mobile bottom sheet where the sheet itself controls open/close. */
  forceExpanded?: boolean;
}

export const Sidebar = memo(function Sidebar({
  villages,
  onVillageSelect,
  onSchoolSelect,
  forceExpanded = false,
}: SidebarProps) {
  const {
    isDark,
    sidebarOpen,
    toggleSidebar,
    selectedVillage,
    selectVillage,
    activeSidebarTab,
    setActiveSidebarTab,
  } = useAppContext();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeLayer = SIDEBAR_LAYERS.find(l => l.id === activeSidebarTab) ?? SIDEBAR_LAYERS[0];
  const ActiveIcon = activeLayer.icon;

  const {
    query,
    results,
    activeIndex,
    inputRef,
    hasResults,
    isFiltering,
    handleQueryChange,
    clearSearch,
    moveUp,
    moveDown,
    setActiveIndex,
  } = useSearch(villages);

  // Scroll active card into view
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (selectedVillage) {
      const card = document.getElementById(`village-card-${selectedVillage.id}`);
      card?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedVillage]);

  const handleVillageClick = useCallback((village: Village) => {
    onVillageSelect(village);
    setActiveIndex(results.findIndex(v => v.id === village.id));
  }, [onVillageSelect, results, setActiveIndex]);

  const handleReturnHome = useCallback(() => {
    selectVillage(null);
  }, [selectVillage]);

  // ── Collapsed icon strip (desktop only) ────────────────────
  // forceExpanded=true when inside mobile bottom sheet—always show full layout.
  if (!sidebarOpen && !forceExpanded) {
    return (
      <aside
        key="sidebar-collapsed"
        className={`
          flex flex-col items-center w-full h-full flex-shrink-0 py-3 gap-2
          glass-sidebar z-20 overflow-hidden
        `}
      >
        {/* Village tab icon */}
        <motion.button
          onClick={() => { setActiveSidebarTab('villages'); toggleSidebar(); }}
          className={`
            w-10 h-10 rounded-xl flex items-center justify-center transition-all
            ${activeSidebarTab === 'villages'
              ? (isDark ? 'bg-accent-500/15 text-accent-400' : 'bg-gov-50 text-gov-600')
              : (isDark ? 'text-gov-500 hover:text-gov-300 hover:bg-gov-800' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100')
            }
          `}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          title="Danh sách thôn"
        >
          <Map className="w-5 h-5" />
        </motion.button>

        {/* School tab icon */}
        <motion.button
          onClick={() => { setActiveSidebarTab('schools'); toggleSidebar(); }}
          className={`
            w-10 h-10 rounded-xl flex items-center justify-center transition-all
            ${activeSidebarTab === 'schools'
              ? (isDark ? 'bg-green-500/15 text-green-400' : 'bg-green-50 text-green-600')
              : (isDark ? 'text-gov-500 hover:text-gov-300 hover:bg-gov-800' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100')
            }
          `}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          title="Trường học"
        >
          <GraduationCap className="w-5 h-5" />
        </motion.button>

        {/* Divider */}
        <div className={`w-6 h-px my-1 ${isDark ? 'bg-gov-800' : 'bg-gray-200'}`} />

        {/* Village count badge */}
        <div className={`
          text-[10px] font-bold tabular-nums rounded-lg px-1.5 py-0.5
          ${isDark ? 'bg-gov-800 text-gov-400' : 'bg-gray-100 text-gray-500'}
        `}>
          {villages.length}
        </div>
      </aside>
    );
  }

  // ── Expanded sidebar ──────────────────────────────────────
  // Width is controlled by the PARENT container (DesktopSidebarColumn or MobileSidebarDrawer).
  // Sidebar itself just fills 100% of whatever space it's given.
  return (
    <aside
      key="sidebar-expanded"
      className="flex flex-col w-full h-full overflow-hidden flex-shrink-0 glass-sidebar z-20"
      data-tour="sidebar"
    >
      {/* ── Dropdown Header Selector ───────────────── */}
      <div
        ref={dropdownRef}
        data-tour="sidebar-selector"
        className={`
          relative flex-shrink-0 px-3 py-2 flex items-center justify-between z-30
          ${isDark ? 'border-b border-gov-800/60 bg-gov-900/50' : 'border-b border-gray-100 bg-gray-50/60'}
        `}
      >
        <button
          onClick={() => setDropdownOpen(o => !o)}
          className={`
            flex-1 flex items-center justify-between gap-2 p-1.5 rounded-xl transition-all text-left
            ${isDark ? 'hover:bg-gov-800/70' : 'hover:bg-gray-200/50'}
          `}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${activeLayer.badgeBg} ${activeLayer.activeColorClass}`}>
              <ActiveIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <h3 className={`text-sm font-bold leading-tight truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {activeLayer.title}
                </h3>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''} ${isDark ? 'text-gov-400' : 'text-gray-400'}`} />
              </div>
              <p className={`text-[10px] leading-tight truncate ${isDark ? 'text-gov-400' : 'text-gray-400'}`}>
                {activeSidebarTab === 'villages' ? `${villages.length} thôn xã Sơn Đồng` : 'Trường học địa phương'}
              </p>
            </div>
          </div>
        </button>

        {/* Dropdown Menu Popup */}
        <AnimatePresence>
          {dropdownOpen && (
            <motion.div
              className={`
                absolute top-full left-2 right-2 mt-1 z-50 rounded-2xl p-1.5 shadow-xl border backdrop-blur-xl
                ${isDark
                  ? 'bg-gov-900/95 border-gov-700/60 shadow-black/40'
                  : 'bg-white/95 border-gray-200 shadow-gray-300/40'
                }
              `}
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              <div className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-gov-500' : 'text-gray-400'}`}>
                Chọn danh mục hiển thị
              </div>

              <div className="space-y-1 mt-1">
                {SIDEBAR_LAYERS.map((layer) => {
                  const IconComponent = layer.icon;
                  const isSelected = activeSidebarTab === layer.id;

                  return (
                    <button
                      key={layer.id}
                      onClick={() => {
                        setActiveSidebarTab(layer.id);
                        setDropdownOpen(false);
                      }}
                      className={`
                        w-full flex items-center justify-between p-2 rounded-xl text-left transition-all
                        ${isSelected
                          ? (isDark ? 'bg-gov-800 text-white font-semibold' : 'bg-gray-100 text-gray-900 font-semibold')
                          : (isDark ? 'text-gov-300 hover:bg-gov-800/50 hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900')
                        }
                      `}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${layer.badgeBg} ${layer.activeColorClass}`}>
                          <IconComponent className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs truncate">{layer.title}</div>
                          <div className={`text-[10px] truncate ${isDark ? 'text-gov-500' : 'text-gray-400'}`}>
                            {layer.subtitle}
                          </div>
                        </div>
                      </div>

                      {isSelected && (
                        <Check className={`w-4 h-4 flex-shrink-0 ml-2 ${isDark ? 'text-accent-400' : 'text-gov-600'}`} />
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Villages Content ─────────────────────────────── */}
      {activeSidebarTab === 'villages' && (
        <>
          <div className={`flex-shrink-0 px-3 pt-2.5 pb-2 ${isDark ? 'border-b border-gov-800/40' : 'border-b border-gray-100/80'}`}>
            {selectedVillage && (
              <div className="flex items-center justify-end mb-2">
                <motion.button
                  onClick={handleReturnHome}
                  className={`
                    px-2 py-1 rounded-lg text-xs flex items-center gap-1 transition-colors
                    ${isDark
                      ? 'text-gov-400 hover:text-white hover:bg-gov-800'
                      : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                    }
                  `}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Về tổng quan"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>Về tổng quan</span>
                </motion.button>
              </div>
            )}

            <SearchBox
              query={query}
              resultCount={results.length}
              totalCount={villages.length}
              onQueryChange={handleQueryChange}
              onClear={clearSearch}
              onMoveUp={moveUp}
              onMoveDown={moveDown}
              inputRef={inputRef}
            />
          </div>

          {/* Village list */}
          <div className="relative flex-1 min-h-0">
            <div
              ref={listRef}
              className="absolute inset-0 overflow-y-auto overflow-x-hidden px-2 py-2 space-y-1 scrollbar-thin"
            >
              {!hasResults ? (
                <EmptyState
                  type={isFiltering ? 'search' : 'empty'}
                  message={isFiltering
                    ? `Không tìm thấy kết quả cho "${query}"`
                    : 'Chưa có dữ liệu thôn xã'
                  }
                />
              ) : (
                results.map((village, idx) => (
                  <VillageCard
                    key={village.id}
                    village={village}
                    isSelected={selectedVillage?.id === village.id}
                    isActive={isFiltering && idx === activeIndex}
                    searchQuery={query}
                    onClick={handleVillageClick}
                  />
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Schools Tab ──────────────────────────────── */}
      {activeSidebarTab === 'schools' && (
        <SchoolSidebarContent onSchoolSelect={onSchoolSelect} />
      )}

    </aside>
  );
});

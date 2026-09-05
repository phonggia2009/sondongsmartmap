import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  MapPin,
  GraduationCap,
  Landmark,
  Cross,
  Building2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useAppContext } from '@/context/useAppContext';
import { useVillages } from '@/hooks/useVillages';
import { useSchools } from '@/hooks/useSchools';
import { useHealthStations } from '@/hooks/useHealthStations';
import { useRelics } from '@/hooks/useRelics';
import { useGovUnits } from '@/hooks/useGovUnits';
import type { Village, School, HealthStation, Relic, GovUnit } from '@/types';

// ============================================================
//  Helper: Normalize Vietnamese text for instant fuzzy search
// ============================================================
function normalizeVietnamese(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

function highlightMatch(text: string, query: string) {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-amber-300/40 text-amber-900 dark:bg-accent-500/30 dark:text-accent-200 rounded px-0.5 font-semibold">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

// ============================================================
//  Unified Search Item Type
// ============================================================
type SearchItemCategory = 'village' | 'school' | 'healthStation' | 'relic' | 'govUnit';

interface UnifiedSearchItem {
  id: string;
  name: string;
  category: SearchItemCategory;
  categoryLabel: string;
  categoryIcon: typeof MapPin;
  badgeColor: string;
  subtitle: string;
  details?: string;
  item: Village | School | HealthStation | Relic | GovUnit;
}

export function GlobalSearchModal() {
  const {
    isGlobalSearchOpen,
    closeGlobalSearch,
    selectVillage,
    selectSchool,
    selectHealthStation,
    selectRelic,
    selectGovUnit,
    setActiveSidebarTab,
    isDark,
  } = useAppContext();

  const { villages } = useVillages();
  const { schools } = useSchools();
  const { healthStations } = useHealthStations();
  const { relics } = useRelics();
  const { govUnits } = useGovUnits();

  const [query, setQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | SearchItemCategory>('all');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Auto focus input when modal opens
  useEffect(() => {
    if (isGlobalSearchOpen) {
      setQuery('');
      setSelectedFilter('all');
      setActiveIndex(0);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isGlobalSearchOpen]);

  // Build unified items array with pre-normalized search fields
  const allSearchItems = useMemo<UnifiedSearchItem[]>(() => {
    const items: UnifiedSearchItem[] = [];

    // 1. Villages
    villages.forEach(v => {
      items.push({
        id: `village-${v.id}`,
        name: v.name,
        category: 'village',
        categoryLabel: 'Thôn / Xã',
        categoryIcon: MapPin,
        badgeColor: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20',
        subtitle: `Diện tích: ${v.area} · Dân số: ${(v.population ?? 0).toLocaleString('vi-VN')} người`,
        details: v.communityCenter || v.description,
        item: v,
      });
    });

    // 2. Schools
    schools.forEach(s => {
      items.push({
        id: `school-${s.id}`,
        name: s.name,
        category: 'school',
        categoryLabel: s.level,
        categoryIcon: GraduationCap,
        badgeColor: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        subtitle: s.principal ? `Hiệu trưởng: ${s.principal}` : 'Cơ sở giáo dục xã Sơn Đồng',
        details: s.phone ? `SĐT: ${s.phone}` : undefined,
        item: s,
      });
    });

    // 3. Relics
    relics.forEach(r => {
      items.push({
        id: `relic-${r.id}`,
        name: r.name,
        category: 'relic',
        categoryLabel: r.rank === 'Quốc Gia' ? 'Di tích QG' : 'Di tích TP',
        categoryIcon: Landmark,
        badgeColor: r.rank === 'Quốc Gia'
          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20'
          : 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/20',
        subtitle: `Loại hình: ${r.type} · Địa bàn: ${r.village}`,
        details: r.decisionNo,
        item: r,
      });
    });

    // 4. Health Stations
    healthStations.forEach(h => {
      items.push({
        id: `health-${h.id}`,
        name: h.name,
        category: 'healthStation',
        categoryLabel: 'Trạm Y Tế',
        categoryIcon: Cross,
        badgeColor: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20',
        subtitle: h.doctor ? `Bác sĩ phụ trách: ${h.doctor}` : 'Trạm y tế cơ sở',
        details: h.phone ? `Hotline: ${h.phone}` : undefined,
        item: h,
      });
    });

    // 5. Gov Units
    govUnits.forEach(g => {
      items.push({
        id: `gov-${g.id}`,
        name: g.name,
        category: 'govUnit',
        categoryLabel: g.category,
        categoryIcon: Building2,
        badgeColor: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
        subtitle: g.address || 'Xã Sơn Đồng',
        details: g.phone ? `SĐT: ${g.phone}` : undefined,
        item: g,
      });
    });

    return items;
  }, [villages, schools, relics, healthStations, govUnits]);

  // Filter items by category tab and query
  const filteredItems = useMemo(() => {
    const trimmed = query.trim();
    const normalizedQuery = normalizeVietnamese(trimmed);

    return allSearchItems.filter(item => {
      if (selectedFilter !== 'all' && item.category !== selectedFilter) {
        return false;
      }
      if (!normalizedQuery) return true;

      const normName = normalizeVietnamese(item.name);
      const normSubtitle = normalizeVietnamese(item.subtitle);
      const normDetails = item.details ? normalizeVietnamese(item.details) : '';

      return normName.includes(normalizedQuery) || normSubtitle.includes(normalizedQuery) || normDetails.includes(normalizedQuery);
    });
  }, [allSearchItems, query, selectedFilter]);

  // Reset activeIndex when query or filter changes
  useEffect(() => {
    setActiveIndex(0);
  }, [query, selectedFilter]);

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector(`[data-index="${activeIndex}"]`);
      activeEl?.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  const handleSelectItem = useCallback((searchItem: UnifiedSearchItem) => {
    closeGlobalSearch();

    switch (searchItem.category) {
      case 'village':
        setActiveSidebarTab('villages');
        selectVillage(searchItem.item as Village);
        break;
      case 'school':
        setActiveSidebarTab('schools');
        selectSchool(searchItem.item as School);
        break;
      case 'relic':
        setActiveSidebarTab('relics');
        selectRelic(searchItem.item as Relic);
        break;
      case 'healthStation':
        setActiveSidebarTab('healthStations');
        selectHealthStation(searchItem.item as HealthStation);
        break;
      case 'govUnit':
        setActiveSidebarTab('govUnits');
        selectGovUnit(searchItem.item as GovUnit);
        break;
    }
  }, [closeGlobalSearch, setActiveSidebarTab, selectVillage, selectSchool, selectRelic, selectHealthStation, selectGovUnit]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeGlobalSearch();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev < filteredItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev > 0 ? prev - 1 : filteredItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[activeIndex]) {
        handleSelectItem(filteredItems[activeIndex]);
      }
    }
  };

  if (!isGlobalSearchOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[800] flex items-start justify-center pt-[8vh] sm:pt-[12vh] px-3 sm:px-4">
        {/* Backdrop */}
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={closeGlobalSearch}
        />

        {/* Command Palette Modal */}
        <motion.div
          className={`
            relative w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border z-10
            flex flex-col max-h-[80vh]
            ${isDark
              ? 'bg-gov-950/95 border-gov-800/80 shadow-black/60 text-white'
              : 'bg-white/95 border-gray-200 shadow-xl text-gray-900'
            }
          `}
          style={{ backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)' }}
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          onKeyDown={handleKeyDown}
        >
          {/* Top Search Input Bar */}
          <div className={`
            relative flex items-center px-4 py-3.5 border-b
            ${isDark ? 'border-gov-800 bg-gov-900/60' : 'border-gray-100 bg-gray-50/70'}
          `}>
            <Search className={`w-5 h-5 flex-shrink-0 mr-3 ${isDark ? 'text-accent-400' : 'text-gov-600'}`} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Tìm kiếm thôn, trường học, di tích, trạm y tế, cơ quan..."
              className={`
                flex-1 bg-transparent text-sm sm:text-base outline-none border-none focus:outline-none focus:ring-0
                ${isDark ? 'placeholder:text-gov-500 text-white' : 'placeholder:text-gray-400 text-gray-900'}
              `}
              autoComplete="off"
              spellCheck={false}
            />

            {query ? (
              <button
                onClick={() => setQuery('')}
                className={`p-1 rounded-lg transition-colors mr-2 ${isDark ? 'hover:bg-gov-800 text-gov-400' : 'hover:bg-gray-200 text-gray-500'}`}
                title="Xóa tìm kiếm"
              >
                <X className="w-4 h-4" />
              </button>
            ) : null}

            <kbd className={`
              hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold border
              ${isDark ? 'bg-gov-800 text-gov-400 border-gov-700' : 'bg-gray-100 text-gray-500 border-gray-200'}
            `}>
              ESC
            </kbd>
          </div>

          {/* Category Filter Chips */}
          <div className={`
            flex items-center gap-1.5 px-4 py-2 border-b overflow-x-auto scrollbar-none flex-shrink-0 text-xs
            ${isDark ? 'border-gov-800/60 bg-gov-900/30' : 'border-gray-100 bg-white'}
          `}>
            {[
              { id: 'all', label: 'Tất cả', count: allSearchItems.length },
              { id: 'village', label: '🗺️ Thôn', count: villages.length },
              { id: 'school', label: '🏫 Trường', count: schools.length },
              { id: 'relic', label: '🏛️ Di tích', count: relics.length },
              { id: 'healthStation', label: '🏥 Y tế', count: healthStations.length },
              { id: 'govUnit', label: '🏢 HCSN', count: govUnits.length },
            ].map(cat => {
              const isSelected = selectedFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedFilter(cat.id as any)}
                  className={`
                    px-2.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5
                    ${isSelected
                      ? (isDark ? 'bg-accent-500 text-white shadow-sm shadow-accent-500/30' : 'bg-gov-600 text-white shadow-sm')
                      : (isDark ? 'bg-gov-800/60 text-gov-400 hover:bg-gov-800 hover:text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900')
                    }
                  `}
                >
                  <span>{cat.label}</span>
                  <span className={`text-[10px] opacity-75 font-mono`}>({cat.count})</span>
                </button>
              );
            })}
          </div>

          {/* Results List */}
          <div
            ref={listRef}
            className="flex-1 overflow-y-auto px-2 py-2 space-y-1 scrollbar-thin max-h-[50vh]"
          >
            {filteredItems.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center px-4">
                <Search className={`w-8 h-8 mb-2 opacity-40 ${isDark ? 'text-gov-400' : 'text-gray-400'}`} />
                <p className={`text-sm font-semibold ${isDark ? 'text-gov-300' : 'text-gray-600'}`}>
                  Không tìm thấy kết quả phù hợp cho "{query}"
                </p>
                <p className={`text-xs mt-1 ${isDark ? 'text-gov-500' : 'text-gray-400'}`}>
                  Hãy thử tìm bằng từ khóa khác hoặc chuyển sang danh mục "Tất cả"
                </p>
              </div>
            ) : (
              filteredItems.map((item, index) => {
                const isActive = index === activeIndex;
                const IconComponent = item.categoryIcon;

                return (
                  <button
                    key={item.id}
                    data-index={index}
                    onClick={() => handleSelectItem(item)}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={`
                      w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all group
                      ${isActive
                        ? (isDark ? 'bg-gov-800/90 ring-1 ring-accent-500/50' : 'bg-gov-50 ring-1 ring-gov-300')
                        : (isDark ? 'hover:bg-gov-900/60' : 'hover:bg-gray-50')
                      }
                    `}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`
                        w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border
                        ${item.badgeColor}
                      `}>
                        <IconComponent className="w-4 h-4" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold leading-tight truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {highlightMatch(item.name, query)}
                          </span>
                          <span className={`
                            px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border
                            ${item.badgeColor}
                          `}>
                            {item.categoryLabel}
                          </span>
                        </div>

                        <p className={`text-xs truncate mt-0.5 ${isDark ? 'text-gov-400' : 'text-gray-500'}`}>
                          {highlightMatch(item.subtitle, query)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                      {isActive && (
                        <span className={`text-[11px] font-medium hidden sm:inline ${isDark ? 'text-accent-400' : 'text-gov-600'}`}>
                          Chọn ↵
                        </span>
                      )}
                      <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 ${isDark ? 'text-gov-500' : 'text-gray-400'}`} />
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer Shortcuts Info */}
          <div className={`
            px-4 py-2.5 border-t flex items-center justify-between text-xs flex-shrink-0
            ${isDark ? 'border-gov-800/80 bg-gov-900/50 text-gov-400' : 'border-gray-100 bg-gray-50 text-gray-500'}
          `}>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded bg-black/10 dark:bg-white/10 font-mono">↑</kbd>
                <kbd className="px-1 py-0.5 rounded bg-black/10 dark:bg-white/10 font-mono">↓</kbd>
                <span>Di chuyển</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded bg-black/10 dark:bg-white/10 font-mono">↵</kbd>
                <span>Mở chi tiết</span>
              </span>
            </div>

            <div className="flex items-center gap-1 text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-accent-500" />
              <span>{filteredItems.length} kết quả</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

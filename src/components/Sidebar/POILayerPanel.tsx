import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Loader2 } from 'lucide-react';
import type { POILayerConfig, POIItem } from '@/types/poi';

interface POILayerPanelProps<T extends POIItem> {
  config: POILayerConfig<T>;
  activeCategories: Record<string, boolean>;
  onToggleCategory: (categoryId: string) => void;
  onToggleAll: (state: boolean) => void;
  selectedItemId: string | number | null;
  onSelectItem: (item: T | null) => void;
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
  renderItemSubtitle?: (item: T) => React.ReactNode;
}

export function POILayerPanel<T extends POIItem>({
  config,
  activeCategories,
  onToggleCategory,
  onToggleAll,
  selectedItemId,
  onSelectItem,
  searchQuery: externalSearchQuery,
  onSearchQueryChange,
  renderItemSubtitle,
}: POILayerPanelProps<T>) {
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const searchQuery = externalSearchQuery ?? internalSearchQuery;

  const handleSearchChange = (value: string) => {
    if (onSearchQueryChange) {
      onSearchQueryChange(value);
    } else {
      setInternalSearchQuery(value);
    }
  };

  const { items, isLoading, isError } = config.useItems();

  // Determine if all are active
  const allActive = config.categories.every(cat => activeCategories[cat.id]);

  // Filter items based on active categories AND search query
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // 1. Must be in active category
      if (!activeCategories[item.categoryId]) return false;
      // 2. Must match search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        return item.name.toLowerCase().includes(query);
      }
      return true;
    });
  }, [items, activeCategories, searchQuery]);

  return (
    <div className="relative flex-1 min-h-0 flex flex-col bg-white dark:bg-gov-950">
      
      {/* ── Header & Search ──────────────────────────────────── */}
      <div className="flex-shrink-0 px-4 pt-3 pb-2 border-b border-gray-100 dark:border-gov-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
            <span>{config.icon}</span>
            <span>{config.title}</span>
            <span className="text-[10px] bg-gray-100 dark:bg-gov-800 text-gray-500 px-1.5 py-0.5 rounded-md ml-1">
              {filteredItems.length}/{items.length}
            </span>
          </div>
          <button
            onClick={() => onToggleAll(!allActive)}
            className="text-[11px] font-medium px-2 py-1 rounded-md transition-colors bg-gray-100 hover:bg-gray-200 text-gray-600 dark:bg-gov-800 dark:hover:bg-gov-700 dark:text-gray-300"
          >
            {allActive ? 'Ẩn tất cả' : 'Hiện tất cả'}
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-3">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full bg-gray-50 dark:bg-gov-900 border border-gray-200 dark:border-gov-800 rounded-lg pl-9 pr-3 py-1.5 text-sm outline-none focus:outline-none focus-visible:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-gray-200 transition-shadow"
          />
        </div>

        {/* Category Filter Chips */}
        <div className="flex flex-wrap gap-1.5 pb-1">
          {config.categories.map(cat => {
            const isActive = activeCategories[cat.id];
            // Count items in this category
            const count = items.filter(i => i.categoryId === cat.id).length;
            
            return (
              <button
                key={cat.id}
                onClick={() => onToggleCategory(cat.id)}
                className={`
                  flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 border
                  ${isActive 
                    ? 'border-transparent shadow-sm' 
                    : 'bg-white dark:bg-gov-900 border-gray-200 dark:border-gov-700 text-gray-400 dark:text-gray-500 opacity-60 hover:opacity-100'
                  }
                `}
                style={isActive ? { backgroundColor: cat.bgColor, color: cat.color } : {}}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
                <span className="opacity-70 text-[10px] ml-0.5">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Scrollable List ──────────────────────────────────── */}
      <div className="relative flex-1 min-h-0">
        <div className="absolute inset-0 overflow-y-auto overflow-x-hidden p-2 space-y-1 scrollbar-thin">
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin mb-2" />
              <span className="text-sm">Đang tải dữ liệu...</span>
            </div>
          ) : isError ? (
            <div className="p-4 text-center text-sm text-red-500 bg-red-50 dark:bg-red-900/10 rounded-lg m-2 border border-red-100 dark:border-red-900/30">
              Có lỗi xảy ra khi tải dữ liệu.
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400 dark:text-gray-500">
              <MapPin className="w-8 h-8 mb-2 opacity-50" />
              <span className="text-sm">Không tìm thấy kết quả.</span>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {filteredItems.map(item => {
                const isSelected = selectedItemId === item.id;
                const category = config.categories.find(c => c.id === item.categoryId);
                
                return (
                  <motion.div
                    key={item.id}
                    layout="position"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    role="button"
                    tabIndex={0}
                    onClick={() => onSelectItem(isSelected ? null : item)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectItem(isSelected ? null : item);
                      }
                    }}
                    className={`
                      w-full text-left p-3 rounded-xl transition-all duration-200 border cursor-pointer
                      flex items-start gap-3 group select-none
                      ${isSelected
                        ? 'shadow-sm dark:bg-gov-900'
                        : 'bg-white dark:bg-transparent border-transparent hover:bg-gray-50 dark:hover:bg-gov-900 hover:border-gray-200 dark:hover:border-gov-800'
                      }
                    `}
                    style={isSelected && category ? { borderColor: category.color, backgroundColor: category.bgColor } : {}}
                  >
                    <div className="flex-shrink-0 text-xl leading-none mt-0.5 transition-transform group-hover:scale-110">
                      {category?.icon || <MapPin className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium truncate ${isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                        {item.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                        {renderItemSubtitle ? renderItemSubtitle(item) : (category?.name || 'Chưa phân loại')}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}

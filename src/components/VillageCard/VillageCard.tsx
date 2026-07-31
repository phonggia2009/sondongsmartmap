import { memo } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Users, BarChart3, ChevronRight } from 'lucide-react';
import type { Village } from '@/types';
import { useAppContext } from '@/context/AppContext';

// ============================================================
//  VillageCard Component — Enhanced with richer visuals
// ============================================================

interface VillageCardProps {
  village: Village;
  isSelected: boolean;
  isActive?: boolean;   // keyboard navigation highlight
  searchQuery?: string;
  onClick: (village: Village) => void;
}

function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part)
      ? <mark key={i} className="bg-accent-400/25 text-accent-400 rounded px-0.5 not-italic font-semibold">{part}</mark>
      : part
  );
}

export const VillageCard = memo(function VillageCard({
  village,
  isSelected,
  isActive = false,
  searchQuery = '',
  onClick,
}: VillageCardProps) {
  const { isDark } = useAppContext();

  return (
    <motion.button
      id={`village-card-${village.id}`}
      onClick={() => onClick(village)}
      className={`
        w-full text-left px-3 py-3 rounded-xl transition-all duration-200
        flex items-center gap-3 group relative overflow-hidden
        ${isSelected
          ? isDark
            ? 'bg-gradient-to-r from-gov-800/90 to-gov-800/60 ring-1 ring-accent-500/50 shadow-glow-accent'
            : 'bg-gradient-to-r from-gov-50 to-blue-50 ring-1 ring-gov-300 shadow-card'
          : isActive
            ? isDark
              ? 'bg-gov-800/50 ring-1 ring-gov-600/50'
              : 'bg-gray-50 ring-1 ring-gray-200'
            : isDark
              ? 'hover:bg-gov-800/40'
              : 'hover:bg-gray-50'
        }
      `}
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.98 }}
      layout
      aria-pressed={isSelected}
      aria-label={`Xem thôn ${village.name}`}
    >
      {/* Selected indicator bar */}
      {isSelected && (
        <motion.div
          className={`absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full ${isDark ? 'bg-accent-400' : 'bg-gov-600'}`}
          layoutId="selectedIndicator"
          transition={{ duration: 0.25, ease: 'easeOut' }}
        />
      )}

      {/* Village number badge */}
      <div className={`
        flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold
        transition-all duration-200
        ${isSelected
          ? isDark
            ? 'bg-accent-500/20 text-accent-400 ring-1 ring-accent-500/30'
            : 'bg-gov-600 text-white shadow-sm'
          : isDark
            ? 'bg-gov-800/60 text-gov-400 group-hover:bg-gov-700 group-hover:text-gov-300'
            : 'bg-gray-100 text-gray-500 group-hover:bg-gov-100 group-hover:text-gov-600'
        }
      `}>
        {village.id}
      </div>

      {/* Name + details */}
      <div className="flex-1 min-w-0">
        <p className={`
          text-sm font-semibold truncate
          ${isSelected
            ? isDark ? 'text-white' : 'text-gov-800'
            : isDark ? 'text-gov-200 group-hover:text-white' : 'text-gray-700 group-hover:text-gray-900'
          }
        `}>
          {highlightText(village.name, searchQuery)}
        </p>

        <div className="flex items-center gap-2.5 mt-1">
          <span className={`
            flex items-center gap-1 text-[11px]
            ${isDark ? 'text-gov-500' : 'text-gray-400'}
          `}>
            <MapPin className="w-3 h-3" />
            {village.area}
          </span>
          <span className={`
            flex items-center gap-1 text-[11px]
            ${isDark ? 'text-gov-500' : 'text-gray-400'}
          `}>
            <Users className="w-3 h-3" />
            {village.partyMembers} ĐV
          </span>
          {village.population !== undefined && (
            <span className={`
              flex items-center gap-1 text-[11px]
              ${isDark ? 'text-gov-500' : 'text-gray-400'}
            `}>
              <BarChart3 className="w-3 h-3" />
              {village.population.toLocaleString('vi-VN')}
            </span>
          )}
        </div>
      </div>

      {/* Selected chevron */}
      {isSelected && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center
            ${isDark ? 'bg-accent-500/20 text-accent-400' : 'bg-gov-100 text-gov-600'}
          `}
        >
          <ChevronRight className="w-3 h-3" />
        </motion.div>
      )}
    </motion.button>
  );
});



import { memo } from 'react';
import { useAppContext } from '@/context/AppContext';

// ============================================================
//  BoundaryRow Component — Compass direction boundary
// ============================================================

interface BoundaryRowProps {
  direction: 'north' | 'south' | 'east' | 'west';
  value: string;
}

const DIRECTION_CONFIG = {
  north: {
    label: 'Phía Bắc',
    emoji: '⬆',
    gradient: 'from-blue-500/15 to-blue-600/5',
    gradientLight: 'from-blue-50 to-blue-100/30',
    color: 'text-blue-400',
    colorLight: 'text-blue-500',
    border: 'border-blue-500/15',
    borderLight: 'border-blue-200/60',
  },
  south: {
    label: 'Phía Nam',
    emoji: '⬇',
    gradient: 'from-emerald-500/15 to-emerald-600/5',
    gradientLight: 'from-emerald-50 to-emerald-100/30',
    color: 'text-emerald-400',
    colorLight: 'text-emerald-500',
    border: 'border-emerald-500/15',
    borderLight: 'border-emerald-200/60',
  },
  east: {
    label: 'Phía Đông',
    emoji: '➡',
    gradient: 'from-orange-500/15 to-orange-600/5',
    gradientLight: 'from-orange-50 to-orange-100/30',
    color: 'text-orange-400',
    colorLight: 'text-orange-500',
    border: 'border-orange-500/15',
    borderLight: 'border-orange-200/60',
  },
  west: {
    label: 'Phía Tây',
    emoji: '⬅',
    gradient: 'from-purple-500/15 to-purple-600/5',
    gradientLight: 'from-purple-50 to-purple-100/30',
    color: 'text-purple-400',
    colorLight: 'text-purple-500',
    border: 'border-purple-500/15',
    borderLight: 'border-purple-200/60',
  },
} as const;

export const BoundaryRow = memo(function BoundaryRow({
  direction,
  value,
}: BoundaryRowProps) {
  const { isDark } = useAppContext();
  const config = DIRECTION_CONFIG[direction];

  if (!value?.trim()) return null;

  return (
    <div className={`
      flex items-start gap-3 py-2.5 px-3 rounded-xl border
      bg-gradient-to-r transition-all duration-200
      ${isDark
        ? `${config.gradient} ${config.border}`
        : `${config.gradientLight} ${config.borderLight}`
      }
    `}>
      <div className={`
        flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-sm
        ${isDark ? 'bg-white/5' : 'bg-white/80 shadow-sm'}
      `}>
        <span className={isDark ? config.color : config.colorLight}>
          {config.emoji}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-[10px] font-semibold mb-0.5 uppercase tracking-wider
          ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          {config.label}
        </p>
        <p className={`text-sm leading-snug ${isDark ? 'text-gov-200' : 'text-gray-700'}`}>
          {value}
        </p>
      </div>
    </div>
  );
});

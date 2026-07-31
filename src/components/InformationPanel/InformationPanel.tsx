import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Users,
  Home,
  BarChart3,
  FileText,
  X,
  Map,
  Compass,
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { BoundaryRow } from './BoundaryRow';
import { LandmarkList } from './LandmarkList';

import { useIsMobile } from '@/hooks/useIsMobile';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import type { Village } from '@/types';

// ============================================================
//  InformationPanel Component
//  Left overlay panel displaying all village details.
//  Glassmorphism slide-over design.
// ============================================================

interface InformationPanelProps {
  village: Village | null;
  onClose?: () => void;
}

function StatCard({
  icon,
  label,
  value,
  isDark,
  color = 'blue',
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  isDark: boolean;
  color?: 'blue' | 'emerald' | 'amber' | 'purple';
}) {
  const colorMap = {
    blue:    isDark ? 'from-blue-500/10 to-blue-600/5 border-blue-500/20' : 'from-blue-50 to-blue-100/50 border-blue-200/60',
    emerald: isDark ? 'from-emerald-500/10 to-emerald-600/5 border-emerald-500/20' : 'from-emerald-50 to-emerald-100/50 border-emerald-200/60',
    amber:   isDark ? 'from-amber-500/10 to-amber-600/5 border-amber-500/20' : 'from-amber-50 to-amber-100/50 border-amber-200/60',
    purple:  isDark ? 'from-purple-500/10 to-purple-600/5 border-purple-500/20' : 'from-purple-50 to-purple-100/50 border-purple-200/60',
  };

  const iconColorMap = {
    blue:    isDark ? 'text-blue-400' : 'text-blue-500',
    emerald: isDark ? 'text-emerald-400' : 'text-emerald-500',
    amber:   isDark ? 'text-amber-400' : 'text-amber-500',
    purple:  isDark ? 'text-purple-400' : 'text-purple-500',
  };

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 10, scale: 0.95 },
        visible: { opacity: 1, y: 0, scale: 1 }
      }}
      className={`
        flex flex-col gap-1.5 p-3.5 rounded-2xl border
        bg-gradient-to-br ${colorMap[color]}
        transition-all duration-200 hover:shadow-sm
      `}
    >
      <div className={`flex items-center gap-2 ${iconColorMap[color]}`}>
        <div className={`
          w-7 h-7 rounded-lg flex items-center justify-center
          ${isDark ? 'bg-white/5' : 'bg-white/60'}
        `}>
          {icon}
        </div>
      </div>
      <div>
        <p className={`text-[10px] font-semibold uppercase tracking-wider mb-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {label}
        </p>
        <p className={`text-lg font-bold font-display tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {typeof value === 'number' ? <AnimatedNumber value={value} /> : value}
        </p>
      </div>
    </motion.div>
  );
}

export const InformationPanel = memo(function InformationPanel({
  village,
  onClose,
}: InformationPanelProps) {
  const { isDark } = useAppContext();
  const isMobile = useIsMobile();

  return (
    <motion.aside
      className={`
        flex flex-col flex-shrink-0 overflow-hidden
        ${isMobile
          ? 'absolute bottom-0 left-0 right-0 z-50 h-[65vh] rounded-t-3xl'
          : 'absolute top-0 left-0 bottom-0 w-88 z-40'
        }
        glass-panel-strong
        ${isDark
          ? 'bg-gov-950/88 border-gov-800/40'
          : 'bg-white/90 border-gray-200/60'
        }
        ${!isMobile ? (isDark ? 'border-r' : 'border-r') : (isDark ? 'border-t border-gov-700/40' : 'border-t border-gray-200')}
      `}
      style={!isMobile ? {
        backdropFilter: 'blur(24px) saturate(1.8)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.8)',
      } : undefined}
      initial={isMobile ? { y: 400, opacity: 0 } : { x: -360, opacity: 0 }}
      animate={isMobile ? { y: 0, opacity: 1 } : { x: 0, opacity: 1 }}
      exit={isMobile ? { y: 400, opacity: 0 } : { x: -360, opacity: 0 }}
      transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
    >
      {/* Mobile drag handle */}
      {isMobile && (
        <div className="flex-shrink-0 flex justify-center py-2.5">
          <div className={`w-10 h-1 rounded-full ${isDark ? 'bg-gov-600' : 'bg-gray-300'}`} />
        </div>
      )}

      <AnimatePresence mode="wait">
        {!village ? (
          <OverviewPlaceholder key="overview" isDark={isDark} />
        ) : (
          <motion.div
            key={village.id}
            className="flex flex-col h-full overflow-hidden"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {/* Village name header */}
            <div className={`
              flex-shrink-0 flex items-center justify-between px-5 py-4
              ${isDark ? 'border-b border-gov-800/40' : 'border-b border-gray-100'}
            `}>
              <div className="flex items-center gap-3 min-w-0">
                <div className={`
                  w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
                  ${isDark
                    ? 'bg-gradient-to-br from-accent-500/20 to-accent-600/10 text-accent-400'
                    : 'bg-gradient-to-br from-gov-100 to-gov-50 text-gov-600'
                  }
                `}>
                  <Compass className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h2 className={`text-base font-display font-bold leading-tight truncate ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {village.name}
                  </h2>
                  <p className={`text-[11px] ${isDark ? 'text-gov-500' : 'text-gray-400'}`}>
                    Thông tin chi tiết
                  </p>
                </div>
              </div>
              {onClose && (
                <motion.button
                  onClick={onClose}
                  className={`
                    p-2 rounded-xl transition-colors flex-shrink-0
                    ${isDark
                      ? 'text-gov-400 hover:bg-gov-800 hover:text-white'
                      : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'
                    }
                  `}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-4 h-4" />
                </motion.button>
              )}
            </div>

            {/* Scrollable content with stagger */}
            <motion.div
              className="flex-1 overflow-y-auto px-5 py-4 space-y-5 scrollbar-thin"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.06, delayChildren: 0.08 }
                }
              }}
              initial="hidden"
              animate="visible"
            >

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <StatCard
                  isDark={isDark}
                  icon={<MapPin className="w-4 h-4" />}
                  label="Diện tích"
                  value={village.area}
                  color="blue"
                />
                <StatCard
                  isDark={isDark}
                  icon={<Users className="w-4 h-4" />}
                  label="Đảng viên"
                  value={village.partyMembers}
                  color="purple"
                />
                {village.households !== undefined && (
                  <StatCard
                    isDark={isDark}
                    icon={<Home className="w-4 h-4" />}
                    label="Hộ dân"
                    value={village.households}
                    color="amber"
                  />
                )}
                {village.population !== undefined && (
                  <StatCard
                    isDark={isDark}
                    icon={<BarChart3 className="w-4 h-4" />}
                    label="Dân số"
                    value={village.population}
                    color="emerald"
                  />
                )}
              </div>

              {/* Divider */}
              <div className="section-divider" />

              {/* Boundaries */}
              <div>
                <p className={`text-[11px] font-semibold uppercase tracking-wider mb-2.5 ${isDark ? 'text-gov-400' : 'text-gray-500'}`}>
                  Ranh Giới Hành Chính
                </p>
                <div className="space-y-1.5">
                  <BoundaryRow direction="north" value={village.north} />
                  <BoundaryRow direction="south" value={village.south} />
                  <BoundaryRow direction="east" value={village.east} />
                  <BoundaryRow direction="west" value={village.west} />
                </div>
              </div>

              {/* Divider */}
              <div className="section-divider" />

              {/* Landmarks */}
              <LandmarkList landmarks={village.landmarks} />

              {/* Description */}
              {village.description && (
                <>
                  <div className="section-divider" />
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className={`w-3.5 h-3.5 ${isDark ? 'text-gov-400' : 'text-gray-400'}`} />
                      <p className={`text-[11px] font-semibold uppercase tracking-wider ${isDark ? 'text-gov-400' : 'text-gray-500'}`}>
                        Mô tả
                      </p>
                    </div>
                    <p className={`text-sm leading-relaxed ${isDark ? 'text-gov-300' : 'text-gray-600'}`}>
                      {village.description}
                    </p>
                  </div>
                </>
              )}

              {/* Bottom padding */}
              <div className="h-6" />
            </motion.div>

            {/* Bottom gradient scroll indicator */}
            <div className={`
              absolute bottom-0 left-0 right-0 h-8 pointer-events-none
              ${isDark
                ? 'bg-gradient-to-t from-gov-950/60 to-transparent'
                : 'bg-gradient-to-t from-white/60 to-transparent'
              }
            `} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
});

function OverviewPlaceholder({ isDark }: { isDark: boolean }) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center h-full gap-4 px-6 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className={`
        w-16 h-16 rounded-2xl flex items-center justify-center
        ${isDark
          ? 'bg-gradient-to-br from-gov-800 to-gov-900'
          : 'bg-gradient-to-br from-gov-50 to-blue-50'
        }
      `}>
        <Map className={`w-8 h-8 ${isDark ? 'text-gov-500' : 'text-gov-400'}`} />
      </div>
      <div>
        <h3 className={`text-sm font-semibold mb-1 ${isDark ? 'text-gov-300' : 'text-gray-600'}`}>
          Chọn một thôn để xem thông tin
        </h3>
        <p className={`text-xs ${isDark ? 'text-gov-500' : 'text-gray-400'}`}>
          Nhấn vào ranh giới hoặc tên thôn trên bản đồ
        </p>
      </div>
    </motion.div>
  );
}

import { memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Users, Home, GraduationCap, Cross } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { useVillages } from '@/hooks/useVillages';
import { useSchools } from '@/hooks/useSchools';
import { useHealthStations } from '@/hooks/useHealthStations';
import { useIsMobile } from '@/hooks/useIsMobile';

// ============================================================
//  MapOverlayStats — Floating glass stats overlay
// ============================================================

export const MapOverlayStats = memo(function MapOverlayStats() {
  const { selectedVillage, isDark, activeSidebarTab, schoolFilters } = useAppContext();
  const { villages }       = useVillages();
  const { schools }        = useSchools();
  const { healthStations } = useHealthStations();
  const isMobile           = useIsMobile();

  const isSchoolMode        = activeSidebarTab === 'schools';
  const isHealthStationMode = activeSidebarTab === 'healthStations';

  const villageStats = useMemo(() => ({
    count:       villages.length,
    population:  villages.reduce((s, v) => s + (v.population  || 0), 0),
    households:  villages.reduce((s, v) => s + (v.households  || 0), 0),
  }), [villages]);

  const schoolStats = useMemo(() => {
    const visible = schools.filter(s => schoolFilters[s.level]);
    return { total: schools.length, visible: visible.length };
  }, [schools, schoolFilters]);

  const healthStats = useMemo(() => {
    return { total: healthStations.length };
  }, [healthStations]);

  const containerClass = `
    absolute z-[400] pointer-events-auto
    flex items-center gap-3 rounded-2xl
    glass-panel-sm
    ${isMobile
      ? 'bottom-3 left-3 right-3 justify-center px-4 py-2.5'
      : 'bottom-6 right-4 px-4 py-2.5'
    }
    ${isDark ? 'text-white' : 'text-gray-800'}
  `;

  return (
    <AnimatePresence mode="wait">
      {isSchoolMode ? (
        /* School mode stats */
        <motion.div
          key="school-stats"
          className={containerClass}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.3 }}
        >
          <StatChip
            icon={<GraduationCap className="w-3.5 h-3.5" />}
            label="Đang hiện"
            value={`${schoolStats.visible}/${schoolStats.total}`}
            isDark={isDark}
            color="emerald"
          />
        </motion.div>
      ) : isHealthStationMode ? (
        /* Health station mode stats */
        <motion.div
          key="health-stats"
          className={containerClass}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.3 }}
        >
          <StatChip
            icon={<Cross className="w-3.5 h-3.5" />}
            label="Trạm y tế"
            value={healthStats.total}
            isDark={isDark}
            color="amber"
          />
        </motion.div>
      ) : (
        /* Village mode stats — hidden when village selected */
        !selectedVillage && villages.length > 0 && (
          <motion.div
            key="village-stats"
            className={containerClass}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <StatChip
              icon={<MapPin className="w-3.5 h-3.5" />}
              label="Thôn/Tổ"
              value={villageStats.count}
              isDark={isDark}
              color="blue"
            />
            <Divider isDark={isDark} />
            <StatChip
              icon={<Users className="w-3.5 h-3.5" />}
              label="Dân số"
              value={villageStats.population.toLocaleString('vi-VN')}
              isDark={isDark}
              color="emerald"
            />
            <Divider isDark={isDark} />
            <StatChip
              icon={<Home className="w-3.5 h-3.5" />}
              label="Hộ dân"
              value={villageStats.households.toLocaleString('vi-VN')}
              isDark={isDark}
              color="amber"
            />
          </motion.div>
        )
      )}
    </AnimatePresence>
  );
});

function StatChip({
  icon, label, value, isDark, color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  isDark: boolean;
  color: 'blue' | 'emerald' | 'amber';
}) {
  const colorMap = {
    blue:    isDark ? 'text-blue-400'    : 'text-blue-600',
    emerald: isDark ? 'text-emerald-400' : 'text-emerald-600',
    amber:   isDark ? 'text-amber-400'   : 'text-amber-600',
  };
  return (
    <div className="flex items-center gap-2">
      <div className={`
        w-7 h-7 rounded-lg flex items-center justify-center
        ${isDark ? 'bg-white/5' : 'bg-gray-100/80'}
        ${colorMap[color]}
      `}>
        {icon}
      </div>
      <div className="flex flex-col">
        <span className={`text-[9px] uppercase tracking-wider font-semibold leading-none ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>
          {label}
        </span>
        <span className="text-sm font-bold font-display leading-tight">{value}</span>
      </div>
    </div>
  );
}

function Divider({ isDark }: { isDark: boolean }) {
  return <div className={`w-px h-8 ${isDark ? 'bg-white/10' : 'bg-gray-200/80'}`} />;
}

import { memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Users,
  Home,
  BarChart3,
  X,
  Compass,
  Building2,
  Navigation,
  GraduationCap,
  Landmark,
  Cross,
  Phone,
  Award,
  UserCheck,
  FileText,
} from 'lucide-react';
import { useAppContext } from '@/context/useAppContext';
import { BoundaryRow } from './BoundaryRow';
import { LandmarkList } from './LandmarkList';
import { useIsMobile } from '@/hooks/useIsMobile';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { trackGetDirections } from '@/utils/analytics';
import { getLevelColor, getLevelBgColor, getLevelEmoji } from '@/utils/schoolUtils';
import { getRelicColor, getRelicEmoji } from '@/utils/relicUtils';
import { getGovUnitCategoryColor, getGovUnitCategoryEmoji } from '@/utils/govUnitUtils';
import type { SchoolLevel, Village } from '@/types';

// ============================================================
//  InformationPanel Component — Unified Detail Panel
//  Displays full details for Villages, Schools, Relics,
//  Health Stations, and Administrative Units.
// ============================================================

interface InformationPanelProps {
  village?: Village | null;
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
    blue:    isDark ? 'from-blue-950/70 to-gov-900/80 border-blue-800/50 text-blue-300' : 'from-blue-50 to-blue-100/50 border-blue-200/60',
    emerald: isDark ? 'from-emerald-950/70 to-gov-900/80 border-emerald-800/50 text-emerald-300' : 'from-emerald-50 to-emerald-100/50 border-emerald-200/60',
    amber:   isDark ? 'from-amber-950/70 to-gov-900/80 border-amber-800/50 text-amber-300' : 'from-amber-50 to-amber-100/50 border-amber-200/60',
    purple:  isDark ? 'from-purple-950/70 to-gov-900/80 border-purple-800/50 text-purple-300' : 'from-purple-50 to-purple-100/50 border-purple-200/60',
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
        visible: { opacity: 1, y: 0, scale: 1 },
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
          ${isDark ? 'bg-gov-900/90 border border-gov-700/50' : 'bg-white/60'}
        `}>
          {icon}
        </div>
      </div>
      <div>
        <p className={`text-[10px] font-semibold uppercase tracking-wider mb-0.5 ${isDark ? 'text-gov-400' : 'text-gray-500'}`}>
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
  village: propVillage,
  onClose,
}: InformationPanelProps) {
  const {
    isDark,
    selectedVillage: ctxVillage,
    selectedSchool,
    selectedHealthStation,
    selectedRelic,
    selectedGovUnit,
    clearAllSelections,
  } = useAppContext();
  const isMobile = useIsMobile();

  const handleClose = onClose ?? clearAllSelections;

  // Active item resolution
  const activeVillage = propVillage ?? ctxVillage;
  const activeSchool = selectedSchool;
  const activeHealthStation = selectedHealthStation;
  const activeRelic = selectedRelic;
  const activeGovUnit = selectedGovUnit;

  const hasContent = Boolean(
    activeVillage || activeSchool || activeHealthStation || activeRelic || activeGovUnit
  );

  const activeKey = useMemo(() => {
    if (activeVillage) return `village-${activeVillage.id}`;
    if (activeSchool) return `school-${activeSchool.id}`;
    if (activeRelic) return `relic-${activeRelic.id}`;
    if (activeHealthStation) return `health-${activeHealthStation.id}`;
    if (activeGovUnit) return `gov-${activeGovUnit.id}`;
    return 'none';
  }, [activeVillage, activeSchool, activeRelic, activeHealthStation, activeGovUnit]);

  if (!hasContent) return null;

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
          ? 'bg-gov-950/95 border-gov-800/60 shadow-2xl'
          : 'bg-white/95 border-gray-200/60 shadow-xl'
        }
        ${!isMobile ? 'border-r' : (isDark ? 'border-t border-gov-700/40' : 'border-t border-gray-200')}
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
        {/* ── 1. VILLAGE DETAILS ── */}
        {activeVillage && (
          <motion.div
            key={activeKey}
            className="flex flex-col h-full overflow-hidden"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {/* Header */}
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
                    {activeVillage.name}
                  </h2>
                  <p className={`text-[11px] ${isDark ? 'text-gov-500' : 'text-gray-400'}`}>
                    Thông tin thôn / xã
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className={`p-2 rounded-xl transition-colors flex-shrink-0 ${isDark ? 'text-gov-400 hover:bg-gov-800 hover:text-white' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'}`}
                title="Đóng thông tin"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 scrollbar-thin">
              <div className="grid grid-cols-2 gap-2.5">
                <StatCard isDark={isDark} icon={<MapPin className="w-4 h-4" />} label="Diện tích" value={activeVillage.area} color="blue" />
                <StatCard isDark={isDark} icon={<Users className="w-4 h-4" />} label="Đảng viên" value={activeVillage.partyMembers} color="purple" />
                {activeVillage.households !== undefined && (
                  <StatCard isDark={isDark} icon={<Home className="w-4 h-4" />} label="Hộ dân" value={activeVillage.households} color="amber" />
                )}
                {activeVillage.population !== undefined && (
                  <StatCard isDark={isDark} icon={<BarChart3 className="w-4 h-4" />} label="Dân số" value={activeVillage.population} color="emerald" />
                )}
              </div>

              <div className="section-divider" />

              {/* Community center */}
              {(activeVillage.communityCenter || activeVillage.communityCenterAddress) && (
                <>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className={`w-3.5 h-3.5 ${isDark ? 'text-accent-400' : 'text-gov-600'}`} />
                      <p className={`text-[11px] font-semibold uppercase tracking-wider ${isDark ? 'text-gov-400' : 'text-gray-500'}`}>
                        Điểm Sinh Hoạt Cộng Đồng
                      </p>
                    </div>
                    <div className={`p-3.5 rounded-2xl border text-xs space-y-2.5 ${isDark ? 'bg-gov-900/60 border-gov-800/60 text-gov-200' : 'bg-gov-50/60 border-gov-100 text-gray-700'}`}>
                      {activeVillage.communityCenter && (
                        <p className="font-bold text-sm text-gov-600 dark:text-accent-300">
                          {activeVillage.communityCenter}
                        </p>
                      )}
                      {activeVillage.communityCenterAddress && (
                        <div className="flex items-start gap-1.5 text-xs text-gray-600 dark:text-gov-300">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-accent-500" />
                          <span>{activeVillage.communityCenterAddress}</span>
                        </div>
                      )}
                      <button
                        onClick={() => {
                          trackGetDirections(activeVillage.communityCenter || activeVillage.name, 'Thôn / Xã');
                          let dest = '';
                          if (activeVillage.communityCenterCoords) {
                            dest = `${activeVillage.communityCenterCoords.lat},${activeVillage.communityCenterCoords.lng}`;
                          } else if (activeVillage.communityCenterAddress) {
                            dest = encodeURIComponent(activeVillage.communityCenterAddress);
                          }
                          if (dest) {
                            window.open(`https://www.google.com/maps/dir/?api=1&destination=${dest}`, '_blank');
                          }
                        }}
                        className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-semibold text-xs transition-all duration-200 shadow-sm cursor-pointer mt-1 ${isDark ? 'bg-accent-600 hover:bg-accent-500 text-white' : 'bg-gov-600 hover:bg-gov-700 text-white'}`}
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Chỉ đường tới Nhà văn hóa</span>
                      </button>
                    </div>
                  </div>
                  <div className="section-divider" />
                </>
              )}

              {/* Boundaries */}
              <div>
                <p className={`text-[11px] font-semibold uppercase tracking-wider mb-2.5 ${isDark ? 'text-gov-400' : 'text-gray-500'}`}>
                  Ranh Giới Hành Chính
                </p>
                <div className="space-y-1.5">
                  <BoundaryRow direction="north" value={activeVillage.north} />
                  <BoundaryRow direction="south" value={activeVillage.south} />
                  <BoundaryRow direction="east" value={activeVillage.east} />
                  <BoundaryRow direction="west" value={activeVillage.west} />
                </div>
              </div>

              <div className="section-divider" />
              <LandmarkList landmarks={activeVillage.landmarks} />
              <div className="h-6" />
            </div>
          </motion.div>
        )}

        {/* ── 2. SCHOOL DETAILS ── */}
        {activeSchool && (
          <motion.div
            key={activeKey}
            className="flex flex-col h-full overflow-hidden"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <div className={`flex-shrink-0 flex items-center justify-between px-5 py-4 ${isDark ? 'border-b border-gov-800/40' : 'border-b border-gray-100'}`}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-green-500/20 text-green-500">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h2 className={`text-base font-display font-bold leading-tight truncate ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {activeSchool.name}
                  </h2>
                  <p className={`text-[11px] ${isDark ? 'text-gov-500' : 'text-gray-400'}`}>
                    Cơ sở giáo dục
                  </p>
                </div>
              </div>
              <button onClick={handleClose} className={`p-2 rounded-xl transition-colors flex-shrink-0 ${isDark ? 'text-gov-400 hover:bg-gov-800 hover:text-white' : 'text-gray-400 hover:bg-gray-100'}`} title="Đóng">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 scrollbar-thin">
              {/* Level Badge */}
              <div className="flex items-center gap-2">
                <span
                  className="px-3 py-1 rounded-xl text-xs font-bold"
                  style={{
                    background: getLevelBgColor(activeSchool.level as SchoolLevel),
                    color: getLevelColor(activeSchool.level as SchoolLevel),
                  }}
                >
                  {getLevelEmoji(activeSchool.level as SchoolLevel)} {activeSchool.level}
                </span>
              </div>

              {/* Principal */}
              {activeSchool.principal && (
                <div className={`p-3.5 rounded-2xl border text-xs ${isDark ? 'bg-gov-900/60 border-gov-800/60 text-gov-200' : 'bg-gray-50 border-gray-100 text-gray-700'}`}>
                  <div className="flex items-center gap-2 mb-1 text-[11px] font-semibold uppercase tracking-wider opacity-75">
                    <UserCheck className="w-3.5 h-3.5 text-green-500" />
                    <span>Hiệu trưởng</span>
                  </div>
                  <p className="text-sm font-bold">{activeSchool.principal}</p>
                </div>
              )}

              {/* Phone call button */}
              {activeSchool.phone && (
                <div className={`p-3.5 rounded-2xl border text-xs ${isDark ? 'bg-gov-900/60 border-gov-800/60 text-gov-200' : 'bg-gray-50 border-gray-100 text-gray-700'}`}>
                  <div className="flex items-center gap-2 mb-1 text-[11px] font-semibold uppercase tracking-wider opacity-75">
                    <Phone className="w-3.5 h-3.5 text-blue-500" />
                    <span>Điện thoại liên hệ</span>
                  </div>
                  <a
                    href={`tel:${activeSchool.phone.replace(/[^0-9+]/g, '')}`}
                    className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <span>{activeSchool.phone}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-500/10 font-normal">Bấm để gọi</span>
                  </a>
                </div>
              )}

              {/* Coordinates & Location */}
              <div className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${isDark ? 'bg-gov-900/60 border-gov-800/60 text-gov-300' : 'bg-gray-50 border-gray-100 text-gray-600'}`}>
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider opacity-75">
                  <MapPin className="w-3.5 h-3.5 text-accent-500" />
                  <span>Vị trí địa lý</span>
                </div>
                <p>Xã Sơn Đồng, Thành phố Hà Nội</p>
                <p className="font-mono text-[11px] opacity-75">
                  Tọa độ: {activeSchool.lat.toFixed(6)}, {activeSchool.lng.toFixed(6)}
                </p>
              </div>

              {/* Directions Button */}
              <button
                onClick={() => {
                  trackGetDirections(activeSchool.name, 'Trường học');
                  window.open(`https://www.google.com/maps/dir/?api=1&destination=${activeSchool.lat},${activeSchool.lng}`, '_blank');
                }}
                className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-xs transition-all shadow-sm ${isDark ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}
              >
                <Navigation className="w-4 h-4" />
                <span>Chỉ đường trên Google Maps</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* ── 3. RELIC DETAILS ── */}
        {activeRelic && (
          <motion.div
            key={activeKey}
            className="flex flex-col h-full overflow-hidden"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <div className={`flex-shrink-0 flex items-center justify-between px-5 py-4 ${isDark ? 'border-b border-gov-800/40' : 'border-b border-gray-100'}`}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-purple-500/20 text-purple-500">
                  <Landmark className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h2 className={`text-base font-display font-bold leading-tight truncate ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {activeRelic.name}
                  </h2>
                  <p className={`text-[11px] ${isDark ? 'text-gov-500' : 'text-gray-400'}`}>
                    Di tích lịch sử văn hóa
                  </p>
                </div>
              </div>
              <button onClick={handleClose} className={`p-2 rounded-xl transition-colors flex-shrink-0 ${isDark ? 'text-gov-400 hover:bg-gov-800 hover:text-white' : 'text-gray-400 hover:bg-gray-100'}`} title="Đóng">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 scrollbar-thin">
              {/* Badges: Rank + Type */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2.5 py-1 rounded-xl text-xs font-bold uppercase border ${
                  activeRelic.rank === 'Quốc Gia'
                    ? (isDark ? 'bg-amber-900/50 text-amber-300 border-amber-700/60' : 'bg-amber-100 text-amber-800 border-amber-300')
                    : (isDark ? 'bg-blue-900/50 text-blue-300 border-blue-700/60' : 'bg-blue-100 text-blue-800 border-blue-300')
                }`}>
                  <Award className="w-3.5 h-3.5 inline mr-1" />
                  Xếp hạng: {activeRelic.rank}
                </span>

                <span
                  className="px-2.5 py-1 rounded-xl text-xs font-bold border"
                  style={{
                    background: `${getRelicColor(activeRelic.type)}15`,
                    color: getRelicColor(activeRelic.type),
                    borderColor: `${getRelicColor(activeRelic.type)}30`,
                  }}
                >
                  {getRelicEmoji(activeRelic.type)} {activeRelic.type}
                </span>
              </div>

              {/* Village */}
              <div className={`p-3.5 rounded-2xl border text-xs ${isDark ? 'bg-gov-900/60 border-gov-800/60 text-gov-200' : 'bg-gray-50 border-gray-100 text-gray-700'}`}>
                <div className="flex items-center gap-2 mb-1 text-[11px] font-semibold uppercase tracking-wider opacity-75">
                  <MapPin className="w-3.5 h-3.5 text-accent-500" />
                  <span>Địa bàn thôn / xã</span>
                </div>
                <p className="text-sm font-bold">{activeRelic.village}, Xã Sơn Đồng</p>
              </div>

              {/* Decision Document Number */}
              {activeRelic.decisionNo && (
                <div className={`p-3.5 rounded-2xl border text-xs space-y-1 ${isDark ? 'bg-purple-950/50 border-purple-800/40 text-purple-200' : 'bg-purple-50/70 border-purple-200 text-purple-900'}`}>
                  <div className="flex items-center gap-1.5 font-bold">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Quyết định công nhận di tích:</span>
                  </div>
                  <p className="text-xs font-mono font-medium leading-relaxed">{activeRelic.decisionNo}</p>
                </div>
              )}

              {/* Directions Button */}
              <button
                onClick={() => {
                  trackGetDirections(activeRelic.name, 'Di tích lịch sử');
                  window.open(`https://www.google.com/maps/dir/?api=1&destination=${activeRelic.lat},${activeRelic.lng}`, '_blank');
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-xs transition-all shadow-sm bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
              >
                <Navigation className="w-4 h-4" />
                <span>Chỉ đường trên Google Maps</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* ── 4. HEALTH STATION DETAILS ── */}
        {activeHealthStation && (
          <motion.div
            key={activeKey}
            className="flex flex-col h-full overflow-hidden"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <div className={`flex-shrink-0 flex items-center justify-between px-5 py-4 ${isDark ? 'border-b border-gov-800/40' : 'border-b border-gray-100'}`}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-red-500/20 text-red-500">
                  <Cross className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h2 className={`text-base font-display font-bold leading-tight truncate ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {activeHealthStation.name}
                  </h2>
                  <p className={`text-[11px] ${isDark ? 'text-gov-500' : 'text-gray-400'}`}>
                    Y tế cơ sở địa phương
                  </p>
                </div>
              </div>
              <button onClick={handleClose} className={`p-2 rounded-xl transition-colors flex-shrink-0 ${isDark ? 'text-gov-400 hover:bg-gov-800 hover:text-white' : 'text-gray-400 hover:bg-gray-100'}`} title="Đóng">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 scrollbar-thin">
              {/* Doctor */}
              {activeHealthStation.doctor && (
                <div className={`p-3.5 rounded-2xl border text-xs ${isDark ? 'bg-gov-900/60 border-gov-800/60 text-gov-200' : 'bg-gray-50 border-gray-100 text-gray-700'}`}>
                  <div className="flex items-center gap-2 mb-1 text-[11px] font-semibold uppercase tracking-wider opacity-75">
                    <UserCheck className="w-3.5 h-3.5 text-red-500" />
                    <span>Bác sĩ phụ trách</span>
                  </div>
                  <p className="text-sm font-bold">{activeHealthStation.doctor}</p>
                </div>
              )}

              {/* Hotline Call Button */}
              {activeHealthStation.phone && (
                <div className={`p-3.5 rounded-2xl border text-xs ${isDark ? 'bg-red-950/50 border-red-800/40 text-red-200' : 'bg-red-50 border-red-100 text-red-900'}`}>
                  <div className="flex items-center gap-2 mb-1 text-[11px] font-semibold uppercase tracking-wider opacity-75">
                    <Phone className="w-3.5 h-3.5 text-red-500" />
                    <span>Đường dây nóng y tế</span>
                  </div>
                  <a
                    href={`tel:${activeHealthStation.phone.replace(/[^0-9+]/g, '')}`}
                    className="inline-flex items-center gap-2 text-sm font-bold text-red-600 dark:text-red-400 hover:underline"
                  >
                    <span>{activeHealthStation.phone}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-red-500/15 font-normal">Bấm gọi ngay</span>
                  </a>
                </div>
              )}

              {/* Directions Button */}
              <button
                onClick={() => {
                  trackGetDirections(activeHealthStation.name, 'Trạm Y tế');
                  window.open(`https://www.google.com/maps/dir/?api=1&destination=${activeHealthStation.lat},${activeHealthStation.lng}`, '_blank');
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-xs transition-all shadow-sm bg-red-600 hover:bg-red-700 text-white"
              >
                <Navigation className="w-4 h-4" />
                <span>Chỉ đường trên Google Maps</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* ── 5. GOV UNIT DETAILS ── */}
        {activeGovUnit && (
          <motion.div
            key={activeKey}
            className="flex flex-col h-full overflow-hidden"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <div className={`flex-shrink-0 flex items-center justify-between px-5 py-4 ${isDark ? 'border-b border-gov-800/40' : 'border-b border-gray-100'}`}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-indigo-500/20 text-indigo-500">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h2 className={`text-base font-display font-bold leading-tight truncate ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {activeGovUnit.name}
                  </h2>
                  <p className={`text-[11px] ${isDark ? 'text-gov-500' : 'text-gray-400'}`}>
                    Cơ quan hành chính sự nghiệp
                  </p>
                </div>
              </div>
              <button onClick={handleClose} className={`p-2 rounded-xl transition-colors flex-shrink-0 ${isDark ? 'text-gov-400 hover:bg-gov-800 hover:text-white' : 'text-gray-400 hover:bg-gray-100'}`} title="Đóng">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 scrollbar-thin">
              {/* Category Badge */}
              <div>
                <span
                  className="px-3 py-1 rounded-xl text-xs font-bold border"
                  style={{
                    background: `${getGovUnitCategoryColor(activeGovUnit.category)}15`,
                    color: getGovUnitCategoryColor(activeGovUnit.category),
                    borderColor: `${getGovUnitCategoryColor(activeGovUnit.category)}30`,
                  }}
                >
                  {getGovUnitCategoryEmoji(activeGovUnit.category)} {activeGovUnit.category}
                </span>
              </div>

              {/* Address */}
              {activeGovUnit.address && (
                <div className={`p-3.5 rounded-2xl border text-xs ${isDark ? 'bg-gov-900/60 border-gov-800/60 text-gov-200' : 'bg-gray-50 border-gray-100 text-gray-700'}`}>
                  <div className="flex items-center gap-2 mb-1 text-[11px] font-semibold uppercase tracking-wider opacity-75">
                    <MapPin className="w-3.5 h-3.5 text-accent-500" />
                    <span>Địa chỉ trụ sở</span>
                  </div>
                  <p className="text-sm font-semibold">{activeGovUnit.address}</p>
                </div>
              )}

              {/* Phone */}
              {activeGovUnit.phone && (
                <div className={`p-3.5 rounded-2xl border text-xs ${isDark ? 'bg-gov-900/60 border-gov-800/60 text-gov-200' : 'bg-gray-50 border-gray-100 text-gray-700'}`}>
                  <div className="flex items-center gap-2 mb-1 text-[11px] font-semibold uppercase tracking-wider opacity-75">
                    <Phone className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Điện thoại cơ quan</span>
                  </div>
                  <a href={`tel:${activeGovUnit.phone.replace(/[^0-9+]/g, '')}`} className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                    {activeGovUnit.phone}
                  </a>
                </div>
              )}

              {/* Directions Button */}
              <button
                onClick={() => {
                  trackGetDirections(activeGovUnit.name, 'Cơ quan hành chính');
                  window.open(`https://www.google.com/maps/dir/?api=1&destination=${activeGovUnit.lat},${activeGovUnit.lng}`, '_blank');
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-xs transition-all shadow-sm bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Navigation className="w-4 h-4" />
                <span>Chỉ đường trên Google Maps</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
});

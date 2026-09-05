import { memo } from 'react';
import { motion } from 'framer-motion';
import { Navigation } from 'lucide-react';
import { useAppContext } from '@/context/useAppContext';

// ============================================================
//  LandmarkList Component — Enhanced chips
// ============================================================

interface LandmarkListProps {
  landmarks: string[];
}

export const LandmarkList = memo(function LandmarkList({ landmarks }: LandmarkListProps) {
  const { isDark } = useAppContext();

  if (!landmarks || landmarks.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-2.5">
        <Navigation className={`w-3.5 h-3.5 ${isDark ? 'text-gold-400' : 'text-amber-500'}`} />
        <p className={`text-[11px] font-semibold uppercase tracking-wider ${isDark ? 'text-gov-400' : 'text-gray-500'}`}>
          Đường & Địa Danh
        </p>
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold
          ${isDark ? 'bg-gold-500/10 text-gold-400' : 'bg-amber-50 text-amber-600'}
        `}>
          {landmarks.length}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {landmarks.map((landmark, idx) => (
          <motion.span
            key={idx}
            className={`
              inline-flex items-center px-2.5 py-1.5 rounded-xl text-xs font-medium
              transition-all duration-200 hover:scale-[1.02]
              ${isDark
                ? 'bg-gradient-to-r from-gold-500/10 to-gold-600/5 text-gold-400 border border-gold-500/15'
                : 'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border border-amber-200/60'
              }
            `}
            initial={{ opacity: 0, scale: 0.85, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: idx * 0.04, duration: 0.2 }}
          >
            {landmark}
          </motion.span>
        ))}
      </div>
    </div>
  );
});

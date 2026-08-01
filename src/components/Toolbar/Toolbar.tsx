import { memo } from 'react';
import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

// ============================================================
//  Toolbar Component
//  Zoom controls overlay for the MapViewer.
// ============================================================

interface ToolbarProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

const ToolButton = ({
  onClick,
  icon,
  title,
  isDark,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  isDark: boolean;
}) => (
  <motion.button
    onClick={onClick}
    title={title}
    className={`
      p-2 rounded-lg transition-colors
      ${isDark
        ? 'text-gov-400 hover:text-white hover:bg-gov-700/80'
        : 'text-gray-500 hover:text-gray-800 hover:bg-white/80'
      }
    `}
    whileHover={{ scale: 1.08 }}
    whileTap={{ scale: 0.92 }}
  >
    {icon}
  </motion.button>
);

export const Toolbar = memo(function Toolbar({
  onZoomIn,
  onZoomOut,
  onReset,
}: ToolbarProps) {
  const { isDark } = useAppContext();

  return (
    <motion.div
      data-tour="map-toolbar"
      className={`
        absolute bottom-4 right-4 z-20 flex flex-col gap-1 p-1.5 rounded-xl
        backdrop-blur-md border shadow-glass
        ${isDark
          ? 'bg-gov-900/80 border-gov-700/60'
          : 'bg-white/80 border-gray-200'
        }
      `}
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <ToolButton onClick={onZoomIn} icon={<ZoomIn className="w-4 h-4" />} title="Phóng to" isDark={isDark} />
      <div className={`h-px mx-1 ${isDark ? 'bg-gov-700' : 'bg-gray-200'}`} />
      <ToolButton onClick={onZoomOut} icon={<ZoomOut className="w-4 h-4" />} title="Thu nhỏ" isDark={isDark} />
      <div className={`h-px mx-1 ${isDark ? 'bg-gov-700' : 'bg-gray-200'}`} />
      <ToolButton onClick={onReset} icon={<RotateCcw className="w-4 h-4" />} title="Đặt lại" isDark={isDark} />
    </motion.div>
  );
});

import { memo } from 'react';
import { motion } from 'framer-motion';
import { useAppContext } from '@/context/AppContext';
import { APP_CONFIG } from '@/config';

// ============================================================
//  Footer Component — Compact floating pill bar
// ============================================================

export const Footer = memo(function Footer() {
  const { isDark } = useAppContext();

  return (
    <motion.footer
      className={`
        flex-shrink-0 flex items-center justify-center px-4 h-7 text-[10px]
        transition-colors duration-300
        ${isDark
          ? 'bg-gov-950/80 text-gov-600'
          : 'bg-gray-50/80 text-gray-400'
        }
      `}
      initial={{ y: 28 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
    >
      <span className="truncate">
        {APP_CONFIG.title} — {APP_CONFIG.organization} · © {new Date().getFullYear()}
      </span>
    </motion.footer>
  );
});

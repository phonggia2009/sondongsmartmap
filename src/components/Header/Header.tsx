import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Moon,
  Sun,
  Maximize,
  Minimize,
  ChevronRight,
  Menu,
  X,
  HelpCircle,
  Search,
} from 'lucide-react';
import { useAppContext } from '@/context/useAppContext';
import { APP_CONFIG } from '@/config';

// ============================================================
//  Header Component — Glassmorphism floating header
// ============================================================

export const Header = memo(function Header() {
  const {
    isDark,
    toggleTheme,
    isFullscreen,
    toggleFullscreen,
    selectedVillage,
    sidebarOpen,
    toggleSidebar,
    startTour,
    openGlobalSearch,
  } = useAppContext();

  return (
    <motion.header
      className="glass-header relative z-30 flex items-center justify-between px-3 sm:px-4 h-14"
      initial={{ y: -56 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      {/* Left — Sidebar Toggle + Logo + Title */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Sidebar toggle */}
        <motion.button
          onClick={toggleSidebar}
          className={`
            p-2 rounded-xl transition-colors
            ${isDark
              ? 'text-gov-400 hover:text-white hover:bg-gov-800/80'
              : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
            }
          `}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title={sidebarOpen ? 'Thu gọn sidebar' : 'Mở sidebar'}
          data-tour="sidebar-toggle"
        >
          <AnimatePresence mode="wait" initial={false}>
            {sidebarOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <X className="w-[18px] h-[18px]" />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Menu className="w-[18px] h-[18px]" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <img src="/lgtc3.png" alt="Logo" className="w-8 h-8 object-contain rounded-lg" />

          <div className="hidden sm:block">
            <h1 className={`text-sm font-display font-bold leading-tight ${isDark ? 'text-white' : 'text-gov-900'}`}>
              {APP_CONFIG.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Center — Breadcrumb */}
      <div className="hidden md:flex items-center gap-1.5 text-sm">
        <span className={`
          px-2.5 py-1 rounded-lg text-xs font-medium
          ${isDark ? 'text-gov-400 bg-gov-800/50' : 'text-gray-500 bg-gray-100/80'}
        `}>
          Tổng quan
        </span>
        <AnimatePresence>
          {selectedVillage && (
            <>
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
              >
                <ChevronRight className={`w-3.5 h-3.5 ${isDark ? 'text-gov-600' : 'text-gray-300'}`} />
              </motion.div>
              <motion.span
                key={selectedVillage.id}
                className={`
                  px-2.5 py-1 rounded-lg text-xs font-semibold
                  ${isDark
                    ? 'text-accent-400 bg-accent-500/10 border border-accent-500/20'
                    : 'text-gov-700 bg-gov-50 border border-gov-200'
                  }
                `}
                initial={{ opacity: 0, x: -10, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 10, scale: 0.9 }}
                transition={{ duration: 0.25 }}
              >
                {selectedVillage.name}
              </motion.span>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Right — Controls */}
      <div className="flex items-center gap-1 sm:gap-1.5" data-tour="header-controls">
        {/* Global Search Button */}
        <motion.button
          onClick={openGlobalSearch}
          className={`
            flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-medium transition-all border
            ${isDark
              ? 'bg-gov-900/80 text-gov-300 border-gov-700/60 hover:bg-gov-800 hover:text-white'
              : 'bg-gray-100/90 text-gray-600 border-gray-200/80 hover:bg-white hover:text-gray-900 shadow-sm'
            }
          `}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          title="Tìm kiếm toàn bộ (Ctrl+K)"
        >
          <Search className="w-3.5 h-3.5 text-accent-500" />
          <span className="hidden md:inline">Tìm kiếm...</span>
          <kbd className={`hidden md:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono border ${isDark ? 'bg-gov-800 text-gov-400 border-gov-700' : 'bg-white text-gray-400 border-gray-200'}`}>
            Ctrl K
          </kbd>
        </motion.button>

        {/* Help / Tour button */}
        <motion.button
          onClick={startTour}
          className={`
            flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all border
            ${isDark
              ? 'bg-accent-500/15 text-accent-400 border-accent-500/30 hover:bg-accent-500/25'
              : 'bg-accent-50 text-accent-700 border-accent-200 hover:bg-accent-100'
            }
          `}
          whileHover={{ scale: 1.04, y: -1 }}
          whileTap={{ scale: 0.96 }}
          title="Hướng dẫn sử dụng website"
          data-tour="help-btn"
        >
          <HelpCircle className="w-4 h-4 text-accent-500" />
          <span className="hidden sm:inline">Hướng dẫn</span>
        </motion.button>

        {/* Dark mode toggle */}
        <motion.button
          onClick={toggleTheme}
          className={`
            p-2 rounded-xl transition-colors
            ${isDark
              ? 'text-gov-400 hover:text-amber-300 hover:bg-gov-800/80'
              : 'text-gray-500 hover:text-gov-700 hover:bg-gray-100'
            }
          `}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title={isDark ? 'Chế độ sáng' : 'Chế độ tối'}
        >
          <AnimatePresence mode="wait" initial={false}>
            {isDark ? (
              <motion.div
                key="sun"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Sun className="w-[18px] h-[18px]" />
              </motion.div>
            ) : (
              <motion.div
                key="moon"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Moon className="w-[18px] h-[18px]" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Fullscreen */}
        <motion.button
          onClick={toggleFullscreen}
          className={`
            p-2 rounded-xl transition-colors
            ${isDark
              ? 'text-gov-400 hover:text-white hover:bg-gov-800/80'
              : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
            }
          `}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title={isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
        >
          {isFullscreen ? <Minimize className="w-[18px] h-[18px]" /> : <Maximize className="w-[18px] h-[18px]" />}
        </motion.button>
      </div>
    </motion.header>
  );
});


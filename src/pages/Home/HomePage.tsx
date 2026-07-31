import { memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { useVillages } from '@/hooks/useVillages';
import { useKeyboard } from '@/hooks/useKeyboard';
import { useIsMobile } from '@/hooks/useIsMobile';
import { MapViewer } from '@/components/MapViewer/MapViewer';
import { InformationPanel } from '@/components/InformationPanel/InformationPanel';
import { Sidebar } from '@/components/Sidebar/Sidebar';
import { LoadingScreen } from '@/components/Loading/LoadingScreen';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import type { Village } from '@/types';

// ============================================================
//  MobileSidebarDrawer — overlay drawer, only shown on mobile
// ============================================================
//  MobileSidebarDrawer — Bottom Sheet on mobile
// ============================================================
const MobileSidebarDrawer = memo(function MobileSidebarDrawer({
  villages,
  sidebarOpen,
  onClose,
  onVillageSelect,
}: {
  villages: Village[];
  sidebarOpen: boolean;
  onClose: () => void;
  onVillageSelect: (village: Village) => void;
}) {
  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            key="mobile-backdrop"
            className="fixed inset-0 z-[600] bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Bottom Sheet Panel */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            key="mobile-bottom-sheet"
            className="fixed bottom-0 left-0 right-0 z-[601] flex flex-col"
            style={{ height: '80dvh', maxHeight: '80dvh' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320, mass: 0.8 }}
          >
            {/* Rounded top corners + drag handle */}
            <div className="flex-shrink-0 flex items-center justify-center py-2 rounded-t-3xl bg-white dark:bg-gov-900 shadow-2xl border-t border-gray-100 dark:border-gov-800">
              <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gov-700" />
            </div>

            {/* Sidebar content fills remaining height — always expanded in bottom sheet */}
            <div className="flex-1 min-h-0 overflow-hidden rounded-none">
              <Sidebar villages={villages} onVillageSelect={onVillageSelect} forceExpanded />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});


// ============================================================
//  DesktopSidebarColumn — inline flex column, only shown on desktop
// ============================================================
const DesktopSidebarColumn = memo(function DesktopSidebarColumn({
  villages,
  sidebarOpen,
  onVillageSelect,
}: {
  villages: Village[];
  sidebarOpen: boolean;
  onVillageSelect: (village: Village) => void;
}) {
  return (
    <div
      className="flex-shrink-0 flex flex-col overflow-hidden self-stretch transition-[width] duration-300 ease-in-out"
      style={{ width: sidebarOpen ? 320 : 56 }}
    >
      <Sidebar villages={villages} onVillageSelect={onVillageSelect} />
    </div>
  );
});

// ============================================================
//  HomePage
//  Map-first layout: Sidebar + MapViewer + InformationPanel
//  On mobile (< 768px): sidebar is an overlay drawer
//  On desktop: sidebar is a flex column with fixed width
// ============================================================

export default function HomePage() {
  const {
    selectedVillage,
    selectVillage,
    infoPanelOpen,
    setInfoPanelOpen,
    toggleInfoPanel,
    isDark,
    sidebarOpen,
    setSidebarOpen,
  } = useAppContext();

  const { villages, isLoading, isError, error, refetch } = useVillages();
  const isMobile = useIsMobile();

  // Stable keyboard shortcuts — useRef prevents array recreation on every render
  // which was causing useKeyboard's useEffect to re-register on each re-render
  const handleEscape = useCallback(() => selectVillage(null), [selectVillage]);
  useKeyboard([{ key: 'Escape', handler: handleEscape, description: 'Quay về tổng quan' }]);

  // Stable callbacks — never recreated unless their deps change
  const handleVillageSelectMobile = useCallback((village: Village) => {
    selectVillage(village);
    setSidebarOpen(false);
  }, [selectVillage, setSidebarOpen]);

  const handleVillageSelectDesktop = useCallback((village: Village) => {
    selectVillage(village);
  }, [selectVillage]);

  const handleCloseMobileDrawer = useCallback(() => {
    setSidebarOpen(false);
  }, [setSidebarOpen]);

  if (isLoading) return <LoadingScreen />;

  if (isError) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <EmptyState type="error" error={error} onRetry={() => refetch()} />
      </div>
    );
  }

  if (villages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <EmptyState type="empty" />
      </div>
    );
  }

  return (
    <motion.div
      className="flex flex-1 min-h-0 overflow-hidden relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* ── Sidebar column — ALWAYS in DOM for stable Leaflet flex layout ── */}
      {/* On mobile: width=0 (invisible), desktop: width=320 or 56.           */}
      {/* Never mount/unmount to prevent Leaflet map from seeing sudden        */}
      {/* parent-width changes that invalidateSize can't reliably catch.       */}
      <div
        className="flex-shrink-0 flex flex-col overflow-hidden self-stretch transition-[width] duration-300 ease-in-out"
        style={{ width: isMobile ? 0 : (sidebarOpen ? 320 : 56) }}
        aria-hidden={isMobile}
      >
        {!isMobile && (
          <Sidebar villages={villages} onVillageSelect={handleVillageSelectDesktop} />
        )}
      </div>

      {/* ── MOBILE ONLY: Bottom sheet overlay drawer ──────────────────────── */}
      {isMobile && (
        <MobileSidebarDrawer
          villages={villages}
          sidebarOpen={sidebarOpen}
          onClose={handleCloseMobileDrawer}
          onVillageSelect={handleVillageSelectMobile}
        />
      )}


      {/* CENTER — Map */}
      <div className="relative flex-1 flex overflow-hidden">
        <MapViewer selectedVillage={selectedVillage} />

        {/* LEFT OVERLAY — Information Panel */}
        <AnimatePresence>
          {infoPanelOpen && selectedVillage && (
            <InformationPanel
              village={selectedVillage}
              onClose={() => setInfoPanelOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Re-open panel button */}
        <AnimatePresence>
          {selectedVillage && !infoPanelOpen && (
            <motion.button
              key="open-panel-btn"
              onClick={toggleInfoPanel}
              title="Hiện thông tin chi tiết"
              className={`
                absolute top-4 left-4 z-[500]
                flex items-center gap-2 px-3.5 py-2.5 rounded-2xl
                text-xs font-semibold shadow-elevated backdrop-blur-md transition-all border
                ${isDark
                  ? 'bg-gov-900/85 text-gov-200 hover:bg-gov-800 border-gov-700/50 hover:border-gov-600'
                  : 'bg-white/92 text-gray-700 hover:bg-white border-gray-200/60 hover:border-gray-300'
                }
              `}
              initial={{ opacity: 0, x: -16, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -16, scale: 0.9 }}
              transition={{ duration: 0.25 }}
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
            >
              <Info className="w-4 h-4" />
              <span>Thông tin</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

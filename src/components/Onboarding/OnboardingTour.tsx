import { useState, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Map,
  Search,
  Compass,
  Info,
  Sliders,
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { useIsMobile } from '@/hooks/useIsMobile';

// ============================================================
//  TOUR STEPS DEFINITION
// ============================================================

export interface TourStep {
  id: string;
  title: string;
  description: string;
  /** CSS selector to spotlight on desktop (ignored on mobile) */
  targetSelector?: string;
  icon: typeof Map;
  badge: string;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  features?: string[];
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'Chào mừng đến với Bản đồ số Sơn Đồng',
    description:
      'Khám phá không gian số Xã Sơn Đồng với dữ liệu địa lý chính xác, thông tin 16 thôn xã, hệ thống trường học và các trạm y tế trên địa bàn.',
    icon: Sparkles,
    badge: 'Chào mừng',
    placement: 'center',
    features: [
      'Bản đồ ranh giới hành chính 16 thôn/tổ dân phố',
      'Tra cứu hệ thống trường học & Trạm Y Tế địa phương',
      'Liên hệ Bác sĩ phụ trách & Gọi điện trực tiếp cho Trạm Y Tế',
      'Giao diện hiện đại hỗ trợ Chế độ Tối (Dark mode)',
    ],
  },
  {
    id: 'sidebar-search',
    title: 'Danh mục & Thanh công cụ',
    description:
      'Sử dụng thanh công cụ icon đứng bên trái để chuyển nhanh giữa Thôn xã (🗺️), Trường học (🏫) và Trạm Y Tế (🏥). Mở rộng danh mục để tra cứu và lọc từ khóa.',
    targetSelector: '[data-tour="sidebar"]',
    icon: Search,
    badge: 'Bước 1 / 4',
    placement: 'right',
    features: [
      'Chuyển đổi nhanh 3 lớp dữ liệu: Thôn xã, Trường học & Trạm Y Tế',
      'Tìm kiếm theo tên thôn, tên trường, tên bác sĩ hoặc số điện thoại',
      'Tra cứu Bác sĩ phụ trách Trạm Y Tế & Nút gọi điện trực tiếp',
      'Click từng thẻ để phóng to tự động đến vị trí trên bản đồ',
    ],
  },
  {
    id: 'map-controls',
    title: 'Thao tác & Marker trên Bản đồ',
    description:
      'Bạn có thể di chuyển (pan), phóng to/thu nhỏ (zoom) hoặc nhấp vào vùng thôn, trường học và marker trạm y tế để xem thông tin chi tiết.',
    targetSelector: '[data-tour="map-toolbar"]',
    icon: Compass,
    badge: 'Bước 2 / 4',
    placement: 'top',
    features: [
      'Công cụ góc dưới bên phải để phóng to/thu nhỏ & đặt lại góc nhìn',
      'Marker Trạm Y Tế (🏥) tích hợp Popup thông tin Bác sĩ & SĐT',
      'Nút Chỉ đường Google Maps đến từng địa điểm',
    ],
  },
  {
    id: 'info-panel',
    title: 'Bảng Thông tin chi tiết',
    description:
      'Khi chọn một thôn xã, Bảng thông tin chi tiết sẽ xuất hiện ở bên trái hiển thị hình ảnh, diện tích, dân số, số hộ dân và danh sách công trình nổi bật.',
    icon: Info,
    badge: 'Bước 3 / 4',
    placement: 'center',
    features: [
      'Thống kê diện tích, dân số và số hộ dân chính xác',
      'Danh sách trường học và cơ sở hạ tầng trong khu vực',
      'Đóng/Mở linh hoạt bằng nút biểu tượng Thông tin',
    ],
  },
  {
    id: 'header-utilities',
    title: 'Tiện ích & Tùy chỉnh',
    description:
      'Tùy chỉnh trải nghiệm của bạn với nút đổi Chế độ Sáng/Tối, Bật toàn màn hình. Bạn có thể bấm nút "Hướng dẫn" bất cứ lúc nào để xem lại tour này.',
    targetSelector: '[data-tour="header-controls"]',
    icon: Sliders,
    badge: 'Bước 4 / 4',
    placement: 'bottom',
    features: [
      'Chuyển chế độ Giao diện Sáng (Light) / Tối (Dark)',
      'Xem ở chế độ Toàn màn hình (Fullscreen)',
      'Bấm nút "Hướng dẫn" trên thanh tiêu đề để xem lại Tour',
    ],
  },
];

// ============================================================
//  Desktop: smart card positioning relative to target element
// ============================================================
function getDesktopAlignmentClass(targetRect: DOMRect | null, placement?: string): string {
  if (!targetRect || placement === 'center') {
    return 'items-center justify-center p-4';
  }

  const screenW = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const screenH = typeof window !== 'undefined' ? window.innerHeight : 800;

  // Target is on the left side (Sidebar) -> card on the right
  if (targetRect.left < 100 && targetRect.height > screenH * 0.4) {
    return 'items-center justify-end p-4 pr-8 lg:pr-16';
  }

  // Target is at top (Header) -> card below header center-right
  if (targetRect.top < 100) {
    return 'items-start pt-20 justify-end p-4 pr-12';
  }

  // Target is at bottom right (Toolbar) -> card center-left
  if (targetRect.left > screenW * 0.5 && targetRect.top > screenH * 0.5) {
    return 'items-end pb-20 justify-start p-4 pl-16';
  }

  return 'items-center justify-center p-4';
}

// ============================================================
//  ONBOARDING TOUR COMPONENT
// ============================================================

export const OnboardingTour = memo(function OnboardingTour() {
  const { isTourOpen, completeTour, isDark } = useAppContext();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const isMobile = useIsMobile();

  const currentStep = TOUR_STEPS[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === TOUR_STEPS.length - 1;

  // Reset step when opening tour
  useEffect(() => {
    if (isTourOpen) setCurrentStepIndex(0);
  }, [isTourOpen]);

  // Measure target element position (desktop only)
  const updateTargetRect = useCallback(() => {
    if (isMobile || !currentStep.targetSelector) {
      setTargetRect(null);
      return;
    }
    const el = document.querySelector(currentStep.targetSelector);
    if (el) {
      let rect = el.getBoundingClientRect();
      if (currentStep.id === 'sidebar-search') {
        const toggleEl = document.querySelector('[data-tour="sidebar-toggle"]');
        const toggleRect = toggleEl?.getBoundingClientRect();
        const top = toggleRect ? Math.min(toggleRect.top, rect.top) : 0;
        rect = new DOMRect(
          rect.left,
          top,
          Math.max(rect.width, toggleRect ? toggleRect.right - rect.left : rect.width),
          rect.bottom - top
        );
      }
      setTargetRect(rect);
    } else {
      setTargetRect(null);
    }
  }, [currentStep.targetSelector, currentStep.id, isMobile]);

  useEffect(() => {
    if (!isTourOpen) return;
    updateTargetRect();
    const t = setTimeout(updateTargetRect, 120);
    window.addEventListener('resize', updateTargetRect);
    window.addEventListener('scroll', updateTargetRect, true);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', updateTargetRect);
      window.removeEventListener('scroll', updateTargetRect, true);
    };
  }, [isTourOpen, currentStepIndex, updateTargetRect]);

  // Keyboard navigation
  useEffect(() => {
    if (!isTourOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        completeTour();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        if (currentStepIndex < TOUR_STEPS.length - 1) {
          setCurrentStepIndex(prev => prev + 1);
        } else {
          completeTour();
        }
      } else if (e.key === 'ArrowLeft') {
        if (currentStepIndex > 0) {
          setCurrentStepIndex(prev => prev - 1);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTourOpen, currentStepIndex, completeTour]);

  if (!isTourOpen) return null;

  const StepIcon = currentStep.icon;

  // ── Shared card content ────────────────────────────────────
  const cardContent = (
    <>
      {/* Header Banner */}
      <div className={`
        relative px-4 sm:px-6 pt-4 sm:pt-5 pb-3 sm:pb-4 flex items-start justify-between border-b
        ${isDark ? 'border-gov-800/80 bg-gov-800/30' : 'border-gray-100 bg-gov-50/50'}
      `}>
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className={`
            p-2.5 sm:p-3 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-inner-glow flex-shrink-0
            ${isDark
              ? 'bg-gradient-to-br from-accent-600 to-gov-800 text-white'
              : 'bg-gradient-to-br from-accent-500 to-gov-600 text-white'
            }
          `}>
            <StepIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <span className={`
              inline-block px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wide uppercase
              ${isDark
                ? 'bg-accent-500/20 text-accent-400 border border-accent-500/30'
                : 'bg-accent-100 text-accent-700 border border-accent-200'
              }
            `}>
              {currentStep.badge}
            </span>
            <h3 className="text-base sm:text-lg font-bold font-display mt-0.5 leading-snug truncate">
              {currentStep.title}
            </h3>
          </div>
        </div>

        <button
          onClick={completeTour}
          className={`
            p-1.5 rounded-xl transition-colors flex-shrink-0 ml-2
            ${isDark ? 'text-gov-400 hover:text-white hover:bg-gov-800' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}
          `}
          title="Đóng / Bỏ qua hướng dẫn (Esc)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body */}
      <div className="px-4 sm:px-6 py-4 sm:py-5 space-y-3 sm:space-y-4 overflow-y-auto max-h-[50dvh] sm:max-h-none">
        <p className={`text-[13px] sm:text-sm leading-relaxed ${isDark ? 'text-gov-200' : 'text-gray-600'}`}>
          {currentStep.description}
        </p>

        {currentStep.features && currentStep.features.length > 0 && (
          <div className={`
            p-3 sm:p-3.5 rounded-xl sm:rounded-2xl space-y-1.5 sm:space-y-2 border text-[11px] sm:text-xs
            ${isDark
              ? 'bg-gov-800/40 border-gov-700/50 text-gov-300'
              : 'bg-gray-50 border-gray-200/70 text-gray-700'
            }
          `}>
            {currentStep.features.map((feat, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent-500 flex-shrink-0 mt-0.5" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        )}

        {/* Progress Dots */}
        <div className="flex items-center justify-center gap-1.5 pt-1">
          {TOUR_STEPS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStepIndex(idx)}
              className={`
                h-1.5 sm:h-2 rounded-full transition-all duration-300
                ${idx === currentStepIndex
                  ? 'w-6 sm:w-7 bg-accent-500'
                  : (isDark ? 'w-1.5 sm:w-2 bg-gov-700 hover:bg-gov-600' : 'w-1.5 sm:w-2 bg-gray-300 hover:bg-gray-400')
                }
              `}
              title={`Đến bước ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className={`
        px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between border-t gap-2 sm:gap-3
        ${isDark ? 'border-gov-800/80 bg-gov-900' : 'border-gray-100 bg-gray-50'}
      `}>
        <button
          onClick={completeTour}
          className={`
            text-[11px] sm:text-xs font-semibold px-2.5 sm:px-3 py-2 rounded-xl transition-colors
            ${isDark ? 'text-gov-400 hover:text-gov-200' : 'text-gray-500 hover:text-gray-800'}
          `}
        >
          Bỏ qua
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {!isFirstStep && (
            <button
              onClick={() => setCurrentStepIndex(prev => prev - 1)}
              className={`
                flex items-center gap-1 px-2.5 sm:px-3 py-2 rounded-xl text-[11px] sm:text-xs font-semibold border transition-all
                ${isDark
                  ? 'border-gov-700 bg-gov-800/60 text-gov-200 hover:bg-gov-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Quay lại</span>
            </button>
          )}

          <button
            onClick={() => {
              if (isLastStep) {
                completeTour();
              } else {
                setCurrentStepIndex(prev => prev + 1);
              }
            }}
            className={`
              flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-[11px] sm:text-xs font-semibold text-white shadow-md transition-all
              bg-gradient-to-r from-accent-600 to-gov-700 hover:from-accent-500 hover:to-gov-600
              active:scale-95
            `}
          >
            <span>{isLastStep ? 'Hoàn thành' : 'Tiếp theo'}</span>
            {isLastStep ? (
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            )}
          </button>
        </div>
      </div>
    </>
  );

  // ── MOBILE LAYOUT: Bottom sheet ────────────────────────────
  if (isMobile) {
    return (
      <AnimatePresence>
        <div className="fixed inset-0 z-[9999] pointer-events-auto">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={completeTour}
          />

          {/* Bottom Sheet */}
          <motion.div
            key={currentStep.id}
            className={`
              absolute bottom-0 left-0 right-0 z-10 rounded-t-3xl border-t overflow-hidden shadow-2xl
              ${isDark
                ? 'bg-gov-900 border-gov-700/80 text-white'
                : 'bg-white border-gray-200/80 text-gray-900'
              }
            `}
            style={{ maxHeight: '80dvh', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300, mass: 0.8 }}
          >
            {/* Drag handle */}
            <div className="flex items-center justify-center pt-3 pb-1">
              <div className={`w-10 h-1 rounded-full ${isDark ? 'bg-gov-700' : 'bg-gray-300'}`} />
            </div>

            {cardContent}
          </motion.div>
        </div>
      </AnimatePresence>
    );
  }

  // ── DESKTOP LAYOUT: Centered modal + spotlight ─────────────
  const alignmentClass = getDesktopAlignmentClass(targetRect, currentStep.placement);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] pointer-events-auto flex flex-col overflow-hidden">
        {/* Spotlight or full backdrop */}
        {targetRect ? (
          <>
            {/* Spotlight cutout with massive box-shadow */}
            <motion.div
              className="fixed pointer-events-none rounded-2xl ring-4 ring-accent-500 z-[9990]"
              style={{
                top: Math.max(0, targetRect.top - 6),
                left: Math.max(0, targetRect.left - 6),
                width: targetRect.width + 12,
                height: targetRect.height + 12,
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.65)',
              }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <div className="absolute -inset-1 rounded-2xl border-2 border-accent-400/80 animate-pulse pointer-events-none" />
            </motion.div>

            {/* Clickable backdrop behind the cutout */}
            <div
              className="fixed inset-0 z-[9989] cursor-pointer"
              onClick={completeTour}
            />
          </>
        ) : (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9990]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={completeTour}
          />
        )}

        {/* Card positioned relative to target */}
        <div className={`relative z-[9995] w-full h-full flex ${alignmentClass} pointer-events-none`}>
          <motion.div
            key={currentStep.id}
            className={`
              pointer-events-auto w-full max-w-lg overflow-hidden rounded-3xl border shadow-2xl backdrop-blur-2xl
              ${isDark
                ? 'bg-gov-900/95 border-gov-700/80 text-white shadow-black/80'
                : 'bg-white/95 border-gray-200/80 text-gray-900 shadow-gray-400/30'
              }
            `}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
          >
            {cardContent}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
});

import { motion } from 'framer-motion';
import { APP_CONFIG } from '@/config';

// ============================================================
//  LoadingScreen Component — Premium experience
// ============================================================

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50
      bg-gradient-to-br from-gov-950 via-gov-900 to-gov-950">
      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gov-600/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        className="relative flex flex-col items-center gap-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Animated map icon */}
        <div className="relative w-24 h-24">
          {/* Outer ring pulse */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-gov-700/30"
            animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Inner ring pulse */}
          <motion.div
            className="absolute inset-2 rounded-full border-2 border-gov-700/20"
            animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0, 0.2] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
          />
          {/* Spinning arc */}
          <motion.div
            className="absolute inset-3 rounded-full border-[3px] border-t-accent-400 border-r-accent-400/30 border-b-transparent border-l-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />
          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.svg
              className="w-9 h-9 text-accent-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"
              />
            </motion.svg>
          </div>
        </div>

        {/* Text */}
        <div className="text-center">
          <motion.h1
            className="text-2xl font-display font-bold text-white mb-1.5"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {APP_CONFIG.title}
          </motion.h1>
          <motion.p
            className="text-gov-400 text-sm font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {APP_CONFIG.organization}
          </motion.p>
        </div>

        {/* Progress shimmer bar */}
        <motion.div
          className="w-48 h-1 rounded-full overflow-hidden bg-gov-800"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-transparent via-accent-400/60 to-transparent animate-shimmer"
            style={{ backgroundSize: '200% 100%' }}
          />
        </motion.div>

        <motion.p
          className="text-gov-500 text-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          Đang tải dữ liệu bản đồ...
        </motion.p>
      </motion.div>
    </div>
  );
}

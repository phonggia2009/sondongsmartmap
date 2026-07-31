import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Database, Search } from 'lucide-react';

// ============================================================
//  EmptyState Component — Illustrated states
// ============================================================

interface EmptyStateProps {
  type?: 'error' | 'empty' | 'search';
  title?: string;
  message?: string;
  error?: Error | null;
  onRetry?: () => void;
}

export function EmptyState({
  type = 'empty',
  title,
  message,
  error,
  onRetry,
}: EmptyStateProps) {
  const config = {
    error: {
      icon: <AlertTriangle className="w-10 h-10" />,
      iconBg: 'from-red-500/10 to-red-600/5 text-red-400',
      iconBgLight: 'from-red-50 to-red-100/50 text-red-500',
      title: 'Không thể tải dữ liệu',
      message: 'Đã xảy ra lỗi khi tải thông tin bản đồ.',
    },
    empty: {
      icon: <Database className="w-10 h-10" />,
      iconBg: 'from-gov-700/20 to-gov-800/10 text-gov-400',
      iconBgLight: 'from-gray-100 to-gray-50 text-gray-400',
      title: 'Chưa có dữ liệu',
      message: 'Chưa có thông tin thôn/xã nào.',
    },
    search: {
      icon: <Search className="w-10 h-10" />,
      iconBg: 'from-gov-700/20 to-gov-800/10 text-gov-400',
      iconBgLight: 'from-gray-100 to-gray-50 text-gray-400',
      title: 'Không tìm thấy',
      message: 'Thử tìm kiếm với từ khóa khác.',
    },
  }[type];

  return (
    <motion.div
      className="flex flex-col items-center justify-center py-10 px-6 text-center"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`
        w-16 h-16 rounded-2xl flex items-center justify-center mb-4
        bg-gradient-to-br dark:${config.iconBg} ${config.iconBgLight}
      `}>
        {config.icon}
      </div>

      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
        {title ?? config.title}
      </h3>

      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 max-w-[240px] leading-relaxed">
        {message ?? config.message}
      </p>

      {error && (
        <details className="mt-2 text-left max-w-sm">
          <summary className="text-xs text-red-400 cursor-pointer hover:text-red-300 transition-colors">
            Chi tiết lỗi
          </summary>
          <pre className="mt-2 text-xs text-red-300 bg-red-950/30 rounded-xl p-3 overflow-auto max-h-32 whitespace-pre-wrap border border-red-900/30">
            {error.message}
          </pre>
        </details>
      )}

      {onRetry && (
        <motion.button
          onClick={onRetry}
          className="mt-4 flex items-center gap-2 px-4 py-2.5 rounded-xl
                     bg-gov-700 hover:bg-gov-600
                     text-white text-sm font-medium transition-all shadow-lg"
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
        >
          <RefreshCw className="w-4 h-4" />
          Thử lại
        </motion.button>
      )}
    </motion.div>
  );
}

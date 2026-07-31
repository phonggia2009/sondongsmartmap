import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import { AppProvider } from '@/context/AppContext';
import { Header } from '@/components/Header/Header';
import { Footer } from '@/components/Footer/Footer';
import { LoadingScreen } from '@/components/Loading/LoadingScreen';

// ============================================================
//  React Query Client
// ============================================================

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 2,
    },
  },
});

// ============================================================
//  Lazy-loaded pages
// ============================================================

const HomePage = lazy(() => import('@/pages/Home/HomePage'));

// ============================================================
//  App Layout Shell
// ============================================================

function AppShell() {
  return (
    <div className="flex flex-col h-screen overflow-hidden font-sans">
      <Header />

      <main className="flex flex-1 overflow-hidden">
        <Suspense fallback={<LoadingScreen />}>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/"  element={<HomePage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}

// ============================================================
//  Root App
// ============================================================

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppProvider>
          <AppShell />
        </AppProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { RootLayout } from '../components/layout/RootLayout';
import { LandingPage } from '../pages/LandingPage';
import { StudioPage } from '../pages/StudioPage';
import { AuthPage } from '../pages/AuthPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { PaymentReturnPage } from '../pages/PaymentReturnPage';
import { PaymentCancelPage } from '../pages/PaymentCancelPage';
import { ProtectedRoute } from './ProtectedRoute';

const KaraokeStudioPage = lazy(() => import('../pages/KaraokeStudioPage'));

export const AppRoutes = () => (
  <Routes>
    <Route path={ALL_ROUTER.PUBLIC.HOME} element={<RootLayout />}>
      <Route index element={<LandingPage />} />
      <Route path={ALL_ROUTER.PUBLIC.AUTH} element={<AuthPage />} />
      <Route path={ALL_ROUTER.PUBLIC.PAYMENT_CANCEL} element={<PaymentCancelPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path={ALL_ROUTER.PRIVATE.STUDIO} element={<StudioPage />} />
        <Route path={ALL_ROUTER.PRIVATE.PAYMENT_RETURN} element={<PaymentReturnPage />} />
        <Route
          path={ALL_ROUTER.PRIVATE.KARAOKE_STUDIO}
          element={
            <Suspense
              fallback={
                <div className="flex min-h-screen items-center justify-center text-sm text-slate-400">
                  Đang tải...
                </div>
              }
            >
              <KaraokeStudioPage />
            </Suspense>
          }
        />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Route>
  </Routes>
);

export const ALL_ROUTER = {
  PUBLIC: {
    HOME: '/',
    AUTH: '/auth',
    PAYMENT_CANCEL: '/payment/cancel',
  },
  PRIVATE: {
    STUDIO: '/studio',
    PAYMENT_RETURN: '/payment/return',
    KARAOKE_STUDIO: '/karaoke-studio',
  },
};

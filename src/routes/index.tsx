import { Routes, Route } from 'react-router-dom';
import { RootLayout } from '../components/layout/RootLayout';
import { LandingPage } from '../pages/LandingPage';
import { StudioPage } from '../pages/StudioPage';
import { AuthPage } from '../pages/AuthPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { ProtectedRoute } from './ProtectedRoute';

export const AppRoutes = () => (
  <Routes>
    <Route path={ALL_ROUTER.PUBLIC.HOME} element={<RootLayout />}>
      <Route index element={<LandingPage />} />
      <Route path={ALL_ROUTER.PUBLIC.AUTH} element={<AuthPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path={ALL_ROUTER.PRIVATE.STUDIO} element={<StudioPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Route>
  </Routes>
);

export const ALL_ROUTER = {
  PUBLIC: {
    HOME: '/',
    AUTH: '/auth',
  },
  PRIVATE: { STUDIO: '/studio' },
};

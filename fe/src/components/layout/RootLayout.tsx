import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';

export const RootLayout = () => {
  return (
    <>
      <div className="studio-bg"></div>
      <Header />
      <main className="min-h-screen pb-32">
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

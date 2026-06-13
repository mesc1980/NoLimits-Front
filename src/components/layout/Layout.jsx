/**
 * components/layout/Layout.jsx
 * Wrapper principal: Header + Outlet (páginas) + Footer + ChatBot flotante.
 * Aplica la clase de tema en <html> según el store.
 */

import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

/** Sube al inicio en cada cambio de ruta */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}
import { AnimatePresence, motion } from 'motion/react';
import Header  from './Header';
import Footer  from './Footer';
import ChatBot from '@/components/ui/ChatBot';
import useAppStore from '@/store/useAppStore';

const PAGE_VARIANTS = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit:    { opacity: 0 },
};

function Layout() {
  const theme    = useAppStore((s) => s.theme);
  const location = useLocation();

  useEffect(() => {
    const html = document.documentElement;
    if (theme === 'light') {
      html.classList.add('light');
    } else {
      html.classList.remove('light');
    }
  }, [theme]);

  // Edge scroll — se detiene si el mouse está sobre el navbar (Header)
  useEffect(() => {
    const ZONE = 150;
    const MAX_SPEED = 20;
    const MIN_SPEED = 5;
    let currentSpeed = 0;
    let animFrame;

    function scrollLoop() {
      if (currentSpeed !== 0) {
        window.scrollBy(0, currentSpeed);
      }
      animFrame = requestAnimationFrame(scrollLoop);
    }
    animFrame = requestAnimationFrame(scrollLoop);

    function onMouseMove(e) {
      const h = window.innerHeight;
      const y = e.clientY;

      // Detectar si el mouse está sobre el header/navbar
      const headerEl = document.querySelector('header');
      if (headerEl) {
        const rect = headerEl.getBoundingClientRect();
        if (e.clientY >= rect.top && e.clientY <= rect.bottom) {
          currentSpeed = 0;
          return;
        }
      }

      if (y > h - ZONE) {
        const ratio = (y - (h - ZONE)) / ZONE;
        currentSpeed = MIN_SPEED + ratio * (MAX_SPEED - MIN_SPEED);
      } else if (y < ZONE) {
        const ratio = (ZONE - y) / ZONE;
        currentSpeed = -(MIN_SPEED + ratio * (MAX_SPEED - MIN_SPEED));
      } else {
        currentSpeed = 0;
      }
    }

    function onMouseLeave() {
      currentSpeed = 0;
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);

    return () => {
      cancelAnimationFrame(animFrame);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <ScrollToTop />
      <Header />

      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      <Footer />

      {/* Chatbot flotante — presente en todas las páginas */}
      <ChatBot />
    </div>
  );
}

export default Layout;

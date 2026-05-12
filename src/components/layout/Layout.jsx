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
  initial: { opacity: 0, y: 8  },
  animate: { opacity: 1, y: 0  },
  exit:    { opacity: 0, y: -8 },
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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <ScrollToTop />
      <Header />

      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          variants={PAGE_VARIANTS}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          style={{ flex: 1 }}
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>

      <Footer />

      {/* Chatbot flotante — presente en todas las páginas */}
      <ChatBot />
    </div>
  );
}

export default Layout;

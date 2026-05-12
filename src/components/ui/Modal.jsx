/**
 * components/ui/Modal.jsx
 * Modal con portal, overlay oscuro y animación de entrada.
 * Cierra con click en overlay o tecla Escape.
 *
 * Props:
 *  isOpen    — boolean: controla visibilidad
 *  onClose   — función invocada al cerrar
 *  children  — contenido del modal
 *  className — clase adicional para el contenedor interno
 *
 * Animación: Framer Motion scale+fade, brandbook §09: 300ms
 * Estilos: components.css (.nl-modal*)
 */

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import PropTypes from 'prop-types';

function Modal({ isOpen, onClose, children, className = '' }) {
  /* Cierra con Escape y bloquea el scroll del body */
  useEffect(() => {
    if (!isOpen) return;

    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        /* Overlay — fade in */
        <motion.div
          className="nl-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          {/* Contenedor del modal — scale + fade */}
          <motion.div
            className={`nl-modal ${className}`}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            onClick={(e) => e.stopPropagation()} /* Evita cierre al click interno */
          >
            {/* Botón de cierre */}
            <button
              className="nl-modal__close"
              onClick={onClose}
              aria-label="Cerrar"
            >
              <X size={20} />
            </button>

            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

Modal.propTypes = {
  isOpen:    PropTypes.bool.isRequired,
  onClose:   PropTypes.func.isRequired,
  children:  PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default Modal;

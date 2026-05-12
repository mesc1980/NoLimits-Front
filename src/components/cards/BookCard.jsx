/**
 * components/cards/BookCard.jsx
 * Card horizontal para libros: portada pequeña a la izquierda + info a la derecha.
 * Brandbook §07.1: lista horizontal para libros.
 *
 * Props:
 *  obra    — Objeto normalizado al modelo Obra (source: 'openlibrary')
 *  onClick — callback opcional; si no se pasa, navega a /detail/:id
 *  style   — prop de estilo para stagger de animación
 *
 * Estilos: components.css (.nl-book-card*)
 */

import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { BookmarkPlus, BookmarkCheck } from 'lucide-react';
import PropTypes from 'prop-types';
import Badge from '@/components/ui/Badge';
import useAppStore from '@/store/useAppStore';
import { FADE_UP_VARIANTS } from '@/utils/constants';
import { mediaIdToSlug, truncateText } from '@/utils/formatters';

const COVER_FALLBACK = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="96" viewBox="0 0 64 96"%3E%3Crect width="64" height="96" fill="%231C1C1F"/%3E%3C/svg%3E';

function BookCard({ obra, onClick, style }) {
  const navigate   = useNavigate();
  const isInList   = useAppStore((s) => s.isInList(obra.id));
  const toggleList = useAppStore((s) => s.toggleList);

  function handleCardClick() {
    if (onClick) {
      onClick(obra);
    } else {
      navigate(`/detail/${mediaIdToSlug(obra.id)}`);
    }
  }

  function handleSave(e) {
    e.stopPropagation();
    toggleList(obra);
  }

  return (
    <motion.article
      className="nl-book-card"
      style={style}
      variants={FADE_UP_VARIANTS}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      aria-label={`Ver ${obra.title}`}
      onKeyDown={(e) => e.key === 'Enter' && handleCardClick()}
    >
      {/* Portada en miniatura — sin filtros ni marcos */}
      <img
        className="nl-book-card__cover"
        src={obra.poster ?? COVER_FALLBACK}
        alt={`Portada de ${obra.title}`}
        loading="lazy"
        onError={(e) => { e.currentTarget.src = COVER_FALLBACK; }}
      />

      <div className="nl-book-card__body">
        {/* Título */}
        <p className="nl-book-card__title">{obra.title}</p>

        {/* Año · Tipo */}
        <p
          className="nl-media-card__meta"
          style={{ fontSize: '12px', color: 'var(--nl-text-secondary)', marginTop: '2px' }}
        >
          {obra.year} · <Badge type={obra.type} />
        </p>

        {/* Sinopsis truncada */}
        {obra.synopsis && (
          <p
            style={{
              fontSize: '12px',
              color: 'var(--nl-text-muted)',
              marginTop: '4px',
              lineHeight: 1.5,
            }}
          >
            {truncateText(obra.synopsis, 80)}
          </p>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
          {obra.rating !== '—' && <Badge variant="rating" label={obra.rating} />}

          <button
            className="nl-media-card__save"
            onClick={handleSave}
            aria-label={isInList ? 'Quitar de mi lista' : 'Guardar'}
          >
            {isInList
              ? <BookmarkCheck size={14} color="var(--nl-accent)" />
              : <BookmarkPlus  size={14} />
            }
          </button>
        </div>
      </div>
    </motion.article>
  );
}

BookCard.propTypes = {
  obra:    PropTypes.shape({
    id:       PropTypes.string.isRequired,
    type:     PropTypes.string.isRequired,
    title:    PropTypes.string.isRequired,
    year:     PropTypes.string,
    rating:   PropTypes.string,
    poster:   PropTypes.string,
    synopsis: PropTypes.string,
  }).isRequired,
  onClick: PropTypes.func,
  style:   PropTypes.object,
};

export default BookCard;

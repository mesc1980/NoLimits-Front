/**
 * components/cards/MediaCard.jsx
 * Card genérica para películas, series y videojuegos.
 * Identidad de marca: rating en acento, metadata en mono, título en Geist.
 *
 * Props:
 *  obra    — Objeto Obra normalizado
 *  onClick — callback opcional; si no, navega a /detail/:id
 *  style   — estilos adicionales (ej: animation-delay)
 */

import { useNavigate } from 'react-router-dom';
import { motion }      from 'motion/react';
import { BookmarkPlus, BookmarkCheck } from 'lucide-react';
import PropTypes  from 'prop-types';
import Badge      from '@/components/ui/Badge';
import useAppStore from '@/store/useAppStore';
import { FADE_UP_VARIANTS, MEDIA_TYPE_LABELS } from '@/utils/constants';
import { mediaIdToSlug } from '@/utils/formatters';

const POSTER_FALLBACK = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300"%3E%3Crect width="200" height="300" fill="%231C1C1F"/%3E%3C/svg%3E';

function MediaCard({ obra, onClick, style }) {
  const navigate   = useNavigate();
  const isInList   = useAppStore((s) => s.isInList(obra.id));
  const toggleList = useAppStore((s) => s.toggleList);

  function handleClick() {
    if (onClick) return onClick(obra);
    navigate(`/detail/${mediaIdToSlug(obra.id)}`);
  }

  function handleSave(e) {
    e.stopPropagation();
    toggleList(obra);
  }

  return (
    <motion.article
      variants={FADE_UP_VARIANTS}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.03, transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] } }}
      className="nl-media-card"
      style={{ ...style, minHeight: obra.type === 'game' ? '0px' : undefined }}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`Ver ${obra.title}`}  
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
    >
      {/* Poster — sin filtros ni marcos */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <img
          className="nl-media-card__poster"
          src={obra.poster ?? POSTER_FALLBACK}
          alt={`Poster de ${obra.title}`}
          loading="lazy"
          style={obra.type === 'game' ? { aspectRatio: '4/3' } : undefined}
          onError={(e) => { e.currentTarget.src = POSTER_FALLBACK; }}
        />

        {/* Rating sobre el poster — esquina superior derecha */}
        {obra.rating !== '—' && (
          <span
            style={{
              position:     'absolute',
              top:          '6px',
              right:        '6px',
              background:   'rgba(10,10,11,0.82)',
              borderRadius: '4px',
              padding:      '2px 6px',
              fontFamily:   'var(--font-mono)',
              fontSize:     '11px',
              fontWeight:   600,
              color:        'var(--nl-accent)',
              backdropFilter: 'blur(4px)',
            }}
          >
            ★ {obra.rating}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="nl-media-card__body">
        {/* Título en Geist */}
        <p
          style={{
            fontFamily:    'var(--font-display)',
            fontSize:      '13px',
            fontWeight:    600,
            letterSpacing: '-0.01em',
            color:         'var(--nl-text-primary)',
            lineHeight:    1.3,
            display:       '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient:'vertical',
            overflow:      'hidden',
            marginBottom:  '4px',
          }}
        >
          {obra.title}
        </p>

        {/* Metadata en mono: año · tipo */}
        <p
          style={{
            fontFamily:    'var(--font-mono)',
            fontSize:      '10px',
            color:         'var(--nl-text-muted)',
            letterSpacing: '0.03em',
          }}
        >
          {obra.year !== '—' ? obra.year : ''}
          {obra.year !== '—' && ' · '}
          <Badge type={obra.type} />
        </p>

        {/* Acción: guardar */}
        <button
          className="nl-media-card__save"
          onClick={handleSave}
          aria-label={isInList ? 'Quitar de mi lista' : 'Guardar en mi lista'}
          style={{ marginTop: 'var(--space-1)', alignSelf: 'flex-start' }}
        >
          {isInList
            ? <BookmarkCheck size={14} color="var(--nl-accent)" />
            : <BookmarkPlus  size={14} />
          }
        </button>
      </div>
    </motion.article>
  );
}

MediaCard.propTypes = {
  obra:    PropTypes.shape({
    id:     PropTypes.string.isRequired,
    type:   PropTypes.string.isRequired,
    title:  PropTypes.string.isRequired,
    year:   PropTypes.string,
    rating: PropTypes.string,
    poster: PropTypes.string,
  }).isRequired,
  onClick: PropTypes.func,
  style:   PropTypes.object,
};

export default MediaCard;

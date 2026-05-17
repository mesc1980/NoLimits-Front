import { useNavigate } from 'react-router-dom';
import { motion }      from 'motion/react';
import { BookmarkPlus, BookmarkCheck } from 'lucide-react';
import PropTypes   from 'prop-types';
import Badge       from '@/components/ui/Badge';
import useAppStore from '@/store/useAppStore';
import { FADE_UP_VARIANTS } from '@/utils/constants';
import { mediaIdToSlug }    from '@/utils/formatters';

const FALLBACK = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 225"%3E%3Crect width="400" height="225" fill="%231C1C1F"/%3E%3C/svg%3E';

function GameCard({ obra, onClick, style }) {
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
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`Ver ${obra.title}`}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      style={{
        ...style,
        background:   'var(--nl-bg-elevated)',
        borderRadius: 'var(--radius-card)',
        overflow:     'hidden',
        cursor:       'pointer',
        border:       '1px solid transparent',
        transition:   'border-color 150ms ease',
        display:      'flex',
        flexDirection:'column',
      }}
    >
      {/* Imagen landscape 16:9 */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <img
          src={obra.poster ?? FALLBACK}
          alt={`Poster de ${obra.title}`}
          loading="lazy"
          style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }}
          onError={(e) => { e.currentTarget.src = FALLBACK; }}
        />
        {obra.rating !== '—' && (
          <span style={{
            position: 'absolute', top: '6px', right: '6px',
            background: 'rgba(10,10,11,0.82)', borderRadius: '4px',
            padding: '2px 6px', fontFamily: 'var(--font-mono)',
            fontSize: '11px', fontWeight: 600, color: 'var(--nl-accent)',
            backdropFilter: 'blur(4px)',
          }}>
            ★ {obra.rating}
          </span>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', flex: 1 }}>
        <p style={{
          fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 600,
          letterSpacing: '-0.01em', color: 'var(--nl-text-primary)', lineHeight: 1.3,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {obra.title}
        </p>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--nl-text-muted)', letterSpacing: '0.03em' }}>
          {obra.year !== '—' ? obra.year : ''}{obra.year !== '—' && ' · '}<Badge type={obra.type} />
        </p>
        <button
          onClick={handleSave}
          aria-label={isInList ? 'Quitar de mi lista' : 'Guardar en mi lista'}
          style={{ marginTop: 'var(--space-1)', alignSelf: 'flex-start', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          {isInList ? <BookmarkCheck size={14} color="var(--nl-accent)" /> : <BookmarkPlus size={14} />}
        </button>
      </div>
    </motion.article>
  );
}

GameCard.propTypes = {
  obra:    PropTypes.object.isRequired,
  onClick: PropTypes.func,
  style:   PropTypes.object,
};

export default GameCard;
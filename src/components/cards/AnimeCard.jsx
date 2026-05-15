/**
 * components/cards/AnimeCard.jsx
 * Card para anime — ratio 3:4, rating sobre el poster, metadata en mono.
 */

import { useNavigate } from 'react-router-dom';
import { motion }      from 'motion/react';
import { Star } from 'lucide-react';
import PropTypes  from 'prop-types';
import Badge      from '@/components/ui/Badge';
import useAppStore from '@/store/useAppStore';
import { FADE_UP_VARIANTS } from '@/utils/constants';
import { mediaIdToSlug } from '@/utils/formatters';

const POSTER_FALLBACK = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 267"%3E%3Crect width="200" height="267" fill="%231C1C1F"/%3E%3C/svg%3E';

function AnimeCard({ obra, onClick, style, hideFavoriteButton = false }) {
  const navigate   = useNavigate();
  const isInList   = useAppStore((s) => s.isInList(obra.id));
  const toggleList = useAppStore((s) => s.toggleList);
  const isLoggedIn = () => {
  const token = localStorage.getItem("nl_token");
  const user = localStorage.getItem("nl_user");
  const auth = localStorage.getItem("nl_auth");

  if (!token || !user) return false;

  if (auth !== "1" && auth !== "true") return false;

  try {
    const parsedUser = JSON.parse(user);
    return !!parsedUser?.id || !!parsedUser?.correo || !!parsedUser?.email;
  } catch {
    return false;
  }
};

function handleSave(e) {
  e.preventDefault();
  e.stopPropagation();

  if (!isLoggedIn()) {
    alert("Debes iniciar sesión para guardar en favoritos");
    navigate("/login");
    return;
  }

  toggleList(obra);
}

  function handleClick() {
    if (onClick) return onClick(obra);
    navigate(`/detail/${mediaIdToSlug(obra.id)}`);
  }

  return (
    <motion.article
      style={style}
      variants={FADE_UP_VARIANTS}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.03, transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] } }}
      className="nl-anime-card"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`Ver ${obra.title}`}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
    >
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <img
          className="nl-anime-card__poster"
          style={{ aspectRatio: '3 / 4' }}
          src={obra.poster ?? POSTER_FALLBACK}
          alt={`Poster de ${obra.title}`}
          loading="lazy"
          onError={(e) => { e.currentTarget.src = POSTER_FALLBACK; }}
        />

        {!hideFavoriteButton && (
          <button
            onClick={handleSave}
            aria-label={isInList ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            title={isInList ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            style={{
              position: 'absolute',
              top: '8px',
              left: '8px',
              zIndex: 10,
              width: '34px',
              height: '34px',
              borderRadius: '999px',
              border: isInList
                ? '1px solid #facc15'
                : '1px solid rgba(255,255,255,0.25)',
              background: 'rgba(10,10,11,0.78)',
              color: isInList ? '#facc15' : '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backdropFilter: 'blur(4px)',
            }}
          >
            <Star
              size={18}
              color={isInList ? '#facc15' : '#fff'}
              fill="none"
            />
          </button>
        )}

        {/* Rating overlay */}
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

      <div className="nl-anime-card__body">
        <p
          style={{
            fontFamily:    'var(--font-display)',
            fontSize:      '12px',
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

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--nl-text-muted)' }}>
            {obra.year !== '—' ? obra.year : ''} · <Badge type={obra.type} />
          </span>
        </div>
      </div>
    </motion.article>
  );
}

AnimeCard.propTypes = {
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
  hideFavoriteButton: PropTypes.bool,
};

export default AnimeCard;
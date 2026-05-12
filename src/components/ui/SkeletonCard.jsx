/**
 * components/ui/SkeletonCard.jsx
 * Placeholder animado (shimmer) para mostrar mientras carga una MediaCard.
 * Imita la forma de la card real: poster 2:3 + líneas de texto.
 *
 * Props:
 *  count — cantidad de skeletons a renderizar (default 5)
 *
 * Animación: components.css .nl-skeleton + animations.css @keyframes nl-shimmer
 * Timing brandbook §09: 1.5s ∞
 */

import PropTypes from 'prop-types';

/** Un único skeleton con la forma de MediaCard */
function SingleSkeleton() {
  return (
    <div className="nl-skeleton-card">
      {/* Poster 2:3 */}
      <div
        className="nl-skeleton-card__poster nl-skeleton"
        style={{ aspectRatio: '2 / 3' }}
      />
      {/* Líneas de texto */}
      <div className="nl-skeleton-card__body">
        <div className="nl-skeleton-card__line nl-skeleton" />
        <div className="nl-skeleton-card__line nl-skeleton nl-skeleton-card__line--short" />
      </div>
    </div>
  );
}

function SkeletonCard({ count = 5 }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <SingleSkeleton key={i} />
      ))}
    </>
  );
}

SkeletonCard.propTypes = {
  count: PropTypes.number,
};

export default SkeletonCard;

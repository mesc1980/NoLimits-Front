/**
 * pages/Detail.jsx
 * Ficha completa de una obra — rediseñada con elementos de marca no/limits.
 *
 * Layout:
 *  [Backdrop hero 520px — título superpuesto]
 *  [Poster col (220px fijo)] | [Info col (flex:1) — rating · géneros · synopsis · reseña]
 *  [Más de esta saga — si obra.saga existe]
 *
 * La sinopsis y la reseña están DENTRO de la columna derecha para que
 * ambas columnas tengan masa visual equivalente.
 */

import { useParams, useNavigate }       from 'react-router-dom';
import { useState, useEffect }          from 'react';
import { motion }                       from 'motion/react';
import {
  ArrowLeft, BookmarkPlus, BookmarkCheck,
  Star, Calendar, Layers, ExternalLink,
} from 'lucide-react';
import Badge          from '@/components/ui/Badge';
import Button         from '@/components/ui/Button';
import WhereToFind    from '@/components/ui/WhereToFind';
import ContentSection from '@/components/sections/ContentSection';
import { useMovieDetail, useSeriesDetail } from '@/hooks/useTMDB';
import { useAnimeDetail }                  from '@/hooks/useJikan';
import { useGameDetail }                   from '@/hooks/useIGDB';
import { fetchMovieProviders, fetchSeriesProviders } from '@/services/whereToWatch';
import { useSagaSearch }   from '@/hooks/useSearch';
import useAppStore         from '@/store/useAppStore';
import { parseMediaSlug }  from '@/utils/formatters';
import { DATA_SOURCES, MEDIA_TYPES } from '@/utils/constants';

/* ── Etiqueta de sección estilo brandbook ─────────────────── */
function SectionLabel({ number, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: 'var(--space-3)' }}>
      <span
        style={{
          fontFamily:    'var(--font-mono)',
          fontSize:      '11px',
          color:         'var(--nl-accent)',
          letterSpacing: '0.04em',
          flexShrink:    0,
        }}
      >
        {String(number).padStart(2, '0')}
      </span>
      <span
        style={{
          fontFamily:    'var(--font-mono)',
          fontSize:      '11px',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color:         'var(--nl-text-muted)',
        }}
      >
        {children}
      </span>
      <span style={{ flex: 1, height: '1px', background: 'var(--nl-border)' }} />
    </div>
  );
}

/* ── Chip de género ───────────────────────────────────────── */
function GenreChip({ label }) {
  return (
    <span
      style={{
        padding:      '4px 12px',
        borderRadius: '20px',
        background:   'var(--nl-bg-subtle)',
        border:       '1px solid var(--nl-border)',
        fontSize:     '12px',
        fontFamily:   'var(--font-ui)',
        color:        'var(--nl-text-secondary)',
        whiteSpace:   'nowrap',
      }}
    >
      {label}
    </span>
  );
}

/* ── Providers de streaming ───────────────────────────────── */
function StreamingRow({ providers }) {
  if (!providers) return null;
  const services = providers.flatrate ?? providers.buy ?? [];
  const label    = providers.flatrate ? 'Streaming' : 'Comprar / alquilar';

  return (
    <div>
      <SectionLabel number={4}>{label}</SectionLabel>
      {services.length > 0 ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          {services.slice(0, 6).map((s) => (
            <a
              key={s.provider_id}
              href={providers.link}
              target="_blank"
              rel="noopener noreferrer"
              title={s.provider_name}
              style={{
                display:      'flex',
                alignItems:   'center',
                gap:          '6px',
                padding:      '5px 10px',
                background:   'var(--nl-bg-subtle)',
                borderRadius: 'var(--radius-badge)',
                border:       '1px solid var(--nl-border)',
                fontSize:     '12px',
                color:        'var(--nl-text-secondary)',
                textDecoration: 'none',
                transition:   'border-color 150ms ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--nl-text-secondary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--nl-border)'; }}
            >
              {s.logo_path && (
                <img
                  src={`https://image.tmdb.org/t/p/original${s.logo_path}`}
                  alt={s.provider_name}
                  style={{ width: '18px', height: '18px', borderRadius: '3px' }}
                />
              )}
              {s.provider_name}
            </a>
          ))}
        </div>
      ) : (
        <a
          href={`https://www.justwatch.com/mx/buscar?q=${encodeURIComponent('')}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--nl-accent)', textDecoration: 'none' }}
        >
          Ver opciones en JustWatch <ExternalLink size={12} />
        </a>
      )}
    </div>
  );
}

/* ── Sección "Más de esta saga" ───────────────────────────── */
function RelatedSaga({ saga }) {
  const { grouped, isLoading } = useSagaSearch(saga);
  const navigate = useNavigate();

  /* Mezcla películas + series + anime del resultado */
  const related = [
    ...(grouped.movies ?? []),
    ...(grouped.series ?? []),
    ...(grouped.anime  ?? []),
  ].slice(0, 10);

  if (!isLoading && related.length === 0) return null;

  return (
    <div style={{ marginTop: 'var(--space-12)', paddingTop: 'var(--space-8)', borderTop: '1px solid var(--nl-border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
        <motion.span
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          style={{ display: 'block', width: '28px', height: '3px', background: 'var(--nl-accent)', transformOrigin: 'left', flexShrink: 0 }}
        />
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--nl-text-muted)' }}>
          Más de la saga
        </p>
      </div>

      <button
        onClick={() => navigate(`/saga/${encodeURIComponent(saga)}`)}
        style={{
          display:       'inline-flex',
          alignItems:    'center',
          gap:           '6px',
          fontFamily:    'var(--font-display)',
          fontSize:      'clamp(20px, 3vw, 32px)',
          fontWeight:    700,
          letterSpacing: '-0.02em',
          color:         'var(--nl-text-primary)',
          background:    'none',
          border:        'none',
          cursor:        'pointer',
          padding:       0,
          marginBottom:  'var(--space-6)',
          transition:    'color 150ms ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--nl-accent)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--nl-text-primary)'; }}
      >
        {saga}
        <ExternalLink size={16} />
      </button>

      <ContentSection
        title=""
        obras={related}
        isLoading={isLoading}
        cardType="media"
        limit={10}
      />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   PÁGINA PRINCIPAL
════════════════════════════════════════════════════════════ */
function Detail() {
  const { mediaId } = useParams();
  const navigate    = useNavigate();
  const { source, type, nativeId } = parseMediaSlug(mediaId ?? '');

  const isMovie  = source === DATA_SOURCES.TMDB && type === MEDIA_TYPES.MOVIE;
  const isSeries = source === DATA_SOURCES.TMDB && type === MEDIA_TYPES.SERIES;
  const isAnime  = source === DATA_SOURCES.JIKAN;
  const isGame   = source === DATA_SOURCES.IGDB;

  const movieRes  = useMovieDetail (isMovie  ? nativeId : null);
  const seriesRes = useSeriesDetail(isSeries ? nativeId : null);
  const animeRes  = useAnimeDetail (isAnime  ? nativeId : null);
  const gameRes   = useGameDetail  (isGame   ? nativeId : null);

  const { data: obra, isLoading, error } =
    isMovie  ? movieRes  :
    isSeries ? seriesRes :
    isAnime  ? animeRes  :
    isGame   ? gameRes   :
    { data: null, isLoading: false, error: new Error(`Tipo no soportado: ${source}/${type}`) };

  const [providers, setProviders] = useState(null);
  useEffect(() => {
    if (!obra) return;
    if (isMovie)  fetchMovieProviders(nativeId).then(setProviders).catch(() => {});
    if (isSeries) fetchSeriesProviders(nativeId).then(setProviders).catch(() => {});
  }, [obra?.id]);

  const isInList   = useAppStore((s) => obra ? s.isInList(obra.id) : false);
  const toggleList = useAppStore((s) => s.toggleList);
  const getReview  = useAppStore((s) => s.getReview);
  const setReview  = useAppStore((s) => s.setReview);
  const [reviewText, setReviewText] = useState('');
  useEffect(() => { if (obra) setReviewText(getReview(obra.id)); }, [obra?.id]);

  /* ── Loading ────────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="container" style={{ paddingTop: 'var(--space-16)', paddingBottom: 'var(--space-16)' }}>
        {/* Skeleton de backdrop */}
        <div className="nl-skeleton" style={{ height: '520px', borderRadius: 0, marginBottom: 0 }} />
        <div style={{ display: 'flex', gap: 'var(--space-8)', marginTop: 'var(--space-8)' }}>
          <div className="nl-skeleton" style={{ width: '220px', aspectRatio: '2/3', flexShrink: 0 }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {[80, 50, 100, 60, 40].map((w, i) => (
              <div key={i} className="nl-skeleton" style={{ height: i === 0 ? '40px' : '16px', width: `${w}%` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ── Error ──────────────────────────────────────────────── */
  if (error || !obra) {
    return (
      <div className="container" style={{ paddingTop: 'var(--space-16)' }}>
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Volver
        </Button>
        <p style={{ color: 'var(--nl-text-muted)', marginTop: 'var(--space-4)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
          No se pudo cargar esta obra. ({source}/{type}/{nativeId})
        </p>
      </div>
    );
  }

  /* ── Render ─────────────────────────────────────────────── */
  return (
    <div>
      {/* ══ HERO BACKDROP ═══════════════════════════════════ */}
      <div
        style={{
          position:   'relative',
          height:     'clamp(300px, 45vw, 520px)',
          overflow:   'hidden',
          background: 'var(--nl-bg-elevated)',
        }}
      >
        {obra.backdrop && (
          <motion.img
            src={obra.backdrop}
            alt=""
            aria-hidden="true"
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1.0  }}
            transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 25%' }}
          />
        )}

        {/* Gradiente */}
        {/* Gradiente:
              - Capa inferior full-width: cubre TODO el ancho en la franja baja
                para que cualquier título, sin importar su longitud, sea legible.
              - Capa lateral: detalle visual decorativo, no afecta legibilidad. */}
        <div
          style={{
            position:   'absolute',
            inset:      0,
            background: `
              linear-gradient(to top,
                rgba(10,10,11,1)    0%,
                rgba(10,10,11,0.92) 20%,
                rgba(10,10,11,0.5)  45%,
                transparent         70%
              ),
              linear-gradient(to right,
                rgba(10,10,11,0.5) 0%,
                transparent        55%
              )
            `,
          }}
        />

        {/* Botón volver */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          onClick={() => navigate(-1)}
          style={{
            position:   'absolute',
            top:        'var(--space-6)',
            left:       'var(--space-6)',
            display:    'flex',
            alignItems: 'center',
            gap:        '6px',
            color:      'rgba(255,255,255,0.65)',
            background: 'rgba(10,10,11,0.4)',
            border:     '1px solid rgba(255,255,255,0.15)',
            borderRadius:'var(--radius-btn)',
            padding:    '6px 14px',
            cursor:     'pointer',
            fontSize:   '13px',
            fontFamily: 'var(--font-ui)',
            transition: 'background 150ms ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(10,10,11,0.7)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(10,10,11,0.4)'; }}
        >
          <ArrowLeft size={14} /> Volver
        </motion.button>

        {/* Título superpuesto en el backdrop */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1,  y: 0  }}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="container"
          style={{
            position:      'absolute',
            bottom:        0,
            left:          '50%',
            transform:     'translateX(-50%)',
            width:         '100%',
            paddingBottom: 'var(--space-8)',
          }}
        >
          {/* Badge + saga */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)', flexWrap: 'wrap' }}>
            <Badge type={obra.type} />
            {obra.saga && (
              <button
                onClick={() => navigate(`/saga/${encodeURIComponent(obra.saga)}`)}
                style={{
                  display:    'flex',
                  alignItems: 'center',
                  gap:        '4px',
                  background: 'rgba(255,77,77,0.15)',
                  border:     '1px solid rgba(255,77,77,0.35)',
                  borderRadius:'20px',
                  padding:    '3px 10px',
                  fontSize:   '11px',
                  fontFamily: 'var(--font-mono)',
                  color:      'var(--nl-accent)',
                  cursor:     'pointer',
                  letterSpacing: '0.04em',
                }}
              >
                <Layers size={10} /> {obra.saga}
              </button>
            )}
          </div>

          <h1
            style={{
              fontFamily:    'var(--font-display)',
              fontSize:      'clamp(24px, 4.5vw, 56px)',
              fontWeight:    700,
              letterSpacing: '-0.04em',
              lineHeight:    1.05,
              color:         '#fff',
              /* maxWidth evita que títulos largos lleguen a la zona sin gradiente */
              maxWidth:      'min(72%, 780px)',
              overflowWrap:  'break-word',
              /* Sombra reforzada como segunda línea de defensa */
              textShadow:    '0 1px 0 rgba(0,0,0,0.8), 0 4px 24px rgba(0,0,0,0.7)',
            }}
          >
            {obra.title}
          </h1>
        </motion.div>
      </div>

      {/* ══ CONTENIDO PRINCIPAL ═════════════════════════════ */}
      <div className="container" style={{ paddingBottom: 'var(--space-16)' }}>
        <div
          style={{
            display:               'grid',
            gridTemplateColumns:   '220px 1fr',
            gap:                   'var(--space-8)',
            alignItems:            'flex-start',
            marginTop:             'var(--space-8)',
          }}
        >
          {/* ── COLUMNA IZQUIERDA: Poster + acciones rápidas ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0  }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
          >
            {/* Poster */}
            {obra.poster && (
              <img
                src={obra.poster}
                alt={`Poster de ${obra.title}`}
                style={{
                  width:        '100%',
                  aspectRatio:  '2/3',
                  objectFit:    'cover',
                  borderRadius: 'var(--radius-card)',
                  display:      'block',
                  border:       '1px solid var(--nl-border)',
                }}
              />
            )}

            {/* Rating destacado */}
            {obra.rating !== '—' && (
              <div
                style={{
                  background:   'var(--nl-bg-elevated)',
                  border:       '1px solid var(--nl-border)',
                  borderRadius: 'var(--radius-card)',
                  padding:      'var(--space-4)',
                  textAlign:    'center',
                }}
              >
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--nl-text-muted)', marginBottom: '6px' }}>
                  Valoración
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <Star size={16} color="var(--nl-accent)" fill="var(--nl-accent)" />
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 700, color: 'var(--nl-accent)', letterSpacing: '-0.02em' }}>
                    {obra.rating}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--nl-text-muted)' }}>/10</span>
                </div>
              </div>
            )}

            {/* Año */}
            <div
              style={{
                background:   'var(--nl-bg-elevated)',
                border:       '1px solid var(--nl-border)',
                borderRadius: 'var(--radius-card)',
                padding:      'var(--space-3) var(--space-4)',
                display:      'flex',
                alignItems:   'center',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--nl-text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={12} /> Año
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 600, color: 'var(--nl-text-primary)' }}>
                {obra.year}
              </span>
            </div>

            {/* Botón guardar */}
            <Button
              variant={isInList ? 'secondary' : 'primary'}
              onClick={() => toggleList(obra)}
              style={{ width: '100%' }}
            >
              {isInList ? <BookmarkCheck size={16} /> : <BookmarkPlus size={16} />}
              {isInList ? 'En tu lista' : 'Guardar en mi lista'}
            </Button>

            {/* WhereToFind */}
            <div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--nl-text-muted)', marginBottom: 'var(--space-2)' }}>
                Dónde encontrarlo
              </p>
              <WhereToFind obra={obra} providers={providers} compact={!providers} />
            </div>
          </motion.div>

          {/* ── COLUMNA DERECHA: Todo el contenido narrativo ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0  }}
            transition={{ duration: 0.5, delay: 0.35 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}
          >
            {/* 01 · GÉNEROS */}
            {obra.genres.length > 0 && (
              <div>
                <SectionLabel number={1}>Géneros</SectionLabel>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                  {obra.genres.map((g) => <GenreChip key={g} label={g} />)}
                </div>
              </div>
            )}

            {/* 02 · PLATAFORMAS (juegos / redes de TV) */}
            {obra.platforms.length > 0 && (
              <div>
                <SectionLabel number={2}>
                  {obra.type === MEDIA_TYPES.GAME ? 'Plataformas' : 'Redes / estudios'}
                </SectionLabel>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                  {obra.platforms.slice(0, 8).map((p) => <GenreChip key={p} label={p} />)}
                </div>
              </div>
            )}

            {/* 03 · STREAMING */}
            {(isMovie || isSeries) && (
              <StreamingRow providers={providers} />
            )}

            {/* 04 · SINOPSIS */}
            {obra.synopsis && (
              <div>
                <SectionLabel number={obra.platforms.length > 0 ? 3 : 2}>Sinopsis</SectionLabel>
                <p
                  style={{
                    fontSize:   '15px',
                    lineHeight: 1.8,
                    color:      'var(--nl-text-secondary)',
                  }}
                >
                  {obra.synopsis}
                </p>
              </div>
            )}

            {/* 05 · MI RESEÑA */}
            <div>
              <SectionLabel number={obra.synopsis ? 5 : 4}>Mi reseña personal</SectionLabel>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Escribe tu opinión sobre esta obra…"
                rows={5}
                style={{
                  width:        '100%',
                  background:   'var(--nl-bg-elevated)',
                  border:       '1px solid var(--nl-border)',
                  borderRadius: 'var(--radius-card)',
                  color:        'var(--nl-text-primary)',
                  padding:      'var(--space-4)',
                  fontSize:     '14px',
                  lineHeight:   1.7,
                  resize:       'vertical',
                  outline:      'none',
                  fontFamily:   'var(--font-ui)',
                  display:      'block',
                  marginBottom: 'var(--space-3)',
                  transition:   'border-color 150ms ease',
                }}
                onFocus={(e)  => { e.currentTarget.style.borderColor = 'var(--nl-accent)'; }}
                onBlur={(e)   => { e.currentTarget.style.borderColor = 'var(--nl-border)'; }}
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setReview(obra.id, reviewText)}
              >
                Guardar reseña
              </Button>
              {reviewText && getReview(obra.id) === reviewText && (
                <span style={{ marginLeft: 'var(--space-3)', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--nl-text-muted)' }}>
                  ✓ guardada
                </span>
              )}
            </div>
          </motion.div>
        </div>

        {/* Responsive: en pantallas angostas colapsa a 1 col */}
        <style>{`
          @media (max-width: 767px) {
            .detail-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>

        {/* ── MÁS DE ESTA SAGA ─────────────────────────────── */}
        {obra.saga && (
          <RelatedSaga saga={obra.saga} />
        )}
      </div>
    </div>
  );
}

export default Detail;

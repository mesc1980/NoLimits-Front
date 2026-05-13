/**
 * components/ui/WhereToFind.jsx
 * Muestra dónde encontrar una obra según su tipo.
 *
 * Modo "compact" — saga page: íconos de plataformas sin llamadas extra.
 * Modo "full" — detail page: proveedores de TMDB cargados desde la API.
 *
 * Por tipo:
 *  movie/series → TMDB watch providers (modo full) | JustWatch link (compact)
 *  game         → plataformas de IGDB (platforms[])
 *  anime        → plataformas (studios[]) + link Crunchyroll
 *  book         → Open Library (lectura gratuita)
 *  music        → MusicBrainz
 */

import PropTypes from 'prop-types';
import { ExternalLink, BookOpen, Gamepad2, Film, Music } from 'lucide-react';
import { MEDIA_TYPES, DATA_SOURCES } from '@/utils/constants';
import { mediaIdToSlug } from '@/utils/formatters';
import { useNavigate } from 'react-router-dom';

/* ── Mapeo de plataformas de juegos a colores de marca ──── */
const GAME_PLATFORM_CONFIG = {
  'PC':                   { color: '#60A5FA', abbr: 'PC'  },
  'PlayStation 5':        { color: '#003087', abbr: 'PS5' },
  'PlayStation 4':        { color: '#003087', abbr: 'PS4' },
  'Xbox Series X|S':      { color: '#107C10', abbr: 'XSX' },
  'Xbox One':             { color: '#107C10', abbr: 'XB1' },
  'Nintendo Switch':      { color: '#E4000F', abbr: 'NSW' },
  'iOS':                  { color: '#A78BFA', abbr: 'iOS' },
  'Android':              { color: '#34D399', abbr: 'AND' },
};

/* Normaliza el nombre de plataforma a una clave conocida */
function normalizePlatform(name) {
  if (!name) return null;
  for (const key of Object.keys(GAME_PLATFORM_CONFIG)) {
    if (name.toLowerCase().includes(key.toLowerCase())) return key;
    if (key.toLowerCase().includes(name.toLowerCase())) return key;
  }
  return null;
}

function PlatformBadge({ name }) {
  const normalized = normalizePlatform(name);
  const config     = normalized ? GAME_PLATFORM_CONFIG[normalized] : null;

  return (
    <span
      style={{
        padding:      '3px 8px',
        borderRadius: '4px',
        fontSize:     '11px',
        fontFamily:   'var(--font-mono)',
        fontWeight:   600,
        background:   config ? `${config.color}22` : 'var(--nl-bg-subtle)',
        color:        config ? config.color : 'var(--nl-text-muted)',
        border:       `1px solid ${config ? `${config.color}44` : 'var(--nl-border)'}`,
      }}
    >
      {config ? config.abbr : name.slice(0, 6)}
    </span>
  );
}

/* ── Botón de enlace externo ───────────────────────────── */
function LinkButton({ href, label, icon: Icon, accent = false }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display:      'inline-flex',
        alignItems:   'center',
        gap:          '6px',
        padding:      '6px 14px',
        borderRadius: 'var(--radius-btn)',
        fontSize:     '12px',
        fontFamily:   'var(--font-ui)',
        fontWeight:   500,
        background:   accent ? 'var(--nl-accent)' : 'var(--nl-bg-subtle)',
        color:        accent ? '#fff' : 'var(--nl-text-secondary)',
        border:       accent ? 'none' : '1px solid var(--nl-border)',
        textDecoration: 'none',
        transition:   'opacity 150ms ease',
        whiteSpace:   'nowrap',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85'; }}
      onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
    >
      {Icon && <Icon size={12} />}
      {label}
      <ExternalLink size={10} />
    </a>
  );
}

/* ── Componente principal ──────────────────────────────── */
function WhereToFind({ obra, compact = false, providers = null }) {
  if (!obra) return null;
  const { type, platforms = [], source } = obra;

  if (obra?.linksCompra?.length > 0) {
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
        {obra.linksCompra.map((link, index) => (
          <a
            key={index}
            href={link.url || link.urlCompra}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-btn)',
              background: 'var(--nl-bg-subtle)',
              border: '1px solid var(--nl-border)',
              fontSize: '12px',
              color: 'var(--nl-text-secondary)',
              textDecoration: 'none',
            }}
          >
            {link.label || link.plataformaNombre || link.plataforma?.nombre || 'Mercado Libre'}
            <ExternalLink size={10} />
          </a>
        ))}
      </div>
    );
  }

  /* ── Videojuegos ────────────────────────────────────── */
  if (type === MEDIA_TYPES.GAME) {
    const knownPlatforms = platforms.slice(0, 5);
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
        {knownPlatforms.map((p) => <PlatformBadge key={p} name={p} />)}
        {knownPlatforms.length === 0 && (
          <span style={{ fontSize: '12px', color: 'var(--nl-text-muted)' }}>PC · Consolas</span>
        )}
      </div>
    );
  }

  /* ── Libros ─────────────────────────────────────────── */
  if (type === MEDIA_TYPES.BOOK) {
    const openLibraryId = obra.id.replace('openlibrary:book:', '');
    const url = `https://openlibrary.org/works/${openLibraryId}`;
    return (
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <LinkButton href={url} label="Leer gratis" icon={BookOpen} accent />
      </div>
    );
  }

  /* ── Anime ──────────────────────────────────────────── */
  if (type === MEDIA_TYPES.ANIME) {
    return (
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <LinkButton href="https://www.crunchyroll.com" label="Crunchyroll" icon={Film} />
        <LinkButton href="https://www.netflix.com" label="Netflix" icon={Film} />
      </div>
    );
  }

  /* ── Películas y series (TMDB watch providers) ──────── */
  if (type === MEDIA_TYPES.MOVIE || type === MEDIA_TYPES.SERIES) {

    if (obra?.linksCompra?.length > 0) {
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          {obra.linksCompra.map((link, index) => (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 10px',
                background: 'var(--nl-bg-subtle)',
                borderRadius: 'var(--radius-badge)',
                border: '1px solid var(--nl-border)',
                fontSize: '12px',
                color: 'var(--nl-text-secondary)',
                textDecoration: 'none',
              }}
            >
              {link.label || link.plataformaNombre || 'Mercado Libre'}
            </a>
          ))}
        </div>
      );
    }

    if (compact) {
      /* En la saga page solo mostramos el link a JustWatch */
      const title     = encodeURIComponent(obra.title);
      const mediaType = type === MEDIA_TYPES.MOVIE ? 'movie' : 'tv';
      return (
        <LinkButton
          href={`https://www.justwatch.com/mx/buscar?q=${title}`}
          label="¿Dónde verlo?"
          icon={Film}
        />
      );
    }

    if (providers) {
      const services = providers.flatrate ?? providers.buy ?? [];
      if (services.length === 0) {
        return (
          <LinkButton
            href={providers.link || `https://www.justwatch.com/mx/buscar?q=${encodeURIComponent(obra.title)}`}
            label="Ver opciones en JustWatch"
            icon={Film}
            accent
          />
        );
      }
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          {services.slice(0, 5).map((s) => (
            <a
              key={s.provider_id}
              href={providers.link}
              target="_blank"
              rel="noopener noreferrer"
              title={s.provider_name}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 10px', background: 'var(--nl-bg-subtle)', borderRadius: '6px', fontSize: '12px', color: 'var(--nl-text-secondary)', textDecoration: 'none' }}
            >
              {s.logo_path && (
                <img src={`https://image.tmdb.org/t/p/original${s.logo_path}`} alt={s.provider_name}
                  style={{ width: '20px', height: '20px', borderRadius: '4px' }} />
              )}
              {s.provider_name}
            </a>
          ))}
        </div>
      );
    }

    /* Cargando o sin datos: link fallback */
    const title = encodeURIComponent(obra.title);
    return (
      <LinkButton
        href={`https://www.justwatch.com/mx/buscar?q=${title}`}
        label="¿Dónde verlo?"
        icon={Film}
      />
    );
  }

  /* ── Música ─────────────────────────────────────────── */
  if (type === MEDIA_TYPES.MUSIC) {
    const mbid = obra.id.replace('musicbrainz:music:', '');
    return (
      <LinkButton
        href={`https://musicbrainz.org/release-group/${mbid}`}
        label="Ver en MusicBrainz"
        icon={Music}
      />
    );
  }

  return null;
}

WhereToFind.propTypes = {
  obra:      PropTypes.object,
  compact:   PropTypes.bool,
  providers: PropTypes.object,
};

export default WhereToFind;

/**
 * components/layout/Footer.jsx — Con link a Términos y condiciones.
 */

import { Link } from 'react-router-dom';
import Logo from './Logo';

const DATA_SOURCES = [
  { label: 'TMDB API',      href: 'https://www.themoviedb.org' },
  { label: 'Jikan / MAL',   href: 'https://jikan.moe' },
  { label: 'Google Books',  href: 'https://books.google.com' },
  { label: 'IGDB',          href: 'https://www.igdb.com' },
  { label: 'RAWG',          href: 'https://rawg.io' },
  { label: 'MusicBrainz',   href: 'https://musicbrainz.org' },
];

function Footer() {
  return (
    <footer className="nl-footer">
      <div className="container nl-footer__inner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <Logo size="sm" />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--nl-text-muted)' }}>
            · Toda tu cultura, sin límites.
          </span>
        </div>

        <div className="nl-footer__sources">
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--nl-text-muted)' }}>
            Datos de:
          </span>
          {DATA_SOURCES.map((src) => (
            <a key={src.label} href={src.href} target="_blank" rel="noopener noreferrer" className="nl-footer__source-link">
              {src.label}
            </a>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          <p className="nl-footer__copy">
            Grupo 3 · TPY1101 · 2026 — Proyecto académico.
          </p>
          <Link
            to="/terms"
            style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--nl-text-muted)', textDecoration: 'underline', transition: 'color 150ms ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--nl-text-secondary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--nl-text-muted)'; }}
          >
            Términos y condiciones
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

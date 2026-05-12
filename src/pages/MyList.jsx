/**
 * pages/MyList.jsx — Biblioteca personal del usuario.
 * Español neutro.
 */

import { useState }    from 'react';
import { Link }        from 'react-router-dom';
import { motion }      from 'motion/react';
import MediaCard from '@/components/cards/MediaCard';
import AnimeCard from '@/components/cards/AnimeCard';
import BookCard  from '@/components/cards/BookCard';
import useAppStore from '@/store/useAppStore';
import { MEDIA_TYPES, CARD_STAGGER_DELAY } from '@/utils/constants';

const LIST_TABS = [
  { id: 'all',               label: 'Todo'       },
  { id: MEDIA_TYPES.MOVIE,   label: 'Películas'  },
  { id: MEDIA_TYPES.SERIES,  label: 'Series'     },
  { id: MEDIA_TYPES.ANIME,   label: 'Anime'      },
  { id: MEDIA_TYPES.BOOK,    label: 'Libros'     },
  { id: MEDIA_TYPES.GAME,    label: 'Juegos'     },
];

function CardForType({ obra }) {
  if (obra.type === MEDIA_TYPES.ANIME) return <AnimeCard obra={obra} />;
  if (obra.type === MEDIA_TYPES.BOOK)  return <BookCard  obra={obra} />;
  return <MediaCard obra={obra} />;
}

function MyList() {
  const [activeTab, setActiveTab] = useState('all');
  const myList = useAppStore((s) => s.myList);

  const filtered = activeTab === 'all'
    ? myList
    : myList.filter((o) => o.type === activeTab);

  return (
    <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
      {/* Encabezado */}
      <motion.header
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1,  y: 0  }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ marginBottom: 'var(--space-8)' }}
      >
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--nl-text-muted)', marginBottom: 'var(--space-3)' }}>
          Mi biblioteca
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 700, letterSpacing: '-0.03em' }}>
          {myList.length}{' '}
          <span style={{ color: 'var(--nl-accent)' }}>
            {myList.length === 1 ? 'obra guardada' : 'obras guardadas'}
          </span>
        </h1>
      </motion.header>

      {/* Estado vacío */}
      {myList.length === 0 && (
        <div style={{ textAlign: 'center', padding: 'var(--space-16) 0' }}>
          <p style={{ fontSize: '18px', color: 'var(--nl-text-secondary)', marginBottom: 'var(--space-4)' }}>
            Tu lista está vacía.
          </p>
          <Link to="/" style={{ color: 'var(--nl-accent)', fontWeight: 600, textDecoration: 'underline' }}>
            Explorar el catálogo
          </Link>
        </div>
      )}

      {/* Tabs de filtro */}
      {myList.length > 0 && (
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-6)' }}>
          {LIST_TABS.map((tab) => (
            <button
              key={tab.id}
              className={`nl-searchbar__tab ${activeTab === tab.id ? 'nl-searchbar__tab--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
              {tab.id !== 'all' && (
                <span style={{ marginLeft: '4px', opacity: 0.6 }}>
                  ({myList.filter((o) => o.type === tab.id).length})
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      {filtered.length > 0 && (
        <motion.div
          className="nl-grid nl-grid--cards"
          key={activeTab}
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: CARD_STAGGER_DELAY } } }}
        >
          {filtered.map((obra) => (
            <CardForType key={obra.id} obra={obra} />
          ))}
        </motion.div>
      )}

      {/* Filtro vacío */}
      {filtered.length === 0 && myList.length > 0 && (
        <p style={{ color: 'var(--nl-text-muted)', fontSize: '14px' }}>
          No tienes obras de este tipo en tu lista.
        </p>
      )}
    </div>
  );
}

export default MyList;

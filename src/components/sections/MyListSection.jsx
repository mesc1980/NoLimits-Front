/**
 * components/sections/MyListSection.jsx — Español neutro.
 */

import { Link } from 'react-router-dom';
import useAppStore from '@/store/useAppStore';
import ContentSection from './ContentSection';
import { MEDIA_TYPES } from '@/utils/constants';

function resolveCardType(type) {
  if (type === MEDIA_TYPES.ANIME) return 'anime';
  if (type === MEDIA_TYPES.BOOK)  return 'book';
  return 'media';
}

function MyListSection() {
  const myList = useAppStore((s) => s.myList);

  if (myList.length === 0) {
    return (
      <section className="nl-section">
        <div className="container">
          <h2 className="nl-section__title" style={{ marginBottom: 'var(--space-4)' }}>
            MI BIBLIOTECA
          </h2>
          <p style={{ color: 'var(--nl-text-muted)', fontSize: '14px' }}>
            Aún no has guardado nada.{' '}
            <Link to="/search" style={{ color: 'var(--nl-accent)', textDecoration: 'underline' }}>
              Explora el catálogo
            </Link>{' '}
            y guarda lo que te interese.
          </p>
        </div>
      </section>
    );
  }

  const preview  = myList.slice(0, 5);
  const cardType = resolveCardType(preview[0]?.type);

  return (
    <ContentSection
      title="MI BIBLIOTECA · GUARDADOS RECIENTES"
      obras={preview}
      cardType={cardType}
      limit={5}
    />
  );
}

export default MyListSection;

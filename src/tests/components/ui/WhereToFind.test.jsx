import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import WhereToFind from '@/components/ui/WhereToFind';
import { MEDIA_TYPES } from '@/utils/constants';

describe('WhereToFind - tests de regresión', () => {
  test('muestra links de compra cuando la obra tiene productos scrapeados', () => {
    const obra = {
      title: 'Producto prueba',
      type: MEDIA_TYPES.GAME,
      linksCompra: [
        {
          url: 'https://www.mercadolibre.cl/producto-prueba',
          label: 'Mercado Libre',
        },
      ],
    };

    render(<WhereToFind obra={obra} />);

    const link = screen.getByRole('link', { name: /mercado libre/i });

    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://www.mercadolibre.cl/producto-prueba');
  });

  test('muestra Steam cuando un videojuego tiene plataforma PC', () => {
    const obra = {
      title: 'Cyberpunk 2077',
      type: MEDIA_TYPES.GAME,
      platforms: ['PC'],
    };

    render(<WhereToFind obra={obra} />);

    expect(screen.getByText('PC')).toBeInTheDocument();

    const steamLink = screen.getByRole('link', { name: /steam/i });

    expect(steamLink).toBeInTheDocument();
    expect(steamLink).toHaveAttribute(
      'href',
      'https://store.steampowered.com/search/?term=Cyberpunk%202077'
    );
  });

  test('muestra Google Books para una obra de tipo libro', () => {
    const obra = {
      id: 'openlibrary:book:abc123',
      title: 'Libro prueba',
      type: MEDIA_TYPES.BOOK,
    };

    render(<WhereToFind obra={obra} />);

    const link = screen.getByRole('link', { name: /ver en google books/i });

    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://books.google.com/books?id=abc123');
  });

  test('muestra Crunchyroll y Netflix para anime', () => {
    const obra = {
      title: 'Anime prueba',
      type: MEDIA_TYPES.ANIME,
    };

    render(<WhereToFind obra={obra} />);

    expect(screen.getByRole('link', { name: /crunchyroll/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /netflix/i })).toBeInTheDocument();
  });

  test('muestra JustWatch y Buscar online para película en modo compact', () => {
    const obra = {
      title: 'Interestelar',
      type: MEDIA_TYPES.MOVIE,
    };

    render(<WhereToFind obra={obra} compact />);

    expect(screen.getByRole('link', { name: /justwatch/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /buscar online/i })).toBeInTheDocument();
  });

  test('muestra proveedores de streaming y excluye Google Play Movies', () => {
    const obra = {
      title: 'Breaking Bad',
      type: MEDIA_TYPES.SERIES,
    };

    const providers = {
      link: 'https://www.justwatch.com/mx/serie/breaking-bad',
      flatrate: [
        {
          provider_id: 8,
          provider_name: 'Netflix',
          logo_path: '/netflix.png',
        },
        {
          provider_id: 3,
          provider_name: 'Google Play Movies',
          logo_path: '/google.png',
        },
      ],
    };

    render(<WhereToFind obra={obra} providers={providers} />);

    expect(screen.getByRole('link', { name: /netflix/i })).toBeInTheDocument();
    expect(screen.queryByText(/google play movies/i)).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /buscar online/i })).toBeInTheDocument();
  });

  test('muestra MusicBrainz para una obra de tipo música', () => {
    const obra = {
      id: 'musicbrainz:music:mbid123',
      title: 'Canción prueba',
      type: MEDIA_TYPES.MUSIC,
    };

    render(<WhereToFind obra={obra} />);

    const link = screen.getByRole('link', { name: /ver en musicbrainz/i });

    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute(
      'href',
      'https://musicbrainz.org/release-group/mbid123'
    );
  });
});
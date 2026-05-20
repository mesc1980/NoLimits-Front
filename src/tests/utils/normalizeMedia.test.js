import { describe, expect, test } from 'vitest';

import {
  normalizeTmdbMovie,
  normalizeTmdbSeries,
  normalizeJikanAnime,
  normalizeOpenLibraryBook,
  normalizeIgdbGame,
  normalizeMusicBrainzRelease,
} from '@/utils/normalizeMedia';

describe('normalizeMedia', () => {
  test('normaliza una película de TMDB', () => {
    const movie = normalizeTmdbMovie({
      id: 1893,
      title: 'Star Wars',
      release_date: '1977-05-25',
      vote_average: 8.6,
      vote_count: 1000,
      poster_path: '/poster.jpg',
      backdrop_path: '/backdrop.jpg',
      overview: 'Una película espacial.',
      genres: [{ name: 'Ciencia ficción' }, { name: 'Aventura' }],
      belongs_to_collection: { name: 'Star Wars Collection' },
    });

    expect(movie).toMatchObject({
      id: 'tmdb:movie:1893',
      type: 'movie',
      title: 'Star Wars',
      year: '1977',
      rating: '8.6',
      voteCount: 1000,
      synopsis: 'Una película espacial.',
      genres: ['Ciencia ficción', 'Aventura'],
      saga: 'Star Wars Collection',
      source: 'tmdb',
    });

    expect(movie.poster).toContain('/poster.jpg');
    expect(movie.backdrop).toContain('/backdrop.jpg');
  });

  test('normaliza una serie de TMDB', () => {
    const series = normalizeTmdbSeries({
      id: 1399,
      name: 'Game of Thrones',
      first_air_date: '2011-04-17',
      vote_average: 8.4,
      overview: 'Serie de fantasía.',
      genres: [{ name: 'Drama' }],
      networks: [{ name: 'HBO' }],
    });

    expect(series).toMatchObject({
      id: 'tmdb:series:1399',
      type: 'series',
      title: 'Game of Thrones',
      year: '2011',
      rating: '8.4',
      synopsis: 'Serie de fantasía.',
      genres: ['Drama'],
      platforms: ['HBO'],
      source: 'tmdb',
    });
  });

  test('normaliza un anime de Jikan', () => {
    const anime = normalizeJikanAnime({
      mal_id: 1,
      title_english: 'Cowboy Bebop',
      year: 1998,
      score: 8.75,
      images: {
        jpg: {
          large_image_url: 'https://cdn.example.com/cowboy.jpg',
        },
      },
      synopsis: 'Anime espacial.',
      genres: [{ name: 'Action' }, { name: 'Sci-Fi' }],
      studios: [{ name: 'Sunrise' }],
    });

    expect(anime).toMatchObject({
      id: 'jikan:anime:1',
      type: 'anime',
      title: 'Cowboy Bebop',
      year: '1998',
      rating: '8.8',
      poster: 'https://cdn.example.com/cowboy.jpg',
      synopsis: 'Anime espacial.',
      genres: ['Action', 'Sci-Fi'],
      platforms: ['Sunrise'],
      source: 'jikan',
    });
  });

  test('normaliza un libro de OpenLibrary', () => {
    const book = normalizeOpenLibraryBook({
      key: '/works/OL45804W',
      title: 'The Lord of the Rings',
      first_publish_year: 1954,
      ratings_average: 4.7,
      cover_i: 12345,
      description: { value: 'Novela de fantasía.' },
      subjects: ['Fantasy', 'Adventure', 'Classic'],
    });

    expect(book).toMatchObject({
      id: 'openlibrary:book:OL45804W',
      type: 'book',
      title: 'The Lord of the Rings',
      year: '1954',
      rating: '4.7',
      synopsis: 'Novela de fantasía.',
      genres: ['Fantasy', 'Adventure', 'Classic'],
      source: 'openlibrary',
    });

    expect(book.poster).toContain('12345-L.jpg');
  });

  test('normaliza un videojuego de IGDB', () => {
    const game = normalizeIgdbGame({
      id: 1020,
      name: 'The Legend of Zelda',
      first_release_date: 1488326400,
      rating: 95,
      cover: { url: '//images.igdb.com/igdb/image/upload/t_thumb/abc.jpg' },
      screenshots: [{ url: '//images.igdb.com/igdb/image/upload/t_thumb/bg.jpg' }],
      summary: 'Juego de aventura.',
      genres: [{ name: 'Adventure' }],
      collection: { name: 'Zelda' },
      platforms: [{ name: 'Nintendo Switch' }],
      websites: [
        { url: 'https://www.nintendo.com/store/products/zelda' },
      ],
    });

    expect(game).toMatchObject({
      id: 'igdb:game:1020',
      type: 'game',
      title: 'The Legend of Zelda',
      year: '2017',
      rating: '9.5',
      synopsis: 'Juego de aventura.',
      genres: ['Adventure'],
      saga: 'Zelda',
      platforms: ['Nintendo Switch'],
      source: 'igdb',
    });

    expect(game.gameStores[0]).toMatchObject({
      label: 'Nintendo',
      accent: true,
    });
  });

  test('normaliza un lanzamiento musical de MusicBrainz', () => {
    const music = normalizeMusicBrainzRelease({
      id: 'mb-123',
      title: 'Animals',
      date: '2013-06-17',
      rating: { value: 4.5 },
      disambiguation: 'Single',
      tags: [{ name: 'edm' }, { name: 'progressive house' }],
    });

    expect(music).toMatchObject({
      id: 'musicbrainz:music:mb-123',
      type: 'music',
      title: 'Animals',
      year: '2013',
      rating: '9.0',
      synopsis: 'Single',
      genres: ['edm', 'progressive house'],
      poster: '/img/fallbacks/music-fallback.webp',
      backdrop: '/img/fallbacks/music-fallback.webp',
      source: 'musicbrainz',
    });
  });
});
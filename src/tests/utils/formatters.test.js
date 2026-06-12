import { describe, test, assert } from 'vitest';

import {
  formatRating,
  formatYear,
  formatDuration,
  truncateText,
  formatGenres,
  buildMediaId,
  mediaIdToSlug,
  parseMediaSlug,
} from '@/utils/formatters';

describe('formatters', () => {
  test('formatRating formatea rating válido', () => {
    assert.equal(formatRating(8.456), '8.5');
    assert.equal(formatRating('7.2'), '7.2');
  });

  test('formatRating retorna guion cuando no hay rating válido', () => {
    assert.equal(formatRating(0), '—');
    assert.equal(formatRating(null), '—');
    assert.equal(formatRating('abc'), '—');
  });

  test('formatYear obtiene el año correctamente', () => {
    assert.equal(formatYear('2024-05-10'), '2024');
    assert.equal(formatYear(2023), '2023');
  });

  test('formatYear retorna guion si la fecha no es válida', () => {
    assert.equal(formatYear(null), '—');
    assert.equal(formatYear('abc'), '—');
  });

  test('formatDuration formatea minutos a horas y minutos', () => {
    assert.equal(formatDuration(45), '45m');
    assert.equal(formatDuration(60), '1h');
    assert.equal(formatDuration(125), '2h 5m');
  });

  test('truncateText corta textos largos', () => {
    assert.equal(truncateText('Hola mundo', 20), 'Hola mundo');
    assert.equal(
      truncateText('Hola mundo desde NoLimits', 10),
      'Hola mundo…'
    );
  });

  test('formatGenres muestra géneros separados por punto medio', () => {
    assert.equal(
      formatGenres(['Acción', 'Aventura', 'Drama']),
      'Acción · Aventura · Drama'
    );

    assert.equal(
      formatGenres(['Acción', 'Aventura', 'Drama', 'Terror'], 2),
      'Acción · Aventura'
    );
  });

  test('formatGenres retorna guion si no hay géneros', () => {
    assert.equal(formatGenres([]), '—');
    assert.equal(formatGenres(null), '—');
  });

  test('buildMediaId genera ID compuesto', () => {
    assert.equal(
      buildMediaId('tmdb', 12345, 'movie'),
      'tmdb:movie:12345'
    );
  });

  test('mediaIdToSlug convierte ID compuesto a slug', () => {
    assert.equal(
      mediaIdToSlug('tmdb:movie:12345'),
      'tmdb-movie-12345'
    );
  });

  test('parseMediaSlug convierte slug a objeto', () => {
    assert.deepEqual(
      parseMediaSlug('tmdb-movie-12345'),
      {
        source: 'tmdb',
        type: 'movie',
        nativeId: '12345',
      }
    );
  });

  test('parseMediaSlug reconoce productos propios de NoLimits', () => {
    assert.deepEqual(
      parseMediaSlug('nolimits-10'),
      {
        source: 'nolimits',
        type: 'producto',
        nativeId: '10',
      }
    );
  });
});
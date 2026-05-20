import { describe, expect, test } from 'vitest';

import {
  formatRating,
  formatYear,
  formatDuration,
  truncateText,
  formatGenres,
  buildMediaId,
  mediaIdToSlug,
  parseMediaSlug,
} from '@/utils/formatters'

describe('formatters', () => {
  test('formatRating formatea rating válido', () => {
    expect(formatRating(8.456)).toBe('8.5');
    expect(formatRating('7.2')).toBe('7.2');
  });

  test('formatRating retorna guion cuando no hay rating válido', () => {
    expect(formatRating(0)).toBe('—');
    expect(formatRating(null)).toBe('—');
    expect(formatRating('abc')).toBe('—');
  });

  test('formatYear obtiene el año correctamente', () => {
    expect(formatYear('2024-05-10')).toBe('2024');
    expect(formatYear(2023)).toBe('2023');
  });

  test('formatYear retorna guion si la fecha no es válida', () => {
    expect(formatYear(null)).toBe('—');
    expect(formatYear('abc')).toBe('—');
  });

  test('formatDuration formatea minutos a horas y minutos', () => {
    expect(formatDuration(45)).toBe('45m');
    expect(formatDuration(60)).toBe('1h');
    expect(formatDuration(125)).toBe('2h 5m');
  });

  test('truncateText corta textos largos', () => {
    expect(truncateText('Hola mundo', 20)).toBe('Hola mundo');
    expect(truncateText('Hola mundo desde NoLimits', 10)).toBe('Hola mundo…');
  });

  test('formatGenres muestra géneros separados por punto medio', () => {
    expect(formatGenres(['Acción', 'Aventura', 'Drama'])).toBe('Acción · Aventura · Drama');
    expect(formatGenres(['Acción', 'Aventura', 'Drama', 'Terror'], 2)).toBe('Acción · Aventura');
  });

  test('formatGenres retorna guion si no hay géneros', () => {
    expect(formatGenres([])).toBe('—');
    expect(formatGenres(null)).toBe('—');
  });

  test('buildMediaId genera ID compuesto', () => {
    expect(buildMediaId('tmdb', 12345, 'movie')).toBe('tmdb:movie:12345');
  });

  test('mediaIdToSlug convierte ID compuesto a slug', () => {
    expect(mediaIdToSlug('tmdb:movie:12345')).toBe('tmdb-movie-12345');
  });

  test('parseMediaSlug convierte slug a objeto', () => {
    expect(parseMediaSlug('tmdb-movie-12345')).toEqual({
      source: 'tmdb',
      type: 'movie',
      nativeId: '12345',
    });
  });

  test('parseMediaSlug reconoce productos propios de NoLimits', () => {
    expect(parseMediaSlug('nolimits-10')).toEqual({
      source: 'nolimits',
      type: 'producto',
      nativeId: '10',
    });
  });
});
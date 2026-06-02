import { describe, expect, test, vi, beforeEach } from 'vitest';

import {
  igdbImageUrl,
  fetchTopGames,
  searchGames,
  searchGameSeries,
  fetchGameDetail,
} from '@/services/igdb';

import { apiFetch } from '@/services/api';

vi.mock('@/services/api', () => ({
  apiFetch: vi.fn(),
}));

describe('igdbImageUrl', () => {
  test('retorna null si no recibe url', () => {
    expect(igdbImageUrl()).toBeNull();
    expect(igdbImageUrl(null)).toBeNull();
  });

  test('convierte imagen t_thumb a t_cover_big por defecto', () => {
    const url =
      '//images.igdb.com/igdb/image/upload/t_thumb/co1wyy.jpg';

    expect(igdbImageUrl(url)).toBe(
      'https://images.igdb.com/igdb/image/upload/t_cover_big/co1wyy.jpg'
    );
  });

  test('convierte imagen al tamaño indicado', () => {
    const url =
      '//images.igdb.com/igdb/image/upload/t_thumb/co1wyy.jpg';

    expect(igdbImageUrl(url, 't_1080p')).toBe(
      'https://images.igdb.com/igdb/image/upload/t_1080p/co1wyy.jpg'
    );
  });
});

describe('IGDB services', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('fetchTopGames llama a apiFetch con endpoint /games', async () => {
    const gamesMock = [
      {
        id: 1,
        name: 'The Witcher 3',
      },
    ];

    apiFetch.mockResolvedValue(gamesMock);

    const result = await fetchTopGames();

    expect(result).toEqual(gamesMock);

    expect(apiFetch).toHaveBeenCalledWith(
      '/api/igdb/games',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
      })
    );

    expect(apiFetch.mock.calls[0][1].body).toContain('fields name');
    expect(apiFetch.mock.calls[0][1].body).toContain('limit 18');
  });

  test('searchGames busca juegos y limpia comillas dobles', async () => {
    const gamesMock = [
      {
        id: 2,
        name: 'Zelda',
      },
    ];

    apiFetch.mockResolvedValue(gamesMock);

    const result = await searchGames('The "Legend" of Zelda');

    expect(result).toEqual(gamesMock);

    expect(apiFetch).toHaveBeenCalledWith(
      '/api/igdb/games',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
      })
    );

    expect(apiFetch.mock.calls[0][1].body).toContain(
      'search "The Legend of Zelda"'
    );

    expect(apiFetch.mock.calls[0][1].body).toContain('limit 20');
  });

  test('searchGameSeries busca colecciones y limpia comillas dobles', async () => {
    const seriesMock = [
      {
        id: 3,
        name: 'Final Fantasy',
      },
    ];

    apiFetch.mockResolvedValue(seriesMock);

    const result = await searchGameSeries('Final "Fantasy"');

    expect(result).toEqual(seriesMock);

    expect(apiFetch).toHaveBeenCalledWith(
      '/api/igdb/collections',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
      })
    );

    expect(apiFetch.mock.calls[0][1].body).toContain(
      'search "Final Fantasy"'
    );

    expect(apiFetch.mock.calls[0][1].body).toContain('limit 5');
  });

  test('fetchGameDetail retorna el primer resultado', async () => {
    const detailMock = [
      {
        id: 3498,
        name: 'Grand Theft Auto V',
      },
    ];

    apiFetch.mockResolvedValue(detailMock);

    const result = await fetchGameDetail(3498);

    expect(result).toEqual(detailMock[0]);

    expect(apiFetch).toHaveBeenCalledWith(
      '/api/igdb/games',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
      })
    );

    expect(apiFetch.mock.calls[0][1].body).toContain('where id = 3498');
    expect(apiFetch.mock.calls[0][1].body).toContain('limit 1');
  });

  test('fetchGameDetail retorna null si no encuentra resultados', async () => {
    apiFetch.mockResolvedValue([]);

    const result = await fetchGameDetail(9999);

    expect(result).toBeNull();
  });

  test('fetchGameDetail retorna null si apiFetch retorna undefined', async () => {
    apiFetch.mockResolvedValue(undefined);

    const result = await fetchGameDetail(9999);

    expect(result).toBeNull();
  });
});
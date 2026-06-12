import { describe, test, vi, beforeEach, afterEach, assert } from 'vitest';

import { apiFetch } from '@/services/api';

describe('apiFetch', () => {
  beforeEach(() => {
    vi.restoreAllMocks();

    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('retorna JSON cuando la respuesta es exitosa', async () => {
    const dataMock = {
      data: [
        {
          id: 1,
          title: 'Star Wars',
        },
      ],
    };

    global.fetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(dataMock),
    });

    const result = await apiFetch('https://api.test.com/movies');

    assert.deepEqual(result, dataMock);

    assert.deepEqual(global.fetch.mock.calls[0], [
      'https://api.test.com/movies',
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    ]);
  });

  test('mezcla headers personalizados con Content-Type', async () => {
    const dataMock = {
      ok: true,
    };

    global.fetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(dataMock),
    });

    const result = await apiFetch('https://api.test.com/protected', {
      headers: {
        Authorization: 'Bearer token-falso',
      },
    });

    assert.deepEqual(result, dataMock);

    assert.deepEqual(global.fetch.mock.calls[0], [
      'https://api.test.com/protected',
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer token-falso',
        },
      },
    ]);
  });

  test('mantiene opciones adicionales como method y body', async () => {
    const dataMock = {
      created: true,
    };

    global.fetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(dataMock),
    });

    const body = JSON.stringify({
      title: 'Nueva obra',
    });

    const result = await apiFetch('https://api.test.com/obras', {
      method: 'POST',
      body,
    });

    assert.deepEqual(result, dataMock);

    assert.deepEqual(global.fetch.mock.calls[0], [
      'https://api.test.com/obras',
      {
        method: 'POST',
        body,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    ]);
  });

  test('retorna data vacía cuando la respuesta no es ok', async () => {
    const warnMock = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => {});

    global.fetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: vi.fn(),
    });

    const result = await apiFetch('https://api.test.com/error');

    assert.deepEqual(result, {
      data: [],
    });

    assert.deepEqual(warnMock.mock.calls[0], [
      '⚠️ API error 500: https://api.test.com/error',
    ]);

    warnMock.mockRestore();
  });

  test('retorna data vacía cuando fetch lanza error', async () => {
    const warnMock = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => {});

    const error = new Error('Network error');

    global.fetch.mockRejectedValue(error);

    const result = await apiFetch('https://api.test.com/falla');

    assert.deepEqual(result, {
      data: [],
    });

    assert.deepEqual(warnMock.mock.calls[0], [
      '⚠️ Error en apiFetch:',
      error,
    ]);

    warnMock.mockRestore();
  });
});
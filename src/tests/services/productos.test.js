import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  listarProductosPaginado,
  adaptarProductoNoLimits,
  buscarProductosNoLimits,
  crearProducto,
} from '@/services/productos';

describe('productos service - tests de regresión', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();

    global.fetch = vi.fn();
  });

  test('listarProductosPaginado devuelve contenido normalizado desde paginación', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      text: async () =>
        JSON.stringify({
          content: [{ id: 1, nombre: 'Elden Ring' }],
          page: 1,
          totalPages: 2,
          totalElements: 25,
        }),
    });

    const result = await listarProductosPaginado(1, 3);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/productos/paginacion?page=1&size=3'),
      expect.any(Object)
    );

    expect(result).toEqual({
      content: [{ id: 1, nombre: 'Elden Ring' }],
      page: 1,
      totalPages: 2,
      totalElements: 25,
    });
  });

  test('listarProductosPaginado usa página 1 si recibe una página inválida', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      text: async () =>
        JSON.stringify({
          contenido: [],
          totalPaginas: 1,
          totalElementos: 0,
        }),
    });

    await listarProductosPaginado(0, 3);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('page=1&size=3'),
      expect.any(Object)
    );
  });

  test('adaptarProductoNoLimits mantiene links de compra del scraping', () => {
    const producto = {
      id: 10,
      nombre: 'The Last of Us Part II',
      tipoProductoNombre: 'Videojuego',
      precio: 39990,
      sinopsis: 'Juego de acción y aventura',
      saga: 'The Last of Us',
      imagenPortada: 'https://imagen.cl/tlou.jpg',
      linksCompra: [
        {
          urlCompra: 'https://www.mercadolibre.cl/tlou',
          plataformaNombre: 'Mercado Libre',
        },
      ],
    };

    const result = adaptarProductoNoLimits(producto);

    expect(result).toMatchObject({
      id: 'nolimits-10',
      realId: 10,
      source: 'nolimits',
      type: 'game',
      title: 'The Last of Us Part II',
      price: 39990,
      saga: 'The Last of Us',
      image: 'https://imagen.cl/tlou.jpg',
    });

    expect(result.linksCompra).toHaveLength(1);
    expect(result.linksCompra[0].plataformaNombre).toBe('Mercado Libre');
  });

  test('buscarProductosNoLimits filtra por nombre, saga o tipo y adapta resultados', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      text: async () =>
        JSON.stringify({
          contenido: [
            {
              id: 1,
              nombre: 'God of War Ragnarok',
              tipoProductoNombre: 'Videojuego',
              saga: 'God of War',
              precio: 49990,
            },
            {
              id: 2,
              nombre: 'Interestelar',
              tipoProductoNombre: 'Película',
              saga: 'Nolan',
              precio: 9990,
            },
          ],
          totalPaginas: 1,
        }),
    });

    const result = await buscarProductosNoLimits('god');

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'nolimits-1',
      title: 'God of War Ragnarok',
      type: 'game',
      source: 'nolimits',
    });
  });

  test('crearProducto envía Authorization Bearer cuando existe token', async () => {
    localStorage.setItem('nl_token', 'token-prueba');

    global.fetch.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify({ id: 99, nombre: 'Producto creado' }),
    });

    const data = { nombre: 'Producto creado' };

    const result = await crearProducto(data);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/productos'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          Authorization: 'Bearer token-prueba',
        }),
        body: JSON.stringify(data),
      })
    );

    expect(result).toEqual({ id: 99, nombre: 'Producto creado' });
  });
});
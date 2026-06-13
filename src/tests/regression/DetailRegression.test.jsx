import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, test, vi, beforeEach, assert } from 'vitest';
import Detail from '@/pages/Detail';
import { parseMediaSlug } from '@/utils/formatters';
import { useMovieDetail } from '@/hooks/useTMDB';
import {
  guardarReview,
  obtenerReviewsPorObra,
} from '@/services/reviewService';

vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    img: (props) => <img {...props} />,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
    span: ({ children, ...props }) => <span {...props}>{children}</span>,
  },
}));

vi.mock('@/components/ui/Badge', () => ({
  default: ({ type }) => <span>{type}</span>,
}));

vi.mock('@/components/ui/WhereToFind', () => ({
  default: () => <div data-testid="where-to-find">WhereToFind</div>,
}));

vi.mock('@/components/sections/ContentSection', () => ({
  default: () => <div data-testid="content-section">ContentSection</div>,
}));

vi.mock('@/utils/translateText', () => ({
  translateToSpanish: vi.fn(async (text) => text),
}));

vi.mock('@/utils/formatters', async () => {
  const actual = await vi.importActual('@/utils/formatters');
  return {
    ...actual,
    parseMediaSlug: vi.fn(() => ({
      source: 'tmdb',
      type: 'movie',
      nativeId: '123',
    })),
  };
});

vi.mock('@/hooks/useTMDB', () => ({
  useMovieDetail: vi.fn(() => ({
    data: {
      id: 'tmdb:movie:123',
      title: 'Interestelar',
      type: 'movie',
      poster: 'poster.jpg',
      backdrop: 'backdrop.jpg',
      rating: 9,
      year: 2014,
      genres: ['Ciencia ficción'],
      platforms: [],
      synopsis: 'Una película sobre viajes espaciales.',
      saga: null,
    },
    isLoading: false,
    error: null,
  })),
  useSeriesDetail: vi.fn(() => ({ data: null, isLoading: false, error: null })),
}));

vi.mock('@/hooks/useJikan', () => ({
  useAnimeDetail: vi.fn(() => ({ data: null, isLoading: false, error: null })),
}));

vi.mock('@/hooks/useRAWG', () => ({
  useGameDetail: vi.fn(() => ({ data: null, isLoading: false, error: null })),
}));

vi.mock('@/hooks/useOpenLibrary', () => ({
  useBookDetail: vi.fn(() => ({ data: null, isLoading: false, error: null })),
}));

vi.mock('@/hooks/useMusicBrainz', () => ({
  useMusicDetail: vi.fn(() => ({ data: null, isLoading: false, error: null })),
}));

vi.mock('@/services/whereToWatch', () => ({
  fetchMovieProviders: vi.fn(async () => null),
  fetchSeriesProviders: vi.fn(async () => null),
}));

vi.mock('@/hooks/useSearch', () => ({
  useSagaSearch: vi.fn(() => ({
    grouped: { movies: [], series: [], anime: [] },
    isLoading: false,
  })),
}));

vi.mock('@/services/productos', () => ({
  obtenerProducto: vi.fn(),
}));

vi.mock('@/services/reviewService', () => ({
  guardarReview: vi.fn(async () => ({})),
  obtenerReviewsPorObra: vi.fn(async () => []),
  eliminarReview: vi.fn(async () => ({})),
  reaccionarReview: vi.fn(async () => ({})),
}));

vi.mock('@/services/usuarios', () => ({
  agregarFavoritoUsuario: vi.fn(async () => ({})),
  eliminarFavoritoUsuario: vi.fn(async () => ({})),
}));

vi.mock('@/store/useAppStore', () => ({
  default: (selector) =>
    selector({
      isInList: () => false,
      toggleList: vi.fn(),
    }),
}));

function renderDetail() {
  return render(
    <MemoryRouter initialEntries={['/detail/tmdb-movie-123']}>
      <Routes>
        <Route path="/detail/:mediaId" element={<Detail />} />
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Regresión - BUG-001 flujo de reseñas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    window.alert = vi.fn();

    parseMediaSlug.mockReturnValue({
      source: 'tmdb',
      type: 'movie',
      nativeId: '123',
    });

    useMovieDetail.mockReturnValue({
      data: {
        id: 'tmdb:movie:123',
        title: 'Interestelar',
        type: 'movie',
        poster: 'poster.jpg',
        backdrop: 'backdrop.jpg',
        rating: 9,
        year: 2014,
        genres: ['Ciencia ficción'],
        platforms: [],
        synopsis: 'Una película sobre viajes espaciales.',
        saga: null,
      },
      isLoading: false,
      error: null,
    });

    obtenerReviewsPorObra.mockResolvedValue([]);
  });

  /**
   * BUG-001
   *
   * Durante el desarrollo de NoLimits se detectaron problemas
   * en el flujo de creación de reseñas dentro de Detail.
   *
   * Esta prueba asegura que una reseña continúe guardándose
   * correctamente después de futuras modificaciones.
   */
  test('guarda reseña con sesión válida', async () => {
    localStorage.setItem('nl_token', 'token');
    localStorage.setItem('nl_auth', '1');
    localStorage.setItem(
      'nl_user',
      JSON.stringify({
        id: 1,
        email: 'user@test.com',
      })
    );

    obtenerReviewsPorObra
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          id: 1,
          contenido: 'Nueva reseña',
          nombreUsuario: 'Usuario',
          usuarioId: 1,
          fechaCreacion: '2024-01-01',
        },
      ]);

    renderDetail();

    const textarea = await screen.findByPlaceholderText(
      'Escribe tu opinión sobre esta obra…'
    );

    fireEvent.change(textarea, {
      target: { value: 'Nueva reseña' },
    });

    fireEvent.click(screen.getByText('Guardar reseña'));

    await waitFor(() => {
      assert.equal(guardarReview.mock.calls.length, 1);
    });

    assert.equal(guardarReview.mock.calls[0][0], 1);

    assert.include(guardarReview.mock.calls[0][1], {
      obraId: 'tmdb:movie:123',
      contenido: 'Nueva reseña',
      rating: 10,
    });
  });

 /**
   * BUG-002
   *
   * Durante el desarrollo se validó que un usuario sin sesión
   * no pueda guardar reseñas.
   *
   * Esta prueba evita que futuras modificaciones permitan
   * guardar reseñas sin autenticación.
   */
  test('redirige a login al intentar guardar reseña sin sesión', async () => {
    renderDetail();

    const textarea = await screen.findByPlaceholderText(
      'Escribe tu opinión sobre esta obra…'
    );

    fireEvent.change(textarea, {
      target: { value: 'Reseña sin sesión' },
    });

    fireEvent.click(screen.getByText('Guardar reseña'));

    assert.deepEqual(window.alert.mock.calls[0], [
      'Debes iniciar sesión para guardar reseñas',
    ]);

    await waitFor(() => {
      assert.isNotNull(screen.getByText('Login Page'));
    });
  });
});
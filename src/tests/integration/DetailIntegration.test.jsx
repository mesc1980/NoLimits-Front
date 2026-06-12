import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, test, beforeEach, vi, assert } from 'vitest';
import Detail from '@/pages/Detail';

const toggleListMock = vi.fn();

vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    img: (props) => <img {...props} />,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
    span: ({ children, ...props }) => <span {...props}>{children}</span>,
  },
}));

vi.mock('lucide-react', () => ({
  ArrowLeft: () => <span>ArrowLeft</span>,
  BookmarkPlus: () => <span>BookmarkPlus</span>,
  BookmarkCheck: () => <span>BookmarkCheck</span>,
  Star: () => <span>Star</span>,
  Calendar: () => <span>Calendar</span>,
  Layers: () => <span>Layers</span>,
  ExternalLink: () => <span>ExternalLink</span>,
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
      source: 'tmdb',
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
  useSeriesDetail: vi.fn(() => ({
    data: null,
    isLoading: false,
    error: null,
  })),
}));

vi.mock('@/hooks/useJikan', () => ({
  useAnimeDetail: vi.fn(() => ({
    data: null,
    isLoading: false,
    error: null,
  })),
}));

vi.mock('@/hooks/useRAWG', () => ({
  useGameDetail: vi.fn(() => ({
    data: null,
    isLoading: false,
    error: null,
  })),
}));

vi.mock('@/hooks/useOpenLibrary', () => ({
  useBookDetail: vi.fn(() => ({
    data: null,
    isLoading: false,
    error: null,
  })),
}));

vi.mock('@/hooks/useMusicBrainz', () => ({
  useMusicDetail: vi.fn(() => ({
    data: null,
    isLoading: false,
    error: null,
  })),
}));

vi.mock('@/services/whereToWatch', () => ({
  fetchMovieProviders: vi.fn(async () => null),
  fetchSeriesProviders: vi.fn(async () => null),
}));

vi.mock('@/hooks/useSearch', () => ({
  useSagaSearch: vi.fn(() => ({
    grouped: {
      movies: [],
      series: [],
      anime: [],
    },
    isLoading: false,
  })),
}));

vi.mock('@/services/productos', () => ({
  obtenerProducto: vi.fn(),
}));

vi.mock('@/services/reviewService', () => ({
  guardarReview: vi.fn(async () => ({})),
  obtenerReviewsPorObra: vi.fn(),
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
      toggleList: toggleListMock,
    }),
}));

import {
  guardarReview,
  obtenerReviewsPorObra,
  reaccionarReview,
} from '@/services/reviewService';

function renderDetailIntegration() {
  return render(
    <MemoryRouter initialEntries={['/detail/tmdb-movie-123']}>
      <Routes>
        <Route path="/detail/:mediaId" element={<Detail />} />
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Detail - tests de integración', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    window.alert = vi.fn();

    obtenerReviewsPorObra.mockResolvedValue([]);
  });

  test('integra página, router y servicio para cargar una obra con reseñas', async () => {
    obtenerReviewsPorObra.mockResolvedValue([
      {
        id: 1,
        contenido: 'Excelente película',
        nombreUsuario: 'Usuario NoLimits',
        usuarioId: 2,
        fechaCreacion: '2024-01-01',
        likes: 3,
        dislikes: 0,
      },
    ]);

    renderDetailIntegration();

    assert.isNotNull(await screen.findByText('Interestelar'));
    assert.isNotNull(await screen.findByText('Excelente película'));
    assert.isNotNull(screen.getByText('Ciencia ficción'));
    assert.isNotNull(screen.getByTestId('where-to-find'));

    assert.deepEqual(obtenerReviewsPorObra.mock.calls[0], [
      'tmdb:movie:123',
    ]);
  });

  test('integra sesión, formulario y servicio para guardar una reseña', async () => {
    localStorage.setItem('nl_token', 'token-test');
    localStorage.setItem('nl_auth', '1');
    localStorage.setItem(
      'nl_user',
      JSON.stringify({
        id: 1,
        email: 'usuario@test.com',
      })
    );

    obtenerReviewsPorObra
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          id: 10,
          contenido: 'Nueva reseña integrada',
          nombreUsuario: 'Usuario Test',
          usuarioId: 1,
          fechaCreacion: '2024-01-01',
          likes: 0,
          dislikes: 0,
        },
      ]);

    renderDetailIntegration();

    const textarea = await screen.findByPlaceholderText(
      'Escribe tu opinión sobre esta obra…'
    );

    fireEvent.change(textarea, {
      target: {
        value: 'Nueva reseña integrada',
      },
    });

    fireEvent.click(screen.getByText('Guardar reseña'));

    await waitFor(() => {
      assert.equal(guardarReview.mock.calls.length, 1);
    });

    assert.deepEqual(guardarReview.mock.calls[0], [
      1,
      {
        obraId: 'tmdb:movie:123',
        contenido: 'Nueva reseña integrada',
        rating: 10,
      },
    ]);

    assert.isNotNull(await screen.findByText('Nueva reseña integrada'));
  });

  test('integra sesión, store y UI para guardar una obra en favoritos', async () => {
    localStorage.setItem('nl_token', 'token-test');
    localStorage.setItem('nl_auth', '1');
    localStorage.setItem('nl_userId', '1');
    localStorage.setItem(
      'nl_user',
      JSON.stringify({
        id: 1,
        email: 'usuario@test.com',
      })
    );

    renderDetailIntegration();

    const button = await screen.findByRole('button', {
      name: /guardar en mi lista/i,
    });

    fireEvent.click(button);

    await waitFor(() => {
      assert.equal(toggleListMock.mock.calls.length, 1);
    });

    assert.include(toggleListMock.mock.calls[0][0], {
      id: 'tmdb:movie:123',
      title: 'Interestelar',
      type: 'movie',
    });
  });

  test('integra validación de sesión y navegación cuando intenta reseñar sin login', async () => {
    renderDetailIntegration();

    const textarea = await screen.findByPlaceholderText(
      'Escribe tu opinión sobre esta obra…'
    );

    fireEvent.change(textarea, {
      target: {
        value: 'Reseña sin sesión',
      },
    });

    fireEvent.click(screen.getByText('Guardar reseña'));

    assert.deepEqual(window.alert.mock.calls[0], [
      'Debes iniciar sesión para guardar reseñas',
    ]);

    await waitFor(() => {
      assert.isNotNull(screen.getByText('Login Page'));
    });
  });

  test('integra reacción de usuario autenticado sobre una reseña existente', async () => {
    localStorage.setItem('nl_token', 'token-test');
    localStorage.setItem('nl_auth', '1');
    localStorage.setItem(
      'nl_user',
      JSON.stringify({
        id: 1,
        email: 'usuario@test.com',
      })
    );

    obtenerReviewsPorObra.mockResolvedValue([
      {
        id: 50,
        contenido: 'Reseña para reaccionar',
        nombreUsuario: 'Usuario Autor',
        usuarioId: 2,
        fechaCreacion: '2024-01-01',
        likes: 4,
        dislikes: 1,
      },
    ]);

    renderDetailIntegration();

    assert.isNotNull(await screen.findByText('Reseña para reaccionar'));

    fireEvent.click(screen.getByText(/👍 4/));

    await waitFor(() => {
      assert.deepEqual(reaccionarReview.mock.calls[0], [50, 1, 'LIKE']);
    });
  });
});
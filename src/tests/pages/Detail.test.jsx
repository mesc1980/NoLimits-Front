import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import Detail from '@/pages/Detail';

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

describe('Detail - tests de regresión', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    window.alert = vi.fn();
  });

  test('renderiza la información principal de la obra', async () => {
    renderDetail();

    expect(await screen.findByText('Interestelar')).toBeInTheDocument();
    expect(screen.getByText('Ciencia ficción')).toBeInTheDocument();
    expect(screen.getByText('2014')).toBeInTheDocument();
    expect(screen.getByText(/Una película sobre viajes espaciales/i)).toBeInTheDocument();
    expect(screen.getByTestId('where-to-find')).toBeInTheDocument();
  });

  test('muestra mensaje cuando no existen reseñas', async () => {
    renderDetail();

    expect(
      await screen.findByText(/Todavía no hay reseñas para esta obra/i)
    ).toBeInTheDocument();
  });

  test('redirige a login al intentar guardar favorito sin sesión', async () => {
    renderDetail();

    const button = await screen.findByRole('button', {
      name: /guardar en mi lista/i,
    });

    fireEvent.click(button);

    expect(window.alert).toHaveBeenCalledWith(
      'Debes iniciar sesión para guardar en favoritos'
    );

    await waitFor(() => {
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });
  });
});
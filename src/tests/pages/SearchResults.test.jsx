import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, test, vi } from 'vitest';
import SearchResults from '@/pages/SearchResults';
import { MEDIA_TYPES } from '@/utils/constants';

vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    span: ({ children, ...props }) => <span {...props}>{children}</span>,
    h1: ({ children, ...props }) => <h1 {...props}>{children}</h1>,
    section: ({ children, ...props }) => <section {...props}>{children}</section>,
  },
}));

vi.mock('@/components/ui/SearchBar', () => ({
  default: () => <div data-testid="search-bar">SearchBar</div>,
}));

vi.mock('@/components/ui/SkeletonCard', () => ({
  default: () => <div data-testid="skeleton-card">SkeletonCard</div>,
}));

vi.mock('@/components/cards/MediaCard', () => ({
  default: ({ obra }) => <article>{obra.title}</article>,
}));

vi.mock('@/components/cards/AnimeCard', () => ({
  default: ({ obra }) => <article>{obra.title}</article>,
}));

vi.mock('@/components/cards/BookCard', () => ({
  default: ({ obra }) => <article>{obra.title}</article>,
}));

vi.mock('@/components/cards/GameCard', () => ({
  default: ({ obra }) => <article>{obra.title}</article>,
}));

vi.mock('@/hooks/useSearch', () => ({
  useSearch: vi.fn(),
}));

vi.mock('@/hooks/useTMDB', () => ({
  useTrendingMovies: vi.fn(() => ({ data: [], isLoading: false })),
  useTrendingSeries: vi.fn(() => ({ data: [], isLoading: false })),
}));

vi.mock('@/hooks/useJikan', () => ({
  useTopAnime: vi.fn(() => ({ data: [], isLoading: false })),
}));

vi.mock('@/hooks/useOpenLibrary', () => ({
  useBooksBySubject: vi.fn(() => ({ data: [], isLoading: false })),
}));

vi.mock('@/hooks/useRAWG', () => ({
  useTopGames: vi.fn(() => ({ data: [], isLoading: false })),
}));

vi.mock('@/hooks/useMusicBrainz', () => ({
  useMusicSearch: vi.fn(() => ({ data: [], isLoading: false })),
}));

import { useSearch } from '@/hooks/useSearch';

describe('SearchResults - tests de regresión', () => {
  test('agrupa y muestra resultados por tipo de contenido', () => {
    useSearch.mockReturnValue({
      data: [
        { id: 'movie-1', title: 'Interestelar', type: MEDIA_TYPES.MOVIE },
        { id: 'series-1', title: 'Breaking Bad', type: MEDIA_TYPES.SERIES },
        { id: 'anime-1', title: 'Naruto', type: MEDIA_TYPES.ANIME },
        { id: 'game-1', title: 'Cyberpunk 2077', type: MEDIA_TYPES.GAME },
        { id: 'book-1', title: 'Dune', type: MEDIA_TYPES.BOOK },
        { id: 'music-1', title: 'Random Access Memories', type: MEDIA_TYPES.MUSIC },
      ],
      isLoading: false,
      isFetching: false,
    });

    render(
      <MemoryRouter initialEntries={['/search?q=test&type=all']}>
        <SearchResults />
      </MemoryRouter>
    );

    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.getByText(/test/i)).toBeInTheDocument();

    expect(screen.getByText('Películas')).toBeInTheDocument();
    expect(screen.getByText('Series')).toBeInTheDocument();
    expect(screen.getByText('Anime')).toBeInTheDocument();
    expect(screen.getByText('Videojuegos')).toBeInTheDocument();
    expect(screen.getByText('Libros')).toBeInTheDocument();
    expect(screen.getByText('Música')).toBeInTheDocument();

    expect(screen.getByText('Interestelar')).toBeInTheDocument();
    expect(screen.getByText('Breaking Bad')).toBeInTheDocument();
    expect(screen.getByText('Naruto')).toBeInTheDocument();
    expect(screen.getByText('Cyberpunk 2077')).toBeInTheDocument();
    expect(screen.getByText('Dune')).toBeInTheDocument();
    expect(screen.getByText('Random Access Memories')).toBeInTheDocument();
  });

  test('muestra estado vacío cuando no hay resultados para una búsqueda', () => {
    useSearch.mockReturnValue({
      data: [],
      isLoading: false,
      isFetching: false,
    });

    render(
      <MemoryRouter initialEntries={['/search?q=noexiste&type=all']}>
        <SearchResults />
      </MemoryRouter>
    );

    expect(screen.getByText('Sin resultados')).toBeInTheDocument();
    expect(screen.getByText(/No se encontraron resultados para/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /explorar saga/i })).toBeInTheDocument();
  });

  test('muestra skeleton mientras carga la búsqueda', () => {
    useSearch.mockReturnValue({
      data: [],
      isLoading: true,
      isFetching: false,
    });

    render(
      <MemoryRouter initialEntries={['/search?q=matrix&type=all']}>
        <SearchResults />
      </MemoryRouter>
    );

    expect(screen.getByTestId('skeleton-card')).toBeInTheDocument();
    expect(screen.getByText(/Buscando/i)).toBeInTheDocument();
  });
});
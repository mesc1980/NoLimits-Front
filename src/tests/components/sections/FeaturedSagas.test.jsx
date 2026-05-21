import { describe, expect, test, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import FeaturedSagas from '@/components/sections/FeaturedSagas';

vi.mock('@/services/tmdb', () => ({
  searchMovies: vi.fn(() =>
    Promise.resolve({
      results: [
        {
          id: 1,
          title: 'Mock Movie',
          release_date: '2024-01-01',
          vote_average: 8,
          backdrop_path: '/mock-backdrop.jpg',
        },
      ],
    })
  ),
}));

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function renderFeaturedSagas() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <FeaturedSagas />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('FeaturedSagas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renderiza el título de la sección', () => {
    renderFeaturedSagas();

    expect(
      screen.getByText('Sagas destacadas · Explora el universo completo')
    ).toBeInTheDocument();
  });

  test('renderiza sagas destacadas principales', () => {
    renderFeaturedSagas();

    expect(screen.getByText('Spider-Man')).toBeInTheDocument();
    expect(screen.getByText('Star Wars')).toBeInTheDocument();
    expect(screen.getByText('Batman')).toBeInTheDocument();
    expect(screen.getByText('Dragon Ball')).toBeInTheDocument();
  });

  test('renderiza nombre personalizado de El Señor de los Anillos', () => {
    renderFeaturedSagas();

    expect(screen.getByText('El Señor de los Anillos')).toBeInTheDocument();
  });

  test('navega al hacer click en una saga', () => {
    renderFeaturedSagas();

    fireEvent.click(
      screen.getByRole('button', { name: 'Explorar saga Star Wars' })
    );

    expect(mockNavigate).toHaveBeenCalledWith('/saga/Star%20Wars');
  });

  test('navega al presionar Enter en una saga', () => {
    renderFeaturedSagas();

    fireEvent.keyDown(
      screen.getByRole('button', { name: 'Explorar saga Batman' }),
      { key: 'Enter' }
    );

    expect(mockNavigate).toHaveBeenCalledWith('/saga/Batman');
  });
});
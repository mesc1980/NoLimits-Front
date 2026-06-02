import { describe, expect, test, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import AnimeCard from '@/components/cards/AnimeCard';

const mockNavigate = vi.fn();
const mockToggleList = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/store/useAppStore', () => ({
  default: (selector) =>
    selector({
      isInList: () => false,
      toggleList: mockToggleList,
    }),
}));

const obraMock = {
  id: 'jikan:anime:5114',
  type: 'anime',
  title: 'Fullmetal Alchemist',
  year: '2009',
  rating: '9.1',
  poster: '/poster-fma.jpg',
};

function renderAnimeCard(props = {}) {
  return render(
    <MemoryRouter>
      <AnimeCard obra={obraMock} {...props} />
    </MemoryRouter>
  );
}

describe('AnimeCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  test('renderiza título, año, poster y rating', () => {
    renderAnimeCard();

    expect(screen.getByText('Fullmetal Alchemist')).toBeInTheDocument();
    expect(screen.getByText(/2009/)).toBeInTheDocument();

    expect(screen.getByAltText('Poster de Fullmetal Alchemist')).toHaveAttribute(
      'src',
      '/poster-fma.jpg'
    );

    expect(screen.getByText(/9.1/)).toBeInTheDocument();
  });

  test('ejecuta onClick personalizado al presionar la card', () => {
    const onClick = vi.fn();

    renderAnimeCard({ onClick });

    fireEvent.click(
      screen.getByRole('button', { name: 'Ver Fullmetal Alchemist' })
    );

    expect(onClick).toHaveBeenCalledWith(obraMock);
  });

  test('navega al detalle si no recibe onClick', () => {
    renderAnimeCard();

    fireEvent.click(
      screen.getByRole('button', { name: 'Ver Fullmetal Alchemist' })
    );

    expect(mockNavigate).toHaveBeenCalledWith('/detail/jikan-anime-5114');
  });

  test('también navega al detalle al presionar Enter', () => {
    renderAnimeCard();

    fireEvent.keyDown(
      screen.getByRole('button', { name: 'Ver Fullmetal Alchemist' }),
      { key: 'Enter' }
    );

    expect(mockNavigate).toHaveBeenCalledWith('/detail/jikan-anime-5114');
  });

  test('oculta el botón de favoritos cuando hideFavoriteButton es true', () => {
    renderAnimeCard({
      hideFavoriteButton: true,
    });

    expect(
      screen.queryByLabelText('Agregar a favoritos')
    ).not.toBeInTheDocument();
  });

  test('redirige a login si intenta guardar favorito sin sesión', () => {
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

    renderAnimeCard();

    fireEvent.click(
      screen.getByLabelText('Agregar a favoritos')
    );

    expect(alertMock).toHaveBeenCalledWith(
      'Debes iniciar sesión para guardar en favoritos'
    );

    expect(mockNavigate).toHaveBeenCalledWith('/login');

    alertMock.mockRestore();
  });

  test('guarda en favoritos si existe sesión válida', () => {
    localStorage.setItem('nl_token', 'token-falso');
    localStorage.setItem(
      'nl_user',
      JSON.stringify({
        id: 1,
        email: 'usuario@test.com',
      })
    );
    localStorage.setItem('nl_auth', '1');

    renderAnimeCard();

    fireEvent.click(
      screen.getByLabelText('Agregar a favoritos')
    );

    expect(mockToggleList).toHaveBeenCalledWith(obraMock);
  });
});
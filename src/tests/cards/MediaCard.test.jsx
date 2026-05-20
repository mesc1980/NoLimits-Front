import { describe, expect, test, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import MediaCard from '@/components/cards/MediaCard';

vi.mock('@/services/usuarios', () => ({
  agregarFavoritoUsuario: vi.fn(),
  eliminarFavoritoUsuario: vi.fn(),
}));

const mockNavigate = vi.fn();

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
      toggleList: vi.fn(),
    }),
}));

const obraMock = {
  id: 'tmdb:movie:1893',
  type: 'movie',
  title: 'Star Wars',
  year: '1977',
  rating: '8.6',
  poster: '/poster-star-wars.jpg',
};

function renderMediaCard(props = {}) {
  return render(
    <MemoryRouter>
      <MediaCard obra={obraMock} {...props} />
    </MemoryRouter>
  );
}

describe('MediaCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  test('renderiza título, año, poster y rating', () => {
    renderMediaCard();

    expect(screen.getByText('Star Wars')).toBeInTheDocument();
    expect(screen.getByText(/1977/)).toBeInTheDocument();
    expect(screen.getByAltText('Poster de Star Wars')).toHaveAttribute(
      'src',
      '/poster-star-wars.jpg'
    );
    expect(screen.getByText(/8.6/)).toBeInTheDocument();
  });

  test('ejecuta onClick personalizado al presionar la card', () => {
    const onClick = vi.fn();

    renderMediaCard({ onClick });

    fireEvent.click(
      screen.getByRole('button', { name: 'Ver Star Wars' })
    );

    expect(onClick).toHaveBeenCalledWith(obraMock);
  });

  test('navega al detalle si no recibe onClick', () => {
    renderMediaCard();

    fireEvent.click(
      screen.getByRole('button', { name: 'Ver Star Wars' })
    );

    expect(mockNavigate).toHaveBeenCalledWith('/detail/tmdb-movie-1893');
  });

  test('oculta el botón de favoritos cuando hideFavoriteButton es true', () => {
    renderMediaCard({
      hideFavoriteButton: true,
    });

    expect(
      screen.queryByLabelText('Agregar a favoritos')
    ).not.toBeInTheDocument();
  });

  test('redirige a login si intenta guardar favorito sin sesión', () => {
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

    renderMediaCard();

    fireEvent.click(
      screen.getByLabelText('Agregar a favoritos')
    );

    expect(alertMock).toHaveBeenCalledWith(
      'Debes iniciar sesión para guardar en favoritos'
    );

    expect(mockNavigate).toHaveBeenCalledWith('/login');

    alertMock.mockRestore();
  });
});
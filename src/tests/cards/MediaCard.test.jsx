import { describe, expect, test, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import MediaCard from '@/components/cards/MediaCard';

vi.mock('@/services/usuarios', () => ({
  agregarFavoritoUsuario: vi.fn(),
  eliminarFavoritoUsuario: vi.fn(),
}));

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

  test('también navega al detalle al presionar Enter', () => {
    renderMediaCard();

    fireEvent.keyDown(
      screen.getByRole('button', { name: 'Ver Star Wars' }),
      { key: 'Enter' }
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

    renderMediaCard();

    fireEvent.click(
      screen.getByLabelText('Agregar a favoritos')
    );

    expect(mockToggleList).toHaveBeenCalledWith(obraMock);
  });

  test('muestra alerta si no puede identificar usuario', () => {
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

    localStorage.setItem('nl_token', 'token-falso');
    localStorage.setItem(
      'nl_user',
      JSON.stringify({
        email: 'usuario@test.com',
      })
    );
    localStorage.setItem('nl_auth', '1');

    renderMediaCard();

    fireEvent.click(
      screen.getByLabelText('Agregar a favoritos')
    );

    expect(alertMock).toHaveBeenCalledWith(
      'No se pudo identificar tu usuario. Cierra sesión e inicia sesión otra vez.'
    );

    expect(mockToggleList).not.toHaveBeenCalled();

    alertMock.mockRestore();
  });

  test('no muestra rating cuando rating es guion', () => {
    renderMediaCard({
      obra: {
        ...obraMock,
        rating: '—',
      },
    });

    expect(screen.queryByText(/8.6/)).not.toBeInTheDocument();
  });

  test('usa fallback cuando falla la imagen', () => {
    renderMediaCard();

    const img = screen.getByAltText('Poster de Star Wars');

    fireEvent.error(img);

    expect(img.getAttribute('src')).toContain('data:image/svg+xml');
  });

  test('renderiza sin año visible cuando year es guion', () => {
    renderMediaCard({
      obra: {
        ...obraMock,
        year: '—',
      },
    });

    expect(screen.queryByText(/1977/)).not.toBeInTheDocument();
  });

  test('aplica estilo especial cuando el tipo es game', () => {
    renderMediaCard({
      obra: {
        ...obraMock,
        type: 'game',
      },
    });

    const img = screen.getByAltText('Poster de Star Wars');

    expect(img).toHaveStyle({
      aspectRatio: '4/3',
    });
  });
});
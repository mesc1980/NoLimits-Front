import { describe, test, vi, beforeEach, assert } from 'vitest';
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

    assert.isNotNull(screen.getByText('Star Wars'));
    assert.isNotNull(screen.getByText(/1977/));

    assert.equal(
      screen.getByAltText('Poster de Star Wars').getAttribute('src'),
      '/poster-star-wars.jpg'
    );

    assert.isNotNull(screen.getByText(/8.6/));
  });

  test('ejecuta onClick personalizado al presionar la card', () => {
    const onClick = vi.fn();

    renderMediaCard({ onClick });

    fireEvent.click(screen.getByRole('button', { name: 'Ver Star Wars' }));

    assert.deepEqual(onClick.mock.calls[0], [obraMock]);
  });

  test('navega al detalle si no recibe onClick', () => {
    renderMediaCard();

    fireEvent.click(screen.getByRole('button', { name: 'Ver Star Wars' }));

    assert.deepEqual(mockNavigate.mock.calls[0], ['/detail/tmdb-movie-1893']);
  });

  test('también navega al detalle al presionar Enter', () => {
    renderMediaCard();

    fireEvent.keyDown(
      screen.getByRole('button', { name: 'Ver Star Wars' }),
      { key: 'Enter' }
    );

    assert.deepEqual(mockNavigate.mock.calls[0], ['/detail/tmdb-movie-1893']);
  });

  test('oculta el botón de favoritos cuando hideFavoriteButton es true', () => {
    renderMediaCard({
      hideFavoriteButton: true,
    });

    assert.isNull(screen.queryByLabelText('Agregar a favoritos'));
  });

  test('redirige a login si intenta guardar favorito sin sesión', () => {
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

    renderMediaCard();

    fireEvent.click(screen.getByLabelText('Agregar a favoritos'));

    assert.deepEqual(alertMock.mock.calls[0], [
      'Debes iniciar sesión para guardar en favoritos',
    ]);

    assert.deepEqual(mockNavigate.mock.calls[0], ['/login']);

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

    fireEvent.click(screen.getByLabelText('Agregar a favoritos'));

    assert.deepEqual(mockToggleList.mock.calls[0], [obraMock]);
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

    fireEvent.click(screen.getByLabelText('Agregar a favoritos'));

    assert.deepEqual(alertMock.mock.calls[0], [
      'No se pudo identificar tu usuario. Cierra sesión e inicia sesión otra vez.',
    ]);

    assert.equal(mockToggleList.mock.calls.length, 0);

    alertMock.mockRestore();
  });

  test('no muestra rating cuando rating es guion', () => {
    renderMediaCard({
      obra: {
        ...obraMock,
        rating: '—',
      },
    });

    assert.isNull(screen.queryByText(/8.6/));
  });

  test('usa fallback cuando falla la imagen', () => {
    renderMediaCard();

    const img = screen.getByAltText('Poster de Star Wars');

    fireEvent.error(img);

    assert.include(img.getAttribute('src'), 'data:image/svg+xml');
  });

  test('renderiza sin año visible cuando year es guion', () => {
    renderMediaCard({
      obra: {
        ...obraMock,
        year: '—',
      },
    });

    assert.isNull(screen.queryByText(/1977/));
  });

  test('aplica estilo especial cuando el tipo es game', () => {
    renderMediaCard({
      obra: {
        ...obraMock,
        type: 'game',
      },
    });

    const img = screen.getByAltText('Poster de Star Wars');

    assert.include(img.getAttribute('style'), 'aspect-ratio: 4/3');
  });
});
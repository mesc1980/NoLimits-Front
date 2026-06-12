import { describe, test, vi, beforeEach, assert } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import BookCard from '@/components/cards/BookCard';

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
  id: 'openlibrary:book:OL123',
  type: 'book',
  title: 'The Hobbit',
  year: '1937',
  rating: '4.8',
  poster: '/hobbit-cover.jpg',
  synopsis:
    'Bilbo Baggins vive una aventura inesperada junto a un grupo de enanos y el mago Gandalf.',
};

function renderBookCard(props = {}) {
  return render(
    <MemoryRouter>
      <BookCard obra={obraMock} {...props} />
    </MemoryRouter>
  );
}

describe('BookCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  test('renderiza título, año, portada, rating y sinopsis', () => {
    renderBookCard();

    assert.isNotNull(screen.getByText('The Hobbit'));
    assert.isNotNull(screen.getByText(/1937/));

    assert.equal(
      screen.getByAltText('Portada de The Hobbit').getAttribute('src'),
      '/hobbit-cover.jpg'
    );

    assert.isNotNull(screen.getByText(/4.8/));
    assert.isNotNull(screen.getByText(/Bilbo Baggins/));
  });

  test('ejecuta onClick personalizado al presionar la card', () => {
    const onClick = vi.fn();

    renderBookCard({ onClick });

    fireEvent.click(
      screen.getByRole('button', { name: 'Ver The Hobbit' })
    );

    assert.deepEqual(onClick.mock.calls[0], [obraMock]);
  });

  test('navega al detalle si no recibe onClick', () => {
    renderBookCard();

    fireEvent.click(
      screen.getByRole('button', { name: 'Ver The Hobbit' })
    );

    assert.deepEqual(mockNavigate.mock.calls[0], [
      '/detail/openlibrary-book-OL123',
    ]);
  });

  test('también navega al detalle al presionar Enter', () => {
    renderBookCard();

    fireEvent.keyDown(
      screen.getByRole('button', { name: 'Ver The Hobbit' }),
      { key: 'Enter' }
    );

    assert.deepEqual(mockNavigate.mock.calls[0], [
      '/detail/openlibrary-book-OL123',
    ]);
  });

  test('oculta el botón de favoritos cuando hideFavoriteButton es true', () => {
    renderBookCard({
      hideFavoriteButton: true,
    });

    assert.isNull(screen.queryByLabelText('Agregar a favoritos'));
  });

  test('redirige a login si intenta guardar favorito sin sesión', () => {
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

    renderBookCard();

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

    renderBookCard();

    fireEvent.click(screen.getByLabelText('Agregar a favoritos'));

    assert.deepEqual(mockToggleList.mock.calls[0], [obraMock]);
  });
});
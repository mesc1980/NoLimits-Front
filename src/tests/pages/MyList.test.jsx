import { describe, expect, test, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import MyList from '@/pages/MyList';

const toggleListMock = vi.fn();
const loadFavoritesMock = vi.fn();

let myListMock = [];

vi.mock('@/store/useAppStore', () => ({
  default: (selector) =>
    selector({
      myList: myListMock,
      toggleList: toggleListMock,
      loadFavorites: loadFavoritesMock,
    }),
}));

vi.mock('@/components/cards/MediaCard', () => ({
  default: ({ obra }) => <div>MediaCard: {obra.title}</div>,
}));

vi.mock('@/components/cards/AnimeCard', () => ({
  default: ({ obra }) => <div>AnimeCard: {obra.title}</div>,
}));

vi.mock('@/components/cards/BookCard', () => ({
  default: ({ obra }) => <div>BookCard: {obra.title}</div>,
}));

function renderMyList() {
  return render(
    <MemoryRouter>
      <MyList />
    </MemoryRouter>
  );
}

describe('MyList', () => {
  beforeEach(() => {
    myListMock = [];

    toggleListMock.mockClear();
    loadFavoritesMock.mockClear();

    localStorage.clear();
    localStorage.setItem('nl_token', 'token-falso');
  });

  test('muestra estado vacío cuando no hay obras guardadas', () => {
    myListMock = [];

    renderMyList();

    expect(
      screen.getByText('Tu lista está vacía.')
    ).toBeInTheDocument();

    expect(
      screen.getByText('Explorar el catálogo')
    ).toBeInTheDocument();
  });

  test('muestra cantidad de obras guardadas', () => {
    myListMock = [
      {
        id: 'tmdb:movie:1',
        type: 'movie',
        title: 'Star Wars',
        year: '1977',
        rating: '8.6',
        poster: '/starwars.jpg',
      },
      {
        id: 'openlibrary:book:1',
        type: 'book',
        title: 'Dune',
        year: '1965',
        rating: '9.0',
        poster: '/dune.jpg',
      },
    ];

    renderMyList();

    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('obras guardadas')).toBeInTheDocument();
  });

  test('renderiza cards según el tipo de obra', () => {
    myListMock = [
      {
        id: 'tmdb:movie:1',
        type: 'movie',
        title: 'Star Wars',
      },
      {
        id: 'jikan:anime:1',
        type: 'anime',
        title: 'Cowboy Bebop',
      },
      {
        id: 'openlibrary:book:1',
        type: 'book',
        title: 'Dune',
      },
    ];

    renderMyList();

    expect(
      screen.getByText('MediaCard: Star Wars')
    ).toBeInTheDocument();

    expect(
      screen.getByText('AnimeCard: Cowboy Bebop')
    ).toBeInTheDocument();

    expect(
      screen.getByText('BookCard: Dune')
    ).toBeInTheDocument();
  });

  test('filtra obras por tipo película', () => {
    myListMock = [
      {
        id: 'tmdb:movie:1',
        type: 'movie',
        title: 'Star Wars',
      },
      {
        id: 'openlibrary:book:1',
        type: 'book',
        title: 'Dune',
      },
    ];

    renderMyList();

    fireEvent.click(
      screen.getByText(/Películas/)
    );

    expect(
      screen.getByText('MediaCard: Star Wars')
    ).toBeInTheDocument();

    expect(
      screen.queryByText('BookCard: Dune')
    ).not.toBeInTheDocument();
  });

  test('muestra mensaje cuando el filtro no tiene obras', () => {
    myListMock = [
      {
        id: 'tmdb:movie:1',
        type: 'movie',
        title: 'Star Wars',
      },
    ];

    renderMyList();

    fireEvent.click(
      screen.getByText(/Libros/)
    );

    expect(
      screen.getByText(
        'No tienes obras de este tipo en tu lista.'
      )
    ).toBeInTheDocument();
  });

  test('ejecuta toggleList al quitar de favoritos', () => {
    const obra = {
      id: 'tmdb:movie:1',
      type: 'movie',
      title: 'Star Wars',
    };

    myListMock = [obra];

    renderMyList();

    fireEvent.click(
      screen.getByText('Quitar de favoritos')
    );

    expect(toggleListMock).toHaveBeenCalledWith(
      obra
    );
  });
});
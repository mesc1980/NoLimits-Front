import { describe, expect, test, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import GameCard from '@/components/cards/GameCard';

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
  id: 'rawg:game:3498',
  type: 'game',
  title: 'Grand Theft Auto V',
  year: '2013',
  rating: '4.7',
  poster: '/gta-v.jpg',
};

function renderGameCard(props = {}) {
  return render(
    <MemoryRouter>
      <GameCard obra={obraMock} {...props} />
    </MemoryRouter>
  );
}

describe('GameCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renderiza título, año, poster y rating', () => {
    renderGameCard();

    expect(
      screen.getByText('Grand Theft Auto V')
    ).toBeInTheDocument();

    expect(
      screen.getByText(/2013/)
    ).toBeInTheDocument();

    expect(
      screen.getByAltText('Poster de Grand Theft Auto V')
    ).toHaveAttribute('src', '/gta-v.jpg');

    expect(
      screen.getByText(/4.7/)
    ).toBeInTheDocument();
  });

  test('ejecuta onClick personalizado', () => {
    const onClick = vi.fn();

    renderGameCard({ onClick });

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Ver Grand Theft Auto V',
      })
    );

    expect(onClick).toHaveBeenCalledWith(obraMock);
  });

  test('navega al detalle si no recibe onClick', () => {
    renderGameCard();

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Ver Grand Theft Auto V',
      })
    );

    expect(mockNavigate).toHaveBeenCalledWith(
      '/detail/rawg-game-3498'
    );
  });

  test('navega al detalle al presionar Enter', () => {
    renderGameCard();

    fireEvent.keyDown(
      screen.getByRole('button', {
        name: 'Ver Grand Theft Auto V',
      }),
      {
        key: 'Enter',
      }
    );

    expect(mockNavigate).toHaveBeenCalledWith(
      '/detail/rawg-game-3498'
    );
  });

  test('guarda en mi lista al hacer click en el botón', () => {
    renderGameCard();

    fireEvent.click(
      screen.getByLabelText('Guardar en mi lista')
    );

    expect(mockToggleList).toHaveBeenCalledWith(
      obraMock
    );
  });
});
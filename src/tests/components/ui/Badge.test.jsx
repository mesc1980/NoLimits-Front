import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';

import Badge from '@/components/ui/Badge';

describe('Badge', () => {
  test('renderiza badge de tipo película', () => {
    render(
      <Badge type="movie" />
    );

    expect(
      screen.getByText('Película')
    ).toBeInTheDocument();
  });

  test('renderiza label personalizada', () => {
    render(
      <Badge
        type="movie"
        label="Custom Label"
      />
    );

    expect(
      screen.getByText('Custom Label')
    ).toBeInTheDocument();
  });

  test('renderiza badge de rating', () => {
    render(
      <Badge
        variant="rating"
        label="8.7"
      />
    );

    expect(
      screen.getByText(/8.7/)
    ).toBeInTheDocument();
  });

  test('aplica clase de rating correctamente', () => {
    render(
      <Badge
        variant="rating"
        label="9.1"
      />
    );

    const badge = screen.getByText(/9.1/);

    expect(badge.className).toContain('nl-badge--rating');
  });

  test('aplica clase correspondiente al tipo', () => {
    render(
      <Badge type="game" />
    );

    const badge = screen.getByText('Videojuego');

    expect(badge.className).toContain('nl-badge');
  });
});
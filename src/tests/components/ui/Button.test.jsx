import { describe, expect, test, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import Button from '@/components/ui/Button';

describe('Button', () => {
  test('renderiza el texto correctamente', () => {
    render(
      <Button>
        Ver detalle
      </Button>
    );

    expect(
      screen.getByText('Ver detalle')
    ).toBeInTheDocument();
  });

  test('aplica variante primary por defecto', () => {
    render(
      <Button>
        Botón
      </Button>
    );

    const button = screen.getByRole('button');

    expect(button.className).toContain('nl-btn--primary');
  });

  test('aplica variante secondary', () => {
    render(
      <Button variant="secondary">
        Secondary
      </Button>
    );

    const button = screen.getByRole('button');

    expect(button.className).toContain('nl-btn--secondary');
  });

  test('aplica tamaño lg', () => {
    render(
      <Button size="lg">
        Grande
      </Button>
    );

    const button = screen.getByRole('button');

    expect(button.className).toContain('nl-btn--lg');
  });

  test('ejecuta onClick al hacer click', () => {
    const handleClick = vi.fn();

    render(
      <Button onClick={handleClick}>
        Click
      </Button>
    );

    fireEvent.click(
      screen.getByRole('button')
    );

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('puede estar deshabilitado', () => {
    render(
      <Button disabled>
        Disabled
      </Button>
    );

    expect(
      screen.getByRole('button')
    ).toBeDisabled();
  });
});
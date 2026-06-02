import { describe, expect, test, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import SearchBar from '@/components/ui/SearchBar';

function renderSearchBar(props = {}) {
  return render(
    <MemoryRouter>
      <SearchBar {...props} />
    </MemoryRouter>
  );
}

describe('SearchBar', () => {
  test('renderiza el input de búsqueda', () => {
    renderSearchBar();

    expect(
      screen.getByLabelText('Buscar obras')
    ).toBeInTheDocument();
  });

  test('muestra la búsqueda inicial', () => {
    renderSearchBar({
      initialQuery: 'Star Wars',
    });

    expect(
      screen.getByLabelText('Buscar obras')
    ).toHaveValue('Star Wars');
  });

  test('permite escribir en el input', () => {
    renderSearchBar();

    const input = screen.getByLabelText('Buscar obras');

    fireEvent.change(input, {
      target: { value: 'Matrix' },
    });

    expect(input).toHaveValue('Matrix');
  });

  test('ejecuta onSearch al enviar una búsqueda válida', () => {
    const onSearch = vi.fn();

    renderSearchBar({
      onSearch,
    });

    const input = screen.getByLabelText('Buscar obras');

    fireEvent.change(input, {
      target: { value: 'Harry Potter' },
    });

    fireEvent.submit(
      screen.getByRole('search')
    );

    expect(onSearch).toHaveBeenCalledWith('Harry Potter', 'all');
  });

  test('no ejecuta onSearch si la búsqueda está vacía', () => {
    const onSearch = vi.fn();

    renderSearchBar({
      onSearch,
    });

    fireEvent.submit(
      screen.getByRole('search')
    );

    expect(onSearch).not.toHaveBeenCalled();
  });

  test('no muestra tabs cuando compact es true', () => {
    renderSearchBar({
      compact: true,
    });

    expect(
      screen.queryByRole('tablist')
    ).not.toBeInTheDocument();
  });

  test('ejecuta onSearch al cambiar de tab con texto escrito', () => {
    const onSearch = vi.fn();

    renderSearchBar({
      onSearch,
    });

    const input = screen.getByLabelText('Buscar obras');

    fireEvent.change(input, {
      target: { value: 'Naruto' },
    });

    fireEvent.click(
      screen.getByRole('tab', { name: /Anime/i })
    );

    expect(onSearch).toHaveBeenCalledWith('Naruto', 'anime');
  });

  test('ejecuta onSearch al cambiar de tab sin texto escrito', () => {
    const onSearch = vi.fn();

    renderSearchBar({
      onSearch,
    });

    fireEvent.click(
      screen.getByRole('tab', { name: /Películas/i })
    );

    expect(onSearch).toHaveBeenCalledWith('', 'movie');
  });

  test('actualiza el input si cambia initialQuery', () => {
    const { rerender } = render(
      <MemoryRouter>
        <SearchBar initialQuery="Star Wars" />
      </MemoryRouter>
    );

    expect(
      screen.getByLabelText('Buscar obras')
    ).toHaveValue('Star Wars');

    rerender(
      <MemoryRouter>
        <SearchBar initialQuery="Matrix" initialType="movie" />
      </MemoryRouter>
    );

    expect(
      screen.getByLabelText('Buscar obras')
    ).toHaveValue('Matrix');
  });
});
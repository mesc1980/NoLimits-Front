import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, test, beforeEach, vi, assert } from 'vitest';
import Layout from '@/components/layout/Layout';

vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

vi.mock('@/components/ui/ChatBot', () => ({
  default: () => <div data-testid="chatbot">ChatBot</div>,
}));

describe('Smoke Test - NoLimits Frontend', () => {
  beforeEach(() => {
    window.scrollTo = vi.fn();
  });

  test('la aplicación renderiza su estructura principal sin errores', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<div>Home Smoke Test</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    assert.isNotNull(screen.getByText('Home Smoke Test'));
    assert.isNotNull(screen.getByTestId('chatbot'));
  });

  test('renderiza correctamente el contenido del Outlet', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<h1>Página Principal</h1>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    assert.isNotNull(screen.getByRole('heading', {
      name: 'Página Principal',
    }));
  });

  test('mantiene disponibles los componentes globales', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<div>Contenido</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    assert.isNotNull(screen.getByTestId('chatbot'));
    assert.isNotNull(screen.getByText('Contenido'));
  });
});
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, vi, beforeEach, assert } from 'vitest';
import Login from '@/pages/Login';
import { supabase } from '@/lib/supabase';

vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
}));

vi.mock('@/components/ui/Button', () => ({
  default: ({ children, ...props }) => <button {...props}>{children}</button>,
}));

vi.mock('@/components/layout/Logo', () => ({
  default: () => <div>Logo</div>,
}));

vi.mock('@/store/useAppStore', () => ({
  default: (selector) =>
    selector({
      setUser: vi.fn(),
    }),
}));

vi.mock('@/services/usuarios', () => ({
  login: vi.fn(),
  registrarUsuario: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithOAuth: vi.fn(async () => ({ error: null })),
    },
  },
}));

describe('Regresión - BUG-001 login con Google', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * BUG-001
   *
   * Durante el desarrollo se detectaron problemas
   * en el flujo de autenticación con Google.
   *
   * Esta prueba asegura que el botón de Google continúe
   * llamando correctamente a Supabase OAuth.
   */
  test('inicia sesión con Google usando Supabase OAuth', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Continuar con Google'));

    await waitFor(() => {
      assert.equal(supabase.auth.signInWithOAuth.mock.calls.length, 1);
    });

    assert.deepInclude(supabase.auth.signInWithOAuth.mock.calls[0][0], {
      provider: 'google',
    });
  });
});
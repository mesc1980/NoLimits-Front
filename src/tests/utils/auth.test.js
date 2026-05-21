import { describe, expect, test, vi, beforeEach } from 'vitest';

import { cerrarSesion } from '@/utils/auth';

describe('auth utils', () => {
  beforeEach(() => {
    localStorage.clear();

    delete window.location;

    window.location = {
      href: '',
    };
  });

  test('elimina datos de sesión del localStorage', () => {
    localStorage.setItem('nl_auth', 'true');
    localStorage.setItem('nl_user', '{"id":1}');
    localStorage.setItem('nl_role', 'admin');
    localStorage.setItem('nl_token', 'token123');
    localStorage.setItem('nl_supabase_token', 'supabase123');

    cerrarSesion();

    expect(localStorage.getItem('nl_auth')).toBeNull();
    expect(localStorage.getItem('nl_user')).toBeNull();
    expect(localStorage.getItem('nl_role')).toBeNull();
    expect(localStorage.getItem('nl_token')).toBeNull();
    expect(localStorage.getItem('nl_supabase_token')).toBeNull();
  });

  test('redirige a la ruta indicada', () => {
    cerrarSesion('/login');

    expect(window.location.href).toBe('/login');
  });

  test('redirige a "/" por defecto', () => {
    cerrarSesion();

    expect(window.location.href).toBe('/');
  });
});
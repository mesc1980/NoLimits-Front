import { describe, test, beforeEach, assert } from 'vitest';

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

    assert.isNull(localStorage.getItem('nl_auth'));
    assert.isNull(localStorage.getItem('nl_user'));
    assert.isNull(localStorage.getItem('nl_role'));
    assert.isNull(localStorage.getItem('nl_token'));
    assert.isNull(localStorage.getItem('nl_supabase_token'));
  });

  test('redirige a la ruta indicada', () => {
    cerrarSesion('/login');

    assert.equal(window.location.href, '/login');
  });

  test('redirige a "/" por defecto', () => {
    cerrarSesion();

    assert.equal(window.location.href, '/');
  });
});
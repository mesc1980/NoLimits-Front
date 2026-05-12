/**
 * components/layout/Header.jsx
 * Header sticky: Logo · Nav · Búsqueda colapsable · Login.
 * Modo claro desactivado (dark-first permanente).
 */

import { useState }              from 'react';
import { NavLink, useNavigate }  from 'react-router-dom';
import { Search, X, BookMarked, LogIn, LogOut, User } from 'lucide-react';
import Logo      from './Logo';
import SearchBar from '@/components/ui/SearchBar';
import useAppStore from '@/store/useAppStore';

function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate    = useNavigate();

  const myListCount = useAppStore((s) => s.myList.length);
  const user        = useAppStore((s) => s.user);
  const clearUser   = useAppStore((s) => s.clearUser);

  return (
    <header className="nl-header">
      <div className="container nl-header__inner">
        <Logo size="md" />

        <nav className="nl-header__nav" aria-label="Navegación principal">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nl-header__nav-link ${isActive ? 'nl-header__nav-link--active' : ''}`}
          >
            Descubrir
          </NavLink>

          <NavLink
            to="/saga"
            className={({ isActive }) => `nl-header__nav-link ${isActive ? 'nl-header__nav-link--active' : ''}`}
            style={{ color: 'var(--nl-accent)', fontWeight: 600 }}
          >
            Sagas
          </NavLink>

          <NavLink
            to="/my-list"
            className={({ isActive }) => `nl-header__nav-link ${isActive ? 'nl-header__nav-link--active' : ''}`}
          >
            Mi biblioteca
            {myListCount > 0 && (
              <span style={{ marginLeft: '6px', background: 'var(--nl-accent)', color: '#fff', borderRadius: '10px', padding: '0 6px', fontSize: '11px', fontWeight: 600, verticalAlign: 'middle' }}>
                {myListCount}
              </span>
            )}
          </NavLink>
        </nav>

        <div className="nl-header__actions">
          {searchOpen && (
            <div style={{ width: '260px' }}>
              <SearchBar compact />
            </div>
          )}

          <button
            className="nl-header__search-btn"
            onClick={() => setSearchOpen((v) => !v)}
            aria-label={searchOpen ? 'Cerrar búsqueda' : 'Abrir búsqueda'}
          >
            {searchOpen ? <X size={20} /> : <Search size={20} />}
          </button>

          {/* Login / logout */}
          {user ? (
            <button
              className="nl-header__search-btn"
              onClick={clearUser}
              title={`Cerrar sesión (${user.name})`}
              style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px' }}
            >
              <User size={16} />
              <LogOut size={14} />
            </button>
          ) : (
            <button
              className="nl-header__search-btn"
              onClick={() => navigate('/login')}
              aria-label="Iniciar sesión"
            >
              <LogIn size={18} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;

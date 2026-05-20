/**
 * pages/Login.jsx — Inicio de sesión y registro. Español neutro.
 */

import { useState }             from 'react';
import { useNavigate, Link }    from 'react-router-dom';
import { motion }               from 'motion/react';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import Button      from '@/components/ui/Button';
import Logo        from '@/components/layout/Logo';
import useAppStore from '@/store/useAppStore';
import { login, registrarUsuario } from '@/services/usuarios';
import { supabase } from '@/lib/supabase';

const TAB_LOGIN    = 'login';
const TAB_REGISTER = 'register';

function Login() {
  const [tab,      setTab]      = useState(TAB_LOGIN);
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [name,     setName]     = useState('');
  const [lastName, setLastName] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const setUser  = useAppStore((s) => s.setUser);
  const navigate = useNavigate();

  async function handleSubmit(e) {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    if (!email.includes('@')) {
      setError('Ingresa un email válido.');
      return;
    }

    if (password.trim().length < 8) {
      setError('La contraseña debe tener mínimo 8 caracteres.');
      return;
    }
    /*
    const data = await login(email, password);

    if (!data) {
      setError('Error al procesar respuesta del servidor.');
      return;
    }
    */
    // Si el usuario está en login → autenticar normal
    // Si está en registro → crear cuenta y luego iniciar sesión automáticamente
    let data;

    if (tab === TAB_LOGIN) {
      data = await login(email, password);
    } else {
      await registrarUsuario({ 
        nombre: name,
        apellidos: lastName,
        correo: email,
        telefono: "99999999",
        contrasena: password
      });
      data = await login(email, password);
    }
    if (!data) {
      setError("Error al procesar respuesta del servidor.");
      return;
    }
    console.log('LOGIN DATA:', data);

    localStorage.setItem('nl_auth', '1');
    localStorage.setItem('nl_user', JSON.stringify(data));
    localStorage.setItem('nl_role', data.rolNombre || data.rol || '');

    if (data?.token) {
      localStorage.setItem('nl_token', data.token);
    }

    const userData = {
      id: data.id || data.usuarioId || "1",
      name: data.nombre || data.name || email.split("@")[0],
      email: data.correo || data.email || email,
      token: data.token || null,
      avatar: null,
      role: data.rolNombre || data.rol || '',
    };

    localStorage.setItem('nl_user', JSON.stringify(userData));

    console.log('SET USER:', userData);

    setUser(userData);

    setSuccessMessage(
      tab === TAB_LOGIN
        ? 'Inicio de sesión exitoso'
        : 'Cuenta creada correctamente'
    );
    setEmail('');
    setPassword('');
    setName('');

    const rolNombre = (data.rolNombre || data.rol || '').toUpperCase().trim();

    const esAdmin = rolNombre === 'ROLE_ADMIN' || rolNombre === 'ADMIN';

    setTimeout(() => {
      setSuccessMessage('');
      navigate(esAdmin ? '/admin' : '/', { replace: true });
    }, 2000);

  } catch (error) {
    console.log('LOGIN ERROR:', error);

    console.error('Error real en login:', error);
    setError(error.message || 'Error al iniciar sesión.');
  } finally {
    setLoading(false);
  }
}
  async function handleGoogleLogin() {
    try {
      setLoading(true);
      setError('');

      const redirectUrl =
        window.location.hostname === 'localhost'
          ? 'http://localhost:5173/auth/callback'
          : 'https://www.nolimitshub.cl/auth/callback';

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) {
        console.error(error);
        setError('No se pudo iniciar sesión con Google.');
      }
    } catch (error) {
      console.error(error);
      setError('Ocurrió un error con Google.');
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width: '100%', height: '48px',
    background: 'var(--nl-bg-elevated)', border: '1px solid var(--nl-border)',
    borderRadius: 'var(--radius-input)', color: 'var(--nl-text-primary)',
    fontSize: '15px', padding: '0 var(--space-4) 0 44px',
    outline: 'none', fontFamily: 'var(--font-ui)',
    transition: 'border-color 150ms ease',
  };

  const iconStyle = {
    position: 'absolute', left: '14px', top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--nl-text-muted)', pointerEvents: 'none',
  };

  return (
    <div style={{ minHeight: 'calc(100vh - var(--header-h))', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-8)' }}>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0,  scale: 1    }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: '100%', maxWidth: '420px',
          background: 'var(--nl-bg-elevated)', border: '1px solid var(--nl-border)',
          borderRadius: 'var(--radius-modal)', padding: 'var(--space-8)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <Logo size="lg" />
          <p style={{ color: 'var(--nl-text-muted)', fontSize: '13px', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
            Toda tu cultura · sin límites
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', background: 'var(--nl-bg-subtle)', borderRadius: 'var(--radius-btn)', padding: '4px', marginBottom: 'var(--space-6)' }}>
          {[{ id: TAB_LOGIN, label: 'Iniciar sesión' }, { id: TAB_REGISTER, label: 'Registrarse' }].map((t) => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setError(''); }}
              style={{
                flex: 1, height: '36px', borderRadius: '6px',
                background: tab === t.id ? 'var(--nl-bg-elevated)' : 'transparent',
                color: tab === t.id ? 'var(--nl-text-primary)' : 'var(--nl-text-muted)',
                fontSize: '14px', fontWeight: tab === t.id ? 600 : 400,
                border: tab === t.id ? '1px solid var(--nl-border)' : 'none',
                cursor: 'pointer', fontFamily: 'var(--font-ui)',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} 
          autoComplete="off"
          style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {tab === TAB_REGISTER && (
            <>
              <div style={{ position: 'relative' }}>
                <User size={16} style={iconStyle} />
                <input type="text" placeholder="Tu nombre" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} required />
              </div>
              <div style={{  position: 'relative' }}>
                <User size={16} style={iconStyle}/>
                <input
                  type='"text'
                  placeholder="Tus apellidos"
                  value={lastName}
                  onChange={(e) =>
                    setLastName(e.target.value)
                  }
                  style={inputStyle}
                  required
                />
              </div>
            </>
          )}

          <div style={{ position: 'relative' }}>
            <Mail size={16} style={iconStyle} />
            <input type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="new-email" style={inputStyle} required />
          </div>

          <div style={{ position: 'relative' }}>
            <Lock size={16} style={iconStyle} />
            <input
              type={showPwd ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ ...inputStyle, paddingRight: '44px' }}
              required minLength={6}
            />
            <button type="button" onClick={() => setShowPwd((v) => !v)}
              style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--nl-text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {error && <p style={{ color: 'var(--nl-format-movie)', fontSize: '13px' }}>{error}</p>}
          {successMessage && (
            <div
              style={{
                background: '#22c55e',
                color: 'white',
                padding: '12px',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '600',
              textAlign: 'center',
              }}
            >
              {successMessage}
            </div>
          )}

          {tab === TAB_LOGIN && (
            <p>
              <span
                style={{ cursor: 'pointer', textDecoration: 'underline' }}
                onClick={() => navigate('/forgot-password')}
              >
                ¿Olvidaste tu contraseña?
              </span>
            </p>
          )}

          <Button type="submit" variant="primary" size="lg" style={{ width: '100%', marginTop: 'var(--space-2)' }} disabled={loading}>
            {loading ? 'Cargando…' : tab === TAB_LOGIN ? 'Entrar' : 'Crear cuenta'}
          </Button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', margin: 'var(--space-4) 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--nl-border)' }} />
          <span style={{ fontSize: '12px', color: 'var(--nl-text-muted)', fontFamily: 'var(--font-mono)' }}>o</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--nl-border)' }} />
        </div>

        <button
          onClick={handleGoogleLogin}
          style={{ width: '100%', height: '48px', background: 'var(--nl-bg-subtle)', border: '1px solid var(--nl-border)', borderRadius: 'var(--radius-btn)', color: 'var(--nl-text-primary)', fontSize: '14px', cursor: 'pointer', fontFamily: 'var(--font-ui)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
            <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
          </svg>
          Continuar con Google
        </button>

        <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--nl-text-muted)', marginTop: 'var(--space-4)' }}>
          Al continuar aceptas los{' '}
          <Link to="/terms" style={{ color: 'var(--nl-accent)', textDecoration: 'underline' }}>términos de uso</Link>.
        </p>
      </motion.div>
    </div>
  );
}

export default Login;
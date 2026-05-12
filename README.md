# no/limits — Hub Cultural Multimedia

> *Toda tu cultura, sin límites.*

Plataforma agregadora de contenido cultural que unifica películas, series, anime, videojuegos, libros y música en un solo lugar. El concepto central son las **sagas** — el usuario busca "Spider-Man" y obtiene todo el universo de esa franquicia junto con los enlaces para encontrar cada obra.

---

## Índice

1. [Stack tecnológico](#stack-tecnológico)
2. [Instalación y puesta en marcha](#instalación-y-puesta-en-marcha)
3. [Variables de entorno](#variables-de-entorno)
4. [Arquitectura del proyecto](#arquitectura-del-proyecto)
5. [Estructura de carpetas](#estructura-de-carpetas)
6. [APIs externas integradas](#apis-externas-integradas)
7. [Modelo de datos unificado (Obra)](#modelo-de-datos-unificado-obra)
8. [Brandbook y tokens de diseño](#brandbook-y-tokens-de-diseño)
9. [Dónde y cómo integrar el backend](#dónde-y-cómo-integrar-el-backend)
10. [Diseño de base de datos](#diseño-de-base-de-datos)
11. [Próximos pasos sugeridos](#próximos-pasos-sugeridos)

---

## Stack tecnológico

| Capa | Librería | Por qué |
|---|---|---|
| UI | **React 18** | Componentes declarativos, hooks modernos |
| Build | **Vite 5** | Dev server ultrarrápido, HMR, proxy integrado |
| Routing | **React Router 6** | `createBrowserRouter`, rutas anidadas, layout compartido |
| Estado global | **Zustand** | Store mínimo sin boilerplate; `persist` para localStorage |
| Data fetching | **TanStack Query v5** | Caché automático, loading states, deduplicación de requests |
| Animaciones | **Framer Motion (motion)** | Variants, stagger, AnimatePresence, spring physics |
| Iconos | **Lucide React** | Set único exigido por el brandbook (2px stroke, currentColor) |
| Tipografía | **@fontsource/geist + inter + jetbrains-mono** | Self-hosted, sin CDN externo |
| PropTypes | **prop-types** | Validación de props en desarrollo |

---

## Instalación y puesta en marcha

### Requisitos previos
- Node.js 18+ (recomendado: 20 LTS)
- npm 9+

### Pasos

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd no-limits

# 2. Instalar dependencias
npm install

# 3. Crear archivo de entorno
cp .env.example .env
# Editar .env con tus claves (ver sección Variables de entorno)

# 4. Levantar el servidor de desarrollo
npm run dev
# → http://localhost:5173
```

### Scripts disponibles

```bash
npm run dev      # Servidor de desarrollo con HMR y proxy de IGDB
npm run build    # Build de producción en /dist
npm run preview  # Previsualizar el build de producción
```

---

## Variables de entorno

Crea un archivo `.env` en la raíz del proyecto (nunca lo commitees):

```env
# TMDB — Películas, series y plataformas de streaming
# Registro gratuito en: https://www.themoviedb.org/settings/api
VITE_TMDB_KEY=tu_api_key_de_tmdb

# IGDB (Twitch) — Base de datos de videojuegos
# IMPORTANTE: Solo el access_token, NUNCA el client_secret en el frontend
# 1. Crear app en: https://dev.twitch.tv/console/apps
# 2. Generar token (válido ~60 días):
#    curl -X POST "https://id.twitch.tv/oauth2/token" \
#      -d "client_id=TU_ID&client_secret=TU_SECRET&grant_type=client_credentials"
VITE_IGDB_CLIENT_ID=tu_client_id
VITE_IGDB_TOKEN=tu_access_token

# Backend propio — descomentar cuando exista
# VITE_API_BASE_URL=http://localhost:3000
# VITE_API_BASE_URL=https://api.nolimits.app
```

### Sobre el token de IGDB

IGDB no admite llamadas directas desde el browser (CORS bloqueado). En desarrollo, el proxy de Vite en `vite.config.js` intercepta `/api/igdb/*` e inyecta las credenciales **en el servidor**, sin exponerlas al cliente.

Cuando el token expire (~55 días), regenerarlo:

```bash
curl -X POST "https://id.twitch.tv/oauth2/token" \
  -d "client_id=TU_ID" \
  -d "client_secret=TU_SECRET" \
  -d "grant_type=client_credentials"
# Actualizar VITE_IGDB_TOKEN en .env y reiniciar npm run dev
```

---

## Arquitectura del proyecto

```
Browser
  │
  ├─ React Router (SPA routing)
  │     ├─ / (Home)
  │     ├─ /search?q=&type=
  │     ├─ /detail/:mediaId        ← "tmdb-movie-12345" | "jikan-anime-21"
  │     ├─ /saga/:sagaName          ← curada o genérica
  │     ├─ /my-list
  │     ├─ /login
  │     └─ /terms
  │
  ├─ TanStack Query (caché de datos)
  │     └─ Hooks: useTMDB / useJikan / useOpenLibrary / useIGDB / useSearch / useSagaSearch
  │
  ├─ Zustand (estado global)
  │     └─ user | myList | reviews | theme
  │
  └─ Services (acceso a APIs)
        ├─ services/api.js       ← cliente HTTP base (preparado para backend)
        ├─ services/tmdb.js      ← TMDB API directa
        ├─ services/jikan.js     ← Jikan API directa
        ├─ services/openLibrary.js
        ├─ services/igdb.js      ← vía proxy Vite en dev / backend en prod
        ├─ services/musicbrainz.js
        └─ services/whereToWatch.js
```

### Flujo de una búsqueda

```
1. Usuario escribe "Spider-Man" → SearchBar
2. useSearch("Spider-Man", "all") → TanStack Query
3. Promise.allSettled([tmdb, jikan, openlibrary, igdb, musicbrainz])
4. Cada resultado normalizado → modelo Obra (normalizeMedia.js)
5. Resultados agrupados por tipo → SearchResults.jsx
```

### Flujo de navegación a saga

```
1. Click en "Spider-Man" → /saga/Spider-Man
2. Saga.jsx comprueba getCuratedSaga("spider-man")
3. Si existe → CuratedSagaView (hero con backdrop, descripción editorial)
4. Si no   → GenericSagaView (resultado de búsqueda agrupado)
```

---

## Estructura de carpetas

```
no-limits/
├── public/
│   └── favicon.svg               # Isotipo n/l en SVG
│
├── src/
│   ├── assets/fonts/              # Reservado para fuentes locales
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.jsx         # Nav sticky + búsqueda colapsable + login
│   │   │   ├── Footer.jsx         # Créditos + fuentes + link a /terms
│   │   │   └── Layout.jsx         # Wrapper: Header + Outlet + Footer + ChatBot
│   │   │                          # También contiene ScrollToTop
│   │   │
│   │   ├── ui/                    # Átomos de UI (sin lógica de negocio)
│   │   │   ├── Button.jsx         # 4 variantes: primary|secondary|ghost|destructive
│   │   │   ├── Badge.jsx          # Chip de tipo (película, anime…) y de rating
│   │   │   ├── SkeletonCard.jsx   # Placeholder shimmer mientras carga
│   │   │   ├── Modal.jsx          # Portal + overlay + Escape key
│   │   │   ├── SearchBar.jsx      # Input + tabs de tipo
│   │   │   ├── WhereToFind.jsx    # Botones/links para encontrar la obra
│   │   │   └── ChatBot.jsx        # Asistente flotante (bottom-right)
│   │   │
│   │   ├── cards/                 # Tarjetas de contenido
│   │   │   ├── MediaCard.jsx      # Películas / series / juegos (ratio 2:3)
│   │   │   ├── AnimeCard.jsx      # Anime (ratio 3:4)
│   │   │   └── BookCard.jsx       # Libros (horizontal)
│   │   │
│   │   └── sections/              # Bloques de página
│   │       ├── HeroSection.jsx    # Mosaico de 12 sagas en 6 columnas verticales
│   │       ├── FeaturedSagas.jsx  # Grid 2×4 de sagas curadas
│   │       ├── ContentSection.jsx # Sección genérica: título + grid de cards
│   │       └── MyListSection.jsx  # Preview de la lista personal
│   │
│   ├── hooks/                     # Lógica de fetching (consumen services/)
│   │   ├── useTMDB.js             # useTrendingMovies | useTopRatedMovies | useMovieDetail…
│   │   ├── useJikan.js            # useTopAnime | useSeasonAnime | useAnimeDetail
│   │   ├── useOpenLibrary.js      # useBooksBySubject | useBookDetail
│   │   ├── useIGDB.js             # useTopGames | useGameDetail
│   │   ├── useMusicBrainz.js      # useMusicSearch | useFranchiseSoundtracks
│   │   └── useSearch.js           # useSearch (multi-API) | useSagaSearch (agrupa por tipo)
│   │
│   ├── pages/                     # Rutas de React Router
│   │   ├── Home.jsx               # Hero + FeaturedSagas + secciones por tipo
│   │   ├── SearchResults.jsx      # Resultados agrupados por tipo
│   │   ├── Detail.jsx             # Ficha de obra: backdrop + poster + info + reseña
│   │   ├── Saga.jsx               # Vista curada o genérica de una franquicia
│   │   ├── MyList.jsx             # Biblioteca personal con filtros por tipo
│   │   ├── Login.jsx              # Login/registro (mockeado, backend-ready)
│   │   └── Terms.jsx              # Términos y condiciones
│   │
│   ├── services/                  # Acceso a APIs externas
│   │   ├── api.js                 # ⚡ Cliente HTTP base — PUNTO DE INTEGRACIÓN DEL BACKEND
│   │   ├── tmdb.js                # Funciones fetch para TMDB
│   │   ├── jikan.js               # Funciones fetch para Jikan/MAL
│   │   ├── openLibrary.js         # Funciones fetch para Open Library
│   │   ├── igdb.js                # Funciones Apicalypse para IGDB (vía proxy)
│   │   ├── musicbrainz.js         # Funciones fetch para MusicBrainz
│   │   └── whereToWatch.js        # TMDB watch providers por país
│   │
│   ├── store/
│   │   └── useAppStore.js         # ⚡ Zustand: user | myList | reviews | theme
│   │
│   ├── styles/
│   │   ├── tokens.css             # CSS custom properties del brandbook (colores, fuentes, spacing…)
│   │   ├── globals.css            # Reset + clases tipográficas
│   │   ├── animations.css         # @keyframes reutilizables
│   │   └── components.css         # Estilos de todos los componentes UI
│   │
│   ├── utils/
│   │   ├── constants.js           # URLs de APIs, tipos de obra, tabs, rutas
│   │   ├── formatters.js          # formatRating | formatYear | buildMediaId | parseMediaSlug
│   │   ├── normalizeMedia.js      # Normalizadores: API cruda → modelo Obra
│   │   └── sagaData.js            # Datos curados de las 12 sagas predefinidas
│   │
│   ├── App.jsx                    # Router: createBrowserRouter + todas las rutas
│   └── main.jsx                   # Entry point: imports de fuentes + estilos + QueryClient
│
├── .env                           # Variables de entorno locales (NO commitear)
├── .env.example                   # Plantilla de variables de entorno
├── vite.config.js                 # Config Vite: alias @/ + proxy IGDB
├── index.html                     # HTML raíz
└── package.json
```

---

## APIs externas integradas

| API | URL Base | Auth | Sin key | Qué aporta |
|---|---|---|---|---|
| **TMDB** | `api.themoviedb.org/3` | `?api_key=` | ✗ | Películas, series, backdrops, providers |
| **Jikan** | `api.jikan.moe/v4` | — | ✓ | Anime, manga, estudios |
| **Open Library** | `openlibrary.org` | — | ✓ | Libros, autores, portadas |
| **IGDB** | `api.igdb.com/v4` | Twitch OAuth | ✗ | Videojuegos, coberturas, plataformas |
| **MusicBrainz** | `musicbrainz.org/ws/2` | — | ✓ | Música, soundtracks, álbumes |
| **TMDB Providers** | `api.themoviedb.org/3/…/watch/providers` | `?api_key=` | ✗ | Dónde ver (Netflix, HBO, etc.) |

### Normalización de respuestas

Todas las APIs retornan formatos distintos. `normalizeMedia.js` convierte cada respuesta al modelo unificado `Obra`:

```js
// Modelo Obra
{
  id:        'tmdb:movie:12345',   // Formato: "source:type:nativeId"
  type:      'movie',              // MEDIA_TYPES.*
  title:     'Spider-Man',
  year:      '2002',
  rating:    '7.4',                // 0-10 normalizado
  poster:    'https://...',        // URL imagen 2:3
  backdrop:  'https://...',        // URL imagen 16:9
  synopsis:  'Peter Parker…',
  genres:    ['Acción', 'Aventura'],
  saga:      'Spider-Man Collection', // null si no aplica
  platforms: ['Sony Pictures'],
  source:    'tmdb',               // DATA_SOURCES.*
}
```

---

## Brandbook y tokens de diseño

El archivo `src/styles/tokens.css` contiene **todas** las variables CSS del brandbook v2.0.
Nunca se deben usar valores de color o spacing hardcodeados en los componentes.

### Colores principales

```css
--nl-bg-base:      #0A0A0B  /* Fondo principal */
--nl-bg-elevated:  #141416  /* Cards y modales */
--nl-bg-subtle:    #1C1C1F  /* Hover e inputs */
--nl-border:       #27272A  /* Divisores */
--nl-text-primary: #FAFAFA
--nl-text-secondary:#A1A1AA
--nl-text-muted:   #52525B
--nl-accent:       #FF4D4D  /* Rojo eléctrico — CTAs y branding */
```

### Colores semánticos por formato (solo en chips)

```css
--nl-format-movie:  #F87171  /* Película */
--nl-format-series: #FB923C  /* Serie */
--nl-format-book:   #FBBF24  /* Libro */
--nl-format-music:  #34D399  /* Música */
--nl-format-game:   #60A5FA  /* Videojuego */
--nl-format-anime:  #A78BFA  /* Anime */
```

### 10 reglas del brandbook que NO se pueden romper

1. Sin paleta v1 (`#1A1A2E` azul + `#E94560` coral)
2. Sin gradientes (excepto hero backgrounds)
3. Sin sombras gruesas ni glows
4. **Solo Lucide** como set de íconos
5. Sin fuentes redondas (Poppins, Quicksand…)
6. No deformar el wordmark `no/limits`
7. El acento `#FF4D4D` nunca como fondo > 200px²
8. Sin emojis en UI productiva crítica
9. Sin filtros sobre portadas (sepia, blur)
10. Sin densidad de dashboard en vistas de descubrimiento

---

## Dónde y cómo integrar el backend

El proyecto fue diseñado desde el inicio para migrar a un backend propio con mínimos cambios.
Los tres archivos clave de integración están marcados con `⚡` en la estructura de carpetas.

---

### 1. `src/services/api.js` — Cliente HTTP base

**Hoy:** hace `fetch()` directo a APIs externas.
**Con backend:** solo cambia la variable de entorno `VITE_API_BASE_URL`.

```js
// src/services/api.js — CAMBIO REQUERIDO
export async function apiFetch(url, options = {}) {
  // DESCOMENTAR cuando el backend exista:
  const token = useAppStore.getState().user?.token;
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  const headers = {
    'Content-Type': 'application/json',
    ...authHeader,        // ← JWT se inyecta aquí automáticamente
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}
```

---

### 2. Cada `services/*.js` — Reemplazar URLs externas por endpoints del backend

**Patrón de migración** (mismo para tmdb.js, jikan.js, igdb.js, etc.):

```js
// ANTES (llama directo a API externa):
export async function fetchTrendingMovies() {
  return apiFetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=...`);
}

// DESPUÉS (llama al backend propio):
const API = import.meta.env.VITE_API_BASE_URL;

export async function fetchTrendingMovies() {
  return apiFetch(`${API}/api/content/trending?type=movie`);
  // El backend consulta TMDB, cachea en DB y retorna el mismo shape de Obra
}
```

El **modelo `Obra`** no cambia. Los hooks y componentes no necesitan modificaciones.

---

### 3. `src/store/useAppStore.js` — Autenticación

**Patrón de login:**

```js
// src/pages/Login.jsx — REEMPLAZAR el bloque mock por:
async function handleSubmit(e) {
  e.preventDefault();
  const API = import.meta.env.VITE_API_BASE_URL;

  const res = await apiFetch(`${API}/api/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  // res = { user: { id, name, email, avatar }, token: 'jwt...' }
  setUser(res.user);            // guarda en store (NO persiste el token en localStorage)
  localStorage.setItem('auth_token', res.token);  // o usar httpOnly cookie
  navigate('/');
}
```

**Patrón de logout:**

```js
// En Header.jsx — ya conectado al store:
clearUser();                                 // limpia el store
localStorage.removeItem('auth_token');       // limpia la sesión
```

---

### 4. `src/hooks/useSearch.js` — Búsqueda unificada

Con backend, el hook `useSearch` puede hacer UNA sola llamada en lugar de 5:

```js
// VERSIÓN SIMPLIFICADA CON BACKEND:
export function useSearch(query, type = 'all') {
  return useQuery({
    queryKey: ['search', query, type],
    queryFn: () => apiFetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/search?q=${query}&type=${type}`
    ),
    enabled: Boolean(query?.trim()),
  });
}
// El backend hace todas las consultas en paralelo y retorna Obra[]
```

---

### 5. `src/components/ui/ChatBot.jsx` — IA conversacional

```js
// Reemplazar la función processMessage() por:
async function processMessage(text, navigate) {
  const res = await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/api/chat`, {
    method: 'POST',
    body: JSON.stringify({ message: text }),
  });
  // res = { text: string, results?: Obra[], action?: { type, payload } }
  if (res.action?.type === 'navigate') navigate(res.action.payload);
  return res;
}
```

---

### Resumen de endpoints del backend a implementar

```
POST  /api/auth/register          → Registro de usuario
POST  /api/auth/login             → Login, retorna JWT
POST  /api/auth/logout            → Invalida token
GET   /api/auth/me                → Usuario actual

GET   /api/search?q=&type=        → Búsqueda unificada (agrega todas las APIs)
GET   /api/content/trending       → En tendencia (películas + series)
GET   /api/content/top-rated      → Mejor valorados
GET   /api/content/:id            → Detalle de una obra

GET   /api/saga/:name             → Todos los items de una franquicia
GET   /api/saga/:name/providers   → Dónde encontrar cada item

GET   /api/user/list              → Lista personal del usuario
POST  /api/user/list              → Agregar obra a la lista
DELETE /api/user/list/:obraId     → Quitar obra de la lista

GET   /api/user/reviews           → Reseñas del usuario
POST  /api/user/reviews           → Crear/actualizar reseña
DELETE /api/user/reviews/:obraId  → Borrar reseña

POST  /api/chat                   → Chatbot con IA
```

---

## Diseño de base de datos

Schema completo para PostgreSQL. Permite que el backend cachee contenido externo, maneje usuarios y extienda las funcionalidades de no/limits.

---

### Tablas de autenticación

```sql
-- Usuarios del sistema
CREATE TABLE users (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  email       VARCHAR(255)  UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,              -- bcrypt
  name        VARCHAR(100)  NOT NULL,
  avatar_url  TEXT,
  is_active   BOOLEAN       DEFAULT true,
  created_at  TIMESTAMPTZ   DEFAULT now(),
  updated_at  TIMESTAMPTZ   DEFAULT now()
);

-- Sesiones / tokens JWT (permite invalidar tokens específicos)
CREATE TABLE sessions (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  VARCHAR(64)   UNIQUE NOT NULL,        -- SHA-256 del JWT
  expires_at  TIMESTAMPTZ   NOT NULL,
  created_at  TIMESTAMPTZ   DEFAULT now(),
  ip_address  INET,
  user_agent  TEXT
);
CREATE INDEX idx_sessions_token ON sessions(token_hash);
CREATE INDEX idx_sessions_user  ON sessions(user_id);
```

---

### Caché de contenido externo

```sql
-- Tipos de contenido (enum para integridad referencial)
CREATE TYPE media_type AS ENUM
  ('movie', 'series', 'anime', 'book', 'music', 'game');

CREATE TYPE data_source AS ENUM
  ('tmdb', 'jikan', 'openlibrary', 'igdb', 'musicbrainz');

-- Caché de obras normalizadas desde APIs externas
-- Evita re-consultar las APIs en cada request y permite búsqueda full-text
CREATE TABLE obras (
  id              TEXT          PRIMARY KEY,          -- "tmdb:movie:12345"
  source          data_source   NOT NULL,
  type            media_type    NOT NULL,
  native_id       TEXT          NOT NULL,             -- ID en la API de origen
  title           TEXT          NOT NULL,
  year            VARCHAR(4),
  rating          NUMERIC(3,1)  CHECK (rating >= 0 AND rating <= 10),
  poster_url      TEXT,
  backdrop_url    TEXT,
  synopsis        TEXT,
  saga_name       TEXT,                               -- nombre de la saga/colección
  platforms       TEXT[],                             -- redes, estudios, plataformas
  raw_data        JSONB,                              -- respuesta original completa
  last_synced_at  TIMESTAMPTZ   DEFAULT now(),
  created_at      TIMESTAMPTZ   DEFAULT now(),

  UNIQUE(source, native_id)                          -- evita duplicados por fuente
);

-- Full-text search sobre títulos y sinopsis
CREATE INDEX idx_obras_fts ON obras
  USING GIN(to_tsvector('spanish', coalesce(title, '') || ' ' || coalesce(synopsis, '')));

CREATE INDEX idx_obras_type   ON obras(type);
CREATE INDEX idx_obras_saga   ON obras(saga_name) WHERE saga_name IS NOT NULL;
CREATE INDEX idx_obras_source ON obras(source);

-- Géneros (normalizado para facilitar filtros)
CREATE TABLE genres (
  id    SERIAL      PRIMARY KEY,
  name  VARCHAR(80) UNIQUE NOT NULL,
  slug  VARCHAR(80) UNIQUE NOT NULL
);

CREATE TABLE obra_genres (
  obra_id   TEXT    REFERENCES obras(id)   ON DELETE CASCADE,
  genre_id  INTEGER REFERENCES genres(id)  ON DELETE CASCADE,
  PRIMARY KEY (obra_id, genre_id)
);
```

---

### Sagas / Franquicias

```sql
-- Sagas curadas (las 12 predefinidas y cualquier otra que se agregue)
CREATE TABLE sagas (
  id            SERIAL        PRIMARY KEY,
  name          VARCHAR(200)  NOT NULL,
  slug          VARCHAR(200)  UNIQUE NOT NULL,        -- "spider-man"
  tagline       TEXT,
  description   TEXT,
  accent_color  CHAR(7),                              -- "#60A5FA"
  hero_obra_id  TEXT          REFERENCES obras(id),   -- obra cuyo backdrop usa el hero
  is_curated    BOOLEAN       DEFAULT false,           -- false = auto-generada por búsqueda
  created_at    TIMESTAMPTZ   DEFAULT now(),
  updated_at    TIMESTAMPTZ   DEFAULT now()
);

-- Obras que pertenecen a una saga (N:M)
CREATE TABLE saga_obras (
  saga_id   INTEGER   REFERENCES sagas(id)  ON DELETE CASCADE,
  obra_id   TEXT      REFERENCES obras(id)  ON DELETE CASCADE,
  position  SMALLINT  DEFAULT 0,                      -- orden de presentación
  PRIMARY KEY (saga_id, obra_id)
);
CREATE INDEX idx_saga_obras_saga ON saga_obras(saga_id);
```

---

### Plataformas y dónde encontrar el contenido

```sql
-- Plataformas conocidas (Netflix, Steam, Crunchyroll…)
CREATE TABLE platforms (
  id            SERIAL        PRIMARY KEY,
  name          VARCHAR(100)  UNIQUE NOT NULL,
  slug          VARCHAR(100)  UNIQUE NOT NULL,
  type          VARCHAR(20)   NOT NULL                -- 'streaming' | 'store' | 'free'
                CHECK (type IN ('streaming', 'store', 'free', 'rental')),
  logo_url      TEXT,
  website_url   TEXT
);

-- Links de dónde encontrar cada obra en cada plataforma
CREATE TABLE obra_platforms (
  id            SERIAL        PRIMARY KEY,
  obra_id       TEXT          NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
  platform_id   INTEGER       NOT NULL REFERENCES platforms(id),
  url           TEXT,                                 -- link directo a la obra
  country_code  CHAR(2)       DEFAULT 'AR',           -- ISO 3166-1
  price_type    VARCHAR(20)   DEFAULT 'included'      -- 'included' | 'rent' | 'buy'
                CHECK (price_type IN ('included', 'rent', 'buy', 'free')),
  synced_at     TIMESTAMPTZ   DEFAULT now(),

  UNIQUE (obra_id, platform_id, country_code)
);
CREATE INDEX idx_obra_platforms_obra    ON obra_platforms(obra_id);
CREATE INDEX idx_obra_platforms_country ON obra_platforms(country_code);
```

---

### Contenido del usuario

```sql
-- Lista personal de obras guardadas
CREATE TABLE user_lists (
  id          SERIAL        PRIMARY KEY,
  user_id     UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  obra_id     TEXT          NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ   DEFAULT now(),

  UNIQUE (user_id, obra_id)
);
CREATE INDEX idx_user_lists_user ON user_lists(user_id);

-- Reseñas y calificaciones personales
CREATE TABLE reviews (
  id          SERIAL        PRIMARY KEY,
  user_id     UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  obra_id     TEXT          NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
  content     TEXT,
  rating      SMALLINT      CHECK (rating >= 1 AND rating <= 10),
  created_at  TIMESTAMPTZ   DEFAULT now(),
  updated_at  TIMESTAMPTZ   DEFAULT now(),

  UNIQUE (user_id, obra_id)                          -- una reseña por usuario por obra
);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_obra ON reviews(obra_id);

-- Historial de vistas (opcional, para recomendaciones futuras)
CREATE TABLE watch_history (
  id          SERIAL        PRIMARY KEY,
  user_id     UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  obra_id     TEXT          NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
  viewed_at   TIMESTAMPTZ   DEFAULT now()
);
CREATE INDEX idx_history_user ON watch_history(user_id, viewed_at DESC);
```

---

### Caché del chatbot

```sql
-- Caché de respuestas del chatbot para reducir llamadas a la IA
CREATE TABLE chat_cache (
  id            SERIAL        PRIMARY KEY,
  query_hash    VARCHAR(64)   UNIQUE NOT NULL,        -- SHA-256 del mensaje normalizado
  query_text    TEXT          NOT NULL,
  response_json JSONB         NOT NULL,               -- { text, results[], action? }
  hit_count     INTEGER       DEFAULT 1,
  created_at    TIMESTAMPTZ   DEFAULT now(),
  expires_at    TIMESTAMPTZ   DEFAULT now() + INTERVAL '24 hours'
);
```

---

### Diagrama de relaciones (simplificado)

```
users ─────────────┬── user_lists ── obras ─── obra_genres ── genres
       │            ├── reviews    │
       └── sessions └── watch_history

obras ─────────────┬── obra_genres  ── genres
                   ├── obra_platforms ── platforms
                   └── saga_obras   ── sagas
```

---

### Queries útiles de ejemplo

```sql
-- Lista personal de un usuario con info de la obra
SELECT o.*, ul.created_at as saved_at
FROM user_lists ul
JOIN obras o ON ul.obra_id = o.id
WHERE ul.user_id = $1
ORDER BY ul.created_at DESC;

-- Obras de una saga con sus plataformas en Argentina
SELECT o.*, array_agg(p.name) as platforms_ar
FROM saga_obras so
JOIN obras o ON so.obra_id = o.id
JOIN sagas s ON so.saga_id = s.id
LEFT JOIN obra_platforms op ON o.id = op.obra_id AND op.country_code = 'AR'
LEFT JOIN platforms p ON op.platform_id = p.id
WHERE s.slug = $1
GROUP BY o.id
ORDER BY so.position, o.year;

-- Búsqueda full-text en español
SELECT *, ts_rank(
  to_tsvector('spanish', title || ' ' || coalesce(synopsis, '')),
  plainto_tsquery('spanish', $1)
) AS rank
FROM obras
WHERE to_tsvector('spanish', title || ' ' || coalesce(synopsis, ''))
  @@ plainto_tsquery('spanish', $1)
ORDER BY rank DESC
LIMIT 50;

-- Reseña promedio de una obra
SELECT
  o.id,
  o.title,
  ROUND(AVG(r.rating), 1) AS avg_user_rating,
  COUNT(r.id)             AS review_count
FROM obras o
LEFT JOIN reviews r ON o.id = r.obra_id
WHERE o.id = $1
GROUP BY o.id;
```

---

## Próximos pasos sugeridos

### Fase 1 — Backend básico
- [ ] Configurar Node.js + Express (o Fastify/Hono) con TypeScript
- [ ] Implementar autenticación JWT (`/api/auth/*`)
- [ ] Crear endpoint unificado de búsqueda (`/api/search`)
- [ ] Migrar el proxy de IGDB al backend (eliminar proxy de Vite en producción)
- [ ] Reemplazar `localStorage` para la lista personal por endpoints REST

### Fase 2 — Funcionalidades sociales
- [ ] Perfiles de usuario públicos
- [ ] Seguir a otros usuarios y ver sus listas
- [ ] Reseñas visibles para otros usuarios (hoy son privadas)
- [ ] Sistema de recomendaciones basado en historial de vistas

### Fase 3 — Mejoras de contenido
- [ ] Webhooks o cron jobs para mantener el caché de obras actualizado
- [ ] Soporte para cómics (Comic Vine API)
- [ ] Soporte para podcasts (Spotify Podcasts API)
- [ ] Notificaciones cuando una obra de tu lista llegue a una plataforma nueva

### Fase 4 — IA
- [ ] Chatbot con Claude/GPT para respuestas conversacionales reales
- [ ] Recomendaciones personalizadas basadas en historial
- [ ] Generación automática de descripciones de sagas

---

*Proyecto académico · Grupo 3 · TPY1101 · 2026 Q1*

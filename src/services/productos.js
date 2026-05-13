// Ruta: src/services/productos.js

const API_BASE =
  import.meta.env.VITE_API_URL ||
  "https://nolimits-backend-final.onrender.com";

// ==========================================================
// Helpers JWT
// ==========================================================
function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("nl_token") : null;
}

function authHeaders(extra = {}) {
  const token = getToken();
  return {
    ...extra,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// --- Cache simple en memoria para productos ---------------------------------
let _productosCache = null;
let _productosCacheTime = 0;
const PRODUCTOS_CACHE_TTL = 1000 * 60; // 1 minuto

function setProductosCache(list) {
  _productosCache = Array.isArray(list) ? list : [];
  _productosCacheTime = Date.now();
}

function clearProductosCache() {
  _productosCache = null;
  _productosCacheTime = 0;
}

// ======================================================================
// LISTAR TODOS LOS PRODUCTOS
// Ahora usa /paginacion en vez de /productos para evitar OOM en Render.
// Recorre todas las páginas (de a PAGE_SIZE) y las une en una sola lista.
// ======================================================================
const PAGE_SIZE = 20; // productos por página al hacer la carga total

export async function listarProductos({ force = false } = {}) {
  if (
    !force &&
    _productosCache &&
    Date.now() - _productosCacheTime < PRODUCTOS_CACHE_TTL
  ) {
    return _productosCache;
  }

  let page = 1;
  let totalPages = 1;
  let productos = [];

  do {
    const url = `${API_BASE}/api/v1/productos/paginacion?page=${page}&size=${PAGE_SIZE}`;
    const res = await fetch(url, { headers: authHeaders() });
    const text = await res.text();


    if (!res.ok) throw new Error("Status " + res.status + " -> " + text);

    const data = text ? JSON.parse(text) : {};
    const list = data.contenido || data.content || [];

    productos = [...productos, ...list];
    totalPages = data.totalPaginas || data.totalPages || 1;

    page++;
  } while (page <= totalPages);

  setProductosCache(productos);
  return productos;

}

// LISTAR PRODUCTOS PAGINADOS (front: 1-based, back: 1-based)
export async function listarProductosPaginado(page = 1, size = 3) {
  const safePage = !Number.isFinite(Number(page)) || page < 1 ? 1 : Number(page);
  const url = `${API_BASE}/api/v1/productos/paginacion?page=${safePage}&size=${size}`;

  const res = await fetch(url, { headers: authHeaders() });
  const text = await res.text();

  if (!res.ok) {
    throw new Error("Status " + res.status + " -> " + text);
  }

  let raw;
  try {
    raw = JSON.parse(text);
  } catch {
    return { content: [], page: 1, totalPages: 1, totalElements: 0 };
  }

  const content = raw.content || raw.contenido || [];

  return {
    content,
    page: raw.page ?? safePage,
    totalPages: raw.totalPages ?? raw.totalPaginas ?? 1,
    totalElements: raw.totalElements ?? raw.totalElementos ?? content.length,
  };
}

// ======================================================================
// CREAR PRODUCTO
// POST /api/v1/productos
// ======================================================================
export async function crearProducto(data) {
  const url = `${API_BASE}/api/v1/productos`;

  const res = await fetch(url, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(data),
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(text || "Error al crear producto");
  }

  let result = null;
  try {
    result = JSON.parse(text);
  } catch {
    result = null;
  }

  clearProductosCache();
  return result;
}

// ======================================================================
// OBTENER PRODUCTO POR ID
// GET /api/v1/productos/{id}
// ======================================================================
export async function obtenerProducto(id) {
  const url = `${API_BASE}/api/v1/productos/${id}`;

  const res = await fetch(url, { headers: authHeaders() });
  const text = await res.text();

  if (!res.ok) {
    throw new Error("Status " + res.status + " -> " + text);
  }

  return JSON.parse(text);
}

// ======================================================================
// EDITAR PRODUCTO (PUT)
// ======================================================================
export async function editarProducto(id, data) {
  const url = `${API_BASE}/api/v1/productos/${id}`;

  const res = await fetch(url, {
    method: "PUT",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(data),
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(text || "Error al editar producto");
  }

  let result = null;
  try {
    result = JSON.parse(text);
  } catch {
    result = null;
  }

  clearProductosCache();
  return result;
}

// ======================================================================
// ELIMINAR PRODUCTO
// ======================================================================
export async function eliminarProducto(id) {
  const url = `${API_BASE}/api/v1/productos/${id}`;

  const res = await fetch(url, {
    method: "DELETE",
    headers: authHeaders(),
  });

  const text = await res.text().catch(() => "");

  if (!res.ok) {
    throw new Error(text || "Error al eliminar producto");
  }

  clearProductosCache();
  return true;
}

// ======================================================================
// SAGAS
// ======================================================================
export async function obtenerSagas() {
  const url = `${API_BASE}/api/v1/productos/sagas/resumen`;

  const res = await fetch(url, { headers: authHeaders() });
  const text = await res.text();

  if (!res.ok) {
    throw new Error("Status " + res.status + " -> " + text);
  }

  if (!text) return [];

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    return [];
  }

  if (!Array.isArray(data)) return [];

  return data
    .map((s) => ({
      nombre: typeof s.nombre === "string" ? s.nombre : "",
      portadaSaga:
        typeof s.portadaSaga === "string" && s.portadaSaga.trim().length > 0
          ? s.portadaSaga
          : null,
    }))
    .filter((s) => s.nombre);
}

export async function obtenerProductosPorSaga(nombreSaga) {
  // ✅ Reutiliza listarProductos (que ya usa paginación internamente)
  const productos = await listarProductos();

  const target =
    typeof nombreSaga === "string" ? nombreSaga.trim().toLowerCase() : "";

  return productos.filter((p) => {
    const saga =
      typeof p.saga === "string" ? p.saga.trim().toLowerCase() : "";
    return saga === target;
  });
}

// ======================================================================
// CATÁLOGOS
// ======================================================================
export async function obtenerTiposProducto() {
  const url = `${API_BASE}/api/v1/tipo-productos`;

  const res = await fetch(url, { headers: authHeaders() });
  const text = await res.text();

  if (!res.ok) throw new Error("Status " + res.status + " -> " + text);

  try {
    return JSON.parse(text);
  } catch {
    return [];
  }
}

export async function obtenerClasificaciones() {
  const url = `${API_BASE}/api/v1/clasificaciones`;

  const res = await fetch(url, { headers: authHeaders() });
  const text = await res.text();

  if (!res.ok) throw new Error("Status " + res.status + " -> " + text);

  try {
    return JSON.parse(text);
  } catch {
    return [];
  }
}

export async function obtenerEstadosProducto() {
  const url = `${API_BASE}/api/v1/estados`;

  const res = await fetch(url, { headers: authHeaders() });
  const text = await res.text();

  if (!res.ok) throw new Error("Status " + res.status + " -> " + text);

  try {
    return JSON.parse(text);
  } catch {
    return [];
  }
}

async function fetchCatalogoPaged(url, label) {
  const res = await fetch(`${API_BASE}${url}`, { headers: authHeaders() });
  const text = await res.text();

  if (!res.ok) {
    console.error(`[${label}] Error HTTP`, res.status, text);
    throw new Error(text || `Error cargando ${label}`);
  }

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    console.error(`[${label}] Respuesta no es JSON`, text);
    return [];
  }

  if (Array.isArray(data)) return data;
  return data.content || data.contenido || [];
}

export async function obtenerPlataformas() {
  return fetchCatalogoPaged(
    "/api/v1/plataformas/paginado?page=1&size=100",
    "PLATAFORMAS"
  );
}

export async function obtenerGeneros() {
  return fetchCatalogoPaged(
    "/api/v1/generos/paginado?page=1&size=100",
    "GENEROS"
  );
}

export async function obtenerEmpresas() {
  return fetchCatalogoPaged(
    "/api/v1/empresas/paginado?page=1&size=100",
    "EMPRESAS"
  );
}

export async function obtenerDesarrolladores() {
  return fetchCatalogoPaged(
    "/api/v1/desarrolladores/paginado?page=1&size=100",
    "DESARROLLADORES"
  );
}

export async function actualizarPrecioSteam(productoId) {
  const token = localStorage.getItem("nl_token");

  const res = await fetch(
    `${API_BASE}/api/v1/productos/${productoId}/actualizar-precio-steam`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Error al actualizar precio desde Steam");
  }

  return await res.json();
}

export async function editarProductoPut(id, data) {
  return guardarProducto(id, data, "PUT");
}

export async function editarProductoPatch(id, data) {
  return guardarProducto(id, data, "PATCH");
}

async function guardarProducto(id, data, method) {
  const url = `${API_BASE}/api/v1/productos/${id}`;

  const res = await fetch(url, {
    method,
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(data),
  });

  const text = await res.text();
  if (!res.ok) throw new Error(text || "Error al editar producto");

  clearProductosCache();
  return text ? JSON.parse(text) : null;
}

// ======================================================================
// OBTENER PRODUCTOS COMPLETOS DE UNA SAGA
// GET /api/v1/productos/sagas/{saga}/completo
// ======================================================================
export async function obtenerProductosDeSagaCompleto(saga) {
  const url = `${API_BASE}/api/v1/productos/sagas/${encodeURIComponent(saga)}/completo`;
  const res = await fetch(url, { headers: authHeaders() });
  const text = await res.text();

  if (!res.ok) throw new Error("Status " + res.status + " -> " + text);

  try {
    return JSON.parse(text);
  } catch {
    return [];
  }
}
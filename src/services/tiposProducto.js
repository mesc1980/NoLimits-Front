// ======================================================================
// Servicio: tiposProducto.js
// Maneja todas las operaciones CRUD relacionadas con "Tipo de Producto".
// ======================================================================

// ----------------------------------------------------------------------
// API_BASE:
// ----------------------------------------------------------------------
const API_BASE =
  import.meta.env.VITE_API_URL ||
  "https://nolimits-backend-final.onrender.com";

// ----------------------------------------------------------------------
// API_URL:
// Ruta base para todos los endpoints del recurso "tipo-productos".
// ----------------------------------------------------------------------
const API_URL = `${API_BASE}/api/v1/tipo-productos`;

// ----------------------------------------------------------------------
// Helpers: token + headers
// ----------------------------------------------------------------------
function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("nl_token") : null;
}

function authHeaders(extra = {}) {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

/* ======================================================================
   LISTAR TIPOS DE PRODUCTO (PAGINADO)
   GET  /api/v1/tipo-productos/paginado?page=1&size=4&search=
   ====================================================================== */
export async function listarTiposProducto(page = 1, search = "") {
  const url = `${API_URL}/paginado?page=${page}&size=4&search=${encodeURIComponent(
    search
  )}`;

  const res = await fetch(url, {
    method: "GET",
    headers: authHeaders(),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    console.error("Error cargando tipos de productos:", res.status, txt);
    throw new Error("Error cargando tipos de productos");
  }

  return await res.json();
}

/* ======================================================================
   CREAR TIPO DE PRODUCTO
   POST  /api/v1/tipo-productos
   ====================================================================== */
export async function crearTipoProducto(payload) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    console.error("Error al crear tipo de producto:", res.status, txt);
    throw new Error("Error al crear tipo de producto");
  }

  return res.json();
}

/* ======================================================================
   EDITAR (PUT)
   PUT  /api/v1/tipo-productos/{id}
   ====================================================================== */
export async function editarTipoProducto(id, payload) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    console.error("Error al editar tipo de producto:", res.status, txt);
    throw new Error("Error al editar tipo de producto");
  }

  return res.json();
}

/* ======================================================================
   PATCH (ACTUALIZACIÓN PARCIAL)
   PATCH  /api/v1/tipo-productos/{id}
   ====================================================================== */
export async function patchTipoProducto(id, payloadParcial) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(payloadParcial),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    console.error("Error en patch tipo producto:", res.status, txt);
    throw new Error("Error en patch tipo producto");
  }

  return res.json();
}

/* ======================================================================
   ELIMINAR
   DELETE  /api/v1/tipo-productos/{id}
   ====================================================================== */
export async function eliminarTipoProducto(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    console.error("Error al eliminar tipo de producto:", res.status, txt);
    throw new Error("Error al eliminar");
  }

  return true;
}

/* ======================================================================
   OBTENER POR ID
   GET  /api/v1/tipo-productos/{id}
   ====================================================================== */
export async function obtenerTipoProducto(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "GET",
    headers: authHeaders(),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    console.error("Error al obtener tipo de producto:", res.status, txt);
    throw new Error("Error al obtener tipo de producto");
  }

  return res.json();
}
// Ruta: src/services/regiones.js
// ======================================================================
// Servicio: regiones.js
// Encargado de obtener la lista de regiones desde el backend.
//
// GET    /api/v2/regiones
// POST   /api/v2/regiones
// PUT    /api/v2/regiones/{id}
// DELETE /api/v2/regiones/{id}
// ======================================================================

const API_BASE =
  import.meta.env.VITE_API_URL ||
  "https://nolimits-backend-final.onrender.com";

const API_URL = `${API_BASE}/api/v2/regiones`;

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

// ======================================================================
// obtenerRegiones() — compatible con HATEOAS
// Devuelve SIEMPRE un array simple: [{id, nombre}, ...]
// ======================================================================
export async function obtenerRegiones() {
  const res = await fetch(API_URL, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Error cargando regiones (${res.status}) ${txt}`);
  }

  const data = await res.json();

  const lista =
    data?._embedded?.regionResponseDTOList?.map((item) => ({
      id: item.id,
      nombre: item.nombre,
    })) || [];

  return lista;
}

// ======================================================================
// CREAR REGIÓN (POST)
// ======================================================================
export async function crearRegion(payload) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Error al crear región (${res.status}) ${txt}`);
  }

  return res.json();
}

// ======================================================================
// EDITAR REGIÓN (PUT)
// ======================================================================
export async function editarRegion(id, payload) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Error al editar región (${res.status}) ${txt}`);
  }

  return res.json();
}

// ======================================================================
// ELIMINAR REGIÓN (DELETE)
// ======================================================================
export async function eliminarRegion(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Error al eliminar región (${res.status}) ${txt}`);
  }

  return true;
}
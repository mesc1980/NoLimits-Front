// Ruta: src/services/tiposEmpresa.js

// ----------------------------------------------------------------------
// API_BASE:
// ----------------------------------------------------------------------
const API_BASE =
  import.meta.env.VITE_API_URL ||
  "https://nolimits-backend-final.onrender.com";

// ----------------------------------------------------------------------
// API_URL:
// ----------------------------------------------------------------------
const API_URL = `${API_BASE}/api/v1/tipos-empresa`;

// ==========================================================
// Helpers de Auth (JWT)
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

/* ======================================================================
   LISTAR TIPOS DE EMPRESA
   ====================================================================== */
export async function listarTiposEmpresa(page = 1, search = "") {
  const params = new URLSearchParams();
  params.append("page", page);
  params.append("size", 20);
  params.append("search", search.trim());

  const res = await fetch(`${API_URL}/paginado?${params.toString()}`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    console.error("[listarTiposEmpresa] Error HTTP:", res.status, txt);
    throw new Error(`Error cargando tipos de empresa (${res.status}) ${txt}`);
  }

  const data = await res.json();

  return {
    contenido: data.contenido || data.content || [],
    totalPaginas: data.totalPaginas || data.totalPages || 1,
    pagina: data.pagina || page,
    totalElementos: data.totalElementos || data.totalElements || 0,
  };
}

/* ======================================================================
   OBTENER TIPO DE EMPRESA POR ID
   ====================================================================== */
export async function obtenerTipoEmpresa(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    console.error("Error obtener tipo empresa:", res.status, txt);
    throw new Error("Error al obtener tipo de empresa");
  }

  return await res.json();
}

/* ======================================================================
   CREAR TIPO DE EMPRESA
   ====================================================================== */
export async function crearTipoEmpresa(payload) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    console.error("Error crear tipo empresa:", res.status, txt);
    throw new Error("Error al crear tipo de empresa");
  }

  return await res.json();
}

/* ======================================================================
   ACTUALIZAR (PUT)
   ====================================================================== */
export async function actualizarTipoEmpresa(id, payload) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    console.error("Error actualizar tipo empresa:", res.status, txt);
    throw new Error("Error al actualizar tipo de empresa");
  }

  return await res.json();
}

/* ======================================================================
   ELIMINAR
   ====================================================================== */
export async function eliminarTipoEmpresa(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    console.error("Error eliminar tipo empresa:", res.status, txt);
    throw new Error("Error al eliminar tipo de empresa");
  }

  return true;
}
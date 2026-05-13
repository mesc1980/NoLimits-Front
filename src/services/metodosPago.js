// Ruta: src/services/metodosPago.js

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

export async function listarMetodosPago(page = 1, search = "") {
  const trimmed = search.trim();

  let endpoint = `${API_BASE}/api/v1/metodos-pago/paginado?page=${page}&size=4`;
  if (trimmed.length > 0) {
    endpoint += `&search=${encodeURIComponent(trimmed)}`;
  }

  console.log("[listarMetodosPago] endpoint:", endpoint);

  const res = await fetch(endpoint, { headers: authHeaders() });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    console.error("[listarMetodosPago] Error HTTP:", res.status, txt);
    throw new Error("Error cargando métodos de pago");
  }

  const data = await res.json();

  return {
    contenido: data.contenido || [],
    totalPaginas: data.totalPaginas || 1,
  };
}

export async function crearMetodoPago(payload) {
  const res = await fetch(`${API_BASE}/api/v1/metodos-pago`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let errTxt = await res.text().catch(() => "");
    throw new Error(errTxt || "Error al crear método de pago");
  }

  return res.json();
}

export async function editarMetodoPago(id, payload) {
  const res = await fetch(`${API_BASE}/api/v1/metodos-pago/${id}`, {
    method: "PUT",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let errTxt = await res.text().catch(() => "");
    throw new Error(errTxt || "Error al editar método de pago");
  }

  return res.json();
}

export async function patchMetodoPago(id, payload) {
  const res = await fetch(`${API_BASE}/api/v1/metodos-pago/${id}`, {
    method: "PATCH",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let errTxt = await res.text().catch(() => "");
    throw new Error(errTxt || "Error en PATCH de método de pago");
  }

  return res.json();
}

export async function eliminarMetodoPago(id) {
  const res = await fetch(`${API_BASE}/api/v1/metodos-pago/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  if (!res.ok) {
    let errTxt = await res.text().catch(() => "");
    throw new Error(errTxt || "Error al eliminar método de pago");
  }

  return true;
}

export async function obtenerMetodoPago(id) {
  const res = await fetch(`${API_BASE}/api/v1/metodos-pago/${id}`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    let errTxt = await res.text().catch(() => "");
    throw new Error(errTxt || "Error al obtener método de pago");
  }

  return res.json();
}
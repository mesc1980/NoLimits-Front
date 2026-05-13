// Ruta: src/services/metodosEnvio.js

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

export async function listarMetodosEnvio(page = 1, search = "") {
  let endpoint = `${API_BASE}/api/v1/metodos-envio/paginado?page=${page}&size=4`;

  if (search.trim().length > 0) {
    endpoint += `&search=${encodeURIComponent(search.trim())}`;
  }

  console.log("[listarMetodosEnvio] endpoint:", endpoint);

  const res = await fetch(endpoint, { headers: authHeaders() });

  if (!res.ok) {
    const txt = await res.text();
    console.error("[listarMetodosEnvio] Error HTTP:", res.status, txt);
    throw new Error("Error cargando métodos de envío");
  }

  const data = await res.json();

  return {
    contenido: data.contenido || [],
    totalPaginas: data.totalPaginas || 1,
  };
}

export async function crearMetodoEnvio(payload) {
  const res = await fetch(`${API_BASE}/api/v1/metodos-envio`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || "Error al crear método de envío");
  }

  return res.json();
}

export async function editarMetodoEnvio(id, payload) {
  const res = await fetch(`${API_BASE}/api/v1/metodos-envio/${id}`, {
    method: "PUT",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || "Error al editar método de envío");
  }

  return res.json();
}

export async function patchMetodoEnvio(id, payload) {
  const res = await fetch(`${API_BASE}/api/v1/metodos-envio/${id}`, {
    method: "PATCH",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.text().catch(() => "");
    throw new Error(error || "Error al actualizar método de envío");
  }

  return res.json();
}

export async function eliminarMetodoEnvio(id) {
  const res = await fetch(`${API_BASE}/api/v1/metodos-envio/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  if (!res.ok) {
    const error = await res.text().catch(() => "");
    throw new Error(error || "Error al eliminar método de envío");
  }

  return true;
}

export async function obtenerMetodoEnvio(id) {
  const res = await fetch(`${API_BASE}/api/v1/metodos-envio/${id}`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    const error = await res.text().catch(() => "");
    throw new Error(error || "Error al obtener método de envío");
  }

  return res.json();
}
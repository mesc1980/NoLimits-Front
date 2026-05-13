// Ruta: src/services/estados.js

const API_BASE =
  import.meta.env.VITE_API_URL ||
  "https://nolimits-backend-final.onrender.com";

const API_URL = `${API_BASE}/api/v1/estados`;

// Helpers JWT
function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("nl_token") : null;
}
function authHeaders(extra = {}) {
  const token = getToken();
  return { ...extra, ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

export async function listarEstados(page = 1, search = "") {
  const params = new URLSearchParams({
    page,
    size: 4,
    search: search.trim(),
  });

  const res = await fetch(`${API_URL}/paginado?${params.toString()}`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Error cargando estados (${res.status}) ${txt}`);
  }

  return res.json();
}

export async function crearEstado(payload) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Error al crear estado (${res.status}) ${txt}`);
  }

  return res.json();
}

export async function editarEstado(id, payload) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Error al editar estado (${res.status}) ${txt}`);
  }

  return res.json();
}

export async function patchEstado(id, payloadParcial) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PATCH",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payloadParcial),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Error en patch estado (${res.status}) ${txt}`);
  }

  return res.json();
}

export async function eliminarEstado(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Error al eliminar estado (${res.status}) ${txt}`);
  }

  return true;
}

export async function obtenerEstado(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Error al obtener estado (${res.status}) ${txt}`);
  }

  return res.json();
}
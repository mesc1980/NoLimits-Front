// Ruta: src/services/generos.js

const API_BASE =
  import.meta.env.VITE_API_URL ||
  "https://nolimits-backend-final.onrender.com";

const API_URL = `${API_BASE}/api/v1/generos`;

// Helpers JWT
function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("nl_token") : null;
}
function authHeaders(extra = {}) {
  const token = getToken();
  return { ...extra, ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

export async function listarGeneros(page = 1, search = "") {
  const params = new URLSearchParams();
  params.append("page", page);
  params.append("size", 4);
  params.append("search", search.trim());

  const res = await fetch(`${API_URL}/paginado?${params.toString()}`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Error cargando géneros (${res.status}) ${txt}`);
  }

  return res.json();
}

export async function crearGenero(payload) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Error al crear género (${res.status}) ${txt}`);
  }

  return res.json();
}

export async function editarGenero(id, payload) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Error al editar género (${res.status}) ${txt}`);
  }

  return res.json();
}

export async function patchGenero(id, payloadParcial) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PATCH",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payloadParcial),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Error al aplicar patch (${res.status}) ${txt}`);
  }

  return res.json();
}

export async function eliminarGenero(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Error al eliminar género (${res.status}) ${txt}`);
  }

  return true;
}

export async function obtenerGenero(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Error al obtener género (${res.status}) ${txt}`);
  }

  return res.json();
}
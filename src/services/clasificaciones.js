// Ruta: src/services/clasificaciones.js

const API_BASE =
  import.meta.env.VITE_API_URL ||
  "https://nolimits-backend-final.onrender.com";

const API_URL = `${API_BASE}/api/v1/clasificaciones`;

// Helpers JWT
function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("nl_token") : null;
}
function authHeaders(extra = {}) {
  const token = getToken();
  return { ...extra, ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

export async function listarClasificaciones(page = 1, search = "") {
  const url = `${API_URL}/paginado?page=${page}&size=4&search=${encodeURIComponent(
    search.trim()
  )}`;

  const res = await fetch(url, { headers: authHeaders() });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    console.error("Error cargando clasificaciones:", res.status, txt);
    throw new Error(`Error cargando clasificaciones (${res.status}) ${txt}`);
  }

  return await res.json();
}

export async function crearClasificacion(payload) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    console.error("Error al crear clasificación:", res.status, txt);
    throw new Error(`Error al crear clasificación (${res.status}) ${txt}`);
  }

  return res.json();
}

export async function editarClasificacion(id, payload) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    console.error("Error al editar clasificación:", res.status, txt);
    throw new Error(`Error al editar clasificación (${res.status}) ${txt}`);
  }

  return res.json();
}

export async function patchClasificacion(id, payloadParcial) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PATCH",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payloadParcial),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    console.error("Error al aplicar patch clasificación:", res.status, txt);
    throw new Error(`Error al aplicar patch (${res.status}) ${txt}`);
  }

  return res.json();
}

export async function eliminarClasificacion(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    console.error("Error al eliminar clasificación:", res.status, txt);
    throw new Error(`Error al eliminar (${res.status}) ${txt}`);
  }

  return true;
}

export async function obtenerClasificacion(id) {
  const res = await fetch(`${API_URL}/${id}`, { headers: authHeaders() });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    console.error("Error al obtener clasificación:", res.status, txt);
    throw new Error(`Error al obtener clasificación (${res.status}) ${txt}`);
  }

  return res.json();
}
// Ruta: src/services/direcciones.js

const API_BASE =
  import.meta.env.VITE_API_URL ||
  "https://nolimits-backend-final.onrender.com";

const API_URL = `${API_BASE}/api/direcciones`;

// Helpers JWT
function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("nl_token") : null;
}
function authHeaders(extra = {}) {
  const token = getToken();
  return { ...extra, ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

export async function obtenerDireccion(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    headers: authHeaders(),
  });
  const text = await res.text();

  if (!res.ok) {
    console.error("[obtenerDireccion] status:", res.status, text);
    throw new Error(`Error obteniendo dirección (${res.status}) ${text}`);
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Respuesta inválida al obtener dirección");
  }
}

export async function crearDireccion(payload) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });

  const text = await res.text();

  if (!res.ok) {
    console.error("[crearDireccion] status:", res.status, text);
    throw new Error(`Error al crear dirección (${res.status}) ${text}`);
  }

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function actualizarDireccion(id, payload) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PATCH",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });

  const text = await res.text();

  if (!res.ok) {
    console.error("[actualizarDireccion] status:", res.status, text);
    throw new Error(`Error al actualizar dirección (${res.status}) ${text}`);
  }

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function listarDirecciones() {
  const res = await fetch(API_URL, { headers: authHeaders() });
  const text = await res.text();

  if (!res.ok) {
    throw new Error(`Error cargando direcciones (${res.status}) ${text}`);
  }

  try {
    return JSON.parse(text);
  } catch {
    return [];
  }
}

export async function eliminarDireccion(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  const text = await res.text().catch(() => "");

  if (!res.ok) {
    throw new Error(`Error al eliminar dirección (${res.status}) ${text}`);
  }

  return true;
}
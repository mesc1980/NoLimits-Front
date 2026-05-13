// Ruta: src/services/roles.js

const API_BASE =
  import.meta.env.VITE_API_URL ||
  "https://nolimits-backend-final.onrender.com";

const API_URL = `${API_BASE}/api/v1`; // <- ajusta si tu backend expone /roles en otra ruta

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

export async function listarRoles(page = 1, search = "") {
  const res = await fetch(
    `${API_URL}/roles?page=${page}&search=${encodeURIComponent(search)}`,
    { headers: authHeaders() }
  );

  if (!res.ok) throw new Error("Error cargando roles");
  return res.json();
}

export async function crearRole(payload) {
  const res = await fetch(`${API_URL}/roles`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.message || "Error al crear rol");
  }

  return res.json();
}

export async function editarRole(id, payload) {
  const res = await fetch(`${API_URL}/roles/${id}`, {
    method: "PUT",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.message || "Error al editar rol");
  }

  return res.json();
}

export async function patchRole(id, payloadParcial) {
  const res = await fetch(`${API_URL}/roles/${id}`, {
    method: "PATCH",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payloadParcial),
  });

  if (!res.ok) throw new Error("Error en PATCH rol");
  return res.json();
}

export async function eliminarRole(id) {
  const res = await fetch(`${API_URL}/roles/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  if (!res.ok) throw new Error("Error al eliminar rol");
  return true;
}

export async function obtenerRole(id) {
  const res = await fetch(`${API_URL}/roles/${id}`, {
    headers: authHeaders(),
  });

  if (!res.ok) throw new Error("Error al obtener rol");
  return res.json();
}

export async function fetchRoles() {
  const res = await fetch(`${API_URL}/roles`, {
    headers: authHeaders(),
  });

  if (!res.ok) throw new Error("Error al obtener lista de roles");
  return res.json();
}
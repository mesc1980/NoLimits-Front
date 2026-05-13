// Ruta: src/services/plataformas.js

const API_BASE =
  import.meta.env.VITE_API_URL ||
  "https://nolimits-backend-final.onrender.com";

const API_URL = `${API_BASE}/api/v1/plataformas`;

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

export async function listarPlataformas(page = 1, search = "") {
  const url = `${API_URL}/paginado?page=${page}&size=4`;

  const res = await fetch(url, { headers: authHeaders() });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    console.error("Error cargando plataformas:", res.status, txt);
    throw new Error("Error cargando plataformas");
  }

  const data = await res.json();

  if (!search || !search.trim()) return data;

  const needle = search.trim().toLowerCase();
  const filtrado = (data.contenido || []).filter((item) =>
    (item.nombre || "").toLowerCase().includes(needle)
  );

  return {
    contenido: filtrado,
    pagina: data.pagina,
    totalPaginas: data.totalPaginas,
    totalElementos: data.totalElementos,
  };
}

export async function crearPlataforma(payload) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.text().catch(() => "");
    console.error("Error al crear plataforma:", res.status, error);
    throw new Error("Error al crear plataforma");
  }

  return res.json();
}

export async function editarPlataforma(id, payload) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.text().catch(() => "");
    console.error("Error al editar plataforma:", res.status, error);
    throw new Error("Error al editar plataforma");
  }

  return res.json();
}

export async function patchPlataforma(id, payload) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PATCH",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.text().catch(() => "");
    console.error("Error al actualizar parcialmente:", res.status, error);
    throw new Error("Error al actualizar parcialmente");
  }

  return res.json();
}

export async function eliminarPlataforma(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  if (!res.ok) {
    const error = await res.text().catch(() => "");
    console.error("Error al eliminar plataforma:", res.status, error);
    throw new Error("Error al eliminar plataforma");
  }

  return true;
}

export async function obtenerPlataforma(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    const error = await res.text().catch(() => "");
    console.error("Error al obtener plataforma:", res.status, error);
    throw new Error("Error al obtener plataforma");
  }

  return res.json();
}
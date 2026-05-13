// Ruta: src/services/desarrolladores.js

const API_BASE =
  import.meta.env.VITE_API_URL ||
  "https://nolimits-backend-final.onrender.com";

const API_URL = `${API_BASE}/api/v1/desarrolladores`;

// Helpers JWT
function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("nl_token") : null;
}
function authHeaders(extra = {}) {
  const token = getToken();
  return { ...extra, ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

export async function listarDesarrolladores(page = 1, search = "") {
  const params = new URLSearchParams();
  params.append("page", page);
  params.append("size", 4);
  params.append("search", search.trim());

  const res = await fetch(`${API_URL}/paginado?${params.toString()}`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    console.error("[listarDesarrolladores] Error HTTP:", res.status, txt);
    throw new Error(`Error cargando desarrolladores (${res.status}) ${txt}`);
  }

  const data = await res.json();

  return {
    contenido: data.contenido || [],
    totalPaginas: data.totalPaginas || 1,
    pagina: data.pagina || page,
    totalElementos: data.totalElementos || 0,
  };
}

export async function crearDesarrollador(payload) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Error al crear desarrollador (${res.status}) ${txt}`);
  }

  return res.json();
}

export async function editarDesarrollador(id, payload) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Error al editar desarrollador (${res.status}) ${txt}`);
  }

  return res.json();
}

export async function patchDesarrollador(id, payload) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PATCH",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Error al actualizar desarrollador (${res.status}) ${txt}`);
  }

  return res.json();
}

export async function eliminarDesarrollador(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  const txt = await res.text().catch(() => "");

  if (!res.ok) {
    throw new Error(`Error al eliminar desarrollador (${res.status}) ${txt}`);
  }

  return true;
}

export async function obtenerDesarrollador(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    headers: authHeaders(),
  });

  const txt = await res.text().catch(() => "");

  if (!res.ok) {
    throw new Error(`Error al obtener desarrollador (${res.status}) ${txt}`);
  }

  return JSON.parse(txt);
}
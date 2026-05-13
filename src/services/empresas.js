// Ruta: src/services/empresas.js

const API_BASE =
  import.meta.env.VITE_API_URL ||
  "https://nolimits-backend-final.onrender.com";

const API_URL = `${API_BASE}/api/v1/empresas`;

// Helpers JWT
function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("nl_token") : null;
}
function authHeaders(extra = {}) {
  const token = getToken();
  return { ...extra, ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

export async function listarEmpresas(page = 1, search = "") {
  const url = `${API_URL}/paginado?page=${page}&size=4`;

  const res = await fetch(url, { headers: authHeaders() });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    console.error("Error cargando empresas:", res.status, txt);
    throw new Error(`Error cargando empresas (${res.status}) ${txt}`);
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

export async function crearEmpresa(payload) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    console.error("Error al crear empresa:", res.status, txt);
    throw new Error(`Error al crear empresa (${res.status}) ${txt}`);
  }

  return res.json();
}

export async function editarEmpresa(id, payload) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    console.error("Error al editar empresa:", res.status, txt);
    throw new Error(`Error al editar empresa (${res.status}) ${txt}`);
  }

  return res.json();
}

export async function patchEmpresa(id, payload) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PATCH",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    console.error("Error en PATCH empresa:", res.status, txt);
    throw new Error(`Error en PATCH empresa (${res.status}) ${txt}`);
  }

  return res.json();
}

export async function eliminarEmpresa(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    console.error("Error al eliminar empresa:", res.status, txt);
    throw new Error(`Error al eliminar empresa (${res.status}) ${txt}`);
  }

  return true;
}

export async function obtenerEmpresa(id) {
  const res = await fetch(`${API_URL}/${id}`, { headers: authHeaders() });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    console.error("Error al obtener empresa:", res.status, txt);
    throw new Error(`Error al obtener empresa (${res.status}) ${txt}`);
  }

  return res.json();
}
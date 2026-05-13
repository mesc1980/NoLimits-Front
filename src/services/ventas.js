// Ruta: src/services/ventas.js

// URL base de la API. Si existe VITE_API_URL en el entorno, se usa esa;
// de lo contrario, se usa directamente la URL del backend en Render.
const API_BASE =
  import.meta.env.VITE_API_URL ||
  "https://nolimits-backend-final.onrender.com/api";

/* =========================
   ADMIN / LISTADOS GENERALES
========================= */

// Lista todas las ventas para ser usadas en vistas de administración.
export async function listarVentas() {
  const res = await fetch(`${API_BASE}/v1/ventas`);
  if (!res.ok) throw new Error("Error al listar ventas");
  return res.json();
}

export async function listarVentasPaginado(page = 1, size = 4) {
  const res = await fetch(`${API_BASE}/v1/ventas/paginado?page=${page}&size=${size}`);

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    console.error("Error paginando ventas:", res.status, txt);
    throw new Error("Error al cargar ventas paginadas");
  }

  return res.json();
}

// Obtiene una venta específica por ID, incluyendo sus productos/detalles.
export async function obtenerVenta(id) {
  const res = await fetch(`${API_BASE}/v1/ventas/${id}`);
  if (!res.ok) throw new Error("Error al obtener venta");
  return res.json();
}

/* =========================
   FLUJO DE COMPRA REAL
========================= */

// Crea una venta real usando el endpoint /registrar.
// Usa HttpSession en el backend, por eso se manda la cookie con credentials: "include".
export async function crearVenta(payload) {
  const res = await fetch(`${API_BASE}/v1/ventas/registrar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // importante para que Spring use la sesión
    body: JSON.stringify(payload),
  });

  const text = await res.text();

  if (!res.ok) {
    console.error("[crearVenta] status:", res.status, text);
    throw new Error("Error al crear venta");
  }

  // Intentamos parsear la respuesta como JSON; si no se puede, devolvemos null.
  try {
    return JSON.parse(text);
  } catch {
    console.warn("[crearVenta] Respuesta no es JSON, devolviendo null:", text);
    return null;
  }
}

// Crea un detalle de venta directamente. Se deja como función opcional de apoyo.
export async function crearDetalleVenta(payload) {
  const res = await fetch(`${API_BASE}/v1/detalles-venta`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Error al crear detalle");
  return res.json();
}

/* =========================
   MIS COMPRAS (perfil usuario)
========================= */

// Obtiene las compras del usuario autenticado.
// 1) Pregunta al backend quién es el usuario actual.
// 2) Con ese ID, pide sus compras y normaliza la respuesta.
export async function obtenerMisCompras() {
  // 1) Preguntar al backend quién soy (usa la sesión)
  const resUser = await fetch(`${API_BASE}/v1/usuarios/me`, {
    method: "GET",
    credentials: "include",
  });

  const textUser = await resUser.text();
  if (!resUser.ok) {
    console.error("[/me] error:", resUser.status, textUser);
    throw new Error("Usuario no autenticado");
  }

  let usuario;
  try {
    usuario = JSON.parse(textUser);
  } catch {
    console.error("[/me] respuesta no es JSON:", textUser);
    throw new Error("Respuesta inválida del servidor (me)");
  }

  // 2) Pedir sus compras usando el ID del usuario.
  const resVentas = await fetch(
    `${API_BASE}/v1/usuarios/${usuario.id}/compras`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  const textVentas = await resVentas.text();
  if (!resVentas.ok) {
    console.error("[/compras] error:", resVentas.status, textVentas);
    throw new Error("Error al cargar compras");
  }

  let data;
  try {
    data = JSON.parse(textVentas);
  } catch {
    console.error("[/compras] no es JSON:", textVentas);
    throw new Error("Respuesta inválida del servidor (compras)");
  }

  console.log("MisCompras raw backend:", data);

  // Normalizamos la respuesta para dejar siempre un arreglo de compras.
  let compras = [];

  if (Array.isArray(data)) {
    compras = data;
  } else if (data && typeof data === "object") {
    if (Array.isArray(data.compras)) {
      compras = data.compras;
    } else if (data.compras && typeof data.compras === "object") {
      // Por si viene como objeto con claves numéricas.
      compras = Object.values(data.compras);
    } else if (Array.isArray(data.ventas)) {
      compras = data.ventas;
    } else if (data.ventas && typeof data.ventas === "object") {
      compras = Object.values(data.ventas);
    }
  }

  if (!Array.isArray(compras)) {
    console.warn("MisCompras: respuesta no es un array, usando []:", data);
    compras = [];
  }

  console.log("MisCompras data normalizada:", compras);
  return compras;
}

export async function obtenerMisComprasPaginado(page = 1, size = 5) {
  const res = await fetch(
    `${API_BASE}/v1/ventas/mis-compras/paginado?page=${page}&size=${size}`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  const text = await res.text();

  if (!res.ok) {
    console.error("[mis-compras/paginado] ERROR:", res.status, text);
    throw new Error("Error al cargar compras paginadas");
  }

  try {
    return JSON.parse(text);
  } catch {
    console.error("Respuesta NO JSON:", text);
    throw new Error("Respuesta inválida del servidor");
  }
}
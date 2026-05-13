export function cerrarSesion(redirectTo = "/principal") {
  // Limpieza correcta
  localStorage.removeItem("nl_auth");
  localStorage.removeItem("nl_user");
  localStorage.removeItem("nl_role");
  localStorage.removeItem("nl_token");

  // (por si quedaron cosas antiguas)
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");

  // Redirección
  window.location.href = redirectTo;
}
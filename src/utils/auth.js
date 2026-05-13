export function cerrarSesion(redirectTo = "/") {
  localStorage.removeItem("nl_auth");
  localStorage.removeItem("nl_user");
  localStorage.removeItem("nl_role");
  localStorage.removeItem("nl_token");
  localStorage.removeItem("nl_supabase_token");

  // por si hay basura antigua
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");

  window.location.href = redirectTo;
}
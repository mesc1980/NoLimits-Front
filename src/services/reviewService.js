const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export async function guardarReview(usuarioId, reviewData) {
  const token = localStorage.getItem("nl_token");

  const response = await fetch(`${BASE_URL}/api/v1/reviews/${usuarioId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(reviewData),
  });

  if (!response.ok) {
    throw new Error("No se pudo guardar la reseña");
  }

  return response.json();
}

export async function obtenerReviewsPorObra(obraId) {
  const response = await fetch(
    `${BASE_URL}/api/v1/reviews/obra/${encodeURIComponent(obraId)}`
  );

  if (!response.ok) {
    throw new Error("No se pudieron obtener las reseñas");
  }

  return response.json();
}

export async function eliminarReview(usuarioId, reviewId) {
  const token = localStorage.getItem("nl_token");

  const response = await fetch(
    `${BASE_URL}/api/v1/reviews/${usuarioId}/review/${reviewId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("No se pudo eliminar la reseña");
  }
}

export async function reaccionarReview(reviewId, usuarioId, tipoReaccion) {
  const token = localStorage.getItem("nl_token");

  const response = await fetch(
    `${BASE_URL}/api/v1/reviews/${reviewId}/reaction/${usuarioId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ tipoReaccion }),
    }
  );

  if (!response.ok) {
    throw new Error("No se pudo registrar la reacción");
  }
}
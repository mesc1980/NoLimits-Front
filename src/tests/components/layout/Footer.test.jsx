import { describe, test, beforeEach, afterEach, vi, assert } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Footer from "../../../components/layout/Footer";

vi.mock("../../../components/layout/Logo", () => ({
  default: () => <div>Logo NoLimits</div>,
}));

describe("Footer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function renderFooter() {
    return render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );
  }

  test("deberia mostrar logo, slogan y texto academico", () => {
    renderFooter();

    assert.ok(screen.getByText("Logo NoLimits"));
    assert.ok(screen.getByText("· Toda tu cultura, sin límites."));
    assert.ok(screen.getByText("Grupo 3 · TPY1101 · 2026 — Proyecto académico."));
  });

  test("deberia mostrar todas las fuentes de datos", () => {
    renderFooter();

    assert.ok(screen.getByText("Datos de:"));
    assert.ok(screen.getByText("TMDB API"));
    assert.ok(screen.getByText("Jikan / MAL"));
    assert.ok(screen.getByText("Google Books"));
    assert.ok(screen.getByText("IGDB"));
    assert.ok(screen.getByText("RAWG"));
    assert.ok(screen.getByText("MusicBrainz"));
  });

  test("deberia renderizar links externos con href correcto", () => {
    renderFooter();

    assert.equal(screen.getByText("TMDB API").getAttribute("href"), "https://www.themoviedb.org");
    assert.equal(screen.getByText("Jikan / MAL").getAttribute("href"), "https://jikan.moe");
    assert.equal(screen.getByText("Google Books").getAttribute("href"), "https://books.google.com");
    assert.equal(screen.getByText("IGDB").getAttribute("href"), "https://www.igdb.com");
    assert.equal(screen.getByText("RAWG").getAttribute("href"), "https://rawg.io");
    assert.equal(screen.getByText("MusicBrainz").getAttribute("href"), "https://musicbrainz.org");
  });

  test("deberia mostrar mensaje de agradecimiento", () => {
    renderFooter();

    assert.ok(
      screen.getByText(/Every line of code in NoLimits was built with passion/i)
    );

    assert.ok(
      screen.getByText(/Thank you for being part of the motivation/i)
    );

    assert.ok(screen.getByText("— With appreciation, NoLimits Team"));
  });

  test("deberia mostrar link de terminos y cambiar color con hover", () => {
    renderFooter();

    const termsLink = screen.getByText("Términos y condiciones");

    assert.equal(termsLink.getAttribute("href"), "/terms");

    fireEvent.mouseEnter(termsLink);
    assert.equal(termsLink.style.color, "var(--nl-text-secondary)");

    fireEvent.mouseLeave(termsLink);
    assert.equal(termsLink.style.color, "var(--nl-text-muted)");
  });
});
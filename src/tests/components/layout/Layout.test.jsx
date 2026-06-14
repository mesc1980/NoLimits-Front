import { describe, test, beforeEach, afterEach, vi, assert } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Layout from "../../../components/layout/Layout";
import useAppStore from "../../../store/useAppStore";

vi.mock("../../../components/layout/Header", () => ({
  default: () => <header>Header Mock</header>,
}));

vi.mock("../../../components/layout/Footer", () => ({
  default: () => <footer>Footer Mock</footer>,
}));

vi.mock("../../../components/ui/ChatBot", () => ({
  default: () => <div>ChatBot Mock</div>,
}));

describe("Layout", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    window.scrollTo = vi.fn();
    window.scrollBy = vi.fn();

    global.requestAnimationFrame = vi.fn(() => 1);
    global.cancelAnimationFrame = vi.fn();

    useAppStore.setState({
      user: null,
      myList: [],
      reviews: {},
      theme: "dark",
    });

    document.documentElement.classList.remove("light");
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    document.documentElement.classList.remove("light");
  });

  function renderLayout(initialPath = "/") {
    return render(
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="*" element={<Layout />}>
            <Route path="*" element={<div>Contenido página</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );
  }

  describe("renderizado", () => {
    test("deberia mostrar header, contenido, footer y chatbot", () => {
      renderLayout();

      assert.ok(screen.getByText("Header Mock"));
      assert.ok(screen.getByText("Contenido página"));
      assert.ok(screen.getByText("Footer Mock"));
      assert.ok(screen.getByText("ChatBot Mock"));
    });

    test("deberia hacer scroll al inicio al cargar ruta", () => {
      renderLayout("/detalle");

      assert.equal(window.scrollTo.mock.calls.length, 1);
      assert.deepEqual(window.scrollTo.mock.calls[0][0], {
        top: 0,
        behavior: "instant",
      });
    });
  });

  describe("tema", () => {
    test("deberia agregar clase light si theme es light", () => {
      useAppStore.setState({
        theme: "light",
      });

      renderLayout();

      assert.equal(document.documentElement.classList.contains("light"), true);
    });

    test("deberia remover clase light si theme es dark", () => {
      document.documentElement.classList.add("light");

      useAppStore.setState({
        theme: "dark",
      });

      renderLayout();

      assert.equal(document.documentElement.classList.contains("light"), false);
    });
  });
});
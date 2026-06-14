import { describe, test, beforeEach, afterEach, vi, assert } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Header from "../../../components/layout/Header";
import useAppStore from "../../../store/useAppStore";

const navigateMock = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");

  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock("../../../components/layout/Logo", () => ({
  default: () => <div>Logo NoLimits</div>,
}));

vi.mock("../../../components/ui/SearchBar", () => ({
  default: () => <div>SearchBar Compacta</div>,
}));

describe("Header", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    useAppStore.setState({
      user: null,
      myList: [],
      reviews: {},
      theme: "dark",
      clearUser: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function renderHeader() {
    return render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
  }

  describe("renderizado", () => {
    test("deberia mostrar logo y enlaces principales", () => {
      renderHeader();

      assert.ok(screen.getByText("Logo NoLimits"));
      assert.ok(screen.getByText("Descubrir"));
      assert.ok(screen.getByText("Sagas"));
      assert.ok(screen.getByText("Mi biblioteca"));
      assert.ok(screen.getByText("Login"));
    });

    test("deberia navegar al login si usuario no esta autenticado", () => {
      renderHeader();

      fireEvent.click(screen.getByLabelText("Iniciar sesión"));

      assert.equal(navigateMock.mock.calls[0][0], "/login");
    });
  });

  describe("busqueda", () => {
    test("deberia abrir y cerrar busqueda al presionar boton", () => {
      renderHeader();

      fireEvent.click(screen.getByLabelText("Abrir búsqueda"));

      assert.ok(screen.getByText("SearchBar Compacta"));
      assert.ok(screen.getByLabelText("Cerrar búsqueda"));

      fireEvent.click(screen.getByLabelText("Cerrar búsqueda"));

      assert.equal(screen.queryByText("SearchBar Compacta"), null);
      assert.ok(screen.getByLabelText("Abrir búsqueda"));
    });

    test("deberia cerrar busqueda al hacer click fuera", () => {
      renderHeader();

      fireEvent.click(screen.getByLabelText("Abrir búsqueda"));

      assert.ok(screen.getByText("SearchBar Compacta"));

      fireEvent.mouseDown(document.body);

      assert.equal(screen.queryByText("SearchBar Compacta"), null);
    });
  });

  describe("usuario autenticado", () => {
    test("deberia mostrar perfil, salir y contador de biblioteca", () => {
      useAppStore.setState({
        user: {
          id: 1,
          name: "Usuario Demo",
          email: "usuario.demo@test.com",
        },
        myList: [
          { id: "obra-1", title: "Obra 1" },
          { id: "obra-2", title: "Obra 2" },
        ],
        clearUser: vi.fn(),
      });

      renderHeader();

      assert.ok(screen.getByText("Mi Perfil"));
      assert.ok(screen.getByText("Salir"));
      assert.ok(screen.getByText("2"));
    });

    test("deberia navegar al perfil al presionar Mi Perfil", () => {
      useAppStore.setState({
        user: {
          id: 1,
          name: "Usuario Demo",
          email: "usuario.demo@test.com",
        },
        myList: [],
        clearUser: vi.fn(),
      });

      renderHeader();

      fireEvent.click(screen.getByLabelText("Mi perfil"));

      assert.equal(navigateMock.mock.calls[0][0], "/profile");
    });

    test("deberia cerrar sesion y navegar al home", () => {
      const clearUserMock = vi.fn();

      localStorage.setItem("nl_token", "token-demo");
      localStorage.setItem("nl_user", "usuario");

      useAppStore.setState({
        user: {
          id: 1,
          name: "Usuario Demo",
          email: "usuario.demo@test.com",
        },
        myList: [],
        clearUser: clearUserMock,
      });

      renderHeader();

      fireEvent.click(screen.getByLabelText("Cerrar sesión"));

      assert.equal(clearUserMock.mock.calls.length, 1);
      assert.equal(localStorage.getItem("nl_token"), null);
      assert.equal(localStorage.getItem("nl_user"), null);
      assert.equal(navigateMock.mock.calls[0][0], "/");
    });
  });
});
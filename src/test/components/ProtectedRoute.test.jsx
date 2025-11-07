import { render, screen } from "@testing-library/react"; 
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ProtectedRoute from "../../components/ProtectedRoute";

// 🧱 MOCK del store de Zustand
vi.mock("../../stores/authStore", () => ({
  __esModule: true,
  default: vi.fn(),
}));

import useAuthStore from "../../stores/authStore";

// ⚙️ Función auxiliar para simular el estado del store
const mockUseAuthStore = (mockState) => {
  useAuthStore.mockImplementation((selector) => selector(mockState));
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("🛡️ ProtectedRoute", () => {
  it("muestra spinner mientras isLoading es true", () => {
    mockUseAuthStore({
      isLoading: true,
      token: null,
      user: null,
      logout: vi.fn(),
    });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <p>Contenido Privado</p>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Cargando...")).toBeInTheDocument();
  });

  it("redirige a /login si no hay token", () => {
    mockUseAuthStore({
      isLoading: false,
      token: null,
      user: null,
      logout: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={["/privado"]}>
        <Routes>
          <Route
            path="/privado"
            element={
              <ProtectedRoute>
                <p>Contenido Privado</p>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<p>Página de Login</p>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Página de Login")).toBeInTheDocument();
  });

  it("llama logout y redirige si el token está expirado", () => {
    const mockLogout = vi.fn();

    mockUseAuthStore({
      isLoading: false,
      token: "fake-token",
      user: { exp: Math.floor(Date.now() / 1000) - 10 },
      logout: mockLogout,
    });

    render(
      <MemoryRouter initialEntries={["/privado"]}>
        <Routes>
          <Route
            path="/privado"
            element={
              <ProtectedRoute>
                <p>Contenido Privado</p>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<p>Página de Login</p>} />
        </Routes>
      </MemoryRouter>
    );

    expect(mockLogout).toHaveBeenCalled();
    expect(screen.getByText("Página de Login")).toBeInTheDocument();
  });

  it("muestra mensaje de acceso denegado si el rol no está permitido", () => {
    mockUseAuthStore({
      isLoading: false,
      token: "fake-token",
      user: { roleId: 3 },
      logout: vi.fn(),
    });

    render(
      <MemoryRouter>
        <ProtectedRoute allowedRoles={["admin", "manager"]}>
          <p>Contenido Privado</p>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText("Acceso denegado")).toBeInTheDocument();
  });

  it("renderiza contenido si el usuario tiene rol permitido", () => {
    mockUseAuthStore({
      isLoading: false,
      token: "fake-token",
      user: { roleId: 1 },
      logout: vi.fn(),
    });

    render(
      <MemoryRouter>
        <ProtectedRoute allowedRoles={["admin"]}>
          <p>Contenido Privado</p>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText("Contenido Privado")).toBeInTheDocument();
  });
});

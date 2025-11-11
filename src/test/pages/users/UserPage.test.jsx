// src/test/pages/users/UserPage.test.jsx

import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import UserPage from "../../../pages/users/UserPage";

// ============================================
// MOCKS DE DEPENDENCIAS EXTERNAS
// ============================================
/**
 * - Aislamos UserPage de sus dependencias (stores, componentes hijos)
 * - Controlamos el comportamiento durante el test
 * - Evitamos llamadas reales a la API
 */

// Mock de react-hot-toast
vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
  },
}));

// Mock de authStore (para simular el usuario autenticado)
vi.mock("../../../stores/authStore", () => ({
  __esModule: true,
  default: vi.fn(),
}));

// Mock de useVacationStore (para simular las solicitudes)
vi.mock("../../../stores/useVacationStore", () => ({
  __esModule: true,
  default: vi.fn(),
}));

// Mock de VacationRequestCalendar (componente hijo)
/**
 * Este componente se mockea porque tendrá su propio test y aquí solo nos interesa verificar que se renderiza.
 */
vi.mock("../../../components/vacation/VacationRequestCalendar", () => ({
  __esModule: true,
  default: ({ onRequestCreated, onSelectionChange }) => (
    <div data-testid="vacation-calendar">
      <p>Calendario de Vacaciones</p>
      {/* Simulamos los callbacks que recibe el componente */}
      <button onClick={onRequestCreated}>Simular Request Created</button>
      <button
        onClick={() =>
          onSelectionChange({
            start: new Date("2025-01-15"),
            end: new Date("2025-01-20"),
            workingDays: 5,
          })
        }
      >
        Simular Selection
      </button>
      <button onClick={() => onSelectionChange(null)}>
        Limpiar Selection
      </button>
    </div>
  ),
  // También exportamos RequestSummaryForm como named export
  RequestSummaryForm: ({ selectedRange, onClearSelection }) => (
    <div data-testid="request-summary-form">
      <p>Formulario de Resumen</p>
      <p>Días: {selectedRange?.workingDays || 0}</p>
      <button onClick={onClearSelection}>Cancelar</button>
    </div>
  ),
}));

// Mock de VacationSummaryCards (componente hijo)
vi.mock("../../../components/vacation/VacationSummaryCard", () => ({
  __esModule: true,
  default: () => (
    <div data-testid="vacation-summary">
      <p>Balance de Vacaciones</p>
      <p>Total: 22 días</p>
      <p>Disponibles: 15 días</p>
      <p>Usados: 7 días</p>
    </div>
  ),
}));

// Mock de MyRequestsTabs (componente hijo)
vi.mock("../../../components/vacation/MyRequestsTabs", () => ({
  __esModule: true,
  default: () => (
    <div data-testid="my-requests-tabs">
      <p>Mis Solicitudes</p>
      <div>
        <button>Pendientes (2)</button>
        <button>Aprobadas (5)</button>
        <button>Denegadas (1)</button>
      </div>
    </div>
  ),
}));

// ============================================
// IMPORTS DESPUÉS DE LOS MOCKS
// ============================================
import useAuthStore from "../../../stores/authStore";
import useVacationStore from "../../../stores/useVacationStore";

// ============================================
// DATOS DE PRUEBA (MOCK DATA)
// ============================================

/**
 * Datos simulados que usaremos en los tests
 */
const mockUser = {
  id: 1,
  firstName: "Pepa",
  roleId: 3, // 3 = employee
  departmentId: 1,
};

const mockMyRequests = [
  {
    id: 1,
    startDate: "2025-01-15",
    endDate: "2025-01-20",
    requestedDays: 5,
    status: "pending",
    createdAt: "2025-01-10",
  },
  {
    id: 2,
    startDate: "2025-02-10",
    endDate: "2025-02-15",
    requestedDays: 5,
    status: "approved",
    createdAt: "2025-01-05",
  },
];

const mockStats = {
  total: 22,
  available: 15,
  used: 7,
  pending: 5,
};

// ============================================
// FUNCIÓN AUXILIAR PARA CONFIGURAR MOCKS
// ============================================

/**
 * Configura el estado de los stores mockeadosy centralizamos la configuración de los mocks
 */

const setupMocks = ({
  user = mockUser,
  myRequests = mockMyRequests,
  stats = mockStats,
  loading = false,
} = {}) => {
  // Mock de authStore
  useAuthStore.mockImplementation((selector) =>
    selector({
      user,
    })
  );

  // Mock de useVacationStore
  useVacationStore.mockImplementation((selector) =>
    selector({
      myRequests,
      stats,
      loading,
      fetchMyRequests: vi.fn(),
    })
  );
};

// ============================================
// LIMPIEZA ANTES DE CADA TEST
// ============================================

beforeEach(() => {
  vi.clearAllMocks(); // Limpia todos los mocks
  setupMocks(); // Configura los mocks con valores por defecto
});

// ============================================
// SUITE DE TESTS
// ============================================

describe("UserPage", () => {
  
  // ==========================================
  // TEST 1: RENDERIZADO BÁSICO
  // ==========================================
  
  /**
   * ¿Qué estamos testeando?
   * -----------------------
   * - Que la página se renderiza sin errores
   * - Que muestra el título principal
   * - Que muestra el texto descriptivo
   */
  it("renderiza correctamente el título y la descripción", () => {
    render(
      <MemoryRouter>
        <UserPage />
      </MemoryRouter>
    );

    // Verificamos el título con el nombre del usuario
    expect(screen.getByText(/Bienvenido <Pepa>/i)).toBeInTheDocument();
    
    // Verificamos el texto descriptivo
    expect(
      screen.getByText(/Gestiona tus vacaciones y consulta el estado/i)
    ).toBeInTheDocument();
  });

  // ==========================================
  // TEST 2: NOMBRE DEL USUARIO
  // ==========================================
  
  /**
   * ¿Qué estamos testeando?
   * -----------------------
   * - Que el componente lee correctamente el nombre del authStore
   * - Que muestra "Usuario" si no hay firstName
   */
  it("muestra el nombre del usuario desde authStore", () => {
    render(
      <MemoryRouter>
        <UserPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Bienvenido Pepa/i)).toBeInTheDocument();
  });

  it("muestra 'Usuario' si no hay firstName en authStore", () => {
    // Sobrescribimos el mock para este test específico
    setupMocks({ user: { ...mockUser, firstName: null } });

    render(
      <MemoryRouter>
        <UserPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Bienvenido Usuario/i)).toBeInTheDocument();
  });

  // ==========================================
  // TEST 3: COMPONENTES PRINCIPALES
  // ==========================================
  
  /**
   * ¿Qué estamos testeando?
   * -----------------------
   * - Que se renderizan los 3 componentes principales
   * - VacationRequestCalendar (calendario)
   * - VacationSummaryCards (balance)
   * - MyRequestsTabs (listado de solicitudes)
   */
  it("renderiza los 3 componentes principales", () => {
    render(
      <MemoryRouter>
        <UserPage />
      </MemoryRouter>
    );

    // 1. Calendario de solicitudes
    expect(screen.getByTestId("vacation-calendar")).toBeInTheDocument();
    expect(screen.getByText("Calendario de Vacaciones")).toBeInTheDocument();

    // 2. Balance de vacaciones (sidebar)
    expect(screen.getByTestId("vacation-summary")).toBeInTheDocument();
    expect(screen.getByText("Balance de Vacaciones")).toBeInTheDocument();

    // 3. Tabs con solicitudes
    expect(screen.getByTestId("my-requests-tabs")).toBeInTheDocument();
    expect(screen.getByText("Mis Solicitudes")).toBeInTheDocument();
  });

  // ==========================================
  // TEST 4: LLAMADA A fetchMyRequests
  // ==========================================
  
  /**
   * ¿Qué estamos testeando?
   * -----------------------
   * - Que al montarse el componente llama a fetchMyRequests
   * - Que carga las solicitudes del usuario autenticado
   */
  it("llama a fetchMyRequests al montarse el componente", async () => {
    const mockFetchMyRequests = vi.fn();

    useVacationStore.mockImplementation((selector) =>
      selector({
        myRequests: mockMyRequests,
        stats: mockStats,
        loading: false,
        fetchMyRequests: mockFetchMyRequests,
      })
    );

    render(
      <MemoryRouter>
        <UserPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockFetchMyRequests).toHaveBeenCalledTimes(1);
    });
  });

  // ==========================================
  // TEST 5: CAMBIO DE SIDEBAR (SELECCIÓN)
  // ==========================================
  
  /**
   * ¿Qué estamos testeando?
   * -----------------------
   * - Que inicialmente se muestra VacationSummaryCards
   * - Que al seleccionar fechas en el calendario, cambia a RequestSummaryForm
   * - Que al limpiar la selección, vuelve a mostrar VacationSummaryCards
   * 
   * IMPORTANTE: Esto solo se ve en desktop (lg:block)
   */
  it("muestra VacationSummaryCards cuando no hay selección", () => {
    render(
      <MemoryRouter>
        <UserPage />
      </MemoryRouter>
    );

    // Verificamos que está el balance de vacaciones
    expect(screen.getByTestId("vacation-summary")).toBeInTheDocument();
    
    // Verificamos que NO está el formulario de resumen
    expect(
      screen.queryByTestId("request-summary-form")
    ).not.toBeInTheDocument();
  });

  it("muestra RequestSummaryForm cuando hay selección de fechas", async () => {
    render(
      <MemoryRouter>
        <UserPage />
      </MemoryRouter>
    );

    // Simulamos que el usuario selecciona fechas en el calendario
    const selectButton = screen.getByText("Simular Selection");
    selectButton.click();

    // Esperamos a que cambie el estado
    await waitFor(() => {
      expect(screen.getByTestId("request-summary-form")).toBeInTheDocument();
    });

    // Verificamos que ya NO está el balance de vacaciones
    expect(screen.queryByTestId("vacation-summary")).not.toBeInTheDocument();
  });

  it("vuelve a mostrar VacationSummaryCards al limpiar la selección", async () => {
    render(
      <MemoryRouter>
        <UserPage />
      </MemoryRouter>
    );

    // 1. Seleccionamos fechas
    const selectButton = screen.getByText("Simular Selection");
    selectButton.click();

    await waitFor(() => {
      expect(screen.getByTestId("request-summary-form")).toBeInTheDocument();
    });

    // 2. Limpiamos la selección
    const clearButton = screen.getByText("Limpiar Selection");
    clearButton.click();

    // 3. Verificamos que vuelve a aparecer el balance
    await waitFor(() => {
      expect(screen.getByTestId("vacation-summary")).toBeInTheDocument();
    });

    expect(
      screen.queryByTestId("request-summary-form")
    ).not.toBeInTheDocument();
  });

  // ==========================================
  // TEST 6: CALLBACK onRequestCreated
  // ==========================================
  
  /**
   * ¿Qué estamos testeando?
   * -----------------------
   * - Que cuando se crea una solicitud, vuelve a cargar las solicitudes
   * - Que el callback fetchMyRequests se ejecuta
   */
  it("llama a fetchMyRequests cuando se crea una solicitud", async () => {
    const mockFetchMyRequests = vi.fn();

    useVacationStore.mockImplementation((selector) =>
      selector({
        myRequests: mockMyRequests,
        stats: mockStats,
        loading: false,
        fetchMyRequests: mockFetchMyRequests,
      })
    );

    render(
      <MemoryRouter>
        <UserPage />
      </MemoryRouter>
    );

    // Limpiamos las llamadas previas del useEffect
    mockFetchMyRequests.mockClear();

    // Simulamos que se creó una solicitud
    const createButton = screen.getByText("Simular Request Created");
    createButton.click();

    // Verificamos que se llamó a fetchMyRequests
    await waitFor(() => {
      expect(mockFetchMyRequests).toHaveBeenCalledTimes(1);
    });
  });

  // ==========================================
  // TEST 7: RESPONSIVE DESIGN
  // ==========================================
  
  /**
   * ¿Qué estamos testeando?
   * -----------------------
   * - Que la página tiene clases responsive
   * - Grid de 1 columna en mobile
   * - Grid de 3 columnas en desktop (lg:grid-cols-3)
   */
  it("usa clases responsive correctas", () => {
    const { container } = render(
      <MemoryRouter>
        <UserPage />
      </MemoryRouter>
    );

    // Buscamos el grid principal
    const gridElement = container.querySelector(".grid");
    
    expect(gridElement).toHaveClass("grid-cols-1");
    expect(gridElement).toHaveClass("lg:grid-cols-3");
  });

  // ==========================================
  // TEST 8: ESTRUCTURA DEL DOM
  // ==========================================
  
  /**
   * ¿Qué estamos testeando?
   * -----------------------
   * - Que la estructura del HTML es correcta
   * - Que tiene el contenedor principal con max-w-7xl
   */
  it("tiene la estructura correcta del contenedor principal", () => {
    const { container } = render(
      <MemoryRouter>
        <UserPage />
      </MemoryRouter>
    );

    // Verificamos el contenedor principal
    const mainContainer = container.querySelector(".max-w-7xl");
    expect(mainContainer).toBeInTheDocument();
    expect(mainContainer).toHaveClass("mx-auto");
    expect(mainContainer).toHaveClass("space-y-6");
  });
});


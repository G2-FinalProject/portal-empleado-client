import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import EmployeeListPage from "../../../pages/employeeManagement/EmployeeListPage";

// 🧱 MOCK de los stores
vi.mock("../../../stores/useAdminStore", () => ({
  __esModule: true,
  default: vi.fn(),
}));

vi.mock("../../../stores/authStore", () => ({
  __esModule: true,
  default: vi.fn(),
}));

import useAdminStore from "../../../stores/useAdminStore";
import useAuthStore from "../../../stores/authStore";

// 🧩 Datos simulados
const mockUsers = [
  {
    id: 1,
    first_name: "Lisi",
    last_name: "Cruz",
    email: "lisi@example.com",
    available_days: 20,
    department_id: 1,
    role: { role_name: "admin" },
    location: { location_name: "Madrid" },
  },
  {
    id: 2,
    first_name: "Nicole",
    last_name: "Ramos",
    email: "nicole@example.com",
    available_days: 18,
    department_id: 2,
    role: { role_name: "employee" },
    location: { location_name: "Barcelona" },
  },
];

const mockDepartments = [
  { id: 1, department_name: "Desarrollo" },
  { id: 2, department_name: "Recursos Humanos" },
];

// Reutilizamos siempre las mismas referencias
const fetchUsers = vi.fn();
const fetchDepartments = vi.fn();
const deleteUser = vi.fn();

const mockUseAdminStore = (state = {}) => {
  useAdminStore.mockImplementation((selector) =>
    selector({
      users: mockUsers,
      departments: mockDepartments,
      fetchUsers,
      fetchDepartments,
      deleteUser,
      loading: {},
      error: null,
      ...state,
    })
  );
};

beforeEach(() => {
  vi.clearAllMocks();
  useAuthStore.mockImplementation(() => ({
    user: { id: 1, roleId: 1, departmentId: 1 },
    isAdmin: () => true,
    isManager: () => false,
  }));
});

// 🧩 TESTS
describe("📋 EmployeeListPage", () => {
  it("renderiza el título y el botón de Nuevo Empleado", () => {
    mockUseAdminStore({});
    render(
      <MemoryRouter>
        <EmployeeListPage />
      </MemoryRouter>
    );

    expect(screen.getByText("Gestión de Empleados")).toBeInTheDocument();
    expect(screen.getByText("Nuevo Empleado")).toBeInTheDocument();
  });

  it("llama a fetchUsers y fetchDepartments al montar", () => {
    const fetchUsers = vi.fn();
    const fetchDepartments = vi.fn();

    mockUseAdminStore({ fetchUsers, fetchDepartments });

    render(
      <MemoryRouter>
        <EmployeeListPage />
      </MemoryRouter>
    );

    expect(fetchUsers).toHaveBeenCalled();
    expect(fetchDepartments).toHaveBeenCalled();
  });

  it("muestra spinner cuando loading.users es true", () => {
    mockUseAdminStore({ loading: { users: true } });

    render(
      <MemoryRouter>
        <EmployeeListPage />
      </MemoryRouter>
    );

    const spinners = screen.getAllByRole("status", { hidden: true });
    expect(spinners.length).toBeGreaterThan(0);
  });

  it("muestra los empleados en la tabla", async () => {
    mockUseAdminStore({});

    render(
      <MemoryRouter>
        <EmployeeListPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      const items = screen.getAllByText("Lisi Cruz");
      expect(items.length).toBeGreaterThan(0);
    });
  });

  it("filtra los empleados por nombre", async () => {
    mockUseAdminStore({});

    render(
      <MemoryRouter>
        <EmployeeListPage />
      </MemoryRouter>
    );

    // Encuentra el input visible (mobile/desktop)
    const inputs = screen.getAllByRole("textbox", { name: /buscar empleado/i });
    const visibleInput = inputs.find((el) => el.offsetParent !== null) ?? inputs[0];

    // Simulamos escribir el nombre
    fireEvent.change(visibleInput, { target: { value: "Lisi" } });

    // ✅ SOLUCIÓN: Buscar solo en la tabla visible
    await waitFor(() => {
      const tables = screen.getAllByRole("table");
      const visibleTable = tables.find((t) => !t.className.includes('hidden')) ?? tables[0];
      
      // Verificar que Lisi aparece
      const lisiMatches = within(visibleTable).getAllByText(/lisi\s+cruz/i);
      expect(lisiMatches.length).toBeGreaterThan(0);
      
      // ✅ Verificar que Nicole NO aparece EN LA TABLA VISIBLE
      const nicoleInTable = within(visibleTable).queryAllByText(/nicole/i);
      expect(nicoleInTable.length).toBe(0);
    });
  });
});
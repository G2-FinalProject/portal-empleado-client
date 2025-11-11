import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, vi, beforeEach, afterEach, expect } from "vitest";
import CreateEmployeePage from "../../../pages/employeeManagement/CreateEmployeePage";

// 🧱 Mocks de dependencias
vi.mock("../../../utils/notifications", () => ({
  showSuccess: vi.fn(),
  showError: vi.fn(),
  showInfo: vi.fn(),
  showLoading: vi.fn(),
  dismiss: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../../../stores/useAdminStore", () => ({
  __esModule: true,
  default: vi.fn(),
}));

vi.mock("../../../components/form/EmployeeForm", () => ({
  __esModule: true,
  default: ({ onSubmit, onCancel }) => (
    <div>
      <p>Formulario simulado</p>
      <button
        data-testid="mock-create-btn"
        onClick={() => onSubmit({ first_name: "Lisi" })}
      >
        Crear
      </button>
      <button data-testid="mock-cancel-btn" onClick={onCancel}>
        Cancelar
      </button>
    </div>
  ),
}));

import useAdminStore from "../../../stores/useAdminStore";
import { showSuccess, showError } from "../../../utils/notifications";

describe("🧩 CreateEmployeePage", () => {
  const fetchRoles = vi.fn();
  const fetchDepartments = vi.fn();
  const fetchLocations = vi.fn();
  const createUser = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    cleanup(); // 🧽 limpia el DOM antes de cada test

    useAdminStore.mockReturnValue({
      roles: [{ id: 1, role_name: "Admin" }],
      departments: [{ id: 1, department_name: "Desarrollo" }],
      locations: [{ id: 1, location_name: "Madrid" }],
      fetchRoles,
      fetchDepartments,
      fetchLocations,
      createUser,
    });
  });

  afterEach(() => cleanup()); // 🧼 asegura que no queden residuos tras cada test

  it("renderiza correctamente el título y el formulario", () => {
    render(
      <MemoryRouter>
        <CreateEmployeePage />
      </MemoryRouter>
    );

    expect(screen.getByText("Alta de Nuevo Empleado")).toBeInTheDocument();
    expect(screen.getByText("Formulario simulado")).toBeInTheDocument();
  });

  it("llama a fetchRoles, fetchDepartments y fetchLocations al montar", () => {
    render(
      <MemoryRouter>
        <CreateEmployeePage />
      </MemoryRouter>
    );

    expect(fetchRoles).toHaveBeenCalled();
    expect(fetchDepartments).toHaveBeenCalled();
    expect(fetchLocations).toHaveBeenCalled();
  });

  it("crea un empleado correctamente y muestra el toast de éxito", async () => {
    createUser.mockResolvedValueOnce({});

    render(
      <MemoryRouter>
        <CreateEmployeePage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getAllByTestId("mock-create-btn")[0]); // 👈 usa el primero

    await waitFor(() => {
      expect(createUser).toHaveBeenCalledWith({ first_name: "Lisi" });
      expect(showSuccess).toHaveBeenCalledWith("Empleado creado correctamente");
      expect(mockNavigate).toHaveBeenCalledWith("/employees");
    });
  });

  it("muestra toast de error si createUser lanza una excepción", async () => {
    createUser.mockRejectedValueOnce({
      response: { data: { message: "Error de servidor" } },
    });

    render(
      <MemoryRouter>
        <CreateEmployeePage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getAllByTestId("mock-create-btn")[0]);

    await waitFor(() => {
      expect(showError).toHaveBeenCalledWith("Error de servidor");
    });
  });
});

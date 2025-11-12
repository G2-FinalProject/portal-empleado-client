import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import EmployeeForm from "../../components/form/EmployeeForm";

// Mock de dependencias externas
vi.mock("react-hot-toast", () => ({
  toast: {
    error: vi.fn(),
  },
}));

vi.mock("../../components/ui/Card", () => ({
  default: ({ children }) => <div data-testid="card">{children}</div>,
}));

vi.mock("../../components/ui/Input", () => ({
  default: ({ label, name, placeholder, register = () => ({}), errors, type = "text" }) => (
    <div>
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        {...register(name)}   
        placeholder={placeholder}
        type={type}
      />
      {errors?.[name] && <p>{errors[name].message}</p>}
    </div>
  ),
}));


describe("🧾 EmployeeForm", () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  const mockProps = {
    roles: [{ id: 1, role_name: "employee" }],
    departments: [{ id: 1, department_name: "Sistemas" }],
    locations: [{ id: 1, location_name: "Madrid" }],
    onSubmit: mockOnSubmit,
    onCancel: mockOnCancel,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renderiza todos los campos principales", () => {
    render(<EmployeeForm {...mockProps} />);

    expect(screen.getByLabelText("Nombre")).toBeInTheDocument();
    expect(screen.getByLabelText("Apellidos")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Contraseña")).toBeInTheDocument();
    expect(screen.getByLabelText("Días de Vacaciones Disponibles")).toBeInTheDocument();
  });

  test("envía el formulario correctamente y llama a onSubmit", async () => {
  render(<EmployeeForm {...mockProps} />);

  fireEvent.change(screen.getByPlaceholderText("Introduce el nombre"), {
    target: { value: "Lisi" },
  });
  fireEvent.change(screen.getByPlaceholderText("Introduce los apellidos"), {
    target: { value: "Cruz" },
  });
  fireEvent.change(screen.getByPlaceholderText("correo@cohispania.com"), {
    target: { value: "lisi@test.com" },
  });
  fireEvent.change(screen.getByPlaceholderText("*Mínimo 8 caracteres*"), {
    target: { value: "password123" },
  });
  fireEvent.change(screen.getByPlaceholderText("Introduce los días disponibles. Ej: 23"), {
    target: { value: 15 },
  });

  fireEvent.change(screen.getByDisplayValue("Selecciona un rol"), {
    target: { value: "1" },
  });
  fireEvent.change(screen.getByDisplayValue("Selecciona departamento"), {
    target: { value: "1" },
  });
  fireEvent.change(screen.getByDisplayValue("Selecciona una localización"), {
    target: { value: "1" },
  });

  fireEvent.submit(screen.getByRole("button", { name: /guardar empleado/i }));

  await waitFor(() => {
    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
  });
});


  test("muestra errores si faltan campos requeridos", async () => {
    render(<EmployeeForm {...mockProps} />);

    fireEvent.submit(screen.getByRole("button", { name: /guardar empleado/i }));

    await waitFor(() => {
      expect(screen.getByText(/Selecciona un rol/i)).toBeInTheDocument();
    });

  });

  test("llama a onCancel cuando se presiona el botón cancelar", async () => {
    render(<EmployeeForm {...mockProps} />);

    fireEvent.click(screen.getByRole("button", { name: /cancelar/i }));

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  test("oculta el campo de contraseña en modo edición", () => {
    render(<EmployeeForm {...mockProps} isEditMode={true} />);

    const passwordField = screen.queryByLabelText("Contraseña");
    expect(passwordField).not.toBeInTheDocument();
  });
});

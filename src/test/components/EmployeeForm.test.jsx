import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { toast } from "react-hot-toast";
import EmployeeForm from "../../components/form/EmployeeForm";

// 🧩 Mock de dependencias externas
vi.mock("react-hot-toast", () => ({
  toast: {
    error: vi.fn(),
  },
}));

vi.mock("../../components/ui/Card", () => ({
  default: ({ children }) => <div data-testid="card">{children}</div>,
}));

vi.mock("../../components/ui/Input", () => ({
  default: ({ label, name, placeholder, register, errors, type = "text" }) => (
    <div>
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        placeholder={placeholder}
        type={type}
        onChange={() => {}}
      />
      {errors?.[name] && <p>{errors[name].message}</p>}
    </div>
  ),
}));

vi.mock("../../components/ui/Button", () => ({
  default: ({ children, ...props }) => (
    <button {...props}>{children}</button>
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

    fireEvent.change(screen.getByPlaceholderText("Introduce el nombre del empleado"), {
      target: { value: "Lisi" },
    });
    fireEvent.change(screen.getByPlaceholderText("Introduce los apellidos del empleado"), {
      target: { value: "Cruz" },
    });
    fireEvent.change(screen.getByPlaceholderText("Introduce el correo corporativo"), {
      target: { value: "lisi@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("********"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByPlaceholderText("Introduce los días disponibles"), {
      target: { value: 15 },
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
      expect(toast.error).toHaveBeenCalled();
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

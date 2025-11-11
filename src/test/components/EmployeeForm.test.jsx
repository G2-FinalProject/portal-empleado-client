import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { toast } from "react-hot-toast";
import EmployeeForm from "../../components/form/EmployeeForm";

// ✅ Mock de react-hook-form con setValue incluido
vi.mock("react-hook-form", async () => {
  const actual = await vi.importActual("react-hook-form");
  return {
    ...actual,
    useForm: () => ({
      register: vi.fn(),
      handleSubmit: (fn) => (e) => fn(e),
      formState: { errors: {}, isSubmitting: false },
      reset: vi.fn(),
      setValue: vi.fn(), // 🧩 simulamos que existe
    }),
  };
});

// 🔧 Mock del toast
vi.mock("react-hot-toast", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// 🔧 Mock del Button
vi.mock("../../components/ui/Button", () => ({
  default: ({ children, ...props }) => <button {...props}>{children}</button>,
}));

describe("🧩 EmployeeForm", () => {
  test("debe enviar el formulario correctamente y llamar a onSubmit", async () => {
    const mockOnSubmit = vi.fn().mockResolvedValueOnce();

    render(
      <EmployeeForm
        roles={[{ id: 1, role_name: "employee" }]}
        departments={[{ id: 1, department_name: "Sistemas" }]}
        locations={[{ id: 1, location_name: "Madrid" }]}
        onSubmit={mockOnSubmit}
      />
    );

    fireEvent.change(screen.getByPlaceholderText("Introduce el nombre del empleado"), {
      target: { value: "Lisi" },
    });
    fireEvent.change(screen.getByPlaceholderText("Introduce los apellidos del empleado"), {
      target: { value: "Cruz" },
    });
    fireEvent.change(screen.getByPlaceholderText("Introduce el correo corporativo"), {
      target: { value: "lisi@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("********"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByPlaceholderText("Introduce los días disponibles"), {
      target: { value: 23 },
    });

    // 🚀 Enviar formulario
    fireEvent.click(screen.getByRole("button", { name: /guardar empleado/i }));

    // Espera que el onSubmit haya sido llamado una vez
    await waitFor(() => expect(mockOnSubmit).toHaveBeenCalledTimes(1), {
      timeout: 2000,
    });

    // ✅ Sin errores
    expect(toast.error).not.toHaveBeenCalled();
  });
});

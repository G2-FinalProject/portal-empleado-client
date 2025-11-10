import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { toast } from "react-hot-toast";
import EmployeeForm from "../../components/form/EmployeeForm";

vi.mock("react-hot-toast", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

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

    fireEvent.change(screen.getByPlaceholderText("Introduce el nombre del empleado"), { target: { value: "Lisi" } });
    fireEvent.change(screen.getByPlaceholderText("Introduce los apellidos del empleado"), { target: { value: "Cruz" } });
    fireEvent.change(screen.getByPlaceholderText("Introduce el correo corporativo"), { target: { value: "lisi@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("Crea una contraseña segura"), { target: { value: "contraseñaSegura" } });
    fireEvent.change(screen.getByLabelText(/Rol/i), { target: { value: 1 } });
    fireEvent.change(screen.getByLabelText(/Departamento/i), { target: { value: 1 } });
    fireEvent.change(screen.getByLabelText(/Población/i), { target: { value: 1 } });
    fireEvent.change(screen.getByPlaceholderText("Introduce los días disponibles"), { target: { value: 20 } });

    // 🔥 Dispara el envío real del formulario
    fireEvent.click(screen.getByRole("button", { name: /guardar empleado/i }));

    await waitFor(() => expect(mockOnSubmit).toHaveBeenCalledTimes(1), { timeout: 2000 });

    // ✅ Verifica que el toast se llamó
    expect(toast.success).toHaveBeenCalled();
  });
});

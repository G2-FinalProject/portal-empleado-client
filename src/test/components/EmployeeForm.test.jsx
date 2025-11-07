// 🔹 Importamos las herramientas necesarias de la Testing Library
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import EmployeeForm from '../../components/form/EmployeeForm'

// 🔹 Simulamos (mock) la librería react-hot-toast para evitar que intente mostrar toasts reales
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// 🔹 Agrupamos los tests relacionados a EmployeeForm
describe('🧩 EmployeeForm', () => {
  test('debe enviar el formulario correctamente y llamar a onSubmit', async () => {
    // 1️⃣ Creamos una función simulada para observar si se llama al enviar el formulario
    const mockOnSubmit = vi.fn()

    // 2️⃣ Renderizamos el componente con datos de prueba
    render(
      <EmployeeForm
        roles={[{ id: 1, role_name: 'employee' }]}
        departments={[{ id: 1, department_name: 'Sistemas' }]}
        locations={[{ id: 1, location_name: 'Madrid' }]}
        onSubmit={mockOnSubmit}
      />
    )

    // 3️⃣ Simulamos que el usuario escribe en los inputs
    fireEvent.change(
      screen.getByPlaceholderText('Introduce el nombre del empleado'),
      { target: { value: 'Lisi' } }
    )

    fireEvent.change(
      screen.getByPlaceholderText('Introduce los apellidos del empleado'),
      { target: { value: 'Cruz' } }
    )

    fireEvent.change(
      screen.getByPlaceholderText('Introduce el correo corporativo'),
      { target: { value: 'lisi@example.com' } }
    )

    fireEvent.change(
      screen.getByPlaceholderText('********'),
      { target: { value: 'contraseñaSegura' } }
    )

    // 4️⃣ Seleccionamos las opciones de rol, departamento y localización
    fireEvent.change(screen.getByLabelText(/Rol/i), { target: { value: 1 } })
    fireEvent.change(screen.getByLabelText(/Departamento/i), { target: { value: 1 } })
    fireEvent.change(screen.getByLabelText(/Población/i), { target: { value: 1 } })

    // 5️⃣ Finalmente, hacemos clic en el botón de enviar
    fireEvent.click(screen.getByRole('button', { name: /guardar empleado/i }))

    // 6️⃣ Esperamos a que se llame la función onSubmit (puede ser async)
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled()
    })

    // 7️⃣ Verificamos que el toast de éxito se haya mostrado
    const { toast } = await import('react-hot-toast')
    expect(toast.success).toHaveBeenCalled()
  })
})

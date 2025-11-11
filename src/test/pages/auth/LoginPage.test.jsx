import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import LoginPage from '../../../pages/auth/LoginPage'
import { MemoryRouter } from 'react-router-dom'

vi.mock('../../../utils/notifications', () => ({
  showSuccess: vi.fn(),
  showError: vi.fn(),
  showInfo: vi.fn(),
  showLoading: vi.fn(),
  dismiss: vi.fn(),
}))

// 🧩 Mock de authApi
vi.mock('../../../services/authApi', () => ({
  login: vi.fn(),
}))

// 🧩 Mock de Zustand store
export const mockLoginFn = vi.fn()

vi.mock('../../../stores/authStore', () => ({
  __esModule: true,
  default: (selector) => selector({ login: mockLoginFn }),
}))

// 🧩 Mock de navigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// 🧩 Mock del Button sin warnings
vi.mock('../../../components/ui', () => ({
  Button: ({ children, ...props }) => {
    const { fullWidth, loading, ...rest } = props
    return <button {...rest}>{children}</button>
  },
}))

// 🧩 Mock de imágenes
vi.mock('../../../assets/cohispania_logo.svg', () => ({ default: 'mocked-logo.svg' }))
vi.mock('../../../assets/images/login_image.jpg', () => ({ default: 'mocked-image.jpg' }))

// Imports reales después de mocks
import { login as apiLogin } from '../../../services/authApi'

import { showSuccess, showError } from '../../../utils/notifications'


describe('🔐 LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLoginFn.mockClear()
  })

  test('envía el formulario correctamente con credenciales válidas', async () => {
    // 6️⃣ Simulamos un login exitoso
    apiLogin.mockResolvedValue({
      token: 'fakeToken123',
      sesionData: { user: 'Lisi' },
    })

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )

    // 7️⃣ Llenamos los campos
    fireEvent.change(screen.getByPlaceholderText('tu.email@cohispania.com'), {
      target: { value: 'lisi@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('········'), {
      target: { value: 'password123' },
    })

    // 8️⃣ Enviamos el formulario
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))


    // 9️⃣ Esperamos resultados
    await waitFor(() => {
      expect(apiLogin).toHaveBeenCalledWith({
        email: 'lisi@example.com',
        password: 'password123',
      })
    })

    expect(mockLoginFn).toHaveBeenCalledWith('fakeToken123', { user: 'Lisi' })
    expect(showSuccess).toHaveBeenCalledWith('¡Bienvenido de vuelta!')
    expect(mockNavigate).toHaveBeenCalledWith('/myportal')
  })

  test('muestra mensaje de error si el login falla', async () => {
    // 10️⃣ Simulamos error de API
    apiLogin.mockRejectedValue({
      response: { data: { message: 'Credenciales inválidas' } },
    })

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByPlaceholderText('tu.email@cohispania.com'), {
      target: { value: 'lisi@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('········'), {
      target: { value: 'wrongpass' },
    })

    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    await waitFor(() => {
      expect(showError).toHaveBeenCalledWith('Credenciales inválidas')
    })
  })
})
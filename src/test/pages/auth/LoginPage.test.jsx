import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

// ✅ CRÍTICO: Declarar mocks ANTES de vi.mock()
const mockLoginFn = vi.fn()
const mockNavigate = vi.fn()

// 🧩 Mock de react-hot-toast
vi.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// 🧩 Mock de authApi
vi.mock('../../../services/authApi', () => ({
  login: vi.fn(),
}))

// 🧩 Mock de Zustand store - CORREGIDO
vi.mock('../../../stores/authStore', () => ({
  __esModule: true,
  default: (selector) => {
    const state = { 
      login: mockLoginFn, 
      token: null, 
      user: null 
    }
    return typeof selector === 'function' ? selector(state) : state
  }
}))

// 🧩 Mock de useNavigate
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// 🧩 Mock del Button
vi.mock('../../../components/ui/Button.jsx', () => ({
  __esModule: true,
  default: ({ children, ...props }) => {
    const { fullWidth, loading, ...rest } = props
    return <button {...rest}>{children}</button>
  },
}))

// 🧩 Mock de imágenes
vi.mock('../../../assets/cohispania_logo.svg', () => ({ 
  default: 'mocked-logo.svg' 
}))
vi.mock('../../../assets/images/login_image.jpg', () => ({ 
  default: 'mocked-image.jpg' 
}))

// Imports reales DESPUÉS de los mocks
import LoginPage from '../../../pages/auth/LoginPage'
import toast from 'react-hot-toast'
import { login as apiLogin } from '../../../services/authApi'

// ===================== TESTS =====================
describe('🔐 LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('envía el formulario correctamente con credenciales válidas', async () => {
    const mockResponse = {
      sesionData: { id: 1, name: 'Lisi', role: { role_name: 'admin' } },
      token: 'fakeToken123',
    }
    
    apiLogin.mockResolvedValue(mockResponse)

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByPlaceholderText('tu.email@cohispania.com'), {
      target: { value: 'lisi@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('········'), {
      target: { value: 'password123' },
    })

    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    await waitFor(() => {
      expect(apiLogin).toHaveBeenCalledWith({
        email: 'lisi@example.com',
        password: 'password123',
      })
    })

    expect(mockLoginFn).toHaveBeenCalledWith(
      mockResponse.token,
      mockResponse.sesionData
    )
    expect(toast.success).toHaveBeenCalledWith('¡Bienvenido de vuelta!', expect.any(Object))
    expect(mockNavigate).toHaveBeenCalledWith('/myportal')
  })

  test('muestra mensaje de error si el login falla', async () => {
    apiLogin.mockRejectedValue({
      response: { data: { message: 'Credenciales inválidas' } },
    })

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )

    // ✅ Usar getAllByPlaceholderText porque puede haber múltiples instancias
    const emailInputs = screen.getAllByPlaceholderText('tu.email@cohispania.com')
    const passwordInputs = screen.getAllByPlaceholderText('········')
    
    fireEvent.change(emailInputs[0], {
      target: { value: 'lisi@example.com' },
    })
    fireEvent.change(passwordInputs[0], {
      target: { value: 'wrongpass' },
    })

    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Credenciales inválidas', expect.any(Object))
    })
    
    expect(mockLoginFn).not.toHaveBeenCalled()
  })
})
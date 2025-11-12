import { render, screen, waitFor } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { vi } from 'vitest'

// ✅ Definir mockState ANTES del vi.mock
let mockState = {
  token: null,
  user: null,
  isLoading: false,
  isAdmin: () => mockState.user?.role?.role_name === 'admin',
  isManager: () => mockState.user?.role?.role_name === 'manager',
  setUser: (user) => (mockState.user = user),
  logout: vi.fn(),
}

// ✅ Mock de authStore usando la variable ya definida
vi.mock('../../stores/authStore', () => {
  const useAuthStore = (selector) => {
    if (typeof selector === 'function') return selector(mockState)
    return mockState
  }

  useAuthStore.getState = () => mockState
  useAuthStore.setState = (newState) => Object.assign(mockState, newState)

  return { __esModule: true, default: useAuthStore }
})

// 🧩 Mock de páginas usadas en el router
vi.mock('../../pages/auth/LoginPage', () => ({
  __esModule: true,
  default: () => (
    <div>
      <h1>Iniciar sesión</h1>
      <input placeholder="tu.email@cohispania.com" />
      <input placeholder="········" type="password" />
    </div>
  ),
}))

vi.mock('../../pages/employeeManagement/EmployeeListPage', () => ({
  __esModule: true,
  default: () => <div>Portal del Empleado</div>,
}))

vi.mock('../../pages/errors/NotAuthorizedPage', () => ({
  __esModule: true,
  default: () => <div>No autorizado - No tienes permisos para acceder</div>,
}))

vi.mock('../../pages/errors/NotFoundPage', () => ({
  __esModule: true,
  default: () => <div>404 - Página no encontrada</div>,
}))

// Importa el router real del proyecto DESPUÉS de los mocks
import router from '../../routes/router'

// =============================
// 🔍 TESTS DE RUTAS PRINCIPALES
// =============================
describe('🧭 Router - Integración de rutas y roles', () => {
  beforeEach(() => {
    mockState.token = null
    mockState.user = null
    mockState.isLoading = false
    vi.clearAllMocks()
  })

  // ------------------------------
  test('muestra la página de Login en /login', async () => {
    const memoryRouter = createMemoryRouter(router.routes, {
      initialEntries: ['/login'],
    })

    render(<RouterProvider router={memoryRouter} />)

    const emailInput = await screen.findByPlaceholderText(/tu\.email@cohispania\.com/i)
    expect(emailInput).toBeInTheDocument()
    expect(screen.getByText(/iniciar sesión/i)).toBeInTheDocument()
  })

  // ------------------------------
  test('redirige a /login al acceder sin sesión a una ruta protegida', async () => {
    const memoryRouter = createMemoryRouter(router.routes, {
      initialEntries: ['/employees'],
    })

    render(<RouterProvider router={memoryRouter} />)

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/tu\.email@cohispania\.com/i)).toBeInTheDocument()
    })
  })

  // ------------------------------
  test('permite acceder a /employees si el usuario es admin', async () => {
    mockState.token = 'fake-token'
    mockState.user = { 
      roleId: 1,
      role: { role_name: 'admin' }
    }

    const memoryRouter = createMemoryRouter(router.routes, {
      initialEntries: ['/employees'],
    })

    render(<RouterProvider router={memoryRouter} />)

    // ✅ Usar getAllByText y tomar el primero (el del contenido, no el del sidebar)
    const titles = await screen.findAllByText(/portal del empleado/i)
    expect(titles[0]).toBeInTheDocument()
  })

  // ------------------------------
  test('redirige a No autorizado si el usuario no tiene permisos', async () => {
    mockState.token = 'fake-token'
    mockState.user = { 
      roleId: 3, // ✅ roleId 3 = employee (no tiene permisos para /employees)
      role: { role_name: 'employee' }
    }

    const memoryRouter = createMemoryRouter(router.routes, {
      initialEntries: ['/employees'],
    })

    render(<RouterProvider router={memoryRouter} />)

    // ✅ Buscar "Acceso denegado" - Usar findByRole para el heading
    const deniedTitle = await screen.findByRole('heading', { 
      name: /acceso denegado/i,
      timeout: 5000 
    })
    expect(deniedTitle).toBeInTheDocument()
    
    // ✅ Verificar que también muestra el mensaje de permisos
    const deniedMessage = screen.getByText(/no tienes permisos para acceder a esta página/i)
    expect(deniedMessage).toBeInTheDocument()
  })

  // ------------------------------
  test('muestra la página 404 en rutas inexistentes', async () => {
    mockState.token = 'fake-token'
    mockState.user = { 
      roleId: 1,
      role: { role_name: 'admin' }
    }

    const memoryRouter = createMemoryRouter(router.routes, {
      initialEntries: ['/ruta-inexistente'],
    })

    render(<RouterProvider router={memoryRouter} />)

    const notFound = await screen.findByText(/404/i)
    expect(notFound).toBeInTheDocument()
  })
})
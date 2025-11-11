// src/test/pages/requests/RequestsPage.int.test.jsx
import '@testing-library/jest-dom/vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import RequestsPage from '../../../pages/requests/RequestsPage'

// ===============================
// MOCKS en el estilo del repo
// ===============================

// toast
vi.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
  },
}))
import toast from 'react-hot-toast'

// authStore (esta página usa useAuthStore() sin selector)
vi.mock('../../../stores/authStore', () => ({
  __esModule: true,
  default: vi.fn(),
}))
import useAuthStore from '../../../stores/authStore'

// vacation store (esta página usa useVacationStore() sin selector)
vi.mock('../../../stores/useVacationStore', () => ({
  __esModule: true,
  default: vi.fn(),
}))
import useVacationStore from '../../../stores/useVacationStore'

// ===============================
// Datos base para los tests
// ===============================
const baseRequests = [
  {
    id: 1,
    requesterName: 'Lisi Cruz',
    requesterEmail: 'lisi@example.com',
    departmentId: 1,
    startDate: '2025-01-15',
    endDate: '2025-01-20',
    requestedDays: 5,
    status: 'pending',
    createdAt: '2025-01-10',
  },
  {
    id: 2,
    requesterName: 'Nicole Ramos',
    requesterEmail: 'nicole@example.com',
    departmentId: 2,
    startDate: '2025-02-10',
    endDate: '2025-02-12',
    requestedDays: 3,
    status: 'approved',
    createdAt: '2025-01-05',
  },
  {
    id: 3,
    requesterName: 'María López',
    requesterEmail: 'maria@example.com',
    departmentId: 2,
    startDate: '2025-03-01',
    endDate: '2025-03-03',
    requestedDays: 3,
    status: 'rejected',
    createdAt: '2025-02-01',
  },
]

// helper para construir el mock del store de vacaciones
function makeVacationStoreMock({ requests = baseRequests, loading = false, fns = {} } = {}) {
  const fetchAllRequests = fns.fetchAllRequests ?? vi.fn()
  const approveRequest = fns.approveRequest ?? vi.fn(async (id) => {
    // devuelve “actualizado” como haría el API mapeado
    const found = requests.find((r) => r.id === id) ?? {}
    return { ...found, status: 'approved' }
  })
  const rejectRequest = fns.rejectRequest ?? vi.fn(async (id) => {
    const found = requests.find((r) => r.id === id) ?? {}
    return { ...found, status: 'rejected' }
  })

  // IMPORTANTE: RequestsPage llama useVacationStore() SIN selector,
  // así que el mock debe devolver el objeto completo cuando no recibe función.
  return (selector) => {
    const state = {
      allRequests: requests,
      loading,
      fetchAllRequests,
      approveRequest,
      rejectRequest,
      // la página también lee (indirectamente) fetchAllRequests tras aprobar/denegar
    }
    return typeof selector === 'function' ? selector(state) : state
  }
}

// helper para authStore (esta página llama useAuthStore() SIN selector)
function makeAuthStoreMock({ role = 'ADMIN', departmentId = 1 } = {}) {
  const isAdmin = () => role === 'ADMIN'
  const isManager = () => role === 'MANAGER'
  return () => ({
    user: { id: 99, roleId: role === 'ADMIN' ? 1 : 2, departmentId },
    isAdmin,
    isManager,
  })
}

// limpia entre tests
beforeEach(() => {
  vi.clearAllMocks()
})
afterEach(() => cleanup())

// ===============================
// TESTS
// ===============================
describe('RequestsPage (integración)', () => {
  it('renderiza título y subtítulo según rol', () => {
    useAuthStore.mockImplementation(makeAuthStoreMock({ role: 'ADMIN' }))
    useVacationStore.mockImplementation(makeVacationStoreMock())

    render(
      <MemoryRouter>
        <RequestsPage />
      </MemoryRouter>
    )

    expect(screen.getByText('Todas las solicitudes')).toBeInTheDocument()
    // ADMIN -> subtítulo de empresa
    expect(
      screen.getByText(/toda la empresa/i)
    ).toBeInTheDocument()
  })

  it('llama a fetchAllRequests al montar', async () => {
    const fetchAllRequests = vi.fn()
    useAuthStore.mockImplementation(makeAuthStoreMock({ role: 'ADMIN' }))
    useVacationStore.mockImplementation(
      makeVacationStoreMock({ fns: { fetchAllRequests } })
    )

    render(
      <MemoryRouter>
        <RequestsPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(fetchAllRequests).toHaveBeenCalledTimes(1)
    })
  })

  it('muestra las pendientes por defecto (incluye la de Lisi)', async () => {
    useAuthStore.mockImplementation(makeAuthStoreMock({ role: 'ADMIN' }))
    useVacationStore.mockImplementation(makeVacationStoreMock())

    render(
      <MemoryRouter>
        <RequestsPage />
      </MemoryRouter>
    )

    // Por defecto está el tab Pendientes: debe aparecer la fila con Lisi (pending)
    expect(await screen.findByText(/lisi\s+cruz/i)).toBeInTheDocument()
    // y debería existir un botón "Aprobar" visible
    expect(screen.getByRole('button', { name: /aprobar/i })).toBeInTheDocument()
  })

  it('APRUEBA una solicitud (abre modal y confirma)', async () => {
    const approveRequest = vi.fn(async () => ({ id: 1, status: 'approved' }))
    const fetchAllRequests = vi.fn()
    useAuthStore.mockImplementation(makeAuthStoreMock({ role: 'ADMIN' }))
    useVacationStore.mockImplementation(
      makeVacationStoreMock({ fns: { approveRequest, fetchAllRequests } })
    )

    render(
      <MemoryRouter>
        <RequestsPage />
      </MemoryRouter>
    )

    // fila de Lisi (pending)
    await screen.findByText(/lisi\s+cruz/i)

    // abre modal
    fireEvent.click(screen.getByRole('button', { name: /aprobar/i }))

    // en el modal hay un botón con texto "Aprobar"
    const modalApprove = await screen.findByRole('button', { name: /^aprobar$/i })
    fireEvent.click(modalApprove)

    await waitFor(() => {
      expect(approveRequest).toHaveBeenCalledWith(1, null)
      expect(fetchAllRequests).toHaveBeenCalled()
      expect(toast.success).toHaveBeenCalledWith('Solicitud aprobada correctamente')
    })
  })

  it('DENIEGA una solicitud (comentario obligatorio)', async () => {
    const rejectRequest = vi.fn(async () => ({ id: 1, status: 'rejected' }))
    const fetchAllRequests = vi.fn()
    useAuthStore.mockImplementation(makeAuthStoreMock({ role: 'ADMIN' }))
    useVacationStore.mockImplementation(
      makeVacationStoreMock({ fns: { rejectRequest, fetchAllRequests } })
    )

    render(
      <MemoryRouter>
        <RequestsPage />
      </MemoryRouter>
    )

    await screen.findByText(/lisi\s+cruz/i)

    // abre modal de Denegar
    fireEvent.click(screen.getByRole('button', { name: /denegar/i }))

    // el botón "Denegar" debe estar deshabilitado hasta escribir comentario
    const modalDeny = await screen.findByRole('button', { name: /^denegar$/i })
    expect(modalDeny).toBeDisabled()

    // escribe comentario
    const textarea = screen.getByPlaceholderText(/añade un comentario/i)
    fireEvent.change(textarea, { target: { value: 'No cuadra con el plan' } })

    // ahora puede denegar
    expect(modalDeny).not.toBeDisabled()
    fireEvent.click(modalDeny)

    await waitFor(() => {
      expect(rejectRequest).toHaveBeenCalledWith(1, 'No cuadra con el plan')
      expect(fetchAllRequests).toHaveBeenCalled()
      expect(toast.success).toHaveBeenCalledWith('Solicitud denegada correctamente')
    })
  })

  it('muestra spinner si loading = true', async () => {
    useAuthStore.mockImplementation(makeAuthStoreMock({ role: 'ADMIN' }))
    useVacationStore.mockImplementation(
      makeVacationStoreMock({ loading: true })
    )

    render(
      <MemoryRouter>
        <RequestsPage />
      </MemoryRouter>
    )

    // en loading, RequestsList muestra un spinner con clase animate-spin
    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toBeTruthy()
  })

  it('como MANAGER filtra por departamento del usuario', async () => {
    // manager del dept 2: solo debería ver solicitudes de ese dept (Nicole / María)
    useAuthStore.mockImplementation(makeAuthStoreMock({ role: 'MANAGER', departmentId: 2 }))
    useVacationStore.mockImplementation(makeVacationStoreMock())

    render(
      <MemoryRouter>
        <RequestsPage />
      </MemoryRouter>
    )

    // por defecto tab Pendientes -> en dept 2 NO hay pending? ajustemos base para que Lisi (dept 1) no salga
    // si no hay pendientes, el mensaje aparece
    expect(await screen.findByText(/no hay solicitudes pendientes/i)).toBeInTheDocument()

    // cambia a "Aprobadas"
    fireEvent.click(screen.getByRole('tab', { name: /aprobadas/i }))
    expect(await screen.findByText(/nicole\s+ramos/i)).toBeInTheDocument()

    // cambia a "Denegadas"
    fireEvent.click(screen.getByRole('tab', { name: /denegadas/i }))
    expect(await screen.findByText(/maría\s+lópez/i)).toBeInTheDocument()

    // y NO debería ver a Lisi (dept 1) en ninguna pestaña del manager dept 2
    expect(screen.queryByText(/lisi\s+cruz/i)).not.toBeInTheDocument()
  })
})

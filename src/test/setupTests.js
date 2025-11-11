import '@testing-library/jest-dom'
import { vi } from 'vitest'
import { server } from './mocks/server'

// Mock global para react-hot-toast
const toastFn = vi.fn()
toastFn.success = vi.fn()
toastFn.error = vi.fn()
toastFn.loading = vi.fn()
toastFn.dismiss = vi.fn()
toastFn.promise = vi.fn()

vi.mock('react-hot-toast', () => ({
  __esModule: true,
  default: toastFn,
  toast: toastFn,
  Toaster: () => null,
}))

// Inicia el servidor MSW antes de todos los tests
beforeAll(() => server.listen())

// Limpia los handlers entre test y test
afterEach(() => server.resetHandlers())

// Cierra el servidor cuando todos los tests terminan
afterAll(() => server.close())

import '@testing-library/jest-dom'
import { server } from './mocks/server'

// Inicia el servidor MSW antes de todos los tests
beforeAll(() => server.listen())

// Limpia los handlers entre test y test
afterEach(() => server.resetHandlers())

// Cierra el servidor cuando todos los tests terminan
afterAll(() => server.close())

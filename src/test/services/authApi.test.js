import { describe, it, expect } from 'vitest'
import { login } from '../../services/authApi'

describe('🔐 authApi', () => {
  it('devuelve token y datos de sesión en login exitoso', async () => {
    const response = await login({
      email: 'lisi@example.com',
      password: 'password123',
    })

    expect(response.token).toBe('fakeToken123')
    expect(response.sesionData).toEqual({ user: 'Lisi' })
  })

  it('lanza error si las credenciales son inválidas', async () => {
    await expect(
      login({ email: 'lisi@example.com', password: 'wrong' })
    ).rejects.toHaveProperty('response.status', 401)
  })
})

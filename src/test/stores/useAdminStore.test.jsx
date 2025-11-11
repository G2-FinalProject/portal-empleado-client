// Integration tests for useAdminStore using MSW
import { describe, it, expect, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import useAdminStore from '../../stores/useAdminStore'

const resetStore = () => {
  const { reset } = useAdminStore.getState()
  reset()
}

describe('🗃️ useAdminStore (MSW integration)', () => {
  beforeEach(() => {
    resetStore()
  })

  it('fetchUsers obtiene usuarios desde la API', async () => {
    await act(async () => {
      await useAdminStore.getState().fetchUsers()
    })

    const { users, loading, error } = useAdminStore.getState()
    expect(users).toHaveLength(1)
    expect(users[0].first_name).toBe('Lisi')
    expect(loading.users).toBeFalsy()
    expect(error).toBeNull()
  })

  it('createUser agrega un usuario al estado', async () => {
    await act(async () => {
      await useAdminStore.getState().createUser({
        first_name: 'Nicole',
        last_name: 'Ramos',
        email: 'nicole@example.com',
        password: '12345678',
        role_id: 1,
        department_id: 1,
        location_id: 1,
      })
    })

    const { users } = useAdminStore.getState()
    expect(users.some((user) => user.email === 'nicole@example.com')).toBe(true)
  })
})

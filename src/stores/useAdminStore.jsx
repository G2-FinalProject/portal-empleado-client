import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAdminStore } from '../../stores/useAdminStore';

describe('🗃️ useAdminStore (MSW integration)', () => {
  beforeEach(() => {
    // Resetear el store antes de cada test
    const { result } = renderHook(() => useAdminStore());
    act(() => {
      result.current.users = [];
    });
  });

  it('fetchUsers obtiene usuarios desde la API', async () => {
    const { result } = renderHook(() => useAdminStore());

    await act(async () => {
      await result.current.fetchUsers();
    });

    await waitFor(() => {
      expect(result.current.users.length).toBeGreaterThan(0);
    });
  });

  it('createUser agrega un usuario al estado', async () => {
    const { result } = renderHook(() => useAdminStore());

    const newUser = {
      first_name: 'Nicole',
      last_name: 'Ramos',
      email: 'nicole@example.com',
      password: '12345678',
      role_id: 1,
      department_id: 1,
      location_id: 1
    };

    await act(async () => {
      await result.current.createUser(newUser);
    });

    await waitFor(() => {
      expect(result.current.users).toContainEqual(
        expect.objectContaining({ email: 'nicole@example.com' })
      );
    });
  });
});

import { http, HttpResponse } from 'msw'

const apiBase = 'http://localhost:3000/api'

export const handlers = [
  // Autenticación
  http.post(`${apiBase}/auth/login`, async ({ request }) => {
    const body = await request.json()

    if (body.email === 'lisi@example.com' && body.password === 'password123') {
      return HttpResponse.json(
        {
          token: 'fakeToken123',
          sesionData: { user: 'Lisi' },
        },
        { status: 200 }
      )
    }

    return HttpResponse.json(
      { message: 'Credenciales inválidas' },
      { status: 401 }
    )
  }),

  // Usuarios
  http.get(`${apiBase}/users`, async () => {
    return HttpResponse.json(
      [
        {
          id: 1,
          first_name: 'Lisi',
          last_name: 'Cruz',
          email: 'lisi@example.com',
          available_days: 20,
        },
      ],
      { status: 200 }
    )
  }),

  http.post(`${apiBase}/users`, async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json(
      {
        id: Date.now(),
        ...body,
      },
      { status: 201 }
    )
  }),
]

import { http, HttpResponse } from 'msw'

export const handlers = [
  // Simula una petición POST al crear empleado
  http.post('/api/employees', async () => {
    return HttpResponse.json(
      { message: 'Empleado creado correctamente 🎉' },
      { status: 201 }
    )
  }),

  // Simula una petición GET para listar empleados
  http.get('/api/employees', async () => {
    return HttpResponse.json(
      [
        { id: 1, name: 'Lisi Cruz', email: 'lisi@example.com' },
        { id: 2, name: 'Nicole', email: 'nicole@example.com' },
      ],
      { status: 200 }
    )
  }),
]

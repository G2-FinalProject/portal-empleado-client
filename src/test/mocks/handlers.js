import { rest } from 'msw'

export const handlers = [
  rest.post('/api/employees', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({ message: 'Empleado creado correctamente 🎉' })
    )
  }),
  rest.get('/api/employees', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        { id: 1, name: 'Lisi Cruz', email: 'lisi@example.com' },
        { id: 2, name: 'Nicole', email: 'nicole@example.com' },
      ])
    )
  }),
]

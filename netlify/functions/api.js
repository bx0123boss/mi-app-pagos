import { getDatabase } from '@netlify/database'

const db = getDatabase()

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

const error = (message, status = 500) => json({ error: message }, status)

export default async (req, context) => {
  const url = new URL(req.url)
  const path = url.pathname
  const method = req.method

  try {
    // ---- CONTRACTS ----
    if (method === 'GET' && path === '/api/contracts') {
      const rows = await db.sql`
        SELECT 
          c.id,
          c.client_name,
          c.total_amount,
          c.created_at,
          COALESCE(SUM(p.amount), 0) AS paid_amount,
          c.total_amount - COALESCE(SUM(p.amount), 0) AS pending_amount
        FROM contracts c
        LEFT JOIN payments p ON p.contract_id = c.id
        GROUP BY c.id
        ORDER BY c.created_at DESC
      `
      return json(rows)
    }

    if (method === 'POST' && path === '/api/contracts') {
      const body = await req.json()
      const { client_name, total_amount } = body

      if (!client_name || total_amount == null) {
        return error('client_name y total_amount son requeridos', 400)
      }

      const [contract] = await db.sql`
        INSERT INTO contracts (client_name, total_amount)
        VALUES (${client_name}, ${total_amount})
        RETURNING *
      `
      return json(contract, 201)
    }
    // ---- PAYMENTS ----
    if (method === 'POST' && path === '/api/payments') {
      const body = await req.json()
      const { contract_id, amount, payment_date } = body

      if (!contract_id || amount == null) {
        return error('contract_id y amount son requeridos', 400)
      }

      // Verificar que el contrato existe
      const [contract] = await db.sql`
        SELECT id FROM contracts WHERE id = ${contract_id}
      `
      if (!contract) {
        return error('Contrato no encontrado', 404)
      }

      const [payment] = await db.sql`
        INSERT INTO payments (contract_id, amount, payment_date)
        VALUES (${contract_id}, ${amount}, ${payment_date || new Date().toISOString()})
        RETURNING *
      `
      return json(payment, 201)
    }

    // GET /api/contracts/:id → detalle con pagos y distribuciones
    const contractDetailMatch = path.match(/^\/api\/contracts\/(\d+)$/)
    if (method === 'GET' && contractDetailMatch) {
      const contractId = parseInt(contractDetailMatch[1], 10)

      const [contract] = await db.sql`
        SELECT 
          c.id,
          c.client_name,
          c.total_amount,
          c.created_at,
          COALESCE(SUM(p.amount), 0) AS paid_amount,
          c.total_amount - COALESCE(SUM(p.amount), 0) AS pending_amount
        FROM contracts c
        LEFT JOIN payments p ON p.contract_id = c.id
        WHERE c.id = ${contractId}
        GROUP BY c.id
      `
      if (!contract) return error('Contrato no encontrado', 404)

      const payments = await db.sql`
        SELECT id, amount, payment_date
        FROM payments
        WHERE contract_id = ${contractId}
        ORDER BY payment_date DESC
      `

      // Traer distribuciones de todos esos pagos
      const distributions = await db.sql`
        SELECT d.id, d.payment_id, d.person_name, d.amount, d.is_expense
        FROM distributions d
        INNER JOIN payments p ON p.id = d.payment_id
        WHERE p.contract_id = ${contractId}
        ORDER BY d.id ASC
      `

      return json({ ...contract, payments, distributions })
    }

    // ---- DISTRIBUTIONS ----
    if (method === 'POST' && path === '/api/distributions') {
      const body = await req.json()
      const { payment_id, person_name, amount, is_expense = false } = body

      if (!payment_id || !person_name || amount == null) {
        return error('payment_id, person_name y amount son requeridos', 400)
      }

      const [payment] = await db.sql`
        SELECT id FROM payments WHERE id = ${payment_id}
      `
      if (!payment) return error('Pago no encontrado', 404)

      const [distribution] = await db.sql`
        INSERT INTO distributions (payment_id, person_name, amount, is_expense)
        VALUES (${payment_id}, ${person_name}, ${amount}, ${is_expense})
        RETURNING *
      `
      return json(distribution, 201)
    }
        // ---- SUMMARY ----
    if (method === 'GET' && path === '/api/summary') {
      // Totales globales
      const [totals] = await db.sql`
        SELECT
          COALESCE((SELECT SUM(total_amount) FROM contracts), 0) AS total_contratado,
          COALESCE((SELECT SUM(amount) FROM payments), 0) AS total_cobrado
      `

      // Reparto por persona (excluyendo gastos)
      const byPerson = await db.sql`
        SELECT 
          person_name,
          SUM(amount) AS total,
          COUNT(*) AS movimientos
        FROM distributions
        WHERE is_expense = false
        GROUP BY person_name
        ORDER BY total DESC
      `

      // Total de gastos
      const [expenses] = await db.sql`
        SELECT 
          COALESCE(SUM(amount), 0) AS total_gastos,
          COUNT(*) AS movimientos
        FROM distributions
        WHERE is_expense = true
      `

      // Detalle de gastos
      const expenseList = await db.sql`
        SELECT person_name, SUM(amount) AS total
        FROM distributions
        WHERE is_expense = true
        GROUP BY person_name
        ORDER BY total DESC
      `

      return json({
        total_contratado: Number(totals.total_contratado),
        total_cobrado: Number(totals.total_cobrado),
        por_cobrar: Number(totals.total_contratado) - Number(totals.total_cobrado),
        por_persona: byPerson.map(r => ({ ...r, total: Number(r.total) })),
        gastos: {
          total: Number(expenses.total_gastos),
          movimientos: Number(expenses.movimientos),
          detalle: expenseList.map(r => ({ ...r, total: Number(r.total) })),
        },
      })
    }
    // ---- 404 ----
    return error('Not found', 404)
  } catch (err) {
    console.error('[api error]', err)
    return error(err.message, 500)
  }
}
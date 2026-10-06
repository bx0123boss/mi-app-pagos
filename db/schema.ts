import { integer, pgTable, serial, text, timestamp, doublePrecision, boolean } from 'drizzle-orm/pg-core'

// 1. Contratos (el total que debe pagar cada cliente)
export const contracts = pgTable('contracts', {
  id: serial('id').primaryKey(),
  clientName: text('client_name').notNull(),
  totalAmount: doublePrecision('total_amount').notNull(), // Dinero en unidades mayores (ej. 1500.50)
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// 2. Pagos recibidos (cada pago va vinculado a un contrato)
export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  contractId: integer('contract_id')
    .notNull()
    .references(() => contracts.id, { onDelete: 'cascade' }), // Si borras el contrato, se borran sus pagos [citation:1]
  amount: doublePrecision('amount').notNull(), // Dinero del pago
  paymentDate: timestamp('payment_date').defaultNow().notNull(),
})

// 3. Distribuciones (cuánto se dio a cada quién o gasto, vinculado a un pago)
export const distributions = pgTable('distributions', {
  id: serial('id').primaryKey(),
  paymentId: integer('payment_id')
    .notNull()
    .references(() => payments.id, { onDelete: 'cascade' }), // Si borras el pago, se borran sus distribuciones
  personName: text('person_name').notNull(), // "Integrante 1", "Integrante 2", o "Gasto"
  amount: doublePrecision('amount').notNull(), // Dinero asignado
  isExpense: boolean('is_expense').default(false).notNull(), // true si es un gasto, false si es reparto a integrante
})
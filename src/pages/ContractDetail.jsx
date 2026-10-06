import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api'

const inputClass =
  'px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'

export default function ContractDetail() {
  const { id } = useParams()
  const [contract, setContract] = useState(null)
  const [paymentForm, setPaymentForm] = useState({ amount: '' })
  const [distForm, setDistForm] = useState({
    payment_id: '',
    person_name: '',
    amount: '',
    is_expense: false,
  })

  const load = () => api.getContract(id).then(setContract)

  useEffect(() => {
    load()
  }, [id])

  if (!contract) return <p className="text-slate-500">Cargando...</p>

  const addPayment = async (e) => {
    e.preventDefault()
    await api.createPayment({ contract_id: id, amount: Number(paymentForm.amount) })
    setPaymentForm({ amount: '' })
    load()
  }

  const addDistribution = async (e) => {
    e.preventDefault()
    await api.createDistribution({
      payment_id: Number(distForm.payment_id),
      person_name: distForm.person_name,
      amount: Number(distForm.amount),
      is_expense: distForm.is_expense,
    })
    setDistForm({ payment_id: '', person_name: '', amount: '', is_expense: false })
    load()
  }

  return (
    <div className="space-y-6">
      <div>
        <Link to="/contracts" className="text-sm text-blue-600 hover:underline">
          ← Volver a contratos
        </Link>
        <h1 className="text-3xl font-bold text-slate-900 mt-2">{contract.client_name}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs uppercase text-slate-500">Total</p>
          <p className="text-xl font-bold text-slate-900">${contract.total_amount}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs uppercase text-slate-500">Pagado</p>
          <p className="text-xl font-bold text-emerald-600">${contract.paid_amount}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs uppercase text-slate-500">Pendiente</p>
          <p className="text-xl font-bold text-red-600">${contract.pending_amount}</p>
        </div>
      </div>

      <section className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Registrar pago</h2>
        <form onSubmit={addPayment} className="flex gap-3 flex-wrap">
          <input
            type="number"
            placeholder="Monto"
            value={paymentForm.amount}
            onChange={(e) => setPaymentForm({ amount: e.target.value })}
            required
            className={`${inputClass} flex-1 min-w-40`}
          />
          <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition">
            Agregar pago
          </button>
        </form>
      </section>

      <section className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Pagos</h2>
        {contract.payments.length === 0 ? (
          <p className="text-slate-500 text-sm">Sin pagos aún.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {contract.payments.map((p) => (
              <li key={p.id} className="flex justify-between py-3">
                <span className="text-slate-700">
                  💰 Pago #{p.id} — {new Date(p.payment_date).toLocaleDateString()}
                </span>
                <span className="font-bold text-slate-900">${p.amount}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Registrar reparto / gasto</h2>
        <form onSubmit={addDistribution} className="flex gap-3 flex-wrap items-center">
          <select
            value={distForm.payment_id}
            onChange={(e) => setDistForm({ ...distForm, payment_id: e.target.value })}
            required
            className={inputClass}
          >
            <option value="">Pago...</option>
            {contract.payments.map((p) => (
              <option key={p.id} value={p.id}>
                Pago #{p.id} (${p.amount})
              </option>
            ))}
          </select>
          <input
            placeholder="Nombre (o gasto)"
            value={distForm.person_name}
            onChange={(e) => setDistForm({ ...distForm, person_name: e.target.value })}
            required
            className={`${inputClass} flex-1 min-w-40`}
          />
          <input
            type="number"
            placeholder="Monto"
            value={distForm.amount}
            onChange={(e) => setDistForm({ ...distForm, amount: e.target.value })}
            required
            className={`${inputClass} w-32`}
          />
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={distForm.is_expense}
              onChange={(e) => setDistForm({ ...distForm, is_expense: e.target.checked })}
              className="w-4 h-4"
            />
            Es gasto
          </label>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
            Agregar
          </button>
        </form>
      </section>

      <section className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Reparto</h2>
        {contract.distributions.length === 0 ? (
          <p className="text-slate-500 text-sm">Sin repartos aún.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {contract.distributions.map((d) => (
              <li key={d.id} className="flex justify-between py-3">
                <span className="text-slate-700">
                  {d.is_expense ? '💸' : '👤'} {d.person_name}
                  <span className="text-slate-400 text-sm ml-2">(pago #{d.payment_id})</span>
                </span>
                <span className="font-bold text-slate-900">${d.amount}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
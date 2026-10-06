import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'

export default function Contracts() {
  const [contracts, setContracts] = useState([])
  const [form, setForm] = useState({ client_name: '', total_amount: '' })
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    api.getContracts().then(setContracts).finally(() => setLoading(false))
  }

  useEffect(load, [])

  const submit = async (e) => {
    e.preventDefault()
    await api.createContract({
      client_name: form.client_name,
      total_amount: Number(form.total_amount),
    })
    setForm({ client_name: '', total_amount: '' })
    load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Contratos</h1>
      </div>

      <form
        onSubmit={submit}
        className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex gap-3 flex-wrap"
      >
        <input
          placeholder="Cliente"
          value={form.client_name}
          onChange={(e) => setForm({ ...form, client_name: e.target.value })}
          required
          className="flex-1 min-w-40 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="number"
          placeholder="Total"
          value={form.total_amount}
          onChange={(e) => setForm({ ...form, total_amount: e.target.value })}
          required
          className="w-32 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
          Crear
        </button>
      </form>

      {loading ? (
        <p className="text-slate-500">Cargando...</p>
      ) : contracts.length === 0 ? (
        <p className="text-slate-500">No hay contratos todavía.</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Cliente</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">Total</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">Pagado</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">Pendiente</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {contracts.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{c.client_name}</td>
                  <td className="px-4 py-3 text-right text-slate-600">${c.total_amount}</td>
                  <td className="px-4 py-3 text-right text-emerald-600">${c.paid_amount}</td>
                  <td className="px-4 py-3 text-right font-semibold text-red-600">
                    ${c.pending_amount}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/contracts/${c.id}`}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
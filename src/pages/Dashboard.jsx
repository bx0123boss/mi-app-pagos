import { useEffect, useState } from 'react'
import { api } from '../api'

function Card({ title, value, accent = 'slate' }) {
  const colors = {
    slate: 'text-slate-900',
    green: 'text-emerald-600',
    red: 'text-red-600',
    blue: 'text-blue-600',
  }
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
      <p className="text-xs uppercase tracking-wide text-slate-500 font-medium">{title}</p>
      <p className={`text-2xl font-bold mt-2 ${colors[accent]}`}>${value}</p>
    </div>
  )
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.getSummary().then(setSummary).catch((e) => setError(e.message))
  }, [])

  if (error) return <p className="text-red-600">Error: {error}</p>
  if (!summary) return <p className="text-slate-500">Cargando...</p>

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-slate-900">Resumen</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Contratado" value={summary.total_contratado} accent="blue" />
        <Card title="Cobrado" value={summary.total_cobrado} accent="green" />
        <Card title="Por cobrar" value={summary.por_cobrar} accent="red" />
      </div>

      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Reparto por integrante</h2>
        {summary.por_persona.length === 0 ? (
          <p className="text-slate-500 text-sm">Sin repartos aún.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {summary.por_persona.map((p) => (
              <li key={p.person_name} className="flex justify-between py-3">
                <span className="font-medium text-slate-700">👤 {p.person_name}</span>
                <span className="text-slate-900">
                  <span className="font-bold">${p.total}</span>
                  <span className="text-slate-400 text-sm ml-2">({p.movimientos})</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Gastos</h2>
        <p className="text-slate-600 mb-3">
          Total: <span className="font-bold text-red-600">${summary.gastos.total}</span>
        </p>
        {summary.gastos.detalle.length > 0 && (
          <ul className="divide-y divide-slate-100">
            {summary.gastos.detalle.map((g) => (
              <li key={g.person_name} className="flex justify-between py-3">
                <span className="text-slate-700">💸 {g.person_name}</span>
                <span className="font-semibold text-slate-900">${g.total}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
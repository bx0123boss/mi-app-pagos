import { BrowserRouter, Routes, Route, Link, NavLink } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Contracts from './pages/Contracts'
import ContractDetail from './pages/ContractDetail'

const navClass = ({ isActive }) =>
  `px-4 py-2 rounded-lg text-sm font-medium transition ${
    isActive
      ? 'bg-blue-600 text-white'
      : 'text-slate-600 hover:bg-slate-100'
  }`

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50">
        <nav className="bg-white border-b border-slate-200">
          <div className="max-w-5xl mx-auto px-4 py-3 flex gap-2">
            <NavLink to="/" className={navClass} end>
              Dashboard
            </NavLink>
            <NavLink to="/contracts" className={navClass}>
              Contratos
            </NavLink>
          </div>
        </nav>
        <main className="max-w-5xl mx-auto p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/contracts" element={<Contracts />} />
            <Route path="/contracts/:id" element={<ContractDetail />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
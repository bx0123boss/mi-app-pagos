const BASE = '/api'

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || 'Error en la petición')
  }
  return res.json()
}

export const api = {
  // Contratos
  getContracts: () => request('/contracts'),
  getContract: (id) => request(`/contracts/${id}`),
  createContract: (data) =>
    request('/contracts', { method: 'POST', body: JSON.stringify(data) }),

  // Pagos
  createPayment: (data) =>
    request('/payments', { method: 'POST', body: JSON.stringify(data) }),

  // Distribuciones
  createDistribution: (data) =>
    request('/distributions', { method: 'POST', body: JSON.stringify(data) }),

  // Resumen
  getSummary: () => request('/summary'),
}
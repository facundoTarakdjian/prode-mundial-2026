import { useState } from 'react'
import { USERS } from '../constants/users'
import { useApp } from '../context/AppContext'

export default function Login() {
  const { login, addLog } = useApp()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const user = USERS.find(u => u.username === username && u.password === password)
    if (user) {
      login(user.username)
      addLog(user.username, 'Inició sesión')
    } else {
      setError('Usuario o contraseña incorrectos')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">⚽</div>
          <h1 className="text-2xl font-bold text-gray-800">Prode Mundial 2026</h1>
          <p className="text-gray-500 text-sm mt-1">USA · Canadá · México</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
            <select
              value={username}
              onChange={e => { setUsername(e.target.value); setError('') }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Seleccioná tu usuario</option>
              {USERS.map(u => (
                <option key={u.username} value={u.username}>{u.username}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError('') }}
              placeholder="Ingresá tu contraseña"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg transition-colors"
          >
            Ingresar
          </button>
        </form>
      </div>
    </div>
  )
}

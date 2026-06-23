import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { ALL_USERNAMES } from '../constants/users'

const ACTION_TYPES = [
  { label: 'Todos',            value: '' },
  { label: 'Pronóstico',       value: 'pronostico' },
  { label: 'Borró pronóstico', value: 'borro' },
  { label: 'Resultado real',   value: 'resultado' },
  { label: 'Clasificados',     value: 'clasificados' },
  { label: 'Campeón/Sub',      value: 'campeon' },
  { label: 'Configuración',    value: 'config' },
  { label: 'Otro',             value: 'otro' },
]

function matchActionType(action, type) {
  const a = action.toLowerCase()
  switch (type) {
    case 'pronostico':   return a.startsWith('pronóstico') && !a.startsWith('pronóstico eliminatoria') && !a.includes('borró')
    case 'borro':        return a.includes('borró')
    case 'resultado':    return a.startsWith('resultado real') || a.startsWith('actualizó clasificados reales') || a.startsWith('actualizó llave')
    case 'clasificados': return a.includes('clasificados') && !a.includes('reales')
    case 'campeon':      return a.includes('campeón') || a.includes('subcampeón') || a.includes('final')
    case 'config':       return a.includes('configuración')
    case 'otro':         return !['pronostico','borro','resultado','clasificados','campeon','config']
                                .some(t => matchActionType(action, t))
    default:             return true
  }
}

export default function Logs() {
  const { logs } = useApp()

  const [filterUser,   setFilterUser]   = useState('')
  const [filterAction, setFilterAction] = useState('')
  const [filterTeam,   setFilterTeam]   = useState('')

  const filtered = useMemo(() => {
    return logs.filter(log => {
      if (filterUser   && log.user !== filterUser) return false
      if (filterAction && !matchActionType(log.action, filterAction)) return false
      if (filterTeam   && !log.action.toLowerCase().includes(filterTeam.toLowerCase())) return false
      return true
    })
  }, [logs, filterUser, filterAction, filterTeam])

  const userColors = {
    Marcelo: 'bg-blue-100 text-blue-700',
    Ricardo: 'bg-purple-100 text-purple-700',
    Fran:    'bg-pink-100 text-pink-700',
    Chechu:  'bg-amber-100 text-amber-700',
    Nacho:   'bg-teal-100 text-teal-700',
  }

  const hasFilters = filterUser || filterAction || filterTeam

  return (
    <div className="bg-white rounded-2xl shadow p-5">
      <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        📋 Registro de Acciones
        <span className="text-sm font-normal text-gray-400">
          ({filtered.length}{hasFilters ? ` de ${logs.length}` : ''} entradas)
        </span>
      </h2>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-4">
        {/* Usuario */}
        <select
          value={filterUser}
          onChange={e => setFilterUser(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <option value="">Todos los usuarios</option>
          {ALL_USERNAMES.map(u => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>

        {/* Tipo de acción */}
        <select
          value={filterAction}
          onChange={e => setFilterAction(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          {ACTION_TYPES.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>

        {/* Equipo (texto libre) */}
        <div className="relative">
          <input
            type="text"
            value={filterTeam}
            onChange={e => setFilterTeam(e.target.value)}
            placeholder="Buscar equipo..."
            className="text-sm border border-gray-200 rounded-lg pl-3 pr-7 py-1.5 bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 w-44"
          />
          {filterTeam && (
            <button
              onClick={() => setFilterTeam('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
            >✕</button>
          )}
        </div>

        {/* Limpiar filtros */}
        {hasFilters && (
          <button
            onClick={() => { setFilterUser(''); setFilterAction(''); setFilterTeam('') }}
            className="text-sm text-red-400 hover:text-red-600 px-2"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center text-gray-400 py-10">
          <div className="text-4xl mb-2">🔍</div>
          <p>No hay registros que coincidan con los filtros.</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[65vh] overflow-y-auto pr-1">
          {filtered.map(log => {
            const d = new Date(log.ts)
            const dateStr = d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' })
            const timeStr = d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            const colorClass = userColors[log.user] || 'bg-gray-100 text-gray-700'
            return (
              <div key={log.id} className="flex items-start gap-3 bg-gray-50 rounded-xl px-3 py-2.5">
                <div className="text-xs text-gray-400 shrink-0 w-28 leading-5">
                  <div>{dateStr}</div>
                  <div>{timeStr}</div>
                </div>
                <span className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-full mt-0.5 ${colorClass}`}>
                  {log.user}
                </span>
                <span className="text-sm text-gray-700 leading-5">{log.action}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

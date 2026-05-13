import { useApp } from '../context/AppContext'

export default function Logs() {
  const { logs } = useApp()

  if (logs.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow p-10 text-center text-gray-400">
        <div className="text-4xl mb-2">📭</div>
        <p>No hay registros todavía.</p>
      </div>
    )
  }

  const userColors = {
    Marcelo: 'bg-blue-100 text-blue-700',
    Ricardo: 'bg-purple-100 text-purple-700',
    Fran:    'bg-pink-100 text-pink-700',
    Chechu:  'bg-amber-100 text-amber-700',
    Nacho:   'bg-teal-100 text-teal-700',
  }

  return (
    <div className="bg-white rounded-2xl shadow p-5">
      <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        📋 Registro de Acciones
        <span className="text-sm font-normal text-gray-400">({logs.length} entradas)</span>
      </h2>

      <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
        {logs.map(log => {
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
    </div>
  )
}

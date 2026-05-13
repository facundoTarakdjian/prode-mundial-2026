import { useApp } from '../context/AppContext'
import { ALL_USERNAMES } from '../constants/users'
import { GROUP_MATCHES, GROUPS, VENUES, KNOCKOUT_ROUNDS } from '../constants/fixture'

function formatDate(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('es-AR', { weekday: 'short', day: '2-digit', month: '2-digit' })
}
function formatTime(iso) {
  const d = new Date(iso)
  return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
}

function Flag({ country }) {
  // Mapa de nombre → emoji bandera (simplificado con códigos ISO)
  const flags = {
    'USA': '🇺🇸', 'Mexico': '🇲🇽', 'Canada': '🇨🇦',
    'Argentina': '🇦🇷', 'Brazil': '🇧🇷', 'Colombia': '🇨🇴',
    'Uruguay': '🇺🇾', 'Ecuador': '🇪🇨', 'Paraguay': '🇵🇾',
    'Venezuela': '🇻🇪',
    'France': '🇫🇷', 'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Spain': '🇪🇸',
    'Germany': '🇩🇪', 'Portugal': '🇵🇹', 'Netherlands': '🇳🇱',
    'Belgium': '🇧🇪', 'Italy': '🇮🇹', 'Denmark': '🇩🇰',
    'Switzerland': '🇨🇭', 'Turkey': '🇹🇷', 'Poland': '🇵🇱',
    'Croatia': '🇭🇷', 'Serbia': '🇷🇸', 'Austria': '🇦🇹',
    'Romania': '🇷🇴',
    'Japan': '🇯🇵', 'South Korea': '🇰🇷', 'Australia': '🇦🇺',
    'Iran': '🇮🇷', 'Saudi Arabia': '🇸🇦', 'Qatar': '🇶🇦',
    'Jordan': '🇯🇴', 'Iraq': '🇮🇶',
    'Morocco': '🇲🇦', 'Nigeria': '🇳🇬', 'Senegal': '🇸🇳',
    'Cameroon': '🇨🇲', 'Egypt': '🇪🇬', 'Tunisia': '🇹🇳',
    'Mali': '🇲🇱', 'South Africa': '🇿🇦', 'Ivory Coast': '🇨🇮',
    'Algeria': '🇩🇿', 'Ghana': '🇬🇭',
    'Panama': '🇵🇦', 'Honduras': '🇭🇳', 'Jamaica': '🇯🇲',
    'New Zealand': '🇳🇿',
  }
  return <span title={country}>{flags[country] || '🏳️'}</span>
}

export default function Dashboard() {
  const { calcPoints, knockoutData } = useApp()

  const standings = ALL_USERNAMES
    .map(u => ({ username: u, points: calcPoints(u) }))
    .sort((a, b) => b.points - a.points)

  // Agrupar partidos de grupos por fecha
  const matchesByDate = {}
  for (const m of GROUP_MATCHES) {
    const dateKey = m.date.slice(0, 10)
    if (!matchesByDate[dateKey]) matchesByDate[dateKey] = []
    matchesByDate[dateKey].push(m)
  }
  const sortedDates = Object.keys(matchesByDate).sort()

  return (
    <div className="space-y-6">
      {/* Tabla de posiciones */}
      <div className="bg-white rounded-2xl shadow p-5">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          🏆 Tabla de Puntos
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-green-50">
                <th className="text-left py-2 px-3 text-sm font-semibold text-gray-600">#</th>
                <th className="text-left py-2 px-3 text-sm font-semibold text-gray-600">Jugador</th>
                <th className="text-right py-2 px-3 text-sm font-semibold text-gray-600">Puntos</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((row, i) => (
                <tr key={row.username} className={`border-t border-gray-100 ${i === 0 ? 'bg-yellow-50' : ''}`}>
                  <td className="py-2.5 px-3 font-bold text-gray-500">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-gray-800">{row.username}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-green-700 text-lg">{row.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Eliminación directa */}
      {Object.keys(knockoutData).length > 0 && (
        <div className="bg-white rounded-2xl shadow p-5">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            ⚡ Eliminación Directa
          </h2>
          {KNOCKOUT_ROUNDS.map(round => {
            const matches = Object.entries(knockoutData)
              .filter(([id]) => id.startsWith(round.id + '_') && !id.includes('winner') && !id.includes('runner'))
            if (matches.length === 0) return null
            return (
              <div key={round.id} className="mb-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">{round.label}</h3>
                <div className="grid gap-2">
                  {matches.map(([id, data]) => (
                    <div key={id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm">
                      <span className="font-medium flex items-center gap-1">
                        <Flag country={data.home} /> {data.home}
                      </span>
                      <span className="text-gray-500 mx-2">
                        {data.homeGoals !== undefined ? `${data.homeGoals} - ${data.awayGoals}` : 'vs'}
                        {data.winner && <span className="ml-1 text-green-600 font-bold">→ {data.winner}</span>}
                      </span>
                      <span className="font-medium flex items-center gap-1">
                        {data.away} <Flag country={data.away} />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Fixture por grupos */}
      <div className="bg-white rounded-2xl shadow p-5">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          📅 Fase de Grupos — Cronograma
        </h2>

        {/* Grupos resumen */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-6">
          {Object.entries(GROUPS).map(([g, teams]) => (
            <div key={g} className="bg-green-50 rounded-lg p-2">
              <div className="text-xs font-bold text-green-700 mb-1">Grupo {g}</div>
              {teams.map(t => (
                <div key={t} className="text-xs text-gray-700 flex items-center gap-1">
                  <Flag country={t} /> {t}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Partidos por fecha */}
        <div className="space-y-4">
          {sortedDates.map(dateKey => (
            <div key={dateKey}>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 border-b pb-1">
                {new Date(dateKey + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </div>
              <div className="space-y-1.5">
                {matchesByDate[dateKey].map(m => (
                  <div key={m.id} className="flex items-center gap-2 text-sm bg-gray-50 rounded-lg px-3 py-2">
                    <span className="text-xs text-gray-400 w-10 shrink-0">{formatTime(m.date)}</span>
                    <span className="w-5 text-center text-xs font-bold text-green-600 shrink-0">{m.group}</span>
                    <span className="flex-1 text-right flex items-center justify-end gap-1 font-medium text-gray-800">
                      <Flag country={m.home} /> {m.home}
                    </span>
                    <span className="text-gray-400 text-xs px-1">vs</span>
                    <span className="flex-1 flex items-center gap-1 font-medium text-gray-800">
                      <Flag country={m.away} /> {m.away}
                    </span>
                    <span className="text-xs text-gray-400 hidden sm:block shrink-0 max-w-[120px] truncate" title={VENUES[m.venue]}>
                      📍{m.venue}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

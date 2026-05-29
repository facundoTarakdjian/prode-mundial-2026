import { useApp } from '../context/AppContext'
import { GROUPS, GROUP_MATCHES, KNOCKOUT_ROUNDS } from '../constants/fixture'
import Bandera from './Bandera'

const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

function formatFechaCorta(d) {
  return `${DIAS[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1} · ${d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })}hs`
}

function buildGroupStandings(teams, matches, realResults) {
  const table = {}
  for (const team of teams) {
    table[team] = { pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0 }
  }
  for (const m of matches) {
    const real = realResults[m.id]
    if (!real) continue
    const hg = real.home, ag = real.away
    table[m.home].pj++; table[m.away].pj++
    table[m.home].gf += hg; table[m.home].gc += ag
    table[m.away].gf += ag; table[m.away].gc += hg
    if (hg > ag)      { table[m.home].g++; table[m.away].p++ }
    else if (hg < ag) { table[m.away].g++; table[m.home].p++ }
    else              { table[m.home].e++; table[m.away].e++ }
  }
  return Object.entries(table)
    .map(([team, s]) => ({ team, ...s, dif: s.gf - s.gc, pts: s.g * 3 + s.e }))
    .sort((a, b) => b.pts - a.pts || b.dif - a.dif || b.gf - a.gf || a.team.localeCompare(b.team))
}

export default function Mundial() {
  const { realResults, knockoutData } = useApp()

  const sortedGroupMatches = [...GROUP_MATCHES].sort(
    (a, b) => new Date(a.date + '-03:00') - new Date(b.date + '-03:00')
  )

  const knockoutMatches = KNOCKOUT_ROUNDS.flatMap(round => {
    return Object.entries(knockoutData)
      .filter(([id, data]) =>
        id.startsWith(round.id + '_') &&
        !id.includes('winner') &&
        !id.includes('runner') &&
        data.home
      )
      .map(([id, data]) => ({ id, round: round.label, ...data }))
  })

  return (
    <div className="space-y-4">
      {/* ── Tablas de posiciones por grupo ── */}
      {Object.entries(GROUPS).map(([g, teams]) => {
        const matches    = GROUP_MATCHES.filter(m => m.group === g)
        const standings  = buildGroupStandings(teams, matches, realResults)
        return (
          <div key={g} className="bg-white rounded-2xl shadow p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                Grupo {g}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-green-50 text-xs text-gray-500 font-semibold">
                    <th className="text-left py-1.5 px-2 rounded-tl-lg">Equipo</th>
                    <th className="text-center py-1.5 px-1.5">PJ</th>
                    <th className="text-center py-1.5 px-1.5">G</th>
                    <th className="text-center py-1.5 px-1.5">E</th>
                    <th className="text-center py-1.5 px-1.5">P</th>
                    <th className="text-center py-1.5 px-1.5">GF</th>
                    <th className="text-center py-1.5 px-1.5">GC</th>
                    <th className="text-center py-1.5 px-1.5">DIF</th>
                    <th className="text-center py-1.5 px-2 text-green-700 rounded-tr-lg">PTS</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((row, i) => (
                    <tr
                      key={row.team}
                      className={`border-t border-gray-100 ${i < 2 ? 'bg-green-50/50' : ''}`}
                    >
                      <td className="py-2 px-2">
                        <div className="flex items-center gap-1.5">
                          <Bandera pais={row.team} />
                          <span className="font-medium text-gray-800 text-xs leading-tight">{row.team}</span>
                        </div>
                      </td>
                      <td className="py-2 px-1.5 text-center text-gray-600">{row.pj}</td>
                      <td className="py-2 px-1.5 text-center text-gray-600">{row.g}</td>
                      <td className="py-2 px-1.5 text-center text-gray-600">{row.e}</td>
                      <td className="py-2 px-1.5 text-center text-gray-600">{row.p}</td>
                      <td className="py-2 px-1.5 text-center text-gray-600">{row.gf}</td>
                      <td className="py-2 px-1.5 text-center text-gray-600">{row.gc}</td>
                      <td className="py-2 px-1.5 text-center text-gray-600 tabular-nums">
                        {row.dif > 0 ? `+${row.dif}` : row.dif}
                      </td>
                      <td className="py-2 px-2 text-center font-bold text-green-700">{row.pts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      })}

      {/* ── Eliminación directa ── */}
      {knockoutMatches.length > 0 && (
        <div className="bg-white rounded-2xl shadow p-4">
          <h2 className="text-base font-bold text-gray-800 mb-4">⚡ Eliminación Directa</h2>
          <div className="space-y-2">
            {knockoutMatches.map(m => (
              <div key={m.id} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                <div className="text-xs text-gray-400 text-center mb-2 font-medium">{m.round}</div>
                <div className="grid grid-cols-3 items-center gap-2">
                  <div className="flex flex-col items-center text-center gap-1">
                    <Bandera pais={m.home} />
                    <span className="text-sm font-semibold text-gray-800">{m.home}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    {m.homeGoals != null ? (
                      <>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xl font-bold text-gray-800">{m.homeGoals}</span>
                          <span className="text-gray-400 font-bold">-</span>
                          <span className="text-xl font-bold text-gray-800">{m.awayGoals}</span>
                        </div>
                        {m.winner && (
                          <span className="text-xs text-green-700 font-semibold">Pasa: {m.winner}</span>
                        )}
                      </>
                    ) : (
                      <span className="text-gray-300 font-bold text-lg">vs</span>
                    )}
                  </div>
                  <div className="flex flex-col items-center text-center gap-1">
                    <Bandera pais={m.away} />
                    <span className="text-sm font-semibold text-gray-800">{m.away}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Fixture de grupos ── */}
      <div className="bg-white rounded-2xl shadow p-4">
        <h2 className="text-base font-bold text-gray-800 mb-4">📅 Fixture — Fase de Grupos</h2>
        <div className="space-y-2">
          {sortedGroupMatches.map(m => {
            const real = realResults[m.id]
            const d    = new Date(m.date + '-03:00')
            return (
              <div
                key={m.id}
                className={`rounded-xl border p-3 ${real ? 'bg-gray-50 border-gray-100' : 'bg-green-50 border-green-100'}`}
              >
                <div className="grid grid-cols-3 items-center gap-2">
                  {/* Local */}
                  <div className="flex flex-col items-center text-center gap-1">
                    <Bandera pais={m.home} />
                    <span className="text-sm font-semibold text-gray-800">{m.home}</span>
                  </div>
                  {/* Centro */}
                  <div className="flex flex-col items-center gap-1">
                    {real != null ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xl font-bold text-gray-800">{real.home}</span>
                        <span className="text-gray-400 font-bold">-</span>
                        <span className="text-xl font-bold text-gray-800">{real.away}</span>
                      </div>
                    ) : (
                      <span className="text-gray-300 font-bold text-lg">vs</span>
                    )}
                    <div className="text-center">
                      <span className="bg-green-600 text-white text-xs font-bold px-1.5 py-0.5 rounded mr-1">
                        {m.group}
                      </span>
                      <span className="text-xs text-gray-400">{formatFechaCorta(d)}</span>
                    </div>
                  </div>
                  {/* Visitante */}
                  <div className="flex flex-col items-center text-center gap-1">
                    <Bandera pais={m.away} />
                    <span className="text-sm font-semibold text-gray-800">{m.away}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

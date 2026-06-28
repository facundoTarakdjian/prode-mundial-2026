import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { GROUPS, GROUP_MATCHES } from '../constants/fixture'
import Bandera from './Bandera'
import Bracket from './Bracket'

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
  const [activeTab, setActiveTab] = useState('bracket')

  return (
    <div className="space-y-4">
      {/* ── Nav tabs ── */}
      <div className="bg-white rounded-2xl shadow p-1 flex gap-1">
        {[
          { id: 'groups',  label: '🏆 Grupos'  },
          { id: 'bracket', label: '⚡ Llave'   },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex-1 py-2 px-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === t.id ? 'bg-green-600 text-white shadow' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── GRUPOS ── */}
      {activeTab === 'groups' && Object.entries(GROUPS).map(([g, teams]) => {
        const matches   = GROUP_MATCHES.filter(m => m.group === g)
        const standings = buildGroupStandings(teams, matches, realResults)
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
                    <tr key={row.team} className={`border-t border-gray-100 ${i < 2 ? 'bg-green-50/50' : ''}`}>
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

      {/* ── LLAVE ── */}
      {activeTab === 'bracket' && (
        <div className="bg-white rounded-2xl shadow p-3">
          <Bracket knockoutData={knockoutData} />
        </div>
      )}

    </div>
  )
}

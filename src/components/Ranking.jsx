import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { ALL_USERNAMES } from '../constants/users'
import { GROUP_MATCHES, KNOCKOUT_ROUNDS, KNOCKOUT_MATCH_DATES, R32_FIXTURE } from '../constants/fixture'
import Bandera from './Bandera'

const MUNDIAL_START = '2026-06-11T16:00:00-03:00'
const sign = (a, b) => a > b ? 1 : a < b ? -1 : 0

function isMundialStarted() {
  return new Date() >= new Date(MUNDIAL_START)
}

function isKnockoutMatchLocked(matchId) {
  const dateUtc = KNOCKOUT_MATCH_DATES[matchId]
  if (!dateUtc) return false
  return new Date() >= new Date(dateUtc)
}

export default function Ranking() {
  const { predictions, realResults, realQualifiers, knockoutData, scoring, calcPoints } = useApp()
  const [activeSection, setActiveSection] = useState('knockout')

  const standings = ALL_USERNAMES
    .map(u => ({ username: u, points: calcPoints(u) }))
    .sort((a, b) => b.points - a.points)

  // Partidos bloqueados (comenzaron), independientemente de si hay resultado real
  const lockedGroupMatches = GROUP_MATCHES
    .filter(m => new Date() >= new Date(m.date + '-03:00'))
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  const pointsForGroupMatch = (username, matchId) => {
    const pred = predictions[username]?.groups?.[matchId]
    const real = realResults[matchId]
    if (!real || !pred || pred.home === '' || pred.away === '') return null
    if (sign(parseInt(pred.home), parseInt(pred.away)) !== sign(real.home, real.away)) return 0
    const base  = scoring.exactResult
    const exact = parseInt(pred.home) === real.home && parseInt(pred.away) === real.away
      ? (scoring.groupExact ?? 0) : 0
    return base + exact
  }

  const sections = [
    { id: 'groups',    label: '⚽ Grupos' },
    { id: 'qualified', label: '🎯 Clasificados' },
    { id: 'champion',  label: '🏆 Campeón' },
    { id: 'knockout',  label: '⚡ Eliminación' },
  ]

  return (
    <div className="space-y-4">
      {/* ── Tabla de puntos ── */}
      <div className="bg-white rounded-2xl shadow p-5">
        <h2 className="text-lg font-bold text-gray-800 mb-4">🏆 Tabla de Puntos</h2>
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

      {/* ── Sub-tabs historial ── */}
      <div className="bg-white rounded-2xl shadow p-1 flex gap-1 flex-wrap">
        {sections.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-colors ${
              activeSection === s.id
                ? 'bg-green-600 text-white shadow'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* ── GRUPOS ── */}
      {activeSection === 'groups' && (
        <div className="space-y-4">
          {lockedGroupMatches.length === 0 ? (
            <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-400 text-sm">
              Aún no comenzó ningún partido.
            </div>
          ) : (
            [...lockedGroupMatches]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map(m => {
              const real = realResults[m.id] ?? null
              return (
                <div key={m.id} className="bg-white rounded-2xl shadow p-4">
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                    {/* Cabecera: equipos + resultado (o pendiente) */}
                    <div className="grid grid-cols-3 items-center gap-2 pb-3 border-b border-gray-200 mb-3">
                      <div className="flex flex-col items-center text-center gap-1">
                        <Bandera pais={m.home} />
                        <span className="text-sm font-semibold text-gray-800">{m.home}</span>
                      </div>
                      <div className="flex flex-col items-center gap-0.5">
                        {real ? (
                          <>
                            <div className="flex items-center gap-2">
                              <span className="text-2xl font-bold text-gray-800">{real.home}</span>
                              <span className="text-gray-400 font-bold text-lg">-</span>
                              <span className="text-2xl font-bold text-gray-800">{real.away}</span>
                            </div>
                            <span className="text-xs text-gray-400">Resultado final</span>
                          </>
                        ) : (
                          <>
                            <span className="text-gray-300 font-bold text-lg">? - ?</span>
                            <span className="text-xs text-amber-500">Pendiente</span>
                          </>
                        )}
                      </div>
                      <div className="flex flex-col items-center text-center gap-1">
                        <Bandera pais={m.away} />
                        <span className="text-sm font-semibold text-gray-800">{m.away}</span>
                      </div>
                    </div>
                    {/* Pronósticos de jugadores */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                      {ALL_USERNAMES.map(username => {
                        const pred    = predictions[username]?.groups?.[m.id]
                        const pts     = pointsForGroupMatch(username, m.id) // null si no hay resultado real
                        const exact   = pts !== null && pts > scoring.exactResult  // resultado exacto (pts extra)
                        const hit     = pts === scoring.exactResult                // ganador/empate sin exacto
                        const miss    = pts === 0
                        return (
                          <div
                            key={username}
                            className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs ${
                              exact ? 'bg-yellow-100' : hit ? 'bg-green-100' : miss ? 'bg-red-50' : 'bg-white border border-gray-100'
                            }`}
                          >
                            <span className="font-semibold text-gray-700">{username}</span>
                            <span className={`font-bold ${exact ? 'text-yellow-700' : hit ? 'text-green-700' : miss ? 'text-red-400' : 'text-gray-400'}`}>
                              {pred ? `${pred.home}-${pred.away}` : '—'}
                              {pts !== null
                                ? <span className="ml-1">· {pts}pt</span>
                                : pred
                                  ? <span className="ml-1 text-gray-300">· ?pt</span>
                                  : null
                              }
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* ── CLASIFICADOS ── */}
      {activeSection === 'qualified' && (
        <div className="bg-white rounded-2xl shadow p-5">
          <h3 className="font-bold text-gray-800 mb-1">Clasificados a 16avos</h3>
          {!isMundialStarted() ? (
            <p className="text-sm text-gray-400 text-center py-6">
              Los pronósticos se revelan cuando comienza el Mundial.
            </p>
          ) : (
            <>
              {realQualifiers.length === 0 && (
                <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mb-4">
                  El admin aún no cargó los clasificados reales — los puntos aparecerán cuando se carguen.
                </p>
              )}
              <div className="space-y-3">
                {ALL_USERNAMES.map(username => {
                  const preds   = predictions[username]?.qualifiers || []
                  const hasReal = realQualifiers.length > 0
                  const hits    = hasReal ? preds.filter(c => realQualifiers.includes(c)).length : null
                  const pts     = hits !== null ? hits * scoring.qualifierHit : null
                  return (
                    <div key={username} className="rounded-xl border border-gray-100 p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-800">{username}</span>
                        <span className="text-sm font-bold text-green-700">
                          {pts !== null
                            ? `${hits} aciertos · ${pts} pts`
                            : `${preds.length}/32 elegidos`
                          }
                        </span>
                      </div>
                      {preds.length === 0 ? (
                        <p className="text-xs text-gray-300">No guardó clasificados.</p>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {/* Mostrar TODOS los pronosticados por el jugador:
                              verde+tilde si clasificó, gris+tachado si no clasificó */}
                          {preds.map(country => {
                            const hit  = hasReal ? realQualifiers.includes(country) : null
                            return (
                              <span
                                key={country}
                                className={`text-xs px-2 py-0.5 rounded-full border ${
                                  hit === true  ? 'bg-green-100 text-green-700 border-green-200' :
                                  hit === false ? 'bg-gray-50 text-gray-400 border-gray-100 line-through' :
                                  'bg-green-50 text-green-700 border-green-200'
                                }`}
                              >
                                {hit === true ? '✓ ' : ''}{country}
                              </span>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── CAMPEÓN ── */}
      {activeSection === 'champion' && (
        <div className="bg-white rounded-2xl shadow p-5">
          <h3 className="font-bold text-gray-800 mb-1">Campeón y Subcampeón</h3>
          {!isMundialStarted() ? (
            <p className="text-sm text-gray-400 text-center py-6">
              Los pronósticos se revelan cuando comienza el Mundial.
            </p>
          ) : (
            <>
              {knockoutData['F_winner'] ? (
                <div className="flex gap-6 mb-4 p-3 bg-green-50 rounded-xl">
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">Campeón real</div>
                    <div className="font-bold text-green-800">🥇 {knockoutData['F_winner']}</div>
                  </div>
                  {knockoutData['F_runner_up'] && (
                    <div>
                      <div className="text-xs text-gray-500 mb-0.5">Subcampeón real</div>
                      <div className="font-bold text-gray-700">🥈 {knockoutData['F_runner_up']}</div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mb-4">
                  El campeón aún no está definido — los puntos aparecerán cuando termine la final.
                </p>
              )}
              <div className="space-y-2">
                {ALL_USERNAMES.map(username => {
                  const champ   = predictions[username]?.champion    || ''
                  const sub     = predictions[username]?.subchampion || ''
                  const hasReal = !!knockoutData['F_winner']
                  const ptsC    = hasReal && champ === knockoutData['F_winner']    ? scoring.champion    : 0
                  const ptsS    = hasReal && sub   === knockoutData['F_runner_up'] ? scoring.subchampion : 0
                  const total   = ptsC + ptsS
                  return (
                    <div
                      key={username}
                      className={`flex items-center justify-between rounded-xl border px-3 py-2.5 ${
                        hasReal && total > 0 ? 'bg-green-50 border-green-200' : 'border-gray-100'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-gray-800 text-sm">{username}</div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          🥇 {champ || <span className="text-gray-300">—</span>}
                          {' · '}
                          🥈 {sub   || <span className="text-gray-300">—</span>}
                        </div>
                      </div>
                      <span className={`text-sm font-bold ${!hasReal ? 'text-gray-300' : total > 0 ? 'text-green-700' : 'text-gray-400'}`}>
                        {hasReal ? `${total} pts` : '? pts'}
                      </span>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── ELIMINACIÓN ── */}
      {activeSection === 'knockout' && (() => {
        // Partidos bloqueados: combinar R32_FIXTURE (equipos ya definidos) con knockoutData
        const r32Locked = R32_FIXTURE
          .filter(f => isKnockoutMatchLocked(f.id))
          .map(f => [f.id, { home: f.home, away: f.away, ...knockoutData[f.id] }])
        const otherLocked = Object.entries(knockoutData).filter(
          ([id, data]) =>
            !id.includes('winner') && !id.includes('runner') &&
            !id.startsWith('R32_') &&
            data.home && isKnockoutMatchLocked(id)
        )
        const definedMatches = [...r32Locked, ...otherLocked]
        if (definedMatches.length === 0) {
          return (
            <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-400 text-sm">
              Aún no hay cruces de eliminación definidos.
            </div>
          )
        }
        return (
          <div className="space-y-4">
            {KNOCKOUT_ROUNDS.map(round => {
              const matches = definedMatches.filter(([id]) => id.startsWith(round.id + '_'))
              if (matches.length === 0) return null
              return (
                <div key={round.id} className="bg-white rounded-2xl shadow p-4">
                  <h3 className="font-bold text-gray-700 mb-3">{round.label}</h3>
                  <div className="space-y-3">
                    {matches.map(([matchId, matchData]) => {
                      const hasResult = matchData.winner != null
                      return (
                        <div key={matchId} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                          {/* Resultado o pendiente */}
                          <div className="grid grid-cols-3 items-center gap-2 pb-3 border-b border-gray-200 mb-3">
                            <div className="flex flex-col items-center text-center gap-1">
                              <Bandera pais={matchData.home} />
                              <span className="text-sm font-semibold text-gray-800">{matchData.home}</span>
                            </div>
                            <div className="flex flex-col items-center gap-0.5">
                              {hasResult ? (
                                <>
                                  <div className="flex items-center gap-2">
                                    <span className="text-2xl font-bold text-gray-800">{matchData.homeGoals ?? '?'}</span>
                                    <span className="text-gray-400 font-bold text-lg">-</span>
                                    <span className="text-2xl font-bold text-gray-800">{matchData.awayGoals ?? '?'}</span>
                                  </div>
                                  <span className="text-xs text-green-700 font-semibold">Pasa: {matchData.winner}</span>
                                </>
                              ) : (
                                <>
                                  <span className="text-gray-300 font-bold text-lg">? - ?</span>
                                  <span className="text-xs text-amber-500">Pendiente</span>
                                </>
                              )}
                            </div>
                            <div className="flex flex-col items-center text-center gap-1">
                              <Bandera pais={matchData.away} />
                              <span className="text-sm font-semibold text-gray-800">{matchData.away}</span>
                            </div>
                          </div>
                          {/* Pronósticos de jugadores */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
                            {ALL_USERNAMES.map(username => {
                              const pred = predictions[username]?.knockout?.[matchId]
                              const ptsW = hasResult && pred?.winner === matchData.winner ? scoring.knockoutWinner : 0
                              const ptsR = hasResult && (
                                pred?.homeGoals !== undefined && pred?.awayGoals !== undefined &&
                                matchData.homeGoals != null && matchData.awayGoals != null &&
                                parseInt(pred.homeGoals) === matchData.homeGoals &&
                                parseInt(pred.awayGoals) === matchData.awayGoals
                              ) ? scoring.knockoutResult : 0
                              const total = ptsW + ptsR
                              const hit   = hasResult && total > 0
                              const miss  = hasResult && total === 0 && pred
                              return (
                                <div
                                  key={username}
                                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs ${
                                    hit ? 'bg-green-100' : miss ? 'bg-red-50' : 'bg-white border border-gray-100'
                                  }`}
                                >
                                  <span className="font-semibold text-gray-700 w-2/5 truncate">{username}</span>
                                  <span className={`font-bold text-right ${hit ? 'text-green-700' : miss ? 'text-red-400' : 'text-gray-400'}`}>
                                    {pred
                                      ? `${pred.homeGoals ?? '?'}-${pred.awayGoals ?? '?'}${pred.winner ? ` · ${pred.winner}` : ''}`
                                      : '—'
                                    }
                                    {hasResult && pred && <span className="ml-1">· {total}pt</span>}
                                    {!hasResult && pred && <span className="ml-1 text-gray-300">· ?pt</span>}
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )
      })()}
    </div>
  )
}

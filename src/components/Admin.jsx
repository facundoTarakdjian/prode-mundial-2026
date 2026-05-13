import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { GROUP_MATCHES, GROUPS, ALL_COUNTRIES, KNOCKOUT_ROUNDS } from '../constants/fixture'
import { DEFAULT_SCORING } from '../constants/storage'

export default function Admin() {
  const {
    session,
    realResults, setRealResult,
    realQualifiers, setRealQualifiersData,
    knockoutData, setKnockoutMatch,
    scoring, updateScoring,
  } = useApp()

  const [activeSection, setActiveSection] = useState('results')
  const [localScoring,  setLocalScoring]  = useState({ ...scoring })
  const [savedScoring,  setSavedScoring]  = useState(false)

  // Local override state for form inputs (empty = fallback to context value)
  const [resultInputs, setResultInputs] = useState({})
  const [knockInputs,  setKnockInputs]  = useState({})

  // ── Resultados reales ─────────────────────────────────
  const saveResult = async (matchId) => {
    const inp  = resultInputs[matchId] || {}
    const home = inp.home ?? realResults[matchId]?.home?.toString() ?? ''
    const away = inp.away ?? realResults[matchId]?.away?.toString() ?? ''
    if (home === '' || away === '') return
    await setRealResult(matchId, parseInt(home), parseInt(away), session)
  }

  // ── Clasificados reales ───────────────────────────────
  const toggleRealQualifier = async (country) => {
    const isSelected = realQualifiers.includes(country)
    if (!isSelected && realQualifiers.length >= 32) return
    const next = isSelected
      ? realQualifiers.filter(c => c !== country)
      : [...realQualifiers, country]
    await setRealQualifiersData(next, session)
  }

  // ── Eliminación directa ───────────────────────────────
  const saveKnockMatch = async (matchId) => {
    const kd    = knockoutData[matchId]
    const inp   = knockInputs[matchId] || {}
    const home  = inp.home      ?? kd?.home      ?? ''
    const away  = inp.away      ?? kd?.away      ?? ''
    if (!home || !away) return

    const data = {
      home,
      away,
      ...(inp.homeGoals != null ? { homeGoals: inp.homeGoals } : kd?.homeGoals != null ? { homeGoals: kd.homeGoals } : {}),
      ...(inp.awayGoals != null ? { awayGoals: inp.awayGoals } : kd?.awayGoals != null ? { awayGoals: kd.awayGoals } : {}),
      winner: inp.winner ?? kd?.winner ?? '',
    }

    if (matchId === 'F_1' && data.winner) {
      const runnerUp = data.winner === data.home ? data.away : data.home
      await setKnockoutMatch('F_winner',    data.winner, session)
      await setKnockoutMatch('F_runner_up', runnerUp,    session)
    }
    await setKnockoutMatch(matchId, data, session)
  }

  // ── Puntuación ────────────────────────────────────────
  const saveScoring = async () => {
    await updateScoring(localScoring, session)
    setSavedScoring(true)
    setTimeout(() => setSavedScoring(false), 2000)
  }

  const sections = [
    { id: 'results',    label: '📋 Resultados' },
    { id: 'qualifiers', label: '🎯 Clasificados' },
    { id: 'knockout',   label: '⚡ Eliminación' },
    { id: 'scoring',    label: '⚙️ Puntuación' },
  ]

  return (
    <div className="space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 text-sm text-amber-800 font-medium">
        🔐 Panel de administración — Solo visible para Chechu
      </div>

      <div className="bg-white rounded-2xl shadow p-1 flex gap-1 flex-wrap">
        {sections.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`flex-1 py-2 px-2 rounded-xl text-sm font-medium transition-colors ${
              activeSection === s.id ? 'bg-amber-500 text-white shadow' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* ── RESULTADOS DE GRUPOS ── */}
      {activeSection === 'results' && (
        <div className="space-y-4">
          {Object.entries(GROUPS).map(([g]) => {
            const matches = GROUP_MATCHES.filter(m => m.group === g)
            return (
              <div key={g} className="bg-white rounded-2xl shadow p-4">
                <div className="text-sm font-bold text-gray-700 mb-3">Grupo {g}</div>
                <div className="space-y-2">
                  {matches.map(m => {
                    const saved = realResults[m.id]
                    const inp   = resultInputs[m.id] || {}
                    const displayHome = inp.home ?? saved?.home?.toString() ?? ''
                    const displayAway = inp.away ?? saved?.away?.toString() ?? ''
                    return (
                      <div key={m.id} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                        <span className="flex-1 text-right text-sm font-medium text-gray-800">{m.home}</span>
                        <input
                          type="number" min="0" max="20"
                          value={displayHome}
                          onChange={e => setResultInputs(prev => ({ ...prev, [m.id]: { ...(prev[m.id] || {}), home: e.target.value }}))}
                          className="w-12 text-center border border-amber-300 rounded px-1 py-0.5 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-amber-400"
                        />
                        <span className="text-gray-400 text-xs">-</span>
                        <input
                          type="number" min="0" max="20"
                          value={displayAway}
                          onChange={e => setResultInputs(prev => ({ ...prev, [m.id]: { ...(prev[m.id] || {}), away: e.target.value }}))}
                          className="w-12 text-center border border-amber-300 rounded px-1 py-0.5 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-amber-400"
                        />
                        <span className="flex-1 text-sm font-medium text-gray-800">{m.away}</span>
                        <button
                          onClick={() => saveResult(m.id)}
                          className="shrink-0 bg-amber-500 hover:bg-amber-600 text-white text-xs px-2.5 py-1 rounded-lg transition-colors"
                        >
                          {saved ? '✓ Guardado' : 'Guardar'}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── CLASIFICADOS REALES ── */}
      {activeSection === 'qualifiers' && (
        <div className="bg-white rounded-2xl shadow p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-800">Clasificados a 16avos (reales)</h2>
            <span className={`text-sm font-bold px-2 py-1 rounded-full ${
              realQualifiers.length === 32 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
              {realQualifiers.length}/32
            </span>
          </div>
          {Object.entries(GROUPS).map(([g, teams]) => (
            <div key={g} className="mb-3">
              <div className="text-xs font-semibold text-gray-400 uppercase mb-1">Grupo {g}</div>
              <div className="flex flex-wrap gap-2">
                {teams.map(country => {
                  const selected = realQualifiers.includes(country)
                  const disabled = !selected && realQualifiers.length >= 32
                  return (
                    <button
                      key={country}
                      onClick={() => toggleRealQualifier(country)}
                      disabled={disabled}
                      className={`text-sm px-3 py-1 rounded-full border transition-all ${
                        selected
                          ? 'bg-amber-500 text-white border-amber-500'
                          : disabled
                          ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-amber-400'
                      }`}
                    >
                      {country}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── ELIMINACIÓN DIRECTA ── */}
      {activeSection === 'knockout' && (
        <div className="space-y-4">
          {KNOCKOUT_ROUNDS.map(round => (
            <div key={round.id} className="bg-white rounded-2xl shadow p-4">
              <h3 className="font-bold text-gray-700 mb-3">{round.label}</h3>
              <div className="space-y-4">
                {Array.from({ length: round.matchCount }, (_, i) => {
                  const matchId = `${round.id}_${i + 1}`
                  const kd      = knockoutData[matchId]
                  const inp     = knockInputs[matchId] || {}
                  const displayHome      = inp.home      ?? kd?.home      ?? ''
                  const displayAway      = inp.away      ?? kd?.away      ?? ''
                  const displayHomeGoals = inp.homeGoals ?? kd?.homeGoals?.toString() ?? ''
                  const displayAwayGoals = inp.awayGoals ?? kd?.awayGoals?.toString() ?? ''
                  const displayWinner    = inp.winner    ?? kd?.winner    ?? ''
                  const update = (field, val) => setKnockInputs(prev => ({ ...prev, [matchId]: { ...(prev[matchId] || {}), [field]: val } }))
                  return (
                    <div key={matchId} className="bg-gray-50 rounded-xl p-3 space-y-2">
                      <div className="text-xs text-gray-400 font-medium">Llave {i + 1}</div>

                      <div className="flex gap-2 items-center">
                        <select
                          value={displayHome}
                          onChange={e => update('home', e.target.value)}
                          className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-amber-400"
                        >
                          <option value="">Local</option>
                          {ALL_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <span className="text-gray-400 text-xs">vs</span>
                        <select
                          value={displayAway}
                          onChange={e => update('away', e.target.value)}
                          className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-amber-400"
                        >
                          <option value="">Visitante</option>
                          {ALL_COUNTRIES.filter(c => c !== displayHome).map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 w-16 shrink-0">Resultado 90':</span>
                        <input
                          type="number" min="0" max="20"
                          value={displayHomeGoals}
                          onChange={e => update('homeGoals', e.target.value)}
                          placeholder="?"
                          className="w-12 text-center border border-amber-300 rounded px-1 py-0.5 text-sm font-bold focus:outline-none"
                        />
                        <span className="text-gray-400 text-xs">-</span>
                        <input
                          type="number" min="0" max="20"
                          value={displayAwayGoals}
                          onChange={e => update('awayGoals', e.target.value)}
                          placeholder="?"
                          className="w-12 text-center border border-amber-300 rounded px-1 py-0.5 text-sm font-bold focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 w-16 shrink-0">Quién pasa:</span>
                        <select
                          value={displayWinner}
                          onChange={e => update('winner', e.target.value)}
                          className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-amber-400"
                        >
                          <option value="">— Seleccioná —</option>
                          {displayHome && <option value={displayHome}>{displayHome}</option>}
                          {displayAway && <option value={displayAway}>{displayAway}</option>}
                        </select>
                      </div>

                      <button
                        onClick={() => saveKnockMatch(matchId)}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white text-sm py-1.5 rounded-lg transition-colors font-medium"
                      >
                        {kd ? '✓ Actualizar llave' : 'Guardar llave'}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── PUNTUACIÓN ── */}
      {activeSection === 'scoring' && (
        <div className="bg-white rounded-2xl shadow p-5">
          <h2 className="text-base font-bold text-gray-800 mb-4">Configuración de Puntuación</h2>
          <div className="space-y-3">
            {[
              { key: 'exactResult',    label: 'Ganador o empate (grupos)',         icon: '⚽' },
              { key: 'qualifierHit',   label: 'Cada clasificado a 16avos',         icon: '🎯' },
              { key: 'champion',       label: 'Campeón del mundo',                 icon: '🥇' },
              { key: 'subchampion',    label: 'Subcampeón',                        icon: '🥈' },
              { key: 'knockoutWinner', label: 'Quién pasa (elim. directa)',        icon: '⚡' },
              { key: 'knockoutResult', label: 'Resultado en 90\' (elim. directa)', icon: '🕐' },
            ].map(({ key, label, icon }) => (
              <div key={key} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                <span className="text-xl">{icon}</span>
                <span className="flex-1 text-sm font-medium text-gray-700">{label}</span>
                <input
                  type="number" min="0" max="100"
                  value={localScoring[key]}
                  onChange={e => setLocalScoring(prev => ({ ...prev, [key]: parseInt(e.target.value) || 0 }))}
                  className="w-16 text-center border border-amber-300 rounded-lg px-2 py-1 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
                <span className="text-sm text-gray-500">ptos</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-5">
            <button
              onClick={() => setLocalScoring({ ...DEFAULT_SCORING })}
              className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-xl text-sm hover:bg-gray-50 transition-colors"
            >
              Restablecer defaults
            </button>
            <button
              onClick={saveScoring}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
                savedScoring ? 'bg-green-500 text-white' : 'bg-amber-500 hover:bg-amber-600 text-white'
              }`}
            >
              {savedScoring ? '✓ Guardado' : 'Guardar configuración'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

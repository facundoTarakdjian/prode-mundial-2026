import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { GROUP_MATCHES, GROUPS, ALL_COUNTRIES, KNOCKOUT_ROUNDS } from '../constants/fixture'

function isMatchLocked(dateIso) {
  return new Date() >= new Date(dateIso)
}

function ScoreInput({ value, onChange, locked }) {
  return (
    <input
      type="number"
      min="0"
      max="20"
      value={value}
      onChange={e => onChange(e.target.value)}
      disabled={locked}
      className={`w-12 text-center border rounded px-1 py-0.5 text-sm font-bold
        ${locked ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white border-green-300 focus:ring-1 focus:ring-green-400 focus:outline-none'}`}
    />
  )
}

export default function MisPronósticos() {
  const {
    session, getPrediction,
    updateGroupPred, togglePredQualifier,
    updateChampionPred, updateSubchampionPred,
    updateKnockoutPred,
    knockoutData,
  } = useApp()

  const [activeSection, setActiveSection] = useState('groups')

  const groupPreds  = getPrediction(session, 'groups', {})
  const qualPreds   = getPrediction(session, 'qualifiers', [])
  const champion    = getPrediction(session, 'champion', '')
  const subchampion = getPrediction(session, 'subchampion', '')
  const knockPreds  = getPrediction(session, 'knockout', {})

  // ── Grupos ────────────────────────────────────────────
  const handleGroupScore = (matchId, side, val) => {
    const match = GROUP_MATCHES.find(m => m.id === matchId)
    if (isMatchLocked(match.date)) return
    const current = groupPreds[matchId] || { home: '', away: '' }
    const home = side === 'home' ? val : current.home
    const away = side === 'away' ? val : current.away
    updateGroupPred(session, matchId, home, away)
  }

  // ── Clasificados ──────────────────────────────────────
  const handleToggleQualifier = (country) => {
    const isSelected = qualPreds.includes(country)
    if (!isSelected && qualPreds.length >= 32) return
    togglePredQualifier(session, country, !isSelected)
  }

  // ── Eliminación directa ───────────────────────────────
  const handleKnockoutField = (matchId, field, val) => {
    const current = knockPreds[matchId] || {}
    updateKnockoutPred(session, matchId, { ...current, [field]: val })
  }

  const sections = [
    { id: 'groups',    label: '⚽ Grupos' },
    { id: 'qualified', label: '🎯 Clasificados' },
    { id: 'champion',  label: '🏆 Campeón' },
    { id: 'knockout',  label: '⚡ Eliminación' },
  ]

  return (
    <div className="space-y-4">
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

      {/* ── SECCIÓN GRUPOS ── */}
      {activeSection === 'groups' && (
        <div className="space-y-4">
          {Object.entries(GROUPS).map(([g, teams]) => {
            const matches = GROUP_MATCHES.filter(m => m.group === g)
            return (
              <div key={g} className="bg-white rounded-2xl shadow p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">Grupo {g}</span>
                  <span className="text-xs text-gray-500">{teams.join(' · ')}</span>
                </div>
                <div className="space-y-2">
                  {matches.map(m => {
                    const locked = isMatchLocked(m.date)
                    const pred   = groupPreds[m.id] || { home: '', away: '' }
                    const d = new Date(m.date)
                    return (
                      <div key={m.id} className={`flex items-center gap-2 rounded-lg px-3 py-2 ${locked ? 'bg-gray-50' : 'bg-green-50'}`}>
                        <span className="text-xs text-gray-400 w-24 shrink-0">
                          {d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })} {d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="flex-1 text-right text-sm font-medium text-gray-800">{m.home}</span>
                        <ScoreInput value={pred.home} onChange={v => handleGroupScore(m.id, 'home', v)} locked={locked} />
                        <span className="text-gray-400 text-xs">-</span>
                        <ScoreInput value={pred.away} onChange={v => handleGroupScore(m.id, 'away', v)} locked={locked} />
                        <span className="flex-1 text-sm font-medium text-gray-800">{m.away}</span>
                        {locked && <span className="text-xs text-red-400">🔒</span>}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── SECCIÓN CLASIFICADOS ── */}
      {activeSection === 'qualified' && (
        <div className="bg-white rounded-2xl shadow p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-800">32 Clasificados a 16avos</h2>
            <span className={`text-sm font-bold px-2 py-1 rounded-full ${
              qualPreds.length === 32 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
              {qualPreds.length}/32
            </span>
          </div>
          <p className="text-xs text-gray-500 mb-4">Seleccioná exactamente 32 países que creés que van a clasificar.</p>
          {Object.entries(GROUPS).map(([g, teams]) => (
            <div key={g} className="mb-3">
              <div className="text-xs font-semibold text-gray-400 uppercase mb-1">Grupo {g}</div>
              <div className="flex flex-wrap gap-2">
                {teams.map(country => {
                  const selected = qualPreds.includes(country)
                  const disabled = !selected && qualPreds.length >= 32
                  return (
                    <button
                      key={country}
                      onClick={() => handleToggleQualifier(country)}
                      disabled={disabled}
                      className={`text-sm px-3 py-1 rounded-full border transition-all ${
                        selected
                          ? 'bg-green-600 text-white border-green-600'
                          : disabled
                          ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-green-400'
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

      {/* ── SECCIÓN CAMPEÓN ── */}
      {activeSection === 'champion' && (
        <div className="bg-white rounded-2xl shadow p-5 space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">🥇 Campeón del Mundo</label>
            <select
              value={champion}
              onChange={e => updateChampionPred(session, e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">— Seleccioná un país —</option>
              {ALL_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">🥈 Subcampeón</label>
            <select
              value={subchampion}
              onChange={e => updateSubchampionPred(session, e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">— Seleccioná un país —</option>
              {ALL_COUNTRIES.filter(c => c !== champion).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          {champion && subchampion && (
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <p className="text-sm text-gray-600">Tu final: <strong>{champion}</strong> vs <strong>{subchampion}</strong></p>
              <p className="text-xs text-gray-400 mt-1">Ganador: {champion}</p>
            </div>
          )}
        </div>
      )}

      {/* ── SECCIÓN ELIMINACIÓN DIRECTA ── */}
      {activeSection === 'knockout' && (
        <div className="space-y-4">
          {KNOCKOUT_ROUNDS.map(round => {
            const roundMatches = Object.entries(knockoutData)
              .filter(([id]) => id.startsWith(round.id + '_') && !id.includes('winner') && !id.includes('runner'))
            if (roundMatches.length === 0) {
              return (
                <div key={round.id} className="bg-white rounded-2xl shadow p-4 text-center text-gray-400 text-sm">
                  <span className="font-semibold">{round.label}</span> — los cruces aún no están definidos
                </div>
              )
            }
            return (
              <div key={round.id} className="bg-white rounded-2xl shadow p-4">
                <h3 className="font-bold text-gray-700 mb-3">{round.label}</h3>
                <div className="space-y-3">
                  {roundMatches.map(([matchId, matchData]) => {
                    const pred = knockPreds[matchId] || {}
                    return (
                      <div key={matchId} className="bg-gray-50 rounded-xl p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="flex-1 text-right text-sm font-medium">{matchData.home}</span>
                          <input
                            type="number" min="0" max="20"
                            value={pred.homeGoals ?? ''}
                            onChange={e => handleKnockoutField(matchId, 'homeGoals', e.target.value)}
                            className="w-12 text-center border border-green-300 rounded px-1 py-0.5 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-green-400"
                            placeholder="?"
                          />
                          <span className="text-gray-400 text-xs">-</span>
                          <input
                            type="number" min="0" max="20"
                            value={pred.awayGoals ?? ''}
                            onChange={e => handleKnockoutField(matchId, 'awayGoals', e.target.value)}
                            className="w-12 text-center border border-green-300 rounded px-1 py-0.5 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-green-400"
                            placeholder="?"
                          />
                          <span className="flex-1 text-sm font-medium">{matchData.away}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">¿Quién pasa?</span>
                          <select
                            value={pred.winner || ''}
                            onChange={e => handleKnockoutField(matchId, 'winner', e.target.value)}
                            className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-green-400"
                          >
                            <option value="">— Seleccioná —</option>
                            <option value={matchData.home}>{matchData.home}</option>
                            <option value={matchData.away}>{matchData.away}</option>
                          </select>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

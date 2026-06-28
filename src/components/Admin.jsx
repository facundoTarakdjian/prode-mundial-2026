import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { GROUP_MATCHES, GROUPS, ALL_COUNTRIES, KNOCKOUT_ROUNDS, R32_FIXTURE, R16_FIXTURE } from '../constants/fixture'
import { DEFAULT_SCORING } from '../constants/storage'

export default function Admin() {
  const {
    session,
    realResults, setRealResult, deleteRealResult,
    realQualifiers, setRealQualifiersData,
    knockoutData, setKnockoutMatch, deleteKnockoutMatch,
    scoring, updateScoring,
  } = useApp()

  const [activeSection,       setActiveSection]       = useState('results')
  const [activeKnockoutRound, setActiveKnockoutRound] = useState('R32')
  const [localScoring,        setLocalScoring]        = useState({ ...scoring })
  const [saveState,           setSaveState]           = useState(null)   // null | 'ok' | 'error'
  const [saveErrMsg,          setSaveErrMsg]          = useState('')
  const [knockSaveState,      setKnockSaveState]      = useState({})     // { matchId: 'ok'|'error'|null }

  // Sincronizar localScoring cuando el contexto carga/actualiza scoring desde Supabase.
  // Esto evita el race condition donde el componente monta antes de que loadScoring termine
  // y queda con DEFAULT_SCORING en lugar de los valores reales.
  useEffect(() => {
    setLocalScoring({ ...scoring })
  }, [scoring])

  // Local override state for form inputs (empty = fallback to context value)
  const [resultInputs, setResultInputs] = useState({})
  const [knockInputs,  setKnockInputs]  = useState({})

  // ── Resultados reales ─────────────────────────────────
  const deleteResult = async (matchId) => {
    await deleteRealResult(matchId, session)
    setResultInputs(prev => { const n = { ...prev }; delete n[matchId]; return n })
  }

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
    const kd     = knockoutData[matchId]
    const inp    = knockInputs[matchId] || {}
    const r32fix = R32_FIXTURE.find(f => f.id === matchId)
    const home   = inp.home ?? kd?.home ?? r32fix?.home ?? ''
    const away   = inp.away ?? kd?.away ?? r32fix?.away ?? ''
    if (!home || !away) return

    const hgRaw = inp.homeGoals ?? kd?.homeGoals?.toString() ?? ''
    const agRaw = inp.awayGoals ?? kd?.awayGoals?.toString() ?? ''
    if (hgRaw === '' || agRaw === '') return

    const hg = parseInt(hgRaw)
    const ag = parseInt(agRaw)

    // Ganador: lo que Chechu eligió en el dropdown, o auto-sugerencia si los goles difieren
    const autoWinner = hg > ag ? home : ag > hg ? away : ''
    const winner = inp.winner !== undefined ? inp.winner : (autoWinner || kd?.winner || '')
    if (!winner) {
      setKnockSaveState(prev => ({ ...prev, [matchId]: 'error' }))
      setTimeout(() => setKnockSaveState(prev => ({ ...prev, [matchId]: null })), 2500)
      return
    }

    const data = { home, away, homeGoals: hg, awayGoals: ag, winner }

    try {
      if (matchId === 'F_1' && winner) {
        const runnerUp = winner === home ? away : home
        await setKnockoutMatch('F_winner',    winner,    session)
        await setKnockoutMatch('F_runner_up', runnerUp,  session)
      }
      await setKnockoutMatch(matchId, data, session)
      setKnockSaveState(prev => ({ ...prev, [matchId]: 'ok' }))
    } catch (err) {
      console.error('Error guardando llave', matchId, err)
      setKnockSaveState(prev => ({ ...prev, [matchId]: 'error' }))
    } finally {
      setTimeout(() => setKnockSaveState(prev => ({ ...prev, [matchId]: null })), 2500)
    }
  }

  // ── Puntuación ────────────────────────────────────────
  const saveScoring = async () => {
    setSaveErrMsg('')
    try {
      await updateScoring(localScoring, session)
      setSaveState('ok')
    } catch (err) {
      console.error('Error guardando configuración de puntos:', err)
      setSaveErrMsg(err?.message || JSON.stringify(err))
      setSaveState('error')
    } finally {
      setTimeout(() => setSaveState(null), 2500)
    }
  }

  const handleDeleteKnock = async (matchId) => {
    const kd     = knockoutData[matchId]
    if (!kd) return   // nada que borrar
    const inp    = knockInputs[matchId] || {}
    const r32fix = R32_FIXTURE.find(f => f.id === matchId)
    const home   = inp.home ?? kd?.home ?? r32fix?.home ?? matchId
    const away   = inp.away ?? kd?.away ?? r32fix?.away ?? matchId
    if (!window.confirm(`¿Borrar el resultado de ${home} vs ${away}? Esto eliminará la propagación a rondas siguientes.`)) return
    try {
      await deleteKnockoutMatch(matchId, session)
      setKnockSaveState(prev => ({ ...prev, [matchId]: 'ok' }))
    } catch (err) {
      console.error('Error borrando llave', matchId, err)
      setKnockSaveState(prev => ({ ...prev, [matchId]: 'error' }))
    } finally {
      setTimeout(() => setKnockSaveState(prev => ({ ...prev, [matchId]: null })), 2500)
    }
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
                          {saved ? '✓ Guardar' : 'Guardar'}
                        </button>
                        {saved && (
                          <button
                            onClick={() => deleteResult(m.id)}
                            className="shrink-0 bg-red-100 hover:bg-red-200 text-red-600 text-xs px-2 py-1 rounded-lg transition-colors"
                          >
                            Borrar
                          </button>
                        )}
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
        <div className="space-y-3">
          {/* Sub-nav de rondas */}
          <div className="bg-white rounded-2xl shadow p-1 flex gap-1">
            {[
              { id: 'R32', label: '16avos' },
              { id: 'R16', label: '8avos'  },
              { id: 'QF',  label: 'Cuartos' },
              { id: 'SF',  label: 'Semis'  },
              { id: 'F',   label: 'Final'  },
            ].map(r => (
              <button
                key={r.id}
                onClick={() => setActiveKnockoutRound(r.id)}
                className={`flex-1 py-2 px-1 rounded-xl text-xs font-medium transition-colors ${
                  activeKnockoutRound === r.id
                    ? 'bg-amber-500 text-white shadow'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Contenido de la ronda activa */}
          {KNOCKOUT_ROUNDS.filter(r => r.id === activeKnockoutRound).map(round => {
            if (round.id === 'R32') {
              return (
                <div key={round.id} className="bg-white rounded-2xl shadow p-4">
                  <h3 className="font-bold text-gray-700 mb-1">{round.label}</h3>
                  <p className="text-xs text-gray-400 mb-3">Equipos "Por definir" se actualizan al confirmar los grupos.</p>
                  <div className="space-y-3">
                    {R32_FIXTURE.map((fixture, i) => {
                      const matchId = fixture.id
                      const kd  = knockoutData[matchId]
                      const inp = knockInputs[matchId] || {}
                      const displayHome      = inp.home      ?? kd?.home      ?? fixture.home
                      const displayAway      = inp.away      ?? kd?.away      ?? fixture.away
                      const displayHomeGoals = inp.homeGoals ?? kd?.homeGoals?.toString() ?? ''
                      const displayAwayGoals = inp.awayGoals ?? kd?.awayGoals?.toString() ?? ''
                      const update = (field, val) => setKnockInputs(prev => ({ ...prev, [matchId]: { ...(prev[matchId] || {}), [field]: val } }))
                      const dateAR = new Date(fixture.date)
                      const fechaLabel = `${['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'][dateAR.getDay()]} ${dateAR.getDate()}/${dateAR.getMonth()+1} ${dateAR.toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit',hour12:false})} hs`
                      const selectHomeVal = displayHome.startsWith('Por definir') ? '' : displayHome
                      const selectAwayVal = displayAway.startsWith('Por definir') ? '' : displayAway
                      const hgNum = displayHomeGoals !== '' ? parseInt(displayHomeGoals) : NaN
                      const agNum = displayAwayGoals !== '' ? parseInt(displayAwayGoals) : NaN
                      const autoWinner = !isNaN(hgNum) && !isNaN(agNum)
                        ? (hgNum > agNum ? selectHomeVal : agNum > hgNum ? selectAwayVal : '') : ''
                      const displayWinner = inp.winner !== undefined ? inp.winner : (autoWinner || kd?.winner || '')
                      const saveKS = knockSaveState[matchId]
                      return (
                        <div key={matchId} className="bg-gray-50 rounded-xl px-3 py-2 space-y-1.5">
                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <span className="font-medium">Llave {i + 1} · {fixture.city}</span>
                            <span>{fechaLabel}</span>
                          </div>
                          {/* Mobile: flex-col / Desktop: flex-row */}
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-1.5">
                            <select
                              value={selectHomeVal}
                              onChange={e => update('home', e.target.value || fixture.home)}
                              className="w-full sm:flex-1 sm:min-w-0 border border-gray-300 rounded px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-amber-400"
                            >
                              <option value="">— Local —</option>
                              {ALL_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            {/* Score: fila centrada en mobile, inline en desktop */}
                            <div className="flex items-center justify-center gap-1.5 sm:contents">
                              <input
                                type="number" min="0" max="20"
                                value={displayHomeGoals}
                                onChange={e => update('homeGoals', e.target.value)}
                                placeholder="?"
                                className="w-12 sm:w-10 text-center border border-amber-300 rounded px-1 py-1 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-amber-400 shrink-0"
                              />
                              <span className="text-gray-400 text-xs shrink-0">-</span>
                              <input
                                type="number" min="0" max="20"
                                value={displayAwayGoals}
                                onChange={e => update('awayGoals', e.target.value)}
                                placeholder="?"
                                className="w-12 sm:w-10 text-center border border-amber-300 rounded px-1 py-1 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-amber-400 shrink-0"
                              />
                            </div>
                            <select
                              value={selectAwayVal}
                              onChange={e => update('away', e.target.value || fixture.away)}
                              className="w-full sm:flex-1 sm:min-w-0 border border-gray-300 rounded px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-amber-400"
                            >
                              <option value="">— Visitante —</option>
                              {ALL_COUNTRIES.filter(c => c !== selectHomeVal).map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            {/* Botones: 50/50 en mobile, shrink-0 en desktop */}
                            <div className="flex gap-1.5 sm:contents">
                              <button
                                onClick={() => saveKnockMatch(matchId)}
                                className={`flex-1 sm:flex-none sm:shrink-0 text-xs px-2.5 py-1.5 sm:py-1 rounded-lg transition-colors font-medium text-white ${
                                  saveKS === 'ok'    ? 'bg-green-500' :
                                  saveKS === 'error' ? 'bg-red-500'   :
                                  'bg-amber-500 hover:bg-amber-600'
                                }`}
                              >
                                {saveKS === 'ok' ? '✓ Guardado' : saveKS === 'error' ? '✗ Error' : '✓ Guardar'}
                              </button>
                              <button
                                onClick={() => handleDeleteKnock(matchId)}
                                className={`flex-1 sm:flex-none sm:shrink-0 px-2 py-1.5 sm:py-1 rounded-lg text-xs font-medium transition-colors ${
                                  kd ? 'bg-red-100 hover:bg-red-200 text-red-600' : 'bg-gray-100 text-gray-300 cursor-default'
                                }`}
                              >
                                Borrar
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 shrink-0">¿Quién pasa?</span>
                            <select
                              value={displayWinner}
                              onChange={e => update('winner', e.target.value)}
                              className="flex-1 border border-gray-300 rounded px-2 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-400"
                            >
                              <option value="">— Seleccioná —</option>
                              {selectHomeVal
                                ? <option value={selectHomeVal}>{selectHomeVal}</option>
                                : <option value="" disabled>— Local —</option>
                              }
                              {selectAwayVal && selectAwayVal !== selectHomeVal
                                ? <option value={selectAwayVal}>{selectAwayVal}</option>
                                : !selectAwayVal && <option value="" disabled>— Visitante —</option>
                              }
                            </select>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            }

            // R16, QF, SF, F
            return (
              <div key={round.id} className="bg-white rounded-2xl shadow p-4">
                <h3 className="font-bold text-gray-700 mb-3">{round.label}</h3>
                <div className="space-y-3">
                  {Array.from({ length: round.matchCount }, (_, i) => {
                    const matchId = `${round.id}_${i + 1}`
                    const kd  = knockoutData[matchId]
                    const inp = knockInputs[matchId] || {}
                    const displayHome      = inp.home      ?? kd?.home      ?? ''
                    const displayAway      = inp.away      ?? kd?.away      ?? ''
                    const displayHomeGoals = inp.homeGoals ?? kd?.homeGoals?.toString() ?? ''
                    const displayAwayGoals = inp.awayGoals ?? kd?.awayGoals?.toString() ?? ''
                    const update = (field, val) => setKnockInputs(prev => ({ ...prev, [matchId]: { ...(prev[matchId] || {}), [field]: val } }))
                    const r16fix = round.id === 'R16' ? R16_FIXTURE[i] : null
                    const hgNum = displayHomeGoals !== '' ? parseInt(displayHomeGoals) : NaN
                    const agNum = displayAwayGoals !== '' ? parseInt(displayAwayGoals) : NaN
                    const autoWinner = !isNaN(hgNum) && !isNaN(agNum)
                      ? (hgNum > agNum ? displayHome : agNum > hgNum ? displayAway : '') : ''
                    const displayWinner = inp.winner !== undefined ? inp.winner : (autoWinner || kd?.winner || '')
                    const saveKS = knockSaveState[matchId]
                    return (
                      <div key={matchId} className="bg-gray-50 rounded-xl px-3 py-2 space-y-1.5">
                        {r16fix && (
                          <div className="text-xs text-gray-400 font-medium">Llave {i + 1} · {r16fix.city}</div>
                        )}
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-1.5">
                          <select
                            value={displayHome}
                            onChange={e => update('home', e.target.value)}
                            className="w-full sm:flex-1 sm:min-w-0 border border-gray-300 rounded px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-amber-400"
                          >
                            <option value="">— Local —</option>
                            {ALL_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                          <div className="flex items-center justify-center gap-1.5 sm:contents">
                            <input
                              type="number" min="0" max="20"
                              value={displayHomeGoals}
                              onChange={e => update('homeGoals', e.target.value)}
                              placeholder="?"
                              className="w-12 sm:w-10 text-center border border-amber-300 rounded px-1 py-1 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-amber-400 shrink-0"
                            />
                            <span className="text-gray-400 text-xs shrink-0">-</span>
                            <input
                              type="number" min="0" max="20"
                              value={displayAwayGoals}
                              onChange={e => update('awayGoals', e.target.value)}
                              placeholder="?"
                              className="w-12 sm:w-10 text-center border border-amber-300 rounded px-1 py-1 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-amber-400 shrink-0"
                            />
                          </div>
                          <select
                            value={displayAway}
                            onChange={e => update('away', e.target.value)}
                            className="w-full sm:flex-1 sm:min-w-0 border border-gray-300 rounded px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-amber-400"
                          >
                            <option value="">— Visitante —</option>
                            {ALL_COUNTRIES.filter(c => c !== displayHome).map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                          <div className="flex gap-1.5 sm:contents">
                            <button
                              onClick={() => saveKnockMatch(matchId)}
                              className={`flex-1 sm:flex-none sm:shrink-0 text-xs px-2.5 py-1.5 sm:py-1 rounded-lg transition-colors font-medium text-white ${
                                saveKS === 'ok'    ? 'bg-green-500' :
                                saveKS === 'error' ? 'bg-red-500'   :
                                'bg-amber-500 hover:bg-amber-600'
                              }`}
                            >
                              {saveKS === 'ok' ? '✓ Guardado' : saveKS === 'error' ? '✗ Error' : '✓ Guardar'}
                            </button>
                            <button
                              onClick={() => handleDeleteKnock(matchId)}
                              className={`flex-1 sm:flex-none sm:shrink-0 px-2 py-1.5 sm:py-1 rounded-lg text-xs font-medium transition-colors ${
                                kd ? 'bg-red-100 hover:bg-red-200 text-red-600' : 'bg-gray-100 text-gray-300 cursor-default'
                              }`}
                            >
                              Borrar
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 shrink-0">¿Quién pasa?</span>
                          <select
                            value={displayWinner}
                            onChange={e => update('winner', e.target.value)}
                            className="flex-1 border border-gray-300 rounded px-2 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-400"
                          >
                            <option value="">— Seleccioná —</option>
                            {displayHome && <option value={displayHome}>{displayHome}</option>}
                            {displayAway && displayAway !== displayHome && <option value={displayAway}>{displayAway}</option>}
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

      {/* ── PUNTUACIÓN ── */}
      {activeSection === 'scoring' && (
        <div className="bg-white rounded-2xl shadow p-5">
          <h2 className="text-base font-bold text-gray-800 mb-4">Configuración de Puntuación</h2>
          <div className="space-y-3">
            {[
              { key: 'exactResult',    label: 'Ganador o empate (grupos)',         icon: '⚽' },
              { key: 'groupExact',     label: 'Resultado exacto (grupos)',          icon: '🎯' },
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
                saveState === 'ok'    ? 'bg-green-500 text-white' :
                saveState === 'error' ? 'bg-red-500 text-white'   :
                'bg-amber-500 hover:bg-amber-600 text-white'
              }`}
            >
              {saveState === 'ok'    ? '✓ Guardado'         :
               saveState === 'error' ? '✗ Error al guardar' :
               'Guardar configuración'}
            </button>
          </div>
          {saveErrMsg && (
            <p className="mt-2 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 break-all">
              Error Supabase: {saveErrMsg}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

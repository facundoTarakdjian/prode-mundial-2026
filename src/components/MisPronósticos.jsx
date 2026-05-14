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
    session, predictions,
    updateGroupPred, deleteGroupPred,
    saveQualifiersBulk,
    updateFinal,
    updateKnockoutPred,
    knockoutData,
  } = useApp()

  const [activeSection, setActiveSection] = useState('groups')

  // ── Estado local grupos ───────────────────────────────
  const [groupInputs,  setGroupInputs]  = useState({}) // { [matchId]: { home, away } }
  const [savedGroups,  setSavedGroups]  = useState({}) // { [matchId]: true } indicador breve

  // ── Estado local clasificados ─────────────────────────
  const [qualDraft,   setQualDraft]   = useState(null)  // null = sin cambios
  const [qualSaving,  setQualSaving]  = useState(false)
  const [qualSaved,   setQualSaved]   = useState(false)

  // ── Estado local campeón ──────────────────────────────
  const [champLocal,  setChampLocal]  = useState(null)  // { champion, subchampion } o null
  const [champSaving, setChampSaving] = useState(false)
  const [champSaved,  setChampSaved]  = useState(false)

  // ── Estado local eliminatorias ────────────────────────
  const [knockInputs, setKnockInputs] = useState({})
  const [savedKnock,  setSavedKnock]  = useState({})

  // Datos guardados del usuario
  const saved = predictions[session] || { groups: {}, qualifiers: [], champion: '', subchampion: '', knockout: {} }
  const groupPreds  = saved.groups      || {}
  const qualPreds   = saved.qualifiers  || []
  const champion    = saved.champion    || ''
  const subchampion = saved.subchampion || ''
  const knockPreds  = saved.knockout    || {}

  // Valores a mostrar para clasificados y campeón
  const displayQuals       = qualDraft  ?? qualPreds
  const displayChampion    = champLocal?.champion    ?? champion
  const displaySubchampion = champLocal?.subchampion ?? subchampion

  // ── Handlers grupos ───────────────────────────────────
  const handleGroupInput = (matchId, side, val) => {
    const match = GROUP_MATCHES.find(m => m.id === matchId)
    if (isMatchLocked(match.date)) return
    setGroupInputs(prev => ({ ...prev, [matchId]: { ...(prev[matchId] || {}), [side]: val } }))
  }

  const handleSaveGroup = async (matchId) => {
    const inp    = groupInputs[matchId] || {}
    const cur    = groupPreds[matchId]  || { home: '', away: '' }
    const home   = inp.home !== undefined ? inp.home : cur.home
    const away   = inp.away !== undefined ? inp.away : cur.away
    await updateGroupPred(session, matchId, home, away)
    setGroupInputs(prev => { const n = { ...prev }; delete n[matchId]; return n })
    setSavedGroups(prev => ({ ...prev, [matchId]: true }))
    setTimeout(() => setSavedGroups(prev => { const n = { ...prev }; delete n[matchId]; return n }), 2000)
  }

  const handleDeleteGroup = async (matchId) => {
    await deleteGroupPred(session, matchId)
    setGroupInputs(prev => { const n = { ...prev }; delete n[matchId]; return n })
  }

  // ── Handlers clasificados ─────────────────────────────
  const handleToggleQualifier = (country) => {
    const base       = qualDraft ?? [...qualPreds]
    const isSelected = base.includes(country)
    if (!isSelected && base.length >= 32) return
    setQualDraft(isSelected ? base.filter(c => c !== country) : [...base, country])
  }

  const handleSaveQualifiers = async () => {
    if (!qualDraft || qualSaving) return
    setQualSaving(true)
    try {
      await saveQualifiersBulk(session, qualDraft)
      setQualDraft(null)
      setQualSaved(true)
      setTimeout(() => setQualSaved(false), 2000)
    } finally {
      setQualSaving(false)
    }
  }

  // ── Handlers campeón ──────────────────────────────────
  const handleChampionInput = val => {
    setChampLocal(prev => ({ ...(prev ?? { champion, subchampion }), champion: val }))
  }
  const handleSubchampionInput = val => {
    setChampLocal(prev => ({ ...(prev ?? { champion, subchampion }), subchampion: val }))
  }

  const handleSaveChampion = async () => {
    if (!champLocal || champSaving) return
    setChampSaving(true)
    try {
      await updateFinal(session, champLocal.champion, champLocal.subchampion)
      setChampLocal(null)
      setChampSaved(true)
      setTimeout(() => setChampSaved(false), 2000)
    } finally {
      setChampSaving(false)
    }
  }

  // ── Handlers eliminatorias ────────────────────────────
  const handleKnockInput = (matchId, field, val) => {
    setKnockInputs(prev => ({ ...prev, [matchId]: { ...(prev[matchId] || {}), [field]: val } }))
  }

  const handleSaveKnock = async (matchId) => {
    const inp  = knockInputs[matchId] || {}
    const cur  = knockPreds[matchId]  || {}
    const data = {
      homeGoals: inp.homeGoals !== undefined ? inp.homeGoals : (cur.homeGoals ?? ''),
      awayGoals: inp.awayGoals !== undefined ? inp.awayGoals : (cur.awayGoals ?? ''),
      winner:    inp.winner    !== undefined ? inp.winner    : (cur.winner    ?? ''),
    }
    await updateKnockoutPred(session, matchId, data)
    setKnockInputs(prev => { const n = { ...prev }; delete n[matchId]; return n })
    setSavedKnock(prev => ({ ...prev, [matchId]: true }))
    setTimeout(() => setSavedKnock(prev => { const n = { ...prev }; delete n[matchId]; return n }), 2000)
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
                    const locked      = isMatchLocked(m.date)
                    const inp         = groupInputs[m.id] || {}
                    const cur         = groupPreds[m.id]  || { home: '', away: '' }
                    const displayHome = inp.home !== undefined ? inp.home : cur.home
                    const displayAway = inp.away !== undefined ? inp.away : cur.away
                    const isLocalDirty = !!groupInputs[m.id]
                    const hasSaved     = !!groupPreds[m.id]
                    const justSaved    = !!savedGroups[m.id]
                    const d = new Date(m.date)
                    return (
                      <div key={m.id} className={`rounded-lg px-3 py-2 ${locked ? 'bg-gray-50' : 'bg-green-50'}`}>
                        {/* Fila del partido */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 w-24 shrink-0">
                            {d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })} {d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="flex-1 text-right text-sm font-medium text-gray-800 truncate">{m.home}</span>
                          <ScoreInput value={displayHome} onChange={v => handleGroupInput(m.id, 'home', v)} locked={locked} />
                          <span className="text-gray-400 text-xs">-</span>
                          <ScoreInput value={displayAway} onChange={v => handleGroupInput(m.id, 'away', v)} locked={locked} />
                          <span className="flex-1 text-sm font-medium text-gray-800 truncate">{m.away}</span>
                          {locked && <span className="text-xs text-red-400 shrink-0">🔒</span>}
                        </div>
                        {/* Fila de acciones */}
                        {!locked && (
                          <div className="flex justify-end gap-1.5 mt-1.5">
                            <button
                              onClick={() => handleSaveGroup(m.id)}
                              disabled={!isLocalDirty}
                              className={`text-xs px-3 py-1 rounded-lg font-medium transition-colors ${
                                justSaved
                                  ? 'bg-green-100 text-green-700'
                                  : isLocalDirty
                                  ? 'bg-green-500 hover:bg-green-600 text-white'
                                  : hasSaved
                                  ? 'bg-green-100 text-green-700 cursor-default'
                                  : 'bg-gray-100 text-gray-400 cursor-default'
                              }`}
                            >
                              {justSaved ? '✓ Guardado' : isLocalDirty ? 'Guardar' : hasSaved ? '✓ Guardado' : 'Guardar'}
                            </button>
                            {hasSaved && (
                              <button
                                onClick={() => handleDeleteGroup(m.id)}
                                className="text-xs px-2.5 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 transition-colors"
                              >
                                Borrar
                              </button>
                            )}
                          </div>
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

      {/* ── SECCIÓN CLASIFICADOS ── */}
      {activeSection === 'qualified' && (
        <div className="bg-white rounded-2xl shadow p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-800">32 Clasificados a 16avos</h2>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold px-2 py-1 rounded-full ${
                displayQuals.length === 32 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {displayQuals.length}/32
              </span>
              <button
                onClick={handleSaveQualifiers}
                disabled={!qualDraft || qualSaving}
                className={`text-sm px-3 py-1.5 rounded-xl font-medium transition-colors ${
                  qualSaved
                    ? 'bg-green-100 text-green-700'
                    : qualDraft
                    ? 'bg-green-500 hover:bg-green-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-400 cursor-default'
                }`}
              >
                {qualSaved ? '✓ Guardado' : qualSaving ? 'Guardando...' : qualDraft ? 'Guardar selección' : '✓ Guardado'}
              </button>
            </div>
          </div>
          {qualDraft && (
            <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mb-3">
              Tenés cambios sin guardar — presioná "Guardar selección" para confirmar.
            </p>
          )}
          <p className="text-xs text-gray-500 mb-4">Seleccioná exactamente 32 países que creés que van a clasificar.</p>
          {Object.entries(GROUPS).map(([g, teams]) => (
            <div key={g} className="mb-3">
              <div className="text-xs font-semibold text-gray-400 uppercase mb-1">Grupo {g}</div>
              <div className="flex flex-wrap gap-2">
                {teams.map(country => {
                  const selected = displayQuals.includes(country)
                  const disabled = !selected && displayQuals.length >= 32
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
              value={displayChampion}
              onChange={e => handleChampionInput(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">— Seleccioná un país —</option>
              {ALL_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">🥈 Subcampeón</label>
            <select
              value={displaySubchampion}
              onChange={e => handleSubchampionInput(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">— Seleccioná un país —</option>
              {ALL_COUNTRIES.filter(c => c !== displayChampion).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          {champLocal && (
            <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
              Tenés cambios sin guardar.
            </p>
          )}
          {displayChampion && displaySubchampion && (
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <p className="text-sm text-gray-600">Tu final: <strong>{displayChampion}</strong> vs <strong>{displaySubchampion}</strong></p>
              <p className="text-xs text-gray-400 mt-1">Ganador: {displayChampion}</p>
            </div>
          )}
          <button
            onClick={handleSaveChampion}
            disabled={!champLocal || champSaving}
            className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              champSaved
                ? 'bg-green-100 text-green-700'
                : champLocal
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-gray-100 text-gray-400 cursor-default'
            }`}
          >
            {champSaved ? '✓ Guardado' : champSaving ? 'Guardando...' : champLocal ? 'Guardar campeón y subcampeón' : '✓ Guardado'}
          </button>
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
                    const inp  = knockInputs[matchId] || {}
                    const cur  = knockPreds[matchId]  || {}
                    const displayHG = inp.homeGoals !== undefined ? inp.homeGoals : (cur.homeGoals ?? '')
                    const displayAG = inp.awayGoals !== undefined ? inp.awayGoals : (cur.awayGoals ?? '')
                    const displayW  = inp.winner    !== undefined ? inp.winner    : (cur.winner    ?? '')
                    const isLocalDirty = !!knockInputs[matchId]
                    const justSaved    = !!savedKnock[matchId]
                    return (
                      <div key={matchId} className="bg-gray-50 rounded-xl p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="flex-1 text-right text-sm font-medium">{matchData.home}</span>
                          <input
                            type="number" min="0" max="20"
                            value={displayHG}
                            onChange={e => handleKnockInput(matchId, 'homeGoals', e.target.value)}
                            className="w-12 text-center border border-green-300 rounded px-1 py-0.5 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-green-400"
                            placeholder="?"
                          />
                          <span className="text-gray-400 text-xs">-</span>
                          <input
                            type="number" min="0" max="20"
                            value={displayAG}
                            onChange={e => handleKnockInput(matchId, 'awayGoals', e.target.value)}
                            className="w-12 text-center border border-green-300 rounded px-1 py-0.5 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-green-400"
                            placeholder="?"
                          />
                          <span className="flex-1 text-sm font-medium">{matchData.away}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 shrink-0">¿Quién pasa?</span>
                          <select
                            value={displayW}
                            onChange={e => handleKnockInput(matchId, 'winner', e.target.value)}
                            className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-green-400"
                          >
                            <option value="">— Seleccioná —</option>
                            <option value={matchData.home}>{matchData.home}</option>
                            <option value={matchData.away}>{matchData.away}</option>
                          </select>
                        </div>
                        <button
                          onClick={() => handleSaveKnock(matchId)}
                          disabled={!isLocalDirty}
                          className={`w-full py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            justSaved
                              ? 'bg-green-100 text-green-700'
                              : isLocalDirty
                              ? 'bg-green-500 hover:bg-green-600 text-white'
                              : knockPreds[matchId]
                              ? 'bg-green-100 text-green-700 cursor-default'
                              : 'bg-gray-100 text-gray-400 cursor-default'
                          }`}
                        >
                          {justSaved ? '✓ Guardado' : isLocalDirty ? 'Guardar' : knockPreds[matchId] ? '✓ Guardado' : 'Guardar'}
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
    </div>
  )
}

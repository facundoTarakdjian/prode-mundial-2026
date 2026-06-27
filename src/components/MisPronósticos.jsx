import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { GROUP_MATCHES, GROUPS, ALL_COUNTRIES, KNOCKOUT_MATCH_DATES, R32_FIXTURE, R16_FIXTURE, QF_FIXTURE, SF_FIXTURE, F_FIXTURE } from '../constants/fixture'
import Bandera from './Bandera'

const ALL_KO_FIXTURES = { R32: R32_FIXTURE, R16: R16_FIXTURE, QF: QF_FIXTURE, SF: SF_FIXTURE, F: F_FIXTURE }

// Primer partido del Mundial — bloqueo global de clasificados y campeón
const MUNDIAL_START = '2026-06-11T16:00:00-03:00'

function isMatchLocked(dateIso) {
  // Fechas del fixture están en UTC-3 (Argentina), forzamos offset explícito
  return new Date() >= new Date(dateIso + '-03:00')
}

function isMundialStarted() {
  return new Date() >= new Date(MUNDIAL_START)
}

function isKnockoutMatchLocked(matchId) {
  const dateUtc = KNOCKOUT_MATCH_DATES[matchId]
  if (!dateUtc) return false
  return new Date() >= new Date(dateUtc)
}

const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

function formatFecha(d) {
  const dia = DIAS[d.getDay()]
  const fecha = `${d.getDate()}/${d.getMonth() + 1}`
  const hora = d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })
  return `${dia} ${fecha} · ${hora} hs`
}

function ScoreInput({ value, onChange, locked }) {
  const num = value === '' ? '' : Number(value)
  const handleUp   = () => { if (!locked) onChange(String(Math.min(20, (num === '' ? 0 : num) + 1))) }
  const handleDown = () => { if (!locked) onChange(String(Math.max(0,  (num === '' ? 0 : num) - 1))) }
  return (
    <div className="flex flex-col items-center gap-0.5">
      <button
        type="button"
        onClick={handleUp}
        disabled={locked}
        className={`w-8 h-6 flex items-center justify-center rounded text-xs font-bold leading-none
          ${locked ? 'text-gray-300 cursor-not-allowed' : 'text-green-700 hover:bg-green-100 active:bg-green-200'}`}
      >▲</button>
      <input
        type="number"
        min="0"
        max="20"
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={locked}
        className={`w-12 text-center border-2 rounded-lg py-1 text-xl font-bold
          ${locked ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-white border-green-300 focus:border-green-500 focus:ring-0 focus:outline-none'}`}
      />
      <button
        type="button"
        onClick={handleDown}
        disabled={locked || num === 0 || num === ''}
        className={`w-8 h-6 flex items-center justify-center rounded text-xs font-bold leading-none
          ${locked || num === 0 || num === '' ? 'text-gray-300 cursor-not-allowed' : 'text-green-700 hover:bg-green-100 active:bg-green-200'}`}
      >▼</button>
    </div>
  )
}

export default function MisPronósticos() {
  const {
    session, predictions,
    updateGroupPred, deleteGroupPred,
    saveQualifiersBulk,
    updateFinal,
    updateKnockoutPred, deleteKnockoutPred,
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
  const [knockInputs,        setKnockInputs]        = useState({})
  const [savedKnock,         setSavedKnock]         = useState({})
  const [activeKnockoutRound, setActiveKnockoutRound] = useState(() => {
    const now = new Date()
    for (const rid of ['R32', 'R16', 'QF', 'SF', 'F']) {
      if (ALL_KO_FIXTURES[rid].some(f => new Date(f.date) > now)) return rid
    }
    return 'F'
  })

  // ── Errores de validación ─────────────────────────────
  const [groupErrors, setGroupErrors] = useState({}) // { [matchId]: string }
  const [knockErrors, setKnockErrors] = useState({}) // { [matchId]: string }

  // ── Orden vista grupos ────────────────────────────────
  const [groupOrder, setGroupOrder] = useState('group') // 'group' | 'date'

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
    if (groupErrors[matchId]) setGroupErrors(prev => { const n = { ...prev }; delete n[matchId]; return n })
  }

  const handleSaveGroup = async (matchId) => {
    const inp  = groupInputs[matchId] || {}
    const cur  = groupPreds[matchId]  || { home: '', away: '' }
    const home = inp.home !== undefined ? inp.home : cur.home
    const away = inp.away !== undefined ? inp.away : cur.away
    if (home === '' || home == null || away === '' || away == null) {
      setGroupErrors(prev => ({ ...prev, [matchId]: 'Completá ambos resultados antes de guardar' }))
      return
    }
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
    if (knockErrors[matchId]) setKnockErrors(prev => { const n = { ...prev }; delete n[matchId]; return n })
  }

  const handleDeleteKnock = async (matchId) => {
    await deleteKnockoutPred(session, matchId)
    setKnockInputs(prev => { const n = { ...prev }; delete n[matchId]; return n })
  }

  const handleSaveKnock = async (matchId) => {
    const inp  = knockInputs[matchId] || {}
    const cur  = knockPreds[matchId]  || {}
    const data = {
      homeGoals: inp.homeGoals !== undefined ? inp.homeGoals : (cur.homeGoals ?? ''),
      awayGoals: inp.awayGoals !== undefined ? inp.awayGoals : (cur.awayGoals ?? ''),
      winner:    inp.winner    !== undefined ? inp.winner    : (cur.winner    ?? ''),
    }
    if (data.homeGoals === '' || data.homeGoals == null || data.awayGoals === '' || data.awayGoals == null) {
      setKnockErrors(prev => ({ ...prev, [matchId]: 'Completá ambos resultados antes de guardar' }))
      return
    }
    await updateKnockoutPred(session, matchId, data)
    setKnockInputs(prev => { const n = { ...prev }; delete n[matchId]; return n })
    setSavedKnock(prev => ({ ...prev, [matchId]: true }))
    setTimeout(() => setSavedKnock(prev => { const n = { ...prev }; delete n[matchId]; return n }), 2000)
  }

  // ── Tarjeta de partido (reutilizada en ambos modos) ──
  const renderMatchCard = (m, showGroupBadge = false) => {
    const locked       = isMatchLocked(m.date)
    const inp          = groupInputs[m.id] || {}
    const cur          = groupPreds[m.id]  || { home: '', away: '' }
    const displayHome  = inp.home !== undefined ? inp.home : cur.home
    const displayAway  = inp.away !== undefined ? inp.away : cur.away
    const isLocalDirty = !!groupInputs[m.id]
    const hasSaved     = !!groupPreds[m.id]
    const justSaved    = !!savedGroups[m.id]
    const d            = new Date(m.date)
    return (
      <div key={m.id} className={`rounded-xl p-3 shadow-sm border ${locked ? 'bg-gray-50 border-gray-100' : 'bg-green-50 border-green-100'}`}>
        {showGroupBadge && (
          <div className="mb-2">
            <span className="bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">Grupo {m.group}</span>
          </div>
        )}
        {/* 3 columnas: local | marcador+fecha | visitante */}
        <div className="grid grid-cols-3 items-center gap-2">
          <div className="flex flex-col items-center text-center gap-1.5">
            <Bandera pais={m.home} />
            <span className="text-sm font-semibold text-gray-800 leading-tight">{m.home}</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <ScoreInput value={displayHome} onChange={v => handleGroupInput(m.id, 'home', v)} locked={locked} />
              <span className="text-gray-400 font-bold text-lg self-center">-</span>
              <ScoreInput value={displayAway} onChange={v => handleGroupInput(m.id, 'away', v)} locked={locked} />
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-400">{formatFecha(d)}</div>
              {locked && <div className="text-xs text-red-400 mt-0.5">🔒 bloqueado</div>}
            </div>
          </div>
          <div className="flex flex-col items-center text-center gap-1.5">
            <Bandera pais={m.away} />
            <span className="text-sm font-semibold text-gray-800 leading-tight">{m.away}</span>
          </div>
        </div>
        {/* Acciones */}
        {!locked && (
          <div className="flex justify-end gap-1.5 mt-2 pt-2 border-t border-green-100">
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
        {groupErrors[m.id] && (
          <p className="text-xs text-red-500 mt-1.5 text-center">{groupErrors[m.id]}</p>
        )}
      </div>
    )
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
          {/* Toggle orden */}
          <div className="bg-white rounded-2xl shadow p-1 flex gap-1">
            {[{ id: 'group', label: 'Por grupo' }, { id: 'date', label: 'Por fecha' }].map(o => (
              <button
                key={o.id}
                onClick={() => setGroupOrder(o.id)}
                className={`flex-1 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                  groupOrder === o.id ? 'bg-green-600 text-white shadow' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>

          {groupOrder === 'group' ? (
            // ── Vista por grupo ──
            Object.entries(GROUPS).map(([g, teams]) => (
              <div key={g} className="bg-white rounded-2xl shadow p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">Grupo {g}</span>
                  <span className="text-xs text-gray-500">{teams.join(' · ')}</span>
                </div>
                <div className="space-y-2">
                  {GROUP_MATCHES.filter(m => m.group === g).map(m => renderMatchCard(m, false))}
                </div>
              </div>
            ))
          ) : (
            // ── Vista por fecha ──
            <div className="space-y-2">
              {[...GROUP_MATCHES]
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .map(m => renderMatchCard(m, true))
              }
            </div>
          )}
        </div>
      )}

      {/* ── SECCIÓN CLASIFICADOS ── */}
      {activeSection === 'qualified' && (
        <div className="bg-white rounded-2xl shadow p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-800">32 Clasificados a 16avos</h2>
            {!isMundialStarted() && (
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
            )}
          </div>

          {isMundialStarted() ? (
            <>
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-700 text-sm font-medium text-center mb-4">
                ⏱ Pronósticos cerrados — el Mundial ya comenzó
              </div>
              {qualPreds.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No guardaste clasificados antes del inicio.</p>
              ) : (
                <>
                  <p className="text-xs text-gray-500 mb-3">Tu selección guardada ({qualPreds.length}/32):</p>
                  {Object.entries(GROUPS).map(([g, teams]) => {
                    const selected = teams.filter(c => qualPreds.includes(c))
                    if (selected.length === 0) return null
                    return (
                      <div key={g} className="mb-3">
                        <div className="text-xs font-semibold text-gray-400 uppercase mb-1">Grupo {g}</div>
                        <div className="flex flex-wrap gap-2">
                          {teams.map(country => (
                            <span
                              key={country}
                              className={`text-sm px-3 py-1 rounded-full border ${
                                qualPreds.includes(country)
                                  ? 'bg-green-100 text-green-700 border-green-200'
                                  : 'bg-gray-50 text-gray-300 border-gray-100'
                              }`}
                            >
                              {country}
                            </span>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </>
              )}
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      )}

      {/* ── SECCIÓN CAMPEÓN ── */}
      {activeSection === 'champion' && (
        <div className="bg-white rounded-2xl shadow p-5 space-y-5">
          {isMundialStarted() ? (
            <>
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-700 text-sm font-medium text-center">
                ⏱ Pronósticos cerrados — el Mundial ya comenzó
              </div>
              {champion || subchampion ? (
                <div className="bg-green-50 rounded-xl p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🥇</span>
                    <div>
                      <div className="text-xs text-gray-500">Campeón</div>
                      <div className="text-base font-bold text-gray-800">{champion || <span className="text-gray-400 font-normal">No seleccionado</span>}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🥈</span>
                    <div>
                      <div className="text-xs text-gray-500">Subcampeón</div>
                      <div className="text-base font-bold text-gray-800">{subchampion || <span className="text-gray-400 font-normal">No seleccionado</span>}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">No guardaste campeón ni subcampeón antes del inicio.</p>
              )}
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      )}

      {/* ── SECCIÓN ELIMINACIÓN DIRECTA ── */}
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
                    ? 'bg-green-600 text-white shadow'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Partidos de la ronda activa */}
          <div className="space-y-3">
            {ALL_KO_FIXTURES[activeKnockoutRound].map((fixture, i) => {
              const matchId = fixture.id
              const kd      = knockoutData[matchId]
              // Equipos: knockoutData tiene prioridad (admin puede corregir); fallback al fixture (R32 tiene equipos, R16+ no)
              const realHome = kd?.home ?? fixture.home ?? ''
              const realAway = kd?.away ?? fixture.away ?? ''
              const homeIsTBD = !realHome || realHome.startsWith('Por definir')
              const awayIsTBD = !realAway || realAway.startsWith('Por definir')
              const bothDefined = !homeIsTBD && !awayIsTBD

              const inp  = knockInputs[matchId] || {}
              const cur  = knockPreds[matchId]  || {}
              const displayHG = inp.homeGoals !== undefined ? inp.homeGoals : (cur.homeGoals ?? '')
              const displayAG = inp.awayGoals !== undefined ? inp.awayGoals : (cur.awayGoals ?? '')
              const displayW  = inp.winner    !== undefined ? inp.winner    : (cur.winner    ?? '')
              const isLocalDirty = !!knockInputs[matchId]
              const justSaved    = !!savedKnock[matchId]
              const locked = isKnockoutMatchLocked(matchId)

              const dateObj = new Date(fixture.date)
              const fechaStr = `${formatFecha(dateObj)}${fixture.stadium ? ` · ${fixture.stadium}, ${fixture.city}` : fixture.city ? ` · ${fixture.city}` : ''}`

              const TeamCol = ({ name, isTBD }) => (
                <div className="flex flex-col items-center text-center gap-1.5">
                  {isTBD
                    ? <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-lg">❓</div>
                    : <Bandera pais={name} />
                  }
                  <span className={`text-sm font-semibold leading-tight ${isTBD ? 'text-gray-400 italic' : 'text-gray-800'}`}>
                    {isTBD ? 'Por definir' : name}
                  </span>
                </div>
              )

              return (
                <div key={matchId} className={`rounded-xl p-3 shadow-sm border ${
                  locked ? 'bg-gray-50 border-gray-100' : bothDefined ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-200'
                }`}>
                  {/* 3 columnas: local | score+fecha | visitante */}
                  <div className="grid grid-cols-3 items-center gap-2">
                    <TeamCol name={realHome} isTBD={homeIsTBD} />
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex items-center gap-2">
                        <ScoreInput value={displayHG} onChange={v => handleKnockInput(matchId, 'homeGoals', v)} locked={locked || !bothDefined} />
                        <span className="text-gray-400 font-bold text-lg self-center">-</span>
                        <ScoreInput value={displayAG} onChange={v => handleKnockInput(matchId, 'awayGoals', v)} locked={locked || !bothDefined} />
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-400">{fechaStr}</div>
                        {locked && <div className="text-xs text-red-400 mt-0.5">🔒 bloqueado</div>}
                      </div>
                    </div>
                    <TeamCol name={realAway} isTBD={awayIsTBD} />
                  </div>

                  {/* Quién pasa + guardar */}
                  {locked ? (
                    knockPreds[matchId] ? (
                      <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500 text-center">
                        Tu pronóstico: {knockPreds[matchId].homeGoals ?? '?'} - {knockPreds[matchId].awayGoals ?? '?'}
                        {knockPreds[matchId].winner && ` · pasa ${knockPreds[matchId].winner}`}
                      </div>
                    ) : null
                  ) : !bothDefined ? (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-400 text-center italic">Esperando equipos confirmados</p>
                    </div>
                  ) : (
                    <div className="mt-2 pt-2 border-t border-green-100 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 shrink-0">¿Quién pasa?</span>
                        <select
                          value={displayW}
                          onChange={e => handleKnockInput(matchId, 'winner', e.target.value)}
                          className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-green-400"
                        >
                          <option value="">— Seleccioná —</option>
                          <option value={realHome}>{realHome}</option>
                          <option value={realAway}>{realAway}</option>
                        </select>
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleSaveKnock(matchId)}
                          disabled={!isLocalDirty}
                          className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors ${
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
                        {knockPreds[matchId] && (
                          <button
                            onClick={() => handleDeleteKnock(matchId)}
                            className="text-xs px-2.5 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 transition-colors"
                          >
                            Borrar
                          </button>
                        )}
                      </div>
                      {knockErrors[matchId] && (
                        <p className="text-xs text-red-500 text-center">{knockErrors[matchId]}</p>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

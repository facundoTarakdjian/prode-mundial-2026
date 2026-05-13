import { createContext, useContext, useState, useCallback } from 'react'
import { LS, DEFAULT_SCORING } from '../constants/storage'

const AppContext = createContext(null)

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw !== null ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function AppProvider({ children }) {
  const [session,         setSession]         = useState(() => load(LS.SESSION, null))
  const [predictions,     setPredictions]     = useState(() => load(LS.PREDICTIONS, {}))
  const [realResults,     setRealResults]     = useState(() => load(LS.REAL_RESULTS, {}))
  const [realQualifiers,  setRealQualifiers]  = useState(() => load(LS.REAL_QUALIFIERS, []))
  const [knockoutData,    setKnockoutData]    = useState(() => load(LS.KNOCKOUT_DATA, {}))
  const [scoring,         setScoring]         = useState(() => load(LS.SCORING, DEFAULT_SCORING))
  const [logs,            setLogs]            = useState(() => load(LS.LOGS, []))

  // ── Auth ──────────────────────────────────────────────
  const login = useCallback((username) => {
    save(LS.SESSION, username)
    setSession(username)
  }, [])

  const logout = useCallback(() => {
    save(LS.SESSION, null)
    setSession(null)
  }, [])

  // ── Logging ───────────────────────────────────────────
  const addLog = useCallback((user, action) => {
    setLogs(prev => {
      const entry = { id: Date.now() + Math.random(), ts: new Date().toISOString(), user, action }
      const next = [entry, ...prev]
      save(LS.LOGS, next)
      return next
    })
  }, [])

  // ── Pronósticos ───────────────────────────────────────
  const updatePrediction = useCallback((username, key, value, logAction) => {
    setPredictions(prev => {
      const next = {
        ...prev,
        [username]: { ...(prev[username] || {}), [key]: value }
      }
      save(LS.PREDICTIONS, next)
      return next
    })
    addLog(username, logAction)
  }, [addLog])

  const getPrediction = useCallback((username, key, fallback = null) => {
    return predictions[username]?.[key] ?? fallback
  }, [predictions])

  // ── Resultados reales ─────────────────────────────────
  const setRealResult = useCallback((matchId, home, away, username) => {
    setRealResults(prev => {
      const next = { ...prev, [matchId]: { home, away } }
      save(LS.REAL_RESULTS, next)
      return next
    })
    addLog(username, `Cargó resultado real del partido ${matchId}: ${home}-${away}`)
  }, [addLog])

  // ── Clasificados reales ───────────────────────────────
  const setRealQualifiersData = useCallback((list, username) => {
    save(LS.REAL_QUALIFIERS, list)
    setRealQualifiers(list)
    addLog(username, `Actualizó los clasificados a 16avos (${list.length} países)`)
  }, [addLog])

  // ── Eliminación directa ───────────────────────────────
  const setKnockoutMatch = useCallback((matchId, data, username) => {
    setKnockoutData(prev => {
      const next = { ...prev, [matchId]: data }
      save(LS.KNOCKOUT_DATA, next)
      return next
    })
    addLog(username, `Actualizó llave ${matchId} en eliminación directa`)
  }, [addLog])

  // ── Scoring ───────────────────────────────────────────
  const updateScoring = useCallback((newScoring, username) => {
    save(LS.SCORING, newScoring)
    setScoring(newScoring)
    addLog(username, `Modificó la configuración de puntos`)
  }, [addLog])

  // ── Cálculo de puntos ─────────────────────────────────
  const calcPoints = useCallback((username) => {
    const pred  = predictions[username] || {}
    let total   = 0

    // Fase de grupos
    const groupPreds = pred.groups || {}
    for (const [matchId, pResult] of Object.entries(groupPreds)) {
      const real = realResults[matchId]
      if (!real || pResult.home === '' || pResult.away === '') continue
      const sign = (a, b) => a > b ? 1 : a < b ? -1 : 0
      if (sign(parseInt(pResult.home), parseInt(pResult.away)) === sign(real.home, real.away)) {
        total += scoring.exactResult
      }
    }

    // Clasificados a 16avos
    const predQual = pred.qualifiers || []
    for (const country of predQual) {
      if (realQualifiers.includes(country)) {
        total += scoring.qualifierHit
      }
    }

    // Campeón y subcampeón
    const predChampion    = pred.champion    || ''
    const predSubchampion = pred.subchampion || ''
    if (knockoutData['F_winner']) {
      if (predChampion === knockoutData['F_winner'])       total += scoring.champion
      if (predSubchampion === knockoutData['F_runner_up']) total += scoring.subchampion
    }

    // Eliminación directa
    const knockoutPreds = pred.knockout || {}
    for (const [matchId, kPred] of Object.entries(knockoutPreds)) {
      const real = knockoutData[matchId]
      if (!real) continue
      if (kPred.winner && kPred.winner === real.winner) {
        total += scoring.knockoutWinner
      }
      if (
        kPred.homeGoals !== undefined && kPred.awayGoals !== undefined &&
        real.homeGoals !== undefined  && real.awayGoals !== undefined &&
        parseInt(kPred.homeGoals) === real.homeGoals &&
        parseInt(kPred.awayGoals) === real.awayGoals
      ) {
        total += scoring.knockoutResult
      }
    }

    return total
  }, [predictions, realResults, realQualifiers, knockoutData, scoring])

  const value = {
    session, login, logout,
    predictions, updatePrediction, getPrediction,
    realResults, setRealResult,
    realQualifiers, setRealQualifiersData,
    knockoutData, setKnockoutMatch,
    scoring, updateScoring,
    logs, addLog,
    calcPoints,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  return useContext(AppContext)
}

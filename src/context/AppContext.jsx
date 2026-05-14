import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { supabase } from '../supabaseClient'
import { DEFAULT_SCORING } from '../constants/storage'
import { GROUP_MATCHES } from '../constants/fixture'

const AppContext = createContext(null)

// ── Helpers ──────────────────────────────────────────────────────────────────

function buildPredictions(groupRows, qualRows, generalRows, knockRows) {
  const preds = {}
  const init  = () => ({ groups: {}, qualifiers: [], champion: '', subchampion: '', knockout: {} })

  for (const r of groupRows) {
    if (!preds[r.username]) preds[r.username] = init()
    preds[r.username].groups[r.match_id] = {
      home: r.home_goals != null ? r.home_goals.toString() : '',
      away: r.away_goals != null ? r.away_goals.toString() : '',
    }
  }
  for (const r of qualRows) {
    if (!preds[r.username]) preds[r.username] = init()
    preds[r.username].qualifiers.push(r.country)
  }
  for (const r of generalRows) {
    if (!preds[r.username]) preds[r.username] = init()
    preds[r.username].champion    = r.champion    || ''
    preds[r.username].subchampion = r.subchampion || ''
  }
  for (const r of knockRows) {
    if (!preds[r.username]) preds[r.username] = init()
    preds[r.username].knockout[r.match_id] = {
      homeGoals: r.home_goals != null ? r.home_goals.toString() : '',
      awayGoals: r.away_goals != null ? r.away_goals.toString() : '',
      winner:    r.winner || '',
    }
  }
  return preds
}

function buildKnockoutData(rows) {
  const kd = {}
  for (const r of rows) {
    kd[r.match_id] = {
      home:      r.home || '',
      away:      r.away || '',
      homeGoals: r.home_goals,
      awayGoals: r.away_goals,
      winner:    r.winner || '',
    }
  }
  const final = rows.find(r => r.match_id === 'F_1')
  if (final?.winner) {
    kd['F_winner']   = final.winner
    kd['F_runner_up'] = final.winner === final.home ? final.away : final.home
  }
  return kd
}

// ── Provider ─────────────────────────────────────────────────────────────────

export function AppProvider({ children }) {
  const [session,        setSession]        = useState(() => {
    try { return JSON.parse(localStorage.getItem('prode_session')) } catch { return null }
  })
  const [loading,        setLoading]        = useState(true)
  const [predictions,    setPredictions]    = useState({})
  const [realResults,    setRealResults]    = useState({})
  const [realQualifiers, setRealQualifiers] = useState([])
  const [knockoutData,   setKnockoutData]   = useState({})
  const [scoring,        setScoring]        = useState(DEFAULT_SCORING)
  const [logs,           setLogs]           = useState([])

  // Ref for stable callbacks that need latest predictions
  const predictionsRef = useRef({})
  useEffect(() => { predictionsRef.current = predictions }, [predictions])

  // ── Data loaders ───────────────────────────────────────
  const loadPredictions = useCallback(async () => {
    const [
      { data: g = [] }, { data: q = [] }, { data: gen = [] }, { data: k = [] }
    ] = await Promise.all([
      supabase.from('pronosticos').select('*'),
      supabase.from('clasificados_pronosticados').select('*'),
      supabase.from('pronosticos_generales').select('*'),
      supabase.from('eliminatorias_pronosticos').select('*'),
    ])
    setPredictions(buildPredictions(g, q, gen, k))
  }, [])

  const loadResults = useCallback(async () => {
    const { data = [] } = await supabase.from('resultados_reales').select('*')
    const rr = {}
    for (const r of data) rr[r.match_id] = { home: r.home_goals, away: r.away_goals }
    setRealResults(rr)
  }, [])

  const loadRealQuals = useCallback(async () => {
    const { data = [] } = await supabase.from('clasificados_reales').select('*')
    setRealQualifiers(data.map(r => r.country))
  }, [])

  const loadKnockoutReal = useCallback(async () => {
    const { data = [] } = await supabase.from('eliminatorias_reales').select('*')
    setKnockoutData(buildKnockoutData(data))
  }, [])

  const loadScoring = useCallback(async () => {
    const { data } = await supabase.from('configuracion_puntos').select('*').eq('id', 1).maybeSingle()
    if (data) setScoring({
      exactResult:    data.exact_result,
      qualifierHit:   data.qualifier_hit,
      champion:       data.champion,
      subchampion:    data.subchampion,
      knockoutWinner: data.knockout_winner,
      knockoutResult: data.knockout_result,
    })
  }, [])

  const loadLogs = useCallback(async () => {
    const { data = [] } = await supabase.from('logs').select('*').order('created_at', { ascending: false }).limit(500)
    setLogs(data.map(r => ({ id: r.id, ts: r.created_at, user: r.username, action: r.action })))
  }, [])

  const loadAll = useCallback(async () => {
    setLoading(true)
    try {
      await Promise.all([
        loadPredictions(),
        loadResults(),
        loadRealQuals(),
        loadKnockoutReal(),
        loadScoring(),
        loadLogs(),
      ])
    } catch (err) {
      console.error('Error cargando datos de Supabase:', err)
    } finally {
      setLoading(false)
    }
  }, [loadPredictions, loadResults, loadRealQuals, loadKnockoutReal, loadScoring, loadLogs])

  useEffect(() => { loadAll() }, [loadAll])

  // ── Realtime subscriptions ─────────────────────────────
  useEffect(() => {
    const channel = supabase.channel('prode-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pronosticos' },               loadPredictions)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clasificados_pronosticados' }, loadPredictions)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pronosticos_generales' },      loadPredictions)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'eliminatorias_pronosticos' },  loadPredictions)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'resultados_reales' },          loadResults)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clasificados_reales' },        loadRealQuals)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'eliminatorias_reales' },       loadKnockoutReal)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'configuracion_puntos' },       loadScoring)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'logs' },                       loadLogs)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [loadPredictions, loadResults, loadRealQuals, loadKnockoutReal, loadScoring, loadLogs])

  // ── Auth ───────────────────────────────────────────────
  const login = useCallback((username) => {
    localStorage.setItem('prode_session', JSON.stringify(username))
    setSession(username)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('prode_session')
    setSession(null)
  }, [])

  // ── Logging ────────────────────────────────────────────
  const addLog = useCallback(async (user, action) => {
    const { data } = await supabase.from('logs').insert({ username: user, action }).select().single()
    if (data) setLogs(prev => [{ id: data.id, ts: data.created_at, user: data.username, action: data.action }, ...prev])
  }, [])

  // ── Pronósticos ────────────────────────────────────────
  const getPrediction = useCallback((username, key, fallback = null) => {
    return predictionsRef.current[username]?.[key] ?? fallback
  }, [])

  const updateGroupPred = useCallback(async (username, matchId, homeGoals, awayGoals) => {
    setPredictions(prev => {
      const user = prev[username] || { groups: {}, qualifiers: [], champion: '', subchampion: '', knockout: {} }
      return { ...prev, [username]: { ...user, groups: { ...user.groups, [matchId]: { home: homeGoals, away: awayGoals } } } }
    })
    await supabase.from('pronosticos').upsert(
      { username, match_id: matchId, home_goals: homeGoals !== '' ? parseInt(homeGoals) : null, away_goals: awayGoals !== '' ? parseInt(awayGoals) : null },
      { onConflict: 'username,match_id' }
    )
    const m = GROUP_MATCHES.find(x => x.id === matchId)
    await addLog(username, `Pronóstico ${m ? `${m.home} vs ${m.away}` : matchId}: ${homeGoals}-${awayGoals}`)
  }, [addLog])

  const togglePredQualifier = useCallback(async (username, country, add) => {
    setPredictions(prev => {
      const user  = prev[username] || { groups: {}, qualifiers: [], champion: '', subchampion: '', knockout: {} }
      const quals = add ? [...(user.qualifiers || []), country] : (user.qualifiers || []).filter(c => c !== country)
      return { ...prev, [username]: { ...user, qualifiers: quals } }
    })
    if (add) {
      await supabase.from('clasificados_pronosticados').insert({ username, country })
      await addLog(username, `Clasificados 16avos: agregó ${country}`)
    } else {
      await supabase.from('clasificados_pronosticados').delete().eq('username', username).eq('country', country)
      await addLog(username, `Clasificados 16avos: quitó ${country}`)
    }
  }, [addLog])

  const updateChampionPred = useCallback(async (username, champion) => {
    setPredictions(prev => {
      const user = prev[username] || { groups: {}, qualifiers: [], champion: '', subchampion: '', knockout: {} }
      return { ...prev, [username]: { ...user, champion } }
    })
    const currentSub = predictionsRef.current[username]?.subchampion || ''
    await supabase.from('pronosticos_generales').upsert({ username, champion, subchampion: currentSub }, { onConflict: 'username' })
    await addLog(username, `Actualizó campeón: ${champion}`)
  }, [addLog])

  const updateSubchampionPred = useCallback(async (username, subchampion) => {
    setPredictions(prev => {
      const user = prev[username] || { groups: {}, qualifiers: [], champion: '', subchampion: '', knockout: {} }
      return { ...prev, [username]: { ...user, subchampion } }
    })
    const currentChamp = predictionsRef.current[username]?.champion || ''
    await supabase.from('pronosticos_generales').upsert({ username, champion: currentChamp, subchampion }, { onConflict: 'username' })
    await addLog(username, `Actualizó subcampeón: ${subchampion}`)
  }, [addLog])

  const updateKnockoutPred = useCallback(async (username, matchId, data) => {
    setPredictions(prev => {
      const user = prev[username] || { groups: {}, qualifiers: [], champion: '', subchampion: '', knockout: {} }
      return { ...prev, [username]: { ...user, knockout: { ...user.knockout, [matchId]: data } } }
    })
    await supabase.from('eliminatorias_pronosticos').upsert({
      username,
      match_id:   matchId,
      home_goals: data.homeGoals !== '' ? parseInt(data.homeGoals) : null,
      away_goals: data.awayGoals !== '' ? parseInt(data.awayGoals) : null,
      winner:     data.winner || null,
    }, { onConflict: 'username,match_id' })
    await addLog(username, `Pronóstico eliminatoria ${matchId}: resultado ${data.homeGoals ?? '?'}-${data.awayGoals ?? '?'}, pasa ${data.winner || '?'}`)
  }, [addLog])

  // ── Borrar pronóstico de grupo ─────────────────────────
  const deleteGroupPred = useCallback(async (username, matchId) => {
    await supabase.from('pronosticos').delete()
      .eq('username', username).eq('match_id', matchId)
    setPredictions(prev => {
      const user = prev[username]
      if (!user) return prev
      const groups = { ...user.groups }
      delete groups[matchId]
      return { ...prev, [username]: { ...user, groups } }
    })
    const m = GROUP_MATCHES.find(x => x.id === matchId)
    await addLog(username, `Borró pronóstico ${m ? `${m.home} vs ${m.away}` : matchId}`)
  }, [addLog])

  // ── Guardar clasificados en bulk ────────────────────────
  const saveQualifiersBulk = useCallback(async (username, newQuals) => {
    const savedSet = new Set(predictionsRef.current[username]?.qualifiers || [])
    const newSet   = new Set(newQuals)
    const toRemove = [...savedSet].filter(c => !newSet.has(c))
    const toAdd    = [...newSet].filter(c => !savedSet.has(c))
    if (toRemove.length > 0) {
      await supabase.from('clasificados_pronosticados').delete()
        .eq('username', username).in('country', toRemove)
    }
    if (toAdd.length > 0) {
      await supabase.from('clasificados_pronosticados').insert(toAdd.map(country => ({ username, country })))
    }
    setPredictions(prev => {
      const user = prev[username] || { groups: {}, qualifiers: [], champion: '', subchampion: '', knockout: {} }
      return { ...prev, [username]: { ...user, qualifiers: newQuals } }
    })
    await addLog(username, `Guardó clasificados a 16avos (${newQuals.length}/32)`)
  }, [addLog])

  // ── Guardar campeón y subcampeón juntos ─────────────────
  const updateFinal = useCallback(async (username, champion, subchampion) => {
    setPredictions(prev => {
      const user = prev[username] || { groups: {}, qualifiers: [], champion: '', subchampion: '', knockout: {} }
      return { ...prev, [username]: { ...user, champion, subchampion } }
    })
    await supabase.from('pronosticos_generales').upsert(
      { username, champion: champion || null, subchampion: subchampion || null },
      { onConflict: 'username' }
    )
    await addLog(username, `Actualizó final: ${champion || '?'} vs ${subchampion || '?'}`)
  }, [addLog])

  // ── Borrar resultado real ──────────────────────────────
  const deleteRealResult = useCallback(async (matchId, username) => {
    await supabase.from('resultados_reales').delete().eq('match_id', matchId)
    setRealResults(prev => {
      const next = { ...prev }
      delete next[matchId]
      return next
    })
    await addLog(username, `Borró resultado real ${matchId}`)
  }, [addLog])

  // ── Resultados reales ──────────────────────────────────
  const setRealResult = useCallback(async (matchId, home, away, username) => {
    await supabase.from('resultados_reales').upsert(
      { match_id: matchId, home_goals: home, away_goals: away },
      { onConflict: 'match_id' }
    )
    setRealResults(prev => ({ ...prev, [matchId]: { home, away } }))
    await addLog(username, `Resultado real ${matchId}: ${home}-${away}`)
  }, [addLog])

  // ── Clasificados reales ────────────────────────────────
  const setRealQualifiersData = useCallback(async (list, username) => {
    setRealQualifiers(list)
    // Delete all existing rows then insert new list
    await supabase.from('clasificados_reales').delete().not('country', 'is', null)
    if (list.length > 0) {
      await supabase.from('clasificados_reales').insert(list.map(country => ({ country })))
    }
    await addLog(username, `Actualizó clasificados reales a 16avos (${list.length}/32)`)
  }, [addLog])

  // ── Eliminación directa ────────────────────────────────
  const setKnockoutMatch = useCallback(async (matchId, data, username) => {
    // F_winner / F_runner_up son derivados — solo actualizar estado local
    if (matchId === 'F_winner' || matchId === 'F_runner_up') {
      setKnockoutData(prev => ({ ...prev, [matchId]: data }))
      return
    }
    await supabase.from('eliminatorias_reales').upsert({
      match_id:   matchId,
      home:       data.home  || null,
      away:       data.away  || null,
      home_goals: data.homeGoals != null ? parseInt(data.homeGoals) : null,
      away_goals: data.awayGoals != null ? parseInt(data.awayGoals) : null,
      winner:     data.winner || null,
    }, { onConflict: 'match_id' })

    setKnockoutData(prev => {
      const next = { ...prev, [matchId]: data }
      if (matchId === 'F_1' && data.winner) {
        next['F_winner']   = data.winner
        next['F_runner_up'] = data.winner === data.home ? data.away : data.home
      }
      return next
    })
    await addLog(username, `Actualizó llave ${matchId} en eliminación directa`)
  }, [addLog])

  // ── Puntuación ─────────────────────────────────────────
  const updateScoring = useCallback(async (newScoring, username) => {
    await supabase.from('configuracion_puntos').upsert({
      id:              1,
      exact_result:    newScoring.exactResult,
      qualifier_hit:   newScoring.qualifierHit,
      champion:        newScoring.champion,
      subchampion:     newScoring.subchampion,
      knockout_winner: newScoring.knockoutWinner,
      knockout_result: newScoring.knockoutResult,
    }, { onConflict: 'id' })
    setScoring(newScoring)
    await addLog(username, 'Modificó la configuración de puntos')
  }, [addLog])

  // ── Cálculo de puntos ──────────────────────────────────
  const calcPoints = useCallback((username) => {
    const pred  = predictions[username] || {}
    let total   = 0

    const groupPreds = pred.groups || {}
    for (const [matchId, pResult] of Object.entries(groupPreds)) {
      const real = realResults[matchId]
      if (!real || pResult.home === '' || pResult.away === '') continue
      const sign = (a, b) => a > b ? 1 : a < b ? -1 : 0
      if (sign(parseInt(pResult.home), parseInt(pResult.away)) === sign(real.home, real.away)) {
        total += scoring.exactResult
      }
    }

    const predQual = pred.qualifiers || []
    for (const country of predQual) {
      if (realQualifiers.includes(country)) total += scoring.qualifierHit
    }

    if (knockoutData['F_winner']) {
      if ((pred.champion    || '') === knockoutData['F_winner'])   total += scoring.champion
      if ((pred.subchampion || '') === knockoutData['F_runner_up']) total += scoring.subchampion
    }

    const knockoutPreds = pred.knockout || {}
    for (const [matchId, kPred] of Object.entries(knockoutPreds)) {
      const real = knockoutData[matchId]
      if (!real) continue
      if (kPred.winner && kPred.winner === real.winner) total += scoring.knockoutWinner
      if (
        kPred.homeGoals !== undefined && kPred.awayGoals !== undefined &&
        real.homeGoals  != null       && real.awayGoals  != null &&
        parseInt(kPred.homeGoals) === real.homeGoals &&
        parseInt(kPred.awayGoals) === real.awayGoals
      ) total += scoring.knockoutResult
    }

    return total
  }, [predictions, realResults, realQualifiers, knockoutData, scoring])

  const value = {
    session, login, logout,
    loading,
    predictions, getPrediction,
    updateGroupPred, togglePredQualifier,
    updateChampionPred, updateSubchampionPred,
    updateKnockoutPred,
    deleteGroupPred, saveQualifiersBulk, updateFinal,
    realResults, setRealResult, deleteRealResult,
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

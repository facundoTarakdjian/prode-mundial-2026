// Claves de localStorage
export const LS = {
  SESSION:         'prode_session',        // usuario logueado
  PREDICTIONS:     'prode_predictions',    // { [username]: { groups, qualifiers, champion, subchampion, knockout } }
  REAL_RESULTS:    'prode_real_results',   // { [matchId]: { home, away } }
  REAL_QUALIFIERS: 'prode_real_qualifiers',// string[]
  KNOCKOUT_DATA:   'prode_knockout_data',  // { [matchId]: { home, away, homeGoals, awayGoals, winner } }
  SCORING:         'prode_scoring',        // puntos configurables
  LOGS:            'prode_logs',           // { id, ts, user, action }[]
}

export const DEFAULT_SCORING = {
  exactResult:    1,  // resultado exacto grupos
  qualifierHit:   1,  // cada clasificado a 16avos
  champion:       5,  // campeón
  subchampion:    3,  // subcampeón
  knockoutWinner: 2,  // quién pasa en eliminatoria
  knockoutResult: 1,  // resultado en 90' en eliminatoria
}

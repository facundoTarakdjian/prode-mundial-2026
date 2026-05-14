// Fixture oficial del Mundial 2026
// Fuente: Yahoo Sports (publicado 8 de mayo de 2026)
// Las fechas y horarios están en zona horaria Argentina (UTC-3)

export const GROUPS = {
  A: ['México', 'Corea del Sur', 'Sudáfrica', 'Chequia'],
  B: ['Canadá', 'Bosnia-Herzegovina', 'Qatar', 'Suiza'],
  C: ['Brasil', 'Marruecos', 'Haití', 'Escocia'],
  D: ['USA', 'Paraguay', 'Australia', 'Turquía'],
  E: ['Alemania', 'Curaçao', 'Costa de Marfil', 'Ecuador'],
  F: ['Países Bajos', 'Japón', 'Suecia', 'Túnez'],
  G: ['Bélgica', 'Egipto', 'Irán', 'Nueva Zelanda'],
  H: ['España', 'Cabo Verde', 'Arabia Saudita', 'Uruguay'],
  I: ['Francia', 'Senegal', 'Irak', 'Noruega'],
  J: ['Argentina', 'Argelia', 'Austria', 'Jordania'],
  K: ['Portugal', 'RD Congo', 'Uzbekistán', 'Colombia'],
  L: ['Inglaterra', 'Croacia', 'Ghana', 'Panamá'],
}

// Todos los países en orden para selección múltiple
export const ALL_COUNTRIES = Object.values(GROUPS).flat().sort()

// País → grupo
export const COUNTRY_GROUP = {}
for (const [group, teams] of Object.entries(GROUPS)) {
  for (const team of teams) {
    COUNTRY_GROUP[team] = group
  }
}

// Nombres de sedes
export const VENUES = {
  'Mexico City':  'Estadio Azteca, Ciudad de México',
  'Zapopan':      'Estadio Akron, Zapopan',
  'Monterrey':    'Estadio BBVA, Monterrey',
  'Toronto':      'BMO Field, Toronto',
  'Vancouver':    'BC Place, Vancouver',
  'Los Angeles':  'SoFi Stadium, Los Ángeles',
  'Santa Clara':  "Levi's Stadium, Santa Clara",
  'New York':     'MetLife Stadium, Nueva York/Nueva Jersey',
  'Boston':       'Gillette Stadium, Boston',
  'Houston':      'NRG Stadium, Houston',
  'Dallas':       'AT&T Stadium, Dallas',
  'Philadelphia': 'Lincoln Financial Field, Philadelphia',
  'Atlanta':      'Mercedes-Benz Stadium, Atlanta',
  'Seattle':      'Lumen Field, Seattle',
  'Miami':        'Hard Rock Stadium, Miami',
  'Kansas City':  'Arrowhead Stadium, Kansas City',
}

// Fixture de fase de grupos
// Formato: { id, group, home, away, date (ISO), venue }
// Horarios en UTC-3 (Argentina). Los partidos a las 00:00 son el cruce de medianoche al día siguiente.
export const GROUP_MATCHES = [
  // ─── GRUPO A ───
  { id: 'A1', group: 'A', home: 'México',        away: 'Sudáfrica',     date: '2026-06-11T16:00:00', venue: 'Mexico City' },
  { id: 'A2', group: 'A', home: 'Corea del Sur', away: 'Chequia',       date: '2026-06-11T23:00:00', venue: 'Zapopan' },
  { id: 'A3', group: 'A', home: 'Chequia',       away: 'Sudáfrica',     date: '2026-06-18T13:00:00', venue: 'Atlanta' },
  { id: 'A4', group: 'A', home: 'México',        away: 'Corea del Sur', date: '2026-06-18T22:00:00', venue: 'Zapopan' },
  { id: 'A5', group: 'A', home: 'Chequia',       away: 'México',        date: '2026-06-24T22:00:00', venue: 'Mexico City' },
  { id: 'A6', group: 'A', home: 'Sudáfrica',     away: 'Corea del Sur', date: '2026-06-24T22:00:00', venue: 'Monterrey' },

  // ─── GRUPO B ───
  { id: 'B1', group: 'B', home: 'Canadá',              away: 'Bosnia-Herzegovina', date: '2026-06-12T16:00:00', venue: 'Toronto' },
  { id: 'B2', group: 'B', home: 'Qatar',               away: 'Suiza',              date: '2026-06-13T16:00:00', venue: 'Santa Clara' },
  { id: 'B3', group: 'B', home: 'Suiza',               away: 'Bosnia-Herzegovina', date: '2026-06-18T16:00:00', venue: 'Los Angeles' },
  { id: 'B4', group: 'B', home: 'Canadá',              away: 'Qatar',              date: '2026-06-18T19:00:00', venue: 'Vancouver' },
  { id: 'B5', group: 'B', home: 'Suiza',               away: 'Canadá',             date: '2026-06-24T16:00:00', venue: 'Vancouver' },
  { id: 'B6', group: 'B', home: 'Bosnia-Herzegovina',  away: 'Qatar',              date: '2026-06-24T16:00:00', venue: 'Seattle' },

  // ─── GRUPO C ───
  { id: 'C1', group: 'C', home: 'Brasil',    away: 'Marruecos', date: '2026-06-13T19:00:00', venue: 'New York' },
  { id: 'C2', group: 'C', home: 'Haití',     away: 'Escocia',   date: '2026-06-13T22:00:00', venue: 'Boston' },
  { id: 'C3', group: 'C', home: 'Escocia',   away: 'Marruecos', date: '2026-06-19T19:00:00', venue: 'Boston' },
  { id: 'C4', group: 'C', home: 'Brasil',    away: 'Haití',     date: '2026-06-19T21:30:00', venue: 'Philadelphia' },
  { id: 'C5', group: 'C', home: 'Escocia',   away: 'Brasil',    date: '2026-06-24T19:00:00', venue: 'Miami' },
  { id: 'C6', group: 'C', home: 'Marruecos', away: 'Haití',     date: '2026-06-24T19:00:00', venue: 'Atlanta' },

  // ─── GRUPO D ───
  { id: 'D1', group: 'D', home: 'USA',       away: 'Paraguay',  date: '2026-06-12T22:00:00', venue: 'Los Angeles' },
  { id: 'D2', group: 'D', home: 'Australia', away: 'Turquía',   date: '2026-06-14T13:00:00', venue: 'Vancouver' },
  { id: 'D3', group: 'D', home: 'USA',       away: 'Australia', date: '2026-06-19T16:00:00', venue: 'Seattle' },
  { id: 'D4', group: 'D', home: 'Turquía',   away: 'Paraguay',  date: '2026-06-20T00:00:00', venue: 'Santa Clara' },
  { id: 'D5', group: 'D', home: 'Turquía',   away: 'USA',       date: '2026-06-25T23:00:00', venue: 'Los Angeles' },
  { id: 'D6', group: 'D', home: 'Paraguay',  away: 'Australia', date: '2026-06-25T23:00:00', venue: 'Santa Clara' },

  // ─── GRUPO E ───
  { id: 'E1', group: 'E', home: 'Alemania',        away: 'Curaçao',         date: '2026-06-14T14:00:00', venue: 'Houston' },
  { id: 'E2', group: 'E', home: 'Costa de Marfil', away: 'Ecuador',         date: '2026-06-14T20:00:00', venue: 'Philadelphia' },
  { id: 'E3', group: 'E', home: 'Alemania',        away: 'Costa de Marfil', date: '2026-06-20T17:00:00', venue: 'Toronto' },
  { id: 'E4', group: 'E', home: 'Ecuador',         away: 'Curaçao',         date: '2026-06-20T21:00:00', venue: 'Kansas City' },
  { id: 'E5', group: 'E', home: 'Curaçao',         away: 'Costa de Marfil', date: '2026-06-25T17:00:00', venue: 'Philadelphia' },
  { id: 'E6', group: 'E', home: 'Ecuador',         away: 'Alemania',        date: '2026-06-25T17:00:00', venue: 'New York' },

  // ─── GRUPO F ───
  { id: 'F1', group: 'F', home: 'Países Bajos', away: 'Japón',        date: '2026-06-14T17:00:00', venue: 'Dallas' },
  { id: 'F2', group: 'F', home: 'Suecia',       away: 'Túnez',        date: '2026-06-14T23:00:00', venue: 'Monterrey' },
  { id: 'F3', group: 'F', home: 'Países Bajos', away: 'Suecia',       date: '2026-06-20T14:00:00', venue: 'Houston' },
  { id: 'F4', group: 'F', home: 'Túnez',        away: 'Japón',        date: '2026-06-21T13:00:00', venue: 'Monterrey' },
  { id: 'F5', group: 'F', home: 'Japón',        away: 'Suecia',       date: '2026-06-25T20:00:00', venue: 'Dallas' },
  { id: 'F6', group: 'F', home: 'Túnez',        away: 'Países Bajos', date: '2026-06-25T20:00:00', venue: 'Kansas City' },

  // ─── GRUPO G ───
  { id: 'G1', group: 'G', home: 'Bélgica',       away: 'Egipto',        date: '2026-06-15T16:00:00', venue: 'Seattle' },
  { id: 'G2', group: 'G', home: 'Irán',          away: 'Nueva Zelanda', date: '2026-06-15T22:00:00', venue: 'Los Angeles' },
  { id: 'G3', group: 'G', home: 'Bélgica',       away: 'Irán',          date: '2026-06-21T16:00:00', venue: 'Los Angeles' },
  { id: 'G4', group: 'G', home: 'Nueva Zelanda', away: 'Egipto',        date: '2026-06-21T22:00:00', venue: 'Vancouver' },
  { id: 'G5', group: 'G', home: 'Egipto',        away: 'Irán',          date: '2026-06-27T00:00:00', venue: 'Seattle' },
  { id: 'G6', group: 'G', home: 'Nueva Zelanda', away: 'Bélgica',       date: '2026-06-27T00:00:00', venue: 'Vancouver' },

  // ─── GRUPO H ───
  { id: 'H1', group: 'H', home: 'España',         away: 'Cabo Verde',     date: '2026-06-15T13:00:00', venue: 'Atlanta' },
  { id: 'H2', group: 'H', home: 'Arabia Saudita', away: 'Uruguay',        date: '2026-06-15T19:00:00', venue: 'Miami' },
  { id: 'H3', group: 'H', home: 'España',         away: 'Arabia Saudita', date: '2026-06-21T13:00:00', venue: 'Atlanta' },
  { id: 'H4', group: 'H', home: 'Uruguay',        away: 'Cabo Verde',     date: '2026-06-21T19:00:00', venue: 'Miami' },
  { id: 'H5', group: 'H', home: 'Cabo Verde',     away: 'Arabia Saudita', date: '2026-06-26T21:00:00', venue: 'Houston' },
  { id: 'H6', group: 'H', home: 'Uruguay',        away: 'España',         date: '2026-06-26T21:00:00', venue: 'Zapopan' },

  // ─── GRUPO I ───
  { id: 'I1', group: 'I', home: 'Francia', away: 'Senegal', date: '2026-06-16T16:00:00', venue: 'New York' },
  { id: 'I2', group: 'I', home: 'Irak',    away: 'Noruega', date: '2026-06-16T19:00:00', venue: 'Boston' },
  { id: 'I3', group: 'I', home: 'Francia', away: 'Irak',    date: '2026-06-22T18:00:00', venue: 'Philadelphia' },
  { id: 'I4', group: 'I', home: 'Noruega', away: 'Senegal', date: '2026-06-22T21:00:00', venue: 'New York' },
  { id: 'I5', group: 'I', home: 'Noruega', away: 'Francia', date: '2026-06-26T16:00:00', venue: 'Boston' },
  { id: 'I6', group: 'I', home: 'Senegal', away: 'Irak',    date: '2026-06-26T16:00:00', venue: 'Toronto' },

  // ─── GRUPO J ───
  { id: 'J1', group: 'J', home: 'Argentina', away: 'Argelia',   date: '2026-06-16T22:00:00', venue: 'Kansas City' },
  { id: 'J2', group: 'J', home: 'Austria',   away: 'Jordania',  date: '2026-06-17T13:00:00', venue: 'Santa Clara' },
  { id: 'J3', group: 'J', home: 'Argentina', away: 'Austria',   date: '2026-06-22T14:00:00', venue: 'Dallas' },
  { id: 'J4', group: 'J', home: 'Jordania',  away: 'Argelia',   date: '2026-06-23T00:00:00', venue: 'Santa Clara' },
  { id: 'J5', group: 'J', home: 'Argelia',   away: 'Austria',   date: '2026-06-27T23:00:00', venue: 'Kansas City' },
  { id: 'J6', group: 'J', home: 'Jordania',  away: 'Argentina', date: '2026-06-27T23:00:00', venue: 'Dallas' },

  // ─── GRUPO K ───
  { id: 'K1', group: 'K', home: 'Portugal',   away: 'RD Congo',   date: '2026-06-17T14:00:00', venue: 'Houston' },
  { id: 'K2', group: 'K', home: 'Uzbekistán', away: 'Colombia',   date: '2026-06-17T23:00:00', venue: 'Mexico City' },
  { id: 'K3', group: 'K', home: 'Portugal',   away: 'Uzbekistán', date: '2026-06-23T14:00:00', venue: 'Houston' },
  { id: 'K4', group: 'K', home: 'Colombia',   away: 'RD Congo',   date: '2026-06-23T23:00:00', venue: 'Zapopan' },
  { id: 'K5', group: 'K', home: 'Colombia',   away: 'Portugal',   date: '2026-06-27T20:30:00', venue: 'Miami' },
  { id: 'K6', group: 'K', home: 'RD Congo',   away: 'Uzbekistán', date: '2026-06-27T20:30:00', venue: 'Atlanta' },

  // ─── GRUPO L ───
  { id: 'L1', group: 'L', home: 'Inglaterra', away: 'Croacia',    date: '2026-06-17T17:00:00', venue: 'Dallas' },
  { id: 'L2', group: 'L', home: 'Ghana',      away: 'Panamá',     date: '2026-06-17T20:00:00', venue: 'Toronto' },
  { id: 'L3', group: 'L', home: 'Inglaterra', away: 'Ghana',      date: '2026-06-23T17:00:00', venue: 'Boston' },
  { id: 'L4', group: 'L', home: 'Panamá',     away: 'Croacia',    date: '2026-06-23T20:00:00', venue: 'Toronto' },
  { id: 'L5', group: 'L', home: 'Panamá',     away: 'Inglaterra', date: '2026-06-27T18:00:00', venue: 'New York' },
  { id: 'L6', group: 'L', home: 'Croacia',    away: 'Ghana',      date: '2026-06-27T18:00:00', venue: 'Philadelphia' },
]

// Rondas eliminatorias (se llenan dinámicamente)
// IDs de llaves: R32_1..R32_16, R16_1..R16_8, QF_1..QF_4, SF_1..SF_2, F_1
export const KNOCKOUT_ROUNDS = [
  { id: 'R32', label: '16avos de Final', matchCount: 16 },
  { id: 'R16', label: 'Octavos de Final', matchCount: 8 },
  { id: 'QF',  label: 'Cuartos de Final', matchCount: 4 },
  { id: 'SF',  label: 'Semifinales',      matchCount: 2 },
  { id: 'F',   label: 'Final',            matchCount: 1 },
]

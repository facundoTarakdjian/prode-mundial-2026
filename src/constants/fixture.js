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

// ── Fixture de 16avos (R32) ────────────────────────────────────────────────
// Fechas en UTC (Argentina = UTC-3)
export const R32_FIXTURE = [
  { id: 'R32_1',  date: '2026-06-28T19:00:00Z', home: 'Sudáfrica',      away: 'Canadá',               stadium: 'SoFi Stadium',          city: 'Los Angeles' },
  { id: 'R32_2',  date: '2026-06-29T17:00:00Z', home: 'Brasil',         away: 'Japón',                stadium: 'NRG Stadium',           city: 'Houston' },
  { id: 'R32_3',  date: '2026-06-29T20:30:00Z', home: 'Alemania',       away: 'Paraguay',             stadium: 'Gillette Stadium',      city: 'Boston' },
  { id: 'R32_4',  date: '2026-06-30T01:00:00Z', home: 'Países Bajos',   away: 'Marruecos',            stadium: 'Estadio BBVA',          city: 'Monterrey' },
  { id: 'R32_5',  date: '2026-06-30T17:00:00Z', home: 'Costa de Marfil',away: 'Noruega',              stadium: 'AT&T Stadium',          city: 'Dallas' },
  { id: 'R32_6',  date: '2026-06-30T21:00:00Z', home: 'Francia',        away: 'Suecia',               stadium: 'MetLife Stadium',       city: 'Nueva York/NJ' },
  { id: 'R32_7',  date: '2026-07-01T01:00:00Z', home: 'México',         away: 'Ecuador',              stadium: 'Estadio Azteca',        city: 'Ciudad de México' },
  { id: 'R32_8',  date: '2026-07-01T16:00:00Z', home: 'Inglaterra',     away: 'RD Congo',             stadium: 'Mercedes-Benz Stadium', city: 'Atlanta' },
  { id: 'R32_9',  date: '2026-07-01T20:00:00Z', home: 'Bélgica',        away: 'Senegal',              stadium: 'Lumen Field',           city: 'Seattle' },
  { id: 'R32_10', date: '2026-07-02T00:00:00Z', home: 'USA',            away: 'Bosnia-Herzegovina',   stadium: "Levi's Stadium",        city: 'San Francisco' },
  { id: 'R32_11', date: '2026-07-02T19:00:00Z', home: 'España',         away: 'Austria',              stadium: 'SoFi Stadium',          city: 'Los Angeles' },
  { id: 'R32_12', date: '2026-07-02T23:00:00Z', home: 'Portugal',       away: 'Croacia',              stadium: 'BMO Field',             city: 'Toronto' },
  { id: 'R32_13', date: '2026-07-03T03:00:00Z', home: 'Suiza',          away: 'Argelia',              stadium: 'Arrowhead Stadium',     city: 'Kansas City' },
  { id: 'R32_14', date: '2026-07-03T18:00:00Z', home: 'Australia',      away: 'Egipto',               stadium: 'AT&T Stadium',          city: 'Dallas' },
  { id: 'R32_15', date: '2026-07-03T22:00:00Z', home: 'Argentina',      away: 'Cabo Verde',           stadium: 'Hard Rock Stadium',     city: 'Miami' },
  { id: 'R32_16', date: '2026-07-04T01:30:00Z', home: 'Colombia',       away: 'Ghana',                stadium: 'Arrowhead Stadium',     city: 'Kansas City' },
]

// Fixture de octavos de final (M89–M96)
export const R16_FIXTURE = [
  { id: 'R16_1', date: '2026-07-04T22:00:00Z', stadium: 'Lincoln Financial Field', city: 'Philadelphia' }, // M89
  { id: 'R16_2', date: '2026-07-05T02:00:00Z', stadium: 'NRG Stadium',             city: 'Houston' },       // M90
  { id: 'R16_3', date: '2026-07-05T22:00:00Z', stadium: 'MetLife Stadium',         city: 'Nueva York/NJ' }, // M91
  { id: 'R16_4', date: '2026-07-06T00:00:00Z', stadium: 'Estadio Azteca',          city: 'Ciudad de México' }, // M92
  { id: 'R16_5', date: '2026-07-06T23:00:00Z', stadium: 'AT&T Stadium',            city: 'Dallas' },        // M93
  { id: 'R16_6', date: '2026-07-07T04:00:00Z', stadium: 'Lumen Field',             city: 'Seattle' },       // M94
  { id: 'R16_7', date: '2026-07-07T22:00:00Z', stadium: 'Mercedes-Benz Stadium',   city: 'Atlanta' },       // M95
  { id: 'R16_8', date: '2026-07-08T04:00:00Z', stadium: 'BC Place',                city: 'Vancouver' },     // M96
]

// Fixture de cuartos de final (M97–M100)
export const QF_FIXTURE = [
  { id: 'QF_1', date: '2026-07-09T22:00:00Z', stadium: 'Gillette Stadium',   city: 'Boston' },       // M97
  { id: 'QF_2', date: '2026-07-11T01:00:00Z', stadium: 'SoFi Stadium',       city: 'Los Angeles' },  // M98
  { id: 'QF_3', date: '2026-07-11T19:00:00Z', stadium: 'Hard Rock Stadium',  city: 'Miami' },        // M99
  { id: 'QF_4', date: '2026-07-11T23:00:00Z', stadium: 'Arrowhead Stadium',  city: 'Kansas City' },  // M100
]
// Fixture de semifinales (M101–M102)
export const SF_FIXTURE = [
  { id: 'SF_1', date: '2026-07-14T23:00:00Z', stadium: 'AT&T Stadium',          city: 'Dallas' },   // M101
  { id: 'SF_2', date: '2026-07-15T22:00:00Z', stadium: 'Mercedes-Benz Stadium', city: 'Atlanta' },  // M102
]
// Final (M104)
export const F_FIXTURE = [
  { id: 'F_1', date: '2026-07-19T22:00:00Z', stadium: 'MetLife Stadium', city: 'Nueva York/NJ' }, // M104
]

// Lookup rápido matchId → fecha UTC
export const KNOCKOUT_MATCH_DATES = Object.fromEntries(
  [...R32_FIXTURE, ...R16_FIXTURE, ...QF_FIXTURE, ...SF_FIXTURE, ...F_FIXTURE]
    .map(m => [m.id, m.date])
)

// Propagación del cuadro oficial FIFA 2026
// { matchId: { next: matchId, slot: 'home' | 'away' } }
export const BRACKET_PROPAGATION = {
  // R32 → R16
  // M89 (R16_1, Philadelphia): Alemania/Paraguay vs Francia/Suecia
  'R32_3':  { next: 'R16_1', slot: 'home' }, // M74 Alemania/Paraguay
  'R32_6':  { next: 'R16_1', slot: 'away' }, // M77 Francia/Suecia
  // M90 (R16_2, Houston): Sudáfrica/Canadá vs Países Bajos/Marruecos
  'R32_1':  { next: 'R16_2', slot: 'home' }, // M73 Sudáfrica/Canadá
  'R32_4':  { next: 'R16_2', slot: 'away' }, // M75 Países Bajos/Marruecos
  // M91 (R16_3, MetLife): Brasil/Japón vs Costa de Marfil/Noruega
  'R32_2':  { next: 'R16_3', slot: 'home' }, // M76 Brasil/Japón
  'R32_5':  { next: 'R16_3', slot: 'away' }, // M78 Costa de Marfil/Noruega
  // M92 (R16_4, Azteca): México/Ecuador vs Inglaterra/RD Congo
  'R32_7':  { next: 'R16_4', slot: 'home' }, // M79 México/Ecuador
  'R32_8':  { next: 'R16_4', slot: 'away' }, // M80 Inglaterra/RD Congo
  // M93 (R16_5, Dallas): Portugal/Croacia vs España/Austria
  'R32_12': { next: 'R16_5', slot: 'home' }, // M83 Portugal/Croacia
  'R32_11': { next: 'R16_5', slot: 'away' }, // M84 España/Austria
  // M94 (R16_6, Seattle): USA/Bosnia vs Bélgica/Senegal
  'R32_10': { next: 'R16_6', slot: 'home' }, // M81 USA/Bosnia
  'R32_9':  { next: 'R16_6', slot: 'away' }, // M82 Bélgica/Senegal
  // M95 (R16_7, Atlanta): Argentina/Cabo Verde vs Australia/Egipto
  'R32_15': { next: 'R16_7', slot: 'home' }, // M86 Argentina/Cabo Verde
  'R32_14': { next: 'R16_7', slot: 'away' }, // M88 Australia/Egipto
  // M96 (R16_8, Vancouver): Suiza/Argelia vs Colombia/Ghana
  'R32_13': { next: 'R16_8', slot: 'home' }, // M85 Suiza/Argelia
  'R32_16': { next: 'R16_8', slot: 'away' }, // M87 Colombia/Ghana
  // R16 → QF
  // M97 (QF_1, Boston): R16_1 vs R16_2
  'R16_1': { next: 'QF_1', slot: 'home' },
  'R16_2': { next: 'QF_1', slot: 'away' },
  // M98 (QF_2, Los Angeles): R16_5 vs R16_6
  'R16_5': { next: 'QF_2', slot: 'home' },
  'R16_6': { next: 'QF_2', slot: 'away' },
  // M99 (QF_3, Miami): R16_3 vs R16_4
  'R16_3': { next: 'QF_3', slot: 'home' },
  'R16_4': { next: 'QF_3', slot: 'away' },
  // M100 (QF_4, Kansas City): R16_7 vs R16_8
  'R16_7': { next: 'QF_4', slot: 'home' },
  'R16_8': { next: 'QF_4', slot: 'away' },
  // QF → SF
  // M101 (SF_1, Dallas): QF_1 vs QF_2
  'QF_1': { next: 'SF_1', slot: 'home' },
  'QF_2': { next: 'SF_1', slot: 'away' },
  // M102 (SF_2, Atlanta): QF_3 vs QF_4
  'QF_3': { next: 'SF_2', slot: 'home' },
  'QF_4': { next: 'SF_2', slot: 'away' },
  // SF → F
  // M104 (Final, MetLife): SF_1 vs SF_2
  'SF_1': { next: 'F_1', slot: 'home' },
  'SF_2': { next: 'F_1', slot: 'away' },
}

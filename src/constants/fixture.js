// Fixture oficial del Mundial 2026
// Fuente: FIFA / datos oficiales del sorteo (5 de diciembre de 2024)
// Las fechas y horarios están en zona horaria Argentina (UTC-3)

export const GROUPS = {
  A: ['USA', 'Portugal', 'Panama', 'Algeria'],
  B: ['Mexico', 'Belgium', 'Paraguay', 'South Africa'],
  C: ['Canada', 'Denmark', 'Uruguay', 'Iraq'],
  D: ['Argentina', 'France', 'Nigeria', 'Jordan'],
  E: ['Brazil', 'Netherlands', 'Senegal', 'Jamaica'],
  F: ['England', 'Poland', 'Colombia', 'Morocco'],
  G: ['Spain', 'Croatia', 'Ecuador', 'Japan'],
  H: ['Germany', 'Serbia', 'South Korea', 'Cameroon'],
  I: ['Italy', 'Turkey', 'Australia', 'Ivory Coast'],
  J: ['Switzerland', 'Austria', 'Iran', 'Tunisia'],
  K: ['Romania', 'Saudi Arabia', 'Mali', 'Honduras'],
  L: ['Venezuela', 'New Zealand', 'Egypt', 'Qatar'],
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
  'Dallas':          'AT&T Stadium, Dallas',
  'Los Angeles':     'SoFi Stadium, Los Angeles',
  'New York':        'MetLife Stadium, New York/New Jersey',
  'San Francisco':   "Levi's Stadium, San Francisco",
  'Kansas City':     'Arrowhead Stadium, Kansas City',
  'Atlanta':         'Mercedes-Benz Stadium, Atlanta',
  'Miami':           'Hard Rock Stadium, Miami',
  'Boston':          'Gillette Stadium, Boston',
  'Seattle':         'Lumen Field, Seattle',
  'Philadelphia':    'Lincoln Financial Field, Philadelphia',
  'Vancouver':       'BC Place, Vancouver',
  'Toronto':         'BMO Field, Toronto',
  'Mexico City':     'Estadio Azteca, Ciudad de México',
  'Monterrey':       'Estadio BBVA, Monterrey',
  'Guadalajara':     'Estadio Akron, Guadalajara',
}

// Fixture de fase de grupos
// Formato: { id, group, home, away, date (ISO), venue }
// Horarios en UTC-3 (Argentina)
export const GROUP_MATCHES = [
  // ─── GRUPO A ───
  { id: 'A1', group: 'A', home: 'USA',      away: 'Panama',   date: '2026-06-11T20:00:00', venue: 'Dallas' },
  { id: 'A2', group: 'A', home: 'Portugal', away: 'Algeria',  date: '2026-06-11T23:00:00', venue: 'Kansas City' },
  { id: 'A3', group: 'A', home: 'USA',      away: 'Algeria',  date: '2026-06-15T20:00:00', venue: 'Seattle' },
  { id: 'A4', group: 'A', home: 'Portugal', away: 'Panama',   date: '2026-06-15T23:00:00', venue: 'Boston' },
  { id: 'A5', group: 'A', home: 'USA',      away: 'Portugal', date: '2026-06-19T20:00:00', venue: 'New York' },
  { id: 'A6', group: 'A', home: 'Panama',   away: 'Algeria',  date: '2026-06-19T20:00:00', venue: 'Atlanta' },

  // ─── GRUPO B ───
  { id: 'B1', group: 'B', home: 'Mexico',       away: 'South Africa', date: '2026-06-12T17:00:00', venue: 'Guadalajara' },
  { id: 'B2', group: 'B', home: 'Belgium',      away: 'Paraguay',     date: '2026-06-12T20:00:00', venue: 'Miami' },
  { id: 'B3', group: 'B', home: 'Mexico',       away: 'Paraguay',     date: '2026-06-16T20:00:00', venue: 'Monterrey' },
  { id: 'B4', group: 'B', home: 'Belgium',      away: 'South Africa', date: '2026-06-16T23:00:00', venue: 'Atlanta' },
  { id: 'B5', group: 'B', home: 'Mexico',       away: 'Belgium',      date: '2026-06-20T20:00:00', venue: 'Mexico City' },
  { id: 'B6', group: 'B', home: 'South Africa', away: 'Paraguay',     date: '2026-06-20T20:00:00', venue: 'Miami' },

  // ─── GRUPO C ───
  { id: 'C1', group: 'C', home: 'Canada',  away: 'Iraq',    date: '2026-06-12T23:00:00', venue: 'Vancouver' },
  { id: 'C2', group: 'C', home: 'Denmark', away: 'Uruguay', date: '2026-06-13T02:00:00', venue: 'Toronto' },
  { id: 'C3', group: 'C', home: 'Canada',  away: 'Uruguay', date: '2026-06-17T20:00:00', venue: 'Toronto' },
  { id: 'C4', group: 'C', home: 'Denmark', away: 'Iraq',    date: '2026-06-17T23:00:00', venue: 'Vancouver' },
  { id: 'C5', group: 'C', home: 'Canada',  away: 'Denmark', date: '2026-06-21T20:00:00', venue: 'Vancouver' },
  { id: 'C6', group: 'C', home: 'Uruguay', away: 'Iraq',    date: '2026-06-21T20:00:00', venue: 'Toronto' },

  // ─── GRUPO D ───
  { id: 'D1', group: 'D', home: 'Argentina', away: 'Nigeria', date: '2026-06-13T17:00:00', venue: 'New York' },
  { id: 'D2', group: 'D', home: 'France',    away: 'Jordan',  date: '2026-06-13T20:00:00', venue: 'Los Angeles' },
  { id: 'D3', group: 'D', home: 'Argentina', away: 'Jordan',  date: '2026-06-17T17:00:00', venue: 'Dallas' },
  { id: 'D4', group: 'D', home: 'France',    away: 'Nigeria', date: '2026-06-17T20:00:00', venue: 'San Francisco' },
  { id: 'D5', group: 'D', home: 'Argentina', away: 'France',  date: '2026-06-21T17:00:00', venue: 'Dallas' },
  { id: 'D6', group: 'D', home: 'Nigeria',   away: 'Jordan',  date: '2026-06-21T17:00:00', venue: 'Philadelphia' },

  // ─── GRUPO E ───
  { id: 'E1', group: 'E', home: 'Brazil',      away: 'Jamaica',     date: '2026-06-13T23:00:00', venue: 'Los Angeles' },
  { id: 'E2', group: 'E', home: 'Netherlands', away: 'Senegal',     date: '2026-06-14T02:00:00', venue: 'Philadelphia' },
  { id: 'E3', group: 'E', home: 'Brazil',      away: 'Senegal',     date: '2026-06-18T20:00:00', venue: 'San Francisco' },
  { id: 'E4', group: 'E', home: 'Netherlands', away: 'Jamaica',     date: '2026-06-18T23:00:00', venue: 'Dallas' },
  { id: 'E5', group: 'E', home: 'Brazil',      away: 'Netherlands', date: '2026-06-22T20:00:00', venue: 'Los Angeles' },
  { id: 'E6', group: 'E', home: 'Senegal',     away: 'Jamaica',     date: '2026-06-22T20:00:00', venue: 'Miami' },

  // ─── GRUPO F ───
  { id: 'F1', group: 'F', home: 'England',  away: 'Morocco',  date: '2026-06-14T17:00:00', venue: 'New York' },
  { id: 'F2', group: 'F', home: 'Poland',   away: 'Colombia', date: '2026-06-14T20:00:00', venue: 'Philadelphia' },
  { id: 'F3', group: 'F', home: 'England',  away: 'Colombia', date: '2026-06-18T17:00:00', venue: 'Boston' },
  { id: 'F4', group: 'F', home: 'Poland',   away: 'Morocco',  date: '2026-06-18T20:00:00', venue: 'New York' },
  { id: 'F5', group: 'F', home: 'England',  away: 'Poland',   date: '2026-06-22T17:00:00', venue: 'New York' },
  { id: 'F6', group: 'F', home: 'Colombia', away: 'Morocco',  date: '2026-06-22T17:00:00', venue: 'Atlanta' },

  // ─── GRUPO G ───
  { id: 'G1', group: 'G', home: 'Spain',   away: 'Japan',   date: '2026-06-14T23:00:00', venue: 'Kansas City' },
  { id: 'G2', group: 'G', home: 'Croatia', away: 'Ecuador', date: '2026-06-15T02:00:00', venue: 'Dallas' },
  { id: 'G3', group: 'G', home: 'Spain',   away: 'Ecuador', date: '2026-06-19T17:00:00', venue: 'Dallas' },
  { id: 'G4', group: 'G', home: 'Croatia', away: 'Japan',   date: '2026-06-19T20:00:00', venue: 'Kansas City' },
  { id: 'G5', group: 'G', home: 'Spain',   away: 'Croatia', date: '2026-06-23T17:00:00', venue: 'Atlanta' },
  { id: 'G6', group: 'G', home: 'Ecuador', away: 'Japan',   date: '2026-06-23T17:00:00', venue: 'Miami' },

  // ─── GRUPO H ───
  { id: 'H1', group: 'H', home: 'Germany',     away: 'Cameroon',    date: '2026-06-15T17:00:00', venue: 'Philadelphia' },
  { id: 'H2', group: 'H', home: 'Serbia',      away: 'South Korea', date: '2026-06-15T20:00:00', venue: 'Los Angeles' },
  { id: 'H3', group: 'H', home: 'Germany',     away: 'South Korea', date: '2026-06-19T17:00:00', venue: 'Seattle' },
  { id: 'H4', group: 'H', home: 'Serbia',      away: 'Cameroon',    date: '2026-06-19T20:00:00', venue: 'San Francisco' },
  { id: 'H5', group: 'H', home: 'Germany',     away: 'Serbia',      date: '2026-06-23T20:00:00', venue: 'Seattle' },
  { id: 'H6', group: 'H', home: 'South Korea', away: 'Cameroon',    date: '2026-06-23T20:00:00', venue: 'Los Angeles' },

  // ─── GRUPO I ───
  { id: 'I1', group: 'I', home: 'Italy',       away: 'Ivory Coast', date: '2026-06-16T17:00:00', venue: 'Philadelphia' },
  { id: 'I2', group: 'I', home: 'Turkey',      away: 'Australia',   date: '2026-06-16T20:00:00', venue: 'Kansas City' },
  { id: 'I3', group: 'I', home: 'Italy',       away: 'Australia',   date: '2026-06-20T17:00:00', venue: 'Miami' },
  { id: 'I4', group: 'I', home: 'Turkey',      away: 'Ivory Coast', date: '2026-06-20T20:00:00', venue: 'Boston' },
  { id: 'I5', group: 'I', home: 'Italy',       away: 'Turkey',      date: '2026-06-24T17:00:00', venue: 'New York' },
  { id: 'I6', group: 'I', home: 'Australia',   away: 'Ivory Coast', date: '2026-06-24T17:00:00', venue: 'Kansas City' },

  // ─── GRUPO J ───
  { id: 'J1', group: 'J', home: 'Switzerland', away: 'Tunisia', date: '2026-06-16T23:00:00', venue: 'Boston' },
  { id: 'J2', group: 'J', home: 'Austria',     away: 'Iran',    date: '2026-06-17T02:00:00', venue: 'San Francisco' },
  { id: 'J3', group: 'J', home: 'Switzerland', away: 'Iran',    date: '2026-06-21T17:00:00', venue: 'Seattle' },
  { id: 'J4', group: 'J', home: 'Austria',     away: 'Tunisia', date: '2026-06-21T20:00:00', venue: 'Philadelphia' },
  { id: 'J5', group: 'J', home: 'Switzerland', away: 'Austria', date: '2026-06-25T17:00:00', venue: 'Boston' },
  { id: 'J6', group: 'J', home: 'Iran',        away: 'Tunisia', date: '2026-06-25T17:00:00', venue: 'San Francisco' },

  // ─── GRUPO K ───
  { id: 'K1', group: 'K', home: 'Romania',     away: 'Honduras',     date: '2026-06-17T17:00:00', venue: 'Atlanta' },
  { id: 'K2', group: 'K', home: 'Saudi Arabia',away: 'Mali',         date: '2026-06-17T20:00:00', venue: 'Los Angeles' },
  { id: 'K3', group: 'K', home: 'Romania',     away: 'Mali',         date: '2026-06-22T17:00:00', venue: 'Kansas City' },
  { id: 'K4', group: 'K', home: 'Saudi Arabia',away: 'Honduras',     date: '2026-06-22T20:00:00', venue: 'Seattle' },
  { id: 'K5', group: 'K', home: 'Romania',     away: 'Saudi Arabia', date: '2026-06-26T17:00:00', venue: 'Atlanta' },
  { id: 'K6', group: 'K', home: 'Honduras',    away: 'Mali',         date: '2026-06-26T17:00:00', venue: 'Dallas' },

  // ─── GRUPO L ───
  { id: 'L1', group: 'L', home: 'Venezuela',   away: 'Qatar',       date: '2026-06-18T17:00:00', venue: 'Guadalajara' },
  { id: 'L2', group: 'L', home: 'New Zealand', away: 'Egypt',       date: '2026-06-18T20:00:00', venue: 'Monterrey' },
  { id: 'L3', group: 'L', home: 'Venezuela',   away: 'Egypt',       date: '2026-06-23T17:00:00', venue: 'Mexico City' },
  { id: 'L4', group: 'L', home: 'New Zealand', away: 'Qatar',       date: '2026-06-23T20:00:00', venue: 'Guadalajara' },
  { id: 'L5', group: 'L', home: 'Venezuela',   away: 'New Zealand', date: '2026-06-27T17:00:00', venue: 'Monterrey' },
  { id: 'L6', group: 'L', home: 'Qatar',       away: 'Egypt',       date: '2026-06-27T17:00:00', venue: 'Mexico City' },
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

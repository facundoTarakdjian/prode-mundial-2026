export const CODIGO_PAIS = {
  'México':             'mx',
  'Corea del Sur':      'kr',
  'Sudáfrica':          'za',
  'Chequia':            'cz',
  'Canadá':             'ca',
  'Bosnia-Herzegovina': 'ba',
  'Qatar':              'qa',
  'Suiza':              'ch',
  'Brasil':             'br',
  'Marruecos':          'ma',
  'Haití':              'ht',
  'Escocia':            'gb-sct',
  'USA':                'us',
  'Paraguay':           'py',
  'Australia':          'au',
  'Turquía':            'tr',
  'Alemania':           'de',
  'Curaçao':            'cw',
  'Costa de Marfil':    'ci',
  'Ecuador':            'ec',
  'Países Bajos':       'nl',
  'Japón':              'jp',
  'Suecia':             'se',
  'Túnez':              'tn',
  'Bélgica':            'be',
  'Egipto':             'eg',
  'Irán':               'ir',
  'Nueva Zelanda':      'nz',
  'España':             'es',
  'Cabo Verde':         'cv',
  'Arabia Saudita':     'sa',
  'Uruguay':            'uy',
  'Francia':            'fr',
  'Senegal':            'sn',
  'Irak':               'iq',
  'Noruega':            'no',
  'Argentina':          'ar',
  'Argelia':            'dz',
  'Austria':            'at',
  'Jordania':           'jo',
  'Portugal':           'pt',
  'RD Congo':           'cd',
  'Uzbekistán':         'uz',
  'Colombia':           'co',
  'Inglaterra':         'gb-eng',
  'Croacia':            'hr',
  'Ghana':              'gh',
  'Panamá':             'pa',
}

export default function Bandera({ pais }) {
  const codigo = CODIGO_PAIS[pais]
  if (!codigo) return null
  return (
    <img
      src={`https://flagcdn.com/32x24/${codigo}.png`}
      width="32"
      height="24"
      alt={pais}
      className="rounded shadow-sm object-cover"
    />
  )
}

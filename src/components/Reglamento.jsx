import { useApp } from '../context/AppContext'

export default function Reglamento() {
  const { scoring } = useApp()

  const rules = [
    {
      icon: '⚽',
      title: 'Fase de Grupos — Ganador o Empate',
      points: scoring.exactResult,
      desc: `Si acertás el ganador (o el empate) de un partido de la fase de grupos, sumás ${scoring.exactResult} punto${scoring.exactResult !== 1 ? 's' : ''}. No importa el marcador exacto.`,
    },
    {
      icon: '🎯',
      title: '32 Clasificados a 16avos',
      points: scoring.qualifierHit,
      desc: `Por cada país que hayas seleccionado que efectivamente clasifica a la fase eliminatoria, sumás ${scoring.qualifierHit} punto${scoring.qualifierHit !== 1 ? 's' : ''}. Hay 32 cupos.`,
    },
    {
      icon: '🥇',
      title: 'Campeón del Mundo',
      points: scoring.champion,
      desc: `Si acertás el campeón, sumás ${scoring.champion} puntos.`,
    },
    {
      icon: '🥈',
      title: 'Subcampeón',
      points: scoring.subchampion,
      desc: `Si acertás el subcampeón, sumás ${scoring.subchampion} puntos.`,
    },
    {
      icon: '⚡',
      title: 'Eliminación directa — Quién pasa',
      points: scoring.knockoutWinner,
      desc: `Por cada llave de eliminación directa donde acertás el equipo que avanza, sumás ${scoring.knockoutWinner} puntos.`,
    },
    {
      icon: '🕐',
      title: 'Eliminación directa — Resultado en 90\'',
      points: scoring.knockoutResult,
      desc: `Si acertás el resultado en 90 minutos (sin contar prórroga ni penales) de un partido eliminatorio, sumás ${scoring.knockoutResult} punto${scoring.knockoutResult !== 1 ? 's' : ''}.`,
    },
  ]

  const maxPossible =
    72 * scoring.exactResult +
    32 * scoring.qualifierHit +
    scoring.champion +
    scoring.subchampion +
    (16 + 8 + 4 + 2 + 1) * (scoring.knockoutWinner + scoring.knockoutResult)

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow p-5">
        <h2 className="text-lg font-bold text-gray-800 mb-1">📋 Reglamento de Puntuación</h2>
        <p className="text-sm text-gray-500 mb-5">
          Los puntos son configurados por el administrador y se aplican automáticamente al calcular la tabla.
        </p>

        <div className="grid gap-3">
          {rules.map((rule, i) => (
            <div key={i} className="flex gap-4 bg-gray-50 rounded-xl p-4">
              <div className="text-3xl shrink-0">{rule.icon}</div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-gray-800 text-sm">{rule.title}</h3>
                  <span className="bg-green-100 text-green-700 font-bold text-sm px-2.5 py-0.5 rounded-full shrink-0">
                    {rule.points} pto{rule.points !== 1 ? 's' : ''}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{rule.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
        <h3 className="font-bold text-green-800 mb-2">💡 Notas generales</h3>
        <ul className="text-sm text-green-900 space-y-1 list-disc list-inside">
          <li>No se pueden editar pronósticos de un partido una vez que comenzó.</li>
          <li>Los puntos se calculan automáticamente cuando el admin carga resultados.</li>
          <li>En grupos, solo el resultado exacto suma puntos (no hay puntos por acertar ganador o empate).</li>
          <li>En eliminación directa, el resultado en 90' no incluye prórroga ni penales.</li>
          <li>Puntaje máximo posible con la configuración actual: <strong>{maxPossible} puntos</strong>.</li>
        </ul>
      </div>
    </div>
  )
}

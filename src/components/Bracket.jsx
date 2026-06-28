import { CODIGO_PAIS } from './Bandera'
import { R32_FIXTURE, R16_FIXTURE, QF_FIXTURE, SF_FIXTURE, F_FIXTURE } from '../constants/fixture'

// ── Constantes de layout ───────────────────────────────────────────────────
const UNIT    = 72   // altura (px) de un slot de R32
const CARD_W  = 140  // ancho de cada casilla
const CONN_W  = 14   // ancho de la columna de conectores
const LC      = '#d1d5db' // color líneas (gray-300)

// ── Lookup fixture → datos estáticos ──────────────────────────────────────
const FIX = Object.fromEntries(
  [...R32_FIXTURE, ...R16_FIXTURE, ...QF_FIXTURE, ...SF_FIXTURE, ...F_FIXTURE].map(f => [f.id, f])
)

// ── Orden del árbol del bracket ───────────────────────────────────────────
// Mitad izquierda: R32 → R16 → QF → SF (de arriba a abajo)
const L_R32 = ['R32_2','R32_5','R32_1','R32_3','R32_4','R32_6','R32_7','R32_8']
const L_R16 = ['R16_1','R16_2','R16_3','R16_4']
const L_QF  = ['QF_1','QF_2']
const L_SF  = ['SF_1']

// Mitad derecha: SF → QF → R16 → R32 (de arriba a abajo, espejo)
const R_SF  = ['SF_2']
const R_QF  = ['QF_3','QF_4']
const R_R16 = ['R16_5','R16_6','R16_7','R16_8']
const R_R32 = ['R32_11','R32_12','R32_9','R32_10','R32_14','R32_16','R32_13','R32_15']

// ── Mini bandera para el bracket ──────────────────────────────────────────
function Flag({ pais }) {
  const cod = CODIGO_PAIS[pais]
  if (!cod) return <div style={{ width: 20, height: 14 }} />
  return (
    <img
      src={`https://flagcdn.com/20x15/${cod}.png`}
      width={20} height={15}
      alt={pais}
      style={{ borderRadius: 2, objectFit: 'cover', display: 'block' }}
    />
  )
}

// ── Fila de equipo dentro de una casilla ─────────────────────────────────
function TeamRow({ team, score, isWinner }) {
  const tbd = !team || team.startsWith('Por definir')
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 4,
      padding: '4px 6px',
      backgroundColor: isWinner ? '#f0fdf4' : 'transparent',
      minHeight: 26,
    }}>
      <div style={{ width: 20, flexShrink: 0 }}>
        {!tbd && <Flag pais={team} />}
      </div>
      <span style={{
        flex: 1, fontSize: 11, lineHeight: 1.2,
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        color:      tbd ? '#9ca3af' : isWinner ? '#15803d' : '#374151',
        fontWeight: isWinner ? 700 : 500,
        fontStyle:  tbd ? 'italic' : 'normal',
      }}>
        {tbd ? 'Por definir' : team}
      </span>
      {score != null && (
        <span style={{ fontSize: 11, fontWeight: 700, color: isWinner ? '#15803d' : '#9ca3af', flexShrink: 0 }}>
          {score}
        </span>
      )}
    </div>
  )
}

// ── Casilla de partido ────────────────────────────────────────────────────
function MatchCard({ matchId, knockoutData, isFinal }) {
  const fix = FIX[matchId] || {}
  const kd  = knockoutData[matchId] || {}
  const home = kd.home || fix.home || ''
  const away = kd.away || fix.away || ''
  const hasScore = kd.homeGoals != null && kd.awayGoals != null

  return (
    <div style={{
      width: CARD_W,
      border:       isFinal ? '1.5px solid #f59e0b' : '1px solid #e5e7eb',
      borderRadius: 6,
      overflow:     'hidden',
      boxShadow:    isFinal ? '0 0 0 3px #fef3c7, 0 2px 6px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.08)',
      backgroundColor: '#fff',
    }}>
      <TeamRow team={home} score={hasScore ? kd.homeGoals : null} isWinner={!!kd.winner && kd.winner === home} />
      <div style={{ height: 1, backgroundColor: isFinal ? '#fde68a' : '#f3f4f6' }} />
      <TeamRow team={away} score={hasScore ? kd.awayGoals : null} isWinner={!!kd.winner && kd.winner === away} />
    </div>
  )
}

// ── Columna de ronda: N casillas, cada una en un slot de slotH px ─────────
function RoundCol({ ids, slotH, knockoutData, isFinal }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {ids.map(id => (
        <div key={id} style={{ height: slotH, display: 'flex', alignItems: 'center' }}>
          <MatchCard matchId={id} knockoutData={knockoutData} isFinal={isFinal} />
        </div>
      ))}
    </div>
  )
}

// ── Conector derecho (mitad izquierda del bracket) ────────────────────────
// Cada par ocupa pairH px; dibuja el bracket ┐└ conectando dos casillas a una.
// Fórmula: la línea activa va del centro del slot superior al centro del inferior,
// con la unión en el punto medio. seg = pairH/4 es el segmento entre el borde del
// slot y su centro.
function ConnRight({ pairH, count }) {
  const seg = pairH / 4
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: CONN_W }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ height: pairH, display: 'flex', flexDirection: 'column' }}>
          <div style={{ height: seg }} />
          <div style={{ height: seg, borderRight: `2px solid ${LC}`, borderBottom: `2px solid ${LC}`, borderRadius: '0 0 3px 0' }} />
          <div style={{ height: seg, borderRight: `2px solid ${LC}`, borderTop:    `2px solid ${LC}`, borderRadius: '0 3px 0 0' }} />
          <div style={{ height: seg }} />
        </div>
      ))}
    </div>
  )
}

// ── Conector izquierdo (mitad derecha del bracket, espejo) ────────────────
function ConnLeft({ pairH, count }) {
  const seg = pairH / 4
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: CONN_W }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ height: pairH, display: 'flex', flexDirection: 'column' }}>
          <div style={{ height: seg }} />
          <div style={{ height: seg, borderLeft: `2px solid ${LC}`, borderBottom: `2px solid ${LC}`, borderRadius: '0 0 0 3px' }} />
          <div style={{ height: seg, borderLeft: `2px solid ${LC}`, borderTop:    `2px solid ${LC}`, borderRadius: '3px 0 0 0' }} />
          <div style={{ height: seg }} />
        </div>
      ))}
    </div>
  )
}

// ── Línea horizontal centrada verticalmente ───────────────────────────────
function HLine({ totalH, w = 12 }) {
  return (
    <div style={{ height: totalH, display: 'flex', alignItems: 'center' }}>
      <div style={{ width: w, height: 2, backgroundColor: LC }} />
    </div>
  )
}

// ── Bracket principal ─────────────────────────────────────────────────────
export default function Bracket({ knockoutData }) {
  const TOTAL_H = 8 * UNIT  // = 576 px

  return (
    <div style={{ overflowX: 'auto', overflowY: 'visible' }}>
      {/* Rótulos de rondas */}
      <div style={{ display: 'flex', paddingLeft: 8, paddingRight: 8, paddingBottom: 4, minWidth: 'max-content' }}>
        {[
          { w: CARD_W,         label: '16avos' },
          { w: CONN_W,         label: '' },
          { w: CARD_W,         label: '8avos' },
          { w: CONN_W,         label: '' },
          { w: CARD_W,         label: 'Cuartos' },
          { w: CONN_W,         label: '' },
          { w: CARD_W,         label: 'Semis' },
          { w: 12,             label: '' },
          { w: CARD_W + 8,     label: '🏆 Final', isFinal: true },
          { w: 12,             label: '' },
          { w: CARD_W,         label: 'Semis' },
          { w: CONN_W,         label: '' },
          { w: CARD_W,         label: 'Cuartos' },
          { w: CONN_W,         label: '' },
          { w: CARD_W,         label: '8avos' },
          { w: CONN_W,         label: '' },
          { w: CARD_W,         label: '16avos' },
        ].map((col, i) => (
          <div key={i} style={{ width: col.w, flexShrink: 0, textAlign: 'center' }}>
            {col.label && (
              <span style={{
                fontSize: 10, fontWeight: 700, letterSpacing: '0.05em',
                color: col.isFinal ? '#d97706' : '#9ca3af',
                textTransform: 'uppercase',
              }}>
                {col.label}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Bracket */}
      <div style={{ display: 'inline-flex', alignItems: 'flex-start', padding: '0 8px 12px', gap: 0, minWidth: 'max-content' }}>

        {/* ── MITAD IZQUIERDA ── */}
        <RoundCol ids={L_R32} slotH={UNIT}      knockoutData={knockoutData} />
        <ConnRight pairH={2 * UNIT} count={4} />
        <RoundCol ids={L_R16} slotH={2 * UNIT}  knockoutData={knockoutData} />
        <ConnRight pairH={4 * UNIT} count={2} />
        <RoundCol ids={L_QF}  slotH={4 * UNIT}  knockoutData={knockoutData} />
        <ConnRight pairH={8 * UNIT} count={1} />
        <RoundCol ids={L_SF}  slotH={TOTAL_H}   knockoutData={knockoutData} />
        <HLine totalH={TOTAL_H} />

        {/* ── FINAL ── */}
        <div style={{ height: TOTAL_H, display: 'flex', alignItems: 'center', padding: '0 4px' }}>
          <div>
            <div style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#d97706', marginBottom: 4 }}>
              🏆 Final
            </div>
            <MatchCard matchId="F_1" knockoutData={knockoutData} isFinal />
          </div>
        </div>

        <HLine totalH={TOTAL_H} />
        {/* ── MITAD DERECHA ── */}
        <RoundCol ids={R_SF}  slotH={TOTAL_H}   knockoutData={knockoutData} />
        <ConnLeft pairH={8 * UNIT} count={1} />
        <RoundCol ids={R_QF}  slotH={4 * UNIT}  knockoutData={knockoutData} />
        <ConnLeft pairH={4 * UNIT} count={2} />
        <RoundCol ids={R_R16} slotH={2 * UNIT}  knockoutData={knockoutData} />
        <ConnLeft pairH={2 * UNIT} count={4} />
        <RoundCol ids={R_R32} slotH={UNIT}      knockoutData={knockoutData} />

      </div>
    </div>
  )
}

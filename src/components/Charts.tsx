import { money } from '../format'

export interface Series {
  name: string
  color: string
  values: number[]
}

function niceTicks(min: number, max: number, count = 5): number[] {
  if (min === max) max = min + 1
  const span = max - min
  const step0 = span / count
  const mag = Math.pow(10, Math.floor(Math.log10(step0)))
  const norm = step0 / mag
  const step = (norm >= 5 ? 10 : norm >= 2 ? 5 : norm >= 1 ? 2 : 1) * mag
  const lo = Math.floor(min / step) * step
  const hi = Math.ceil(max / step) * step
  const ticks: number[] = []
  for (let v = lo; v <= hi + step / 2; v += step) ticks.push(Math.round(v / step) * step)
  return ticks
}

const W = 640
const H = 260
const M = { l: 64, r: 16, t: 12, b: 32 }

export function Legend({ series }: { series: { name: string; color: string }[] }) {
  return (
    <div className="legend">
      {series.map((s) => (
        <span key={s.name}><i style={{ background: s.color }} />{s.name}</span>
      ))}
    </div>
  )
}

/** Balances at year ends; x labels supplied by the caller. */
export function LineChart({ series, labels, title }: { series: Series[]; labels: string[]; title: string }) {
  const all = series.flatMap((s) => s.values)
  const ticks = niceTicks(Math.min(0, ...all), Math.max(0, ...all))
  const y0 = ticks[0]
  const y1 = ticks[ticks.length - 1]
  const x = (i: number) => M.l + (labels.length === 1 ? 0 : (i / (labels.length - 1)) * (W - M.l - M.r))
  const y = (v: number) => M.t + (1 - (v - y0) / (y1 - y0)) * (H - M.t - M.b)
  return (
    <svg className="chart-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={title}>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={M.l} x2={W - M.r} y1={y(t)} y2={y(t)} stroke="var(--line)" strokeWidth={t === 0 ? 1.4 : 1} />
          <text x={M.l - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="var(--muted)">{money(t)}</text>
        </g>
      ))}
      {labels.map((l, i) => (
        <text key={l} x={x(i)} y={H - 10} textAnchor="middle" fontSize="11" fill="var(--muted)">{l}</text>
      ))}
      {series.map((s) => (
        <g key={s.name}>
          <polyline fill="none" stroke={s.color} strokeWidth="2.2" points={s.values.map((v, i) => `${x(i)},${y(v)}`).join(' ')} />
          {s.values.map((v, i) => (
            <circle key={i} cx={x(i)} cy={y(v)} r={i === s.values.length - 1 || i === 0 ? 3.5 : 2.5} fill={s.color}>
              <title>{`${s.name}, ${labels[i]}: ${money(v)}`}</title>
            </circle>
          ))}
        </g>
      ))}
    </svg>
  )
}

/** Stacked columns per label; negative parts stack below zero. */
export function StackedBars({ series, labels, title }: { series: Series[]; labels: string[]; title: string }) {
  const pos = labels.map((_, i) => series.reduce((a, s) => a + Math.max(0, s.values[i]), 0))
  const neg = labels.map((_, i) => series.reduce((a, s) => a + Math.min(0, s.values[i]), 0))
  const ticks = niceTicks(Math.min(0, ...neg), Math.max(0, ...pos))
  const y0 = ticks[0]
  const y1 = ticks[ticks.length - 1]
  const band = (W - M.l - M.r) / labels.length
  const bw = Math.min(56, band * 0.55)
  const y = (v: number) => M.t + (1 - (v - y0) / (y1 - y0)) * (H - M.t - M.b)
  return (
    <svg className="chart-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={title}>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={M.l} x2={W - M.r} y1={y(t)} y2={y(t)} stroke="var(--line)" strokeWidth={t === 0 ? 1.4 : 1} />
          <text x={M.l - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="var(--muted)">{money(t)}</text>
        </g>
      ))}
      {labels.map((l, i) => {
        const cx = M.l + band * i + band / 2
        let up = 0
        let down = 0
        return (
          <g key={l}>
            {series.map((s) => {
              const v = s.values[i]
              if (Math.abs(v) < 0.5) return null
              const from = v >= 0 ? up : down
              const to = from + v
              if (v >= 0) up = to
              else down = to
              return (
                <rect key={s.name} x={cx - bw / 2} width={bw} y={y(Math.max(from, to))} height={Math.abs(y(from) - y(to))} fill={s.color}>
                  <title>{`${s.name}, ${l}: ${money(v)}`}</title>
                </rect>
              )
            })}
            <text x={cx} y={H - 10} textAnchor="middle" fontSize="11" fill="var(--muted)">{l}</text>
          </g>
        )
      })}
    </svg>
  )
}

/** Day-one picture: what the insurer expects to receive against what it expects to pay plus margins. */
export function BuildingBlocks({ inflows, outflows, ra, csm, loss }: { inflows: number; outflows: number; ra: number; csm: number; loss: number }) {
  const Wd = 720
  const Hd = 250
  const top = Math.max(inflows + loss, outflows + ra + csm)
  const scale = (Hd - 60) / (top || 1)
  const base = Hd - 30
  const col = (x: number, parts: { v: number; color: string; label: string }[]) => {
    let acc = 0
    return parts.map((p) => {
      const h = p.v * scale
      const yTop = base - (acc + p.v) * scale
      acc += p.v
      if (p.v < 0.5) return null
      return (
        <g key={p.label}>
          <rect x={x} y={yTop} width={150} height={h} fill={p.color} rx={2}>
            <title>{`${p.label}: ${money(p.v)}`}</title>
          </rect>
          {h > 18 && (
            <text x={x + 160} y={yTop + h / 2 + 4} fontSize="12" fill="var(--ink)">{p.label} <tspan fill="var(--muted)">{money(p.v)}</tspan></text>
          )}
        </g>
      )
    })
  }
  return (
    <svg className="chart-svg" viewBox={`0 0 ${Wd} ${Hd}`} role="img" aria-label="Measurement at initial recognition">
      <line x1={20} x2={Wd - 20} y1={base} y2={base} stroke="var(--line-strong)" />
      {col(30, [
        { v: inflows, color: 'var(--chart-1)', label: 'PV of premiums' },
        { v: loss, color: 'var(--bad)', label: 'Day-one loss' },
      ])}
      {col(400, [
        { v: outflows, color: 'var(--chart-4)', label: 'PV of outflows' },
        { v: ra, color: 'var(--chart-2)', label: 'Risk adjustment' },
        { v: csm, color: 'var(--chart-3)', label: 'CSM (unearned profit)' },
      ])}
      <text x={105} y={Hd - 10} textAnchor="middle" fontSize="11" fill="var(--muted)">Expected to receive</text>
      <text x={475} y={Hd - 10} textAnchor="middle" fontSize="11" fill="var(--muted)">Expected to pay, plus margins</text>
    </svg>
  )
}

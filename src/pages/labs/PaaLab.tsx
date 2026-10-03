import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { runGmm, type GmmInputs } from '../../engine/gmm'
import { runPaa } from '../../engine/paa'
import { PRESETS } from '../../engine/presets'
import { Legend, LineChart } from '../../components/Charts'
import { CopyCsv } from '../../components/CopyCsv'
import { NumField } from '../../components/Fields'
import { Icon } from '../../components/Icon'
import { money, pct } from '../../format'

const THRESHOLD = 0.05

export function PaaLab() {
  const [presetId, setPresetId] = useState('profitable')
  const [inp, setInp] = useState<GmmInputs>(PRESETS[0].inputs)
  const [expenseAcq, setExpenseAcq] = useState(false)
  const update = (p: Partial<GmmInputs>) => setInp((c) => ({ ...c, ...p }))
  const choose = (id: string) => {
    setPresetId(id)
    setInp(PRESETS.find((p) => p.id === id)!.inputs)
  }
  const setYears = (n: number) => {
    const years = Math.max(1, Math.min(10, Math.round(n) || 1))
    const fit = (a: number[], fill: number) => Array.from({ length: years }, (_, i) => a[i] ?? a[a.length - 1] ?? fill)
    update({
      years,
      claims: fit(inp.claims, 0),
      expenses: fit(inp.expenses, 0),
      coverageUnits: fit(inp.coverageUnits, 1),
      actualClaimsFactor: fit(inp.actualClaimsFactor, 1),
      assumptionChange: inp.assumptionChange && inp.assumptionChange.year < years ? inp.assumptionChange : null,
    })
  }

  const g = useMemo(() => runGmm(inp), [inp])
  const p = useMemo(() => runPaa(inp, { expenseAcquisition: expenseAcq }), [inp, expenseAcq])
  const cover = g.years.filter((y) => y.inCoverage)
  // Compare the liability for remaining coverage at each year end during cover; the loss component is excluded
  // from the GMM figure because the lab's PAA does not model onerous groups.
  const diffs = cover.map((y, i) => Math.abs(y.close.lrc - y.close.lossComponent - p.years[i].lrcClose))
  const scale = Math.max(1, ...g.years.map((y) => Math.abs(y.close.lrc)), Math.abs(g.initial.fulfilmentCashFlows + g.initial.riskAdjustment + g.initial.csm), inp.premium)
  const maxDiff = Math.max(0, ...diffs)
  const ratio = maxDiff / scale
  const onerous = g.initial.lossComponent > 0.5
  const oneYear = inp.years <= 1
  const verdict: 'good' | 'warn' | 'bad' = onerous ? 'bad' : oneYear || ratio <= THRESHOLD ? 'good' : 'warn'

  const labels = ['Start', ...g.years.map((y) => (y.inCoverage ? `Y${y.year}` : `Y${y.year}*`))]
  const cum = (xs: number[]) => xs.reduce<number[]>((a, v) => [...a, (a[a.length - 1] ?? 0) + v], [])

  return (
    <>
      <div className="crumbs"><Link to="/lab">Labs</Link><span>/</span><span>PAA versus GMM</span></div>
      <div className="eyebrow">Lab · Premium Allocation Approach</div>
      <h1 style={{ marginTop: 8 }}>PAA versus GMM, side by side</h1>
      <p className="hero-lede">
        The <Link to="/concept/paa">PAA</Link> is a simplification of the <Link to="/concept/gmm">General Measurement Model</Link> for the liability
        for remaining coverage. It is allowed when cover is one year or less, or when it gives a measurement that would not differ materially from the GMM (IFRS 17.53).
      </p>

      <div className="lab-layout">
        <form className="panel inputs" onSubmit={(e) => e.preventDefault()} aria-label="Inputs">
          <div className="field">
            <label htmlFor="paa-preset">Start from</label>
            <select id="paa-preset" value={presetId} onChange={(e) => choose(e.target.value)}>
              {PRESETS.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
            </select>
          </div>
          <div className="field-pair">
            <NumField id="paa-years" label="Coverage years" value={inp.years} min={1} max={10} onChange={setYears} />
            <div className="field">
              <span className="label">Premium</span>
              <div className="seg" role="group" aria-label="Premium pattern">
                <button type="button" aria-pressed={inp.premiumMode === 'annual'} onClick={() => update({ premiumMode: 'annual' })}>Annual</button>
                <button type="button" aria-pressed={inp.premiumMode === 'single'} onClick={() => update({ premiumMode: 'single' })}>Single</button>
              </div>
            </div>
          </div>
          <div className="field-pair">
            <NumField id="paa-prem" label={inp.premiumMode === 'annual' ? 'Premium per year' : 'Single premium'} value={inp.premium} step={50} onChange={(v) => update({ premium: v })} />
            <NumField id="paa-rate" label="Discount rate" suffix="%" value={+(inp.discountRate * 100).toFixed(2)} step={0.5} onChange={(v) => update({ discountRate: v / 100 })} />
          </div>
          <NumField id="paa-lag" label="Claims paid next year" suffix="%" value={+(inp.settlementLag * 100).toFixed(0)} step={10} min={0} max={100}
            onChange={(v) => update({ settlementLag: Math.min(1, Math.max(0, v / 100)) })} />
          <div className="field">
            <span className="label">Acquisition cash flows under the PAA</span>
            <div className="seg" role="group" aria-label="Acquisition cash flows">
              <button type="button" aria-pressed={!expenseAcq} onClick={() => setExpenseAcq(false)}>Amortise</button>
              <button type="button" aria-pressed={expenseAcq} onClick={() => setExpenseAcq(true)}>Expense when paid</button>
            </div>
            <span className="hint">Expensing is allowed only when each contract's coverage is one year or less (IFRS 17.59(a)).</span>
          </div>
          <p className="lab-note">
            Try: switch to a single premium with 6 or more years of cover, or raise the discount rate. Both make the time value of money matter, and the gap grows.
          </p>
        </form>

        <div style={{ minWidth: 0, display: 'grid', gap: 20 }}>
          <div className={`panel verdict ${verdict}`} role="status">
            <Icon name={verdict === 'good' ? 'check' : 'warn'} size={20} />
            <div>
              {onerous ? (
                <>
                  <strong>The group is onerous.</strong> Under the PAA a loss must still be recognised when facts and circumstances indicate a group is onerous,
                  measured against the GMM fulfilment cash flows (IFRS 17.57–58). This lab’s PAA columns do not include that loss, so compare with care.
                </>
              ) : oneYear ? (
                <><strong>Eligible without testing.</strong> The coverage period is one year or less (IFRS 17.53(b)).</>
              ) : (
                <>
                  <strong>{ratio <= THRESHOLD ? 'Likely a reasonable approximation.' : 'Probably not a reasonable approximation.'}</strong>{' '}
                  The largest difference in the liability for remaining coverage is {money(maxDiff)}, {pct(ratio)} of the liability’s scale.
                  IFRS 17 sets no numeric threshold; this lab uses {pct(THRESHOLD)} to illustrate how an eligibility test is framed. Insurers test this at inception
                  under reasonably possible scenarios, and IFRS 17.54 rules it out when significant variability in fulfilment cash flows is expected.
                </>
              )}
            </div>
          </div>

          <div className="panel kpis">
            <div className="kpi"><div className="label">Lifetime profit, GMM</div><div className="value">{money(g.totals.profit)}</div></div>
            <div className="kpi"><div className="label">Lifetime profit, PAA</div><div className="value">{money(p.totals.profit)}</div></div>
            <div className="kpi"><div className="label">Largest LRC gap</div><div className="value">{money(maxDiff)}</div></div>
            <div className="kpi"><div className="label">Revenue, year 1 (GMM / PAA)</div><div className="value" style={{ fontSize: 'var(--step-1)' }}>{money(g.years[0].insuranceRevenue)} / {money(p.years[0].insuranceRevenue)}</div></div>
          </div>

          <div className="stack">
            <div className="panel chart-box">
              <h4>Liability for remaining coverage at each year end</h4>
              <div className="sub">The GMM discounts and carries a risk adjustment and CSM; the PAA holds unearned premium less unamortised acquisition costs</div>
              <LineChart title="LRC under GMM and PAA" labels={labels} series={[
                { name: 'GMM', color: 'var(--chart-1)', values: [0, ...g.years.map((y) => y.close.lrc - y.close.lossComponent)] },
                { name: 'PAA', color: 'var(--chart-2)', values: [0, ...p.years.map((y) => y.lrcClose)] },
              ]} />
              <Legend series={[{ name: 'GMM', color: 'var(--chart-1)' }, { name: 'PAA', color: 'var(--chart-2)' }]} />
            </div>
            <div className="panel chart-box">
              <h4>Cumulative profit</h4>
              <div className="sub">Different timing, same destination: both approaches earn the same total profit</div>
              <LineChart title="Cumulative profit under GMM and PAA" labels={labels} series={[
                { name: 'GMM', color: 'var(--chart-1)', values: [0, ...cum(g.years.map((y) => y.profit))] },
                { name: 'PAA', color: 'var(--chart-2)', values: [0, ...cum(p.years.map((y) => y.profit))] },
              ]} />
              <Legend series={[{ name: 'GMM', color: 'var(--chart-1)' }, { name: 'PAA', color: 'var(--chart-2)' }]} />
            </div>
          </div>

          <div className="table-wrap">
            <table className="data">
              <caption>
                <h4>Year by year</h4>
                <div className="refline"><span className="chip">IFRS 17.55</span><span className="chip">B126</span>
                  <CopyCsv rows={() => [
                    ['Year', 'Revenue GMM', 'Revenue PAA', 'Service expense GMM', 'Service expense PAA', 'Finance expense GMM', 'Finance expense PAA', 'Profit GMM', 'Profit PAA', 'LRC GMM', 'LRC PAA'],
                    ...g.years.map((y, i) => [y.year, y.insuranceRevenue, p.years[i].insuranceRevenue, y.insuranceServiceExpense, p.years[i].insuranceServiceExpense, y.insuranceFinanceExpense, p.years[i].insuranceFinanceExpense, y.profit, p.years[i].profit, y.close.lrc, p.years[i].lrcClose]),
                  ]} />
                </div>
              </caption>
              <thead>
                <tr><th scope="col">Line</th>{g.years.map((y) => <th scope="col" key={y.year}>{y.inCoverage ? `Y${y.year}` : `Y${y.year}*`}</th>)}<th scope="col">Total</th></tr>
              </thead>
              <tbody>
                {([
                  ['Insurance revenue · GMM', g.years.map((y) => y.insuranceRevenue)],
                  ['Insurance revenue · PAA', p.years.map((y) => y.insuranceRevenue)],
                  ['Service expenses · GMM', g.years.map((y) => -y.insuranceServiceExpense)],
                  ['Service expenses · PAA', p.years.map((y) => -y.insuranceServiceExpense)],
                  ['Finance expenses · GMM', g.years.map((y) => -y.insuranceFinanceExpense)],
                  ['Finance expenses · PAA', p.years.map((y) => -y.insuranceFinanceExpense)],
                  ['Profit · GMM', g.years.map((y) => y.profit)],
                  ['Profit · PAA', p.years.map((y) => y.profit)],
                ] as [string, number[]][]).map(([label, vals], i) => (
                  <tr key={label} className={i >= 6 ? 'subtotal' : ''}>
                    <td>{label}</td>
                    {vals.map((v, j) => <td key={j} className={v < -0.5 ? 'neg' : ''}>{money(v)}</td>)}
                    <td>{money(vals.reduce((a, b) => a + b, 0))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="panel story">
            <h4>Why they differ</h4>
            <ul>
              <li>The PAA spreads the premium over the coverage period by coverage units (or by time). The GMM builds revenue from expected claims, expenses, the risk adjustment release and the CSM release, so revenue follows the cost of providing cover as well as its volume.</li>
              <li>The PAA liability for remaining coverage is not discounted when there is no significant financing component (IFRS 17.56). The GMM always discounts, so interest accretes on the liability and the CSM as an insurance finance expense.</li>
              <li>The liability for incurred claims is measured the same way under both approaches: fulfilment cash flows, discounted unless claims are paid within a year (IFRS 17.59(b)), with a risk adjustment.</li>
              <li>Total profit over the life of the group is identical. Only the timing differs, which is why IFRS 17 lets the simpler approach stand in when the timing differences are small.</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}

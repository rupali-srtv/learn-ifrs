import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Legend, StackedBars } from '../../components/Charts'
import { CopyCsv } from '../../components/CopyCsv'
import { Range } from '../../components/Fields'
import { money, pct } from '../../format'

const DEFAULT_FLOWS = [300, 250, 200, 150, 100]

/** Present value at the end of year t of the payments due at the end of years t+1..N. */
function pvAt(flows: number[], rate: number, t: number): number {
  let pv = 0
  for (let k = t + 1; k <= flows.length; k++) pv += flows[k - 1] / Math.pow(1 + rate, k - t)
  return pv
}

export function DiscountLab() {
  const [flows, setFlows] = useState(DEFAULT_FLOWS)
  const [r0, setR0] = useState(0.04)
  const [r1, setR1] = useState(0.06)
  const [oci, setOci] = useState(true)
  const N = flows.length

  const rows = useMemo(
    () => flows.map((cf, i) => ({ t: i + 1, cf, df: 1 / Math.pow(1 + r0, i + 1), pv: cf / Math.pow(1 + r0, i + 1) })),
    [flows, r0],
  )
  const pv0 = pvAt(flows, r0, 0)
  const nominal = flows.reduce((a, b) => a + b, 0)

  // Current-rate path: the rate moves from r0 to r1 at the end of year 1. Locked-in path keeps r0 throughout.
  const path = useMemo(() => {
    const out = []
    for (let t = 1; t <= N; t++) {
      const curOpen = t === 1 ? pvAt(flows, r0, 0) : pvAt(flows, r1, t - 1)
      const curClose = pvAt(flows, r1, t)
      const lockOpen = pvAt(flows, r0, t - 1)
      const lockClose = pvAt(flows, r0, t)
      const total = curClose - curOpen + flows[t - 1]
      const pl = lockClose - lockOpen + flows[t - 1]
      out.push({ t, curOpen, curClose, lockOpen, lockClose, total, pl, oci: total - pl, aoci: curClose - lockClose, paid: flows[t - 1] })
    }
    return out
  }, [flows, r0, r1, N])

  const setFlow = (i: number, v: number) => setFlows((f) => f.map((x, j) => (j === i ? Math.max(0, v) : x)))
  const setCount = (n: number) => setFlows((f) => Array.from({ length: n }, (_, i) => f[i] ?? f[f.length - 1] ?? 100))

  return (
    <>
      <div className="crumbs"><Link to="/lab">Labs</Link><span>/</span><span>Discounting and interest</span></div>
      <div className="eyebrow">Lab · Time value of money</div>
      <h1 style={{ marginTop: 8 }}>Discounting, interest and rate changes</h1>
      <p className="hero-lede">
        A liability to pay claims over several years is measured at its present value (<Link to="/concept/discounting">IFRS 17.36</Link>).
        As time passes the discount unwinds as interest, and when market rates move the liability is remeasured.
      </p>

      <div className="lab-layout">
        <form className="panel inputs" onSubmit={(e) => e.preventDefault()} aria-label="Inputs">
          <Range id="r0" label="Rate at initial recognition" value={r0} min={0} max={0.1} step={0.0025} onChange={setR0} format={pct} />
          <Range id="r1" label="Current rate from the end of year 1" value={r1} min={0} max={0.1} step={0.0025} onChange={setR1} format={pct} />
          <div className="field">
            <label htmlFor="n">Years of payments</label>
            <select id="n" value={N} onChange={(e) => setCount(Number(e.target.value))}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div className="fieldset-title">Claims paid at the end of each year</div>
          <table className="year-table">
            <thead><tr><th scope="col">Year</th><th scope="col">Payment</th></tr></thead>
            <tbody>
              {flows.map((f, i) => (
                <tr key={i}><td>{i + 1}</td><td><input type="number" step={10} min={0} aria-label={`Payment year ${i + 1}`} value={f} onChange={(e) => setFlow(i, Number(e.target.value))} /></td></tr>
              ))}
            </tbody>
          </table>
          <div className="field">
            <span className="label">Insurance finance income or expenses</span>
            <div className="seg" role="group" aria-label="Accounting policy">
              <button type="button" aria-pressed={!oci} onClick={() => setOci(false)}>All in P&L</button>
              <button type="button" aria-pressed={oci} onClick={() => setOci(true)}>OCI option</button>
            </div>
            <span className="hint">IFRS 17.88 lets an insurer split finance expenses between profit or loss and other comprehensive income.</span>
          </div>
        </form>

        <div style={{ minWidth: 0, display: 'grid', gap: 20 }}>
          <div className="panel kpis">
            <div className="kpi"><div className="label">Payments, undiscounted</div><div className="value">{money(nominal)}</div></div>
            <div className="kpi"><div className="label">Present value at {pct(r0)}</div><div className="value">{money(pv0)}</div></div>
            <div className="kpi"><div className="label">Effect of discounting</div><div className="value">{money(pv0 - nominal)}</div></div>
            <div className="kpi"><div className="label">Remeasurement at end of year 1</div><div className="value">{money(path[0] ? path[0].curClose - path[0].lockClose : 0)}</div></div>
          </div>

          <div className="panel chart-box">
            <h4>Each payment, and what it is worth today</h4>
            <div className="sub">The further away a payment, the smaller its present value. The gap is the interest that will unwind over time.</div>
            <StackedBars title="Present value and discount by year" labels={rows.map((x) => `Y${x.t}`)} series={[
              { name: 'Present value', color: 'var(--chart-1)', values: rows.map((x) => x.pv) },
              { name: 'Discount (future interest)', color: 'var(--chart-2)', values: rows.map((x) => x.cf - x.pv) },
            ]} />
            <Legend series={[{ name: 'Present value', color: 'var(--chart-1)' }, { name: 'Discount (future interest)', color: 'var(--chart-2)' }]} />
          </div>

          <div className="table-wrap">
            <table className="data">
              <caption>
                <h4>Discount factors at {pct(r0)}</h4>
                <div className="refline"><span className="chip">IFRS 17.36</span><span className="chip">B72</span> Discount factor = 1 ÷ (1 + rate) to the power of years
                  <CopyCsv rows={() => [['Year', 'Payment', 'Discount factor', 'Present value'], ...rows.map((x) => [x.t, x.cf, Math.round(x.df * 10000) / 10000, x.pv])]} />
                </div>
              </caption>
              <thead><tr><th scope="col">Year</th><th scope="col">Payment</th><th scope="col">Discount factor</th><th scope="col">Present value</th></tr></thead>
              <tbody>
                {rows.map((x) => (
                  <tr key={x.t}><td>{x.t}</td><td>{money(x.cf)}</td><td className="mono">{x.df.toFixed(4)}</td><td>{money(x.pv)}</td></tr>
                ))}
                <tr className="subtotal"><td>Total</td><td>{money(nominal)}</td><td /><td>{money(pv0)}</td></tr>
              </tbody>
            </table>
          </div>

          <div className="table-wrap">
            <table className="data">
              <caption>
                <h4>How the liability rolls forward</h4>
                <div className="refline">
                  <span className="chip">IFRS 17.87</span><span className="chip">{oci ? '88(b), B131' : '88(a)'}</span>
                  {oci ? 'Profit or loss shows interest at the rate locked in on day one; the effect of rate changes goes to OCI.' : 'All finance income or expenses, including rate changes, go to profit or loss.'}
                  <CopyCsv rows={() => [
                    ['Year', 'Opening liability', 'Finance expense in P&L', 'Finance expense in OCI', 'Payment', 'Closing liability', 'Accumulated OCI'],
                    ...path.map((x) => [x.t, x.curOpen, oci ? x.pl : x.total, oci ? x.oci : 0, -x.paid, x.curClose, oci ? x.aoci : 0]),
                  ]} />
                </div>
              </caption>
              <thead><tr><th scope="col">Movement</th>{path.map((x) => <th scope="col" key={x.t}>Y{x.t}</th>)}<th scope="col">Total</th></tr></thead>
              <tbody>
                <tr className="balance"><td>Opening liability</td>{path.map((x) => <td key={x.t}>{money(x.curOpen)}</td>)}<td /></tr>
                <tr><td><Link to="/concept/insurance-finance">Finance expense in profit or loss</Link></td>{path.map((x) => <td key={x.t}>{money(oci ? x.pl : x.total)}</td>)}<td>{money(path.reduce((a, x) => a + (oci ? x.pl : x.total), 0))}</td></tr>
                {oci && <tr><td>Finance expense in OCI</td>{path.map((x) => <td key={x.t} className={x.oci < -0.5 ? 'neg' : ''}>{money(x.oci)}</td>)}<td>{money(path.reduce((a, x) => a + x.oci, 0))}</td></tr>}
                <tr><td>Claims paid</td>{path.map((x) => <td key={x.t} className="neg">{money(-x.paid)}</td>)}<td className="neg">{money(-nominal)}</td></tr>
                <tr className="balance"><td>Closing liability</td>{path.map((x) => <td key={x.t}>{money(x.curClose)}</td>)}<td /></tr>
                {oci && <tr><td>Accumulated OCI, debit / (credit)</td>{path.map((x) => <td key={x.t} className={x.aoci < -0.5 ? 'neg' : ''}>{money(x.aoci)}</td>)}<td /></tr>}
              </tbody>
            </table>
          </div>

          <div className="panel story">
            <h4>What to notice</h4>
            <ul>
              <li>Total finance expense over the life equals the undiscounted payments less the day-one present value ({money(nominal - pv0)}). Rate changes move it between years, not in total.</li>
              {r1 > r0 + 1e-9 && <li>Rates rose from {pct(r0)} to {pct(r1)}, so the liability falls at the end of year 1 by {money(path[0].lockClose - path[0].curClose)}. That is finance income, not an insurance service result.</li>}
              {r1 < r0 - 1e-9 && <li>Rates fell from {pct(r0)} to {pct(r1)}, so the liability rises at the end of year 1 by {money(path[0].curClose - path[0].lockClose)}: a finance expense, not an insurance service result.</li>}
              {oci && <li>With the OCI option, the accumulated OCI unwinds back to zero by the time the last claim is paid. The option reduces volatility in profit or loss, and is often chosen to match assets measured at fair value through OCI under IFRS 9.</li>}
              <li>Under the GMM, the CSM is accreted at the locked-in rate and changes in estimates that adjust it are measured at that rate too (IFRS 17.B72(b)–(c)), so a change in market rates never adjusts the CSM for contracts without direct participation features.</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}

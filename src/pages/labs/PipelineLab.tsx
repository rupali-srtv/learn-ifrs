import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { runGmm } from '../../engine/gmm'
import { PRESETS } from '../../engine/presets'
import {
  ERROR_LABEL, GL, controlTotals, groupOf, movementRecords, periodOf, postings, reconcile, sourceRows, validate,
  type ErrorKind, type FlowType, type Posting,
} from '../../engine/pipeline'
import { CopyCsv } from '../../components/CopyCsv'
import { Icon } from '../../components/Icon'
import { CONCEPT_BY_ID } from '../../content'
import { money, pct } from '../../format'

const STAGES = [
  { code: '01', label: 'Load' },
  { code: '02', label: 'Validate' },
  { code: '03', label: 'Calculate' },
  { code: '04', label: 'Post' },
  { code: '05', label: 'Reconcile' },
  { code: '06', label: 'Drill back' },
]

const amt = (v: number) => (Math.abs(v) < 0.005 ? '–' : v < 0 ? `(${Math.abs(v).toFixed(2)})` : v.toFixed(2))

export function PipelineLab() {
  const [presetId, setPresetId] = useState('deterioration')
  const r = useMemo(() => runGmm(PRESETS.find((p) => p.id === presetId)!.inputs), [presetId])
  const [yearIdx, setYearIdx] = useState(0)
  const yi = Math.min(yearIdx, r.years.length - 1)
  const y = r.years[yi]
  const [errors, setErrors] = useState<ErrorKind[]>([])
  const [forced, setForced] = useState(false)
  const [stage, setStage] = useState(0)
  const [sel, setSel] = useState<number | null>(null)

  const group = groupOf(r)
  const control = controlTotals(r, yi)
  const rows = useMemo(() => sourceRows(r, yi, errors), [r, yi, errors])
  const rules = useMemo(() => validate(rows, group, control), [rows, group, control])
  const failingRows = new Set(rules.flatMap((x) => x.failing))
  const failed = rules.filter((x) => x.failing.length > 0)
  const blocked = failed.some((x) => x.blocking) && !forced
  const moves = useMemo(() => movementRecords(r, yi), [r, yi])
  const posts = useMemo(() => postings(r, yi), [r, yi])
  const ties = useMemo(() => reconcile(r, yi, rows), [r, yi, rows])

  const toggleError = (e: ErrorKind) => {
    setErrors((cur) => (cur.includes(e) ? cur.filter((x) => x !== e) : [...cur, e]))
    setForced(false)
  }
  const status = (i: number): 'ok' | 'fail' | 'wait' => {
    if (i === 0) return 'ok'
    if (i === 1) return failed.length ? 'fail' : 'ok'
    if (blocked) return 'wait'
    if (i === 4) return ties.every((t) => t.ok) ? 'ok' : 'fail'
    return 'ok'
  }
  const go = (i: number) => {
    if (i >= 2 && blocked) return
    setStage(i)
  }
  const drill = (i: number) => {
    setSel(i)
    setStage(5)
  }

  return (
    <>
      <div className="crumbs"><Link to="/lab">Labs</Link><span>/</span><span>Implementation pipeline</span></div>
      <div className="eyebrow">Lab · From source data to the ledger</div>
      <h1 style={{ marginTop: 8 }}>The IFRS 17 implementation pipeline</h1>
      <p className="hero-lede">
        Follow one period through the chain a <Link to="/concept/tagetik-overview">CCH Tagetik IFRS 17 solution</Link> builds. Break the data on purpose and see which control catches it.
      </p>
      <div className="callout" style={{ marginTop: 16, maxWidth: '80ch' }}>
        Codes, rules and account numbers here are illustrative design patterns, not product object names. Validate naming and configuration against your Tagetik release and your firm’s design.
      </div>

      <div className="row" style={{ marginTop: 20, alignItems: 'end' }}>
        <div className="field" style={{ minWidth: 240 }}>
          <label htmlFor="pl-preset">Group of contracts</label>
          <select id="pl-preset" value={presetId} onChange={(e) => { setPresetId(e.target.value); setYearIdx(0); setSel(null) }}>
            {PRESETS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="year-pick" role="group" aria-label="Reporting period">
          {r.years.map((x, i) => (
            <button key={x.year} aria-pressed={i === yi} onClick={() => { setYearIdx(i); setSel(null) }}>Period {periodOf(x.year)}</button>
          ))}
        </div>
      </div>

      <nav className="pipeline" aria-label="Pipeline stages">
        {STAGES.map((s, i) => {
          const st = status(i)
          return (
            <button key={s.code} aria-current={stage === i ? 'step' : undefined} onClick={() => go(i)} disabled={i >= 2 && blocked}>
              <small>{s.code}</small>
              <span>{s.label}</span>
              <span className={`st ${st}`}>
                {st === 'ok' && <><Icon name="check" size={12} />Passed</>}
                {st === 'fail' && <><Icon name="warn" size={12} />{i === 1 ? `${failed.length} rule${failed.length > 1 ? 's' : ''} failed` : 'Breaks'}</>}
                {st === 'wait' && 'Blocked'}
              </span>
            </button>
          )
        })}
      </nav>

      <div style={{ marginTop: 20, display: 'grid', gap: 20 }}>
        {stage === 0 && (
          <>
            <p className="muted" style={{ maxWidth: '80ch' }}>
              Source systems (policy administration, claims, finance) send actual cash flows by policy for the period through a data interface. Every row is tagged with
              the <Link to="/concept/level-of-aggregation">group key</Link> it belongs to: <span className="code">{group.key}</span>.
            </p>
            <div className="grid cols-2">
              <div className="panel" style={{ padding: 16 }}>
                <h4>Break the data</h4>
                <p className="lab-note" style={{ margin: '4px 0 10px' }}>Turn on one or more errors, then open Validate.</p>
                <div style={{ display: 'grid', gap: 8 }}>
                  {(Object.keys(ERROR_LABEL) as ErrorKind[]).map((e) => (
                    <label key={e} className="toggle"><input type="checkbox" checked={errors.includes(e)} onChange={() => toggleError(e)} />{ERROR_LABEL[e]}</label>
                  ))}
                </div>
              </div>
              <div className="table-wrap">
                <table className="data">
                  <caption><h4>Control totals from source systems</h4><div className="refline">What the feeding systems say was paid or received in {periodOf(y.year)}</div></caption>
                  <thead><tr><th scope="col">Flow type</th><th scope="col">Control total</th><th scope="col">Loaded</th></tr></thead>
                  <tbody>
                    {(Object.keys(control) as FlowType[]).map((ft) => {
                      const loaded = rows.filter((x) => x.flowType === ft).reduce((a, x) => a + x.amount, 0)
                      return (
                        <tr key={ft} className={Math.abs(loaded - control[ft]) > 0.005 ? 'err' : ''}>
                          <td className="code">{ft}</td><td>{amt(control[ft])}</td><td>{amt(loaded)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="table-wrap">
              <table className="data">
                <caption>
                  <h4>Interface: actual cash flows</h4>
                  <div className="refline">{rows.length} rows · highlighted rows fail a validation rule
                    <CopyCsv rows={() => [['Row', 'Policy', 'Entity', 'Portfolio', 'Cohort', 'Profitability', 'Period', 'Flow type', 'Currency', 'Amount'],
                      ...rows.map((x) => [x.rowId, x.policy, x.entity, x.portfolio, x.cohort, x.profitability, x.period, x.flowType, x.currency, x.amount])]} />
                  </div>
                </caption>
                <thead><tr>{['Row', 'Policy', 'Entity', 'Portfolio', 'Cohort', 'Profitability', 'Period', 'Flow type', 'Ccy', 'Amount'].map((h) => <th scope="col" key={h}>{h}</th>)}</tr></thead>
                <tbody>
                  {rows.map((x, i) => (
                    <tr key={i} className={failingRows.has(x.rowId) ? 'err' : ''}>
                      <td className="code">{x.rowId}</td><td className="code">{x.policy}</td><td>{x.entity}</td><td>{x.portfolio || <em className="muted">blank</em>}</td>
                      <td>{x.cohort}</td><td>{x.profitability}</td><td>{x.period}</td><td className="code">{x.flowType}</td><td>{x.currency}</td><td>{amt(x.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="row"><button className="btn btn-primary" onClick={() => go(1)}>Run validation <Icon name="arrow" size={14} /></button></div>
          </>
        )}

        {stage === 1 && (
          <>
            <div className="panel">
              <ul className="check-list">
                {rules.map((v) => (
                  <li key={v.id} className={v.failing.length ? 'fail' : 'ok'}>
                    <Icon name={v.failing.length ? 'warn' : 'check'} />
                    <div>
                      <strong><span className="code">{v.id}</span> {v.rule}</strong>
                      <small>{v.why}</small>
                      {v.failing.length > 0 && <small style={{ color: 'var(--bad)' }}>Failing: {v.failing.join(', ')}</small>}
                    </div>
                    <span className="tag">{v.blocking ? 'Blocking' : 'Warning'}</span>
                  </li>
                ))}
              </ul>
            </div>
            {failed.length > 0 ? (
              <div className="panel verdict bad">
                <Icon name="warn" size={20} />
                <div>
                  <strong>Submission blocked.</strong> In a controlled close the workflow would not let this period move to calculation. The fix belongs at source: correct the
                  feeding system and reload, so the ledger and the source never disagree.
                  <div className="row" style={{ marginTop: 10 }}>
                    <button className="btn btn-ghost" onClick={() => { setErrors([]); setForced(false) }}>Fix at source and reload</button>
                    {!forced && <button className="btn btn-ghost" onClick={() => { setForced(true); setStage(4) }}>Run anyway and see what breaks</button>}
                  </div>
                </div>
              </div>
            ) : (
              <div className="row"><button className="btn btn-primary" onClick={() => go(2)}>All rules passed. Calculate <Icon name="arrow" size={14} /></button></div>
            )}
          </>
        )}

        {stage === 2 && (
          <>
            <p className="muted" style={{ maxWidth: '80ch' }}>
              The measurement engine combines actual cash flows with actuarial assumptions and stores the result as movement records: one row per movement type, by
              measurement component. Everything downstream, journals and disclosures alike, reads these records, so they are calculated once.
            </p>
            <div className="table-wrap">
              <table className="data">
                <caption><h4>Assumptions interface (actuarial)</h4><div className="refline">Loaded separately and signed off by the actuarial function</div></caption>
                <thead><tr><th scope="col">Assumption</th><th scope="col">Value</th></tr></thead>
                <tbody>
                  <tr><td>Discount rate (flat, locked-in)</td><td>{pct(r.inputs.discountRate)}</td></tr>
                  <tr><td>Risk adjustment, share of PV of claims</td><td>{pct(r.inputs.raPct)}</td></tr>
                  <tr><td>Expected claims, this period</td><td>{money(y.inCoverage ? r.inputs.claims[y.year - 1] : 0)}</td></tr>
                  <tr><td>Coverage units, this period / total</td><td>{y.inCoverage ? r.inputs.coverageUnits[y.year - 1] : 0} / {r.inputs.coverageUnits.reduce((a, b) => a + b, 0)}</td></tr>
                  {r.inputs.assumptionChange && <tr><td>Change in future claims, end of year {r.inputs.assumptionChange.year}</td><td>{pct(r.inputs.assumptionChange.futureClaimsPct)}</td></tr>}
                </tbody>
              </table>
            </div>
            <div className="table-wrap">
              <table className="data">
                <caption>
                  <h4>Movement records, {group.key}, {periodOf(y.year)}</h4>
                  <div className="refline"><span className="chip">IFRS 17.103</span> Same shape as the liability reconciliation disclosure
                    <CopyCsv rows={() => [['Code', 'Movement', 'LRC excl. loss component', 'Loss component', 'LIC'], ...moves.map((m) => [m.code, m.label, m.lrcExLc, m.lc, m.lic])]} />
                  </div>
                </caption>
                <thead><tr><th scope="col">Code</th><th scope="col">Movement</th><th scope="col">LRC excl. LC</th><th scope="col">Loss component</th><th scope="col">LIC</th></tr></thead>
                <tbody>
                  {moves.filter((m) => m.kind === 'balance' || Math.abs(m.lrcExLc) + Math.abs(m.lc) + Math.abs(m.lic) > 0.005).map((m) => (
                    <tr key={m.code} className={m.kind === 'balance' ? 'balance' : ''}>
                      <td className="code">{m.code}</td><td>{m.label}</td><td>{amt(m.lrcExLc)}</td><td>{amt(m.lc)}</td><td>{amt(m.lic)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="row"><button className="btn btn-primary" onClick={() => go(3)}>Generate journals <Icon name="arrow" size={14} /></button></div>
          </>
        )}

        {stage === 3 && (
          <>
            <p className="muted" style={{ maxWidth: '80ch' }}>
              A posting scheme maps each movement to debit and credit accounts. Select any line to trace it back to where it came from.
            </p>
            <div className="table-wrap">
              <table className="data">
                <caption>
                  <h4>Journal lines, {periodOf(y.year)}</h4>
                  <div className="refline">Select a line to drill back
                    <CopyCsv rows={() => [['Journal', 'Movement', 'GL', 'Account', 'Debit', 'Credit'], ...posts.map((p) => [p.journalId, p.movement, p.gl, GL[p.account].name, p.debit, p.credit])]} />
                  </div>
                </caption>
                <thead><tr><th scope="col">Journal</th><th scope="col">Movement</th><th scope="col">GL</th><th scope="col">Account</th><th scope="col">Debit</th><th scope="col">Credit</th></tr></thead>
                <tbody>
                  {posts.map((p, i) => (
                    <tr key={i} className={`clickable${sel === i ? ' sel' : ''}`} onClick={() => drill(i)} tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && drill(i)}>
                      <td>{p.description}</td><td className="code">{p.movement}</td><td className="code">{p.gl}</td><td>{GL[p.account].name}</td>
                      <td>{p.debit ? amt(p.debit) : ''}</td><td>{p.credit ? amt(p.credit) : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <TrialBalance posts={posts} />
            <div className="row"><button className="btn btn-primary" onClick={() => go(4)}>Reconcile <Icon name="arrow" size={14} /></button></div>
          </>
        )}

        {stage === 4 && (
          <>
            {forced && (
              <div className="panel verdict warn"><Icon name="warn" size={20} /><div>
                <strong>Running on data that failed validation.</strong>{' '}
                {ties.every((t) => t.ok)
                  ? 'Every tie-out still holds, yet the data is wrong: rows sit in the wrong group or carry an unusable code. Total-level reconciliations do not catch classification errors, which is why validation runs before calculation.'
                  : 'The measurement uses the signed-off actuarial view, but the interface cash no longer agrees with the ledger. This is the break an auditor would find.'}
              </div></div>
            )}
            <div className="panel">
              <ul className="check-list">
                {ties.map((t) => (
                  <li key={t.id} className={t.ok ? 'ok' : 'fail'}>
                    <Icon name={t.ok ? 'check' : 'warn'} />
                    <div>
                      <strong><span className="code">{t.id}</span> {t.check}</strong>
                      <small>{t.left.label}: {amt(t.left.value)} · {t.right.label}: {amt(t.right.value)}{!t.ok && ` · difference ${amt(t.left.value - t.right.value)}`}</small>
                    </div>
                    <span className={`tag${t.ok ? '' : ' warn'}`}>{t.ok ? 'Ties' : 'Break'}</span>
                  </li>
                ))}
              </ul>
            </div>
            {forced && <div className="row"><button className="btn btn-ghost" onClick={() => { setErrors([]); setForced(false); setStage(0) }}>Fix at source and start again</button></div>}
          </>
        )}

        {stage === 5 && <DrillBack posts={posts} sel={sel} setSel={setSel} rows={rows} moves={moves} />}
      </div>
    </>
  )
}

function TrialBalance({ posts }: { posts: Posting[] }) {
  const accts = Object.entries(GL).map(([a, g]) => {
    const ls = posts.filter((p) => p.account === a)
    return { ...g, dr: ls.reduce((s, p) => s + p.debit, 0), cr: ls.reduce((s, p) => s + p.credit, 0) }
  }).filter((a) => a.dr || a.cr)
  const dr = accts.reduce((s, a) => s + a.dr, 0)
  const cr = accts.reduce((s, a) => s + a.cr, 0)
  return (
    <div className="table-wrap">
      <table className="data">
        <caption><h4>Trial balance of the period’s postings</h4><div className="refline"><span className={`tie ${Math.abs(dr - cr) < 0.005 ? '' : 'fail'}`}><Icon name="check" size={13} />Debits equal credits</span></div></caption>
        <thead><tr><th scope="col">GL</th><th scope="col">Account</th><th scope="col">Debit</th><th scope="col">Credit</th></tr></thead>
        <tbody>
          {accts.map((a) => <tr key={a.code}><td className="code">{a.code}</td><td>{a.name}</td><td>{amt(a.dr)}</td><td>{amt(a.cr)}</td></tr>)}
          <tr className="subtotal"><td /><td>Total</td><td>{amt(dr)}</td><td>{amt(cr)}</td></tr>
        </tbody>
      </table>
    </div>
  )
}

function DrillBack({ posts, sel, setSel, rows, moves }: {
  posts: Posting[]; sel: number | null; setSel: (i: number) => void; rows: ReturnType<typeof sourceRows>; moves: ReturnType<typeof movementRecords>
}) {
  const p = sel !== null ? posts[sel] : null
  const m = p ? moves.find((x) => x.code === p.movement) : null
  const src = p ? rows.filter((x) => p.sources.includes(x.flowType)) : []
  const concept = p ? CONCEPT_BY_ID[p.conceptId] : null
  return (
    <>
      <div className="field" style={{ maxWidth: 520 }}>
        <label htmlFor="drill">Journal line</label>
        <select id="drill" value={sel ?? ''} onChange={(e) => setSel(Number(e.target.value))}>
          <option value="" disabled>Choose a line to trace</option>
          {posts.map((x, i) => <option key={i} value={i}>{x.gl} {x.debit ? 'Dr' : 'Cr'} {amt(x.debit || x.credit)} · {x.description}</option>)}
        </select>
      </div>
      {p && m ? (
        <div className="panel trail">
          <div><b>Ledger</b><span>GL <span className="code">{p.gl}</span> {GL[p.account].name}: {p.debit ? 'debit' : 'credit'} {amt(p.debit || p.credit)}</span></div>
          <div><b>Journal</b><span>{p.description} <span className="code">({p.journalId})</span>, generated by the posting rule for movement <span className="code">{p.movement}</span></span></div>
          <div><b>Movement</b><span><span className="code">{m.code}</span> {m.label}: LRC excl. LC {amt(m.lrcExLc)}, loss component {amt(m.lc)}, LIC {amt(m.lic)}</span></div>
          <div>
            <b>Source</b>
            {src.length ? (
              <span>{src.length} interface rows: {src.map((x) => `${x.rowId} ${x.policy} ${amt(x.amount)}`).join(' · ')}</span>
            ) : (
              <span>Calculated, not loaded: the engine derives this from the assumptions interface (expected cash flows, discount rate, risk adjustment, coverage units) and the prior period’s closing balances.</span>
            )}
          </div>
          {concept && <div><b>Standard</b><span><Link to={`/concept/${concept.id}`}>{concept.title}</Link>{concept.refs.length ? ` · ${concept.refs.slice(0, 3).join(', ')}` : ''}</span></div>}
        </div>
      ) : (
        <p className="muted">Pick a journal line above, or select one in the Post stage. The trail shows the ledger line, the journal, the movement record, the source rows and the requirement behind it.</p>
      )}
    </>
  )
}

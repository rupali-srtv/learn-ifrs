import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { runGmm, type Account, type GmmInputs, type GmmResult, type YearResult } from '../engine/gmm'
import { PRESETS } from '../engine/presets'
import {
  componentReconciliation, liabilityReconciliation, revenueAnalysis, ties, type DisclosureTable,
} from '../engine/disclosures'
import { BuildingBlocks, Legend, LineChart, StackedBars, Waterfall, type Step } from '../components/Charts'
import { CopyCsv } from '../components/CopyCsv'
import { NumField } from '../components/Fields'
import { MISSIONS, MISSION_BY_ID, type Mission } from '../engine/missions'
import { usePrefs } from '../prefs'
import { money, pct } from '../format'
import { Icon } from '../components/Icon'
import { CONCEPT_BY_ID } from '../content'

type Tab = 'overview' | 'bridge' | 'rollforward' | 'journals' | 'disclosures'
const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'bridge', label: 'CSM bridge' },
  { id: 'rollforward', label: 'Roll-forwards' },
  { id: 'journals', label: 'Journals' },
  { id: 'disclosures', label: 'Disclosures' },
]

const ACCOUNT_COLOR: Record<Account, string> = {
  Cash: 'var(--muted)',
  LRC: 'var(--chart-1)',
  LIC: 'var(--chart-4)',
  'Insurance revenue': 'var(--chart-3)',
  'Insurance service expense': 'var(--bad)',
  'Insurance finance expense': 'var(--chart-2)',
}

const yearLabel = (y: YearResult) => (y.inCoverage ? `Year ${y.year}` : `Year ${y.year} (run-off)`)
const shortLabel = (y: YearResult) => (y.inCoverage ? `Y${y.year}` : `Y${y.year}*`)

function resize(a: number[], n: number, fill: number): number[] {
  return Array.from({ length: n }, (_, i) => a[i] ?? a[a.length - 1] ?? fill)
}

export function Sandbox() {
  const loc = useLocation()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const mission: Mission | undefined = MISSION_BY_ID[params.get('mission') ?? '']
  // A worked example links here with ?preset=<id> to open its scenario.
  const startPreset = PRESETS.find((p) => p.id === (mission?.preset ?? params.get('preset'))) ?? PRESETS[0]
  const [presetId, setPresetId] = useState(startPreset.id)
  const [inp, setInp] = useState<GmmInputs>(startPreset.inputs)
  // Inputs reset to the mission's starting scenario whenever a different mission is opened.
  const [loadedFor, setLoadedFor] = useState(mission?.id ?? '')
  if ((mission?.id ?? '') !== loadedFor) {
    setLoadedFor(mission?.id ?? '')
    if (mission) {
      setPresetId(startPreset.id)
      setInp(startPreset.inputs)
    }
  }
  const [baseline, setBaseline] = useState<GmmResult | null>(null)
  const fromHash = loc.hash.replace('#', '') as Tab
  const [tab, setTab] = useState<Tab>(TABS.some((t) => t.id === fromHash) ? fromHash : 'overview')
  // Links into a tab (from a concept page or the home page) can arrive while the simulator is already open.
  useEffect(() => {
    if (TABS.some((t) => t.id === fromHash)) setTab(fromHash)
  }, [fromHash])
  const r = useMemo(() => runGmm(inp), [inp])
  const [yearIdx, setYearIdx] = useState(0)
  const { missionsDone, completeMission } = usePrefs()
  const met = !!mission && loadedFor === mission.id && mission.check(r, inp)
  useEffect(() => {
    if (mission && met) completeMission(mission.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mission?.id, met])

  useEffect(() => {
    if (yearIdx >= r.years.length) setYearIdx(0)
  }, [r.years.length, yearIdx])

  const choosePreset = (id: string) => {
    const p = PRESETS.find((x) => x.id === id)!
    setPresetId(id)
    setInp(p.inputs)
    setYearIdx(0)
  }
  const update = (patch: Partial<GmmInputs>) => {
    setPresetId('custom')
    setInp((cur) => ({ ...cur, ...patch }))
  }
  const setYears = (n: number) => {
    const years = Math.max(1, Math.min(10, Math.round(n) || 1))
    update({
      years,
      claims: resize(inp.claims, years, 0),
      expenses: resize(inp.expenses, years, 0),
      coverageUnits: resize(inp.coverageUnits, years, 1),
      actualClaimsFactor: resize(inp.actualClaimsFactor, years, 1),
      assumptionChange: inp.assumptionChange && inp.assumptionChange.year < years ? inp.assumptionChange : null,
    })
  }
  const setYearValue = (key: 'claims' | 'coverageUnits' | 'actualClaimsFactor', i: number, v: number) => {
    const next = [...inp[key]]
    next[i] = v
    update({ [key]: next } as Partial<GmmInputs>)
  }
  const selectTab = (t: Tab) => {
    setTab(t)
    navigate({ hash: t }, { replace: true })
  }

  const preset = PRESETS.find((p) => p.id === presetId)
  const onerous = r.initial.lossComponent > 0

  return (
    <>
      <div className="sandbox-head">
        <div>
          <div className="eyebrow">Sandbox · General Measurement Model</div>
          <h1 style={{ marginTop: 8 }}>IFRS 17 measurement simulator</h1>
          <p>
            One group of insurance contracts, measured year by year. Change any input and the CSM, liabilities, profit, journals
            and disclosures all recalculate together.
          </p>
        </div>
        <div className="field" style={{ minWidth: 260 }}>
          <label htmlFor="preset">Scenario</label>
          <select id="preset" value={presetId} onChange={(e) => choosePreset(e.target.value)}>
            {PRESETS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            {presetId === 'custom' && <option value="custom">Custom inputs</option>}
          </select>
        </div>
      </div>
      {preset && !mission && <p className="muted" style={{ marginTop: 10, maxWidth: '80ch' }}>{preset.summary}</p>}
      {mission && (
        <MissionBanner
          m={mission}
          met={met}
          doneBefore={missionsDone.includes(mission.id)}
          onExit={() => setParams({}, { replace: true })}
          onRestart={() => choosePreset(mission.preset)}
          next={MISSIONS.find((x) => !missionsDone.includes(x.id) && x.id !== mission.id)}
        />
      )}

      <div className="sandbox">
        <Inputs inp={inp} update={update} setYears={setYears} setYearValue={setYearValue} />

        <div style={{ minWidth: 0 }}>
          <div className="panel kpis">
            <Kpi label="PV of premiums" value={r.initial.pvInflows} base={baseline?.initial.pvInflows} concept="fulfilment-cash-flows" />
            <Kpi label="PV of outflows" value={r.initial.pvOutflows} base={baseline?.initial.pvOutflows} concept="fulfilment-cash-flows" />
            <Kpi label="Risk adjustment" value={r.initial.riskAdjustment} base={baseline?.initial.riskAdjustment} concept="risk-adjustment" />
            {onerous
              ? <Kpi label="Day-one loss" value={-r.initial.lossComponent} base={baseline && -baseline.initial.lossComponent} tone="bad" concept="onerous-contracts" />
              : <Kpi label="CSM on day one" value={r.initial.csm} base={baseline?.initial.csm} tone="good" concept="csm" />}
            <Kpi label="Lifetime profit" value={r.totals.profit} base={baseline?.totals.profit} tone={r.totals.profit >= 0 ? 'good' : 'bad'} concept="insurance-revenue" />
          </div>
          <div className="baseline-bar">
            {baseline ? (
              <>
                <span className="muted">Comparing with a pinned baseline: differences show under each figure.</span>
                <button type="button" className="copy-btn" onClick={() => setBaseline(r)}><Icon name="pin" size={13} />Pin current instead</button>
                <button type="button" className="copy-btn" onClick={() => setBaseline(null)}><Icon name="close" size={13} />Clear baseline</button>
              </>
            ) : (
              <>
                <span className="muted">Want to see what a change does? Pin these results, then change an input.</span>
                <button type="button" className="copy-btn" onClick={() => setBaseline(r)}><Icon name="pin" size={13} />Pin as baseline</button>
              </>
            )}
          </div>

          <div className="tabs" role="tablist" aria-label="Sandbox views">
            {TABS.map((t) => (
              <button key={t.id} role="tab" id={`tab-${t.id}`} aria-selected={tab === t.id} aria-controls={`panel-${t.id}`} onClick={() => selectTab(t.id)}>
                {t.label}
              </button>
            ))}
          </div>
          <div className="tab-body" role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
            {tab === 'overview' && <Overview r={r} />}
            {tab === 'bridge' && <Bridge r={r} />}
            {tab === 'rollforward' && <RollForward r={r} />}
            {tab === 'journals' && <Journals r={r} yearIdx={yearIdx} setYearIdx={setYearIdx} />}
            {tab === 'disclosures' && <Disclosures r={r} yearIdx={yearIdx} setYearIdx={setYearIdx} />}
          </div>
        </div>
      </div>
    </>
  )
}

function Kpi({ label, value, base, tone, concept }: { label: string; value: number; base?: number | null; tone?: 'good' | 'bad'; concept: string }) {
  const d = base == null ? null : value - base
  return (
    <div className={`kpi ${tone ?? ''}`}>
      <div className="label"><Link to={`/concept/${concept}`} style={{ color: 'inherit' }}>{label}</Link></div>
      <div className="value">{money(value)}</div>
      {d !== null && (
        <div className={`delta ${Math.abs(d) < 0.5 ? '' : d > 0 ? 'up' : 'down'}`}>
          {Math.abs(d) < 0.5 ? 'No change' : `${d > 0 ? '+' : '−'}${money(Math.abs(d))} vs baseline`}
        </div>
      )}
    </div>
  )
}

function MissionBanner({ m, met, doneBefore, onExit, onRestart, next }: {
  m: Mission; met: boolean; doneBefore: boolean; onExit: () => void; onRestart: () => void; next?: Mission
}) {
  const [hint, setHint] = useState(false)
  useEffect(() => setHint(false), [m.id])
  return (
    <section className={`panel mission${met ? ' met' : ''}`} aria-label="Mission">
      <div className="mission-head">
        <span className="tag brand"><Icon name="flag" size={12} /> Mission · {m.level}</span>
        {doneBefore && !met && <span className="tag">Completed before</span>}
        <div className="row" style={{ marginLeft: 'auto', gap: 8 }}>
          <button type="button" className="copy-btn" onClick={onRestart}>Restart</button>
          <button type="button" className="copy-btn" onClick={onExit}><Icon name="close" size={13} />Leave mission</button>
        </div>
      </div>
      <h3>{m.title}</h3>
      <p>{m.goal}</p>
      <div className="mission-status" role="status">
        {met ? (
          <><Icon name="check" /> <strong>Goal met.</strong></>
        ) : (
          <><span className="pulse" aria-hidden="true" /> Not yet: change the inputs on the left. Results update as you type.</>
        )}
      </div>
      {met ? (
        <div className="mission-lesson">
          <p>{m.lesson}</p>
          <div className="row" style={{ marginTop: 10 }}>
            <Link to={`/concept/${m.concept}`}>Read: {CONCEPT_BY_ID[m.concept]?.title}</Link>
            {next ? <Link className="btn btn-primary" to={`/sandbox?mission=${next.id}`}>Next mission: {next.title}</Link> : <Link className="btn btn-primary" to="/lab">All missions done. Back to Labs</Link>}
          </div>
        </div>
      ) : (
        <div style={{ marginTop: 8 }}>
          {hint ? <p className="muted"><strong>Hint.</strong> {m.hint}</p> : <button type="button" className="link-btn" onClick={() => setHint(true)}>Show a hint</button>}
        </div>
      )}
    </section>
  )
}

function Bridge({ r }: { r: GmmResult }) {
  const [view, setView] = useState<number>(-1)
  const sum = (f: (y: YearResult) => number) => r.years.reduce((a, y) => a + f(y), 0)
  const y = view >= 0 ? r.years[Math.min(view, r.years.length - 1)] : null
  const steps: Step[] = y
    ? [
        { label: 'Opening CSM', value: y.open.csm, total: true },
        ...(y.year === 1 ? [{ label: 'New business', value: r.initial.csm }] : []),
        { label: 'Interest accreted', value: y.csmAccretion },
        { label: 'Changes in estimates', value: y.csmAdjustedByChange },
        { label: 'Released for service', value: -y.csmRelease },
        { label: 'Closing CSM', value: y.close.csm, total: true },
      ]
    : [
        { label: 'New business', value: r.initial.csm },
        { label: 'Interest accreted', value: sum((x) => x.csmAccretion) },
        { label: 'Changes in estimates', value: sum((x) => x.csmAdjustedByChange) },
        ...r.years.filter((x) => x.inCoverage).map((x) => ({ label: `Y${x.year} release`, value: -x.csmRelease })),
        { label: 'End of cover', value: r.years[r.years.length - 1].close.csm, total: true },
      ]
  const lcSteps: Step[] = [
    { label: 'Day-one loss', value: r.initial.lossComponent },
    { label: 'Losses on changes', value: sum((x) => x.changeLoss) },
    { label: 'Allocated (reduces service expenses)', value: -sum((x) => x.lossComponentAllocation) },
    { label: 'Reversed', value: -sum((x) => x.lossReversal) },
    { label: 'End of cover', value: r.years[r.years.length - 1].close.lossComponent, total: true },
  ]
  const hasLc = r.years.some((x) => x.open.lossComponent > 0.5 || x.close.lossComponent > 0.5) || r.initial.lossComponent > 0.5
  const totalReleased = sum((x) => x.csmRelease)
  return (
    <>
      <div className="year-pick" role="group" aria-label="Bridge period">
        <button aria-pressed={view === -1} onClick={() => setView(-1)}>Whole life</button>
        {r.years.filter((x) => x.inCoverage).map((x, i) => (
          <button key={x.year} aria-pressed={view === i} onClick={() => setView(i)}>Year {x.year}</button>
        ))}
      </div>
      <p className="muted" style={{ maxWidth: '75ch' }}>
        {y
          ? `How the CSM moved in year ${y.year}, in the order IFRS 17.44 requires: interest first, then changes for future service, then the release for the year.`
          : `Every unit of profit the CSM holds on day one, plus interest and changes in estimates, is released to profit over the coverage period. ${totalReleased > 0.5 ? `Total released: ${money(totalReleased)}.` : 'Here nothing is released because there is no CSM.'}`}
      </p>
      <div className="panel chart-box">
        <h4>{y ? `CSM bridge, year ${y.year}` : 'CSM bridge, whole life of the group'}</h4>
        <div className="sub">Green adds to the CSM, red reduces it, blue bars are balances</div>
        <Waterfall title="CSM bridge" steps={steps} />
      </div>
      {hasLc && (
        <div className="panel chart-box" style={{ marginTop: 16 }}>
          <h4><Link to="/concept/loss-component">Loss component</Link>, whole life of the group</h4>
          <div className="sub">The loss component is tracked memo-style inside the LRC and unwinds through insurance service expenses (IFRS 17.49–52)</div>
          <Waterfall title="Loss component bridge" steps={lcSteps} />
        </div>
      )}
    </>
  )
}

function Inputs({ inp, update, setYears, setYearValue }: {
  inp: GmmInputs
  update: (p: Partial<GmmInputs>) => void
  setYears: (n: number) => void
  setYearValue: (key: 'claims' | 'coverageUnits' | 'actualClaimsFactor', i: number, v: number) => void
}) {
  const level = inp.expenses[0] ?? 0
  return (
    <form className="panel inputs" onSubmit={(e) => e.preventDefault()} aria-label="Inputs">
      <div className="field-pair">
        <NumField id="years" label="Coverage years" value={inp.years} min={1} max={10} onChange={setYears} />
        <div className="field">
          <span className="label">Premium</span>
          <div className="seg" role="group" aria-label="Premium pattern">
            <button type="button" aria-pressed={inp.premiumMode === 'annual'} onClick={() => update({ premiumMode: 'annual' })}>Annual</button>
            <button type="button" aria-pressed={inp.premiumMode === 'single'} onClick={() => update({ premiumMode: 'single' })}>Single</button>
          </div>
        </div>
      </div>
      <div className="field-pair">
        <NumField id="premium" label={inp.premiumMode === 'annual' ? 'Premium per year' : 'Single premium'} value={inp.premium} step={50} onChange={(v) => update({ premium: v })} />
        <NumField id="acq" label="Acquisition costs" value={inp.acquisition} step={10} onChange={(v) => update({ acquisition: v })} />
      </div>
      <div className="field-pair">
        <NumField id="exp" label="Expenses per year" value={level} step={10} onChange={(v) => update({ expenses: inp.expenses.map(() => v) })} />
        <NumField id="rate" label="Discount rate" suffix="%" value={+(inp.discountRate * 100).toFixed(2)} step={0.25} onChange={(v) => update({ discountRate: v / 100 })} />
      </div>
      <div className="field-pair">
        <NumField id="ra" label="Risk adjustment" suffix="% of PV claims" value={+(inp.raPct * 100).toFixed(2)} step={1} min={0} onChange={(v) => update({ raPct: Math.max(0, v) / 100 })} />
        <NumField id="lag" label="Claims paid next year" suffix="%" value={+(inp.settlementLag * 100).toFixed(0)} step={10} min={0} max={100} onChange={(v) => update({ settlementLag: Math.min(1, Math.max(0, v / 100)) })} />
      </div>

      <div className="fieldset-title">By year</div>
      <div style={{ overflowX: 'auto' }}>
        <table className="year-table">
          <thead>
            <tr><th scope="col">Year</th><th scope="col">Expected claims</th><th scope="col">Actual ÷ expected</th><th scope="col">Coverage units</th></tr>
          </thead>
          <tbody>
            {Array.from({ length: inp.years }, (_, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td><input id={`claims-${i}`} aria-label={`Expected claims year ${i + 1}`} type="number" step={10} value={inp.claims[i]} onChange={(e) => setYearValue('claims', i, Number(e.target.value))} /></td>
                <td><input id={`factor-${i}`} aria-label={`Actual over expected claims year ${i + 1}`} type="number" step={0.05} value={inp.actualClaimsFactor[i]} onChange={(e) => setYearValue('actualClaimsFactor', i, Number(e.target.value))} /></td>
                <td><input id={`cu-${i}`} aria-label={`Coverage units year ${i + 1}`} type="number" step={1} min={0} value={inp.coverageUnits[i]} onChange={(e) => setYearValue('coverageUnits', i, Math.max(0, Number(e.target.value)))} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="fieldset-title">Change in the claims outlook</div>
      <div className="field-pair">
        <div className="field">
          <label htmlFor="chg-year">At the end of</label>
          <select id="chg-year" value={inp.assumptionChange?.year ?? 0}
            onChange={(e) => {
              const y = Number(e.target.value)
              update({ assumptionChange: y ? { year: y, futureClaimsPct: inp.assumptionChange?.futureClaimsPct ?? 0.2 } : null })
            }}>
            <option value={0}>No change</option>
            {Array.from({ length: Math.max(0, inp.years - 1) }, (_, i) => <option key={i} value={i + 1}>Year {i + 1}</option>)}
          </select>
        </div>
        <NumField id="chg-pct" label="Future claims" suffix="% change" value={+((inp.assumptionChange?.futureClaimsPct ?? 0) * 100).toFixed(1)} step={5}
          onChange={(v) => inp.assumptionChange && update({ assumptionChange: { ...inp.assumptionChange, futureClaimsPct: v / 100 } })} />
      </div>
      <p className="hint muted" style={{ fontSize: 12 }}>
        Model: one group recognised at the start of year 1; premiums, expenses and acquisition costs at the start of each year; claims at year end.
        One flat rate is used as current and locked-in rate. <Link to="/about">Simplifications</Link>
      </p>
    </form>
  )
}

function story(r: GmmResult): string[] {
  const out: string[] = []
  const i = r.initial
  if (i.lossComponent > 0) {
    out.push(`Day one: expected outflows plus the risk adjustment exceed the present value of premiums by ${money(i.lossComponent)}. The group is onerous, so that loss is recognised immediately and tracked in a loss component.`)
  } else {
    out.push(`Day one: premiums are worth ${money(i.pvInflows)} today against outflows of ${money(i.pvOutflows)} and a risk adjustment of ${money(i.riskAdjustment)}. The difference, ${money(i.csm)}, becomes the CSM, so no profit is recognised on day one.`)
  }
  for (const y of r.years) {
    if (y.changeInPv !== 0) {
      const d = y.changeInPv + y.changeInRa
      if (d > 0) {
        out.push(`End of year ${y.year}: the claims outlook worsens, adding ${money(d)} to fulfilment cash flows. The CSM absorbs ${money(-y.csmAdjustedByChange)}${y.changeLoss > 0.5 ? ` and the remaining ${money(y.changeLoss)} is a loss in profit or loss straight away` : ', so profit or loss is not hit immediately'}.`)
      } else {
        out.push(`End of year ${y.year}: the claims outlook improves by ${money(-d)}.${y.lossReversal > 0.5 ? ` ${money(y.lossReversal)} reverses earlier losses first.` : ''}${y.csmAdjustedByChange > 0.5 ? ` ${money(y.csmAdjustedByChange)} is added to the CSM and earned over the remaining cover.` : ''}`)
      }
    }
    const variance = y.incurredClaimsPv - y.expectedClaimsReleased
    if (y.inCoverage && Math.abs(variance) > 0.5) {
      out.push(`Year ${y.year}: actual claims were ${variance > 0 ? 'higher' : 'lower'} than expected by ${money(Math.abs(variance))} (present value). That experience adjustment goes straight to the insurance service result; the CSM is not adjusted because it relates to current service.`)
    }
  }
  const assetYear = r.years.find((y) => y.close.lrc < -0.5)
  if (assetYear) {
    out.push(`At the end of year ${assetYear.year} the LRC is below zero. Premiums still to be received are worth more than the cover still to be provided, so the remaining coverage is an asset for now. If the net position, including any LIC, is an asset, it is presented separately from portfolios in a liability position (IFRS 17.78).`)
  }
  out.push(`Over the life of the group, total profit of ${money(r.totals.profit)} equals premiums less all cash paid out (${money(r.totals.netCash)}). IFRS 17 changes when profit appears, not how much there is.`)
  return out
}

function Overview({ r }: { r: GmmResult }) {
  const labels = ['Start', ...r.years.map(shortLabel)]
  return (
    <>
      <div className="stack">
        <div className="panel chart-box">
          <h4>Day one: <Link to="/concept/gmm">the building blocks</Link></h4>
          <div className="sub">Measurement at initial recognition</div>
          <BuildingBlocks inflows={r.initial.pvInflows} outflows={r.initial.pvOutflows} ra={r.initial.riskAdjustment} csm={r.initial.csm} loss={r.initial.lossComponent} />
        </div>
        <div className="panel chart-box">
          <h4>Balances at each year end</h4>
          <div className="sub">Liability for remaining coverage, incurred claims, CSM and loss component</div>
          <LineChart
            title="Balances at each year end"
            labels={labels}
            series={[
              { name: 'LRC', color: 'var(--chart-1)', values: [r.initial.fulfilmentCashFlows + r.initial.riskAdjustment + r.initial.csm, ...r.years.map((y) => y.close.lrc)] },
              { name: 'CSM', color: 'var(--chart-3)', values: [r.initial.csm, ...r.years.map((y) => y.close.csm)] },
              { name: 'LIC', color: 'var(--chart-4)', values: [0, ...r.years.map((y) => y.close.lic)] },
              { name: 'Loss component', color: 'var(--bad)', values: [r.initial.lossComponent, ...r.years.map((y) => y.close.lossComponent)] },
            ]}
          />
          <Legend series={[{ name: 'LRC', color: 'var(--chart-1)' }, { name: 'CSM', color: 'var(--chart-3)' }, { name: 'LIC', color: 'var(--chart-4)' }, { name: 'Loss component', color: 'var(--bad)' }]} />
        </div>
      </div>

      <div className="panel story">
        <h4>What happened</h4>
        <ul>{story(r).map((s, i) => <li key={i}>{s}</li>)}</ul>
      </div>

      <div className="table-wrap">
        <table className="data">
          <caption><h4>Statement of profit or loss</h4><div className="refline"><span className="chip">IFRS 17.80</span> Insurance service result is shown separately from insurance finance expenses
            <CopyCsv rows={() => [
              ['Line', ...r.years.map(shortLabel), 'Total'],
              ...([
                ['Insurance revenue', r.years.map((y) => y.insuranceRevenue)],
                ['Insurance service expenses', r.years.map((y) => -y.insuranceServiceExpense)],
                ['Insurance service result', r.years.map((y) => y.insuranceServiceResult)],
                ['Insurance finance expenses', r.years.map((y) => -y.insuranceFinanceExpense)],
                ['Insurance result', r.years.map((y) => y.profit)],
              ] as [string, number[]][]).map(([l, v]) => [l, ...v, v.reduce((a, b) => a + b, 0)]),
            ]} />
          </div></caption>
          <thead>
            <tr><th scope="col">Line</th>{r.years.map((y) => <th scope="col" key={y.year}>{shortLabel(y)}</th>)}<th scope="col">Total</th></tr>
          </thead>
          <tbody>
            <PlRow label="Insurance revenue" concept="insurance-revenue" values={r.years.map((y) => y.insuranceRevenue)} />
            <PlRow label="Insurance service expenses" concept="onerous-contracts" values={r.years.map((y) => -y.insuranceServiceExpense)} />
            <PlRow label="Insurance service result" values={r.years.map((y) => y.insuranceServiceResult)} subtotal />
            <PlRow label="Insurance finance expenses" concept="insurance-finance" values={r.years.map((y) => -y.insuranceFinanceExpense)} />
            <PlRow label="Insurance result" values={r.years.map((y) => y.profit)} subtotal />
          </tbody>
        </table>
      </div>
      <p className="muted" style={{ fontSize: 12 }}>
        Investment income on the assets backing these liabilities is outside this example, so insurance finance expenses are not offset here.
        {r.years.some((y) => !y.inCoverage) && ' * Run-off year: claims incurred in the final year are still being paid.'}
      </p>

      <div className="panel chart-box">
        <h4>What makes up <Link to="/concept/insurance-revenue">insurance revenue</Link></h4>
        <div className="sub">Revenue is built from the services provided, not from premiums received (IFRS 17.B124)</div>
        <StackedBars
          title="Composition of insurance revenue by year"
          labels={r.years.map(shortLabel)}
          series={[
            { name: 'Expected claims', color: 'var(--chart-4)', values: r.years.map((y) => y.revenueAnalysis.expectedClaims) },
            { name: 'Expected expenses', color: 'var(--muted)', values: r.years.map((y) => y.revenueAnalysis.expectedExpenses) },
            { name: 'Risk adjustment release', color: 'var(--chart-2)', values: r.years.map((y) => y.revenueAnalysis.riskAdjustmentRelease) },
            { name: 'CSM release', color: 'var(--chart-3)', values: r.years.map((y) => y.revenueAnalysis.csmRelease) },
            { name: 'Acquisition cost recovery', color: 'var(--chart-1)', values: r.years.map((y) => y.revenueAnalysis.acquisitionRecovery) },
            { name: 'Allocated to loss component', color: 'var(--bad)', values: r.years.map((y) => y.revenueAnalysis.lessLossComponent) },
          ]}
        />
        <Legend series={[
          { name: 'Expected claims', color: 'var(--chart-4)' }, { name: 'Expected expenses', color: 'var(--muted)' },
          { name: 'Risk adjustment release', color: 'var(--chart-2)' }, { name: 'CSM release', color: 'var(--chart-3)' },
          { name: 'Acquisition cost recovery', color: 'var(--chart-1)' }, { name: 'Allocated to loss component', color: 'var(--bad)' },
        ]} />
      </div>
    </>
  )
}

function PlRow({ label, values, concept, subtotal }: { label: string; values: number[]; concept?: string; subtotal?: boolean }) {
  const total = values.reduce((a, b) => a + b, 0)
  return (
    <tr className={subtotal ? 'subtotal' : ''}>
      <td>{concept ? <Link to={`/concept/${concept}`}>{label}</Link> : label}</td>
      {values.map((v, i) => <td key={i} className={v < -0.5 ? 'neg' : ''}>{money(v)}</td>)}
      <td className={total < -0.5 ? 'neg' : ''}>{money(total)}</td>
    </tr>
  )
}

function YearTable({ title, refs, concept, r, rows }: {
  title: string; refs: string; concept: string; r: GmmResult; rows: { label: string; get: (y: YearResult) => number; kind?: 'balance' }[]
}) {
  return (
    <div className="table-wrap">
      <table className="data">
        <caption>
          <h4><Link to={`/concept/${concept}`}>{title}</Link></h4>
          <div className="refline"><span className="chip">{refs}</span>
            <CopyCsv rows={() => [['Movement', ...r.years.map(shortLabel)], ...rows.map((row) => [row.label, ...r.years.map(row.get)])]} />
          </div>
        </caption>
        <thead><tr><th scope="col">Movement</th>{r.years.map((y) => <th scope="col" key={y.year}>{shortLabel(y)}</th>)}</tr></thead>
        <tbody>
          {rows.filter((row) => row.kind === 'balance' || r.years.some((y) => Math.abs(row.get(y)) >= 0.5)).map((row) => (
            <tr key={row.label} className={row.kind ?? ''}>
              <td>{row.label}</td>
              {r.years.map((y) => { const v = row.get(y); return <td key={y.year} className={v < -0.5 ? 'neg' : ''}>{money(v)}</td> })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function RollForward({ r }: { r: GmmResult }) {
  return (
    <>
      <p className="muted" style={{ maxWidth: '75ch' }}>
        The CSM follows a fixed order each year (IFRS 17.44): interest is accreted, changes in estimates for future service are absorbed,
        and only then is the release for the year calculated using <Link to="/concept/coverage-units">coverage units</Link>.
      </p>
      <YearTable title="Contractual service margin" refs="IFRS 17.44" concept="csm" r={r} rows={[
        { label: 'Opening CSM', get: (y) => y.open.csm, kind: 'balance' },
        { label: 'New contracts recognised', get: (y) => (y.year === 1 ? r.initial.csm : 0) },
        { label: 'Interest accreted (locked-in rate)', get: (y) => y.csmAccretion },
        { label: 'Changes in estimates (future service)', get: (y) => y.csmAdjustedByChange },
        { label: 'Released for services provided', get: (y) => -y.csmRelease },
        { label: 'Closing CSM', get: (y) => y.close.csm, kind: 'balance' },
      ]} />
      <YearTable title="Loss component" refs="IFRS 17.47–52" concept="loss-component" r={r} rows={[
        { label: 'Opening loss component', get: (y) => y.open.lossComponent, kind: 'balance' },
        { label: 'Loss on initial recognition', get: (y) => y.initialLoss },
        { label: 'Losses from changes in estimates', get: (y) => y.changeLoss },
        { label: 'Systematic allocation of release', get: (y) => -y.lossComponentAllocation },
        { label: 'Reversals from favourable changes', get: (y) => -y.lossReversal },
        { label: 'Closing loss component', get: (y) => y.close.lossComponent, kind: 'balance' },
      ]} />
      <YearTable title="Risk adjustment (LRC and LIC)" refs="IFRS 17.37, 81" concept="risk-adjustment" r={r} rows={[
        { label: 'Opening risk adjustment', get: (y) => y.open.ra + y.open.licRa, kind: 'balance' },
        { label: 'New contracts recognised', get: (y) => (y.year === 1 ? r.initial.riskAdjustment : 0) },
        { label: 'Changes in estimates', get: (y) => y.changeInRa },
        { label: 'Released for risk expired', get: (y) => -y.raReleased },
        { label: 'Added for claims incurred', get: (y) => y.newLicRa },
        { label: 'Released on incurred claims', get: (y) => -y.licRaReleased },
        { label: 'Closing risk adjustment', get: (y) => y.close.ra + y.close.licRa, kind: 'balance' },
      ]} />
    </>
  )
}

function YearPick({ r, yearIdx, setYearIdx }: { r: GmmResult; yearIdx: number; setYearIdx: (i: number) => void }) {
  return (
    <div className="year-pick" role="group" aria-label="Year">
      {r.years.map((y, i) => (
        <button key={y.year} aria-pressed={i === yearIdx} onClick={() => setYearIdx(i)}>{yearLabel(y)}</button>
      ))}
    </div>
  )
}

function Journals({ r, yearIdx, setYearIdx }: { r: GmmResult; yearIdx: number; setYearIdx: (i: number) => void }) {
  const y = r.years[Math.min(yearIdx, r.years.length - 1)]
  const totals = new Map<Account, number>()
  for (const j of y.journals) for (const l of j.lines) totals.set(l.account, (totals.get(l.account) ?? 0) + l.debit - l.credit)
  return (
    <>
      <YearPick r={r} yearIdx={yearIdx} setYearIdx={setYearIdx} />
      <p className="muted" style={{ maxWidth: '75ch' }}>
        Every movement in the measurement becomes a <Link to="/concept/double-entry">double entry</Link>. Premiums go to the liability, not to revenue;
        revenue is recognised as the liability is released for services provided.
      </p>
      <div className="grid cols-2">
        {y.journals.map((j) => (
          <div className="panel journal" key={j.id}>
            <div className="journal-head">
              <strong>{j.description}</strong>
              {CONCEPT_BY_ID[j.conceptId] && <Link to={`/concept/${j.conceptId}`}>Why?</Link>}
            </div>
            <table>
              <tbody>
                {j.lines.map((l, i) => (
                  <tr key={i} className={l.credit ? 'cr' : ''}>
                    <td><span className="acct"><i style={{ background: ACCOUNT_COLOR[l.account] }} />{l.debit ? 'Dr' : 'Cr'} {l.account}</span></td>
                    <td className="amt">{l.debit ? money(l.debit) : ''}</td>
                    <td className="amt">{l.credit ? money(l.credit) : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
      <div className="table-wrap">
        <table className="data">
          <caption><h4>Net movement by account, {yearLabel(y)}</h4><div className="refline">Debit balances positive, credit balances in brackets. LRC and LIC agree to the measured liabilities.</div></caption>
          <thead><tr><th scope="col">Account</th><th scope="col">Net debit / (credit)</th></tr></thead>
          <tbody>
            {[...totals.entries()].map(([a, v]) => (
              <tr key={a}><td><span className="acct"><i style={{ background: ACCOUNT_COLOR[a] }} />{a}</span></td><td>{money(v)}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

function DisclosureView({ t }: { t: DisclosureTable }) {
  const ok = t.rows.length > 1 && t.rows[0].kind === 'balance' ? ties(t) : null
  return (
    <div className="table-wrap">
      <table className="data">
        <caption>
          <h4>{t.title}</h4>
          <div className="refline">
            <span className="chip">{t.reference}</span>
            {ok !== null && (
              <span className={`tie ${ok ? '' : 'fail'}`}><Icon name={ok ? 'check' : 'warn'} size={13} />{ok ? 'Opening plus movements equals closing' : 'Does not tie'}</span>
            )}
            <CopyCsv rows={() => [['Line', ...t.columns], ...t.rows.map((row) => [row.label, ...row.values])]} />
          </div>
        </caption>
        <thead><tr><th scope="col">Line</th>{t.columns.map((c) => <th scope="col" key={c}>{c}</th>)}</tr></thead>
        <tbody>
          {t.rows.map((row) => (
            <tr key={row.label} className={row.kind === 'balance' ? 'balance' : row.kind === 'subtotal' ? 'subtotal' : ''}>
              <td>{row.concept ? <Link to={`/concept/${row.concept}`}>{row.label}</Link> : row.label}</td>
              {row.values.map((v, i) => <td key={i} className={v < -0.5 ? 'neg' : ''}>{money(v)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Disclosures({ r, yearIdx, setYearIdx }: { r: GmmResult; yearIdx: number; setYearIdx: (i: number) => void }) {
  const y = r.years[Math.min(yearIdx, r.years.length - 1)]
  return (
    <>
      <YearPick r={r} yearIdx={yearIdx} setYearIdx={setYearIdx} />
      <p className="muted" style={{ maxWidth: '75ch' }}>
        These tables are read directly from the movements stored by the engine, which is how a well-designed
        <Link to="/concept/tagetik-disclosures"> disclosure layer</Link> works. Liabilities are shown as positive amounts.
        {r.inputs.discountRate > 0 && ` Discount rate ${pct(r.inputs.discountRate)}.`}
      </p>
      <DisclosureView t={liabilityReconciliation(y)} />
      <DisclosureView t={componentReconciliation(r, y)} />
      {y.inCoverage && <DisclosureView t={revenueAnalysis(y)} />}
    </>
  )
}

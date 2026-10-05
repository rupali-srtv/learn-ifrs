import { Link } from 'react-router-dom'
import type { WorkedExample as Worked } from '../content/worked'
import { n1 } from '../content/tbic-figures'
import { TBIC, TBIC_GROUPS } from '../engine/tbic'
import { Icon } from './Icon'
import { Inline } from './RichText'

/** A step-by-step worked example following one TBIC group through the engine. */
export function WorkedExample({ w }: { w: Worked }) {
  const group = TBIC_GROUPS[w.group]
  return (
    <section className="panel worked" aria-labelledby={`worked-${w.concept}`}>
      <div className="worked-head">
        <span className="tag brand">Worked example</span>
        <h3 id={`worked-${w.concept}`}>{w.title}</h3>
        <p className="muted">
          {TBIC.name} ({TBIC.fullName}) is a fictional Indian insurance group. {group.story} All amounts are in {TBIC.unit}.
        </p>
      </div>
      <ol className="worked-steps">
        {w.steps.map((s, i) => (
          <li key={i}>
            <strong>{s.title}</strong>
            <p><Inline text={s.text} /></p>
            {s.rows && (
              <table className="data worked-rows">
                <tbody>
                  {s.rows.map((r, j) => (
                    <tr key={j} className={r.total ? 'total' : undefined}>
                      <td>{r.label}</td>
                      <td>{n1(r.value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {s.formula && <div className="formula">{s.formula}</div>}
          </li>
        ))}
      </ol>
      {w.journals.length > 0 && (
        <div className="worked-journals">
          <h4>Journal entries</h4>
          {w.journals.map((j, i) => (
            <div className="table-wrap" key={i}>
              <table className="data">
                <caption>{j.title}</caption>
                <thead><tr><th scope="col">Account</th><th scope="col">Debit</th><th scope="col">Credit</th></tr></thead>
                <tbody>
                  {j.lines.map((l, k) => (
                    <tr key={k}>
                      <td style={{ paddingLeft: l.credit && !l.debit ? 28 : undefined }}>{l.account}</td>
                      <td>{l.debit ? n1(l.debit) : ''}</td>
                      <td>{l.credit ? n1(l.credit) : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
      <div className="worked-takeaway"><strong>Takeaway.</strong> <Inline text={w.takeaway} /></div>
      <div className="worked-foot">
        <div className="refs">{w.refs.map((r) => <span className="chip" key={r}>{r}</span>)}</div>
        <Link to={`/sandbox?preset=${w.group}`} className="btn btn-ghost">Run {group.name} in the sandbox <Icon name="arrow" /></Link>
      </div>
      <p className="muted worked-note">Figures are rounded to one decimal, so a total can differ from the sum of its rounded parts by 0.1.</p>
    </section>
  )
}

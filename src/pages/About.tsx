import { Link } from 'react-router-dom'
import { CONTENT_STATUS, CONTENT_VERSION } from '../content'

export function About() {
  return (
    <div className="about">
      <div>
        <div className="eyebrow">Trust & method</div>
        <h1 style={{ marginTop: 8 }}>How this content earns reliance</h1>
        <p className="hero-lede">
          Professional teams can rely on training material only when every statement is traceable, reviewed and current. This page
          sets out how Ledgerline is written, checked and versioned, and what the prototype does and does not yet cover.
        </p>
      </div>

      <section>
        <h2>Current status</h2>
        <p>Content version <b>{CONTENT_VERSION}</b>. {CONTENT_STATUS}. Until independent review is complete, use this portal for learning and orientation, not as a basis for accounting conclusions.</p>
      </section>

      <section>
        <h2>Editorial process</h2>
        <ol>
          <li><b>Author.</b> A qualified specialist drafts each page, tying every claim to a paragraph of the standard.</li>
          <li><b>Technical review.</b> A second, independent specialist checks accuracy and recalculates every example.</li>
          <li><b>Editorial review.</b> Plain-language and accessibility check against the house style.</li>
          <li><b>Publish with metadata.</b> Author, reviewer, review date, standard version and Tagetik release are shown on the page.</li>
          <li><b>Monitor.</b> IASB amendments and IFRS Interpretations Committee agenda decisions trigger re-review of every connected page.</li>
        </ol>
      </section>

      <section>
        <h2>How the sandbox calculates</h2>
        <p>The <Link to="/sandbox">sandbox</Link> runs the General Measurement Model for one group of contracts recognised at the start of year 1. Automated checks run on every build and prove that:</p>
        <ul>
          <li>lifetime profit equals the undiscounted net cash flow of the group;</li>
          <li>the LRC, LIC, CSM and loss component all run off to zero;</li>
          <li>the CSM and loss component are never negative and never exist together;</li>
          <li>journals balance and post exactly to the measured liabilities;</li>
          <li>every disclosure reconciliation ties opening to closing in every column.</li>
        </ul>
        <p>Simplifications, shown on the sandbox page as well:</p>
        <ul>
          <li>one flat discount rate, used as both current and locked-in rate;</li>
          <li>premiums, expenses and acquisition cash flows at the start of each year; claims at year end, with an optional share paid a year later;</li>
          <li>the risk adjustment is a fixed share of the present value of claims and is not split into a finance component (IFRS 17.81);</li>
          <li>no OCI option, reinsurance, investment components or foreign currency.</li>
        </ul>
      </section>

      <section>
        <h2>Copyright and independence</h2>
        <p>All content is original. The portal cites paragraph numbers rather than reproducing the text of IFRS Accounting Standards, which are copyright of the IFRS Foundation. Read the standards themselves at ifrs.org.</p>
        <p>CCH Tagetik is a product and trademark of Wolters Kluwer. Ledgerline is independent and is not affiliated with or endorsed by Wolters Kluwer or the IFRS Foundation. The Tagetik track describes implementation patterns that must be validated against a licensed release.</p>
      </section>

      <section>
        <h2>What comes next</h2>
        <ul>
          <li>Independent technical review and an external advisory panel.</li>
          <li>Remaining modules: reinsurance held, the Conceptual Framework, operating IFRS 17, platform foundations.</li>
          <li>PAA and VFA in the sandbox, case studies, assessments and CPD certificates.</li>
          <li>Enterprise features: single sign-on, LMS export and firm workspaces.</li>
        </ul>
      </section>
    </div>
  )
}

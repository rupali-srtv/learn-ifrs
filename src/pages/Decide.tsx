import { Link, useParams } from 'react-router-dom'
import { DECISION_TREES, TREE_BY_ID } from '../content/decisions'
import { DecisionTree } from '../components/DecisionTree'
import { Icon } from '../components/Icon'
import { NotFound } from './NotFound'

export function DecideHub() {
  return (
    <>
      <div className="eyebrow">Decision trees</div>
      <h1 style={{ marginTop: 8 }}>Classify it, one question at a time</h1>
      <p className="hero-lede">
        The judgements learners most often get wrong, as a short series of questions. Every question cites the paragraph of IFRS 17 it comes from;
        Ind AS 117, India’s version of the Standard, is based on IFRS 17, so the same reasoning applies. They teach the reasoning; a real contract still needs the full facts and the Standard itself.
      </p>
      <div className="grid cols-2" style={{ marginTop: 28 }}>
        {DECISION_TREES.map((t) => (
          <Link key={t.id} to={`/decide/${t.id}`} className="panel lab-card">
            <div className="lab-ico"><Icon name="flag" size={20} /></div>
            <h3>{t.title}</h3>
            <p>{t.asks}</p>
          </Link>
        ))}
      </div>
    </>
  )
}

export function DecidePage() {
  const { id = '' } = useParams()
  const tree = TREE_BY_ID[id]
  if (!tree) return <NotFound />
  return (
    <>
      <nav className="crumbs" aria-label="Breadcrumb"><Link to="/decide">Decision trees</Link><span>/</span><span>{tree.title}</span></nav>
      <h1 style={{ marginTop: 6 }}>{tree.title}</h1>
      <p className="hero-lede">{tree.asks}</p>
      <div style={{ marginTop: 24, maxWidth: '72ch' }}>
        <DecisionTree key={tree.id} tree={tree} />
      </div>
    </>
  )
}

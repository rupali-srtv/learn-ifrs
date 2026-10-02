import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <div style={{ padding: '48px 0', display: 'grid', gap: 12 }}>
      <h1>Page not found</h1>
      <p className="muted">That page does not exist yet. Try search, or go back to the learning tracks.</p>
      <p><Link to="/learn">Go to learning tracks</Link></p>
    </div>
  )
}

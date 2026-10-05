import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, MemoryRouter, Route, Routes } from 'react-router-dom'
import { Shell } from './components/Shell'
import { PrefsProvider } from './prefs'
import { Home } from './pages/Home'
import { Learn, TrackPage } from './pages/Learn'
import { ConceptPage } from './pages/ConceptPage'
import { Sandbox } from './pages/Sandbox'
import { ConceptMap } from './pages/ConceptMap'
import { Glossary } from './pages/Glossary'
import { About } from './pages/About'
import { NotFound } from './pages/NotFound'
import { Progress } from './pages/Progress'
import { LabHub } from './pages/labs/LabHub'
import { PaaLab } from './pages/labs/PaaLab'
import { DiscountLab } from './pages/labs/DiscountLab'
import { PipelineLab } from './pages/labs/PipelineLab'
import { Review } from './pages/Review'
import { DecideHub, DecidePage } from './pages/Decide'
import './styles/app.css'

// Hash routing keeps every page addressable from a static host with no server rewrites.
// The embedded preview build (VITE_ROUTER=memory) keeps navigation inside the page instead.
const Router = import.meta.env.VITE_ROUTER === 'memory' ? MemoryRouter : HashRouter

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PrefsProvider>
      <Router>
        <Shell>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/learn" element={<Learn />} />
            <Route path="/learn/:trackId" element={<TrackPage />} />
            <Route path="/concept/:id" element={<ConceptPage />} />
            <Route path="/sandbox" element={<Sandbox />} />
            <Route path="/lab" element={<LabHub />} />
            <Route path="/lab/paa" element={<PaaLab />} />
            <Route path="/lab/discounting" element={<DiscountLab />} />
            <Route path="/lab/pipeline" element={<PipelineLab />} />
            <Route path="/decide" element={<DecideHub />} />
            <Route path="/decide/:id" element={<DecidePage />} />
            <Route path="/review" element={<Review />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/map" element={<ConceptMap />} />
            <Route path="/glossary" element={<Glossary />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Shell>
      </Router>
    </PrefsProvider>
  </StrictMode>,
)

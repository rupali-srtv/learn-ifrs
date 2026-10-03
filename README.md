# Ledgerline: IFRS 17 & Tagetik learning portal

A learning portal that teaches IFRS from zero, goes deep on IFRS 17, and connects every concept to its
calculation, journal entry, disclosure and CCH Tagetik implementation.

## Run it

```bash
npm install
npm run dev          # local dev server
npm test             # engine and content tests
npm run typecheck
npm run build        # static site in dist/ (hash routing, works from any static host)
npm run build:single # one self-contained HTML page in dist-single/ for embedding
```

Requires Node 20 or later.

## What is inside

| Path | What it holds |
| --- | --- |
| `src/engine/gmm.ts` | IFRS 17 General Measurement Model engine for one group of contracts: CSM, loss component, LRC, LIC, revenue, finance expense, journals |
| `src/engine/disclosures.ts` | IFRS 17.103, 104 and 106 tables built from the engine's stored movements |
| `src/engine/presets.ts` | Sandbox scenarios |
| `src/engine/gmm.test.ts` | Hand-checked cases plus invariants: lifetime profit equals net cash, balances run off to zero, journals post to the measured liabilities, every reconciliation ties |
| `src/content/` | The knowledge graph: concept pages (three depths each), tracks and modules, glossary, typed links |
| `src/content/content.test.ts` | Every link resolves, every concept sits in a module and cites a paragraph |
| `src/pages/` | Home, learning tracks, concept page, sandbox, concept map, glossary, trust and method |
| `src/styles/app.css` | Design tokens (light and dark) and all component styles |

## Content conventions

Concept bodies are arrays of blocks: plain paragraphs, `- ` bullets, `> ` callouts and `$ ` formulas.
Inline `[[concept-id]]` or `[[concept-id|label]]` links a concept page; a glossary id shows a hover card.
All content is original and cites paragraph numbers rather than quoting the standards.
Tagetik track pages describe implementation patterns and must be validated against a licensed release.

## Status

Version 1.0 (3 October 2026). Every page, glossary entry, quiz question and lab explanation was fact-checked
against IFRS 17 as amended June 2020 and December 2021, and more than 50 corrections were made. Sign-off by an independent
human expert is still pending; until then the portal is for learning, not a basis for accounting conclusions.

Roadmap: VFA in the sandbox, assessments and CPD certificates, then enterprise features (SSO, LMS export,
firm workspaces).

## Deploy for free (GitHub Pages)

`.github/workflows/deploy.yml` tests, builds and publishes `dist/` to GitHub Pages on every push to `main`.
One-time setup: push this folder to a public GitHub repository, then in the repository go to
Settings → Pages and set Source to "GitHub Actions". The site appears at
`https://<your-user>.github.io/<repo>/`. Pages use hash URLs (`#/concept/csm`), so no server configuration is needed.

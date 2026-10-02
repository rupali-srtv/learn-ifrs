// Builds a single self-contained HTML page (CSS and JS inlined) for embedding as a preview.
// Usage: VITE_ROUTER=memory vite build --outDir dist-single && node scripts/build-single.mjs
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const dir = 'dist-single'
let html = readFileSync(join(dir, 'index.html'), 'utf8')
html = html.replace(/<link rel="stylesheet" crossorigin href="\.\/(assets\/[^"]+\.css)">/g, (_, f) =>
  `<style>\n${readFileSync(join(dir, f), 'utf8')}\n</style>`)
html = html.replace(/<script type="module" crossorigin src="\.\/(assets\/[^"]+\.js)"><\/script>/g, (_, f) =>
  `<script type="module">\n${readFileSync(join(dir, f), 'utf8').replace(/<\/script/gi, '<\\/script')}\n</script>`)
// The host page supplies the document skeleton, so keep only head content and body content.
const head = html.match(/<head>([\s\S]*?)<\/head>/)[1].replace(/<meta charset[^>]*>|<meta name="viewport"[^>]*>/g, '')
const body = html.match(/<body>([\s\S]*?)<\/body>/)[1]
// Scripts in head would run before #root exists, so move them after the body content.
const scripts = [...head.matchAll(/<script type="module">[\s\S]*?<\/script>/g)].map((m) => m[0]).join('\n')
const headRest = head.replace(/<script type="module">[\s\S]*?<\/script>/g, '')
writeFileSync(join(dir, 'ledgerline.html'), `${headRest.trim()}\n${body.trim()}\n${scripts}\n`)
console.log('wrote', join(dir, 'ledgerline.html'))

import { useState } from 'react'
import { Icon } from './Icon'

function toCsv(rows: (string | number)[][]): string {
  return rows
    .map((r) =>
      r
        .map((c) => {
          const s = typeof c === 'number' ? String(Math.round(c * 100) / 100) : c
          return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
        })
        .join(','),
    )
    .join('\n')
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Clipboard API can be blocked in embedded frames; fall back to a hidden textarea.
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.setAttribute('readonly', '')
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      const ok = document.execCommand('copy')
      ta.remove()
      return ok
    } catch {
      return false
    }
  }
}

/** Copies a table as CSV so it can be pasted into a spreadsheet. */
export function CopyCsv({ rows, label = 'Copy as CSV' }: { rows: () => (string | number)[][]; label?: string }) {
  const [state, setState] = useState<'idle' | 'ok' | 'fail'>('idle')
  return (
    <button
      type="button"
      className="copy-btn"
      onClick={async () => {
        setState((await copyText(toCsv(rows()))) ? 'ok' : 'fail')
        setTimeout(() => setState('idle'), 1800)
      }}
      aria-live="polite"
    >
      <Icon name={state === 'ok' ? 'check' : 'copy'} size={13} />
      {state === 'ok' ? 'Copied' : state === 'fail' ? 'Copy blocked here' : label}
    </button>
  )
}

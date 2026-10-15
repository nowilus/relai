import { describe, expect, test } from 'claude-code/testing'
import { SHEET } from './core/theme.mjs'
import { NOW_INK, STATE_WORD, nowArt } from './now-art'
import { nowWords } from './pane-now'
import type { Item } from './core/progress.mjs'

// The "Teraz" section after WYGLAD_PANELU E5 (Aneks G, variant T1 chosen 2026-10-15). Łukasz after
// 3.2.0: „nie da się najeżdżać na te paski, wszystko się ze sobą zlewa”, „jest tam nawalone opisu”;
// on the hover: „dajmy po prostu ten natywny z caloscia i tyle, nie komplikujemy”.

const lum = (c: string) => {
  const v = [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16) / 255).map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4))
  return 0.2126 * (v[0] ?? 0) + 0.7152 * (v[1] ?? 0) + 0.0722 * (v[2] ?? 0)
}
const ratio = (a: string, b: string) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p)
  return ((x ?? 0) + 0.05) / ((y ?? 0) + 0.05)
}

const item = (name: string, status: Item['status']): Item => ({ id: name, label: name, name, status })
const ITEMS: Item[] = [item('Rdzeń planu', 'done'), item('Sonda mostka w gospodarzu', 'running'), item('Testy', 'pending'), item('Zły punkt', 'failed')]

describe('the "Teraz" marks (WYGLAD_PANELU E5)', () => {
  test('every mark and the hover outline stand 3 : 1 from their sheet, in both appearances', () => {
    for (const look of ['dark', 'light'] as const) {
      const ink = NOW_INK[look]
      for (const mark of [ink.done, ink.running, ink.failed, ink.edge, ink.text]) expect(ratio(mark, SHEET[look].sheet)).toBeGreaterThanOrEqual(3)
    }
  })

  test('the instrument fails the colours of 3.2.0: the light done and running stood 2.38 and 2.53 : 1 (planted case)', () => {
    expect(ratio('#8fae95', SHEET.light.sheet)).toBeLessThan(3)
    expect(ratio('#c99a3a', SHEET.light.sheet)).toBeLessThan(3)
  })

  test('the state by shape: done full, running half in its outline, waiting the outline alone, failed full in clay', () => {
    const svg = nowArt(ITEMS)?.svg ?? ''
    const slot = (i: number) => svg.match(new RegExp(`<svg class="b b${i}"[^>]*>(.*?)</svg>`))?.[1] ?? ''
    expect(slot(0)).toContain('class="c fd" y="4" width="100%"')
    expect(slot(1)).toContain('class="c o sr"')
    expect(slot(1)).toContain('class="fr" y="4" width="50%"')
    expect(slot(2)).toContain('class="c o se"')
    expect(slot(2)).not.toMatch(/class="(fd|fr|ff)/)
    expect(slot(3)).toContain('class="c ff"')
    expect(svg).toContain('@media (prefers-color-scheme: light)')
  })

  test('each segment carries its whole point in a <title> and lights its outline on hover; no card of our own, no words in the drawing', () => {
    const long = 'Kontekst „użyte / okno · %” widoczny bez najechania; okno z danych sesji (test na sesji z oknem 200k i 1M — dwie różne wartości na pasku).'
    const art = nowArt([...ITEMS, item(long, 'pending')])
    const svg = art?.svg ?? ''
    expect(svg).toContain(`<title>${STATE_WORD.running} · 2. Sonda mostka w gospodarzu</title>`)
    expect(svg).toContain(`<title>○ czeka · 5. ${long.replace(/"/g, '&quot;')}</title>`)
    expect(svg).toContain('.b:hover .c{stroke-width:2px}')
    expect(svg).not.toContain('<text')
    expect(svg).not.toMatch(/class="t /)
    expect(art?.alt).toContain('✓ zrobiony · 1. Rdzeń planu')
  })

  test('the drawing keeps one height at rest, 28 px, for short and long points (live 2026-10-15: the band grew)', () => {
    expect(nowArt([item('a', 'done')])?.height).toBe(28)
    expect(nowArt([item('x'.repeat(400), 'pending')])?.height).toBe(28)
    expect(nowArt([item('x'.repeat(400), 'pending')])?.svg).toMatch(/^<svg [^>]*height="28">/)
  })

  test('the words under the bar name one item: in progress, else the next, else all ticked', () => {
    expect(nowWords(ITEMS)).toBe('w toku: Sonda mostka w gospodarzu')
    expect(nowWords([item('a', 'done'), item('b', 'pending')])).toBe('następny: b')
    expect(nowWords([item('a', 'done')])).toBe('wszystkie punkty odhaczone')
  })
})

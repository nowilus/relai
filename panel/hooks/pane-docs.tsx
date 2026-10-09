// relai-panel: the documents tab (E6, Aneks E).
//
// Split out of register.tsx in E7 without a change of behavior; no `$` here (P-023 pkt 10).

import { THEME, DIFF } from './core/theme.mjs'
import { plural } from './core/measure.mjs'
import { KINDS, diffRows, docIcon, edited, folderIcon, kb, treeHref } from './core/documents.mjs'
import type { DiffView, Doc, TreeNode } from './core/documents.mjs'
import type { RenderChildren } from 'claude-code'
import type { DocsData, OpenDoc } from './data'
import type { Ctx, Parts } from './pane-parts'

export type DocMode = 'diff' | 'preview'
export type DocFilter = 'changed' | 'all'
export type DocLayout = 'tiles' | 'tree'

// What the tab needs beyond its data: the open document and the three switches, the folds, and the
// presses that change them (register.tsx holds `$` and does each)
export type DocsCtx = {
  pick: string
  mode: DocMode
  filter: DocFilter
  layout: DocLayout
  isUnfolded: (key: string, byDefault: boolean) => boolean
  fold: (key: string, byDefault: boolean) => void
  toggleDoc: (id: string) => void
  closeDoc: () => void
  setMode: (m: DocMode) => void
  setFilter: (f: DocFilter) => void
  setLayout: (l: DocLayout) => void
}

export function docsView(c: Ctx, p: Parts, dd: DocsData, s: DocsCtx) {
  const { el, Svg, isGui } = c
  const { Box, Text } = el
  const { btn, flashBorder, section, frame, costBox, line } = p
  const { isUnfolded, fold } = s

  // A shelf of tiles (calibration 2026-10-09, variant A of four), then on the person's words of
  // the same day: the edited documents on top — the turn's first, then those changed since the
  // last commit — and every group folded under them ("Zmienione"), or the groups open
  // ("Wszystkie"); tiles or a file tree. A tile is the document's icon with its type (MD, HTML,
  // PDF…), its name, size and last edit, and the lines it changed. Nothing more until a document
  // is opened: its window stands under the group or folder it came from — the diff drawn row by
  // row as code review draws it, or the document itself.
  const { Code, Markdown } = el
  const iconLook = (d: Doc) => (d.isChanged
    ? { paper: THEME.cardOn, edge: THEME.accent, badge: THEME.accent, ink: THEME.cardOn }
    : d.added !== null
      ? { paper: THEME.card, edge: THEME.mark, badge: THEME.mark, ink: THEME.card }
      : { paper: THEME.card, edge: THEME.line, badge: THEME.line, ink: THEME.title })
  const typeLabel = (d: Doc) => KINDS[d.ext]?.label ?? d.ext.toUpperCase()
  const docGlyph = (key: string, d: Doc, px: number) => (Svg
    ? <Svg key={key} source={docIcon(d.ext, iconLook(d), px)} alt={`${d.name}${d.isChanged ? ' — zmieniony w tej turze' : ''}`} width={Math.round((px * 40) / 48)} height={px} />
    : <Text key={key} bold color={iconLook(d).edge}>{`[${typeLabel(d)}]`}</Text>)
  const lines = (key: string, d: Doc) => (d.added === null ? [] : [
    <Box key={key} flexDirection="row" columnGap={1} flexShrink={0}>
      <Text color={THEME.ok}>{`+${d.added}`}</Text>
      <Text color={THEME.accentText}>{`−${d.removed ?? 0}`}</Text>
    </Box>,
  ])
  const openDoc = (group: string, d: Doc) => {
    s.toggleDoc(`${group}|${d.path}`)
  }
  const docTile = (group: string, d: Doc, pick: string) => {
    const id = `${group}|${d.path}`
    const isOpen = pick === id
    const isHot = d.isChanged || isOpen
    return (
      <Box key={`tile-${id}`} flexDirection="column" alignItems="center" width={20} paddingX={1} paddingY={isGui ? 1 : 0}
        {...frame(isGui || isOpen)} borderColor={flashBorder(`open-${id}`, isHot ? THEME.accent : THEME.line)}
        backgroundColor={isHot ? THEME.cardOn : THEME.card} hover={{ borderColor: THEME.accent }}>
        {docGlyph(`tile-i-${id}`, d, 48)}
        <Text bold color={d.isChanged ? THEME.accentText : THEME.title} wrap="truncate-middle">{d.name}</Text>
        <Text color={THEME.body} wrap="truncate">{`${kb(d.bytes)} · ${edited(d.mtimeMs, dd.now)}`}</Text>
        {lines(`tile-n-${id}`, d)}
        {btn(`open-${id}`, isOpen ? 'Zamknij' : 'Otwórz', isOpen ? 'primary' : 'secondary', () => openDoc(group, d))}
      </Box>
    )
  }
  const shelfRow = (group: string, list: Doc[], pick: string) => (
    <Box key={`shelf-${group}`} flexDirection="row" flexWrap="wrap" gap={1}>{list.map((d) => docTile(group, d, pick))}</Box>
  )
  // The file tree as an editor's explorer draws it (calibration 2026-10-09, "jak w VS Code"): a
  // row is a chevron and a folder icon, open or closed, or a document's icon at tree size, then
  // the name alone, as a link the panel answers (TREE_LINK): a folder unfolds, a document opens
  // its window under its row. An edited name is bold, an edited folder carries a dot and a count.
  const TREE_PX = 20
  const TREE_PER_DIR = 40
  const TREE_ROWS = 60
  const mdName = (s: string) => s.replace(/[\\`*_[\]<>]/g, (c) => '\\' + c)
  const treeLink = (key: string, label: string, href: string, isBold: boolean, onPress: () => void) => (
    <Markdown key={key} text={isBold ? `**[${mdName(label)}](${href})**` : `[${mdName(label)}](${href})`}
      onLinkPress={() => onPress()} pressableLinks={[href]} />
  )
  const folderRow = (n: TreeNode, depth: number, isOpen: boolean, foldKey: string, byDefault: boolean) => (
    <Box key={`dir-${n.dir}`} flexDirection="row" alignItems="center" columnGap={1} paddingLeft={depth * 2} paddingRight={1}
      hover={{ backgroundColor: THEME.cardOn }}>
      {/* A row has no press of its own (2.1.293: Button, Link and a Markdown link only): the chevron is a link too */}
      <Box key={`dir-c-${n.dir}`} flexShrink={0}>{treeLink(`dir-cl-${n.dir}`, isOpen ? '▾' : '▸', treeHref('dir', n.dir), false, () => fold(foldKey, byDefault))}</Box>
      {Svg ? [<Box key={`dir-i-${n.dir}`} flexShrink={0}>
        <Svg key={`dir-g-${n.dir}`} source={folderIcon(isOpen, { fill: n.edited ? THEME.mark : THEME.body, edge: THEME.line, dot: n.edited ? THEME.accent : null }, TREE_PX)}
          alt={`folder ${n.name}${isOpen ? ', otwarty' : ''}`} width={Math.round((TREE_PX * 24) / 20)} height={TREE_PX} />
      </Box>] : []}
      <Box key={`dir-t-${n.dir}`} flexShrink={1}>{treeLink(`dir-l-${n.dir}`, Svg ? n.name : `${n.name}/`, treeHref('dir', n.dir), n.edited > 0, () => fold(foldKey, byDefault))}</Box>
      {n.edited ? [<Text key={`dir-n-${n.dir}`} color={THEME.accentText}>{String(n.edited)}</Text>] : []}
    </Box>
  )
  // A document's row; on top of the tree it says its folder too, the one word more it needs there
  const fileRow = (prefix: string, group: string, d: Doc, depth: number, pick: string, note = '') => {
    const isOpen = pick === `${group}|${d.path}`
    return (
      <Box key={`${prefix}-${d.path}`} flexDirection="row" alignItems="center" columnGap={1} paddingLeft={depth * 2 + 2} paddingRight={1}
        {...(isOpen ? { backgroundColor: THEME.cardOn } : {})} hover={{ backgroundColor: THEME.cardOn }}>
        <Box key={`${prefix}-i-${d.path}`} flexShrink={0}>{docGlyph(`${prefix}-g-${d.path}`, d, TREE_PX)}</Box>
        <Box key={`${prefix}-t-${d.path}`} flexShrink={1}>{treeLink(`${prefix}-l-${d.path}`, d.name, treeHref('doc', d.path), d.isChanged || d.added !== null, () => openDoc(group, d))}</Box>
        {note ? [<Text key={`${prefix}-d-${d.path}`} color={THEME.body} wrap="truncate-middle">{note}</Text>] : []}
        {lines(`${prefix}-n-${d.path}`, d)}
      </Box>
    )
  }
  // The diff as code review draws it, row by row: old and new line numbers in a quiet gutter,
  // the marker, the text; an added row on sage, a removed one on clay (DIFF, contrast tested)
  const diffBlock = (v: DiffView, path: string) => {
    const r = diffRows(v.source)
    const num = (n: number | null) => (n === null ? '' : String(n)).padStart(4, ' ')
    return [
      <Box key="dw-diff" flexDirection="column">
        {r.rows.map((x, i) => (x.kind === 'hunk'
          ? <Box key={`dr-${i}`} paddingX={1} marginTop={i ? 1 : 0}><Text color={DIFF.hunk} wrap="truncate">{x.text}</Text></Box>
          : <Box key={`dr-${i}`} flexDirection="row" columnGap={1} paddingX={1}
              {...(x.kind === 'add' ? { backgroundColor: DIFF.addBg } : x.kind === 'del' ? { backgroundColor: DIFF.delBg } : {})}>
              <Box key={`dr-g-${i}`} flexShrink={0}><Text color={DIFF.gutter}>{`${num(x.old)} ${num(x.new)}`}</Text></Box>
              <Box key={`dr-m-${i}`} flexShrink={0}><Text bold color={x.kind === 'add' ? DIFF.addText : x.kind === 'del' ? DIFF.delText : DIFF.gutter}>{x.kind === 'add' ? '+' : x.kind === 'del' ? '−' : ' '}</Text></Box>
              <Box key={`dr-t-${i}`} flexGrow={1} flexShrink={1}><Text color={x.kind === 'add' ? DIFF.addText : x.kind === 'del' ? DIFF.delText : DIFF.ctxText}>{x.text === '' ? ' ' : x.text}</Text></Box>
            </Box>))}
      </Box>,
      ...(r.hidden || v.shown < v.hunks ? [line('dw-cut', `Pokazano część zmian — całość: git diff HEAD -- ${path}`, THEME.mark)] : []),
    ]
  }
  // What "Podgląd" draws: Markdown drawn, text as code in its language, a binary file in words
  const previewBlock = (o: OpenDoc) => {
    const d = o.doc
    const kind = KINDS[d.ext]
    if (kind?.show === 'none') return [line('dw-bin', `Plik ${typeLabel(d)} — panel nie rysuje go w środku; otwórz ${d.path} poza panelem.`)]
    if (o.preview === null) return [line('dw-nofile', `⚠ Nie można odczytać ${d.path}`, THEME.accentText)]
    const cut = o.preview.cut ? [line('dw-pcut', o.preview.isTail
      ? `Pokazano koniec dokumentu (najnowsze wpisy); wcześniejsze ${kb(o.preview.cut)} w pliku.`
      : `Pokazano początek dokumentu; dalsze ${kb(o.preview.cut)} w pliku.`, THEME.mark)] : []
    if (kind?.show === 'markdown') return [<Markdown key="dw-md" text={o.preview.text} />, ...cut]
    // A desktop draws a link only to https (2.1.293): an HTML page shows as its source
    return [
      ...(d.ext === 'html' || d.ext === 'htm' ? [line('dw-html', `Źródło HTML; pełny widok: otwórz ${d.path} w przeglądarce.`)] : []),
      <Code key="dw-src" source={o.preview.text} {...(kind?.language ? { language: kind.language } : {})} wrap="wrap" />, ...cut,
    ]
  }
  // The open document: its path and facts, "Zmiany" / "Podgląd", then the diff or the document
  const docWindow = (o: OpenDoc, mode: 'diff' | 'preview') => {
    const d = o.doc
    const body = mode === 'diff'
      ? o.diffError ? [line('dw-err', '⚠ ' + o.diffError, THEME.accentText)]
        : !o.diff || o.diff.isEmpty ? [line('dw-none', d.isChanged
          ? 'Bez różnicy wobec ostatniego commita — plik nowy (jeszcze poza gitem) albo zmiana już zacommitowana.'
          : 'Bez zmian od ostatniego commita.')]
        : diffBlock(o.diff, d.path)
      : previewBlock(o)
    return (
      <Box key="doc-window" flexDirection="column" gap={isGui ? 1 : 0} paddingX={isGui ? 2 : 1} paddingY={isGui ? 1 : 0}
        borderStyle="round" borderColor={THEME.accent} backgroundColor={THEME.cardOn}>
        <Box key="dw-head" flexDirection="row" flexWrap="wrap" alignItems="center" columnGap={2}>
          {docGlyph('dw-icon', d, 32)}
          <Box key="dw-title" flexDirection="column" flexGrow={1} flexShrink={1}>
            <Text bold color={THEME.title} wrap="truncate-middle">{d.path}</Text>
            <Box key="dw-facts" flexDirection="row" flexWrap="wrap" columnGap={1}>
              <Text color={THEME.body}>{`${kb(d.bytes)} · edytowany ${edited(d.mtimeMs, dd.now)}${d.isChanged ? ' · zmieniony w tej turze' : ''}`}</Text>
              {lines('dw-lines', d)}
            </Box>
          </Box>
        </Box>
        <Box key="dw-modes" flexDirection="row" flexWrap="wrap" gap={1}>
          {btn('dw-diff-btn', 'Zmiany', mode === 'diff' ? 'primary' : 'secondary', () => s.setMode('diff'))}
          {btn('dw-preview-btn', 'Podgląd', mode === 'preview' ? 'primary' : 'secondary', () => s.setMode('preview'))}
          {btn('dw-close', 'Zamknij', 'secondary', () => s.closeDoc())}
        </Box>
        <Box key="dw-body" flexDirection="column">{body}</Box>
      </Box>
    )
  }
  // A folded section's head: its name, how many documents and how many edited, "Pokaż" / "Zwiń"
  const foldHead = (key: string, title: string, list: Doc[], isOpen: boolean, byDefault: boolean, indent = 0) => {
    const nEdited = list.filter((d) => d.isChanged || d.added !== null).length
    return (
      <Box key={`${key}-head`} flexDirection="row" flexWrap="wrap" alignItems="center" columnGap={2} paddingLeft={indent}>
        <Text bold color={THEME.mark} wrap="truncate-middle">{title}</Text>
        <Text color={THEME.body}>{`${list.length} ${plural(list.length, 'dokument', 'dokumenty', 'dokumentów')}${nEdited ? ` · ${nEdited} ze zmianami` : ''}`}</Text>
        {btn(`fold-${key}`, isOpen ? 'Zwiń' : 'Pokaż', 'secondary', () => fold(key, byDefault))}
      </Box>
    )
  }
  const draw = (dd: DocsData, pick: string, mode: DocMode, filter: DocFilter, layout: DocLayout) => {
    const under = (group: string) => (dd.open && dd.open.group === group ? [docWindow(dd.open, mode)] : [])
    const nTurn = dd.changed.length
    const nEdited = dd.edited.length
    const controls = (
      <Box key="docs-controls" flexDirection="row" flexWrap="wrap" gap={1}>
        {btn('docs-f-changed', 'Zmienione', filter === 'changed' ? 'primary' : 'secondary', () => s.setFilter('changed'))}
        {btn('docs-f-all', 'Wszystkie', filter === 'all' ? 'primary' : 'secondary', () => s.setFilter('all'))}
        <Text color={THEME.line}>│</Text>
        {btn('docs-l-tiles', 'Kafle', layout === 'tiles' ? 'primary' : 'secondary', () => s.setLayout('tiles'))}
        {btn('docs-l-tree', 'Drzewo', layout === 'tree' ? 'primary' : 'secondary', () => s.setLayout('tree'))}
      </Box>
    )
    // The edited ones on top, in either layout: the turn's first, then since the last commit
    const top = costBox('docs-turn', [
      line('docs-turn-h', nEdited
        ? `Zmienione · ${nEdited}${nTurn ? ` · ${nTurn} w tej turze` : ''}`
        : 'Żaden dokument nie ma zmian od ostatniego commita', nEdited ? THEME.accentText : THEME.body, true),
      ...(nEdited ? [layout === 'tiles' ? shelfRow('edited', dd.edited, pick)
        : <Box key="docs-turn-rows" flexDirection="column">
          {dd.edited.map((d) => fileRow('top', 'edited', d, 0, pick, d.path.includes('/') ? d.path.slice(0, d.path.lastIndexOf('/')) : ''))}
        </Box>] : []),
      line('docs-turn-n', 'W tej turze: z narzędzi Edit i Write modelu (zapisu poleceniem powłoki nie widzi). Liczby linii: od ostatniego commita.'),
    ], nEdited > 0)
    // "Zmienione": every group folded under the edited ones; "Wszystkie": the groups as they come
    const isOpenBy = (key: string, natural: boolean) => isUnfolded(`docs:${filter}:${key}`, filter === 'all' && natural)
    let rowsLeft = TREE_ROWS
    const body = layout === 'tiles'
      ? dd.groups.flatMap((g) => {
        const isOpen = isOpenBy(g.key, !g.isFolded)
        return [
          <Box key={`docs-g-${g.key}`} flexDirection="column" gap={isGui ? 1 : 0}>
            {foldHead(`docs:${filter}:${g.key}`, g.title, g.docs, isOpen, filter === 'all' && !g.isFolded)}
            {isOpen ? [shelfRow(g.key, g.docs, pick)] : []}
          </Box>,
          ...(isOpen ? under(g.key) : []),
        ]
      })
      : [<Box key="docs-tree" flexDirection="column" paddingY={isGui ? 1 : 0} {...frame(isGui)} borderColor={THEME.line} backgroundColor={THEME.card}>
        {treeRows(dd.tree, 0)}
      </Box>]
    // The project's root unfolded: its folders, then CLAUDE.md and AGENTS.md; every folder folded
    // until pressed, in either filter (calibration 2026-10-09: "foldery zawsze zwinięte")
    // Bounded (calibration 2026-10-09: the archive unfolded drew ~1300 elements, 680 KB, and the
    // pane stopped showing): TREE_PER_DIR documents a folder, TREE_ROWS rows the tree, then a line
    function treeRows(n: TreeNode, depth: number): RenderChildren[] {
      const out: RenderChildren[] = []
      let skipped = 0
      for (const f of n.folders) {
        if (rowsLeft <= 0) { skipped += 1; continue }
        const isOpen = isOpenBy('dir:' + f.dir, false)
        rowsLeft -= 1
        out.push(folderRow(f, depth, isOpen, `docs:${filter}:dir:${f.dir}`, false), ...(isOpen ? treeRows(f, depth + 1) : []))
      }
      const shown = n.docs.slice(0, Math.max(0, Math.min(TREE_PER_DIR, rowsLeft)))
      rowsLeft -= shown.length
      for (const d of shown) out.push(fileRow('row', 'tree', d, depth, pick), ...under('tree').filter(() => dd.open?.doc.path === d.path))
      const hidden = n.docs.length - shown.length + skipped
      if (hidden > 0) {
        out.push(<Box key={`more-${n.dir || 'root'}`} paddingLeft={depth * 2 + 2}>
          <Text color={THEME.body}>{`… jeszcze ${hidden} ${plural(hidden, 'pozycja', 'pozycje', 'pozycji')} — panel rysuje ${TREE_ROWS} wierszy drzewa, po ${TREE_PER_DIR} na folder; zwiń inne foldery albo otwórz ${n.dir || 'katalog'} w edytorze`}</Text>
        </Box>)
      }
      return out
    }
    return [
      section('docs', 'docs', 'Zmienione na górze; otwórz dokument, żeby zobaczyć jego zmiany albo treść.', [
        controls,
        ...(dd.gitError ? [line('docs-git', `⚠ ${dd.gitError} — bez liczb linii`, THEME.accentText)] : []),
        top,
        ...under('edited'),
      ]),
      <Box key="docs-body" flexDirection="column" gap={isGui ? 1 : 0}>{body}</Box>,
    ]
  }

  return draw(dd, s.pick, s.mode, s.filter, s.layout)
}

// Team View: the member's office. Active only in a folder that holds a Handoff
// brain (.handoff/brain.json); everywhere else every hook steps aside.

import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Backup, BackupFlow, BrainInfo, Card, ChatLine, Energy, MemberState, MemberStatus, SendRecord, Service } from '../types'

import { MARKER, chatEntry, join, mirrorNote, parseBrain, parseBrief, parseCard, parseChat, setFrontmatter, splitFrontmatter, today } from './brain'
import {
  cardView,
  classify,
  detectServices,
  doubledServices,
  isWorkingNote,
  isWriteTool,
  parseEnv,
  parseSettings,
  pathsToResolve,
  settingsReachingBrain,
  stableJson,
  unplainSettings,
} from './gate'
import type { Adapter, McpTarget } from './gate'
import { CONNECTORS_URL, GH_DOWNLOAD_URL, IGNORABLE, NEW_BRAIN_NOTE, SCHEDULED_URL, SHIFT_PROMPT, filled, isSystemFile, onlyMcpChoices, repoName, signInCode } from './setup'
import { BASE, PRACTICE } from './template'
import { CAPS, STRINGS, activityFor, activityLine, capWords } from './words'

const PANE = 'team'
const CARD_PREFIX = 'handoff-team:card:'

const brainA = atom({ plugin: 'handoff-team', key: 'brain' } as const, null)
const rootA = atom({ plugin: 'handoff-team', key: 'root' } as const, '')
const membersA = atom({ plugin: 'handoff-team', key: 'members' } as const, {})
const feedA = atom({ plugin: 'handoff-team', key: 'feed' } as const, [])
const chatA = atom({ plugin: 'handoff-team', key: 'chat' } as const, [])
const briefA = atom({ plugin: 'handoff-team', key: 'brief' } as const, '')
const placedA = atom({ plugin: 'handoff-team', key: 'placed' } as const, true)
const cardsA = atom({ plugin: 'handoff-team', key: 'cards' } as const, [])
const energyA = atom({ plugin: 'handoff-team', key: 'energy' } as const, null)
const backupA = atom({ plugin: 'handoff-team', key: 'backup' } as const, { state: 'idle', files: [] })
const setupA = atom({ plugin: 'handoff-team', key: 'setupStep' } as const, 0)
const showAllA = atom({ plugin: 'handoff-team', key: 'showAll' } as const, false)
const chimesA = atom({ plugin: 'handoff-team', key: 'chimes' } as const, false)
const sendingA = atom({ plugin: 'handoff-team', key: 'sending' } as const, '')
const expandedA = atom({ plugin: 'handoff-team', key: 'expanded' } as const, '')
const newFolderA = atom({ plugin: 'handoff-team', key: 'newFolder' } as const, '')
const backupFlowA = atom({ plugin: 'handoff-team', key: 'backupFlow' } as const, { stage: 'checking', code: '' } as BackupFlow)
const openedA = atom({ plugin: 'handoff-team', key: 'opened' } as const, '')
// Bumped by Check, so the pane looks again for the owner's connected apps.
const appsCheckA = atom({ plugin: 'handoff-team', key: 'appsCheck' } as const, 0)
const updateA = atom({ plugin: 'handoff-team', key: 'update' } as const, [] as string[])

const STATUS_COLOR: Record<MemberStatus, string> = {
  working: 'claude',
  waiting: 'warning',
  done: 'success',
  resting: 'subtle',
  snag: 'inactive',
}

const SERVICE_NAME: Record<Service, string> = { gmail: 'Gmail', calendar: 'Calendar', notion: 'Notion' }

const DENY_TEXT = {
  protected: STRINGS.line.heldProtected,
  shell: STRINGS.line.heldShell,
  web: STRINGS.line.heldWeb,
  held: STRINGS.line.heldOther,
  unapproved: STRINGS.line.heldApp,
} as const

function clockTime(ms: number): string {
  const d = new Date(ms)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function friendlyHour(iso?: string): string {
  if (!iso) return 'later'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return 'later'
  const h = d.getHours()
  return `${h % 12 === 0 ? 12 : h % 12}${h < 12 ? 'am' : 'pm'}`
}

function energyFrom(rateLimits: { kind: string; percentUsed: number; resetsAt?: string }[]): Energy | null {
  const worst = [...rateLimits].sort((a, b) => b.percentUsed - a.percentUsed)[0]
  if (!worst) return null
  if (worst.percentUsed >= 100) return { level: 'out', resetsAt: worst.resetsAt }
  if (worst.percentUsed >= 70) return { level: 'low', resetsAt: worst.resetsAt }
  return { level: 'plenty' }
}

function energyText(energy: Energy | null): string {
  if (!energy) return ''
  if (energy.level === 'out') return `${STRINGS.line.energyOut} ${friendlyHour(energy.resetsAt)}`
  return energy.level === 'low' ? STRINGS.line.energyLow : STRINGS.line.energyPlenty
}

function argsOf(e: Record<string, unknown>): Record<string, unknown> {
  const { tool: _t, tool_use_id: _id, consent: _c, agentId: _a, requestMeta: _m, ...rest } = e
  return rest
}

function viewOf(card: Card) {
  if (card.kind !== 'send' || !card.server || !card.tool || !card.args || !card.adapter) return null
  return cardView({ server: card.server, tool: card.tool }, card.adapter, card.args)
}

function cardTitle(card: Card): string {
  const view = viewOf(card)
  if (!view) return capWords(card.title, CAPS.cardTitle)
  const first = view.recipients[0]?.value.split(/[,\s]/)[0] || view.goesTo
  return capWords(`${card.owner} wants to ${view.verb} ${first}`, CAPS.cardTitle)
}

// A send that was claimed but never finished may or may not have gone out, so
// the owner is asked: a claim older than two minutes with no outcome, or a
// claim lock with no record of the claim (a crash between the two writes).
function shownStatus(r: SendRecord, nowMs: number, claimed: boolean): SendRecord['status'] {
  if (r.status === 'sending' && (r.claimedAt === undefined || nowMs - r.claimedAt > 120_000)) return 'unknown'
  if (r.status === 'waiting' && claimed) return 'unknown'
  return r.status
}

function recordToCard(r: SendRecord, nowMs: number, claimed: boolean): Card {
  return {
    id: r.id,
    source: 'store',
    path: r.note,
    kind: 'send',
    status: shownStatus(r, nowMs, claimed),
    attempt: r.attempt,
    owner: r.owner,
    title: '',
    why: '',
    summary: '',
    server: r.server,
    tool: r.tool,
    adapter: r.adapter,
    args: r.args,
    created: r.created,
  }
}

function previewText(target: McpTarget, adapter: Adapter, args: Record<string, unknown>): string {
  const v = cardView(target, adapter, args)
  return [
    ...v.recipients.map(r => `${r.label}: ${r.value}`),
    v.subject && `subject: ${v.subject}`,
    ...v.details.map(d => `${d.label}: ${d.value}`),
    v.body,
  ]
    .filter(Boolean)
    .join('\n')
}

// Module state: rebuilt on every load, since session.start fires again.
// Helpers that take $ live at the top of the file: the engine follows $ only
// into functions declared here.
let root = ''
let brain: BrainInfo | null = null
let mainTurnId = ''
const agentToName = new Map<string, string>()
const toolToName = new Map<string, string>()
const lastLineAt = new Map<string, number>()
let lastCardCount = -1
let teamWorked = false
// Cards this session is sending right now, checked and set before any await.
const inFlight = new Set<string>()
// Set when the session could not tell whether it is in a brain. Then only
// plain reading goes on, as when the gate itself fails.
let initFailed = false
const READ_ONLY = ['Read', 'Glob', 'Grep', 'LS', 'NotebookRead', 'TodoWrite']
// Set when this session made the brain or updated its rules: what was loaded
// at the start is out of date, so the Chief is told to read them again.
let madeHere = false
// The empty folder Team View is offering to make a brain in. Until the owner
// taps, only reading goes on there, so nothing can make the brain for them.
let offeredFolder = ''
let making = false
let timersOn = false
let commandReady = false

const chiefName = () => brain?.employees[0]?.name ?? 'Your Chief'

// Reads and writes of the brain folder.

async function readBrain($: EngineInterface, at: string): Promise<BrainInfo | null> {
  try {
    return parseBrain(await $.fs.read(join(at, MARKER)))
  } catch {
    return null
  }
}

// A brain whose settings cannot be read still gets the gate, with no
// connections approved, and Team View says it needs a fix.
const UNHEALTHY: BrainInfo = {
  name: 'Your brain',
  employees: [{ id: 'chief', name: 'Chief', role: 'Chief of Staff' }],
  setupDone: true,
  connections: {},
  unhealthy: true,
}

// The brain is the nearest folder at or above the session's folder that holds
// .handoff/brain.json, so a session opened in a subfolder is still guarded.
async function findBrainRoot($: EngineInterface, from: string): Promise<string> {
  let dir = from.replace(/\/+$/, '') || '/'
  for (let i = 0; i < 40; i++) {
    if (await $.fs.exists(join(dir, MARKER))) return dir
    const parent = dir.slice(0, dir.lastIndexOf('/')) || '/'
    if (parent === dir) break
    dir = parent
  }
  return ''
}

// Where a write lands on disk, every link followed (the engine's "placed"
// pattern): the file if it exists, else its folder plus the name.
async function placed($: EngineInterface, path: string): Promise<string | undefined> {
  const cut = path.lastIndexOf('/')
  const name = path.slice(cut + 1)
  if (!name || name === '.' || name === '..') return undefined
  const own = await $.fs.stat(path, { resolve: true }).catch(() => undefined)
  if (own) return own.isLink ? undefined : own.realPath
  const folder = cut <= 0 ? '/' : path.slice(0, cut)
  const dir = await $.fs.stat(folder, { resolve: true }).catch(() => undefined)
  return dir?.realPath === undefined ? undefined : `${dir.realPath.replace(/\/$/, '')}/${name}`
}

async function readNoteCards($: EngineInterface, at: string): Promise<Card[]> {
  const dir = join(at, 'Team/Tasks')
  if (!(await $.fs.exists(dir))) return []
  const cards: Card[] = []
  for (const entry of await $.fs.list(dir)) {
    if (entry.kind !== 'file' || !entry.name.endsWith('.md')) continue
    const path = join(dir, entry.name)
    try {
      const card = parseCard(path, await $.fs.read(path))
      if (card) cards.push(card)
    } catch {
      // An unreadable note is skipped; the Friday Review lists it.
    }
  }
  return cards
}

async function readSendRecords($: EngineInterface): Promise<SendRecord[]> {
  const records: SendRecord[] = []
  for (const key of await $.store.keys()) {
    if (!key.startsWith(CARD_PREFIX)) continue
    const value = (await $.store.get(key)) as SendRecord | undefined
    // A card belongs to the brain it was held in, and shows only there.
    if (!value || !value.id || value.root !== root) continue
    if (['waiting', 'failed', 'unknown', 'sending'].includes(value.status)) records.push(value)
  }
  return records
}

async function readDay($: EngineInterface, at: string, date: string): Promise<{ chat: ChatLine[]; brief: string }> {
  const path = join(at, `Team/Chat/${date}.md`)
  if (!(await $.fs.exists(path))) return { chat: [], brief: '' }
  const text = await $.fs.read(path)
  return { chat: parseChat(text), brief: parseBrief(text) }
}

async function appendChat($: EngineInterface, at: string, date: string, line: string): Promise<void> {
  const path = join(at, `Team/Chat/${date}.md`)
  const before = (await $.fs.exists(path)) ? await $.fs.read(path) : `# Team chat ${date}\n\n## Chat\n`
  const withSection = /^##\s+Chat\s*$/m.test(before) ? before : `${before.trimEnd()}\n\n## Chat\n`
  await $.fs.write(path, withSection.endsWith('\n') ? withSection + line : `${withSection}\n${line}`)
}

async function setNoteStatus($: EngineInterface, path: string, status: string, extra: Record<string, string> = {}) {
  if (!path || !(await $.fs.exists(path))) return
  await $.fs.write(path, setFrontmatter(await $.fs.read(path), { status, ...extra }))
}

// Backup: keeps the brain folder and its cloud copy in step, in plain words:
// "Saved", or "Two versions of <note>" with Keep mine / Keep the team's.

// Backup runs git with the settings that could start other programs turned
// off, and a push never takes tags along.
const AUTHOR = [
  '-c', 'user.name=Your team',
  '-c', 'user.email=team@handoff.invalid',
  '-c', 'core.fsmonitor=false',
  '-c', 'core.hooksPath=/dev/null',
  '-c', 'push.followTags=false',
]

async function git($: EngineInterface, at: string, args: string[]) {
  return $.process.run(['git', '-C', at, ...AUTHOR, ...args], { timeoutMs: 30_000 })
}

async function conflicted($: EngineInterface, at: string): Promise<string[]> {
  const out = await git($, at, ['diff', '--name-only', '--diff-filter=U'])
  return out.stdout.split('\n').map(s => s.trim()).filter(Boolean)
}

// The backup only ever goes to the cloud copy recorded at setup.
async function remoteIsPinned($: EngineInterface, at: string): Promise<boolean> {
  const pin = brain?.backupRemote
  if (!pin) return false
  // Every address git would fetch from or push to must be the pinned one.
  const all = async (args: string[]) => {
    const out = await git($, at, args)
    return out.exitCode === 0 ? out.stdout.split('\n').map(u => u.trim()).filter(Boolean) : []
  }
  const fetchUrls = await all(['remote', 'get-url', '--all', 'origin'])
  const pushUrls = await all(['remote', 'get-url', '--push', '--all', 'origin'])
  return fetchUrls.length > 0 && pushUrls.length > 0 && [...fetchUrls, ...pushUrls].every(u => u === pin)
}

// Read before any other git command: only a repository with plain settings,
// and no setting or variable at any level that reaches into the brain, is
// backed up.
async function settingsAreSafe($: EngineInterface, at: string): Promise<boolean> {
  const local = await $.process.run(['git', '-C', at, 'config', '--local', '--includes', '--list', '-z'], { timeoutMs: 10_000 })
  if (local.exitCode !== 0 || unplainSettings(local.stdout).length > 0) return false
  const all = await $.process.run(['git', '-C', at, 'config', '--list', '--show-origin', '--includes', '-z'], { timeoutMs: 10_000 })
  const envOut = await $.process.run(['/usr/bin/env', '-0'], { timeoutMs: 10_000 })
  const env = envOut.exitCode === 0 && !envOut.isStdoutTruncated ? parseEnv(envOut.stdout) : null
  if (all.exitCode !== 0 || all.isStdoutTruncated || !env) return false
  const settings = parseSettings(all.stdout)
  const real = new Map<string, string | undefined>()
  for (const path of pathsToResolve(settings, env, at)) {
    real.set(path, (await $.fs.stat(path, { resolve: true }).catch(() => undefined))?.realPath)
  }
  return settingsReachingBrain(settings, env, at, path => real.get(path)).length === 0
}

async function syncBrain($: EngineInterface, at: string): Promise<Backup> {
  if (!(await $.fs.exists(join(at, '.git')))) return { state: 'off', files: [] }
  if (!(await settingsAreSafe($, at))) return { state: 'off', files: [] }
  const already = await conflicted($, at)
  if (already.length > 0) return { state: 'conflict', files: already }
  await git($, at, ['add', '-A'])
  const status = await git($, at, ['status', '--porcelain'])
  if (status.stdout.trim()) await git($, at, ['commit', '--quiet', '-m', 'Team update'])
  if (!(await remoteIsPinned($, at))) return { state: 'off', files: [] }
  const pulled = await git($, at, ['pull', '--no-rebase', '--no-edit', '--quiet', 'origin', 'main'])
  if (pulled.exitCode !== 0) {
    const files = await conflicted($, at)
    return files.length > 0 ? { state: 'conflict', files } : { state: 'idle', files: [] }
  }
  const pushed = await git($, at, ['push', '--quiet', 'origin', 'HEAD:main'])
  return { state: pushed.exitCode === 0 ? 'saved' : 'idle', files: [] }
}

async function keepVersion($: EngineInterface, at: string, file: string, side: 'mine' | 'theirs'): Promise<Backup> {
  if (!(await settingsAreSafe($, at))) return { state: 'off', files: [] }
  // In a merge, "ours" is this computer's copy and "theirs" is the cloud's.
  await git($, at, ['checkout', side === 'mine' ? '--ours' : '--theirs', '--', file])
  await git($, at, ['add', '--', file])
  const left = await conflicted($, at)
  if (left.length > 0) return { state: 'conflict', files: left }
  await git($, at, ['commit', '--quiet', '--no-edit'])
  if (!(await remoteIsPinned($, at))) return { state: 'off', files: [] }
  const pushed = await git($, at, ['push', '--quiet', 'origin', 'HEAD:main'])
  return { state: pushed.exitCode === 0 ? 'saved' : 'idle', files: [] }
}

const setMember = async ($: EngineInterface, name: string, status: MemberStatus, line: string, force = false) => {
  const now = await $.clock.now()
  const last = lastLineAt.get(name) ?? 0
  if (!force && status === 'working' && now - last < 2000) return
  lastLineAt.set(name, now)
  await update($, membersA, (all: Record<string, MemberState>) => ({ ...all, [name]: { status, line, at: now } }))
}

const addFeed = async ($: EngineInterface, text: string) => {
  const time = clockTime(await $.clock.now())
  await update($, feedA, (lines: ChatLine[]) => [...lines, { time, text: capWords(text, CAPS.chat) }].slice(-20))
}

const refreshFiles = async ($: EngineInterface) => {
  if (!root) return
  const fresh = await readBrain($, root)
  if (fresh && brain && !brain.unhealthy) {
    brain = { ...fresh, setupDone: fresh.setupDone || brain.setupDone }
    await update($, brainA, () => brain)
  }
  const nowMs = await $.clock.now()
  const sends: Card[] = []
  for (const r of await readSendRecords($)) {
    const claimed = await $.fs.exists(join(root, `.handoff/locks/${lockName(r.id, r.attempt)}`)).catch(() => true)
    sends.push(recordToCard(r, nowMs, claimed))
  }
  const cards = [...sends, ...(await readNoteCards($, root))].sort((a, b) =>
    a.created.localeCompare(b.created),
  )
  await update($, cardsA, () => cards)
  const day = await readDay($, root, today(await $.clock.now()))
  await update($, chatA, () => day.chat)
  await update($, briefA, () => day.brief)
  if (lastCardCount >= 0 && cards.length > lastCardCount && (await read($, chimesA))) {
    void $.audio.play({ asset: 'assets/needs-you.wav' }).catch(() => undefined)
  }
  lastCardCount = cards.length
}

const refreshEnergy = async ($: EngineInterface) => {
  try {
    const usage = await $.session.usage()
    await update($, energyA, () => energyFrom(usage.rateLimits))
  } catch {
    // Energy is a nicety; the office works without it.
  }
}

const refreshAgents = async ($: EngineInterface) => {
  for (const agent of await $.agent.list()) {
    const name = agentToName.get(agent.id)
    if (!name) continue
    const status: MemberStatus =
      agent.status === 'running' || agent.status === 'pending'
        ? 'working'
        : agent.status === 'waiting'
          ? 'waiting'
          : agent.status === 'failed' || agent.status === 'killed'
            ? 'snag'
            : 'done'
    const current = (await read($, membersA))[name]
    if (!current || current.status !== status) {
      const line = status === 'done' ? STRINGS.line.allDone : status === 'snag' ? `${name} ${STRINGS.line.snag}` : current?.line ?? ''
      await setMember($, name, status, line, true)
    }
  }
}

const runBackup = async ($: EngineInterface) => {
  if (!root) return
  const before = await read($, backupA)
  if (before.state === 'saving') return
  await update($, backupA, (b: Backup): Backup => ({ ...b, state: 'saving' }))
  const result = await syncBrain($, root).catch((): Backup => ({ state: 'idle', files: [] }))
  await update($, backupA, () => result)
  await refreshFiles($)
}

// Holds an employee's message to a person as a card. Only this function writes
// a send record, and it writes it where no employee can reach.
const holdAsCard = async ($: EngineInterface, owner: string, target: McpTarget, adapter: Adapter, args: Record<string, unknown>) => {
  const now = await $.clock.now()
  const created = new Date(now).toISOString()
  const id = `${created.replace(/[^0-9]/g, '')}-${Math.random().toString(36).slice(2, 8)}`
  const note = join(root, `Team/Tasks/${created.slice(0, 10)}-held-${id.slice(-6)}.md`)
  const record: SendRecord = { id, server: target.server, tool: target.tool, adapter, args, owner, created, status: 'waiting', note, root, attempt: 1 }
  await $.store.set(`${CARD_PREFIX}${id}`, record)
  const view = cardView(target, adapter, args)
  const title = `${owner} wants to ${view.verb} ${view.recipients[0]?.value ?? view.subject}`
  await $.fs
    .write(note, mirrorNote({ id, owner, title, created, preview: previewText(target, adapter, args) }))
    .catch(() => undefined)
  await addFeed($, `${owner} → you: ${view.verb} ${view.recipients[0]?.value ?? view.subject}?`)
  void refreshFiles($).catch(() => undefined)
  $.ui.toast(STRINGS.toast.held)
}

// Locks are folders: creating one either succeeds once or fails, whichever
// session asks, and none is ever removed. Each try at sending has its own
// claim lock, and each try's outcome can be decided once (the settle lock).
const lockName = (id: string, attempt: number) => `${id}-a${attempt}`

const takeLock = async ($: EngineInterface, name: string): Promise<boolean> => {
  const dir = join(root, '.handoff/locks')
  await $.process.run(['mkdir', '-p', dir], { timeoutMs: 10_000 })
  const made = await $.process.run(['mkdir', join(dir, name)], { timeoutMs: 10_000 })
  return made.exitCode === 0
}

// The owner's approved connections as they are on disk now, so a removal takes
// effect at once. Unreadable settings approve nothing.
const approvedNow = async ($: EngineInterface): Promise<Record<string, Service>> =>
  (await readBrain($, root))?.connections ?? {}

// Whether the owner has turned on sending from Team View, as the brain says
// now; unreadable settings mean off.
const sendingOn = async ($: EngineInterface): Promise<boolean> => (await readBrain($, root))?.sendFromTeamView === true

// Starting from scratch. A new member opens their office in an empty folder;
// Team View offers to make the brain there from the template it carries.

// A folder with nothing in it but the Mac's own bookkeeping files, and the
// local settings Claude writes when a new folder is first opened.
const isEmptyFolder = async ($: EngineInterface, at: string): Promise<boolean> => {
  try {
    for (const entry of await $.fs.list(at)) {
      if (IGNORABLE.has(entry.name)) continue
      if (entry.name === '.claude' && entry.kind === 'dir' && !entry.isLink) {
        let plain = true
        for (const f of await $.fs.list(join(at, '.claude'))) {
          if (IGNORABLE.has(f.name)) continue
          const local = f.name === 'settings.local.json' && f.kind === 'file' && !f.isLink
          if (!local || !onlyMcpChoices(await $.fs.read(join(at, '.claude', f.name)))) plain = false
        }
        if (plain) continue
      }
      return false
    }
    return true
  } catch {
    return false
  }
}

const openPane = async ($: EngineInterface) => {
  if (!commandReady) {
    commandReady = true
    await $.command.register({ name: 'team', description: 'Open Team View' })
  }
  const opened = await $.ui.open({ id: PANE, title: STRINGS.heading.team })
  await update($, placedA, () => opened.isPlaced)
}

// Everything Team View does once it knows where the brain is.
const startOffice = async ($: EngineInterface, at: string) => {
  root = at
  offeredFolder = ''
  brain = (await readBrain($, root)) ?? UNHEALTHY
  await update($, brainA, () => brain)
  await update($, rootA, () => root)
  const stored = await $.store.get('handoff-team:chimes')
  await update($, chimesA, () => stored === true)
  const savedStep = await $.store.get(`handoff-team:setup:${root}`)
  await update($, setupA, () => (typeof savedStep === 'number' && savedStep >= 0 ? savedStep : 0))
  const members: Record<string, MemberState> = {}
  for (const employee of brain.employees) members[employee.name] = { status: 'resting', line: '', at: 0 }
  await update($, membersA, () => members)
  await openPane($)

  // The timers start once per load, however many times the office opens.
  if (!timersOn) {
    timersOn = true
    $.clock.every(2000, () => void refreshAgents($).catch(() => undefined))
    $.clock.every(20_000, () => void refreshFiles($).catch(() => undefined))
    $.clock.every(60_000, () => void refreshEnergy($))
    $.clock.every(60_000, () => void runBackup($).catch(() => undefined))
    $.clock.every(5000, () =>
      void $.ui
        .panes()
        .then(panes => update($, placedA, () => panes.some(p => p.id === PANE && p.isPlaced)))
        .catch(() => undefined),
    )
  }
  await refreshFiles($).catch(() => undefined)
  await refreshUpdate($).catch(() => undefined)
  void refreshEnergy($)
  void runBackup($).catch(() => undefined)
}

// Apple's git is a stand-in until Apple's free developer tools are installed,
// and asking it anything opens the installer, so ask xcode-select first.
const hasGit = async ($: EngineInterface): Promise<boolean> => {
  const mac = await $.process.run(['/usr/bin/xcode-select', '-p'], { timeoutMs: 10_000 }).catch(() => undefined)
  if (mac) return mac.exitCode === 0
  const any = await $.process.run(['git', '--version'], { timeoutMs: 10_000 }).catch(() => undefined)
  return any?.exitCode === 0
}

// A new brain starts its own history at once, so backup has something to save.
const gitStart = async ($: EngineInterface, at: string) => {
  if ((await $.fs.exists(join(at, '.git'))) || !(await hasGit($))) return
  await $.process.run(['git', 'init', '--quiet', '-b', 'main', at], { timeoutMs: 30_000 })
  await git($, at, ['add', '-A'])
  await git($, at, ['commit', '--quiet', '-m', 'Brain created'])
}

const makeBrain = async ($: EngineInterface, at: string, practice: boolean) => {
  if (making || root || !(await isEmptyFolder($, at))) return
  making = true
  try {
    const files = filled({ ...BASE, ...(practice ? PRACTICE : {}) }, today(await $.clock.now()))
    // Never overwrite a file that is already there.
    for (const [rel, text] of Object.entries(files)) if (!(await $.fs.exists(join(at, rel)))) await $.fs.write(join(at, rel), text)
    madeHere = true
    await update($, newFolderA, () => '')
    await startOffice($, at)
    await gitStart($, at).catch(() => undefined)
  } finally {
    making = false
  }
}

const openPage = async ($: EngineInterface, url: string) => {
  await $.process.run(['/usr/bin/open', url], { timeoutMs: 10_000 }).catch(() => undefined)
}

// GitHub's free helper signs the owner in and makes the private cloud copy.
const GH_PLACES = ['/opt/homebrew/bin/gh', '/usr/local/bin/gh']
const ghPath = async ($: EngineInterface): Promise<string> => {
  for (const place of GH_PLACES) if (await $.fs.exists(place)) return place
  const found = await $.process.run(['gh', '--version'], { timeoutMs: 10_000 }).catch(() => undefined)
  return found?.exitCode === 0 ? 'gh' : ''
}

const backupStage = async ($: EngineInterface): Promise<BackupFlow> => {
  if (brain?.backupRemote && (await remoteIsPinned($, root).catch(() => false))) return { stage: 'done', code: '' }
  if (!(await hasGit($))) return { stage: 'needGit', code: '' }
  const gh = await ghPath($)
  if (!gh) return { stage: 'needGh', code: '' }
  const status = await $.process.run([gh, 'auth', 'status', '--hostname', 'github.com'], { timeoutMs: 20_000 }).catch(() => undefined)
  return { stage: status?.exitCode === 0 ? 'makeCopy' : 'signIn', code: '' }
}

const checkBackup = async ($: EngineInterface) => {
  await update($, backupFlowA, (): BackupFlow => ({ stage: 'checking', code: '' }))
  const flow = await backupStage($)
  await update($, backupFlowA, () => flow)
}

// The helper prints a one-time code and opens GitHub's sign-in page; the
// owner pastes the code there. The code shows in Team View as it arrives.
const signIn = async ($: EngineInterface) => {
  const gh = await ghPath($)
  if (!gh) return checkBackup($)
  await update($, backupFlowA, (): BackupFlow => ({ stage: 'code', code: '' }))
  const login = $.process.spawn({ argv: [gh, 'auth', 'login', '--hostname', 'github.com', '--git-protocol', 'https', '--web'], input: '\n' })
  let seen = ''
  try {
    for await (const { text } of login) {
      seen += text
      const code = signInCode(seen)
      if (code) await update($, backupFlowA, (f: BackupFlow): BackupFlow => (f.code ? f : { stage: 'code', code }))
    }
  } catch {
    // A sign-in that ends early is checked again below.
  }
  await checkBackup($)
}

const makeCopy = async ($: EngineInterface) => {
  const gh = await ghPath($)
  if (!gh || !root) return checkBackup($)
  await update($, backupFlowA, (): BackupFlow => ({ stage: 'making', code: '' }))
  const failed = () => update($, backupFlowA, (): BackupFlow => ({ stage: 'failed', code: '' }))
  await gitStart($, root)
  // The same check as every save: only a brain with plain git settings.
  if (!(await settingsAreSafe($, root))) return failed()
  const origin = async () => {
    const out = await git($, root, ['remote', 'get-url', 'origin'])
    return out.exitCode === 0 ? out.stdout.trim() : ''
  }
  // A cloud copy someone set up before is never adopted here.
  if (await origin()) return failed()
  // git signs in to GitHub through the helper from now on.
  await $.process.run([gh, 'auth', 'setup-git', '--hostname', 'github.com'], { timeoutMs: 20_000 }).catch(() => undefined)
  const base = repoName(root)
  let created = ''
  for (const name of [base, `${base}-2`, `${base}-3`]) {
    await $.process
      .run([gh, 'repo', 'create', name, '--private', '--source', root, '--remote', 'origin', '--push'], { cwd: root, timeoutMs: 120_000 })
      .catch(() => undefined)
    if (await origin()) {
      created = name
      break
    }
  }
  const url = await origin()
  // Only the copy just made, on GitHub, is pinned.
  if (!created || !new RegExp(`^https://github\\.com/[A-Za-z0-9-]+/${created}(\\.git)?$`).test(url)) return failed()
  // The cloud copy is pinned: backup goes there and nowhere else.
  const path = join(root, MARKER)
  const raw = JSON.parse(await $.fs.read(path)) as Record<string, unknown>
  await $.fs.write(path, `${JSON.stringify({ ...raw, backupRemote: url }, null, 2)}\n`)
  brain = (await readBrain($, root)) ?? brain
  await update($, brainA, () => brain)
  await runBackup($)
  const saved = (await read($, backupA)).state === 'saved'
  await update($, backupFlowA, (): BackupFlow => ({ stage: saved ? 'done' : 'failed', code: '' }))
}

// Trainings the add-on ships; their files belong to Safety update.
const BUILT_IN_TRAININGS = new Set(
  Object.keys(BASE)
    .map(rel => /^\.claude\/skills\/([^/]+)\/SKILL\.md$/.exec(rel)?.[1])
    .filter((name): name is string => Boolean(name)),
)

// A brain keeps the files it was made with. When the add-on carries newer
// safety rules or trainings, Team View offers them; nothing changes until the
// owner taps Update.
const outdatedFiles = async ($: EngineInterface, at: string): Promise<string[]> => {
  const out: string[] = []
  for (const [rel, text] of Object.entries(BASE)) {
    if (!isSystemFile(rel)) continue
    const have = await $.fs.read(join(at, rel)).catch(() => null)
    if (have !== text) out.push(rel)
  }
  return out
}

const refreshUpdate = async ($: EngineInterface) => {
  if (!root || brain?.unhealthy) return
  const files = await outdatedFiles($, root)
  await update($, updateA, () => files)
}

// Where an update may write: the path itself inside the brain's real folder,
// with no link anywhere on the way (the nearest part that exists resolves to
// exactly where it sits).
const plainInsideBrain = async ($: EngineInterface, realRoot: string, rel: string): Promise<boolean> => {
  const parts = rel.split('/')
  for (let i = parts.length; i >= 1; i--) {
    const sub = parts.slice(0, i).join('/')
    const found = await $.fs.stat(join(root, sub), { resolve: true }).catch(() => undefined)
    if (found) return !found.isLink && found.realPath === join(realRoot, sub)
  }
  return true
}

const applyUpdate = async ($: EngineInterface) => {
  if (!root || brain?.unhealthy) return
  const realRoot = (await $.fs.stat(root, { resolve: true }).catch(() => undefined))?.realPath
  if (!realRoot) return
  for (const rel of await outdatedFiles($, root)) {
    const text = BASE[rel]
    if (text !== undefined && (await plainInsideBrain($, realRoot, rel))) await $.fs.write(join(root, rel), text)
  }
  madeHere = true
  await refreshUpdate($)
  await runBackup($)
}

// The shift runs in Anthropic's cloud on the cloud copy. Its steps go on the
// clipboard and the page for scheduled tasks opens.
const copyShift = async ($: EngineInterface) => {
  await $.process.run(['/usr/bin/pbcopy'], { stdin: SHIFT_PROMPT, timeoutMs: 10_000 }).catch(() => undefined)
  await openPage($, SCHEDULED_URL)
  await update($, openedA, () => 'shift')
}

// A send may go only through the connection the owner approved for its service.
const connectionStillApproved = (r: SendRecord, connections: Record<string, Service>) => {
  const service = connections[r.server]
  return (r.adapter === 'email' && service === 'gmail') || (r.adapter === 'event' && service === 'calendar')
}

const approveSend = async ($: EngineInterface, card: Card) => {
  if (inFlight.has(card.id)) return
  inFlight.add(card.id)
  try {
    await update($, sendingA, () => card.id)
    const key = `${CARD_PREFIX}${card.id}`
    const record = (await $.store.get(key)) as SendRecord | undefined
    if (!record || record.status !== 'waiting' || record.root !== root || record.attempt !== card.attempt) return
    // The record must still match exactly what the card showed.
    if (stableJson(record.args) !== stableJson(card.args) || record.tool !== card.tool || record.server !== card.server) return
    if (!connectionStillApproved(record, await approvedNow($))) return
    const view = cardView({ server: record.server, tool: record.tool }, record.adapter, record.args)
    if (!view.canSend) return
    // Sending must still be on when the owner taps, as the brain says now.
    if (!(await sendingOn($))) return
    if (!(await takeLock($, lockName(record.id, record.attempt)))) return
    await $.store.set(key, { ...record, status: 'sending', claimedAt: await $.clock.now() })
    const stamp = new Date(await $.clock.now()).toISOString()
    let outcome: SendRecord['status']
    try {
      const result = await $.mcp.call(record.server, record.tool, record.args)
      // An error answer does not prove nothing went out, so the owner checks.
      outcome = result.isError ? 'unknown' : 'sent'
    } catch {
      outcome = 'unknown'
    }
    // The answer counts only if no session settled this try while it was out.
    if (!(await takeLock($, `${lockName(record.id, record.attempt)}.done`))) {
      $.ui.toast(STRINGS.toast.unsure)
      return
    }
    await $.store.set(key, { ...record, status: outcome })
    await setNoteStatus($, record.note, outcome === 'sent' ? 'Done' : 'Needs you', { last_try: stamp })
    if (outcome === 'sent') {
      const now = await $.clock.now()
      await appendChat($, root, today(now), chatEntry(clockTime(now), `${STRINGS.line.youApproved} ${cardTitle(card)}`))
      $.ui.toast(STRINGS.toast.sent)
    } else {
      $.ui.toast(STRINGS.toast.unsure)
    }
  } finally {
    inFlight.delete(card.id)
    await update($, sendingA, () => '')
    await refreshFiles($)
  }
}

// The owner's answer about one try, or "Not now". Each acts only on the try
// the card showed, and only once: a stale button in another session changes
// nothing.
const settleSend = async ($: EngineInterface, card: Card, decision: 'sent' | 'retry' | 'dismissed') => {
  const key = `${CARD_PREFIX}${card.id}`
  const record = (await $.store.get(key)) as SendRecord | undefined
  if (!record || record.root !== root || record.attempt !== card.attempt) return
  if (decision === 'dismissed') {
    // Taking this try's claim lock means no session can be sending it.
    if (record.status !== 'waiting' || !(await takeLock($, lockName(record.id, record.attempt)))) return
    await $.store.set(key, { ...record, status: 'dismissed' })
    await setNoteStatus($, record.note, 'To do')
    await refreshFiles($)
    return
  }
  const claimed = await $.fs.exists(join(root, `.handoff/locks/${lockName(record.id, record.attempt)}`))
  if (shownStatus(record, await $.clock.now(), claimed) !== 'unknown') return
  // A try that never recorded its answer may still answer: claim its answer
  // first, so a late one is dropped instead of overwriting this decision.
  if (record.status !== 'unknown' && !(await takeLock($, `${lockName(record.id, record.attempt)}.done`))) return
  if (!(await takeLock($, `${lockName(record.id, record.attempt)}.settled`))) return
  if (decision === 'sent') {
    await $.store.set(key, { ...record, status: 'sent' })
    await setNoteStatus($, record.note, 'Done')
  } else {
    // "It didn't send": a new try, with its own lock, can be sent once.
    await $.store.set(key, { ...record, status: 'waiting', attempt: record.attempt + 1, claimedAt: undefined })
    await setNoteStatus($, record.note, 'Needs you')
  }
  await refreshFiles($)
}

// Approving connections: Team View lists what each connected app is, the owner
// taps "Use these", and only then may employees use them.
const mcpToolNames = async ($: EngineInterface): Promise<string[]> =>
  (await $.tool.list().catch(() => [])).filter(t => t.mcp).map(t => t.name)
const detectedConnections = async ($: EngineInterface): Promise<Record<string, Service>> => detectServices(await mcpToolNames($))

// Approves only the list the owner saw. If the apps changed since, nothing is
// approved and Team View shows the new list.
const approveConnections = async ($: EngineInterface, shown: Record<string, Service>) => {
  const found = await detectedConnections($)
  if (Object.keys(found).length === 0 || stableJson(found) !== stableJson(shown)) return
  const path = join(root, MARKER)
  const raw = JSON.parse(await $.fs.read(path)) as Record<string, unknown>
  await $.fs.write(path, `${JSON.stringify({ ...raw, connections: found }, null, 2)}\n`)
  brain = (await readBrain($, root)) ?? brain
  await update($, brainA, () => brain)
}

// A training the Chief drafted, added on the owner's tap: the steps exactly as
// the card showed them, under a name that is not a built-in training.
const approveTraining = async ($: EngineInterface, card: Card) => {
  const name = card.name ?? ''
  if (!root || !/^[a-z0-9][a-z0-9-]{1,40}$/.test(name) || BUILT_IN_TRAININGS.has(name)) return
  const current = parseCard(card.path, await $.fs.read(card.path))
  if (!current || current.kind !== 'training' || current.name !== name || current.summary !== card.summary || current.title !== card.title) return
  const realRoot = (await $.fs.stat(root, { resolve: true }).catch(() => undefined))?.realPath
  if (!realRoot) return
  const description = card.title.replace(/[\r\n]+/g, ' ').trim() || name
  const text = `---\nname: ${name}\ndescription: ${JSON.stringify(description)}\n---\n${card.summary.trim()}\n`
  for (const rel of [`.claude/skills/${name}/SKILL.md`, `Trainings/${name}/SKILL.md`]) {
    if (!(await plainInsideBrain($, realRoot, rel))) return
  }
  for (const rel of [`.claude/skills/${name}/SKILL.md`, `Trainings/${name}/SKILL.md`]) await $.fs.write(join(root, rel), text)
  await setNoteStatus($, card.path, 'Done')
  await refreshFiles($)
}

const hireName = (card: Card) => (card.name ?? '').replace(/[^A-Za-z0-9 -]/g, '').trim()
const nameTaken = (name: string) =>
  Boolean(brain?.employees.some(e => e.name.toLowerCase() === name.toLowerCase() || e.id === name.toLowerCase().replace(/\s+/g, '-')))

const approveHire = async ($: EngineInterface, card: Card) => {
  if (!card.name || !brain) return
  const name = hireName(card)
  if (!name || nameTaken(name)) return
  // The proposal must be unchanged since the owner read it: name, role and page.
  const current = parseCard(card.path, await $.fs.read(card.path))
  if (!current || current.kind !== 'hire' || current.name !== card.name || current.summary !== card.summary || current.title !== card.title) return
  const id = name.toLowerCase().replace(/\s+/g, '-')
  const page = join(root, `Team/${name}.md`)
  const stub = join(root, `.claude/agents/${id}.md`)
  // Never adopt or overwrite a page or job card that is already there.
  if ((await $.fs.exists(page)) || (await $.fs.exists(stub))) return
  if (!(await takeLock($, `hire-${id}`))) return
  await $.fs.write(page, `${card.summary.trim()}\n`)
  const memory = join(root, `Team/Memory/${name}.md`)
  if (!(await $.fs.exists(memory))) await $.fs.write(memory, `# What ${name} has learned\n\n`)
  const markerPath = join(root, MARKER)
  const raw = JSON.parse(await $.fs.read(markerPath)) as { employees?: { id: string; name: string; role: string }[] }
  const employees = raw.employees ?? []
  employees.push({ id, name, role: card.title })
  await $.fs.write(markerPath, `${JSON.stringify({ ...raw, employees }, null, 2)}\n`)
  await $.fs.write(
    stub,
    [
      '---',
      `name: ${id}`,
      `description: ${name} on the owner's AI team. Use when the Chief hands off ${name} work.`,
      'model: sonnet',
      '---',
      `You are ${name} on the owner's AI team.`,
      `1. Read \`Team/${name}.md\` (your job page) and \`Team/Memory/${name}.md\` before anything else, and follow the rules in \`CLAUDE.md\`.`,
      '2. Do only the task the Chief gave you. Draft, never send.',
      `3. Add short plain chat lines to today's note in \`Team/Chat/\` under \`## Chat\`.`,
      '4. Anything that would reach a person outside the business becomes a task note with `status: Needs you`.',
      '5. Finish with a two-line summary for the Chief.',
      '',
    ].join('\n'),
  )
  await setNoteStatus($, card.path, 'Done')
  brain = await readBrain($, root)
  await update($, brainA, () => brain)
  await refreshFiles($)
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    let cwd = ''
    let found = ''
    try {
      cwd = await $.session.cwd()
      found = await findBrainRoot($, cwd)
      initFailed = false
    } catch {
      initFailed = true
      return next(e)
    }
    if (found) {
      await startOffice($, found)
      return next(e)
    }
    // An empty folder is where a new member starts: offer to make the brain.
    if (await isEmptyFolder($, cwd)) {
      offeredFolder = cwd
      await update($, newFolderA, () => cwd)
      await openPane($)
    }
    return next(e)
  })

  // A brain made during this session: its instructions were not loaded at the
  // start, so the Chief is told to read them first.
  on('prompt.compose', async ($, e, next) => {
    const result = await next(e)
    if (!root || !madeHere) return result
    return { sections: [...result.sections, { id: 'handoff-team:new-brain', text: NEW_BRAIN_NOTE, scope: 'session' as const }] }
  })

  on('command.run', { command: 'team' }, async $ => {
    const opened = await $.ui.open({ id: PANE, title: STRINGS.heading.team })
    await update($, placedA, () => opened.isPlaced)
    return { text: STRINGS.heading.team }
  })

  // One hook for every tool call: the live activity line, then the gate. In a
  // brain folder an employee may read, write working notes, write drafts and
  // hand work on. A known message to a person becomes a card; all else is held.
  on('tool.call', async ($, e, next) => {
    if (!root) {
      if (offeredFolder) return READ_ONLY.includes(e.tool) ? next(e) : { deny: STRINGS.line.heldSetup }
      return initFailed && !READ_ONLY.includes(e.tool) ? { deny: STRINGS.line.heldNoCard } : next(e)
    }
    const who = e.agentId ? (agentToName.get(e.agentId) ?? 'A helper') : chiefName()
    if (e.tool_use_id) toolToName.set(e.tool_use_id, who)
    if (!e.agentId) teamWorked = true
    await setMember($, who, 'working', activityLine(who, activityFor(e.tool, e))).catch(() => undefined)

    const input = argsOf(e as unknown as Record<string, unknown>)
    const verdict = classify(e.tool, input, root, e.tool.startsWith('mcp__') ? await approvedNow($) : {})
    if (verdict.kind === 'deny') return { deny: DENY_TEXT[verdict.reason] }
    // Unless the owner turned on sending from Team View, a message to a person
    // is never held for a Send button: it becomes a draft the owner sends.
    if (verdict.kind === 'card' && !(await sendingOn($))) return { deny: STRINGS.line.heldDraft }
    if (verdict.kind === 'allow') {
      const path = input.file_path ?? input.notebook_path
      if (isWriteTool(e.tool) && typeof path === 'string') {
        // Check where the write really lands, links followed, against the
        // brain's own real location.
        const real = await placed($, path)
        const realRoot = (await $.fs.stat(root, { resolve: true }).catch(() => undefined))?.realPath
        if (!real || !realRoot || !isWorkingNote(realRoot, real)) return { deny: DENY_TEXT.protected }
      }
      return next(e)
    }
    try {
      await holdAsCard($, who, verdict.target, verdict.adapter, input)
      return { deny: STRINGS.line.heldSend }
    } catch {
      return { deny: STRINGS.line.heldNoCard }
    }
  }).catch(($, e, next) => {
    if (next.called) return next(e)
    // Fail closed: when the gate itself failed, only plain reading goes on.
    return READ_ONLY.includes(e.tool) ? next(e) : { deny: STRINGS.line.heldNoCard }
  })

  on('agent.spawn', async ($, e, next) => {
    const result = await next(e)
    if (!root || result.deny !== undefined || !result.agentId) return result
    const listed = (await $.agent.list()).find(a => a.id === result.agentId)
    const known = brain?.employees.find(emp => emp.name.toLowerCase() === (listed?.name ?? '').toLowerCase())
    const name = known?.name ?? listed?.name ?? capWords(e.description, 2)
    agentToName.set(result.agentId, name)
    teamWorked = true
    const from = e.parentAgentId ? (agentToName.get(e.parentAgentId) ?? chiefName()) : chiefName()
    await addFeed($, `${from} → ${name}: ${e.description}`)
    await setMember($, name, 'working', capWords(`${name} is starting: ${e.description}`, CAPS.activity), true)
    return result
  }).catch(($, e, next) => next(e))

  on('session.send', async ($, e, next) => {
    if (root) {
      const from = e.agentId ? (agentToName.get(e.agentId) ?? 'A helper') : chiefName()
      await addFeed($, `${from} → ${e.to}: ${e.text}`)
    }
    return next(e)
  }).catch(($, e, next) => next(e))

  on('turn.start', async ($, e, next) => {
    if (root && !e.agentId) {
      mainTurnId = e.turnId
      teamWorked = false
      await setMember($, chiefName(), 'working', `${chiefName()} ${STRINGS.line.readingMessage}`, true)
    }
    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    const result = await next(e)
    if (!root || e.agentId) return result
    mainTurnId = ''
    const status: MemberStatus = e.reason === 'error' ? 'snag' : 'done'
    await setMember($, chiefName(), status, status === 'snag' ? `${chiefName()} ${STRINGS.line.snag}` : STRINGS.line.allDone, true)
    if (teamWorked && (await read($, chimesA))) void $.audio.play({ asset: 'assets/all-done.wav' }).catch(() => undefined)
    void refreshFiles($).catch(() => undefined)
    void runBackup($).catch(() => undefined)
    return result
  })

  // Friendly Mode: Claude's own screen in the same plain words.
  on('ui.render', { component: 'Spinner' }, async ($, e, next) => {
    if (!root) return next(e)
    const members = await read($, membersA)
    const chief = members[chiefName()]
    const line = chief?.status === 'working' && chief.line ? chief.line : `${chiefName()} ${STRINGS.line.readingMessage}`
    return next({ ...e, props: { ...e.props, word: capWords(line, CAPS.spinner), message: null, suffix: '' } })
  })

  on('ui.render', { component: 'PromptHint' }, async ($, e, next) => {
    if (!root || e.props.isDraft) return next(e)
    return next({ ...e, props: { ...e.props, hint: STRINGS.line.promptHint } })
  })

  on('ui.render', { component: 'ToolUse' }, async ($, e, next) => {
    if (!root) return next(e)
    const { Box, Text } = $.ui.resolve(e)
    const who = toolToName.get(e.props.tool_use_id) ?? chiefName()
    const line = activityLine(who, activityFor(e.props.tool, e.props.input))
    return (
      <Box>
        <Text dimColor={!e.props.isRunning}>{line}</Text>
        {e.props.isErrored && <Text color="inactive"> · {STRINGS.status.snag}</Text>}
      </Box>
    )
  })

  on('ui.render', { component: 'ToolResult' }, async ($, e, next) => {
    if (!root) return next(e)
    const { Box } = $.ui.resolve(e)
    return <Box />
  })

  // The band: a one-line team summary when the side pane has no room.
  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (!root || e.props.hasSurvey || (await read($, placedA))) return next(e)
    const { Box, Text, Button } = $.ui.resolve(e)
    const members = Object.values(await read($, membersA))
    const working = members.filter(m => m.status === 'working').length
    const waiting = (await read($, cardsA)).length
    return (
      <Box gap={1}>
        <Text>
          {STRINGS.heading.team}: {working} working · {waiting} {STRINGS.heading.needsYou.toLowerCase()}
        </Text>
        <Button
          key="open-team"
          label={STRINGS.button.open}
          onPress={async () => {
            const opened = await $.ui.open({ id: PANE, title: STRINGS.heading.team })
            await update($, placedA, () => opened.isPlaced)
          }}
        />
      </Box>
    )
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text, Button } = $.ui.resolve(e)
    const info = await read($, brainA)
    if (!info) {
      const fresh = await read($, newFolderA)
      if (!fresh) return <Text dimColor>{STRINGS.line.resting}</Text>
      return (
        <Box flexDirection="column" gap={1} paddingX={1}>
          <Text bold>{STRINGS.start.title}</Text>
          <Text>{STRINGS.start.body}</Text>
          <Box gap={1}>
            <Button key="make-brain" label={STRINGS.start.make} variant="primary" onPress={() => makeBrain($, fresh, false)} />
            <Button key="practice-brain" label={STRINGS.start.practice} onPress={() => makeBrain($, fresh, true)} />
          </Box>
        </Box>
      )
    }
    const members = await read($, membersA)
    const cards = await read($, cardsA)
    const chat = [...(await read($, chatA)), ...(await read($, feedA))]
    const seen = new Set<string>()
    const lines = chat.filter(l => (seen.has(l.text) ? false : (seen.add(l.text), true))).slice(-5)
    const energy = await read($, energyA)
    const backup = await read($, backupA)
    const conflictFile = backup.files[0] ?? ''
    const showAll = await read($, showAllA)
    const sending = await read($, sendingA)
    const expanded = await read($, expandedA)
    const brief = await read($, briefA)
    const step = await read($, setupA)
    const anyWorking = Object.values(members).some(m => m.status === 'working')
    const toolNames = Object.keys(info.connections).length === 0 ? await mcpToolNames($) : []
    const found = detectServices(toolNames)
    const doubled = doubledServices(toolNames)
    const roster = showAll ? info.employees : info.employees.slice(0, 4)
    const pending = await read($, updateA)

    const setupScreen = !info.setupDone && STRINGS.setup[step]
    if (setupScreen) {
      const dots = STRINGS.setup.map((_, i) => (i <= step ? '●' : '○')).join(' ')
      // Setup picks up where the owner left off, in this brain, next time too.
      const nextStep = async () => {
        await update($, setupA, (n: number) => n + 1)
        await $.store.set(`handoff-team:setup:${root}`, step + 1)
      }
      const opened = await read($, openedA)
      const flow = await read($, backupFlowA)
      // What this step shows now, what its main button does, and whether it
      // can wait for later.
      let shown: { title: string; body: string; button: string } = setupScreen
      let go: () => Promise<unknown> = nextStep
      let canWait = false
      let listed: Record<string, Service> = {}
      await read($, appsCheckA)
      if (setupScreen.id === 'welcome') {
        go = async () => {
          await nextStep()
          void checkBackup($).catch(() => undefined)
        }
      } else if (setupScreen.id === 'backup') {
        shown = STRINGS.backup[flow.stage]
        canWait = flow.stage !== 'done'
        if (flow.stage === 'done') go = nextStep
        else if (flow.stage === 'needGit')
          go = async () => {
            await $.process.run(['/usr/bin/xcode-select', '--install'], { timeoutMs: 10_000 }).catch(() => undefined)
            await update($, backupFlowA, (): BackupFlow => ({ stage: 'checking', code: '' }))
          }
        else if (flow.stage === 'needGh')
          go = async () => {
            await openPage($, GH_DOWNLOAD_URL)
            await update($, backupFlowA, (): BackupFlow => ({ stage: 'checking', code: '' }))
          }
        else if (flow.stage === 'signIn') go = async () => void signIn($).catch(() => undefined)
        else if (flow.stage === 'makeCopy') go = async () => void makeCopy($).catch(() => undefined)
        else go = () => checkBackup($)
      } else if (setupScreen.id === 'apps') {
        // Approved already: move on. Found: the owner OKs exactly what is
        // listed. Otherwise open claude.ai's connections page, then check.
        if (Object.keys(info.connections).length > 0) shown = STRINGS.after.appsReady
        else if (Object.keys(found).length > 0) {
          shown = STRINGS.after.appsFound
          listed = found
          canWait = true
          go = async () => {
            await approveConnections($, found)
            await nextStep()
          }
        } else if (opened === 'apps') {
          shown = STRINGS.after.apps
          canWait = true
          go = () => update($, appsCheckA, (n: number) => n + 1)
        } else
          go = async () => {
            await openPage($, CONNECTORS_URL)
            await update($, openedA, () => 'apps')
          }
      } else if (setupScreen.id === 'interview') {
        go = async () => {
          await $.prompt.submit({ text: STRINGS.ask.interview, asUser: true })
          await nextStep()
        }
      } else if (setupScreen.id === 'brief') {
        go = async () => {
          await $.prompt.submit({ text: STRINGS.ask.brief, asUser: true })
          await nextStep()
        }
      } else if (setupScreen.id === 'shift') {
        canWait = opened !== 'shift'
        if (opened === 'shift') shown = STRINGS.after.shift
        else go = () => copyShift($)
      } else if (setupScreen.id === 'chimes') {
        go = async () => {
          await $.store.set('handoff-team:chimes', true)
          await update($, chimesA, () => true)
          await nextStep()
        }
      } else if (setupScreen.id === 'done') {
        go = async () => {
          const path = join(root, MARKER)
          const raw = JSON.parse(await $.fs.read(path)) as Record<string, unknown>
          await $.fs.write(path, `${JSON.stringify({ ...raw, setupDone: true }, null, 2)}\n`)
          brain = { ...info, setupDone: true }
          await update($, brainA, () => brain)
        }
      }
      return (
        <Box flexDirection="column" gap={1} paddingX={1}>
          <Text dimColor>{dots}</Text>
          <Text bold>{shown.title}</Text>
          <Text>{shown.body}</Text>
          {Object.entries(listed).map(([server, service]) => (
            <Text key={`listed-${server}`}>
              {SERVICE_NAME[service]} <Text dimColor>({server.slice(0, 12)})</Text>
            </Text>
          ))}
          {setupScreen.id === 'apps' &&
            doubled.map(svc => (
              <Text key={`twice-setup-${svc}`} color="warning">
                {SERVICE_NAME[svc]} {STRINGS.line.doubled}
              </Text>
            ))}
          {setupScreen.id === 'backup' && flow.stage === 'code' && flow.code && (
            <Text bold color="claude">
              {flow.code}
            </Text>
          )}
          <Box gap={1}>
            <Button key="setup-go" label={shown.button} variant="primary" onPress={go} />
            {setupScreen.id === 'chimes' && <Button key="setup-no" label={STRINGS.button.no} onPress={nextStep} />}
            {canWait && <Button key="setup-later" label={STRINGS.button.later} onPress={nextStep} />}
          </Box>
        </Box>
      )
    }

    const choose = async (file: string, side: 'mine' | 'theirs') => {
      await update($, backupA, (): Backup => ({ state: 'saving', files: [] }))
      const result = await keepVersion($, root, file, side).catch((): Backup => ({ state: 'conflict', files: [file] }))
      await update($, backupA, () => result)
      await refreshFiles($)
    }

    const settleNote = async (card: Card, status: string) => {
      await setNoteStatus($, card.path, status)
      await refreshFiles($)
    }

    const edit = async (card: Card) => {
      await $.prompt.fill({ text: `Tell ${card.owner} what to change about "${cardTitle(card)}": `, mode: 'replace' })
    }

    const sendCard = (card: Card, i: number) => {
      const view = viewOf(card)
      if (!view) return null
      const isOpen = expanded === card.id
      const short = capWords(view.body, CAPS.cardBody)
      // Send appears only once the owner can see every word that would go out.
      const allShown = isOpen || view.body === short
      return (
        <Box key={`card-${i}`} flexDirection="column" borderStyle="round" borderColor="warning" paddingX={1}>
          <Text bold>{cardTitle(card)}</Text>
          {view.recipients.map((r, j) => (
            <Text key={`r-${i}-${j}`}>
              <Text dimColor>{r.label}: </Text>
              {r.value}
            </Text>
          ))}
          {view.subject && <Text bold>{view.subject}</Text>}
          {view.details.map((dt, j) => (
            <Text key={`d-${i}-${j}`} dimColor>
              {dt.label}: {dt.value}
            </Text>
          ))}
          {view.body && <Text>{isOpen ? view.body : short}</Text>}
          {view.body !== short && (
            <Button
              key={`more-${i}`}
              plain
              label={isOpen ? STRINGS.button.showLess : STRINGS.button.showAll}
              onPress={() => update($, expandedA, () => (isOpen ? '' : card.id))}
            />
          )}
          <Text dimColor>Goes to: {view.goesTo}</Text>
          {!view.canSend && <Text color="warning">{STRINGS.line.cantShow}</Text>}
          {view.canSend && info.sendFromTeamView === true && card.status === 'waiting' && !allShown && <Text dimColor>{STRINGS.line.readAll}</Text>}
          {info.sendFromTeamView !== true && card.status === 'waiting' && <Text dimColor>{STRINGS.line.sendOff}</Text>}
          {card.status === 'unknown' && <Text color="inactive">{STRINGS.toast.unsure}</Text>}
          <Box gap={1}>
            {card.status === 'unknown' ? (
              <>
                <Button key={`sent-${i}`} label={STRINGS.button.itSent} variant="primary" onPress={() => settleSend($, card, 'sent')} />
                <Button key={`notsent-${i}`} label={STRINGS.button.didntSend} onPress={() => settleSend($, card, 'retry')} />
              </>
            ) : (
              view.canSend &&
              info.sendFromTeamView === true &&
              card.status === 'waiting' &&
              allShown && (
                <Button
                  key={`send-${i}`}
                  label={sending === card.id ? STRINGS.button.sending : STRINGS.button.send}
                  variant="primary"
                  onPress={() => approveSend($, card)}
                />
              )
            )}
            <Button key={`edit-${i}`} label={STRINGS.button.edit} onPress={() => edit(card)} />
            <Button key={`later-${i}`} label={STRINGS.button.notNow} onPress={() => settleSend($, card, 'dismissed')} />
          </Box>
        </Box>
      )
    }

    const noteCard = (card: Card, i: number) => {
      const isHire = card.kind === 'hire'
      const isTraining = card.kind === 'training'
      const name = isHire ? hireName(card) : isTraining ? (card.name ?? '') : ''
      const taken = (isHire && nameTaken(name)) || (isTraining && BUILT_IN_TRAININGS.has(name))
      // A training is added only once the owner can see every step.
      const seenAll = expanded === card.id || card.summary === capWords(card.summary, CAPS.cardBody)
      return (
        <Box key={`card-${i}`} flexDirection="column" borderStyle="round" borderColor="warning" paddingX={1}>
          <Text bold>
            {isHire ? capWords(`Hire ${name}?`, CAPS.cardTitle) : isTraining ? capWords(`Add training ${name}?`, CAPS.cardTitle) : capWords(card.title, CAPS.cardTitle)}
          </Text>
          {(isHire || isTraining) && <Text dimColor>{capWords(card.title, CAPS.chat)}</Text>}
          {isTraining && <Text>{STRINGS.line.trainingAdds}</Text>}
          {isHire && (
            <Text>
              {STRINGS.line.hireAdds} {name}.
            </Text>
          )}
          <Text>{expanded === card.id ? card.summary : capWords(card.summary, CAPS.cardBody)}</Text>
          {card.summary !== capWords(card.summary, CAPS.cardBody) && (
            <Button
              key={`more-${i}`}
              plain
              label={expanded === card.id ? STRINGS.button.showLess : STRINGS.button.showAll}
              onPress={() => update($, expandedA, () => (expanded === card.id ? '' : card.id))}
            />
          )}
          {card.why && <Text dimColor>Why: {capWords(card.why, CAPS.chat)}</Text>}
          {taken && <Text color="warning">{isTraining ? STRINGS.line.builtInName : STRINGS.line.nameTaken}</Text>}
          {isTraining && !taken && !seenAll && <Text dimColor>{STRINGS.line.readAllAdd}</Text>}
          <Box gap={1}>
            {!taken && (!isTraining || seenAll) && (
              <Button
                key={`ok-${i}`}
                label={isHire ? STRINGS.button.looksGoodHire : isTraining ? STRINGS.button.addTraining : STRINGS.button.looksGood}
                variant="primary"
                onPress={() => (isHire ? approveHire($, card) : isTraining ? approveTraining($, card) : settleNote(card, 'Done'))}
              />
            )}
            <Button key={`edit-${i}`} label={STRINGS.button.edit} onPress={() => edit(card)} />
            <Button key={`later-${i}`} label={STRINGS.button.notNow} onPress={() => settleNote(card, 'To do')} />
          </Box>
        </Box>
      )
    }

    return (
      <Box flexDirection="column" gap={1} paddingX={1}>
        <Box justifyContent="space-between">
          <Text bold>{STRINGS.heading.team}</Text>
          <Text dimColor>{energyText(energy)}</Text>
        </Box>

        {info.unhealthy && <Text color="warning">{STRINGS.line.unhealthy}</Text>}

        {pending.length > 0 && (
          <Box key="update" flexDirection="column" borderStyle="round" borderColor="claude" paddingX={1}>
            <Text bold>{STRINGS.update.title}</Text>
            <Text>{STRINGS.update.body}</Text>
            <Button key="update-brain" label={STRINGS.update.button} variant="primary" onPress={() => applyUpdate($)} />
          </Box>
        )}

        {!info.unhealthy && Object.keys(info.connections).length === 0 && (
          <Box key="apps" flexDirection="column" borderStyle="round" borderColor="warning" paddingX={1}>
            <Text bold>{STRINGS.heading.apps}</Text>
            {doubled.map(svc => (
              <Text key={`twice-${svc}`} color="warning">
                {SERVICE_NAME[svc]} {STRINGS.line.doubled}
              </Text>
            ))}
            {Object.keys(found).length === 0 ? (
              doubled.length === 0 && <Text>{STRINGS.line.noApps}</Text>
            ) : (
              <Box flexDirection="column">
                <Text>{STRINGS.line.appsFound}</Text>
                {Object.entries(found).map(([server, service]) => (
                  <Text key={`app-${server}`}>
                    {SERVICE_NAME[service]} <Text dimColor>({server.slice(0, 12)})</Text>
                  </Text>
                ))}
                <Button key="use-apps" label={STRINGS.button.useThese} variant="primary" onPress={() => approveConnections($, found)} />
              </Box>
            )}
          </Box>
        )}

        {backup.state === 'conflict' && conflictFile && (
          <Box key="two-versions" flexDirection="column" borderStyle="round" borderColor="warning" paddingX={1}>
            <Text>
              {STRINGS.line.twoVersions} {conflictFile.replace(/\.md$/, '').split('/').pop()}
            </Text>
            <Box gap={1}>
              <Button key="keep-mine" label={STRINGS.button.keepMine} onPress={() => choose(conflictFile, 'mine')} />
              <Button key="keep-theirs" label={STRINGS.button.keepTeams} onPress={() => choose(conflictFile, 'theirs')} />
            </Box>
          </Box>
        )}

        <Box flexDirection="column">
          {roster.map(emp => {
            const m = members[emp.name] ?? { status: 'resting' as const, line: '', at: 0 }
            return (
              <Box key={`m-${emp.id}`} gap={1}>
                <Text color={STATUS_COLOR[m.status]}>●</Text>
                <Text bold>{emp.name}</Text>
                <Text dimColor wrap="truncate-end">
                  {m.status === 'working' ? m.line : STRINGS.status[m.status]}
                </Text>
              </Box>
            )
          })}
          {info.employees.length > 4 && (
            <Button
              key="show-all"
              plain
              label={showAll ? STRINGS.button.showLess : STRINGS.button.showAll}
              onPress={() => update($, showAllA, (v: boolean) => !v)}
            />
          )}
        </Box>

        <Box flexDirection="column" gap={1}>
          <Text bold>{STRINGS.heading.needsYou}</Text>
          {cards.length === 0 && <Text dimColor>{STRINGS.line.resting}</Text>}
          {cards.slice(0, 3).map((card, i) => (card.kind === 'send' ? sendCard(card, i) : noteCard(card, i)))}
          {cards.length > 3 && (
            <Text dimColor>
              {cards.length - 3} {STRINGS.line.moreWaiting}
            </Text>
          )}
        </Box>

        <Box flexDirection="column">
          <Text bold>{STRINGS.heading.chat}</Text>
          {lines.length === 0 && <Text dimColor>{STRINGS.line.noChat}</Text>}
          {lines.map((l, i) => (
            <Text key={`c-${i}`} wrap="truncate-end">
              <Text dimColor>{l.time} </Text>
              {capWords(l.text, CAPS.chat)}
            </Text>
          ))}
        </Box>

        <Box gap={1}>
          {anyWorking && mainTurnId ? (
            <Button key="main" label={STRINGS.button.stop} variant="primary" onPress={() => $.turn.abort({ turnId: mainTurnId })} />
          ) : (
            <Button
              key="main"
              label={STRINGS.button.catchMeUp}
              variant="primary"
              onPress={() => $.prompt.submit({ text: STRINGS.ask.catchMeUp, asUser: true })}
            />
          )}
          {brief && (
            <Button key="brief" label={STRINGS.button.readBrief} onPress={() => $.audio.speak(brief.slice(0, 4000)).then(() => undefined)} />
          )}
        </Box>
      </Box>
    )
  })
}

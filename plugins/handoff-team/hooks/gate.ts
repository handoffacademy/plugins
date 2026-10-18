// What an employee may do in a brain folder: an exact allowlist. Employees
// read the brain and a reviewed list of tools on connections the owner
// approved, write drafts and working notes, and hand work on. Two reviewed
// actions (a new email, a new calendar event) become cards the owner approves;
// everything else is held. Tool names are matched exactly on the connection
// the owner approved for that service (in the desktop app a connection's name
// is an opaque id), never guessed from their words. Pure functions.

import type { Service } from '../types'

export type McpTarget = { server: string; tool: string }

export function mcpTarget(tool: string): McpTarget | null {
  const match = /^mcp__(.+?)__(.+)$/.exec(tool)
  return match?.[1] && match[2] ? { server: match[1], tool: match[2] } : null
}

export type Adapter = 'email' | 'event'

// Reviewed tools per service. Reads and drafts run; cards wait for the owner.
export const SERVICES: Record<Service, { reads: string[]; drafts: string[]; cards: Record<string, Adapter> }> = {
  gmail: {
    reads: ['search_threads', 'get_thread', 'get_message', 'list_drafts', 'get_draft', 'list_labels'],
    drafts: ['create_draft', 'update_draft'],
    cards: { send_message: 'email' },
  },
  calendar: {
    reads: ['list_events', 'get_event', 'search_events', 'list_calendars', 'suggest_time'],
    drafts: [],
    cards: { create_event: 'event' },
  },
  notion: { reads: ['notion-search', 'notion-fetch'], drafts: [], cards: {} },
}

// Which service a connection is, judged from the tools it offers. Team View
// shows the guess and the owner approves it; nothing is bound by the guess alone.
const SIGNATURE: Record<Service, string[]> = {
  gmail: ['search_threads', 'send_message', 'create_draft'],
  calendar: ['list_events', 'create_event'],
  notion: ['notion-search', 'notion-fetch'],
}

function matchServers(toolNames: string[]): [string, Service][] {
  const byServer = new Map<string, Set<string>>()
  for (const name of toolNames) {
    const t = mcpTarget(name)
    if (!t) continue
    const set = byServer.get(t.server) ?? new Set<string>()
    set.add(t.tool)
    byServer.set(t.server, set)
  }
  const out: [string, Service][] = []
  for (const [server, tools] of byServer) {
    const matches = (Object.keys(SIGNATURE) as Service[]).filter(svc => SIGNATURE[svc].every(t => tools.has(t)))
    if (matches.length === 1 && matches[0]) out.push([server, matches[0]])
  }
  return out
}

// A service that two connections claim is never offered: the owner could not
// tell from Team View which one is the real app.
export function doubledServices(toolNames: string[]): Service[] {
  const seen = matchServers(toolNames).map(([, svc]) => svc)
  return [...new Set(seen.filter((svc, i) => seen.indexOf(svc) !== i))]
}

export function detectServices(toolNames: string[]): Record<string, Service> {
  const doubled = new Set(doubledServices(toolNames))
  const found: Record<string, Service> = {}
  for (const [server, svc] of matchServers(toolNames)) if (!doubled.has(svc)) found[server] = svc
  return found
}

// Built-in tools that stay inside the session. Write tools only reach working notes.
const SAFE_TOOLS = new Set([
  'Read',
  'Glob',
  'Grep',
  'LS',
  'NotebookRead',
  'Agent',
  'Task',
  'Skill',
  'TodoWrite',
  'ToolSearch',
  'SendMessage',
  'ListAgents',
  'AskUserQuestion',
  'TaskStop',
  'TaskOutput',
  'SubagentHandback',
  'ReadNotifications',
])
const WRITE_TOOLS = new Set(['Write', 'Edit', 'MultiEdit', 'NotebookEdit'])
export const isWriteTool = (tool: string) => WRITE_TOOLS.has(tool)

// The one program employees may run: ls, to see what a folder holds (this
// Claude Code has no separate file-finding tool). Each word is a flag or a
// plain or quoted path; nothing the shell would expand, chain or redirect.
const LISTING = /^ls(?: +(?:-[1aAlRtrhF]+|'[^'\n]*'|"[^"$`\\\n]*"|[A-Za-z0-9_./*~-]+))* *$/
export const isListing = (command: unknown): boolean => typeof command === 'string' && LISTING.test(command)

export type Verdict =
  | { kind: 'allow' }
  | { kind: 'card'; target: McpTarget; adapter: Adapter }
  | { kind: 'deny'; reason: 'protected' | 'shell' | 'web' | 'held' }

export function classifyMcp(tool: string, connections: Record<string, Service>): Verdict {
  const target = mcpTarget(tool)
  if (!target) return { kind: 'deny', reason: 'held' }
  // Only connections the owner approved count, and only their reviewed tools.
  const service = Object.prototype.hasOwnProperty.call(connections, target.server) ? connections[target.server] : undefined
  if (!service) return { kind: 'deny', reason: 'held' }
  const spec = SERVICES[service]
  if (spec.reads.includes(target.tool) || spec.drafts.includes(target.tool)) return { kind: 'allow' }
  const adapter = spec.cards[target.tool]
  return adapter ? { kind: 'card', target, adapter } : { kind: 'deny', reason: 'held' }
}

export function relativeTo(root: string, path: string): string | null {
  const clean = (p: string): string[] | null => {
    const out: string[] = []
    for (const part of p.split('/')) {
      if (!part || part === '.') continue
      if (part === '..') {
        if (out.length === 0) return null
        out.pop()
      } else out.push(part)
    }
    return out
  }
  const base = clean(root)
  const full = clean(path.startsWith('/') ? path : `${root}/${path}`)
  if (!base || !full) return null
  for (let i = 0; i < base.length; i++) if (full[i] !== base[i]) return null
  return full.slice(base.length).join('/')
}

// Working notes: Markdown files inside these folders, matched without regard
// to letter case (a Mac folder answers to any case), with no hidden folder.
const WORKING_DIRS = ['business/', 'how we work/', 'decisions/', 'projects/', 'team/tasks/', 'team/chat/', 'team/memory/']
// Files an AI tool loads as instructions when it works in their folder
// (Claude Code loads a subfolder's CLAUDE.md on its own). An employee who
// wrote one would be giving orders to every later session there. Names are
// compared after folding look-alike letters to plain ones: a Mac folder
// opens "AGENTſ.md" (long s) when a tool asks for AGENTS.md.
const INSTRUCTION_FILE = /^(claude|agents?|gemini)(\..*)?\.md$/
const isInstructionFile = (name: string) => INSTRUCTION_FILE.test(name.normalize('NFKC').toLowerCase())
// A note name never needs a character nobody can see; some disks ignore them
// when matching names.
const INVISIBLE = /[\p{Cc}\p{Cf}\p{Co}\p{Cn}\p{Zl}\p{Zp}\p{Default_Ignorable_Code_Point}]/u

export function isWorkingNote(root: string, path: unknown): boolean {
  if (typeof path !== 'string' || path.length === 0) return false
  const rel = relativeTo(root, path)
  if (!rel) return false
  const lower = rel.toLowerCase()
  if (!lower.endsWith('.md')) return false
  if (rel.split('/').some(seg => seg.startsWith('.') || INVISIBLE.test(seg) || isInstructionFile(seg))) return false
  return WORKING_DIRS.some(dir => lower.startsWith(dir) && lower.length > dir.length)
}

// The repository settings a plain clone has. Anything else (file filters,
// transport or credential programs, includes, address rewrites) can make a
// backup start a program or change where it goes, so backup stays off.
const PLAIN_CONFIG =
  /^(core\.(repositoryformatversion|filemode|bare|logallrefupdates|ignorecase|precomposeunicode|symlinks)|remote\.origin\.(url|fetch|pushurl)|branch\..+\.(remote|merge)|user\.(name|email)|gc\.auto)$/

// Takes `git config --local --includes --list -z` output; returns the setting
// names a plain clone would not have.
export function unplainSettings(listing: string): string[] {
  const names = new Set(listing.split('\0').filter(Boolean).map(entry => (entry.split('\n')[0] ?? '').toLowerCase()))
  return [...names].filter(name => !PLAIN_CONFIG.test(name)).sort()
}

// Settings at any level, and environment variables, that name a program or a
// file git uses. Backup may not run if one of them can reach into the brain,
// because the team can edit files there.
const PROGRAM_SETTING =
  /^(credential(\..+)?\.helper|core\.(sshcommand|askpass|gitproxy|editor|pager|fsmonitor|hookspath|attributesfile|worktree)|sequence\.editor|gpg(\..+)?\.program|filter\..+\.(clean|smudge|process)|diff\..+\.(textconv|command)|diff\.external|merge\..+\.driver|remote\..+\.(uploadpack|receivepack|vcs)|include\.path|includeif\..+\.path)$/
const PROGRAM_ENV = ['GIT_SSH_COMMAND', 'GIT_SSH', 'GIT_ASKPASS', 'SSH_ASKPASS', 'GIT_EXTERNAL_DIFF', 'GIT_EDITOR', 'GIT_PAGER',
  'GIT_PROXY_COMMAND', 'GIT_EXEC_PATH', 'GIT_CONFIG_GLOBAL', 'GIT_CONFIG_SYSTEM', 'GIT_CONFIG', 'GIT_DIR', 'GIT_WORK_TREE',
  'GIT_INDEX_FILE', 'GIT_OBJECT_DIRECTORY', 'GIT_ALTERNATE_OBJECT_DIRECTORIES', 'GIT_TEMPLATE_DIR']
// Anything the shell would expand cannot be checked, so it counts as reaching.
const SHELL_DYNAMIC = /[$`*?[\]{}\\]/

export type Setting = { origin: string; name: string; value: string }

// Takes `git config --list --show-origin --includes -z` output.
export function parseSettings(listing: string): Setting[] {
  const parts = listing.split('\0')
  const out: Setting[] = []
  for (let i = 0; i + 1 < parts.length; i += 2) {
    const [name = '', ...rest] = (parts[i + 1] ?? '').split('\n')
    out.push({ origin: parts[i] ?? '', name: name.toLowerCase(), value: rest.join('\n') })
  }
  return out
}

// Takes `env -0` output, so values may span lines. Anything malformed gives
// null, which the backup treats as unsafe.
export function parseEnv(text: string): Record<string, string> | null {
  const env: Record<string, string> = {}
  for (const entry of text.split('\0')) {
    if (!entry) continue
    const at = entry.indexOf('=')
    if (at <= 0) return null
    env[entry.slice(0, at)] = entry.slice(at + 1)
  }
  return env
}

const settingWords = (value: string) =>
  value.replace(/['"]/g, '').replace(/^!/, '').split(/[\s;&|()<>=,]+/).filter(Boolean)

const atPath = (word: string, root: string, home: string) =>
  word.startsWith('/') ? word : word.startsWith('~') ? `${home}${word.slice(1)}` : `${root}/${word}`

// Every path the check needs resolved on disk (links followed).
export function pathsToResolve(settings: Setting[], env: Record<string, string>, root: string): string[] {
  const home = env.HOME ?? ''
  const paths = new Set<string>([root])
  for (const s of settings) {
    if (s.origin.startsWith('file:')) paths.add(atPath(s.origin.slice(5), root, home))
    if (PROGRAM_SETTING.test(s.name)) for (const w of settingWords(s.value)) paths.add(atPath(w, root, home))
  }
  for (const name of PROGRAM_ENV) for (const w of settingWords(env[name] ?? '')) paths.add(atPath(w, root, home))
  for (const entry of (env.PATH ?? '').split(':')) if (entry.startsWith('/')) paths.add(entry)
  return [...paths]
}

// Names of settings or variables that can reach a file in the brain. `real`
// gives a path's location with links followed, or undefined when it is missing.
export function settingsReachingBrain(
  settings: Setting[],
  env: Record<string, string>,
  root: string,
  real: (path: string) => string | undefined,
): string[] {
  const home = env.HOME ?? ''
  const top = real(root) ?? root
  const inBrain = (path: string) => {
    const rel = relativeTo(top, real(path) ?? path)
    return rel !== null && rel !== '.git' && !rel.startsWith('.git/')
  }
  const reaches = (value: string) =>
    SHELL_DYNAMIC.test(value) ||
    settingWords(value).some(w => {
      if (w.startsWith('/') || w.startsWith('~')) return inBrain(atPath(w, root, home))
      if (w.startsWith('.') || w.includes('/')) return true
      return real(`${root}/${w}`) !== undefined
    })
  const found = new Set<string>()
  for (const s of settings) {
    if (s.origin.startsWith('file:') && inBrain(atPath(s.origin.slice(5), root, home))) found.add(s.name)
    else if (PROGRAM_SETTING.test(s.name) && reaches(s.value)) found.add(s.name)
  }
  for (const name of PROGRAM_ENV) if (env[name] !== undefined && reaches(env[name] ?? '')) found.add(name)
  if ((env.PATH ?? '').split(':').some(entry => !entry.startsWith('/') || inBrain(entry))) found.add('PATH')
  return [...found].sort()
}

export function classify(tool: string, input: Record<string, unknown>, root: string, connections: Record<string, Service>): Verdict {
  if (tool.startsWith('mcp__')) return classifyMcp(tool, connections)
  if (WRITE_TOOLS.has(tool)) {
    // The write tools take absolute paths. A relative one would land wherever
    // the session started, not where this check looked.
    const path = input.file_path ?? input.notebook_path
    return typeof path === 'string' && path.startsWith('/') && isWorkingNote(root, path)
      ? { kind: 'allow' }
      : { kind: 'deny', reason: 'protected' }
  }
  if (SAFE_TOOLS.has(tool)) return { kind: 'allow' }
  if (tool === 'Bash' && isListing(input.command)) return { kind: 'allow' }
  if (tool === 'Bash' || tool === 'BashOutput' || tool === 'KillShell') return { kind: 'deny', reason: 'shell' }
  if (tool === 'WebFetch' || tool === 'WebSearch') return { kind: 'deny', reason: 'web' }
  return { kind: 'deny', reason: 'held' }
}

// What a card shows. Every field the action accepts is listed with how it is
// shown; any other field, or a value of the wrong shape, removes Send.
export type CardLine = { label: string; value: string }
export type CardView = {
  goesTo: string
  verb: 'email' | 'invite'
  recipients: CardLine[]
  subject: string
  body: string
  details: CardLine[]
  canSend: boolean
  problems: string[]
}

// Characters a person cannot see or that change how the rest of the text
// looks: controls, format marks (direction overrides, zero-width marks, soft
// hyphens, the invisible tag letters), line and paragraph separators,
// private and unassigned code points, variation selectors (which can carry
// hidden bytes) and the letters that draw as blank space. With any of them a
// card could show something other than what would go out.
const HIDDEN = /[\p{Cc}\p{Cf}\p{Co}\p{Cn}\p{Zl}\p{Zp}\p{Variation_Selector}\u{34f}\u{115f}\u{1160}\u{2800}\u{3164}\u{ffa0}]/u
const isText = (v: unknown): v is string => typeof v === 'string' && !HIDDEN.test(v)
// A message body may break lines and indent; nothing else hidden.
const isBody = (v: unknown): v is string => typeof v === 'string' && !HIDDEN.test(v.replace(/[\n\t]/g, ''))
const isTextList = (v: unknown): v is string[] => Array.isArray(v) && v.every(isText)

function emailView(args: Record<string, unknown>): CardView {
  const problems: string[] = []
  // Replies to a thread are left out until a card can show which thread.
  const known = new Set(['to', 'cc', 'bcc', 'subject', 'body', 'includeSignature'])
  for (const k of Object.keys(args)) if (!known.has(k)) problems.push(k)
  const recipients: CardLine[] = []
  for (const k of ['to', 'cc', 'bcc'] as const) {
    if (args[k] === undefined) continue
    if (!isTextList(args[k])) problems.push(k)
    else if ((args[k] as string[]).length > 0) recipients.push({ label: k, value: (args[k] as string[]).join(', ') })
  }
  if (args.subject !== undefined && !isText(args.subject)) problems.push('subject')
  if (args.body !== undefined && !isBody(args.body)) problems.push('body')
  const details: CardLine[] = []
  if (args.includeSignature !== undefined) {
    if (typeof args.includeSignature !== 'boolean') problems.push('includeSignature')
    else if (args.includeSignature) details.push({ label: 'Signature', value: 'Adds your email signature' })
  }
  if (recipients.length === 0) problems.push('to')
  if (typeof args.body !== 'string' || args.body.trim() === '') problems.push('body')
  return {
    goesTo: 'Email',
    verb: 'email',
    recipients,
    subject: isText(args.subject) ? args.subject : '',
    body: typeof args.body === 'string' ? args.body : '',
    details,
    canSend: problems.length === 0,
    problems,
  }
}

function eventView(args: Record<string, unknown>): CardView {
  const problems: string[] = []
  const known = new Set(['summary', 'startTime', 'endTime', 'attendees', 'description', 'location', 'timeZone', 'allDay', 'addGoogleMeetUrl', 'calendarId'])
  for (const k of Object.keys(args)) if (!known.has(k)) problems.push(k)
  const recipients: CardLine[] = []
  if (args.attendees !== undefined) {
    const list = args.attendees
    const okAttendee = (a: unknown) => {
      if (!a || typeof a !== 'object' || Array.isArray(a)) return false
      const v = a as Record<string, unknown>
      return (
        Object.keys(v).every(k => k === 'email' || k === 'displayName' || k === 'optionalAttendee') &&
        isText(v.email) &&
        (v.displayName === undefined || isText(v.displayName)) &&
        (v.optionalAttendee === undefined || typeof v.optionalAttendee === 'boolean')
      )
    }
    if (!Array.isArray(list) || !list.every(okAttendee)) problems.push('attendees')
    else if (list.length > 0)
      recipients.push({
        label: 'guests',
        value: (list as { email: string; displayName?: string; optionalAttendee?: boolean }[])
          .map(a => `${a.email}${a.displayName ? ` (${a.displayName})` : ''}${a.optionalAttendee ? ', optional' : ''}`)
          .join('; '),
      })
  }
  for (const k of ['summary', 'startTime', 'endTime'] as const) if (!isText(args[k])) problems.push(k)
  // Single-line fields shown on one line; a line break would hide the rest.
  for (const k of ['location', 'timeZone', 'calendarId'] as const) if (args[k] !== undefined && !isText(args[k])) problems.push(k)
  if (args.description !== undefined && !isBody(args.description)) problems.push('description')
  for (const k of ['allDay', 'addGoogleMeetUrl'] as const)
    if (args[k] !== undefined && typeof args[k] !== 'boolean') problems.push(k)
  const details: CardLine[] = [{ label: 'Starts', value: isText(args.startTime) ? args.startTime : '' }, { label: 'Ends', value: isText(args.endTime) ? args.endTime : '' }]
  if (isText(args.timeZone)) details.push({ label: 'Time zone', value: args.timeZone })
  if (args.allDay === true) details.push({ label: 'All day', value: 'Yes' })
  if (isText(args.location)) details.push({ label: 'Where', value: args.location })
  if (args.addGoogleMeetUrl === true) details.push({ label: 'Call', value: 'Adds a video call link' })
  if (isText(args.calendarId)) details.push({ label: 'Calendar', value: args.calendarId })
  return {
    goesTo: 'Calendar',
    verb: 'invite',
    recipients,
    subject: isText(args.summary) ? args.summary : '',
    body: typeof args.description === 'string' ? args.description : '',
    details,
    canSend: problems.length === 0,
    problems,
  }
}

export function cardView(_target: McpTarget, adapter: Adapter, args: Record<string, unknown>): CardView {
  return adapter === 'event' ? eventView(args) : emailView(args)
}

export function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`
  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b))
    return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${stableJson(v)}`).join(',')}}`
  }
  return JSON.stringify(value)
}

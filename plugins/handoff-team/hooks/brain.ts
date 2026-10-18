// The brain's plain files: pure parsing and formatting. The reads and writes
// live in register.tsx, where the engine interface may be used.

import type { BrainInfo, Card, ChatLine, Employee } from '../types'

export const MARKER = '.handoff/brain.json'

export function join(...parts: string[]): string {
  return parts
    .filter(Boolean)
    .join('/')
    .replace(/\/{2,}/g, '/')
}

export function today(nowMs: number): string {
  const d = new Date(nowMs)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function parseBrain(text: string): BrainInfo | null {
  try {
    const raw = JSON.parse(text) as Partial<BrainInfo>
    if (!raw || !Array.isArray(raw.employees) || raw.employees.length === 0) return null
    const employees: Employee[] = raw.employees
      .filter(e => e && typeof e.id === 'string' && typeof e.name === 'string')
      .map(e => ({ id: e.id, name: e.name, role: typeof e.role === 'string' ? e.role : '' }))
    if (employees.length === 0) return null
    const connections: BrainInfo['connections'] = {}
    if (raw.connections && typeof raw.connections === 'object') {
      for (const [id, service] of Object.entries(raw.connections as Record<string, unknown>)) {
        if (service === 'gmail' || service === 'calendar' || service === 'notion') connections[id] = service
      }
    }
    return {
      name: typeof raw.name === 'string' ? raw.name : 'Your business',
      employees,
      setupDone: raw.setupDone === true,
      backupRemote: typeof raw.backupRemote === 'string' ? raw.backupRemote : undefined,
      connections,
    }
  } catch {
    return null
  }
}

export type Frontmatter = Record<string, string>

export function splitFrontmatter(text: string): { data: Frontmatter; body: string } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(text)
  if (!match) return { data: {}, body: text }
  const data: Frontmatter = {}
  for (const line of (match[1] ?? '').split(/\r?\n/)) {
    const kv = /^([A-Za-z_][\w-]*):\s*(.*)$/.exec(line)
    if (kv?.[1]) data[kv[1]] = (kv[2] ?? '').replace(/^["']|["']$/g, '').trim()
  }
  return { data, body: match[2] ?? '' }
}

export function setFrontmatter(text: string, changes: Frontmatter): string {
  const { data, body } = splitFrontmatter(text)
  const merged = { ...data, ...changes }
  const lines = Object.entries(merged).map(([k, v]) => `${k}: ${v}`)
  return `---\n${lines.join('\n')}\n---\n${body}`
}

// Task notes the owner can act on: reviews ("Looks good") and hires. A note
// never carries an action Team View would run: sends live only in Team View's
// own store, written by the send gate, never by an employee.
export function parseCard(path: string, text: string): Card | null {
  const { data, body } = splitFrontmatter(text)
  if (data.status !== 'Needs you') return null
  if (data.card_id) return null // a mirror of a held send; the store holds the real card
  const isHire = data.kind === 'hire' && Boolean(data.name)
  return {
    id: path,
    source: 'note',
    path,
    kind: isHire ? 'hire' : 'review',
    status: 'waiting',
    owner: data.owner || 'Your Chief',
    title: data.title || (isHire ? `Hire ${data.name}` : 'Something to check'),
    why: data.why || '',
    summary: body.trim(),
    name: isHire ? data.name : undefined,
    created: data.created || '',
  }
}

// A readable copy of a held send for the Team Board. Not executable.
export function mirrorNote(fields: { id: string; owner: string; title: string; created: string; preview: string }): string {
  return [
    '---',
    'status: Needs you',
    `card_id: ${fields.id}`,
    `owner: ${fields.owner}`,
    `title: ${fields.title.replace(/\n/g, ' ')}`,
    `created: ${fields.created}`,
    '---',
    'Held for your OK in Team View. Nothing was sent.',
    '',
    fields.preview,
    '',
  ].join('\n')
}

// Chat lines: "- 07:06 Chief → Follow-up: 3 leads need replies"
// Only the "## Chat" section counts when the note has one, so the brief's own
// bullet points are never read as messages.
export function parseChat(text: string): ChatLine[] {
  const section = /^##\s+Chat\s*$/m.exec(text)
  const scope = section ? text.slice(section.index + section[0].length) : text
  const lines: ChatLine[] = []
  for (const raw of scope.split(/\r?\n/)) {
    if (/^##\s/.test(raw)) break
    const match = /^\s*[-*]\s+(?:(\d{1,2}:\d{2})\s+)?(.+)$/.exec(raw)
    const text = match?.[2]?.trim()
    if (text) lines.push({ time: match?.[1] ?? '', text })
  }
  return lines
}

// The brief is the "## Brief" section at the top of the day's chat note.
export function parseBrief(text: string): string {
  const match = /^##\s+Brief\s*\r?\n([\s\S]*?)(?=^##\s|\s*$(?![\s\S]))/m.exec(text)
  return match?.[1]?.trim() ?? ''
}

export function chatEntry(time: string, text: string): string {
  return `- ${time} ${text.replace(/\n/g, ' ')}\n`
}

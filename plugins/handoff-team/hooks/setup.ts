// Starting a brain from scratch: the pages setup opens, the shift's steps, and
// the parsing that needs no engine.

export const CONNECTORS_URL = 'https://claude.ai/customize/connectors'
export const SCHEDULED_URL = 'https://claude.ai/code/routines'
export const GH_DOWNLOAD_URL = 'https://cli.github.com/'

// What the owner pastes into a new scheduled task on claude.ai.
export const SHIFT_PROMPT =
  'You are the Chief of Staff for the business in this brain. Run the morning-shift training ' +
  '(.claude/skills/morning-shift/SKILL.md), then save your work exactly as that training says.'

// Told to a Chief whose folder became a brain after the session started, so
// the brain's own instructions were never loaded.
export const NEW_BRAIN_NOTE =
  "This brain's instructions were made or updated during this session, after they were loaded. " +
  'Before anything else, read CLAUDE.md in this folder and follow it. Trainings are in ' +
  '.claude/skills/<name>/SKILL.md: when one is not in your skill list, read that file and follow it.'

// Files the add-on owns in every brain: the guard, the brain's settings and
// rules, the job cards and the built-in trainings. A safety update rewrites
// these; job pages, notes and anything the owner made stay as they are.
const SYSTEM_FILE =
  /^(\.handoff\/guard\.py|\.claude\/settings\.json|\.gitignore|CLAUDE\.md|AGENTS\.md|\.claude\/agents\/[^/]+\.md|\.claude\/skills\/[^/]+\/SKILL\.md|Trainings\/[^/]+\/SKILL\.md)$/
export const isSystemFile = (rel: string): boolean => SYSTEM_FILE.test(rel)

// What a new folder may hold and still count as empty.
export const IGNORABLE = new Set(['.DS_Store', '.localized'])

// Claude writes .claude/settings.local.json when the owner answers a new
// folder's question about MCP servers. A file holding only those answers still
// counts as "nothing here yet"; any other setting does not.
export function onlyMcpChoices(text: string): boolean {
  try {
    const value = JSON.parse(text) as unknown
    if (!value || typeof value !== 'object' || Array.isArray(value)) return false
    return Object.entries(value).every(
      ([key, list]) =>
        (key === 'disabledMcpjsonServers' || key === 'enabledMcpjsonServers') &&
        Array.isArray(list) &&
        list.every(item => typeof item === 'string'),
    )
  } catch {
    return false
  }
}

// The cloud copy's name: the folder's name in plain lowercase words.
export function repoName(folder: string): string {
  const base = folder.split('/').filter(Boolean).pop() ?? ''
  const slug = base.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  return slug || 'my-brain'
}

// The one-time code GitHub's helper prints while signing in.
export function signInCode(text: string): string {
  return /\b([A-Z0-9]{4}-[A-Z0-9]{4})\b/.exec(text)?.[1] ?? ''
}

// The template's files with today's date filled in.
export function filled(files: Record<string, string>, date: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [rel, text] of Object.entries(files)) out[rel] = text.split('{{TODAY}}').join(date)
  return out
}

export type Employee = { id: string; name: string; role: string }

export type Service = 'gmail' | 'calendar' | 'notion'

export type BrainInfo = {
  name: string
  employees: Employee[]
  setupDone: boolean
  backupRemote?: string
  // Connection ids the owner approved in Team View, and what each one is.
  connections: Record<string, Service>
  // A brain folder whose settings could not be read: the gate stays on.
  unhealthy?: boolean
  // Off unless the owner turns it on: employees write drafts and the owner
  // sends from Gmail. On, a held message gets a Send button in Team View.
  sendFromTeamView?: boolean
}

export type MemberStatus = 'working' | 'waiting' | 'done' | 'resting' | 'snag'

export type MemberState = { status: MemberStatus; line: string; at: number }

export type ChatLine = { time: string; text: string }

export type CardStatus = 'waiting' | 'sending' | 'sent' | 'failed' | 'unknown' | 'dismissed'

export type Card = {
  id: string
  source: 'store' | 'note'
  path: string
  kind: 'send' | 'review' | 'hire' | 'training'
  status: CardStatus
  owner: string
  title: string
  why: string
  summary: string
  server?: string
  tool?: string
  adapter?: 'email' | 'event'
  args?: Record<string, unknown>
  attempt?: number
  name?: string
  created: string
}

// A held send, as only the send gate writes it (in $.store, out of every
// employee's reach). The note in Team/Tasks is a readable mirror.
export type SendRecord = {
  id: string
  server: string
  tool: string
  adapter: 'email' | 'event'
  args: Record<string, unknown>
  owner: string
  created: string
  status: CardStatus
  note: string
  root: string
  // Each try at sending is numbered; locks and answers belong to one try.
  attempt: number
  claimedAt?: number
}

export type Energy = { level: 'plenty' | 'low' | 'out'; resetsAt?: string }

export type Backup = { state: 'idle' | 'saving' | 'saved' | 'conflict' | 'off'; files: string[] }

// Turning on backup during setup, one screen per stage.
export type BackupStage = 'checking' | 'needGit' | 'needGh' | 'signIn' | 'code' | 'makeCopy' | 'making' | 'adopt' | 'public' | 'done' | 'failed'
export type BackupFlow = { stage: BackupStage; code: string }

declare module 'claude-code' {
  interface PluginState {
    'handoff-team': {
      brain: BrainInfo | null
      root: string
      members: Record<string, MemberState>
      feed: ChatLine[]
      chat: ChatLine[]
      brief: string
      placed: boolean
      cards: Card[]
      energy: Energy | null
      backup: Backup
      setupStep: number
      showAll: boolean
      chimes: boolean
      sending: string
      expanded: string
      newFolder: string
      backupFlow: BackupFlow
      opened: string
      appsCheck: number
      update: string[]
    }
  }
}

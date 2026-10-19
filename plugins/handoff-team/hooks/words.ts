// Plain-word rules for everything Team View shows. Every fixed string lives in
// STRINGS so the tests can hold each one to its word cap and the jargon list.

export const CAPS = {
  status: 1,
  activity: 8,
  chat: 12,
  cardTitle: 6,
  cardBody: 30,
  button: 3,
  toast: 6,
  spinner: 6,
  heading: 2,
  setup: 20,
} as const

export type CapKind = keyof typeof CAPS

// Words a member never sees in Team View. Matched as whole words, any case.
export const JARGON = [
  'agent',
  'agents',
  'subagent',
  'subagents',
  'sub-agent',
  'mcp',
  'connector',
  'connectors',
  'plugin',
  'plugins',
  'mod',
  'session',
  'token',
  'tokens',
  'prompt',
  'routine',
  'routines',
  'repo',
  'repository',
  'git',
  'commit',
  'push',
  'pull',
  'branch',
  'merge',
  'terminal',
  'api',
  'json',
  'hook',
  'hooks',
  'model',
  'skill',
  'skills',
  'permission',
  'cli',
  'markdown',
  'vault',
  'scheduled task',
  'rate limit',
  'usage',
  'error',
] as const

export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

export function capWords(text: string, cap: number): string {
  const words = text.trim().split(/\s+/).filter(Boolean)
  if (words.length <= cap) return words.join(' ')
  return `${words.slice(0, cap).join(' ')}…`
}

export function jargonIn(text: string): string[] {
  const lower = text.toLowerCase()
  return JARGON.filter(word =>
    new RegExp(`(^|[^a-z])${word.replace(/[-]/g, '\\-')}([^a-z]|$)`).test(lower),
  )
}

export const STRINGS = {
  heading: {
    team: 'Your team',
    needsYou: 'Needs you',
    chat: 'Team chat',
    apps: 'Your apps',
  },
  status: {
    working: 'Working',
    waiting: 'Waiting',
    done: 'Done',
    resting: 'Resting',
    snag: 'Snag',
  },
  button: {
    catchMeUp: 'Catch me up',
    stop: 'Stop',
    send: 'Send',
    edit: 'Edit',
    notNow: 'Not now',
    looksGood: 'Looks good',
    keepMine: 'Keep mine',
    keepTeams: "Keep the team's",
    showAll: 'Show all',
    showLess: 'Show less',
    readBrief: 'Hear the brief',
    start: 'Start',
    next: 'Next',
    yes: 'Yes',
    no: 'No',
    getBrief: 'Get my brief',
    open: 'Open',
    sending: 'Sending',
    itSent: 'It sent',
    didntSend: "It didn't send",
    looksGoodHire: 'Hire them',
    useThese: 'Use these',
    addTraining: 'Add it',
    later: 'Later',
  },
  toast: {
    sent: 'Sent. Logged in chat.',
    saved: 'Saved.',
    held: 'Held for your OK.',
    notSent: 'Could not send. Try again.',
    unsure: 'Not sure it sent. Check Gmail.',
  },
  // What a button types for the member, shown in the chat as their words.
  ask: {
    catchMeUp: 'Catch me up.',
    interview: 'Start the About My Business interview.',
    brief: "Give me today's brief.",
  },
  line: {
    resting: 'Nothing needs you.',
    allDone: 'All done.',
    stillWorking: 'Still working. Big page.',
    slow: 'Taking longer than usual. Wait or stop?',
    noChat: 'No messages yet today.',
    promptHint: 'Tell your Chief what you need',
    twoVersions: 'Two versions of',
    energyPlenty: 'Plenty of energy left',
    energyLow: 'Energy running low',
    energyOut: 'Resting until',
    heldSend: 'Held for your OK. It is in Needs you.',
    heldWeb: 'Held. Your team stays offline here.',
    heldShell: 'Held. No programs here, except ls to list a folder.',
    heldProtected: 'Held. Only you change this part.',
    heldOther: 'Held. Ask your Chief to make a card.',
    heldNoCard: 'Held. Team View could not save the card.',
    heldDraft: 'Held. Save it as a draft; the owner sends it.',
    heldApp: 'Held. The owner OKs this app in Team View first.',
    heldSetup: 'Held. The owner makes the brain in Team View first.',
    sendOff: 'Sending from Team View is off. Send it from Gmail.',
    cantShow: 'Team View cannot show all of this. Send it yourself.',
    readAll: 'Tap Show all to send it.',
    readAllAdd: 'Tap Show all first.',
    nameTaken: 'That name is already on the team.',
    appsFound: 'Your team can use these connected apps:',
    noApps: 'No connected apps found yet. Connect Gmail or Calendar in Claude first.',
    doubled: 'is connected twice. Turn one off in Claude first.',
    unhealthy: 'Team View cannot read this brain. Ask at the Setup Clinic.',
    hireAdds: 'Adds a job page and a job card for',
    trainingAdds: 'Adds a training your team can follow.',
    builtInName: 'That name is taken. Ask your Chief for another.',
    cantShowCard: 'Team View cannot show all of this. Ask for a rewrite.',
    moreWaiting: 'more waiting',
    snag: 'hit a snag.',
    readingMessage: 'is reading your message',
    youApproved: 'You approved:',
  },
  setup: [
    { id: 'welcome', title: 'Meet your team', body: 'Your Chief and helpers work from your brain. Let us get them ready.', button: 'Start' },
    { id: 'backup', title: 'Back up your brain', body: 'A private cloud copy keeps your brain safe and lets your Chief work while you are away.', button: 'Set it up' },
    { id: 'apps', title: 'Connect email and calendar', body: 'Connect Gmail and Google Calendar on the page that opens. Then come back here.', button: 'Open it' },
    { id: 'interview', title: 'Tell us about your business', body: 'Your Chief asks 8 quick questions, one at a time.', button: 'Start' },
    { id: 'chief', title: 'Meet your Chief', body: 'Read your Chief\'s job page in your brain. Change anything you like.', button: 'Looks good' },
    { id: 'brief', title: 'Your first brief', body: 'Ask your Chief for today\'s brief and watch it work.', button: 'Get my brief' },
    { id: 'shift', title: 'Put your Chief on shift', body: 'Your Chief can work each weekday morning, even with your computer off. We copy the steps for you.', button: 'Copy and open' },
    { id: 'chimes', title: 'Chimes?', body: 'Play a soft chime when something needs you or the team is done?', button: 'Yes' },
    { id: 'done', title: 'Your Chief is on duty', body: 'Open your office any time. Your team is ready.', button: 'Done' },
  ],
  // What a step shows once its button has done its part.
  after: {
    apps: { title: 'Connect email and calendar', body: 'Connected them on the page that opened? Press Check to see them here.', button: 'Check' },
    appsFound: { title: 'Your connected apps', body: 'Your team may read these and write drafts. Nothing goes out without you.', button: 'Use these' },
    appsReady: { title: 'Email and calendar', body: 'Your team can read them and write drafts. You send everything yourself.', button: 'Next' },
    shift: { title: 'Paste the steps', body: 'Make a new task on the page that opened, paste the steps, and pick your cloud copy.', button: 'Done' },
  },
  // Newer safety rules and trainings than the brain has.
  update: { title: 'Safety update', body: 'Newer rules and trainings for your team. Your notes and job pages stay as they are.', button: 'Update' },
  // An empty folder: the first screen a new member sees.
  start: {
    title: 'Make your brain',
    body: 'Your brain is a folder of notes your team works from. Start fresh, or practice with a sample business.',
    make: 'Make my brain',
    practice: 'Practice brain',
  },
  backup: {
    checking: { title: 'Checking your Mac', body: 'One moment while we look for what backup needs.', button: 'Check again' },
    needGit: { title: 'One free Apple tool', body: 'Backup needs a free tool from Apple. Click Install when your Mac asks, then come back.', button: 'Install it' },
    needGh: { title: 'One free GitHub helper', body: 'Download and install the free GitHub helper from the page that opens. Then come back here.', button: 'Get it' },
    signIn: { title: 'Sign in to GitHub', body: 'Sign in, or make a free account. We give you a code to paste there.', button: 'Sign in' },
    code: { title: 'Paste this code', body: 'Paste the code on the GitHub page that opened, then click Authorize.', button: 'Check again' },
    makeCopy: { title: 'Make your cloud copy', body: 'We make a private copy of your brain on GitHub. Only you can see it.', button: 'Make it' },
    making: { title: 'Making your copy', body: 'Saving your brain to its private cloud copy.', button: 'Check again' },
    adopt: { title: 'Use your cloud copy', body: 'This brain already has a copy on GitHub. Back up there from now on?', button: 'Use it' },
    done: { title: 'Backed up', body: 'Your brain has a private cloud copy. Changes save on their own.', button: 'Next' },
    failed: { title: 'Backup did not finish', body: 'Try again, or bring this screen to the Setup Clinic.', button: 'Try again' },
  },
} as const

// The six verbs Team View uses for work in progress.
export type Verb =
  | 'is reading'
  | 'is looking through'
  | 'is writing'
  | 'is handing work to'
  | 'is messaging'
  | 'is checking the web'

export type Activity = { verb: Verb; object: string }

function noteName(path: unknown): string {
  if (typeof path !== 'string' || path.length === 0) return 'your brain'
  const base = path.split(/[\\/]/).filter(Boolean).pop() ?? path
  const name = base.replace(/\.(md|base|txt|json)$/i, '').replace(/[-_]+/g, ' ')
  return name.length > 0 ? name : 'your brain'
}

function serviceName(server: string): string {
  const lower = server.toLowerCase()
  if (lower.includes('gmail') || lower.includes('outlook') || lower.includes('mail')) return 'your inbox'
  if (lower.includes('calendar')) return 'your calendar'
  if (lower.includes('notion')) return 'Notion'
  if (lower.includes('drive')) return 'your files'
  return 'a connected app'
}

// Turns one tool call into "verb + object" in plain words.
export function activityFor(tool: string, input: unknown): Activity {
  const args = (input ?? {}) as Record<string, unknown>
  if (tool === 'Read' || tool === 'NotebookRead') return { verb: 'is reading', object: noteName(args.file_path) }
  if (tool === 'Write' || tool === 'Edit' || tool === 'MultiEdit' || tool === 'NotebookEdit')
    return { verb: 'is writing', object: noteName(args.file_path ?? args.notebook_path) }
  if (tool === 'Agent' || tool === 'Task') {
    const who = typeof args.name === 'string' && args.name ? args.name : 'a teammate'
    return { verb: 'is handing work to', object: who }
  }
  if (tool === 'SendMessage') {
    const who = typeof args.to === 'string' && args.to ? args.to : 'a teammate'
    return { verb: 'is messaging', object: who }
  }
  if (tool === 'WebFetch' || tool === 'WebSearch') return { verb: 'is checking the web', object: '' }
  if (tool === 'Skill') return { verb: 'is reading', object: 'a training' }
  const mcp = /^mcp__(.+?)__(.+)$/.exec(tool)
  if (mcp?.[1] && mcp[2]) {
    const where = serviceName(mcp[1])
    const action = mcp[2].toLowerCase()
    if (/(create|update|write|draft|add|append|move|duplicate)/.test(action))
      return { verb: 'is writing', object: action.includes('draft') ? 'a draft email' : `in ${where}` }
    return { verb: 'is reading', object: where }
  }
  return { verb: 'is looking through', object: 'your brain' }
}

export function activityLine(who: string, activity: Activity): string {
  const text = activity.object ? `${who} ${activity.verb} ${activity.object}` : `${who} ${activity.verb}`
  return capWords(text, CAPS.activity)
}

export function spinnerLine(who: string, activity: Activity): string {
  return capWords(activityLine(who, activity), CAPS.spinner)
}

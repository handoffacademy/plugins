import { describe, expect, test } from 'claude-code/testing'

import { CAPS, STRINGS, activityFor, activityLine, capWords, jargonIn, wordCount } from '../hooks/words'

type Capped = { text: string; cap: keyof typeof CAPS }

function everyString(): Capped[] {
  const out: Capped[] = []
  for (const text of Object.values(STRINGS.heading)) out.push({ text, cap: 'heading' })
  for (const text of Object.values(STRINGS.status)) out.push({ text, cap: 'status' })
  for (const text of Object.values(STRINGS.button)) out.push({ text, cap: 'button' })
  for (const text of Object.values(STRINGS.toast)) out.push({ text, cap: 'toast' })
  for (const text of Object.values(STRINGS.line)) out.push({ text, cap: 'chat' })
  for (const text of Object.values(STRINGS.ask)) out.push({ text, cap: 'chat' })
  for (const screen of STRINGS.setup) {
    out.push({ text: screen.title, cap: 'cardTitle' })
    out.push({ text: screen.body, cap: 'setup' })
    out.push({ text: screen.button, cap: 'button' })
  }
  return out
}

describe('plain words', () => {
  test('every fixed string fits its word cap', async () => {
    for (const { text, cap } of everyString()) {
      expect({ text, words: wordCount(text) <= CAPS[cap] }).toEqual({ text, words: true })
    }
  })

  test('no fixed string uses jargon', async () => {
    for (const { text } of everyString()) {
      expect({ text, jargon: jargonIn(text) }).toEqual({ text, jargon: [] })
    }
  })

  test('jargon check catches the words members never see', async () => {
    expect(jargonIn('The subagent called an MCP connector')).toEqual(['subagent', 'mcp', 'connector'])
    expect(jargonIn('Your Chief is reading Customers')).toEqual([])
  })

  test('capWords keeps short text and trims long text', async () => {
    expect(capWords('one two three', 5)).toBe('one two three')
    expect(capWords('one two three four', 2)).toBe('one two…')
  })
})

describe('activity lines use the six verbs', () => {
  test('reading, writing, handing, messaging, web, looking', async () => {
    expect(activityLine('Chief', activityFor('Read', { file_path: 'Business/Customers.md' }))).toBe(
      'Chief is reading Customers',
    )
    expect(activityLine('Chief', activityFor('Edit', { file_path: 'Team/Chat/2026-10-17.md' }))).toBe(
      'Chief is writing 2026 10 17',
    )
    expect(activityLine('Chief', activityFor('Agent', { name: 'Follow-up' }))).toBe('Chief is handing work to Follow-up')
    expect(activityLine('Follow-up', activityFor('SendMessage', { to: 'Chief' }))).toBe('Follow-up is messaging Chief')
    expect(activityLine('Content', activityFor('WebSearch', { query: 'x' }))).toBe('Content is checking the web')
    expect(activityLine('Admin', activityFor('Bash', { command: 'ls' }))).toBe('Admin is looking through your brain')
    expect(activityLine('Chief', activityFor('mcp__claude_ai_Gmail__search_threads', {}))).toBe('Chief is reading your inbox')
    expect(activityLine('Follow-up', activityFor('mcp__claude_ai_Gmail__create_draft', {}))).toBe(
      'Follow-up is writing a draft email',
    )
  })

  test('activity lines stay within eight words and use no jargon', async () => {
    const line = activityLine('A very long employee name here', activityFor('Read', { file_path: 'a/b/One two three four five.md' }))
    expect(wordCount(line) <= CAPS.activity + 1).toBe(true)
    expect(jargonIn(activityLine('Chief', activityFor('mcp__claude_ai_Notion__notion-search', {})))).toEqual([])
  })
})

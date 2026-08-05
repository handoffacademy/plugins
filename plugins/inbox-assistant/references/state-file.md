# The State File

`Inbox Assistant State` is the fifth file in the owner's Claude account and the only one the plugin writes on its own. The other four belong to the owner: they are created after one consolidated setup review, and every change after that is applied as the owner gives it and announced with the exact before and after. This one is the plugin's working memory, and the owner reads it through `/inbox-assistant:status`.

In member-facing copy this is never called a fifth context file. Say "four context files plus one safety ledger."

## What it is for

Four jobs, and nothing else:

- **Duplicate prevention.** Which message and event IDs a run already handled.
- **Resumption.** Where each skill's window ended, so the next run knows what it has not read.
- **Audit evidence.** A receipt for every action taken, written before the call and completed after it.
- **Surfacing trouble.** Open partial failures, so `/inbox-assistant:status` and the next run can say what did not finish.

It never holds a credential, a token, a server URL, or the body of any message. Identifiers and dates only. If a piece of information would be embarrassing or dangerous in a file the owner might share, it does not belong here.

## The template

Created once, at the end of stage 1 of setup, and saved alongside the four context files in the same pass. It is never read back line by line: the setup summary carries one line saying what it is and what it is not. After that the plugin writes it and the owner reads it through `/inbox-assistant:status`.

```markdown
# Inbox Assistant State
This file is the plugin's working memory. The plugin writes it. You read it through
/inbox-assistant:status. It never holds a credential, a token, a server URL, or
the body of any message: identifiers and dates only.
This file is not transactional. Two runs writing at once can lose a row, and a crash
can leave an intent line without a result. Everything here is a best-effort aid to
duplicate prevention and reporting, never proof that something did or did not happen.

Schema version: 2
Plugin version: 3.1.0

## Setup
Setup stage: not-started        (not-started | stage-1-complete | stage-2-complete)
Stage 1 completed: none yet
Stage 2 completed: none yet
Provider: none yet              (gmail | outlook-m365 | outlook-personal | both)
Files renamed from the old plugin: none  (date, and which files, when setup renamed them)

## Kill switch
Status: off                     (/pause all sets this on; a run finding it on performs no business write)
Changed: none yet               (date, and which command changed it)

## Connector health
Last checked: none yet
| Route | Status | Detail |
| Native mail read | not checked | |
| Zapier tools visible | not checked | app names and count only, never a URL |

## Scheduled tasks
| Task name | Created | Preamble | Last known state |

## Checkpoints
The last window each skill fully accounted for. Advance a row only when every intended
read and every enabled action in the run is done or recorded as a partial failure.
| Skill | Window end (UTC) | Run finished | Notes |
| daily-inbox | never | never | |
| follow-through | never | never | |
| owner-brief | never | never | |

## Processed sources
Message and event IDs already handled, newest first, for duplicate prevention only.
Retention: keep at most the last 7 days and at most 200 IDs per source, and prune
older entries every time you write here.
| Source | ID | Seen (UTC) |

## Write receipts
One row per action, written twice: an intent row before the Zapier call, then the
Result column filled in after it returns. Retention: last 30 days, at most 100 rows.
A row with an empty Result means the outcome is unknown, so re-read the target before
ever repeating that action.
| When (UTC) | Run | Action | Zapier tool | Target | Result |

## Partial failures
Open problems for /inbox-assistant:status and the next run to surface. Remove a row
when it is resolved. At most 50 open rows.
| When | Skill | What failed | What completed anyway |
```

## Who writes what

| Section | Written by |
|---|---|
| Setup, Provider | `/inbox-assistant:setup` only |
| Kill switch | `/inbox-assistant:pause` only |
| Scheduled tasks | `/inbox-assistant:schedule` and `/inbox-assistant:pause` |
| Connector health | Any run, opportunistically, when it has just checked a route |
| Checkpoints, Processed sources, Write receipts, Partial failures | Every run of an output skill |
| Nothing at all | `/inbox-assistant:status`, which only reads |

`/inbox-assistant:test` writes receipts like any other run, with `dry-run` in the Result column when nothing was actually called.

There is no test-status section here. Whether an action has passed its real-data test lives in its control block in `Task Settings`, and that is the only authority on it. See `references/action-controls.md`.

## Receipt ordering

Every action follows the same three steps, in this order:

1. **Write the intent row.** Timestamp, run ID, action ID, exact Zapier tool, target ID, Result left empty.
2. **Make the call.**
3. **Fill in the Result.** `ok`, `failed: <one line>`, or `unknown` when the call neither confirmed nor clearly failed.

**If the intent row cannot be written, the action does not happen.** Fail closed. A write with no receipt is a write nobody can audit, and the next run has no way to know it happened.

The run ID is generated at the start of the run and appears on every row that run writes. That is what tells two overlapping runs apart when their rows land in the same table.

Three failure categories:

1. **The batch that writes receipts at the end.** A run archives eight messages and plans to write eight rows afterwards, to save file writes. If it crashes after the fifth call there is no record of any of them. Write the intent row before each call, one at a time.
2. **The result that never lands.** The Zapier call times out. Do not guess `ok` because the payload looked fine, and do not guess `failed` because it did not return. Write `unknown`, open a Partial failures row, and leave the target for the owner unless the action is safely repeatable and re-reading the target proves nothing happened.
3. **The empty Result found by the next run.** Tomorrow's run reads a row for `send-reply` on a thread with an empty Result. That is not permission to try again. Re-read the target first. If the reply is there, close the row as `ok`. If it is genuinely absent, it still becomes a proposal, because a second send is the failure this whole ledger exists to prevent.

## Checkpoints

A checkpoint row says: everything up to this moment has been fully accounted for. Advance it only when every intended read finished and every enabled action either completed or has a Partial failures row.

Three failure categories:

1. **The partial read.** The mail route errored halfway through the window. Do not advance the checkpoint to now, or the unread half is lost forever. Advance it to the last point actually covered, and say in the footer where the window really ended.
2. **The skipped mailbox.** Two mailboxes are in scope and one was uncovered because its only read tool marks messages as read. The checkpoint covers the run, not the mailbox, so advance it and record the uncovered mailbox in Notes and in the footer. The next run reads the same note and does not silently pretend that mailbox is fine.
3. **The action still open.** The brief is finished and one `save-draft` call returned `unknown`. Do not advance until that row exists in Partial failures. Advancing first means the next run has no reason to look at it.

## Retention and pruning

Prune when you write, not on a schedule, because there is no scheduled maintenance run.

- **Processed sources.** At most the last 7 days, at most 200 IDs per source.
- **Write receipts.** At most the last 30 days, at most 100 rows. **Never evict a row newer than the oldest active checkpoint, and never evict a row whose Result is empty**, however old it is. Those are exactly the rows that prevent a double action.
- **Partial failures.** At most 50 open rows. When the file is at the cap, remove the oldest rows that are already resolved. If all 50 are open, keep them and say in the output that the ledger is full and needs the owner's attention.
- **Connector health, Checkpoints, Scheduled tasks.** Fixed size. Update rows in place, never append duplicates.

## When the file is missing

Two very different cases, told apart by whether `## Action controls` exists in `Task Settings`.

**State absent and `## Action controls` absent, with four valid v1 files present.** This is a v1.1 install that has not been upgraded. It is not damage. `/inbox-assistant:setup` treats it as an upgrade, and a run that meets it treats every action as disabled, notes it in the footer, and proceeds read-only. A mid-upgrade member still gets their brief.

**State absent and `## Action controls` present.** This is a damaged v2 install, because the two are created together. Enter recovery mode:

- Treat the kill switch as `on`. No business write happens, whatever the control blocks say.
- A scheduled run emits a blocked-run notice only. It reads no mail, because with no checkpoints and no processed sources it cannot tell what it has already handled or already done.
- `/inbox-assistant:setup` repairs it: rebuild `Inbox Assistant State` from what `Task Settings` shows, with the owner confirming each recovered value, and set every checkpoint back to `never`.

Three failure categories:

1. **The helpful recreate mid-run.** A scheduled run finds no State, sees the control blocks, and recreates the file so it can carry on. Do not. A fresh State with empty receipts is a run that believes it has never done anything, which is how an action happens twice. Emit the notice and stop.
2. **The recovery that trusts the old counts.** Repair rebuilds Setup, Provider, and the scheduled-task list, all of which are visible facts. It does not invent checkpoints or receipts. Those start empty, and the first run after a repair re-reads a window it may have already covered, which produces a duplicate brief and never a duplicate action.
3. **The schema version that does not match.** The file exists but says `Schema version: 1`, or the line is gone. Treat it as damaged, not as current. Do not read a v1 layout as if it were v2, and do not upgrade it silently: `/inbox-assistant:setup` handles it with the owner watching.

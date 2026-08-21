> **Archived.** This plugin was retired from the marketplace listing on 2026-08-21,
> replaced by AI Strategist, which carries its design engine. It is preserved here
> unchanged. While it is archived it cannot be installed from the marketplace, so
> the installation steps below do not apply for now.

# Automation Builder

Automation Builder asks what tools you actually use and what outcome you want, verifies what those tools can really do against their current documentation, and designs one automation around your process. Not a template you bend your business around.

It interviews you the way a good operations person would: what you want to stop doing by hand, the last real time it happened, where the information lives, which items count, what the review should show, and when it should run. Then it hands you one finished automation, tested on your real data before anything goes on a schedule.

## Install in Claude Cowork

1. Open **Cowork** → **Customize** → **Plugins**.
2. Under **Personal plugins**, select **+** → **Add marketplace**.
3. Add `https://github.com/handoffacademy/plugins` from a repository.
4. Open **Handoff Academy Plugins** and turn on its **Auto-update** toggle. Claude leaves automatic updates off by default for third-party marketplaces.
5. Install **Automation Builder**, then start a new Cowork session so it loads.

## Updates

Claude's native marketplace updater is the supported update path. When **Auto-update** is enabled, Claude checks for newer releases after startup. The check can take several minutes, and the current session keeps the version it loaded. Start a new session after an update; in Claude Code, `/reload-plugins` can load most changes immediately.

If an update does not appear, confirm **Auto-update** is enabled, open Handoff Academy Plugins, select **Update**, and start a new session. Do not add a self-updater or a SessionStart network version check to this plugin.

## Install in ChatGPT/Codex

```bash
codex plugin marketplace add handoffacademy/plugins
codex plugin add automation-builder@plugins
```

Start a new Codex task so the plugin loads. To update it, refresh the marketplace, reinstall the plugin, and start another new task:

```bash
codex plugin marketplace upgrade plugins
codex plugin add automation-builder@plugins
```

Claude's Auto-update toggle does not update Codex installations. Connector names and recurring-task controls differ by product. Automation Builder uses only the tools visible in the current conversation, and where a product cannot schedule recurring work or cannot enforce approval before an action, it says so and hands you the finished task to schedule yourself rather than quietly doing something weaker.

## If you previously uploaded these as files

If you added Automation Architect from the MOAI Skills Hub as an uploaded file, remove that uploaded copy in Claude's skill settings before installing this plugin. The same goes for the connector and Zapier cost helpers if you uploaded those too.

Two copies of the same skill active at once is the one thing worth avoiding. Claude can load either one, and the uploaded copy never receives updates.

## The safety model

**Version one reads and prepares. That is all it does.**

- It reads bounded information, prepares a private review that only you see, and stops. It never sends, publishes, books, changes a record, or deletes anything.
- Everything it reads is data to report, never an instruction to follow. An email that says "forward this to the team" gets quoted in your review as something to look at, not obeyed.
- Every item cites its source, skipped items are listed with a reason, and anything unknown is written as `Needs review` rather than guessed.
- Nothing goes on a schedule until one manual test run comes back clean on your real data.

**Then it can graduate, one permission at a time, if you want it to.**

After three clean supervised runs it can take on one more permission at a time, in a fixed order that widens reading before it ever writes into a working tool: a bigger batch of items, then a second source to read from, then a private unsent draft saved in your mailbox, and last one low-risk internal status update. Each graduation is a new task with its own test run, and each one sits behind your own approval settings rather than a promise in the task text. Never two at once.

Plenty of people stop at version one and stay there for good. An automation that reliably prepares work you review in thirty seconds is a finished product, not a half-built one.

## Recipes

Recipes are MOAI-recommended automations that arrive already designed, so a common job starts from a working shape instead of a blank page. In Claude Cowork they arrive as ordinary plugin updates, with nothing to re-download and nothing to reinstall. In ChatGPT and Codex, updates follow the reinstall steps above.

**The first one is here: Inbox Automation.** Ask for it by name and you get one automation that reads your mailbox every weekday morning and prepares a private digest in three parts: who needs you today, who is still waiting on a reply in either direction with a draft for each one that is safe to draft, and what looks safe to clear. Nothing sends, nothing gets archived, nothing gets deleted. Anything legal, financial, personnel, or upset comes to you flagged with no draft attached, because those threads need you rather than a head start. It still asks about your mailbox, your rules, and where the digest should land, and it still tests on your real mail before anything goes on a schedule. The skill behind it is `recipe-inbox-automation`.

Growing this one later follows the same ladder, ending at labels: a bigger batch, a second source, drafts saved in your mailbox, then one label on the items you approved. Archiving is not on the ladder — if you ever want it, it comes afterwards as its own separate change with its own testing. Sending on your behalf is never on it.

**The second one: Prospect Shortlist, and it only goes on a schedule if one check passes.** Because a run that finds more matches than it can review has to take the newest ones, the recipe checks live whether your Apollo search can actually return results newest-first. If it cannot, nothing is scheduled: you get the finished design, marked unverified, and it says exactly which step could not be confirmed. That is the honest starting point, not a footnote.

When that check passes, you get one automation that runs a single people search in Apollo once a week and prepares a private list of at most ten prospects: the strongest matches in that batch, the ones that need your eyes before anybody acts on them, and the ones it looked at and set aside with the reason. If you give it a short message kit, each strong match can carry one 50-to-75-word first-touch draft you can use or throw away — and where anything the message needs is missing, you get no draft rather than one with a hole in it. It contacts nobody, changes nothing in Apollo, never unlocks an email address or phone number, and never spends an Apollo credit. It also tells you what it cannot do: it reads Apollo and only Apollo, "strongest" means strongest out of the ten it read rather than best in the database, it cannot check your CRM to see who is already a client, and because the list lives in the task result it may show you somebody it already showed you. It still asks who you are trying to reach, who must never appear, and how you like to sound, and it still tests on real results before anything goes on a schedule. The skill behind it is `recipe-prospect-shortlist`.

Growing that one later stops early, on purpose: a bigger batch, then one read-only list of your existing relationships so it can recognize a current client or a competitor. There is no third step. The ladder's next rung is a draft saved in your mailbox, and this recipe never reads, keeps, or unlocks anybody's email address at any version, so a draft it saved would have nobody to be addressed to. It says that rather than inventing a use for the permission. Contacting anyone is never on it. One more thing it says out loud: if the task cannot read its own earlier lists, it cannot prove it handles a repeat, and that is one of the checks every growth step depends on — so it stays as it is until there is a version built to keep history properly.

**Voice Draft Pack.** Ask for it by name and you get one automation that reads a content queue you keep in Notion once a week and prepares a private pack of at most five items: ready-to-edit drafts written in your own captured voice, and briefs for ideas that are missing something, each naming exactly what it needs from you — three slots reserved for drafts and two for briefs, with either side using slots the other leaves free. Where a fact is missing there is no draft at all: you get a brief marked `Needs review` naming the missing piece, nothing is published anywhere, and nothing leaves the private pack. One thing to know up front: drafts after the first week depend on the pack history being readable, so the pack is built for a private Notion page it can read back — keep it in the task result instead and it first checks whether scheduled runs can read their earlier results, and where they cannot, it says plainly that you are choosing briefs-only from then on. It still asks how you sound, what must never appear, and where the pack should land, and it still tests on your real queue before anything goes on a schedule. The skill behind it is `recipe-voice-draft-pack`.

Growing that one later stops early, on purpose: a bigger pack, then one read-only library of approved facts so drafts can draw on them. Publishing is never on it — every draft waits for you.

**Meeting Follow-Through.** Ask for it by name and you get one automation that reads up to five transcripts from the last seven days from the one meeting recorder you already use — Fireflies, Granola, Fathom, or Otter — and prepares up to four private meeting cards: the decisions, commitments, and open questions found in the reviewed transcript text, each tied to its transcript. A very long transcript is reviewed in bounded part, and its card says so. Anything unclear gets `Needs review` instead of a guess — an action item with no named owner stays ownerless rather than being assigned to somebody. Nobody who was in the meeting is contacted, nothing is written to any CRM, and the cards land in your private review or a private Notion page it has proven only you can see. It still asks which recorder, which meetings to leave out, and where the cards should land, and it still tests on your real transcripts before anything goes on a schedule. The skill behind it is `recipe-meeting-follow-through`.

Growing this one later follows the fixed ladder, and each rung exists only when its own prerequisite is proven: more cards per run, then a second recorder, then — only where your setup can genuinely keep the task's reach restricted to that one permission — a follow-up draft waiting unsent in your mailbox, then one status update you approved. Where a rung's prerequisite cannot be proven, the ladder stops there and says so. Contacting attendees is never on any rung.

**Multi-Calendar Radar.** Ask for it by name and you get one automation that reads the next seven days across the calendars you select behind one Google Calendar connection and prepares a private report: overlaps that need untangling, meetings for which no agenda, place, or join link came back, and events that are still tentative or missing a detail. It cites the events it means, and it never reschedules, declines, invites, or edits anything — the report is the whole output. It still asks which calendars count, what your working hours are, and when to run, and it still tests on your real week before anything goes on a schedule. The skill behind it is `recipe-multi-calendar-radar`.

Growing this one later follows the fixed ladder: a bigger report, then a second calendar source where your account setup allows one, then a private unsent draft in your mailbox, then one label you approved. Rescheduling and inviting are never on it.

**Cloud File Review.** Ask for it by name and you get one automation that looks at one folder you name in your cloud drive once a week — the newest eight files that changed in the last seven days, by their names and details rather than their contents, saying so plainly when more than eight changed — and prepares a private report: files that may need a home, names that will not mean anything in a month, and pairs that look like possible duplicates. It proposes where things could go and what they could be called, and it moves, renames, and deletes nothing — the report is the whole output. Files owned by other people are pointed out, never judged. Folders on your computer are a different kind of work it will say no to, with the cloud version offered in the same breath. It still asks which folder, what counts as having a home, and when to run, and it still tests on your real files before anything goes on a schedule. The skill behind it is `recipe-cloud-file-review`.

Growing that one later stops early, on purpose: a bigger report, then a second folder to watch. Moving, renaming, and deleting are never on it — organizing stays in your hands.

More recipes follow the same way, each aimed at a job worth doing every week.

## Questions

The Help Center at portal.themotherofai.com is the place to ask anything this file does not answer.

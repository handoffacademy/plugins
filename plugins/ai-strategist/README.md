# AI Strategist

AI Strategist interviews you about everything you are running — every business, every role, and the parts of your life that take real work — and writes you one Hub Strategy document: which Claude Projects to create, what each one reads, the skills and plugins each one needs, what runs on a schedule, and where the results land in your Notion hub.

It is a plan, not a build. The strategy sitting writes exactly two local files, your document and the page that renders it, and creates nothing in your workspace, your hub home base, your projects, your connections, or your schedules. You leave with a document you understand and an order to work through it in, starting with one project rather than nine.

You get it twice over: the written document, and a one page summary of it. In Cowork that page opens in the panel beside you, with a Download button if you want to keep it on your phone; everywhere else it is saved next to the document. The page is a map of the plan, and the document is what you build from.

**Two ways to run it.** The Quick Plan is the short route: eight short questions, a map naming which Academy module builds each area you named, and a full write-up only for a custom area you choose to build first. The full interview is the long one: nine questions, and the first three projects written out. Your document says at the top which of the two wrote it, and you can ask for the other whenever you want it.

In the full interview it checks what Claude and Notion can currently do against their own documentation while you are sitting there, instead of working from memory. The Quick Plan does not stop to look anything up, so its capability lines come to you labeled unverified on purpose. Either way every line is labeled, and an unverified line is a stop rather than a green light: whoever helps you build re-checks that exact thing on your account before anything is set up on it.

## What comes with it

- **Hub Strategy** — the interview and the document. Ask for it by name, or say "design my AI hub strategy".
- **Notion Hub** — the Notion expert. It designs your workspace during the strategy session, and when you sit down to build, it walks you through creating the pages and databases with you watching every step.
- **The design engine** — the automation designer that came over from Automation Builder. When your strategy says a project should check something every morning, this is what turns that line into a real scheduled task: its own interview, a check on what your connection can actually read, and a test on your real data before anything goes on a schedule.
- **One helper** — the connection check, which reports which connected apps can actually be used and what each one can read, taken from the vendors' current documentation rather than from memory.

## Install in Claude Cowork

1. Open **Cowork** → **Customize** → **Plugins**.
2. Under **Personal plugins**, select **+** → **Add marketplace**.
3. Add `https://github.com/handoffacademy/plugins` from a repository.
4. Open **Handoff Academy Plugins** and turn on its **Auto-update** toggle. Claude leaves automatic updates off by default for third-party marketplaces.
5. Install **AI Strategist**, then start a new Cowork session so it loads.

## Updates

Claude's native marketplace updater is the supported update path. When **Auto-update** is enabled, Claude checks for newer releases after startup. The check can take several minutes, and the current session keeps the version it loaded. Start a new session after an update; in Claude Code, `/reload-plugins` can load most changes immediately.

If an update does not appear, confirm **Auto-update** is enabled, open Handoff Academy Plugins, select **Update**, and start a new session. Do not add a self-updater or a SessionStart network version check to this plugin.

## Install in ChatGPT/Codex

```bash
codex plugin marketplace add handoffacademy/plugins
codex plugin add ai-strategist@plugins
```

Start a new Codex task so the plugin loads. To update it, refresh the marketplace, reinstall the plugin, and start another new task:

```bash
codex plugin marketplace upgrade plugins
codex plugin add ai-strategist@plugins
```

Claude's Auto-update toggle does not update Codex installations. Product names, connector availability, and recurring-task controls differ by product, so AI Strategist uses only the tools visible in the current conversation and says plainly where a product cannot do something rather than quietly doing something weaker. Where a product cannot schedule recurring work, it hands you the finished task to schedule yourself — but only where every source in it is a native connector that product verified and the task's reach can be narrowed to those sources plus the one place its results land. Where it cannot, it says the task is not schedulable there rather than handing you one that looks ready.

## If you have Automation Builder installed

**Remove Automation Builder before you install AI Strategist.** The automation designer inside AI Strategist is the same skill Automation Builder carried, so running both leaves two copies of it active at once. Claude can load either one, and only one of them receives updates.

Scheduled tasks you already built are not affected by any of this. A task runs on the text it was created with, so removing the plugin that designed it changes nothing about what it does tomorrow morning. The same goes for the ready-made automations: an inbox digest or a prospect shortlist you built with Automation Builder keeps running exactly as it is.

Automation Builder is no longer listed in the marketplace. If you keep it installed it will keep working, and it will stop receiving updates.

If you added Automation Architect as an uploaded file rather than through the marketplace, remove that uploaded copy in Claude's skill settings too, for the same reason.

## The safety model

**The strategy session writes two files, your document and the page that renders it. That is all it does.** No project is created, no connector is turned on, no task is scheduled, and nothing is created in your workspace or your Notion hub while you are being interviewed.

- Every capability in your document is labeled. `Verified` with a date means it was checked against current documentation in that session. `Unverified` means it could not be checked, and it says so rather than guessing.
- **Those labels expire.** A verified line is a record of one check on one day. Before you build any project in the document, ask for its capabilities to be re-checked, however recent the date looks.
- Anything you said should never happen goes into the document in your own words, alongside a floor that applies whatever else changes: nothing sends, publishes, pays, or deletes on its own, no passwords or keys go into a chat, legal and medical judgment stays with your professional, and financial records come in one way only, as statements and exports you download yourself, never through a live bank or payment connection and never through a browser.
- Anything sensitive — legal, medical, your children, your finances — gets its own separate project, and the document says why in your words.

**When you build, one project at a time.** The build order starts with a single project, chosen because it is daily, boring, and low-risk. Sensitive projects are recommended later, and if you decide to build one first, every privacy, isolation, test, and permission gate still applies to it exactly as it would have. Nine projects half-built is the failure this is designed around.

**Scheduled tasks keep the limits they always had.** Every task the design engine builds reads bounded information, prepares a private review only you see, and stops. Nothing goes on a schedule until one manual test run comes back clean on your real data.

**Building your Notion hub happens with you watching.** The Notion expert creates one thing at a time, each one something you asked for in that message. It never deletes, moves, renames, or shares anything, and it never leaves a test page behind in your workspace.

## Questions

The Help Center at portal.themotherofai.com is the place to ask anything this file does not answer.

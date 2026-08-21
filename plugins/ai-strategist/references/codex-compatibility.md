# ChatGPT and Codex compatibility, and the parts that bind everywhere

Apply these rules whenever AI Strategist runs in ChatGPT or Codex. Where this file conflicts with any later instruction in a skill, this file wins on these platforms.

**Three parts of this file are not platform-specific, and the heading above does not scope them.** The two browser rules under **Connectors and tools**, the whole of **Web verification**, and the whole of **Writes and graduation** are plugin-wide policy, in force on **every** platform this plugin runs on: Claude, Cowork, Claude Code, ChatGPT, Codex, and anything else it is ever installed into. Being on Claude relaxes none of them, no skill may narrow any of them, and "that rule is in the Codex file" is never a reason to skip one.

They live here because the rest of this file is where a skill already comes to read about platforms, and keeping one copy beats keeping four that drift. That placement is a filing decision, not a scope. Each skill's own **Platform compatibility** block is what makes it binding: every skill in this plugin instructs you to read these three parts on **every** platform, and the rest of this file on ChatGPT and Codex. If you have arrived here only because you are on ChatGPT or Codex, read those three anyway and carry them back with you.

The Hub Strategy is written for the account the member will actually build in, which is usually their Claude account. Being interviewed in a different product does not change what the document is for. Say which product you are in, name anything you could not check from here, and never describe a capability of the target account as confirmed because it exists in this one.

## Scheduled work

If the current product has a native recurring-task feature that can carry the complete safety preamble, use it. **Where that feature offers more than one run location — a run hosted on the vendor's side and a run on the member's own machine — the hosted run is the default across this plugin.** Which locations a product offers is verified in the session, per product, and never assumed in either direction. **Where both locations exist, a local run needs a verified named dependency. Where local is the only verified location, no dependency is needed — it is the only way the task can run — but the disclosure is not optional in either case.** Whenever the task will run locally, however it came to be local, the member is told in plain words that their computer has to be on, awake, and logged in at run time or the task will not run, and that sentence goes into whatever they confirm before the task is created: the build card and the `Runs:` line in a task design, the task's own line in a Hub Strategy document. A sole-local surface removes the choice, never the disclosure. **And where local is the only verified location and the member has no computer, the task cannot run at all.** Say that plainly rather than writing a computer-on requirement for a machine that does not exist, leave the task out of the plan, and name what is left: the by-hand version of the job, or the area waiting until something changes. A requirement nobody can meet is not a caveat on a task; it is the absence of one. Selecting a location also opens its own checks: the exact read, the destination write and its privacy preflight, approval enforcement, tool reach, and cost are re-verified for the location that was chosen, and anything unchecked there is labeled unverified and scheduled by nobody. If it cannot — plain ChatGPT without scheduled tasks is the common case — produce the finished task package instead: the task name, the cadence, and the full prompt text including the Allowed and NOT allowed block. **Two things travel with that package, because you cannot check the other product from here.** The `Runs:` line carries one further fixed sentence: check where that product runs the task, and if it runs on your computer, it has to be on, awake, and logged in at that time or nothing happens. And the package carries one instruction beside the cadence: run it once by hand there and read the result before you schedule it. Then say plainly:

```text
I can't schedule this here; here is the exact task to schedule where you run recurring jobs.
```

Never report a task as scheduled when it was not, and never substitute a third-party scheduler for the missing feature.

## Writes and graduation

**This whole section is plugin-wide policy on every platform, not ChatGPT and Codex guidance.** What version one may write, and what a platform must be able to enforce before anything beyond it is offered, do not change with the product you are in.

On every platform, the only thing version one ever writes is its own report into the one private destination the member chose. Everything else it touches is read-only. Graduation steps 3 and 4 — a private unsent mailbox draft, then one low-risk internal status update — are available only where the platform can both enforce approval before an action and restrict which tools the task can reach. If it cannot do both, say so and stay at version one. A product that shows a confirmation prompt but hands the task every connected tool fails the second test, so graduation is unavailable there. Unavailable is the accurate word: this is a platform limit, not an honor-system rule anyone can waive.

Designing a hub is not a write. The strategy work produces a document and nothing else. Building the member's workspace is separate, it happens with the member watching, and it follows the same rule as any other write: only what the platform can show them before it happens.

## Connectors and tools

Use only the connectors, apps, and tools visible in the current conversation. Match them by capability and full effect, never by vendor display name — a tool labeled "Gmail" that can only send is not a read route, and a tool labeled "notes" that can also email is not read-only. A missing connector is a missing route, and what that stops depends on which work you are doing. **Building, testing, running, and scheduling stop there:** nothing is created, tested, turned on, or scheduled against a route that is not visible in this session, and no missing tool is worked around. **Strategy work continues:** a Hub Strategy may carry on down its connector ladder and write in a route the member sets up afterwards — verified against current documentation, labeled like every other capability line, and named as a route to set up rather than one that is available now. Naming an absent tool as a step to take later is planning. Acting through one is not, and it never happens.

**The next two paragraphs are plugin-wide policy on every platform, not ChatGPT and Codex guidance.** Two browser rules live here, and they are not the same rule. Read both before you name a browser anywhere.

**Unattended browser automation is banned, with no exception.** Nothing the design engine schedules may drive a browser, and no scheduled task written anywhere in this plugin may reach a browser, a shell, or a remote-control tool to stand in for a connector that is not there. A task runs alone in a fresh session with nobody watching it, which is exactly the condition under which a browser step is unreviewable. Where neither a connector nor the member's own Zapier bridge covers the source, the honest answer is that it is out of reach on a schedule, and a browser never stands in for the missing route.

**Interactive, member-present browser use is a sanctioned fallback in one place only: a source named in a Hub Strategy document that neither a connector nor a Zapier route reaches.** It is read-and-summarize work, the member is at the keyboard for all of it, the member types their own credentials, and it never becomes a scheduled step later. Write it into the document as a watched routine, labeled as such, so that nothing about it reads as automation. Verify the current product name and availability of any browser tool before you name it, like every other capability.

If you cannot tell which of the two rules a proposal falls under, it is the first one, and the answer is no.

## Web verification

**This whole section is plugin-wide policy on every platform, not ChatGPT and Codex guidance.** The process-only rule is platform-independent, and so is the session gate. Every skill in this plugin checks the capabilities it is about to rely on against live documentation inside the current session, before the first recommendation, on every platform. Nothing carries over into another session, including another session on the same day: not a check from an earlier session, not a `Verified` label inside a document the member pastes in, and not anything written in a SKILL.md file. A label records one check in one session, and it is never reusable in a different one.

If this product has no web search or browsing, fail closed the way the skills say: state at the start that you cannot check anything right now, label every capability `Unverified — confirm at office hours`, and schedule nothing. Never recite a remembered limit, price, or capability in place of a check, and never let built-in knowledge stand in as fact because a check was unavailable.

## Updates

Claude updates through the marketplace's own sync and update controls. Codex updates with `codex plugin marketplace upgrade plugins`, followed by reinstalling the plugin. A running session keeps the version it loaded, so start a new session or task after an update. Never edit installed cache contents as an update mechanism.

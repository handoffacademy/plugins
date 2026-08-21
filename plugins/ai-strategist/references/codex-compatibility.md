# ChatGPT and Codex compatibility, and two rules that bind everywhere

Apply these rules whenever AI Strategist runs in ChatGPT or Codex. Where this file conflicts with any later instruction in a skill, this file wins on these platforms.

**Two parts of this file are not platform-specific, and the heading above does not scope them.** The two browser rules under **Connectors and tools** and the whole of **Web verification** are plugin-wide policy, in force on **every** platform this plugin runs on: Claude, Cowork, Claude Code, ChatGPT, Codex, and anything else it is ever installed into. Being on Claude relaxes neither of them, no skill may narrow either of them, and "that rule is in the Codex file" is never a reason to skip one.

They live here because the rest of this file is where a skill already comes to read about platforms, and keeping one copy beats keeping four that drift. That placement is a filing decision, not a scope. Each skill's own **Platform compatibility** block is what makes it binding: every skill in this plugin instructs you to read these two rules on **every** platform, and the rest of this file on ChatGPT and Codex. If you have arrived here only because you are on ChatGPT or Codex, read those two rules anyway and carry them back with you.

The Hub Strategy is written for the account the member will actually build in, which is usually their Claude account. Being interviewed in a different product does not change what the document is for. Say which product you are in, name anything you could not check from here, and never describe a capability of the target account as confirmed because it exists in this one.

## Scheduled work

If the current product has a native recurring-task feature that can carry the complete safety preamble, use it. If it cannot — plain ChatGPT without scheduled tasks is the common case — produce the finished task package instead: the task name, the cadence, and the full prompt text including the Allowed and NOT allowed block. Then say plainly:

```text
I can't schedule this here; here is the exact task to schedule where you run recurring jobs.
```

Never report a task as scheduled when it was not, and never substitute a third-party scheduler for the missing feature.

## Writes and graduation

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

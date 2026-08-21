# ChatGPT and Codex compatibility

Apply these rules whenever Automation Builder runs in ChatGPT or Codex. Where this file conflicts with any later instruction in a skill, this file wins on these platforms.

## Scheduled work

If the current product has a native recurring-task feature that can carry the complete safety preamble, use it. If it cannot — plain ChatGPT without scheduled tasks is the common case — produce the finished task package instead: the task name, the cadence, and the full prompt text including the Allowed and NOT allowed block. Then say plainly:

```text
I can't schedule this here; here is the exact task to schedule where you run recurring jobs.
```

Never report a task as scheduled when it was not, and never substitute a third-party scheduler for the missing feature.

## Writes and graduation

On every platform, the only thing version one ever writes is its own report into the one private destination the member chose. Everything else it touches is read-only. Graduation steps 3 and 4 — a private unsent mailbox draft, then one low-risk internal status update — are available only where the platform can both enforce approval before an action and restrict which tools the task can reach. If it cannot do both, say so and stay at version one. A product that shows a confirmation prompt but hands the task every connected tool fails the second test, so graduation is unavailable there. Unavailable is the accurate word: this is a platform limit, not an honor-system rule anyone can waive.

## Connectors and tools

Use only the connectors, apps, and tools visible in the current conversation. Match them by capability and full effect, never by vendor display name — a tool labeled "Gmail" that can only send is not a read route, and a tool labeled "notes" that can also email is not read-only. A missing connector is a missing route: name what is unavailable and stop that branch. Never substitute browser automation or shell access for a connector that is not there.

## Web verification

The process-only rule is platform-independent. If this product has no web search or browsing, fail closed exactly as the skills say: state that you cannot check what their tools can do right now, ask them to switch web search on, and if they cannot, label every unchecked step `Unverified — confirm at office hours before scheduling` and schedule nothing. Never recite a remembered limit, price, or capability in place of a check.

## Updates

Claude updates through the marketplace's own sync and update controls. Codex updates with `codex plugin marketplace upgrade plugins`, followed by reinstalling the plugin. A running session keeps the version it loaded, so start a new session or task after an update. Never edit installed cache contents as an update mechanism.

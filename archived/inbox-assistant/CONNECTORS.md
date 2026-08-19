# Connecting your Inbox Assistant

Two connections, two different screens, two different jobs.

- **Reading your mail** normally happens through the connector inside the host product. One sign-in.
- **Inbox Assistant changes** happen through your own Zapier server, and only for the specific actions you turn on.

Current Gmail and Microsoft 365 connectors may expose native write tools. Inbox Assistant does not use those writes. It uses Zapier as its portable action layer so Claude and Codex share the same exact-tool controls and receipts.

You need the first one. The second one is optional and can wait as long as you like.

## Reading: the connectors inside Claude

1. Open claude.ai.
2. Go to Settings, then Connectors.
3. Turn on Gmail or Outlook.
4. Sign in when it asks. That is the whole thing.

Then run `/inbox-assistant:status` and check that each route says it read something just now. A connector that is listed but not answering is the one failure worth catching early.

### If your Outlook is a personal account

The Outlook connector is built for work and school Microsoft 365 accounts. It does not reach a personal outlook.com, hotmail.com, or live.com mailbox. There is no switch for this and no workaround inside Claude's settings.

Your route is Zapier, below. Until that is connected, your Inbox Assistant has no way to read that mailbox, and it will tell you so rather than pretending otherwise.

## Making changes: your Zapier server

Covered by the Setting up Zapier MCP lesson at portal.themotherofai.com. Follow the lesson rather than any steps written down here, because Zapier's setup changes and the lesson is kept current.

One thing to get right while you are in there:

> **Add only the actions you actually intend to turn on.** If you never want your Inbox Assistant sending email, do not add a send action to your Zapier server at all. A tool it cannot see is a tool it cannot use by mistake, and that is the strongest protection you have.

Nobody will ever ask you to paste your Zapier server URL into a chat. That URL carries access to your accounts. This plugin does not ask for it, does not store it, and does not print it in any report.

## Turning on an action

Being connected is not the same as being turned on. All seven actions start off. When you ask for an outcome that needs one, Inbox Assistant requests that capability through the same short ritual:

1. You see the exact Zapier tool and which mailbox it reaches.
2. You see what the change would look like on one real item of yours, before anything happens.
3. For sending or deleting, you read one sentence about what can go wrong and confirm it.
4. You type `ENABLE <ACTION> UNATTENDED`.
5. It runs one real test on the smallest possible thing, and only a test that visibly worked turns the action on.

Switching an action off is one sentence in `/inbox-assistant:tune`, immediately, with no ritual. On is deliberate. Off is easy.

## Checking and fixing

`/inbox-assistant:status` is the one place to look. It checks each route live, lists what is turned on, shows what is scheduled, and shows anything that did not finish.

When something is broken, the fix is on one of two screens and it is worth knowing which:

- **A connector not reading** is Settings, then Connectors, inside claude.ai.
- **An action not working** is either the Zapier lesson at portal.themotherofai.com or `/inbox-assistant:test controls`, and status will say which.

## Turning it off completely

**Stop everything now:** `/inbox-assistant:pause all`. That pauses every scheduled task and sets a safety switch, so nothing writes to your mail even if a run is already going. It cannot unsend something already sent.

**Disconnect the reading:** claude.ai, Settings, then Connectors, and disconnect each one. Revoking it there ends Claude's access to that mailbox.

**Disconnect the writing:** delete or de-authorize your Zapier server, on Zapier's side. Removing individual actions there also works, and immediately: an action whose tool has disappeared stops working on the next run, because your Inbox Assistant will not substitute a different tool for a missing one.

## What is stored, and where

Four context files plus one safety ledger, `Inbox Assistant State`, saved in your Claude account.

The four context files are yours. Setup drafts them and shows you one summary of all of them before anything is saved, and nothing changes in them afterwards without you seeing the exact before and after: your business profile, your approved sources, your boundaries, and your task settings.

The safety ledger is the one the plugin keeps for itself. It holds message and thread identifiers, dates, a line for every action taken, and anything that did not finish. It holds no message bodies, no passwords, no keys, and no server URLs. You read it through `/inbox-assistant:status`.

This plugin adds no server of its own, no separate storage, and no analytics. Nothing here ships your mail to us or keeps a copy of it anywhere of our own. What it does not do is take your data out of everyone else's hands: your connector and action data is handled by Claude, by Zapier, and by your mail provider, each under its own policy and privacy terms. Those are the three companies already holding this data, and this plugin adds no fourth.

## One honest limitation

Those files have no locking. If two runs somehow overlap, or a run crashes at exactly the wrong moment, an action can happen twice: two drafts of the same reply, or in the worst case a reply sent twice.

Two things keep that small, and they are both on by default. Scheduled tasks that can write are never allowed to overlap, and `/inbox-assistant:schedule` staggers their times and refuses to create an overlap. And every action is written down before it happens, so anything unclear surfaces as "needs your eyes" in `/inbox-assistant:status` instead of being retried.

What you get is a full audit trail and cautious behavior when something is uncertain. What no software of this shape can promise is that an action happened exactly once. If that matters more to you than the convenience, leave the writing actions off and keep everything as drafts and proposals. That is a completely reasonable way to run this.

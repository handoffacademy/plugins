# Changelog

## 1.0.2

Your scheduled work now prefers to run somewhere your laptop lid does not affect.

- **Tasks are planned to run in the cloud by default.** Where your setup can host a recurring task on its own side, that is what your plan asks for, so the morning report is waiting whether your computer was open at six or shut in a bag. Which run locations your setup actually offers gets checked while you are sitting there, like every other capability — never assumed in either direction.
- **A task that has to run on your computer says so, and says why.** Some work genuinely depends on your machine: files that only live there, an app installed nowhere else. When that is the reason, your plan names it in one line rather than leaving you to wonder why this one is different.
- **And you are told what that costs you, before anything is scheduled.** A task running on your computer needs the computer on, awake, and logged in at the time it runs — asleep or shut means it does not run and nothing is waiting for you afterwards. That sentence goes into the summary you confirm, not just into the conversation, so it is still there when you read the plan back a month later.

## 1.0.1

When an app has no direct connection, your strategy now has one more route to try before it gives up on it.

- **The Zapier bridge joins the ladder.** A source Claude cannot reach directly used to leave two answers: a routine you sit and watch, or nothing on a schedule at all. Now there is a rung between them — your own Zapier connection, set up once, which can carry scheduled reads for apps no direct connection covers. Mail on a personal account, where the direct connection only reaches work accounts, is the case this was written for. It used to come back as impossible to schedule. It is not.
- **The rungs are tried in order, top down.** A direct connection first, checked for the kind of account you actually have. Then the Zapier route. Then a watched routine. Only when all three are gone does your strategy say a source is out of reach, and it says which rungs it ruled out and why.
- **It is checked, never assumed.** The route goes into your document as something to set up, with the setup on your connections list, carrying the same Verified or Unverified label as every other line. Whether your Zapier connection can really reach that app, and what running it every morning costs, are two separate checks — and both happen before anything goes on a schedule.
- **None of the limits moved.** A first version still reads and reports into one private place. A watched routine is still watched, still never scheduled, and still never pointed at a bank. The bridge changes what is reachable, not what is allowed.
- **The two helper skills now speak this plugin's name.** The connection check and the cost check do the same work they always did; they simply stopped describing themselves as parts of the retired Automation Builder.
- **Strategies already written do not change on their own.** A document says what it said the day it was written. The next time its capabilities are re-checked, which is what happens before you build from it, the new route gets picked up then.

## 1.0.0

The Academy's hub strategy work, as a plugin you install once.

- **AI Strategist interviews you and writes one document.** Every business you run, every role you carry, and the parts of your life that take real work: it asks about all of it, then hands you a Hub Strategy naming the Claude Projects to create, what each one reads, the skills and plugins each needs, what should run on a schedule, and where the results land. It builds nothing during the interview. You leave with a plan and a build order that starts with one project.
- **A Notion expert comes with it.** Most people have either never used Notion or have it as a junk drawer, and either answer is fine. The Notion skill designs your workspace while the strategy is being written — the layout, the databases worth having, one private page for each scheduled task to write into, the dashboards — and then, when you sit down to build, it walks you through creating them with you watching each step. It never deletes, moves, renames, or shares anything, and it never leaves a test page behind.
- **Nothing is claimed from memory.** Every capability in your document was either checked against current documentation while you were sitting there, and says so with the date, or could not be checked, and says that instead. Those labels expire on purpose: before you build any project, ask for its capabilities to be re-checked, however recent the date looks. Claude changes faster than any document keeps up with.
- **The automation designer came over from Automation Builder.** It is the same skill, doing the same job with the same limits: when your strategy says a project should check something each morning, it runs its own interview, verifies what your connection can really read, and tests on your real data before anything goes on a schedule. One change: it no longer routes you to the ready-made automations, because those retired with Automation Builder. The connection check and the Zapier cost check came over unchanged.
- **Automation Builder is retired from the marketplace, and AI Strategist replaces it.** If you have it installed, remove it before installing this one — the automation designer is the same skill in both, and two copies active at once means Claude can load either and only one of them updates.
- **Tasks you already scheduled are untouched.** A task runs on the text it was created with, so retiring the plugin that designed it changes nothing about what it does tomorrow morning. An inbox digest or a prospect shortlist built with Automation Builder keeps running exactly as it is. Keeping Automation Builder installed also keeps it working; it simply stops receiving updates.
- Works in Claude and Cowork, and in ChatGPT and Codex. Where a product cannot schedule recurring work, it says so and hands you the finished task to schedule yourself.

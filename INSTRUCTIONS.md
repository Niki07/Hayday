# INSTRUCTIONS.md — How this hackathon project runs

For Niki, and for every Claude session working in this folder. `CLAUDE.md` has the rules, `SETUP.md` has the environment and API conventions, this file has the workflow.

## The one-paragraph version
Fable 5.1 does all the thinking: it generates the idea, writes the plan, and makes every important decision. It then breaks the build into small handoff documents. Each handoff gets its own Claude session running Opus (hard task) or Sonnet (routine task). Those subrunners build, log their decisions in `ENGINEERING.md`, and report back. Anything important they are unsure about goes back to Fable. Repeat until the demo works.

## Model roles
| Model | Use it for | How to pick it |
|---|---|---|
| **Claude Fable 5.1** | Ideation, planning, architecture, every important decision, reviewing subrunner work, writing handoff docs | Pick "Fable 5.1" in the model picker of the Claude desktop app before sending the first message of the session (in a terminal: `claude --model claude-fable-5-1`, or `/model` inside a session) |
| **Claude Opus** | Hard implementation tasks: core logic, tricky integrations, debugging something nasty | Same picker, choose Opus |
| **Claude Sonnet** | Routine implementation: UI pages, boilerplate, scripts, docs, tests, small fixes | Same picker, choose Sonnet |

Keep **one long-lived Fable session** open all day. That is the "planning session". Everything important goes through it.

## Phase 0 — Setup (the night before)
- `CLAUDE.md`, `ENGINEERING.md`, `INSTRUCTIONS.md` and `SETUP.md` exist.
- **Do the "Tonight" checklist at the top of `SETUP.md`**: tools installed, GitHub CLI logged in, API keys created with credit, keys in `.env`, hackathon brief saved as `HACKATHON_BRIEF.md`.
- Decide now what stack you know best and write it at the top of `HACKATHON_BRIEF.md`. If you have no preference, `SETUP.md` has a default stack and Fable will use it.
- Nothing else is decided. No idea, no repo.

## Phase 1 — Ideation (Fable 5.1)
1. Open a new session in this folder with **Fable 5.1** selected.
2. Make sure `HACKATHON_BRIEF.md` has: theme or tracks, how long you have, team size, judging criteria, prizes or sponsor APIs, submission deadline and link, what you are comfortable building.
3. Send a prompt like:

   > Read CLAUDE.md, INSTRUCTIONS.md and SETUP.md. We are in Phase 1. The hackathon brief is in HACKATHON_BRIEF.md. Generate 5 to 7 ideas that can be demoed in the time available, score them on demo impact, feasibility in the time, fit with the judging criteria and sponsor prizes, and how much I'd enjoy building it. Recommend one. Ask me anything you need before recommending. Log the choice in ENGINEERING.md.

4. Push back, ask questions, pick an idea. Fable logs the final choice as a Major decision in `ENGINEERING.md`.
5. **Lock the idea by hour two.** Switching later almost never recovers the time.

## Phase 2 — Planning (Fable 5.1, same session)
Ask Fable to write `PLAN.md` containing:
- The idea in two sentences and the **demo script** (what the judges will see, step by step, 2 to 3 minutes).
- The tech stack and architecture, starting from the default in `SETUP.md` unless the idea needs otherwise, with each choice logged in `ENGINEERING.md`.
- The minimum demoable version (MVP), then stretch goals in priority order.
- A task breakdown: small tasks, each finishable in 30 to 90 minutes, each with a clear "done" test, each tagged **Opus** or **Sonnet**, with dependencies between them.
- The project skeleton: Fable creates the git repo, folder layout, `.env.example`, `README.md` with the one-command start, and scaffolding so subrunners start from something that runs.
- The LLM wrapper and `DEMO_MODE` from `SETUP.md` are always in the MVP task list.

Prompt:
> We are in Phase 2. Write PLAN.md as described in INSTRUCTIONS.md. Scaffold the project following SETUP.md so it runs end to end with placeholder content, init git, make the first commit and push to GitHub. Log every stack and architecture decision in ENGINEERING.md.

## Phase 3 — Handoff documents (Fable 5.1, same session)
Fable creates `handoffs/` and writes one file per task, `handoffs/NN-short-name.md`, using the template below. Good handoffs are specific: exact files, exact interfaces, exact done criteria. A subrunner should never need to guess.

Prompt:
> We are in Phase 3. For every task in PLAN.md that is ready to start, write a handoff doc in handoffs/ using the template in INSTRUCTIONS.md. Tell me which ones can run in parallel right now and which model each one should use.

## Phase 4 — Build (Opus and Sonnet subrunners)
For each ready handoff:
1. Open a **new session** in this folder, with the model named in the handoff selected.
2. First message:
   > Read CLAUDE.md, ENGINEERING.md, SETUP.md and handoffs/NN-short-name.md. Do that task and nothing else. Log your decisions in ENGINEERING.md and fill in the Report back section when done.
3. Let it work. Run 2 to 4 subrunners at once if their tasks do not touch the same files.
4. When a subrunner finishes, tell Fable to read the handoff file's Report back. Fable reviews, integrates, and writes the next handoffs.
5. Commit after every finished handoff. Push at least every hour.

Fable may also start subrunner sessions itself from the planning session. That is fine. The rule is the same: the handoff doc is the contract.

### If a subrunner hits an important decision
It must not decide. It either spawns a Fable 5.1 agent to decide, or logs the question in `ENGINEERING.md` as `Status: Open` and tells you. Take open questions to the Fable session. Fable answers and logs the answer.

### Watching agents work (what to check)
- Read the diff before accepting anything that deletes files, runs `rm -rf`, force-pushes, or installs a pile of new dependencies.
- "It compiles" is not "it works". Ask the agent to open the page in its built-in browser and show you, or open it yourself.
- If an agent is going in circles for 10 minutes, stop it, paste the error into the Fable session, and get a decision.

## Phase 5 — Integrate, test the demo, polish (Fable decides, subrunners do)
- Run the full demo script from `PLAN.md` end to end, early and often. **The first full run should happen before the halfway mark**, even if it is ugly.
- Any bug or gap becomes a new handoff.
- Stretch goals only after the demo script runs clean.
- Once it works: **record a 2-minute backup video** on your phone or with screen recording. Then keep building.

## Phase 6 — Demo prep (last 60 to 90 minutes)
- Freeze features. Only fix things that break the demo script.
- Make sure `npm run db:reset` (or equivalent) gets the app back to a clean demo state in one command. Run it before you present.
- Turn `DEMO_MODE` on if the venue wifi or an API is flaky. Nobody will know.
- Ask Fable to write `DEMO.md`: the talk track, the exact clicks, a backup plan if something fails live, and three sentences on what was hard and how it was solved (pulled from `ENGINEERING.md`).
- Ask Fable to write the submission text (Devpost or the form in the brief) from `PLAN.md` and `ENGINEERING.md`. Submit **15 minutes before** the deadline, not at it. Forms crash at the deadline.
- Rehearse once with a timer.

## First-hackathon tips
Things that cost first-timers the most time, in rough order:
1. **Keys, signups and installs during the event.** Do them tonight (`SETUP.md` checklist).
2. **Switching ideas late.** Lock by hour two. A finished mediocre idea beats an unfinished great one.
3. **No demo until the end.** Demo script running end to end by halfway. Polish after.
4. **Building what judges will never see.** Auth, settings pages, admin panels, perfect error handling: skip them.
5. **Dead API on stage.** `DEMO_MODE` plus a backup video.
6. **Lost work.** Git init first. Commit every 30 minutes. Push every hour. Never force-push.
7. **Not talking to sponsors and mentors.** Sponsor prizes have far fewer competitors than the grand prize, and mentors unblock in minutes what takes an hour alone.
8. **Submission panic.** Read the submission requirements in the morning (repo link? video? slides? team names?). Submit early.
9. **Agents doing too much.** Small handoffs, one at a time per file. Read what they delete.
10. **Running on empty.** Eat real food, drink water, charger always plugged in, and sleep at least a little if it is overnight. Tired decisions are bad decisions, and you can delegate building but not judgment.

## Handoff document template
Copy this into `handoffs/NN-short-name.md`.

```
# Handoff NN — <short task name>

- Model: Opus | Sonnet
- Depends on: <handoff numbers, or "none">
- Can run in parallel with: <handoff numbers>
- Estimated time: <30–90 min>

## Goal
<One or two sentences. What exists when this is done that does not exist now.>

## Context
<Why this task exists, how it fits the demo. Link the relevant PLAN.md section.>

## Read first
- CLAUDE.md
- ENGINEERING.md (especially D-xxx, D-yyy)
- SETUP.md
- <specific files or folders in the repo>

## Deliverable
<Exact files to create or change. Exact function names, routes, components, schemas, CLI commands. Be concrete.>

## Done when
- [ ] <observable check 1, e.g. "running `npm run dev` and opening /foo shows the list">
- [ ] <observable check 2>
- [ ] Works with DEMO_MODE=true as well as with real APIs
- [ ] Decisions logged in ENGINEERING.md
- [ ] Report back section below is filled in

## Constraints
<Stack, libraries allowed, style rules, what not to touch, anything the demo depends on.>

## Out of scope
<Explicitly list tempting things this task must NOT do.>

## Decisions already made (do not reopen)
- D-xxx: <one line>

## Decisions you may hit (escalate these to Fable 5.1)
- <e.g. "which storage to use if the in-memory list is too slow">

## Report back (filled in by the subrunner)
- Status: Done | Partially done | Blocked
- What was built:
- What was NOT done and why:
- Decisions logged: D-___
- Open questions for Fable:
- How to verify:
```

## Quick rules of thumb
- If you are not sure which model should do something, it is Fable's call. Ask Fable.
- If a task takes more than 90 minutes, it was too big. Split it.
- If two subrunners need the same file, they run one after the other, not in parallel.
- Everything important is written down in `PLAN.md`, `ENGINEERING.md` or a handoff. Chat history is not the record.

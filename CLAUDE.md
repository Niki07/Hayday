# CLAUDE.md — Hackathon project rules

Read this file first in every session. It applies to every model and every agent working in this folder.

## Project
- Niki's first hackathon. Event date: 2026-10-24.
- Current status: no idea chosen yet. The first job is ideation and planning (see INSTRUCTIONS.md).
- Goal: a working demo by the end of the hackathon. Working and shippable beats elegant.

## Companion files
- `INSTRUCTIONS.md` — the step-by-step workflow (ideation → plan → handoffs → build → demo). Follow it.
- `SETUP.md` — environment, ports, env variable names, API wiring conventions, default stack, copy-paste prompts. Follow it exactly.
- `ENGINEERING.md` — the engineering decision log. Append to it; never rewrite history.
- `HACKATHON_BRIEF.md` — the event's theme, rules, judging criteria and deadline, plus Niki's preferred stack. Written by Niki.
- `PLAN.md` — the chosen idea, demo script, scope and task breakdown. Written by Fable 5.1 during planning.
- `handoffs/` — one handoff document per subrunner task. Written by Fable 5.1 during planning.

## Who decides what (model roles)
Check which model you are running as (your system prompt states it) and follow your role.

| Model | Role | Allowed to |
|---|---|---|
| Claude Fable 5.1 | Planner, architect, decision-maker | Generate the idea, write PLAN.md, make every important decision, write handoff docs, review subrunner output |
| Claude Opus | Subrunner for hard tasks | Implement exactly the task in its handoff doc |
| Claude Sonnet | Subrunner for routine tasks | Implement exactly the task in its handoff doc |

Rules:
1. **All planning and all important decisions are made by Fable 5.1.** No exceptions.
2. An **important decision** is anything that changes the idea, scope, architecture, tech stack, data model, an external service or API, auth, deployment, or the demo. Also anything that would be hard to undo later in the day.
3. If you are a subrunner (Opus or Sonnet) and you hit an important decision: **do not decide it yourself.** Either spawn a Fable 5.1 agent (Agent tool, `model: "fable"`) with the full context and ask it to decide, or add an entry to `ENGINEERING.md` with `Status: Open` and tell Niki to take it to the Fable planning session. Then keep going on the parts of your task that do not depend on it.
4. Subrunners stay inside the scope of their handoff doc. If the handoff is wrong or incomplete, say so instead of improvising a bigger change.
5. Small, local, reversible choices (a variable name, a loop vs a map, which test to write first) are yours. Log them anyway if a later reader would wonder "why?".

## Engineering decision log (mandatory)
**Every engineering decision you make must be added to `ENGINEERING.md`, in the same turn you make it.** Use the template at the top of that file. This applies to decisions Fable makes during planning and to decisions subrunners make during implementation.

- Append at the bottom. Never edit or delete an old entry.
- If you reverse an earlier decision, add a new entry and mark the old one `Superseded by D-NNN`.
- Shortcuts, stubs, hardcoded values and fakes count as decisions. Log them so they are known and can be cleaned up.

A decision that is not in `ENGINEERING.md` did not happen.

## Secrets and environment (non-negotiable)
- All keys live in `.env` at the project root and nowhere else. `.env` is git-ignored. `.env.example` lists every variable name with a fake value and is committed; update it whenever you add a variable.
- Use the exact variable names in `SETUP.md`. Do not invent new ones without logging it.
- **Never print, log, echo, paste or commit a key.** Never hardcode one in source. If you need Niki to set one, name the variable and tell her where to get it.
- All LLM calls go through the single wrapper file described in `SETUP.md`. Every external call must work with `DEMO_MODE=true` (canned responses).
- Curl an API once from the terminal before building UI on it.

## Next.js version note
This project uses Next.js 16.4.3, which has breaking changes from what you may remember. Before writing any code under `src/`, read the relevant guide in `node_modules/next/dist/docs/` as `AGENTS.md` instructs. Heed deprecation notices.

## Git and safety
- Init git before writing code. Commit after every finished handoff, at least every 30 minutes. Push at least hourly.
- Never force-push, never rewrite shared history, never run `rm -rf` on anything you did not create this session, never delete the `.env`.
- Do not install large or unusual dependencies without a one-line reason in `ENGINEERING.md`.
- "It compiles" is not done. Run it, open it in the browser, and check the demo path actually works.
- Before every `vercel deploy`, run `npm run build` locally. Lint and tsc do not catch everything the production build does.

## Hackathon working style
- Demo first. Build what the judges will see, then the rest.
- Prefer boring, well-known tools that work out of the box over anything novel. Start from the default stack in `SETUP.md`.
- Hardcode, stub and fake freely when it gets the demo working. Log it in `ENGINEERING.md`.
- Blocked for more than about 10 minutes? Stop and escalate (to Fable or to Niki) instead of grinding.
- Do not spend time on auth, billing, CI, settings pages, admin panels, perfect error handling or multi-environment config unless the demo needs it.

## Handoff documents
When Fable splits the plan into subrunner tasks, each task gets `handoffs/NN-short-name.md` using the template in `INSTRUCTIONS.md`.
- A subrunner's **first** action: read `CLAUDE.md`, `ENGINEERING.md`, `SETUP.md` and its own handoff doc.
- A subrunner's **last** action: fill in the "Report back" section of its handoff doc and log any decisions in `ENGINEERING.md`.

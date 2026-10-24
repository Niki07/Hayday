# SETUP.md — Environment, ports, keys and API wiring

Practical conventions so no session has to guess. Agents: follow these exactly. Niki: do the "Tonight" part before the event.

## Tonight (before the hackathon) — checklist
Tick these off in the evening so nothing gets installed or signed up for under pressure.

- [ ] Tools installed and working: `node -v`, `npm -v`, `python3 --version`, `git --version`, `gh --version`
- [ ] `gh auth login` done (GitHub CLI logged in)
- [ ] Claude desktop app logged in; a test session in this folder reads CLAUDE.md
- [ ] GitHub account ready; a Vercel (or Netlify) account ready for deploy
- [ ] API keys created and pasted into `.env` (never anywhere else):
  - [ ] OpenRouter — https://openrouter.ai/keys — add $5 to $10 of credit
  - [ ] Anthropic — https://console.anthropic.com — add credit (optional if using OpenRouter)
  - [ ] Any sponsor APIs from the hackathon brief
- [ ] Supabase account created (optional, only if the idea needs a hosted DB)
- [ ] Hackathon brief saved as `HACKATHON_BRIEF.md` (theme, tracks, judging criteria, deadline, submission link, team)
- [ ] Laptop charger, water, snacks

## Secrets and env variables
- One `.env` file at the project root. It is in `.gitignore` and **never committed**.
- `.env.example` is committed. It lists every variable name with a fake value. Update it whenever a variable is added.
- Fixed names. Agents use these and do not invent new ones:

| Variable | Used for |
|---|---|
| `OPENROUTER_API_KEY` | LLM calls through OpenRouter |
| `ANTHROPIC_API_KEY` | Direct Anthropic calls (if not using OpenRouter) |
| `LLM_MODEL` | Model string, e.g. an OpenRouter slug. One place to change it |
| `DATABASE_URL` | Database connection string (SQLite file path or Postgres URL) |
| `NEXT_PUBLIC_API_URL` | Where the frontend finds the backend, default `http://localhost:8000` |
| `DEMO_MODE` | `true` returns canned responses instead of calling external APIs |

Rules for every agent:
- Never print, log, echo or paste a key. Never hardcode one in source. Read them from env only.
- If a key is missing, fail with a clear message naming the variable. Do not silently fall back.
- Frontend code only ever sees variables prefixed `NEXT_PUBLIC_`. API keys stay server-side.

## Localhost conventions
| Thing | Port | Notes |
|---|---|---|
| Frontend (Next.js or similar) | 3000 | `http://localhost:3000` |
| Backend / API (FastAPI, Express, or Next API routes) | 8000 | `http://localhost:8000` |
| Database (if Postgres locally) | 5432 | Prefer SQLite or Supabase to avoid running one |

- CORS on the backend allows `http://localhost:3000`.
- One command starts everything. Put it in `package.json` as `npm run dev` (use `concurrently` if two processes are needed) and document it in README.md.
- **Port already in use** is the most common blocker. Kill it:

```bash
lsof -ti:3000 | xargs kill -9
```

(replace 3000 with the port that is stuck)

- Add `.claude/launch.json` once the stack exists so Claude's built-in browser can start and test the app itself:

```json
{
  "version": "0.0.1",
  "configurations": [
    { "name": "web", "runtimeExecutable": "npm", "runtimeArgs": ["run", "dev"], "port": 3000 }
  ]
}
```

## LLM / API wiring
### The rule: one wrapper file
All LLM calls go through **one** file, `lib/llm.ts` (or `app/llm.py` in Python), exposing one or two functions such as `complete(prompt, options)` and `stream(prompt, options)`. Nothing else imports a provider SDK directly. Swapping providers is then a one-file change, and `DEMO_MODE` lives in one place.

### OpenRouter (default)
OpenRouter is OpenAI-compatible, so use the OpenAI SDK with a different base URL:
- Base URL: `https://openrouter.ai/api/v1`
- Auth: `Authorization: Bearer $OPENROUTER_API_KEY`
- Model: a slug from https://openrouter.ai/models (copy it exactly; wrong slugs are the number one cause of 400 errors). Store it in `LLM_MODEL`.
- Optional headers `HTTP-Referer` and `X-Title` identify the app on OpenRouter's dashboard.

### Anthropic direct (alternative)
- SDK: `@anthropic-ai/sdk` (Node) or `anthropic` (Python), key from `ANTHROPIC_API_KEY`.
- Model IDs: `claude-sonnet-5-5` (fast default), `claude-opus-5-5` (smarter), `claude-haiku-5-5` (cheapest).

### Before building any UI on an API: curl it once
Half of "the app is broken" is a dead key, no credit, or a wrong model name. Test from the terminal first:

```bash
curl https://openrouter.ai/api/v1/chat/completions -H "Authorization: Bearer $OPENROUTER_API_KEY" -H "Content-Type: application/json" -d '{"model":"'"$LLM_MODEL"'","messages":[{"role":"user","content":"Say hi"}]}'
```

(run `source .env` or `export` the variables first)

### DEMO_MODE
`DEMO_MODE=true` makes the wrapper return canned, realistic responses from a fixtures file instead of calling the network. Build this on day one. It saves the demo when wifi dies, a key runs out of credit, or an API is slow on stage. Also use it for fast UI iteration.

## Copy-paste prompts for agents
Give these to a Sonnet subrunner (or Fable during scaffolding). Adjust the stack names.

**Wire up the LLM wrapper**
> Read CLAUDE.md, ENGINEERING.md and SETUP.md. Create `lib/llm.ts` exposing `complete(prompt: string, opts?: { system?: string; json?: boolean }): Promise<string>`. Use the OpenAI SDK pointed at OpenRouter (base URL and env names from SETUP.md). Read the model from `LLM_MODEL`. If `DEMO_MODE=true`, return a canned response from `lib/llm.fixtures.ts` instead of calling the network. Fail loudly with the variable name if a key is missing. Add a script `npm run llm:test` that calls it once and prints the result. Update `.env.example`. Log decisions in ENGINEERING.md.

**Wire up a database**
> Read CLAUDE.md, ENGINEERING.md and SETUP.md. Set up the simplest persistent store for this project: SQLite via Prisma (or Drizzle) with `DATABASE_URL` in `.env`. Create the schema from PLAN.md, a migration, and a `npm run db:seed` script that loads realistic demo data. Add `npm run db:reset` that wipes and reseeds. Update `.env.example`. Log decisions in ENGINEERING.md.

**Wire up an external API (sponsor or third-party)**
> Read CLAUDE.md, ENGINEERING.md and SETUP.md. Create `lib/<service>.ts` wrapping the <SERVICE> API with only the two or three calls PLAN.md needs. Key from `<SERVICE>_API_KEY`. Curl the endpoint once first and paste the response shape as a TypeScript type. Add a `DEMO_MODE` fixture. Add `npm run <service>:test`. Update `.env.example`. Log decisions in ENGINEERING.md.

**Deploy**
> Read CLAUDE.md, ENGINEERING.md and SETUP.md. Deploy the current app to Vercel using the `vercel` CLI. Set every variable from `.env.example` in the Vercel project (ask me for the values, do not read them from .env yourself). Confirm the deployed URL loads the demo flow. Log the decision and the URL in ENGINEERING.md.

## Default stack (if Niki has no preference)
Fable should start from this unless the idea clearly needs something else. Boring and well-trodden means fewer agent mistakes.

| Layer | Default | Why |
|---|---|---|
| App | Next.js (App Router) + TypeScript | One repo, frontend and API routes together, deploys to Vercel in one command |
| Styling | Tailwind + shadcn/ui | Looks good fast, agents know it well |
| Data | SQLite via Prisma locally; Supabase if it must be hosted | Zero setup locally |
| LLM | OpenRouter through `lib/llm.ts` | One key, any model |
| Deploy | Vercel | Free, fast, public URL for judges |
| Separate backend | Only if Python libraries are needed; then FastAPI on 8000 | Avoid two processes unless required |

Any deviation is a Major decision for Fable to log in ENGINEERING.md.

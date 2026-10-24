# Handoff 07 — Deploy to Vercel and smoke test on a phone

- Model: Sonnet
- Depends on: 04, 05, 06 merged and the demo path working locally
- Estimated time: 30 min

## Goal
The app is live on a public Vercel URL, environment variables are set, and the full demo path works on a real phone.

## Read first
- CLAUDE.md, ENGINEERING.md, SETUP.md (Deploy prompt), PLAN.md (Demo script)

## Deliverable
1. Confirm a GitHub repo exists and `main` is pushed (ask Niki to create it on github.com if not; do not create accounts yourself).
2. `npx vercel` link and deploy from the project root. Production deploy on `main`.
3. Set `OPENROUTER_API_KEY`, `LLM_MODEL`, `DEMO_MODE` in the Vercel project. **Ask Niki for the key value; never read it out of `.env` yourself and never paste it in chat.** Set `DEMO_MODE=false` if the real key works, else `true`.
4. Run the demo script on the deployed URL in the built-in browser at phone width, then ask Niki to run it once on her actual phone (camera button must open the camera).
5. Record the production URL in ENGINEERING.md and in PLAN.md under "Run it".

## Done when
- [ ] Public URL loads the home page in under 3 seconds
- [ ] Try a sample → result → claim works on the deployed URL
- [ ] Take a photo opens the camera on a phone
- [ ] URL logged; Report back filled in

## Constraints
- No custom domain. No analytics. No auth.

## Report back (filled in by the subrunner)
- Status:
- What was built:
- What was NOT done and why:
- Decisions logged: D-___
- Open questions for Fable:
- How to verify:

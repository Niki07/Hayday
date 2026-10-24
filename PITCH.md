# Hayday — business description

**Tagline:** Make every payday a Hayday.

## The problem
Farmworkers in California's Central Valley are among the lowest-paid workers in the state, and they are routinely shorted on their checks: unpaid hours, missing overtime, piece-rate work with no paid rest breaks, meal breaks never given and never compensated. Wage theft in agriculture is widely documented and almost never reported. The reasons are simple. The rules are complicated, pay stubs are confusing, the complaint forms are in English, and a worker who suspects a short check has no way to know for sure, let alone prove it.

## What Hayday does
Hayday is a free, bilingual web app that works on any phone. A worker takes a photo of their pay stub. Hayday reads it, asks three simple questions about the week, checks everything against California farm labor pay rules, and shows a clear answer: **"You may be owed $184.50"**, with a short card for each problem explaining the rule in plain words, where that rule comes from, and the exact dollar amount. One more tap prepares a complaint letter in English and Spanish, ready to download and attach to a California Labor Commissioner wage claim. Nothing is stored. No account, no name, no photo kept.

## Who it helps
- **Farmworkers**, mostly Spanish-speaking, who suspect a short check and currently have no way to check it. Hayday turns a vague feeling into a number and a document in under two minutes.
- **Legal aid offices and farmworker organizations**, who spend hours doing this math by hand for each client. Hayday does the first pass so staff can focus on the cases that matter. An supervisor view, planned next, lets them drop in many stubs from one employer and see the pattern.

## How it works
1. **Read.** An AI vision model turns a crumpled, badly lit photo of a pay stub into structured numbers: hours, rates, piece counts, gross and net pay.
2. **Check.** A rules engine written in plain code, not AI, compares those numbers against the law and the worker's own account of the week. It cross-checks three sources: what the law requires, what the stub claims, and what the worker actually did. The amounts are deterministic and every finding carries its legal citation.
3. **Act.** The AI drafts a bilingual complaint letter from the verified findings. The worker downloads it and knows exactly where to take it.

## Why it is different
Existing resources are PDF guides, hotlines and legal aid intake forms. All of them require the worker to already understand the problem and explain it in English. Hayday starts from the one thing every worker already has, the pay stub, and does the understanding for them. It is the difference between "here is a pamphlet about your rights" and "here is the $184.50 you are owed and the letter that asks for it."

## Impact
Every dollar Hayday recovers goes to a household that needs it most. Beyond individual checks, a tool that makes checking easy changes employer behavior: wage theft persists because it is rarely caught. When every worker in a crew can check their stub in two minutes, the math on underpaying stops working.

## Business model
- **Free forever for workers.** The product only works if the people it serves never pay for it.
- **Organizer tier** for unions, legal aid offices and farmworker nonprofits: multi-stub analysis, employer pattern reports, case export. Funded by those organizations' existing budgets and grants.
- **Grants and partnerships** with state labor agencies and foundations focused on farmworker welfare, who already fund outreach and education on exactly this problem.

## What is next
- Supervisor view: pattern detection across many stubs from one employer.
- Voice input for workers who prefer to speak rather than type.
- Text-message results for workers without data plans.
- Additional languages: Mixtec audio, Punjabi, Hmong.
- Partnership with a Central Valley legal aid office to pilot with real cases.

## Built at
Central Valley hackathon, 2026-10-24, in 8 hours by a team of two.

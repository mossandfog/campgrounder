# Campgrounder — Working Safely

The one rule that prevents broken-production nights:

> **Never edit `main` directly. One branch per change. Let Vercel preview it. Merge only when it works.**

The whole site is a single `index.html`, and `main` auto-deploys to production the instant you push. That means a branch is your only safety net — it lets you see the change live on a private URL *before* the public ever does. This adds ~3 clicks to your routine. That's the whole tax.

---

## The everyday loop (GitHub Desktop)

**1. Start a branch before you touch anything**
`Current Branch` (top bar) → **New Branch** → name it for the change:
- `feature/trip-planner` for new things
- `fix/safari-tap` for fixes

Make sure it says "based on **main**." Click **Create Branch**.

**2. Build + commit as you go**
Edit `index.html` as normal. Commit in small chunks with a real message (see conventions below). Commit often — these commits are private to your branch, they can't hurt production.

**3. Publish the branch**
Click **Publish branch** (top bar). This pushes it to GitHub and triggers Vercel to build a **Preview Deployment** — a private copy of the whole site at its own URL. Production is still untouched.

**4. Test the preview — in an Incognito window**
Open your preview at:
`https://campgrounderio-git-<branch-name>-benvanderveen-7203s-projects.vercel.app`
(e.g. branch `fix/safari-tap` → `...-git-fix-safari-tap-...`)
Or: Vercel dashboard → **Deployments** → click the branch build → **Visit**.

> **Always test in Incognito.** Your service worker caches aggressively, so a normal window often shows you a stale version and lies to you about what's actually live. Incognito shows the truth. Test the thing you changed *and* click around the rest of the site to make sure you didn't break navigation.

**5. Merge to production only when it's clean**
Back in GitHub Desktop:
`Current Branch` → switch to **main** → **Branch** menu → **Merge into current branch** → pick your feature branch → **Create merge commit**.
Then **Push origin**. That push is what goes live. Watch it go `READY` in Vercel.

**6. Tidy up**
`Branch` menu → **Delete** the merged branch. Done.

---

## Commit message conventions

You're already half doing this — make it consistent. Prefix every commit:

- `feat:` — a new feature (`feat: add trip planner`)
- `fix:` — a bug fix (`fix: safari tap targets on camp cards`)
- `docs:` — notes/docs only, no site change (`docs: update CLAUDE.md`)
- `style:` — visual/CSS only, no logic (`style: tighten hero spacing`)
- `chore:` — config/housekeeping (`chore: update vercel.json`)

Why it matters: six months from now, your History reads like a changelog, and when something breaks you can spot the suspect commit in two seconds.

---

## 🚨 Emergency rollback (30 seconds, no git)

If production breaks and you need it fixed *now* — don't debug under pressure. Roll back, then fix calmly on a branch.

1. Go to the **Vercel dashboard** → Campgrounder → **Deployments**.
2. Find the last deployment marked `READY` from *before* the break (the commit messages help).
3. Click its **⋯** menu → **Promote to Production** (a.k.a. Instant Rollback).
4. Production is restored to that version immediately. No code changes, no waiting.

Then go fix the real problem on a branch (the everyday loop above) and merge when it's proven.

---

## The "is it actually broken?" check

Before you panic that the site is down, rule out your own cache:

1. Open campgrounder.io in an **Incognito window** (or hard-refresh: ⌘⇧R).
2. If it works there, it's *your* service worker cache — not production. Visitors are fine.
3. If it's broken in Incognito too, it's real → roll back (above), then fix on a branch.

---

## One thing to keep in the back of your mind

The entire app living in a single 7,000-line `index.html` is what makes one bad edit able to take down everything. You don't need to fix that today, and the branch workflow above protects you regardless. But if you ever want more resilience, splitting the JS into a few files is the highest-leverage structural upgrade — happy to plan that with you when the timing's right.

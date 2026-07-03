# App Product Transition Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Shift Baseball Lab S&C from an AdSense-first landing-page structure to an app-first product structure where `/` opens the app directly.

**Architecture:** Keep the existing localStorage-based app runtime intact. Move the app entry experience to the root route while preserving public guide pages for documentation, SEO, trust, and future advertising. Defer login, subscription, cloud sync, native app packaging, and AdMob until after app-first navigation is stable.

**Tech Stack:** Static HTML/CSS/JS, Cloudflare/GitHub static deployment, localStorage app data, existing `site/app.js`, `site/data.js`, and vendor scripts.

---

### Task 1: Product Strategy Documentation

**Files:**
- Modify: `docs/workflow/work-plan.md`
- Modify: `docs/workflow/follow-up-queue.md`

- [ ] **Step 1: Record the strategy shift**

Add a work-plan entry that states:

```markdown
- Strategy: app-first product flow replaces AdSense-first landing flow.
- Root route `/`: opens the app.
- Public guide pages: remain available for trust, SEO, help, and future ads.
- AdSense: paused as the primary driver until app UX is stable.
- Login/subscription/cloud sync: deferred to a later v2 design.
```

- [ ] **Step 2: Register the first implementation ticket**

Create the active ticket:

```markdown
루트 진입 앱 전환 1차
```

with the allowed write scope:

```markdown
site/index.html
site/*.html public document link labels only
docs/workflow/work-plan.md
docs/workflow/follow-up-queue.md
```

- [ ] **Step 3: Verify documentation-only diff**

Run:

```bash
git diff -- docs/workflow/work-plan.md docs/workflow/follow-up-queue.md
git diff -- site
git diff --check
```

Expected:

```text
site diff is empty before Task 2
git diff --check has no output
```

### Task 2: Root App Entry

**Files:**
- Modify: `site/index.html`
- Read: `site/app.html`

- [ ] **Step 1: Replace root landing with app shell**

Use `site/app.html` as the root app source and update root-only metadata:

```html
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://www.baseballlabsnc.com/">
<meta property="og:url" content="https://www.baseballlabsnc.com/">
```

The root page must load:

```html
<script src="./vendor/chart.umd.min.js"></script>
<script src="./vendor/html2canvas.min.js"></script>
<script src="./vendor/lucide.min.js"></script>
<script src="data.js"></script>
<script src="app.js"></script>
```

The root page must not load:

```html
https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js
```

- [ ] **Step 2: Keep `/app` compatibility**

Do not delete `site/app.html`. Keep it available as a compatibility route. It remains:

```html
<meta name="robots" content="noindex, follow">
<link rel="canonical" href="https://www.baseballlabsnc.com/app">
```

- [ ] **Step 3: Verify root/app split**

Run:

```bash
rg -n "pagead2|adsbygoogle|app\\.js|data\\.js|vendor/" site/index.html site/app.html
rg -n "canonical|robots|og:url" site/index.html site/app.html
node --check site/app.js
node --check site/data.js
git diff --check
```

Expected:

```text
site/index.html has app/data/vendor scripts and no AdSense script
site/app.html remains noindex and no AdSense
node checks pass
git diff --check has no output
```

### Task 3: Public Document Link Labels

**Files:**
- Modify: public document HTML files in `site/*.html`
- Exclude: `site/index.html`, `site/app.html`, `site/404.html` unless direct label consistency requires them

- [ ] **Step 1: Change root-facing labels from site-home language to app language**

Replace public guide/policy page link labels that point to `/`:

```html
← 사이트 홈으로 돌아가기
사이트 홈
```

with:

```html
← 앱으로 돌아가기
앱 홈
```

Keep `href="/"` unchanged.

- [ ] **Step 2: Verify no stale labels remain**

Run:

```bash
rg -n "사이트 홈으로 돌아가기|사이트 홈" site/*.html
rg -n "앱으로 돌아가기|앱 홈" site/*.html
```

Expected:

```text
old labels are 0
new labels exist on public documents
```

### Task 4: Browser QA

**Files:**
- No write scope.

- [ ] **Step 1: Start a local static server**

Run:

```bash
cd site
python3 -m http.server 8810
```

- [ ] **Step 2: Open latest cache-bust URL**

Open:

```text
http://127.0.0.1:8810/?codex_cache_bust=app-first-root-20260704-1
```

- [ ] **Step 3: Verify app flow**

Check:

```text
root loads app immediately
new player registration appears without landing click
public guide button works
team dashboard button works
dark mode still works
no horizontal overflow on mobile width
browser console has no app-breaking errors
```

### Task 5: Release Gate

**Files:**
- Modify: `docs/workflow/work-plan.md`

- [ ] **Step 1: Record verification**

Add a concise result section:

```markdown
- Root `/` now opens the app directly.
- Landing page removed from first entry.
- `/app` kept for compatibility.
- Public guide pages link back to app root.
- AdSense is no longer loaded on app entry.
- Browser QA passed.
```

- [ ] **Step 2: Commit only after user requests commit**

Run only when the user says to commit:

```bash
git status --short
git add site/index.html site/*.html docs/workflow/work-plan.md docs/workflow/follow-up-queue.md docs/superpowers/plans/2026-07-04-app-product-transition-plan.md
git commit -m "Switch root entry to app-first flow"
```

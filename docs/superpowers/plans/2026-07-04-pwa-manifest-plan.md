# PWA Manifest Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the minimum safe PWA manifest foundation so Baseball Lab S&C can be installed like an app without changing storage, login, subscriptions, or offline behavior.

**Architecture:** The root `/` is now the primary app entry, so `manifest.webmanifest` uses `/` for `start_url` and `scope`. `site/app.html` remains a compatibility entry and links the same manifest. No service worker is added in this phase because caching can affect AdSense, CSP, and localStorage-based app state.

**Tech Stack:** Static HTML, Web App Manifest JSON, existing PNG/SVG assets, local static server/browser QA.

---

### Task 1: Create PWA Manifest And Icons

**Files:**
- Create: `/Users/jinyoon/Desktop/Baseball Lab S&C/site/manifest.webmanifest`
- Create: `/Users/jinyoon/Desktop/Baseball Lab S&C/site/icon-192.png`
- Create: `/Users/jinyoon/Desktop/Baseball Lab S&C/site/icon-512.png`
- Read: `/Users/jinyoon/Desktop/Baseball Lab S&C/site/apple-touch-icon.png`
- Read: `/Users/jinyoon/Desktop/Baseball Lab S&C/site/favicon.svg`

- [ ] **Step 1: Inspect existing icon dimensions**

Run:

```bash
file site/apple-touch-icon.png site/favicon.svg site/og-image.png
```

Expected: `apple-touch-icon.png` is a PNG icon candidate, `favicon.svg` is SVG, `og-image.png` is a wide social image and must not be used as app icon.

- [ ] **Step 2: Generate square 192 and 512 PNG icons from the existing touch icon**

Use ImageMagick `sips` on macOS:

```bash
sips -z 192 192 site/apple-touch-icon.png --out site/icon-192.png
sips -z 512 512 site/apple-touch-icon.png --out site/icon-512.png
```

Expected: both commands complete and create square PNGs.

- [ ] **Step 3: Verify generated icon dimensions**

Run:

```bash
file site/icon-192.png site/icon-512.png
```

Expected: `site/icon-192.png` reports 192 x 192 and `site/icon-512.png` reports 512 x 512.

- [ ] **Step 4: Create the manifest file**

Create `/Users/jinyoon/Desktop/Baseball Lab S&C/site/manifest.webmanifest` with exactly:

```json
{
  "name": "Baseball Lab S&C",
  "short_name": "Baseball Lab",
  "description": "야구 선수와 코치를 위한 훈련 기록, 컨디션, 워크로드 관리 도구",
  "lang": "ko-KR",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "background_color": "#0F172A",
  "theme_color": "#1F4585",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/apple-touch-icon.png",
      "sizes": "180x180",
      "type": "image/png",
      "purpose": "any"
    }
  ]
}
```

Expected: manifest is valid JSON and does not mention service worker, login, subscription, or offline mode.

- [ ] **Step 5: Validate manifest JSON syntax**

Run:

```bash
node -e "JSON.parse(require('fs').readFileSync('site/manifest.webmanifest','utf8')); console.log('manifest ok')"
```

Expected: `manifest ok`.

### Task 2: Link Manifest From App Entries

**Files:**
- Modify: `/Users/jinyoon/Desktop/Baseball Lab S&C/site/index.html`
- Modify: `/Users/jinyoon/Desktop/Baseball Lab S&C/site/app.html`

- [ ] **Step 1: Add the manifest link to root app head**

In `/Users/jinyoon/Desktop/Baseball Lab S&C/site/index.html`, add this line near existing favicon/apple-touch-icon links:

```html
    <link rel="manifest" href="/manifest.webmanifest">
```

Expected: exactly one `rel="manifest"` link exists in `site/index.html`.

- [ ] **Step 2: Add the manifest link to compatibility app head**

In `/Users/jinyoon/Desktop/Baseball Lab S&C/site/app.html`, add this line near existing favicon/apple-touch-icon links:

```html
    <link rel="manifest" href="/manifest.webmanifest">
```

Expected: exactly one `rel="manifest"` link exists in `site/app.html`.

- [ ] **Step 3: Verify manifest link count**

Run:

```bash
rg -n 'rel="manifest"|manifest.webmanifest' site/index.html site/app.html site/manifest.webmanifest
```

Expected: two HTML link hits plus manifest self content references only as JSON path values.

### Task 3: Static And Browser Verification

**Files:**
- Read: `/Users/jinyoon/Desktop/Baseball Lab S&C/site/index.html`
- Read: `/Users/jinyoon/Desktop/Baseball Lab S&C/site/app.html`
- Read: `/Users/jinyoon/Desktop/Baseball Lab S&C/site/manifest.webmanifest`
- Read: `/Users/jinyoon/Desktop/Baseball Lab S&C/site/app.js`
- Read: `/Users/jinyoon/Desktop/Baseball Lab S&C/site/data.js`

- [ ] **Step 1: Run syntax and policy checks**

Run:

```bash
node --check site/app.js
node --check site/data.js
node -e "JSON.parse(require('fs').readFileSync('site/manifest.webmanifest','utf8')); console.log('manifest ok')"
rg -n 'serviceWorker|service-worker|sw\\.js' site || true
rg -n 'onclick=|oninput=|onchange=' site/*.html || true
git diff --check
```

Expected: JavaScript checks pass, manifest parses, service worker references remain 0, inline handler remains 0, and `git diff --check` is clean.

- [ ] **Step 2: Verify protected files are unchanged**

Run:

```bash
git diff -- site/app.js site/data.js site/vendor site/assets docs/evidence docs/security
```

Expected: no output.

- [ ] **Step 3: Verify manifest loads over local static server**

Run:

```bash
python3 -m http.server 8811 --directory site
curl -s http://127.0.0.1:8811/manifest.webmanifest | node -e "let data=''; process.stdin.on('data', c => data += c); process.stdin.on('end', () => { const m = JSON.parse(data); console.log(m.start_url, m.scope, m.display); });"
```

Expected: `/ / standalone`.

- [ ] **Step 4: Browser QA checks**

Open:

```text
http://127.0.0.1:8811/?codex_cache_bust=pwa-manifest-20260704-1
```

Verify:
- root app still opens directly.
- manifest link exists in DOM.
- `manifest.webmanifest` is reachable with HTTP 200.
- desktop and mobile widths have no horizontal overflow.
- browser console has no errors related to manifest, icons, or MIME type.

### Task 4: Commit Gate

**Files:**
- Modify: `/Users/jinyoon/Desktop/Baseball Lab S&C/docs/workflow/work-plan.md`
- Modify: `/Users/jinyoon/Desktop/Baseball Lab S&C/docs/workflow/follow-up-queue.md` only if the active queue text needs status update.

- [ ] **Step 1: Record implementation and agent verification results**

Update `/Users/jinyoon/Desktop/Baseball Lab S&C/docs/workflow/work-plan.md` with:

```markdown
- manifest JSON parse PASS
- root/app manifest link PASS
- service worker 0건
- app/data/schema diff 0건
- browser QA PASS
```

Expected: work-plan has a compact result section and no duplicate active ticket.

- [ ] **Step 2: Commit only after 총괄 Codex final review**

Run only when 총괄 Codex approves commit:

```bash
git add site/manifest.webmanifest site/icon-192.png site/icon-512.png site/index.html site/app.html docs/workflow/work-plan.md docs/workflow/follow-up-queue.md
git commit -m "Add PWA manifest foundation"
```

Expected: one commit containing manifest, icons, app entry manifest links, and workflow docs.

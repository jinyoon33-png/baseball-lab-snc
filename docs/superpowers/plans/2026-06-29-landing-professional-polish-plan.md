# Landing Professional Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the root landing page from a good MVP-style landing to a more professional SaaS/sports-tech landing without touching the app runtime or AdSense setup.

**Architecture:** Keep the static root page architecture. Modify only `site/index.html`, `site/style.css`, and workflow docs. Preserve `/app`, `/guides`, AdSense script, and all app data/schema files.

**Tech Stack:** Static HTML/CSS, existing local Pretendard font, existing CSS tokens, no new JavaScript, no external assets.

---

### Task 1: Professional Landing Rhythm

**Files:**
- Modify: `site/index.html`
- Modify: `site/style.css`
- Modify: `docs/workflow/work-plan.md`

- [ ] **Step 1: Preserve safety boundaries**

Allowed files only: `site/index.html`, `site/style.css`, `docs/workflow/work-plan.md`.

Forbidden files: `site/app.html`, `site/app.js`, `site/data.js`, `site/guides.html`, `site/about.html`, `site/tokens.css`, `site/docs.css`, `site/sitemap.xml`, `site/robots.txt`, `site/ads.txt`, `site/assets/**`, `site/vendor/**`, `docs/evidence/**`, `docs/security/**`.

- [ ] **Step 2: Improve first-page professional rhythm**

Keep the current hero structure, but make the page below it feel less like repeated cards and more like a polished service landing. Add only concise copy. Do not add claims about performance, injury prevention, diagnosis, treatment, prescriptions, guarantees, or optimal training.

- [ ] **Step 3: Improve public guide value signal**

Strengthen the guide section visually and textually so AdSense reviewers and first-time users can immediately see that the site has useful public content, not just an app UI.

- [ ] **Step 4: Verify static safety**

Run:

```bash
node --check site/app.js
node --check site/data.js
rg -n "onclick=|oninput=|onchange=" site/*.html || true
rg -n "app\\.js|data\\.js|chart\\.umd|min\\.js|html2canvas" site/index.html || true
rg -n "토스|Toss|toss|Linear|Supabase|TrainingPeaks|WHOOP" site/index.html site/style.css || true
rg -n "pagead2.googlesyndication.com" site/index.html site/app.html || true
rg -n "치료|처방|진단|보장|최적|부상 예방|성과 향상|위험 판정|부상 예측|자동 추천|자동 대체|훈련 가능" site/index.html site/style.css || true
git diff -- site/app.html site/guides.html site/about.html site/app.js site/data.js site/docs.css site/tokens.css site/sitemap.xml site/robots.txt site/ads.txt site/assets site/vendor docs/evidence docs/security
git diff --check
```

Expected: checks pass; the only allowed positive matches are the existing negative disclaimer and existing CSS comments.

- [ ] **Step 5: Verify browser breakpoints**

Check `1280`, `768`, and `390` widths. Expected: horizontal overflow 0, console error 0, `/app` and `/guides` CTA visible, guide cards readable, mobile first screen not excessively long.

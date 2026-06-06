# Common Verification

## Baseline Commands
- `node --check site/app.js`
- `node --check site/data.js`
- `rg -n "onclick=|oninput=|onchange=" site/*.html`
- `rg -n "adsbygoogle|pagead2.googlesyndication.com|canonical|application/ld\\+json" site`
- `rg -n "guideMediaType|guideMediaSrc|guideMediaPoster|guideMediaAlt|guideMediaCaption|guideMediaCredit" site/data.js`

## Common Forbidden Additions
- inline handler: `onclick=`, `oninput=`, `onchange=`
- ad/canonical/structured data unless explicitly ticketed: `adsbygoogle`, `pagead2.googlesyndication.com`, `canonical`, `application/ld+json`
- removed guide media fields: `guideMediaType`, `guideMediaSrc`, `guideMediaPoster`, `guideMediaAlt`, `guideMediaCaption`, `guideMediaCredit`
- broad storage deletion: `localStorage.clear()`

## Storage Keys
- Main DB: `pLDB_v4_5`
- App guide flag: `pLAppGuideSeen_v1`

## sourceUrl Allowlist Guards

### G1 — sourceUrl host allowlist 동기화
- 목적: `site/data.js`의 모든 `sourceUrl` host가 `site/app.js`의 `TRUSTED_SOURCE_HOSTS`에 포함되는지 검증.
- 실행 (zsh, 프로젝트 루트):
  ```
  node -e "const fs=require('fs'),vm=require('vm');const data=fs.readFileSync('site/data.js','utf8');const app=fs.readFileSync('site/app.js','utf8');const ctx={};vm.createContext(ctx);vm.runInContext(data+'\nthis.exerciseDB=exerciseDB;',ctx);const hosts=[...new Set(Object.values(ctx.exerciseDB).map(x=>x.sourceUrl).filter(Boolean).map(u=>new URL(u).hostname))].sort();const m=app.match(/const TRUSTED_SOURCE_HOSTS = Object\.freeze\(\[([\s\S]*?)\]\);/);const trusted=[...m[1].matchAll(/'([^']+)'/g)].map(x=>x[1]).sort();const missing=hosts.filter(h=>!trusted.includes(h));const extra=trusted.filter(h=>!hosts.includes(h));console.log(JSON.stringify({data_hosts:hosts.length,trusted:trusted.length,missing,extra}));process.exit(missing.length?1:0);"
  ```
- 해석: `missing.length > 0` → exit 1 (FAIL, data.js에 신규 host 추가 + allowlist 누락). `extra`는 경고용 출력만, 종료 코드 영향 없음.
- 현재 기대 출력: `{"data_hosts":5,"trusted":5,"missing":[],"extra":[]}` + exit 0.

### G2 — `target="_blank"` rel 누락
- 목적: `site/*.html`에서 `target="_blank"` 링크가 `rel="noopener noreferrer"`를 같은 줄에 동반하는지 검증.
- 실행:
  ```
  rg --pcre2 -n 'target="_blank"(?![^\n]*rel="noopener noreferrer")' site/*.html
  ```
- 해석: **매칭 없음(exit 1) = 위반 0건 (PASS)**. 매칭 라인이 출력되면(exit 0) FAIL.
- 현재 기대: 출력 empty + exit 1.

### 정책 분리
- 본 가드는 일반 `sourceUrl`과 외부 `<a target="_blank">`만 검증.
- YouTube guide URL은 `_isSafeYoutubeWatchUrl`(site/app.js) 별도 정책으로 분리 유지. 본 가드 범위 밖.

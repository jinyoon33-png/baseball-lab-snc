1. 요청 요약
- 활성 티켓: `AdSense 사이트 연결 스크립트 배포 확인 1차`
- 현재 단계: `[Step 1. 사용자 Push origin 대기 — AdSense 사이트 연결 스크립트 배포 확인 1차]`
- 담당: 총괄 Codex 직접 수행
- 목적: Google AdSense가 제공한 사이트 연결 스크립트를 공개 HTML 전체에 삽입했으므로 GitHub/Cloudflare 공개 반영을 확인한다.

2. 적용 내용
- AdSense client: `ca-pub-2911719487887723`
- 삽입 위치: 공개 HTML 13개 `<head>`의 `<title>` 직후.
- 삽입 코드: `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2911719487887723` + `crossorigin="anonymous"`.
- 광고 단위 `<ins class="adsbygoogle">`는 아직 삽입하지 않음.

3. 현재 검증 결과
- `node --check site/app.js` PASS.
- `node --check site/data.js` PASS.
- AdSense script 13건, `crossorigin="anonymous"` 13건, 공개 HTML 13개와 1:1 일치.
- CSP는 이미 `script-src 'self' 'unsafe-inline' 'unsafe-eval' https:`라 AdSense script 로드 가능.
- 이번 변경은 `site/*.html` 13개에 한정. `site/app.js`, `site/data.js`, `site/style.css`, `site/docs.css`, `site/tokens.css`, `site/_headers`, assets/vendor/evidence/security 변경 0건.

4. 배포 후 검증 명령
- `git fetch origin main && git status --short --branch`
- `curl -sL "https://www.baseballlabsnc.com/?codex_cache_bust=adsense-script-$(date +%s)" | rg -n 'pagead2.googlesyndication.com|ca-pub-2911719487887723|canonical'`
- `curl -sI "https://www.baseballlabsnc.com/?codex_cache_bust=adsense-script-$(date +%s)" | rg -i 'content-security-policy|server|cf-cache-status'`
- `curl -sL "https://www.baseballlabsnc.com/privacy?codex_cache_bust=adsense-script-$(date +%s)" | rg -n 'Google AdSense|쿠키|광고 식별자'`

5. 완료 조건
- 최신 커밋이 `origin/main`에 반영된다.
- 공개 `www` 홈 HTML에서 AdSense script와 `ca-pub-2911719487887723`가 확인된다.
- 공개 CSP가 `https:` script 로드를 허용한다.
- privacy 능동 고지가 공개 상태로 유지된다.

6. 이슈 기준
- BLOCKER: AdSense script 공개 미반영, CSP가 script 로드를 차단.
- MAJOR: client ID 오타, script 중복/누락.
- MINOR: 일부 문서 페이지 누락.
- NIT: 줄바꿈·위치 기록 보강.

7. 총괄 Codex 지침
- 이번 티켓은 총괄 Codex가 직접 수행한다.
- 사용자가 GitHub Desktop `Push origin`을 완료하면 공개 반영을 검증한다.
- 검증 통과 후 AdSense 화면에서 "검토 요청" 또는 다음 단계 버튼을 진행하도록 안내한다.

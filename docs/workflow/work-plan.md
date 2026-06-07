1. 요청 요약
- 활성 티켓: `신규 선수 등록 키 필수 표시·검증 GitHub push·Cloudflare 재배포 확인 1차`
- 현재 단계: `[Step 1. 작업 대기 — 신규 선수 등록 키 필수 표시·검증 GitHub push·Cloudflare 재배포 확인 1차]`
- 담당: 총괄 Codex 직접 확인, 사용자는 GitHub Desktop `Push origin` 수행
- 목적: 키 필수 표시·검증 보정이 GitHub 원격과 Cloudflare 공개 사이트에 반영됐는지 확인한다.

2. 대상 파일
- 수정 허용: `docs/workflow/work-plan.md`, `docs/workflow/work-plan-archive.md`
- 읽기 허용: `site/index.html`, `site/app.js`, `site/sitemap.xml`, `site/robots.txt`, `site/ads.txt`
- 수정 금지: `site/*` 코드 추가 수정, `docs/evidence/**`, `docs/security/**`

3. 확인 범위
- 로컬 커밋이 생성되어 있는지 확인한다.
- 사용자가 GitHub Desktop에서 `Push origin`을 완료한 뒤 `main...origin/main` 차이가 0인지 확인한다.
- 공개 `https://www.baseballlabsnc.com/` HTML에 키 `필수` 라벨이 반영됐는지 확인한다.
- 공개 `app.js`에 `키를 입력하세요.`, `heightInput < 100`, `eHeightInput < 100`이 반영됐고 `heightInput !== 0|eHeightInput !== 0` 예외가 없는지 확인한다.
- 공개 `ads.txt`, `sitemap.xml`, `robots.txt`, canonical이 기존 상태를 유지하는지 확인한다.

4. 정적/공개 검증 명령
- `git status --short --branch`
- `git log --oneline -3`
- `curl -fsSL https://www.baseballlabsnc.com/ | rg -n "키 \\(cm\\).*필수|ca-pub-2911719487887723"`
- `curl -fsSL https://www.baseballlabsnc.com/app.js | rg -n "키를 입력하세요|heightInput !== 0|eHeightInput !== 0|heightInput < 100|eHeightInput < 100"`
- `curl -fsSL https://www.baseballlabsnc.com/ads.txt`
- `curl -fsSL https://www.baseballlabsnc.com/sitemap.xml | rg -c "<loc>"`
- `curl -fsSL https://www.baseballlabsnc.com/robots.txt`

5. 완료 조건
- GitHub 원격 반영 완료.
- 공개 HTML에서 등록/수정 키 필수 라벨 2건 확인.
- 공개 JS에서 키 빈 값 차단 2건, 키 `0` 예외 0건, 범위 검증 2건 확인.
- AdSense script, ads.txt, sitemap 13 URL, robots Sitemap 지시문 유지.

6. 이슈 기준
- BLOCKER: 공개 배포 실패, 사이트 접속 불가.
- MAJOR: 공개 사이트에 키 검증 보정 미반영, ads.txt 또는 AdSense script 누락.
- MINOR: sitemap/robots/canonical 일부 drift.
- NIT: 검증 기록 누락.

7. 총괄 Codex 지침
- 이번 티켓은 사용자의 `Push origin 완료` 보고 전까지 공개 반영 확인을 진행하지 않는다.
- 사용자가 push 완료를 말하면 공개 도메인에서 직접 확인한다.
- 완료 후 AdSense 승인 대기 중 다음 품질 보강 티켓을 선정한다.

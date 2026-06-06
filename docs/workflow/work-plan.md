1. 요청 요약
- 활성 티켓: `신규 선수 등록 필수 입력·체중 검증 GitHub push·Cloudflare 재배포 확인 1차`
- 현재 단계: `[Step 1. 총괄 Codex 작업 대기 — 신규 선수 등록 필수 입력·체중 검증 GitHub push·Cloudflare 재배포 확인 1차]`
- 담당: 총괄 Codex 직접 수행
- 목적: 신규 선수 등록 필수 표시·체중 검증 변경을 GitHub에 반영하고 Cloudflare 공개 도메인에 배포됐는지 확인한다.
- 직전 결과: 로컬 브라우저 실사용 확인 PASS.

2. 대상 파일
- Git 커밋 대상: `site/index.html`, `site/app.js`, `site/style.css`, `docs/workflow/work-plan.md`, `docs/workflow/work-plan-archive.md`
- 수정 허용: `docs/workflow/work-plan.md`, `docs/workflow/work-plan-archive.md`
- 수정 금지: `site/*` 추가 코드 수정, `docs/evidence/**`, `docs/security/**`

3. 수행 범위
- 변경 범위를 확인한다.
- 필수 입력 표시·체중 검증 변경과 워크플랜 기록을 커밋한다.
- `origin/main`으로 push한다.
- Cloudflare 재배포 후 공개 도메인에서 필수 배지와 체중 검증 코드가 반영됐는지 확인한다.

4. 검증 명령
- `git status --short`
- `git diff --stat`
- `git diff -- site/index.html site/app.js site/style.css docs/workflow/work-plan.md docs/workflow/work-plan-archive.md`
- `node --check site/app.js`
- `node --check site/data.js`
- `git add ... && git commit -m "Require player weight inputs"`
- `git push origin main`
- `curl -sL https://baseballlabsnc.com/?codex_cache_bust=required-weight-public-$(date +%s) | rg -n "form-required|체중 \\(kg\\)"`

5. 완료 조건
- Git commit이 생성된다.
- `origin/main` push가 완료된다.
- 공개 도메인에서 `form-required`와 체중 필수 라벨이 확인된다.
- 공개 도메인에서 SEO canonical/robots/sitemap 기존 상태가 유지된다.
- push가 CLI 인증 문제로 실패하면 사용자에게 GitHub Desktop `Push origin` 수행을 요청하고, 수행 후 공개 반영을 재확인한다.

6. 이슈 분류 기준
- BLOCKER: commit 실패, push 실패 후 사용자 push 불가, 공개 도메인 배포 실패.
- MAJOR: 공개 도메인에 변경 미반영, SEO/CSP 회귀.
- MINOR: Cloudflare 캐시 지연, 공개 확인 지연.
- NIT: 기록 문구 보강.

7. 총괄 Codex 지침
- 이번 티켓은 총괄 Codex가 직접 수행한다.
- push 전 변경 범위를 반드시 확인한다.
- site 코드 추가 수정은 하지 않는다.
- CLI push가 실패하면 GitHub Desktop 수동 push 지시로 전환한다.

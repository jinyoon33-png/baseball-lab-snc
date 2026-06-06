1. 요청 요약
- 활성 티켓: `SEO 기본 파일 GitHub push·Cloudflare 재배포 확인 1차`
- 현재 단계: `[Step 1. 총괄 Codex 작업 대기 — SEO 기본 파일 GitHub push·Cloudflare 재배포 확인 1차]`
- 담당: 총괄 Codex 직접 수행
- 목적: SEO 기본 파일 변경사항을 GitHub에 push하고 Cloudflare 재배포 후 공개 도메인에서 sitemap/robots/canonical이 반영됐는지 확인한다.
- 직전 결과: `site/sitemap.xml`, `site/robots.txt`, 공개 HTML 13개 canonical 구현 정밀검토 통과.

2. 대상 파일
- 수정 허용: `docs/workflow/work-plan.md`, `docs/workflow/work-plan-archive.md`
- Git 작업 대상: SEO 구현 변경 파일 전체
- 수정 금지: `site/*` 추가 코드 수정, `docs/evidence/**`, `docs/security/**`

3. 수행 범위
- 현재 변경사항을 확인한다.
- SEO 구현 변경과 워크플랜 기록을 커밋한다.
- `origin main`으로 push한다.
- Cloudflare가 GitHub push를 받아 재배포하는지 확인한다.
- 공개 도메인에서 `robots.txt`, `sitemap.xml`, canonical을 확인한다.

4. 검증 명령
- `git status -sb`
- `git diff --stat`
- `git log --oneline -2`
- `git push`
- `curl -sL https://baseballlabsnc.com/robots.txt`
- `curl -sL https://baseballlabsnc.com/sitemap.xml | rg -n "<loc>"`
- `curl -sL https://baseballlabsnc.com/ | rg -n "rel=\"canonical\"|https://baseballlabsnc.com/"`
- `curl -I https://baseballlabsnc.com | rg -i "content-security-policy|server|cf-cache-status|HTTP/"`

5. 완료 조건
- GitHub `origin/main`에 SEO 구현 커밋이 반영된다.
- Cloudflare 공개 도메인에서 `robots.txt` Sitemap이 보인다.
- 공개 도메인에서 `sitemap.xml` URL 13건이 보인다.
- 공개 `index.html`에 canonical이 보인다.
- CSP 헤더가 유지된다.

6. 이슈 분류 기준
- BLOCKER: push 실패, 배포 실패, 공개 도메인 404/5xx.
- MAJOR: sitemap/canonical 미반영, CSP 헤더 누락.
- MINOR: Cloudflare 캐시 지연, 일부 공개 문서 반영 지연.
- NIT: 문구/기록 정리.

7. 총괄 Codex 지침
- 이번 티켓은 총괄 Codex가 직접 수행한다.
- push 전 변경 범위를 확인하고, SEO 구현 범위를 벗어난 site 코드 수정은 하지 않는다.
- 완료 후 다음 티켓은 `신규 선수 등록 필수 입력 표시·검증 보정 1차`로 등록한다.

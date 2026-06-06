1. 요청 요약
- 활성 티켓: `AdSense 선행 변경 GitHub push·Cloudflare Functions 배포 확인 1차`
- 현재 단계: `[Step 1. 사용자 Push origin 대기 — AdSense 선행 변경 GitHub push·Cloudflare Functions 배포 확인 1차]`
- 담당: 총괄 Codex 직접 수행
- 목적: URL/canonical 정준화, privacy 능동 고지, AdSense nonce CSP 미들웨어를 GitHub에 반영하고 Cloudflare 공개 배포에서 실제 CSP가 적용되는지 확인한다.
- 현재 상태: 로컬 커밋 `7bb8ce8 Prepare AdSense CSP and canonical URLs` 생성 완료. CLI `git push origin main`은 GitHub HTTPS 인증 문제로 실패했고, 로컬은 `main...origin/main [ahead 1]` 상태라 GitHub Desktop `Push origin` 사용자 실행 대기.

2. 대상 파일
- 커밋 대상: `functions/_middleware.js`, `site/*.html`, `site/robots.txt`, `site/sitemap.xml`, `docs/workflow/work-plan.md`, `docs/workflow/work-plan-archive.md`
- 수정 허용: `docs/workflow/work-plan.md`, `docs/workflow/work-plan-archive.md`
- 수정 금지: 추가 `site/*` 코드 변경, `site/app.js`, `site/data.js`, `site/style.css`, `site/docs.css`, `site/tokens.css`, `site/assets/**`, `site/vendor/**`, `docs/evidence/**`, `docs/security/**`

3. 수행 범위
- 현재 작업 트리 변경 범위를 재확인한다.
- `functions/_middleware.js`가 루트 Functions 디렉터리에 있고 `site/functions` 잔재가 없는지 확인한다.
- 정적 검증 후 커밋을 생성하고 `origin/main`에 push한다. CLI push가 인증 문제로 실패하면 사용자가 GitHub Desktop `Push origin`을 수행한다.
- Cloudflare 배포 후 `https://www.baseballlabsnc.com`에서 clean URL, privacy 문구, CSP nonce 헤더 적용 여부를 확인한다.

4. 정적 검증 명령
- `git status --short --branch`
- `node --check site/app.js && node --check site/data.js && node --check functions/_middleware.js`
- `find functions site/functions -maxdepth 2 -type f 2>/dev/null | sort`
- `rg -n 'href="[^"]*\.html|canonical.*baseballlabsnc\.com/.*\.html|https://baseballlabsnc\.com' site/*.html site/sitemap.xml site/robots.txt || true`
- `rg -n 'adsbygoogle|pagead2\.googlesyndication\.com' site functions || true`
- `git diff -- site/app.js site/data.js site/style.css site/docs.css site/tokens.css site/assets site/vendor docs/evidence docs/security`

5. 배포 후 검증 명령
- `curl -sI https://www.baseballlabsnc.com | rg -i 'content-security-policy|cf-cache-status|server'`
- `curl -sL https://www.baseballlabsnc.com/?codex_cache_bust=adsense-csp-$(date +%s) | rg -n 'nonce=|Baseball Lab S&C'`
- `curl -sL https://www.baseballlabsnc.com/privacy?codex_cache_bust=adsense-privacy-$(date +%s) | rg -n 'Google AdSense|쿠키|광고 식별자|최종 수정: 2026년 6월'`
- `curl -sL https://www.baseballlabsnc.com/sitemap.xml | rg -n '<loc>'`

6. 완료 조건
- 커밋 생성 및 `origin/main` 반영 완료.
- 공개 HTML 응답 CSP에 `nonce-...`와 `strict-dynamic`이 포함된다.
- 공개 HTML `<script>` 태그에 nonce가 주입된다.
- `privacy` 공개 페이지에 AdSense/쿠키 능동 고지가 반영된다.
- 광고 단위 코드 실삽입은 여전히 0건이다.
- 완료 후 사용자는 Google AdSense에 `https://www.baseballlabsnc.com`으로 사이트 신청 가능.

7. 총괄 Codex 지침
- 이번 티켓은 총괄 Codex가 직접 수행한다.
- 배포 전에는 AdSense 신청 가능하다고 확정하지 않는다.
- Cloudflare Functions가 적용되지 않으면 완료 처리하지 말고 수정 티켓으로 전환한다.

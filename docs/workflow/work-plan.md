1. 요청 요약
- 활성 티켓: `Cloudflare Pages 프로젝트 배포·커스텀 도메인 연결 1차`
- 현재 단계: `[Step 1. 사용자 실행 대기 — Cloudflare Pages 프로젝트 배포·커스텀 도메인 연결 1차]`
- 담당: 사용자 실행 + 총괄 Codex 안내
- 목적: 구매 완료된 `baseballlabsnc.com`을 Cloudflare Pages 배포본에 연결하고 HTTPS 접속 가능한 상태로 만든다.
- 직전 결과: WHOIS 기준 `baseballlabsnc.com` 구매/소유 확인 완료. DNS A/CNAME과 HTTPS는 아직 미응답.

2. 사용자 실행 항목
- Cloudflare Dashboard → Workers & Pages → Pages → Create project로 이동한다.
- GitHub 연결 또는 Direct Upload 중 현재 가능한 방식으로 프로젝트를 생성한다.
- 배포 루트는 `site/`가 되도록 설정한다. 빌드 명령은 정적 HTML이면 비워둔다.
- 배포가 완료되면 Pages 기본 주소(`*.pages.dev`)로 접속 가능한지 확인한다.
- Pages 프로젝트 → Custom domains에서 `baseballlabsnc.com`을 추가한다.
- 필요하면 `www.baseballlabsnc.com`도 추가하되, 최종 대표 URL은 `https://baseballlabsnc.com/`으로 둔다.
- Cloudflare가 안내하는 DNS 레코드가 자동 생성됐는지 확인한다.

3. 총괄 Codex 확인 항목
- 사용자가 Pages 배포/도메인 연결 완료를 보고하면 DNS와 HTTPS를 확인한다.
- `https://baseballlabsnc.com/`이 정상 응답하면 `_headers` CSP 적용 여부를 헤더로 확인한다.
- `www`가 연결됐다면 대표 도메인으로 리다이렉트할지 별도 결정한다.
- 확인 완료 후 다음 티켓 `도메인 확정 후 SEO 기본 파일 구현 1차`를 작성한다.

4. 보존 조건
- Pages 연결 전 `site/sitemap.xml`, canonical, robots `Sitemap:` 구현 금지.
- AdSense/analytics/gtag/JSON-LD 삽입 금지.
- 앱 조작 화면 주변 광고 배치 금지 원칙 유지.
- 이번 티켓에서 site 파일을 수정하지 않는다.

5. 연결 후 검증 명령
- `dig +short baseballlabsnc.com`
- `dig +short www.baseballlabsnc.com`
- `curl -I https://baseballlabsnc.com`
- `curl -I https://www.baseballlabsnc.com`
- `curl -I https://baseballlabsnc.com | rg -i "content-security-policy|cf-cache-status|server"`
- `curl -sL https://baseballlabsnc.com | rg -n "Baseball Lab S&C|투수·타자 모두를 위한 야구 훈련"`

6. 완료 조건
- Cloudflare Pages 기본 주소가 정상 접속된다.
- `https://baseballlabsnc.com/`이 정상 접속된다.
- HTTPS가 활성화된다.
- CSP 헤더가 응답에 포함된다.
- 다음 구현 티켓에서 base URL을 `https://baseballlabsnc.com/`으로 사용할 수 있다.

7. 총괄 Codex 지침
- 이번 티켓은 사용자 실행 확인 티켓이다.
- 사용자가 Pages 배포/도메인 연결 완료를 보고하기 전에는 site 파일을 수정하지 않는다.
- 연결 완료 확인 후 SEO 기본 파일 구현 티켓을 작성한다.

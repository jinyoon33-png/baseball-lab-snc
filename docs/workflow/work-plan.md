1. 요청 요약
- 활성 티켓: `AdSense 신청 준비 완료 후 다음 작업 선정 1차`
- 현재 단계: `[Step 1. 사용자 결정 대기 — AdSense 신청 또는 광고 슬롯 설계 선택]`
- 담당: 총괄 Codex
- 목적: Google AdSense 사이트 신청 전 선행 조건을 완료했으므로, 사용자가 실제 AdSense 신청을 먼저 할지 광고 슬롯 설계를 먼저 할지 결정한다.

2. 현재 완료 상태
- GitHub 원격: `main...origin/main` 동기화 완료, 최신 커밋 `4218f3e Use static AdSense CSP fallback`.
- 공개 도메인: `https://www.baseballlabsnc.com` 정상 응답.
- CSP: 공개 응답에 AdSense fallback CSP 적용 완료.
- Privacy: 공개 `privacy` 페이지에 Google AdSense·쿠키·광고 식별자 능동 고지 반영 완료.
- SEO: canonical 13건과 sitemap 13 URL 모두 `https://www.baseballlabsnc.com` + clean URL 기준.

3. AdSense 신청 가능 판단
- 신청 URL 기준: `https://www.baseballlabsnc.com`
- 현재 광고 단위 코드 실삽입: 0건. 신청/검토 단계에서는 사이트 등록용 스크립트 또는 AdSense가 안내하는 검증 코드를 별도 티켓으로 삽입해야 할 수 있다.
- 루트 `https://baseballlabsnc.com`은 현재 200 응답이며 canonical은 `www`를 가리킨다. 가능하면 Cloudflare에서 apex → `www` 301 리디렉션을 추가 권장.

4. 선택지
- 선택지 A: Google AdSense에 `https://www.baseballlabsnc.com`으로 사이트 신청을 먼저 진행한다.
- 선택지 B: 광고 슬롯 설계 1차를 먼저 진행한다. 후보 위치는 문서 하단, 가이드 본문 중간, 앱 하단/사이드 보조 영역이며 핵심 입력·스케줄 생성 흐름에는 삽입하지 않는다.
- 선택지 C: apex → www 301 리디렉션 설정 확인 티켓을 먼저 진행한다.

5. 다음 작업 원칙
- AdSense 코드 또는 광고 슬롯을 삽입하기 전에는 사용자 확인을 받는다.
- 앱 핵심 기능 화면에 방해되는 광고는 넣지 않는다.
- 의료·성과 보장·자동 위험 판정 표현은 계속 금지한다.

6. 검증 기준
- 광고 삽입 전: `adsbygoogle|pagead2.googlesyndication.com` 0건 유지.
- 광고 삽입 후: CSP, privacy, 레이아웃, 모바일, AdSense 정책 충돌 여부를 별도 QA한다.
- 배포 후: 공개 URL에서 직접 `curl`과 브라우저 실사용 확인을 수행한다.

7. 총괄 Codex 지침
- 사용자가 AdSense 신청을 진행하면, 신청 중 Google이 제공하는 코드/문구를 그대로 받아 별도 삽입 티켓을 작성한다.
- 사용자가 광고 슬롯 설계를 선택하면, 코드 구현 전 위치·형식·모바일 영향부터 설계한다.

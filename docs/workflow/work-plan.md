1. 요청 요약
- 활성 티켓: `AdSense 승인 대기 중 사이트 품질 보강 1차`
- 현재 단계: `[Step 1. 사용자 결정 대기 — 승인 대기 중 품질 보강 범위 선택]`
- 담당: 총괄 Codex
- 목적: AdSense 신청은 완료됐고 승인 대기 상태이므로, 승인 기간 동안 사이트 품질·정책 안정성을 높일 보강 작업을 선택한다.

2. 현재 완료 상태
- AdSense 신청: 사용자 완료, 승인 대기 중.
- 공개 스크립트: `https://www.baseballlabsnc.com/`에서 `pagead2.googlesyndication.com` 및 `ca-pub-2911719487887723` 확인.
- 공개 CSP: AdSense script/frame/connect/img 로드 가능한 static fallback CSP 확인.
- Privacy: `Google AdSense`, `쿠키`, `광고 식별자`, `최종 수정: 2026년 6월` 공개 반영 확인.
- Ads.txt: AdSense 상태가 `찾을 수 없음`으로 표시되어 `site/ads.txt`에 `google.com, pub-2911719487887723, DIRECT, f08c47fec0942fa0` 추가 보정 중.
- Git: `main...origin/main` 동기화 완료.

3. 승인 대기 중 권장 작업
- A. 콘텐츠 보강: `assessment-guide`, `recovery-guide`, `workload-guide` 본문을 더 두껍게 보강한다.
- B. 광고 슬롯 설계: 승인 후 넣을 광고 위치를 문서 하단·가이드 중간·앱 보조 영역 중심으로 설계한다. 아직 광고 단위 삽입은 하지 않는다.
- C. apex → www 301 리디렉션 확인: `baseballlabsnc.com`을 `www.baseballlabsnc.com`으로 정리해 정준 URL 혼선을 줄인다.

4. 우선순위 판단
- 1순위: 콘텐츠 보강. 승인 심사에는 광고 위치보다 사이트 내용의 충분성·정책 안정성이 더 직접적이다.
- 2순위: apex → www 301. SEO 정합성 보강.
- 3순위: 광고 슬롯 설계. 승인 후 실제 광고 단위 삽입 전 준비.

5. 보존 조건
- 승인 전에는 광고 단위 `<ins class="adsbygoogle">`를 삽입하지 않는다.
- 건강·훈련 관련 문구는 의료·진단·치료·부상 예방 보장·성과 보장 표현을 피한다.
- 앱 핵심 입력 흐름과 스케줄 생성 흐름에는 광고를 넣지 않는다.

6. 다음 선택지
- 사용자가 품질 보강을 원하면 `공개 가이드 3종 콘텐츠 보강 설계 1차`로 진행한다.
- 사용자가 URL 정리부터 원하면 `apex → www 301 리디렉션 확인 1차`로 진행한다.
- 사용자가 광고 배치부터 원하면 `AdSense 승인 후 광고 슬롯 설계 1차`로 진행한다.

7. 총괄 Codex 지침
- 사용자가 `ㄱㄱ`라고 하면 1순위인 콘텐츠 보강 설계 티켓을 작성한다.
- AdSense 승인 또는 보류/반려 메시지가 오면 그 내용을 우선 분석한다.

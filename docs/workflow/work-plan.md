1. 요청 요약
- 활성 티켓: `공개 가이드 3종 콘텐츠 보강 설계 1차`
- 현재 단계: `[Step 1. 작업 대기 — 공개 가이드 3종 콘텐츠 보강 설계 1차]`
- 담당: 코드 담당 Claude
- 목적: AdSense 승인 대기 중 콘텐츠 품질을 높이기 위해 `assessment-guide`, `recovery-guide`, `workload-guide` 3개 공개 문서의 보강 방향을 설계한다.
- 배경: 3개 문서는 현재 각각 약 374~425단어 수준이며, 정보성은 있으나 승인 심사 관점에서 더 충분한 설명·사용 예시·주의 문구가 있으면 유리하다.

2. 대상 파일
- 수정 허용: `docs/workflow/work-plan.md`
- 읽기 허용: `site/assessment-guide.html`, `site/recovery-guide.html`, `site/workload-guide.html`, `docs/evidence/evidence-research.md`
- 수정 금지: `site/*` 실제 콘텐츠 수정, `site/app.js`, `site/data.js`, `site/style.css`, `site/_headers`, `site/ads.txt`, `docs/evidence/**`, `docs/security/**`

3. 설계 범위
- 각 문서별로 추가할 섹션 2~3개를 제안한다.
- 목표는 광고 승인용 얕은 분량 늘리기가 아니라, 사용자에게 실제로 도움이 되는 설명 보강이다.
- 각 문서는 다음 축을 포함한다:
  - `assessment-guide`: 평가 전 준비, 결과를 스케줄에 반영하는 방식, 재평가/기록 비교 예시.
  - `recovery-guide`: 회복 기록 항목 해석, 다음 훈련 전 확인 신호, 학생선수/동호인 적용 시 주의.
  - `workload-guide`: RPE·훈련량 입력 예시, ACWR 참고 방식, 숫자 과신 방지, 코치/보호자와 함께 보는 방법.

4. 표현 제한
- 의료 진단·치료·처방 표현 금지.
- 부상 예방 보장, 성과 향상 보장, 자동 위험 판정, 최적화 표현 금지.
- ACWR/RPE 숫자 임계값 직접 처방 금지. 필요한 경우 “참고 신호”, “확인”, “조정 고려” 수준으로만 표현.
- 외부 자료 장문 인용 금지. 근거문서 내용은 요약·재구성만 허용.

5. 정적 검증 기준
- `node --check site/app.js`
- `node --check site/data.js`
- `wc -w site/assessment-guide.html site/recovery-guide.html site/workload-guide.html`
- `rg -n "진단|치료|처방|보장|부상 예방|성과 향상|최적화|자동 위험 판정" site/assessment-guide.html site/recovery-guide.html site/workload-guide.html docs/workflow/work-plan.md`
- `git diff -- site/app.js site/data.js site/style.css site/docs.css site/tokens.css site/_headers site/ads.txt site/assets site/vendor docs/evidence docs/security`

6. 완료 조건
- 3개 문서별 보강 설계가 명확하다.
- 다음 구현 티켓에서 어떤 섹션을 어디에 추가할지 파일별로 바로 알 수 있다.
- 금지 표현을 사용자 노출 문구로 권장하지 않는다.
- 이번 티켓에서는 `site/*` 콘텐츠를 수정하지 않는다.

7. Claude 작업 지침
- 이번 티켓은 설계 전용이다. `site/*` 수정 금지.
- work-plan에 결과 섹션만 추가하고 Step 2 설계 완료로 갱신한다.
- 완료 보고는 파일별 보강 섹션안, 금지 표현 회피 원칙, 검증 결과만 짧게 적는다.

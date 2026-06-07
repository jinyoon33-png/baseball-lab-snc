1. 요청 요약
- 활성 티켓: `신규 선수 등록 키 필수 표시·검증 보정 1차`
- 현재 단계: `[Step 1. 작업 대기 — 신규 선수 등록 키 필수 표시·검증 보정 1차]`
- 담당: 코드 담당 Claude
- 목적: 신규 선수 등록/수정에서 키가 실제로 필요한 입력값인데 라벨에 `필수`가 없고 빈 값도 허용되는 불일치를 보정한다.
- 우선순위: 사용자 입력 정확성 이슈이므로 공개 가이드 콘텐츠 보강보다 먼저 처리한다.

2. 대상 파일
- 수정 허용: `site/index.html`, `site/app.js`, `docs/workflow/work-plan.md`
- 읽기 허용: `site/style.css`
- 수정 금지: `site/data.js`, `site/_headers`, `site/ads.txt`, 공개 가이드 문서, `site/assets/**`, `site/vendor/**`, `docs/evidence/**`, `docs/security/**`

3. 구현 범위
- `site/index.html`
  - 신규 등록 `키 (cm)` 라벨에 `<span class="form-required">필수</span>` 추가.
  - 선수 정보 수정 `키 (cm)` 라벨에도 동일하게 추가.
- `site/app.js`
  - `addPlayer()`에서 `_pHeightRaw === ''`이면 `customAlert('키를 입력하세요.')`로 차단.
  - `savePlayerEdit()`에서 `_eHeightRaw === ''`이면 `customAlert('키를 입력하세요.')`로 차단.
  - 기존 정수 검증과 `100~230cm` 범위 검증은 유지하되, 더 이상 `0` 빈 값 fallback으로 저장되지 않게 한다.
- 키 선택 입력 정책은 폐지하고 이름·나이·구력·키·체중 필수 정책으로 맞춘다.

4. 정적 검증 명령
- `node --check site/app.js`
- `node --check site/data.js`
- `rg -n "키 \\(cm\\).*form-required|키를 입력하세요|heightInput !== 0|eHeightInput !== 0|heightInput < 100|eHeightInput < 100" site/index.html site/app.js`
- `rg -n "form-required" site/index.html`
- `rg -n "onclick=|oninput=|onchange=" site/*.html`
- `git diff -- site/data.js site/style.css site/_headers site/ads.txt site/assets site/vendor docs/evidence docs/security`

5. 완료 조건
- 등록/수정 키 라벨에 `필수` 배지가 각각 1건씩 추가된다.
- 키 빈 값은 등록/수정 모두 저장 전에 차단된다.
- 키 `0`은 빈 값 우회로 저장되지 않고 `100~230cm` 범위 검증에서 차단된다.
- 구력 `0` 허용, 체중 필수/범위 검증, 이름/나이 필수 검증은 회귀하지 않는다.

6. 이슈 기준
- BLOCKER: 저장 schema 손상, 등록/수정 저장 불가.
- MAJOR: 필수 배지만 추가하고 실제 빈 값 차단이 누락됨, 또는 키 0 저장 가능.
- MINOR: 오류 문구 불일치, 편집 모달만 누락.
- NIT: 라벨 띄어쓰기.

7. Claude 작업 지침
- 이번 티켓은 코드 담당 Claude가 수행한다.
- 구현 후 work-plan에 Step 2 결과를 기록한다.
- 완료 보고에는 변경 파일, 키 필수 검증 결과, 수정 금지 경로 diff만 짧게 적는다.

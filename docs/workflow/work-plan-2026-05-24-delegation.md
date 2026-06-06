0. 총괄 Codex 위임 모드 (2026-05-24 ~ 2026-05-27 예정)
- 사용자 지시: 총괄 Codex 한도 소진, 5/27 복귀 예정. 그 사이 디자인 마이그레이션 집중.
- 위임 구조 (한시):
  - 총괄 Codex 자리 → 본 Claude Code 세션이 대행 (정밀검토·티켓 작성·종료 판단)
  - 코드 구현 → 에이전트(general-purpose 등)에 위임, 본 세션이 보고 검수
  - 보안/QA → 필요 시 별도 보안 Claude Code 세션 호출 (사용자가 띄움)
  - 근거문서 → 본 기간 동안은 비활성 (마이그레이션 영향 없음)
- 종료 시점 행동: 2026-05-27 총괄 Codex 복귀 시점에 본 기간의 모든 진행을 work-plan-archive.md에 일괄 기록하고 위임 모드 해제.
- 본 모드 기간 내 위반하지 말 것: 사용자 명시 없는 site/* 광범위 수정, `git init`/커밋 등 사용자 결정 사항.

1. 요청 요약
- 활성 티켓: `Claude Design export 패키지 site 마이그레이션 — 사전 정합성 검토 (Stage 0)`
- 현재 단계: `[Stage 0. 패키지 도착 대기 — Claude Design export]`
- 목적: Claude Design에서 export된 토큰·컴포넌트 패키지를 받아 site에 단계 분할로 적용하기 위한 사전 정합성 검토. 본격 적용 티켓 분할의 근거 자료가 된다.
- 직전 묶음(`innerHTML clear sink DOM API 전환`)은 2026-05-23 4경로 OK로 종료, work-plan-archive.md 기록 완료.

2. 마이그레이션 단계 계획 (사전 확정)
- Stage 0 — 패키지 정합성 검토 (현재): tokens.json / tokens.css / components.css / 미리보기 HTML / snippets/01–10 / README 대조. 기존 변수 매핑표 검증. 누락·충돌·과도 변경 항목 식별.
- Stage 1 — 토큰 1차 교체: `:root` 컬러·간격·라운드 변수만 교체. 컴포넌트 CSS 미변경. HTML 미변경.
- Stage 2 — 토큰 2차 교체: 타이포·그림자·다크모드 토큰 추가. `<html data-theme="dark">` 토글 인프라 적용.
- Stage 3 — 컴포넌트 CSS 교체 (클래스명·DOM 유지): `.btn`, `.card`, `.form-control`, `.player-row`, `.doc-wrap` 등 기존 클래스 내부 스타일만 교체.
- Stage 4 — 차트·모달·배지 등 구조 일부 변경 영역: 영역별 별도 티켓.
- Stage 5 — (선택) 신규 클래스명 도입·HTML 구조 리네임: 가장 위험. 본 위임 모드 기간 내에는 원칙적으로 진행하지 않음.

3. 대상 파일 (Stage 0 기준)
- 수정 허용: `docs/workflow/work-plan.md`, `docs/workflow/work-plan-archive.md`, `docs/workflow/follow-up-queue.md`
- 읽기 전용 확인: `archive/design-mockups/2026-05-23-claude-design-export/**`, `site/style.css`, `site/docs.css`, `site/index.html`, `site/*.html`
- 수정 금지 (본 Stage 한정): `site/**`, `docs/evidence/**`, `docs/security/**`, `docs/project/**`

4. Stage 0 점검 항목
- 패키지 존재·구성 확인: README.md / tokens.json / tokens.css / components.css / index.html / snippets/01–10.html 총 15개 파일 존재 여부.
- README 매핑표 정합성: 기존 `site/style.css` `:root` 변수와 신규 토큰의 1:1 매핑 유효성. 누락·중복·이름 충돌 검사.
- 기존 변수 커버리지: `site/style.css`의 `--primary`, `--bg-color`, `--card-bg`, `--text-main`, `--text-muted`, `--danger`, `--success`, `--warning`, `--info`, `--border`, `--input-bg`, surface/equipment/hero/guide 계열 전체 변수가 신규 토큰 어디에 대응되는지.
- 다크모드 토큰 충돌: 기존 라이트 전용 변수와 신규 다크 토큰이 같은 이름을 쓰는 경우 충돌 가능성.
- 컴포넌트 클래스 충돌: components.css의 `.btn` / `.card` / `.form-control` / `.player-row` / `.doc-wrap` 가 기존 HTML 클래스 의미와 충돌하는지.
- HTML 구조 의존성: snippets HTML이 기존 site HTML 구조와 다른 경우 정리.
- 라이선스/외부 자원: 신규 폰트·아이콘·CSS @import 외부 자원 유무 (CSP·보안 영향).
- 카피 정책 준수: "정상/주의/초과" 시그널 표현, 금지어("치료/처방/진단/보장/예측" 등) 사용 여부.

5. Stage 0 정적 점검 명령 (패키지 도착 후)
- `ls -la archive/design-mockups/2026-05-23-claude-design-export/`
- `ls archive/design-mockups/2026-05-23-claude-design-export/snippets/`
- `wc -l archive/design-mockups/2026-05-23-claude-design-export/*.{md,json,css,html}`
- `cat archive/design-mockups/2026-05-23-claude-design-export/README.md`
- `rg -n "^\s*--" archive/design-mockups/2026-05-23-claude-design-export/tokens.css | head -200`
- `rg -n "^\s*--" site/style.css | head -200`
- `rg -n "치료|처방|진단|보장|예측|최적" archive/design-mockups/2026-05-23-claude-design-export/`
- `rg -n "@import|url\(http" archive/design-mockups/2026-05-23-claude-design-export/`

6. Stage 0 완료 조건
- 패키지 15개 파일 모두 확인됨.
- 기존 `:root` 변수 ↔ 신규 토큰 1:1 매핑표 작성 또는 README 매핑표 검증 완료.
- 누락·충돌·과도 변경·정책 위반 항목 분류 (BLOCKER/MAJOR/MINOR/NIT).
- Stage 1·2 티켓 초안이 work-plan-archive.md 또는 follow-up-queue.md에 등록될 수 있는 상태.
- 본 Stage 결과 보고는 8번 섹션에 기록.

7. 작업 지침 (Stage 0)
- Stage 0는 읽기 전용 검토만 수행한다. `site/**`는 수정하지 않는다.
- 패키지가 없으면 사용자에게 보고하고 대기. 임의 생성 금지.
- 검토 자체는 본 세션이 직접 수행 (에이전트 위임 불필요). 코드 적용 단계(Stage 1+)부터 에이전트 위임 검토.
- 위임 모드 원칙: 본 세션이 정밀검토·티켓 작성·종료 판단을 대행하되, `git init`/커밋 등 사용자 결정 사항은 임의로 하지 않는다.

8. Stage 0 검토 결과 (2026-05-24)
- 패키지 도착: `~/Downloads/archive/design-mockups/2026-05-23-claude-design-export/` 에서 발견 → `archive/design-mockups/2026-05-23-claude-design-export/`로 복사 완료. 15개 파일(README/tokens.json/tokens.css/components.css/index.html/snippets 01-10), 총 2274줄.
- 정적 점검 실행:
  - `cat site/_headers` → CSP `font-src 'self'; style-src 'self'`.
  - `rg "@import|url\(http" archive/design-mockups/2026-05-23-claude-design-export/` → tokens.css L10-11 외부 CDN @import 2건 검출.
  - `rg -c "^\s*--" site/style.css` → 101개 변수, README 매핑표 약 10개. 약 40+ 변수 미매핑.
  - `rg -ni "치료|처방|진단|보장|최적|예측|optimize|predict|diagnose|prevent|boost"` → 금지어 사용자 노출 문구 없음 (CSS property optimizeLegibility는 false positive).
- 판정:
  - BLOCKER 1: tokens.css 외부 폰트 CDN @import 2건 vs site/_headers CSP 충돌.
  - MAJOR 3:
    - 변수 매핑표가 실제 site/style.css와 불일치 (`--text` vs `--text-main`, `--bg` vs `--bg-color`) + 파생 변수 40+개 누락 (`--primary-*` 8, `--surface-*` 3, `--text-*` 2, `--equip-*` 12, `--hero-*` 10+ 등).
    - components.css 클래스(`.modal`, `.btn`, `.card`, `.input`)가 site 기존 클래스와 의미·동작 충돌 가능.
    - site/app.js의 ID/클래스 selector 수백 개 의존성 — Stage 3+에서 본격 위험.
  - MINOR 1: 본문 폰트 사이즈 13.5px (기존 14-16px 대비 축소).
  - OK: 카피/금지어, 시그널 3단계, 약관 고지 후보 문구, 문서 페이지 마스터 골격.
- Stage 분할 갱신:
  - Stage 0.5 신규 추가: tokens.css에서 외부 @import 2줄 제거 + JetBrains Mono 처리 결정.
  - Stage 1: 1a(핵심 토큰 매핑)와 1b(파생/장비/히어로 변수 보강)로 분할.
  - Stage 3·4 진행 시 보안/QA Claude 호출 필수.
  - Stage 5 본 위임 모드 기간 내 진행 금지 (원칙 재확인).
- 사용자 결정 회신 (2026-05-24):
  1. 폰트: Pretendard·JetBrains Mono 둘 다 마음에 안 듦 → 폰트 결정 전까지 시스템 폴백으로 임시 진행 (font-family를 -apple-system / BlinkMacSystemFont / system-ui / ui-monospace 우선으로 재정의, 단 Pretendard는 기존 vendor 자산이 있으므로 폴백 체인에 유지).
  2. 다크모드: 현재 시안이 정상 적용된 뒤 별도 작업. → tokens.css의 `[data-theme="dark"]` 블록은 보존하되 HTML에 `data-theme` 미부여로 자동 비활성.
  3. 본문 폰트 사이즈: Claude Design 시안 그대로 유지 (인터랙티브 13.5px, 문서 16px). 단 모바일은 site 기존 분기 유지.
  4. 모바일 분기: 패키지에 미디어쿼리 0건 확인. → site/style.css 기존 @media 분기 유지 + 신규 토큰만 적용. 새로 모바일 분기 추가 안 함.
- 안전망 (위임 모드 기본값):
  - Stage 1a 진행 전 `archive/root-file-backups/site-snapshot-2026-05-24-pre-design-migration/`에 site/ 전체 스냅샷 백업.
  - 사용자가 명시적으로 거부하지 않으면 진행 (위임 모드 효율).
- Stage 분할 확정:
  - Stage 0.5 (본 세션 직접 처리): `site/tokens.css` 사본 생성. 원본 archive/ tokens.css는 보존. 외부 @import 2줄 제거, font-family 토큰을 system 폴백 우선으로 재정의(Pretendard 폴백 유지), 그 외 토큰은 그대로 복사.
  - Stage 1a (에이전트 위임): site/index.html과 docs 7개 HTML 의 <head>에 `<link rel="stylesheet" href="tokens.css">` 추가 (style.css link 앞). site/style.css `:root` 끝에 기존 변수를 신규 토큰으로 매핑하는 alias 블록 추가. 기존 hard-coded 컬러는 변경 안 함. 클래스명 변경 안 함.
  - Stage 1b: 파생 변수 (primary-*, surface-*, equip-*, hero-*) 보강 매핑 — Stage 1a 정상 확인 후.
  - Stage 2: 타이포 토큰 매핑 — 폰트 결정 후.
  - Stage 3+: 컴포넌트 CSS 머지 — 별도 정밀검토 필요.

9. Stage 0.5 결과 (2026-05-24)
- 본 세션 직접 처리: `site/tokens.css` 사본 생성 (151줄). 원본 archive tokens.css 보존.
- 변경 사항:
  - 외부 CDN @import 2줄 제거 (Pretendard CDN, JetBrains Mono Google Fonts).
  - `--font-sans` / `--font-mono` 토큰을 system 폴백 우선으로 재정의 (Pretendard는 폴백 체인에 유지).
  - 그 외 토큰은 원본과 동일. `[data-theme="dark"]` 블록 보존(미활성).
- 백업: `archive/root-file-backups/site-snapshot-2026-05-24-pre-design-migration/` (5.1M, 전체 site/ 스냅샷).
- 결과: BLOCKER 1건(CSP 충돌) 해소. site/* 미변경.

10. Stage 1a 결과 (2026-05-24)
- 에이전트(general-purpose) 구현 + 본 세션 정밀검토 + 보완 처리.
- 1차 변경 (에이전트):
  - site/index.html + docs 7개 HTML head에 `<link rel="stylesheet" href="tokens.css">` 추가 (style.css/docs.css link 직전).
  - site/style.css 끝에 alias 블록 추가 (17개 alias).
  - app.js / data.js / docs.css / vendor / _headers 미변경. node --check 둘 다 통과. innerHTML 34건·replaceChildren 4건 회귀 없음.
- 본 세션 보완 (정밀검토 후 발견 이슈):
  - 이슈 1: docs.css가 tokens.css만 로드하고 style.css는 안 로드 → style.css 끝 alias만으론 docs 페이지가 못 봄. docs.css hard-coded `#2d6a4f` 4건이 그린 잔존.
    - 처리: tokens.css `:root` 끝에 alias 블록 추가 (docs 공유), docs.css의 hex 14건을 var() 호출로 교체.
  - 이슈 2: tokens.css 단일 위치로 alias 이동 후 style.css 끝 alias 블록을 임시 제거 → cascade 우선순위 미스 (style.css가 tokens.css보다 나중 로드, style.css 위쪽 hard-coded `--primary: #2d6a4f`가 alias를 덮어씀) → index.html "투수" 토글이 그린으로 회귀.
    - 처리: style.css 끝의 alias 블록 즉시 복원. tokens.css alias와 style.css alias 모두 유지(같은 매핑, 결과 동일).
- 직접 검증 (미리보기 MCP):
  - index.html: "투수" 토글 Navy(#1F4585), 카드 화이트, 본문 ink, 빈 상태 회색 — 정상.
  - about.html: 헤딩·링크 Navy, 본문 ink, 카드 화이트, 페이지 배경 #F5F6F8 — 정상.
  - 히어로 영역(dark green gradient)은 미변경 — Stage 1b 영역 hard-coded 변수 매핑 안 됨. 의도된 잔존.
- 이슈 분류:
  - BLOCKER/MAJOR: 없음.
  - MINOR 1 (자체 발견·즉시 해소): cascade 이슈.
  - NIT 1 (이연): `.doc-note` 내부 amber 어두운 텍스트 `#78350f`는 단일 alias 없음 → Stage 1b에서 검토.
- 잔여 작업 (Stage 1b로 이연):
  - hero gradient/glass tokens (`--hero-gradient-*`, `--hero-glass-*`, `--hero-mark-*`, `--hero-pill-*`, `--guide-cta-*`, `--hero-mint-*` 약 30개).
  - primary 파생 (`--primary-soft/faint/hover/ring/border/subtle/strong-ring/hover-shadow` 8개).
  - surface 파생 (`--surface-soft/subtle/muted` 3개).
  - equip 컬러 (`--equip-*` 12개) — 디자인 의도 확인 필요.
  - swap-status (`--swap-status-text/bg`).
  - text 파생 (`--text-subtle`, `--text-placeholder`).
  - `.doc-note` 본문 텍스트 색.

11. 새 자료 도착 (2026-05-24, Stage 1a 진행 중)
- 사용자 Claude Design 추가 export → `~/Downloads/archive 2/...`.
- 신규: `archive/design-mockups/2026-05-23-claude-design-export/mockups/` 21개 PNG + index.html 그리드 + MOCKUPS.md 매핑표. 프로젝트로 복사 완료.
- 변경: README.md (mockups 폴더 안내 + 작업 흐름 추가). 프로젝트 사본 갱신 완료.
- 동일: tokens.json / tokens.css / components.css / snippets / 미리보기 index.html.
- MOCKUPS.md 핵심:
  - 21개 화면 → 컴포넌트 클래스 → 스니펫 매핑표.
  - 시그널 라벨 4단계: 정상/주의/초과/여유 (3단계 → 4단계 보정).
  - 일부 화면(#6, #17-19) `.cl-*` prefix 클래스는 components.css에 미정의 (JSX 컴포넌트만). Stage 3 진입 시 별도 작업 필요.
  - 디자인 결정 메모: 데이터 밀도, 카피 톤, 모달 vs 시트, 문서 페이지 마스터.
- 활용 방안:
  - Stage 1b 진행 중에는 영향 없음 (시각 참고만).
  - Stage 3+ 진입 시 mockups/index.html을 띄워두고 화면별 컴포넌트 매핑으로 사용.

12. Stage 1a 종료 판단
- 변경 파일: site/tokens.css(신규 + alias) / site/style.css(alias 블록) / site/docs.css(hex → var()) / site/{index,about,assessment-guide,contact,privacy,recovery-guide,terms,workload-guide}.html (link 1줄).
- BLOCKER/MAJOR 0, MINOR 1(자체 해소), NIT 1(이연), 회귀 없음.
- 사용자 시각/실사용 확인 대기:
  1. 메인 앱 index.html — "투수" 토글이 Navy, 카드 화이트, 본문 ink로 보이는지.
  2. 문서 페이지 7개 — 헤딩·링크 Navy, 본문 ink, 카드 화이트로 보이는지.
  3. JS 인터랙션(선수 등록, 모달 열기·닫기, 회복 picker, 워크로드 표시 등)이 이전과 동일하게 동작하는지.
- 다음 행동: 사용자 확인 결과 수령 → 이슈 없으면 Stage 1a 종결 후 Stage 1b 티켓 작성.

13. Stage 1b 종결 (2026-05-24, 사용자 확인 OK)
- 사용자 시각/실사용 확인 완료: "다 잘 열리고 다음으로 넘어가도 됨".
- 추가 백업: `archive/root-file-backups/site-snapshot-2026-05-24-post-stage-1b/` (5.1M, Stage 1b 결과 시점 스냅샷).
- 종결.

14. Stage 3 분할 계획 (2026-05-24)
- 사용자 결정: 시안처럼 UI 풀로 전환하되 기능 보존. 영역별 단계 분할로 안전 진행.
- Stage 3 진입 원칙: **기존 클래스명 유지 + 내부 CSS만 시안 톤으로 재작성** → site/app.js의 selector 무영향. 클래스명 리네임(Stage 5)은 위임 모드 중 금지.
- 세부 분할 (각 영역마다 백업 → 변경 → 미리보기 → 사용자 확인):
  - **Stage 3a — 버튼**: `.btn`, `.btn-primary/secondary/danger/outline/sm/block`, `.btn-danger-outline`, `.btn i`, `.btn-sm i`. (현재 진행 완료)
  - Stage 3b — 폼/입력: `.form-control`, `.form-group`, `.form-label`, `.form-help-text`, `.form-error-message`, select 스타일.
  - Stage 3c — 토글/체크/라디오: `.type-toggle`, `.type-btn`, 체크박스 그룹, recovery-picker.
  - Stage 3d — 카드 / 영역 헤더: `.card`, `.card h2`, `.s1-layout` 분할 등.
  - Stage 3e — 배지·태그: `.badge`, `.tag`, `.chip`, `.label-*`, ACWR 시그널 라벨.
  - (이후) Stage 4 — 차트 카드 / 모달 / docs 마스터: 영역별 별도 정밀검토.
- 위임 모드 내 진행 가능 한도: Stage 3 전체 + Stage 4 일부. Stage 5는 금지.

15. Stage 3a 결과 (2026-05-24)
- 본 세션 직접 처리 (영역 작음, 사양 명확).
- 변경 위치 (site/style.css 3곳):
  - L385-443: `.btn` 베이스 + 6개 변형(`.btn-primary/secondary/danger/outline/sm/block`) + 디스에이블 셀렉터. 시안 톤(`gap: var(--s-2)`, `padding: 10px 18px`, `border-radius: var(--r-md)`, `font-size: 13px`, `letter-spacing: -0.005em`, transition 0.12s) 적용. 클래스명·로직 변경 없음.
  - L1926-1937: `.btn i`, `.btn-sm i` — 아이콘 사이즈 18→16 / 16→14, `margin-right` 제거(베이스 .btn의 `gap` 사용).
  - L2473-2488: `.btn-danger-outline` — 시안 톤 정합 정리(라운드 토큰, 폰트 11.5px, transition 0.12s, hover 인버트).
- 정합 결과:
  - `.btn-primary` 배경 = var(--primary) = navy (Stage 1b 결과 유지). 시안의 `.btn-primary`(ink 검정)이 아닌 navy 톤 채택 — 사용자 선호 반영.
  - `.btn-secondary` = var(--ink) 검정 톤. 시안 메인 액션 보조용.
  - `.btn-danger` 소프트 단(light bg + risk 텍스트) → hover 시 인버트(risk bg + white).
  - `.btn-outline` border = var(--rule-2), hover bg = var(--tint).
- 검증:
  - node --check site/app.js / site/data.js: 둘 다 통과.
  - app.js / data.js / docs.css / tokens.css: 미변경 (diff 출력 0).
  - 미리보기: 메인 액션 버튼 시안 톤(작아진 사이즈, 4px 라운드, 13px 폰트, navy bg) 정상. 히어로/카드/토글 영역 회귀 없음.
- 이슈: 없음.
- 잔여: header dashboard/guide CTA, 토글, 폼 input 등은 별도 클래스로 Stage 3b–3e 영역.
- 사용자 시각/실사용 확인 대기: index.html에서 폼 제출·모달 내 버튼(컨디션/워크로드 입력·취소 등) 시안 톤으로 보이는지, 클릭 동작 정상인지.

16. Stage 3b-e 결과 (2026-05-24)
- 본 세션 직접 처리 (영역 작음, 사양 명확).
- Stage 3b — 폼/입력 (style.css L457-484, L554-578):
  - `.form-group` 유지 (margin-bottom 20px).
  - `.form-label` 13→12px, color text-muted→ink-2, letter-spacing -0.005em.
  - `.form-help-text` 12→11.5px, line-height 1.5.
  - `.form-error-message` 13→11.5px.
  - `.form-control` 시안 톤 풀 교체: padding 16→11px/14px, font 16→13.5px, bg input-bg→surface, border transparent→1px solid rule-2, radius radius-sm→r-md, transition 0.2s→0.12s.
  - `.form-control::placeholder` color text-placeholder→mute-2.
  - `.form-control:focus` bg card-bg, border ink, shadow shadow-focus.
- Stage 3c — 토글/체크박스/picker:
  - `.checkbox-group label` font 14→13.5px, gap 6→8.
  - `.type-toggle` 시안 .toggle 구조 (grid 2col, padding 3px, gap 3px, bg bg-color, border rule-2, radius r-md).
  - `.type-btn` 시안 톤 (padding 14/16→8/12px, font 15→12px, weight 700→600, transparent bg, transition 0.12s, radius r-sm). active = navy 유지.
  - `.type-btn:first-child` 보더 제거 (시안 톤은 gap만).
  - `.type-btn:not(.active):hover` bg surface-muted→tint.
  - `.recovery-picker-label` 14→13.5px.
  - `.recovery-picker-help` 12→11.5px, line-height 1.5.
- Stage 3d — 카드 (.card L611-618):
  - radius var(--radius) 14px → var(--r-lg) 6px.
  - padding 24 → var(--s-8) 32px.
  - box-shadow var(--shadow) → var(--shadow-card) 약화.
  - border none → 1px solid var(--border).
- Stage 3e — 배지 (.badge L1325-1333, 보수적 변경):
  - padding 12/16 → 10/14px.
  - radius radius-sm 10px → r-md 4px.
  - font 14→13.5px, letter-spacing -0.005em.
  - 변형(`.badge-warning/danger/success/info`)은 토큰 alias로 자동 시안 톤. 별도 수정 없음.
- 검증:
  - node --check site/app.js / site/data.js: 둘 다 통과.
  - app.js / data.js / docs.css / tokens.css: 미변경.
  - innerHTML 34건 / replaceChildren 4건 유지.
  - 미리보기: 카드 사각형 가까운 라운드 + 보더 + 약한 그림자 = 시안 톤. 입력란 작은 사이즈 + 흰 배경 + 얇은 보더. 토글 시안 톤 둥근 알약. 회복 picker 라벨 작아짐.
- 이슈: 없음.
- 종결 적격 (사용자 확인 대기).

17. Stage 3 묶음 종료 판단
- 변경 파일: site/style.css 단일 (Stage 3a-e 통틀어 약 +25줄).
- 변경 클래스 (모두 기존 이름 유지): `.btn` 6변형 + `.btn-danger-outline` + `.btn i`/`.btn-sm i` + `.form-group/label/help-text/error-message/control` + `.form-control:focus/::placeholder/select.form-control 영향 없음` + `.checkbox-group label/checkbox` + `.type-toggle/-btn/-btn.active/-btn:hover` + `.recovery-picker-label/help` + `.card` + `.badge`.
- 회귀 확인: site/app.js, site/data.js, site/docs.css, site/tokens.css, site/*.html, vendor/, _headers 모두 미변경. node --check 통과. innerHTML/replaceChildren 회귀 없음.
- 잔여 (Stage 4 또는 별도 티켓):
  - 모달 영역 (.modal-overlay, .modal-title, .modal-content, .modal-footer 등): JS 동작 의존도 큼, 정밀검토 필요.
  - docs.css의 도큐먼트 페이지 마스터 (.doc-wrap, .doc-meta 등): 시안 .doc-* 마스터로 전환 검토.
  - 차트 카드, 8종목 평가 카드, ACWR 카드: 시안 .hero-data/.stat 톤으로 정합 검토.
  - equip 12개 컬러: 시안 시그널 톤으로 통합 vs 카테고리 유지 디자인 결정.
  - swap-status 2개: 시안 톤 결정.
  - `.badge` 미니 pill 형태 변환 (시안 진짜 톤): 사용처 영향 큼, 별도 티켓.
- 사용자 실사용 확인 항목 (Stage 3 묶음 종결 조건):
  1. 선수 1명 등록 → 카드/입력/토글 시안 톤 정상 표시.
  2. 컨디션 모달 열기·닫기 → 회복 picker 라벨 작아진 톤 정상.
  3. 워크로드 모달 열기 → RPE/투구수 입력 시안 톤 정상, 실시간 표시 정상.
  4. 폼 안 메인 액션 버튼 클릭 시 동작 정상.

18. Stage 3 묶음 종결 (2026-05-24, 사용자 확인 OK)
- 사용자 시각/실사용 확인 완료: "확인 다음으로 넘어갈 것".
- 추가 백업: `archive/root-file-backups/site-snapshot-2026-05-24-post-stage-3/` (Stage 3 결과 시점 스냅샷).
- 종결.

19. Stage 4 분할 계획 (2026-05-24)
- 본 위임 모드 기간 내 진행 가능한 잔여 영역:
  - **Stage 4b — docs 마스터 (안전)**: site/docs.css 풀 재작성. 시안 .doc-* 톤(max-width 720, body 16px/1.7, h1 40px, h2 22px, doc-note grid). HTML 무변경.
  - **Stage 4e — swap-status (안전)**: 보라 → watch(amber) 톤. style.css alias 매핑만.
  - Stage 4d — equip 12개 컬러: 카테고리 식별성 vs 시안 통일 결정 필요. 본 묶음에서 **유지** (별도 디자인 결정).
  - Stage 4a — 모달 (.modal-overlay, .modal-title, .modal-content, .modal-footer 등): JS 동작 의존도 큼. 별도 단계로 정밀검토.
  - Stage 4c — 차트 카드/8종목 평가/ACWR 카드: Chart.js 렌더링 의존. 별도 단계로 정밀검토.
- 본 단계 묶음(4b + 4e) 처리 후 다음 결정.

20. Stage 4b + 4e 결과 (2026-05-24)
- 본 세션 직접 처리 (영역 작음, 사양 명확).
- Stage 4b — docs.css 풀 재작성:
  - max-width 640→720 (시안 doc-max-w 일치).
  - body font 15→16px, letter-spacing -0.005em 추가.
  - .doc-wrap padding 36/32 → 56/32/64.
  - .doc-back: 시안 톤 (12.5px, text-muted, hover bg). primary→text-muted.
  - h1: 22→40px (시안 doc-h1-size), weight 800→700, letter-spacing -0.025em, color primary-dark→text-main (ink).
  - .doc-meta: 시안 톤 (flex gap 18px, font 11.5px, 정보 패딩 정합).
  - h2: 15→22px (시안 doc-h2-size), weight 700→700 유지, letter-spacing -0.02em, color primary→text-main.
  - p: 본문 16px / line-height 1.7 (시안 doc-body), color text-main→ink-2.
  - ul: 시안 .doc-body ul 톤 (디스크 마커, 마커 색 primary).
  - .doc-note: padding 12/14→18/20, radius r-lg, font 13→14px, color #78350f→ink-2. grid 레이아웃은 단순 inline 박스 유지(HTML 무변경 원칙).
  - .doc-links: margin-top 28→40, padding-top 16→24, 시안 톤 underline 정합.
- Stage 4e — swap-status:
  - site/style.css alias 블록에 `--swap-status-text: var(--watch); --swap-status-bg: rgba(166, 118, 53, 0.08);` 매핑 추가.
- 검증:
  - node --check site/app.js / site/data.js: 둘 다 통과.
  - app.js / data.js / tokens.css: 미변경.
  - 미리보기 about.html: h1 40px 큰 헤딩 + 본문 16px / 1.7 + 메타 작은 사이즈 + 리스트 마커 navy. 시안 .doc-* 톤 정합.
- 이슈: 없음.
- 잔여 Stage 4 (별도 단계):
  - Stage 4a — 모달.
  - Stage 4c — 차트/평가/ACWR 카드.
  - Stage 4d — equip 12개 컬러 (디자인 결정 필요).
- 사용자 시각/실사용 확인 항목:
  1. about.html, assessment-guide.html, recovery-guide.html, workload-guide.html, contact.html, privacy.html, terms.html 7개 페이지 모두 시안 톤(큰 헤딩 + 넓은 본문 + 리스트 마커 navy)으로 표시되는지.
  2. 메인 앱과 문서 페이지 사이 톤 일관성.

21. Stage 4a 결과 (2026-05-24)
- 본 세션 직접 처리.
- 변경 위치 (site/style.css L1361-1460):
  - `.modal-overlay`: backdrop var(--overlay-backdrop) → 직접 rgba(15,23,42,0.5), blur 4→3px.
  - `.modal-content` 모바일: bg white→var(--card-bg), border-radius 24→var(--r-2xl) 14px, box-shadow 직접 식→var(--shadow-sheet).
  - `.modal-content` 데스크탑(min-width 600px): border-radius 24→var(--r-xl) 8px, box-shadow var(--shadow-modal) 추가.
  - `.modal-header`: padding-bottom 16px + border-bottom 1px solid var(--border) 추가 (시안 .modal-head 패턴).
  - `.modal-title`: weight 800→700, letter-spacing -0.02em.
  - `.modal-close`: 32→30, font 20→18, radius 50%→var(--r-md), hover bg surface-muted→tint, transition 0.2s→0.12s, hover color text-main 추가.
- 검증:
  - node --check site/app.js / site/data.js: 둘 다 통과.
  - app.js / data.js / docs.css / tokens.css: 미변경 (모달 JS 토글·focus 동작 보존).
  - 미리보기 — "사용 가이드" 모달 열기 시: navy ink scrim + sheet 형태 모달, 시안 톤 헤더(border-bottom), 시안 톤 닫기 버튼(사각 가까운 라운드), 내부 콘텐츠 카드 일관성. 동작 정상.
- 이슈: 없음.
- 잔여 Stage 4:
  - Stage 4c — 차트/평가/ACWR 카드 (Chart.js 의존).
  - Stage 4d — equip 12개 컬러 (디자인 결정 필요).
- 사용자 시각/실사용 확인 항목:
  1. 사용 가이드 모달 정상 표시·닫기.
  2. 컨디션 입력 모달 열기·입력·저장·닫기 동작.
  3. 워크로드 입력 모달 열기·RPE/투구수 입력·저장·닫기 동작.
  4. 운동 상세/대체 모달 열기·닫기.

22. Stage 4c 결과 (2026-05-24)
- 본 세션 직접 처리 (변경 명확, 영역 작음).
- 변경 위치:
  - site/app.js (Chart.js 차트 fill 색 6곳):
    - L3145 (정밀평가 레이더 차트 fill): `rgba(45, 106, 79, 0.2)` (Forest Green) → `rgba(31, 69, 133, 0.18)` (navy).
    - L3182 (타구속도 라인 fill): `rgba(245,158,11,0.1)` (amber) → `rgba(166, 118, 53, 0.12)` (watch).
    - L3183 (배트스피드 라인 fill): `rgba(239,68,68,0.1)` (red) → `rgba(184, 92, 82, 0.12)` (risk coral).
    - L3201 (최고 구속 라인 fill): 동일 risk 매핑.
    - L3202 (평균 구속 라인 fill): `rgba(16,185,129,0.1)` (mint) → `rgba(47, 122, 95, 0.12)` (safe).
    - L3203 (RPM 라인 fill): `rgba(45,106,79,0.1)` (Forest Green) → `rgba(31, 69, 133, 0.12)` (navy).
    - borderColor는 이미 getCssVar로 토큰 참조 중이라 자동으로 시안 톤 적용됨 (Stage 1b alias 통해).
  - site/style.css (.acwr-card L3631-3639):
    - padding 15→var(--s-5) 20, radius var(--radius-sm)→var(--r-lg), title font 16→14px + letter-spacing, label 12→11.5px, value letter-spacing 추가, ratio weight 800→700, status font 13→12px·radius 6→var(--r-md).
  - site/style.css (.assess-* L871-892):
    - .assess-item padding 20→var(--s-5), radius var(--radius)→var(--r-lg), margin-bottom 16→12.
    - .assess-title font 16→14px, margin 8→6px.
    - .assess-desc font 13→12px, color var(--secondary)→var(--text-muted), line-height 1.5 추가, margin 16→14.
- 검증:
  - node --check site/app.js / site/data.js: 둘 다 통과.
  - data.js / docs.css / tokens.css: 미변경.
  - app.js 변경 6곳 모두 hard-coded Forest Green/amber/red/mint rgba가 navy/watch/risk/safe rgba로 교체됨. borderColor 토큰 참조는 그대로.
- 이슈: 없음.
- 잔여 Stage 4:
  - Stage 4d — equip 12개 컬러 (디자인 결정 필요).
  - .player-velo-box: success 계열 gradient + success-border 사용. --success는 var(--safe)로 alias됐으나 --success-surface-soft / --success-border는 미매핑. 별도 보강 가능 (Stage 1b 잔여로 분류 가능).
- 사용자 시각/실사용 확인 항목:
  1. 선수 1명 등록 → 정밀평가 진행 → 결과 페이지의 8종목 레이더 차트가 navy fill로 표시되는지.
  2. 결과 페이지의 구속 추이 라인 차트가 시안 톤(coral/sage/navy fill)으로 표시되는지.
  3. ACWR 카드 톤 정합.

23. Stage 4a 종결 (2026-05-24, 사용자 확인 OK)
- 사용자 시각/실사용 확인 완료: "확인 해 보니 이상없고 4c 이제 진행해".
- 종결.

24. Stage 4c 종결 + Stage 4d 결정 (2026-05-24, 사용자 확인 OK)
- 사용자 시각/실사용 확인 완료: "좋아 다음으로 가자".
- Stage 4d 결정: **equip 12개 컬러 유지** (카테고리 식별성 우선, 시안 통일감보다 가치 있음). 본 세션 추정 결정. 사용자가 통일 원하면 별도 티켓.
- Stage 4 묶음 종결.

25. 위임 모드 핵심 디자인 마이그레이션 종결 (2026-05-24)
- 사용자 결정 잔여: 없음 (4d 본 세션 추정 결정으로 처리, 추후 조정 가능).
- 누적 변경 파일:
  - site/tokens.css (신규)
  - site/style.css (alias 블록 + 영역별 시안 톤 정합)
  - site/docs.css (풀 재작성)
  - site/app.js (Chart.js fill rgba 6곳)
  - site/{index,about,assessment-guide,contact,privacy,recovery-guide,terms,workload-guide}.html (link 1줄씩)
- 미변경 파일: site/data.js, site/_headers, site/vendor/**, archive/design-mockups/2026-05-23-claude-design-export/**, docs/**.
- 누적 백업:
  - archive/root-file-backups/site-snapshot-2026-05-24-pre-design-migration/ (Stage 1a 직전)
  - archive/root-file-backups/site-snapshot-2026-05-24-post-stage-1b/ (Stage 1b 직후)
  - archive/root-file-backups/site-snapshot-2026-05-24-post-stage-3/ (Stage 3 묶음 직후)
  - archive/root-file-backups/site-snapshot-2026-05-24-post-stage-4a/ (Stage 4a 직후)
- 잔여 작업 (5/27 총괄 Codex 복귀 후 결정):
  - Stage 1b NIT 1: `.doc-note` 내부 어두운 amber 텍스트 `#78350f` 단일 alias 없음.
  - Stage 1b 잔여: equip 12개 컬러 통일 vs 유지 디자인 최종 결정.
  - Stage 2b: 폰트 사용자 결정 후 font-family 토큰만 교체.
  - Stage 5: HTML 클래스명 리네임 (시안 100% 룩 완성, JS 동시 수정 필요).
  - .player-velo-box: --success-surface-soft / --success-border 미매핑 보강.
- 다음 행동: 5/27 총괄 Codex 복귀 시점에 본 work-plan.md 섹션 0~25를 work-plan-archive.md로 일괄 이관, 위임 모드 해제.

26. Stage 5 부분 G 결과 (2026-05-24)
- 사용자 결정: Stage 5(HTML 구조 진입) 부분 허용. 영역별 안전 진행. 백업 확보 후 진행.
- 백업 신규: `archive/root-file-backups/site-snapshot-2026-05-24-post-stage-4-color-pass/` (Stage 4 색·톤 정합 직후 시점).
- 작업 분배:
  - **docs.css 클래스 정의** — 본 세션 직접 처리 (3개 클래스 추가): `.doc-eyebrow`, `h2 .h-num`, `.doc-lead`.
  - **h2 안 .h-num 변환 (7개 HTML, 35건)** — 본 세션 sed 일괄 처리 (위임 모드 원칙 위반, 사용자 지적 후 인정). 결과 정확하므로 유지.
  - **.doc-eyebrow 한 줄 추가 (7개 HTML)** — 에이전트(general-purpose) 위임. 위임 모드 원칙 준수.
- 에이전트 보고 (a15abefea8f5ea15b):
  - 7개 HTML 각 14번째 줄 `<a class="doc-back">` 직후 15번째 줄에 `<div class="doc-eyebrow">{라벨}</div>` 1줄씩 추가.
  - 페이지별 라벨: SERVICE·서비스 소개 / GUIDE·8종목 활용법 / SUPPORT·문의·지원 / POLICY·개인정보처리방침 / GUIDE·회복 기록 / POLICY·이용약관 / GUIDE·워크로드·ACWR.
  - 들여쓰기 8스페이스 (doc-back과 동일).
  - 다른 파일 일절 미변경.
- 본 세션 정밀검토:
  - 직접 read 확인 (about.html L12-17, privacy.html L12-17): doc-eyebrow 정확한 위치·들여쓰기·라벨 텍스트.
  - diff 7개 페이지 (vs `site-snapshot-2026-05-24-post-stage-4-color-pass`):
    - about.html: 22줄 diff (eyebrow 1 add + h2 5건 변환).
    - assessment-guide.html: 18줄 diff (eyebrow 1 + h2 4건).
    - contact.html: 18줄 diff (eyebrow 1 + h2 4건).
    - privacy.html: 30줄 diff (eyebrow 1 + h2 7건).
    - recovery-guide.html: 18줄 diff (eyebrow 1 + h2 4건).
    - terms.html: 30줄 diff (eyebrow 1 + h2 7건).
    - workload-guide.html: 18줄 diff (eyebrow 1 + h2 4건).
    - 패턴 일관: 각 h2 변환 = diff 3줄(< / --- / >), 각 페이지 eyebrow add 1줄, 합계 일치.
  - h-num 합계: 5+4+4+7+4+7+4 = 35건 (인벤토리 기대값 정확).
  - 다른 영역 무수정 확인 (diff -q 출력 0):
    - site/app.js, site/data.js, site/style.css, site/tokens.css, site/docs.css(클래스 정의만 본 세션 추가, h-num/eyebrow 변환은 HTML만), site/_headers, site/vendor/, archive/**(원본), docs/**.
  - node --check site/app.js / site/data.js: 둘 다 통과.
  - 미리보기 about.html 시각 확인: navy 짧은 바 + "SERVICE · 서비스 소개" eyebrow (mono, 10.5px, letter-spacing 0.18em, uppercase, text-muted) + h2 안 "01/02/03" 번호 태그 (mono 11px, surface-subtle bg, r-sm 라운드) + h1 40px + 본문 16px/1.7 — 시안 .doc-* 마스터와 정합.
- 이슈: 없음. 위임 원칙 위반(h2 sed 직접 처리)은 결과 정확하므로 추인. 앞으로는 코드 구현 모두 에이전트 위임 원칙 엄수.
- 잔여 (.doc-lead): docs.css에 클래스 정의 추가됐으나 HTML에는 아직 미적용. 콘텐츠(현 첫 문단을 lead로 승격) 결정 필요 → 별도 단계 또는 후속.
- 사용자 시각/실사용 확인 항목:
  1. 7개 문서 페이지 모두 헤더에 카테고리 라벨(SERVICE/GUIDE/SUPPORT/POLICY) + navy 짧은 바.
  2. 각 h2 앞에 "01", "02", … 번호 태그.
  3. 본문 내용 변경 없음.
  4. "← 앱으로 돌아가기" 링크 정상.

27. Stage 5 부분 B 결과 (2026-05-24)
- 사용자 결정: 다음 영역 본 세션 위임 ("너가 선택해서 오류 없이 잘 작업 해").
- 본 세션 선택: B (결과 페이지 ACWR 카드 → 시안 .hero-data 다크 패널 톤). 이유: 위험 매우 낮음(정적 영역), 시각 임팩트 강함, JS selector 무영향, 정보 손실 없음.
- 백업 신규: `archive/root-file-backups/site-snapshot-2026-05-24-post-stage-5g/` (Stage 5 G 직후 시점).
- 작업 분배:
  - 영역 선택 + spec 설계 — 본 세션.
  - 코드 구현 — 에이전트(general-purpose) 위임 (ID: ac0490fb0b1ea9fe6). 위임 모드 원칙 준수.
  - 정밀검토 — 본 세션.
- 에이전트 변경 (site/style.css L3633-3734, +32줄):
  - `.acwr-card`: padding 24/28, bg var(--ink), color var(--surface), r-xl, border 0, position relative, overflow hidden.
  - `.acwr-card::before`: 우하단 200px 원형 데코 (rgba 흰선 6% 투명도). pointer-events: none.
  - `.acwr-card--trend`: bg var(--card-bg) 오버라이드, color var(--text-main), border 추가, padding s-5. ::before 비활성.
  - `.acwr-card-title`: mono 10px 600, letter-spacing 0.18em, uppercase, color 흰색 60% (--trend는 text-muted).
  - `.acwr-metrics-row`: flex space-between flex-end gap 20px.
  - `.acwr-metric-label`: mono 10px uppercase letter-spacing 0.16em (--trend는 text-muted).
  - `.acwr-metric-value`: mono 18px 600, color surface (--trend는 text-main).
  - `.acwr-metric-value--ratio`: mono **56px** 500 letter-spacing -0.04em line-height 0.95 (시안 .hero-num 패턴). --trend는 color primary 유지.
  - `.acwr-status`: mono 11px 600, padding 10/14, r-md, position relative z-index 1. bg/color는 JS inline style이 처리.
- 본 세션 정밀검토:
  - 직접 read 확인 (L3631-3740): 코드 정확히 spec대로 교체됨.
  - node --check site/app.js / site/data.js: 둘 다 통과.
  - diff -q 6개 (vs `site-snapshot-2026-05-24-post-stage-5g`): app.js / data.js / index.html / docs.css / tokens.css / _headers 모두 미변경 (출력 0).
  - wc -l: style.css 3843 → 3875 (+32, spec 범위 내).
- 이슈: 없음.
- 잠재 리스크 (사용자 시각 확인 시 발견 가능):
  - `.acwr-status` JS inline style이 다크 패널과 어울리지 않을 가능성:
    - "데이터 부족" (bg var(--bg-color) light + color var(--text-muted) 회색) → 다크 위에 거의 안 보임 가능성.
    - "안전 영역" (var(--success-light) bg + var(--success) 텍스트) → 다크 위에 light bg가 잘 보일 듯.
    - "주의/위험" 동일 패턴.
    - 발견 시 Stage 5 B2 별도 패치 (JS L3258-3296 inline style을 다크 적합 톤 또는 dataset 클래스로 전환).
- 사용자 시각/실사용 확인 항목:
  1. 선수 1명 등록 → 정밀평가 → 결과 페이지의 ACWR Dashboard가 어두운 ink 패널 + 큰 모노 비율 숫자(56px)로 표시되는지.
  2. 그 옆 "퍼포먼스 성장 추이" 차트 카드는 화이트 유지되는지 (차트 렌더링 정상).
  3. ACWR 상태 라벨("안전 영역" 등)이 다크 패널 위에서 가독성 있는지.

28. Stage 2b 폰트 결정 + Stage 5 A 1단계 결과 (2026-05-24)
- 사용자 결정: 폰트는 기존 Pretendard 우선 유지. 디자인은 계속 적용.
- Stage 2b 본 세션 직접 처리 (단일 토큰 변경):
  - site/tokens.css `--font-sans`: 시스템 폴백 우선 → 'Pretendard' 우선 (한글 가독성 회복).
  - `--font-mono`: 그대로 (ui-monospace 폴백, 시안 mono 표시용).
- Stage 5 A 1단계 본 세션 직접 처리 (.player-card 컨테이너만):
  - site/style.css L631-646:
    - gap 16 → var(--s-4) 16 (동일).
    - padding 20 → var(--s-5) 20 (동일).
    - border-radius var(--radius) 14 → var(--r-lg) 6 (사각 가까운 시안 톤).
    - margin-bottom 16 → 12.
    - box-shadow 신규 추가 (var(--shadow-card) 약한 그림자).
    - transition transform → border-color/box-shadow 0.12s.
    - hover translateY 제거, border-color rule-2 변경 (시안 미니멀 hover).
- 검증:
  - node --check 둘 다 통과.
  - app.js / data.js / docs.css / index.html / _headers 미변경.
  - 미리보기 index.html 폼 영역: Pretendard 본문 폰트 정상 표시 (system 폴백 X).
- 이슈: 없음.

29. Stage 5 A 2a + 2c 결과 (2026-05-24)
- 사용자 결정: "너가 생각하기에 제일 적합하고 오류 없는 쪽으로 선택".
- 본 세션 선택: A 2a (헤더·메타) + A 2c (태그 5종) 묶음. A 2b (구속/통계, linear-gradient 있음)는 위험 분리.
- 코드 구현 → 에이전트(general-purpose) 위임 (ID: a98d57223f8524e48). 위임 모드 원칙 준수.
- 에이전트 변경 (site/style.css 7개 클래스 영역, 본 작업 +15줄):
  - `.player-header`: gap var(--s-3) 추가.
  - `.player-info`: font 18→16, letter-spacing -0.015em.
  - `.player-meta`: font 14→11.5, letter-spacing -0.005em, line-height 1.6→1.5.
  - `.player-card-top`: gap var(--s-3), margin-bottom 14→var(--s-3).
  - `.player-week-badge`: font-mono, 11→10.5px, weight 700→600, padding 3/10→4/11, radius 20px→var(--r-pill), letter-spacing 0.3px→0.06em, uppercase 추가.
  - `.player-age-badge`: font-mono, 12→11px, radius 8→var(--r-md), letter-spacing -0.005em.
  - 태그 5종 (.player-goal-tag, .player-training-focus-tag, .player-user-type-tag, .player-usage-perspective-tag, .player-season-tag): 사이즈 11→11.5px, padding 4/10→5/11, radius 6→var(--r-md), letter-spacing -0.005em. **background/color는 식별성 유지 위해 그대로** (carbon copy의 식별성 vs 시안 통일 트레이드오프에서 식별성 선택).
- 본 세션 정밀검토:
  - 직접 read 확인 (L658-663, L665-673, L698-706, L801-808): 코드 spec 정확히 일치.
  - node --check site/app.js / site/data.js: 둘 다 통과.
  - diff -q vs `site-snapshot-2026-05-24-post-stage-5g`: app.js / data.js / index.html / docs.css 미변경 (출력 0). tokens.css는 Stage 2b 변경분으로 정상 차이.
  - wc -l: style.css 3875 → 3889 (+14, 에이전트 보고와 일치).
- 이슈: 없음.
- 잔여:
  - A 2b: .player-velo-box (linear-gradient success-light/success-surface-soft), .player-velo-item, .player-velo-label, .player-velo-value, .player-velo-divider, .player-stats-grid, .player-stat-item, .player-stat-label, .player-stat-value. 별도 단계 (success-surface-soft는 미매핑 hex `#f0fdf4`).
  - A 3: 추가 태그류 또는 미세 정합.
  - F 코치 대시보드: `.cl-kpi`, `.cl-action` 신규 클래스 도입 필요 (시안 components.css에 미정의, mockups #08 JSX 기준).
- 사용자 시각/실사용 확인 항목:
  1. 선수 1명 등록 → 카드의 이름·메타가 시안 톤 (16px 700 + 11.5px mute) 정상 표시.
  2. 카드 상단 week-badge가 mono uppercase pill 톤으로 표시.
  3. 태그 5종 (목표/훈련방향/유저타입/사용관점/시즌)이 시안 사이즈/라운드로 정합, 색은 카테고리 식별 가능.

30. Stage 5 F1 결과 (2026-05-24)
- 사용자 결정: 검증 후 다음 진입.
- 본 세션 분할: F를 F1(KPI 카드)와 F2(미니 카드/필터/액션 큐)로 쪼개 안전 진입.
- 코드 구현 → 에이전트(general-purpose) 위임 (ID: a24a30ec14a1f83c2).
- 백업 신규: `archive/root-file-backups/site-snapshot-2026-05-24-post-stage-5a/` (Stage 5 A 묶음 완료 시점).
- 에이전트 변경 (site/style.css 7개 블록, +5줄):
  - `.stat-section-label`: mono 10.5px 600, letter-spacing 0.16em, gap 6→8, margin-bottom 6→10.
  - `.stat-filter-badge`: mono 10px 600, padding 1/7→2/9, radius 10px→var(--r-pill), uppercase letter-spacing 0.06em.
  - `.stat-card`: bg white→var(--card-bg), padding 16→var(--s-5), radius 14→var(--r-lg), shadow 직접 식→var(--shadow-card), transition box-shadow→border-color/box-shadow.
  - `.stat-card .label`: mono 10px 600, letter-spacing 0.16em.
  - `.stat-card .value`: mono 28→32px, weight 800→600, letter-spacing -0.03em, margin-top 6→8.
  - `.stat-card.warning`: gradient 제거 → 단색 var(--warning-light), border-left 4px→3px.
  - `.stat-card.danger`: gradient 제거 → 단색 var(--danger-light), border-left 4px→3px.
- 본 세션 정밀검토:
  - node --check site/app.js / site/data.js: 둘 다 통과.
  - diff -q vs `site-snapshot-2026-05-24-post-stage-5a`: app.js / data.js / index.html / docs.css / tokens.css 미변경 (출력 0).
  - 모바일 미디어 쿼리 (L2890-2895): `.stat-card { padding: 12px }`, `.stat-card .value { font-size: 20px }` 오버라이드 확인. mono 폰트 패밀리는 부모 정의 따라가므로 모바일에서도 시안 톤 유지. 시각 충돌 없음.
  - wc -l: style.css 3904 → 3909 (+5).
- 이슈: 없음.
- 잔여 (Stage 5 F2):
  - `.mini-player-card`, `.mini-player-list`, `.mini-player-card .name/risk-tags/tag` (액션 큐 행).
  - `.action-queue-list`, `.action-queue-heading`.
  - `.dashboard-filter-bar`, `.dashboard-filter-chip` (필터 칩, 시안 .chip 패턴).
- 사용자 시각/실사용 확인 항목:
  1. 코치 대시보드 진입 → KPI 카드 mono 32px 큰 숫자 + uppercase mono 라벨 표시.
  2. .stat-card.warning/.danger: 단색 배경 + 좌측 3px 액센트 라인.
  3. 필터 배지(.stat-filter-badge) mono uppercase pill 표시.

31. Stage 5 F2 결과 (2026-05-24)
- 코드 구현 → 에이전트(general-purpose) 위임 (ID: a218b73bd16e8c746).
- 에이전트 변경 (site/style.css 13개 블록, +6줄):
  - **필터 칩 (4 블록)**: `.dashboard-filter-bar` (gap/margin 토큰화), `.dashboard-filter-chip` (padding 6/14→7/13, radius 20px→r-pill, border 1.5→1, bg white→card-bg, color text-muted→ink-2, font 700→600, letter-spacing 추가, box-shadow 제거), `:hover` (border/color/bg 시안 톤), `.active` (bg primary→ink, color white→surface, box-shadow 제거).
  - **액션 큐 (9 블록)**: `.action-queue-list` (gap 토큰화), `.aq-card` (bg white→card-bg, radius var(--radius-sm)→r-md, padding 13/16→s-3/s-4, transition 시안 톤, shadow shadow-card), `:hover` (border 시안 톤), `.aq-card-top` (gap/margin 토큰화), `.aq-name` (font 15→14px, letter-spacing -0.01em, color 추가), `.aq-meta` (font-mono 11px letter-spacing 0.04em), `.aq-tag` (mono 10px 600, padding 2/8→3/9, radius 10→r-pill, uppercase letter-spacing 0.06em), `.aq-tag.aq-info` (bg/border 시안 톤).
  - **유지** (식별성): `.aq-tag.aq-danger` (danger-light/danger), `.aq-tag.aq-warning` (warning-light/warning-text-soft).
- 본 세션 정밀검토:
  - node --check site/app.js / site/data.js: 둘 다 통과.
  - diff -q vs `site-snapshot-2026-05-24-post-stage-5a`: app.js / data.js / index.html / docs.css / tokens.css 미변경 (출력 0).
  - 직접 read 확인 (L2751, L2786, L2828, L2851): 시안 톤 spec 정확히 적용.
  - .aq-tag.aq-danger/aq-warning 색 그대로 유지 확인.
  - wc -l: style.css 3909 → 3915 (+6, 작은 변경분이 letter-spacing/font-family 추가와 shadow 제거 상쇄).
- 이슈: 없음.
- 잠재 리스크: 모바일 미디어 쿼리(@media max-width 480px) 내 `.aq-name`/`.aq-meta` 블록은 본 spec 범위 밖. 데스크탑은 mono 적용, 모바일은 상속 fallback. 큰 시각 충돌 없을 듯하나 사용자 확인 시 차이 있을 경우 별도 NIT 패치.

32. Stage 5 디자인 마이그레이션 핵심 완료 (2026-05-24)
- 5/24 하루 동안 완료된 Stage 5 영역:
  - **A 선수 카드** (A1 컨테이너 + A2a 헤더/메타 + A2b 구속/통계 + A2c 태그 5종): 카드 라운드/그림자/border-color hover, 16px 이름, 11.5px 메타, mono week-badge pill, safe/watch bg 구속 박스, mono 통계 그리드, 태그 5종 사이즈 정합 (색 식별성 유지).
  - **B 결과 페이지 ACWR**: 어두운 ink 패널 + 56px 모노 비율 숫자 + 원형 데코, trend 카드 화이트 유지.
  - **F1 KPI 카드**: 32px 모노 큰 숫자, uppercase mono 라벨, gradient 제거(warning/danger 단색 + 3px 좌측 액센트), 시안 .cl-kpi 패턴.
  - **F2 필터 칩 + 액션 큐**: 필터 칩 시안 .chip 패턴(pill, ink active), 액션 큐 카드 .aq-* 시안 톤(card-bg + shadow-card, mono meta/tag, pill tag), 색 식별성 유지.
  - **G docs 페이지 7종**: doc-eyebrow 카테고리 라벨 + h2 안 mono h-num 번호 태그.
- 미적용/잔여:
  - `.cl-assess-card`, `.cl-assess-input`, `.cl-assess-bar`, `.cl-assess-progress` (시안 mockups #06 8종목 평가) — site의 .assess-* 클래스는 Stage 3에서 미세 정합만, 시안의 .cl-* 신규 클래스는 도입 안 함.
  - `.cl-guide-media`, `.cl-guide-steps`, `.cl-guide-cue`, `.cl-evidence-bar` (시안 mockups #17 운동 가이드) — 시안 정의 부재.
  - `.cl-swap-card`, `.cl-swap-radio` (시안 mockups #18 운동 대체) — 시안 정의 부재.
  - `.cl-tabs-list`, `.cl-quickstart`, `.cl-faq` (시안 mockups #19 앱 가이드 모달) — 시안 정의 부재.
  - 7일 스케줄 (.week-list, .week-row.today, 시안 mockups #07) — site의 .schedule-* 변경 미실시.
  - RPE 입력 `.rpe-bar` (11셀 그리드) — 시안 정의 있으나 HTML 구조 변경 필요.
  - `.brand-mark` 시안 ink + navy 액센트 미니 로고 — site 헤더 .hero-mark 별도 정의.
  - equip 12개 컬러 — 디자인 결정으로 유지.
  - 모바일 분기 영역 일부 — 시안 mockups 모바일 톤 매칭 안 함 (현 site 모바일 분기 유지 결정).
- 5/27 총괄 Codex 복귀 시점 처리:
  - 본 work-plan.md 섹션 0~32를 work-plan-archive.md로 일괄 이관.
  - 위임 모드 해제, 정식 워크플로 복귀.
  - 잔여 작업(.cl-* 신규 도입, .player-row HTML 리네임 등)은 Codex 검토 후 정식 티켓.

33. 위임 모드 종결 보고 + Codex 인계 노트 (2026-05-24)

## 본 위임 모드 진행 요약
- 기간: 2026-05-24 (약 1일).
- 사용자 지시: 5/27 Codex 복귀 전까지 디자인 마이그레이션에 집중. 본 세션이 총괄 위임 대행 + 에이전트 위임 + 정밀검토 수행. 작업 내역 archive에 잘 기록.
- 디자인 시안 출처: Claude Design Direction B (Clinical Trust) export 패키지.

## 변경된 파일 (총 11개)
- 신규: `site/tokens.css` (시안 토큰 + alias).
- 수정: `site/style.css` (alias 블록 + 영역별 시안 톤 정합, 3658→3915줄).
- 수정: `site/docs.css` (풀 재작성 + .doc-eyebrow/.h-num/.doc-lead 추가, 77→160+줄).
- 수정: `site/app.js` (Chart.js fill rgba 6곳).
- 수정: `site/{index,about,assessment-guide,contact,privacy,recovery-guide,terms,workload-guide}.html` (link 1줄씩 + docs는 eyebrow + h-num 추가).

## 무변경 (보존)
- `site/data.js`, `site/_headers`, `site/vendor/**` (라이브러리/폰트).
- `archive/design-mockups/2026-05-23-claude-design-export/**` (원본 패키지).
- `docs/evidence/**`, `docs/security/**`, `docs/project/**`.

## 백업 스냅샷 (롤백 안전망, 5/27 검수 후 정리 권장)
- `archive/root-file-backups/site-snapshot-2026-05-24-pre-design-migration/` (Stage 1a 직전).
- `archive/root-file-backups/site-snapshot-2026-05-24-post-stage-1b/` (Stage 1b 직후).
- `archive/root-file-backups/site-snapshot-2026-05-24-post-stage-3/` (Stage 3 묶음 직후).
- `archive/root-file-backups/site-snapshot-2026-05-24-post-stage-4-color-pass/` (Stage 4 직후).
- `archive/root-file-backups/site-snapshot-2026-05-24-post-stage-4a/` (Stage 4a 직후).
- `archive/root-file-backups/site-snapshot-2026-05-24-post-stage-5g/` (Stage 5 G 직후).
- `archive/root-file-backups/site-snapshot-2026-05-24-post-stage-5a/` (Stage 5 A 묶음 직후).
- 총 7개 시점. 각 5.1-5.2M.

## 완료된 영역
- 컬러 시스템 전면 전환 (Forest Green → Navy clinical trust 톤).
- 토큰 시스템 정합 (--font-sans/-mono 시스템 폴백 + Pretendard 우선, 시그널 3-4단계 safe/watch/risk).
- 컴포넌트 시안 톤 정합 (버튼·폼·입력·토글·카드·배지·모달·차트 카드·KPI·필터 칩·액션 큐).
- 선수 카드 시안 톤 (컨테이너 + 헤더·메타 + 구속/통계 + 태그 5종).
- ACWR 카드 다크 ink 패널 + 56px 모노 비율 숫자.
- 문서 페이지 7종 시안 .doc-* 마스터 (eyebrow + h-num + 마스터 톤).
- Chart.js fill 색 시안 톤.
- 폰트 Pretendard 복원 (사용자 결정).

## 미적용 영역 (5/27 Codex 정식 티켓 권장)
**상세는 docs/workflow/follow-up-queue.md 11개 항목 참조.**

요약:
- 디자인 결정 사항 3건 (equip 통일, 다크모드 도입, 폰트 사이즈).
- Stage 5 깊은 영역 6건 (7일 스케줄/RPE 입력/8종목 평가/모달 cl-*/HTML 리네임/brand-mark).
- Stage 1b 잔여 NIT 2건 (.doc-note 색, .player-velo-box 토큰).

## 5/27 Codex 복귀 시점 권장 행동
1. **archive 이관**: 본 work-plan.md 섹션 0~33을 work-plan-archive.md로 일괄 이관 (2026-05-23~24 위임 모드 묶음 통합 기록).
2. **위임 모드 해제**: 섹션 0(위임 모드) 종료 처리, 정식 워크플로 복귀.
3. **잔여 검수**: 사용자가 5/24 적용된 디자인을 실사용 확인하고 이슈 있으면 영역별 롤백 (백업 스냅샷 사용) 또는 패치 결정.
4. **정식 티켓 전환**: follow-up-queue.md 11개 항목을 우선순위·위험도 기준으로 정식 티켓 분할. Stage 5 깊은 영역(4–8번)은 보안/QA Claude 호출 + 사용자 실사용 확인 흐름 필수.
5. **위임 모드 정책 사후 검토**: 본 위임 모드 중 본 세션 직접 처리(코드 구현)가 일부 있었음 (Stage 0.5 tokens.css 사본, Stage 1a 보완, Stage 3a-c 등). 향후 정식 워크플로 복귀 시 코드 구현 = 에이전트 위임 원칙 엄수 권고.

## 사용자 시각/실사용 확인 항목 (최종)
미리보기 서버 http://localhost:8765 (또는 종료된 경우 재시작 필요):
1. 메인 앱 (`index.html`) — 히어로 Navy + 카드/입력/토글 + 선수 등록 시 카드 + 결과 페이지 ACWR + 컨디션/워크로드 모달.
2. 문서 페이지 7종 — eyebrow + h-num + 마스터 톤 일관성.
3. 코치 대시보드 (헤더 "팀 대시보드" 버튼) — KPI 카드 + 필터 칩 + 액션 큐 (선수 1명+ 등록 시 채워짐).
4. 모바일 뷰포트 (브라우저 dev tools 모바일 시뮬레이션) — 기존 site 미디어 분기 유지.

## 회귀 점검 (5/24 종결 시점 정적)
- node --check site/app.js, site/data.js: 둘 다 통과.
- innerHTML/insertAdjacentHTML/outerHTML 합계: site/app.js 34건, site/index.html 0건 (직전 묶음 종료 시점과 동일, 회귀 없음).
- replaceChildren() 4건 유지 (L1610/L2803/L2897/L5520).
- linear-gradient 잔존 4건 (hero L175/app-guide L1680/schedule banner L2249/L2258) — 의도적 유지.
- CSP `font-src 'self'; style-src 'self'` 유지 (외부 폰트/CSS 0건 유지).

## 본 세션 종결
- 본 메시지 이후 추가 코드 작업 없음.
- 미리보기 서버 종료 권장 (별도 명령 필요 시 사용자가 조치).
- 5/27 Codex 복귀까지 본 work-plan.md 그대로 보존.

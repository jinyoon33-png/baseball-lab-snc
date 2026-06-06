# Codex 복귀 인계 프롬프트 — 2026-05-24

> Codex(총괄 PM)가 5/24 위임 모드 종결 시점에 복귀할 때 채팅창에 그대로 붙여넣는 시작 프롬프트.
> 본 프롬프트는 일회용. Codex가 한 번 컨텍스트 잡으면 이후엔 `docs/project/role-prompts.md` §5 표준 프롬프트로 운영.

---

## 프롬프트 본문 (복사 시작 ↓)

너는 Baseball Lab S&C 프로젝트의 총괄 PM/아키텍트/최종 정밀검토 담당 Codex다. 한도 소진으로 잠시 부재했고, 그 사이 사용자 지시로 Claude Code 세션이 너의 자리를 한시 대행하는 위임 모드가 운영됐다. 이 프롬프트는 너의 복귀 첫 입력이다.

### 작업 루트
- /Users/jinyoon/Desktop/Baseball Lab S&C

### 부재 기간 (2026-05-23 ~ 2026-05-24)
- 2026-05-23: 1회 한정 위임으로 Claude Code가 `innerHTML clear sink DOM API 전환` 묶음 정밀검토 대행. 4경로 모두 OK로 종결.
- 2026-05-24: 사용자 지시로 위임 모드 본격 가동. Claude Code 세션이 총괄 자리 한시 대행. 디자인 마이그레이션(`Claude Design Direction B Clinical Trust 시안`) 진행. 약 90% 적용 후 종결. 위임 모드는 본 프롬프트 시점에 해제됨.

### 반드시 먼저 읽을 파일 (순서대로)
1. `docs/workflow/work-plan.md` — 현재 활성 티켓 없음(너의 차기 티켓 작성 대기). 인계 상태·정적 점검·권장 다음 행동 요약.
2. `docs/workflow/work-plan-archive.md` 상단 — 5/24 위임 모드 묶음 요약(변경 11파일·백업 8시점·완료·잔여).
3. `docs/workflow/work-plan-2026-05-24-delegation.md` — 5/24 위임 모드 상세 일지 33섹션. Claude Code가 한 모든 결정·정밀검토·이슈를 보존. **너의 검증 자료**.
4. `docs/workflow/follow-up-queue.md` — 잔여 11개 항목(디자인 결정 3 + Stage 5 깊은 영역 6 + Stage 1b NIT 2).
5. `docs/project/workspace-map.md` — 프로젝트 운영 기준(이전과 동일, 변경 없음).
6. (참고) `archive/design-mockups/2026-05-23-claude-design-export/` — Claude Design Direction B 원본 패키지 + mockups/ 21 PNG + MOCKUPS.md 매핑표. 시안 정체성 검증에 활용.

### 너의 첫 행동 우선순위

**1순위 — 위임 결과 사후 검증 (1~2시간 예상)**
- `docs/workflow/work-plan-2026-05-24-delegation.md`의 각 Stage 종결 보고를 검토:
  - Stage 0~32 단계별 결과·이슈·정밀검토 내용.
  - 본 세션 위임 모드 중 코드 구현 직접 처리 사례(특히 Stage 5 G의 h2 .h-num sed 일괄 처리 35건).
  - 사용자 확인(OK) 받은 시점 (섹션 12·17·23·24·25·26·28·29·30·31).
- 직접 정적 점검 재실행:
  - `node --check site/app.js`, `node --check site/data.js`
  - `rg -c "innerHTML|insertAdjacentHTML|outerHTML" site/app.js site/index.html` (기대값 34·0).
  - `rg -n "replaceChildren\(\)" site/app.js | wc -l` (기대값 4).
  - `cat site/_headers` (CSP `font-src 'self'; style-src 'self'` 유지 확인).
- 사용자에게 5/24 적용된 디자인 실사용 결과 다시 확인 (이슈 있으면 영역별 롤백 결정).
- 위임 모드 중 원칙 위반(코드 구현 = 에이전트 위임 원칙 일부 미준수) 사후 평가.

**2순위 — follow-up-queue.md 11개 항목 정식 티켓 분할**
- 우선순위·위험도 기준으로 활성 티켓 작성 후보 결정:
  - 우선순위 1 (저위험): equip 12색 통일, 다크모드 도입, 본문 폰트 사이즈 재검토 → 사용자 디자인 결정 받아 단순 토큰 매핑.
  - 우선순위 2 (중위험·고영향): 7일 스케줄 `.week-list` 패턴 → JS rendering 함수 안 HTML 템플릿 수정.
  - 우선순위 2 (중위험): RPE `.rpe-bar` 11셀 그리드 → 워크로드 모달 HTML + RPE 핸들러.
  - 우선순위 2 (고위험·고영향): 8종목 평가 `.cl-assess-*` 신규 클래스 → 시안 정의 부재로 보수적 디자인.
  - 우선순위 2 (고위험·고영향): 운동 가이드/대체/앱 가이드 모달 `.cl-*` 신규 클래스 → 시안 정의 부재.
  - 우선순위 3 (가장 위험): HTML 클래스명 풀 리네임 → site/index.html + site/app.js의 selector 수백 곳 동시 수정. **보안/QA Claude 호출 + 사용자 실사용 확인 필수**.

**3순위 — 새 활성 티켓 docs/workflow/work-plan.md에 작성**
- 위 1·2순위 작업이 끝나면 사용자와 합의된 첫 티켓을 `docs/workflow/work-plan.md`에 정식 등록.
- 코드 구현은 Claude Code(별도 세션)가 받아서 진행.

### 수정 허용
- `docs/workflow/work-plan.md`
- `docs/workflow/work-plan-archive.md`
- `docs/workflow/follow-up-queue.md`
- `docs/project/workspace-map.md`
- `docs/project/role-prompts.md`
- (이번 인계 한정) `docs/workflow/work-plan-2026-05-24-delegation.md` — 위임 모드 일지. 보존 후 archive 폴더로 이동 결정 가능.
- (이번 인계 한정) `docs/workflow/codex-handoff-prompt-2026-05-24.md` — 본 프롬프트 파일. 1회 사용 후 archive 폴더로 이동 가능.

### 수정 금지
- 사용자가 명시하지 않은 `site/*`
- `docs/evidence/*`
- `docs/security/*` 보고 파일

### 5/24 위임 모드 변경 파일 (사후 검증 대상)
- 신규: `site/tokens.css` (Clinical Trust 토큰 사본).
- 수정: `site/style.css` (3658→3915줄, alias 블록 + 컴포넌트 시안 톤 정합).
- 수정: `site/docs.css` (77→160+줄, 시안 .doc-* 마스터).
- 수정: `site/app.js` (Chart.js fill rgba 6곳).
- 수정: `site/{index,about,assessment-guide,contact,privacy,recovery-guide,terms,workload-guide}.html` (link 1줄 + docs는 eyebrow + h-num).
- 무변경: `site/data.js`, `site/_headers`, `site/vendor/**`, 다른 모든 영역.

### 백업 스냅샷 (영역별 롤백)
- `archive/root-file-backups/site-snapshot-2026-05-24-pre-design-migration/` (Stage 1a 직전 — 원점 복귀 시점)
- `archive/root-file-backups/site-snapshot-2026-05-24-post-stage-1b/`
- `archive/root-file-backups/site-snapshot-2026-05-24-post-stage-3/`
- `archive/root-file-backups/site-snapshot-2026-05-24-post-stage-4-color-pass/`
- `archive/root-file-backups/site-snapshot-2026-05-24-post-stage-4a/`
- `archive/root-file-backups/site-snapshot-2026-05-24-post-stage-5g/`
- `archive/root-file-backups/site-snapshot-2026-05-24-post-stage-5a/`
- `archive/root-file-backups/site-snapshot-2026-05-24-post-f-bundle/` (5/24 최종)

### 보고 형식
[복귀 검증 보고]
- 위임 모드 일지 검토: 
- 정적 점검 재실행 결과:
- 위임 모드 중 원칙 위반 평가:
- 사용자 추가 확인 필요 항목:
- 결론 (위임 결과 추인 / 부분 롤백 / 전체 롤백):

[잔여 영역 티켓 분할]
- 정식 티켓으로 전환할 항목 (follow-up-queue.md 기준):
- 우선순위:
- 보안/QA Claude 호출 필요 항목:

[차기 활성 티켓]
- 티켓명:
- 사용자 결정 필요 사항:

위 우선순위 1번부터 시작. 검증·평가·결정 결과를 사용자에게 보고하고 사용자 회신을 기다린다.

## 프롬프트 본문 (복사 끝 ↑)

---

## 보조 사용 팁
- 본 프롬프트는 Codex 채팅창에 그대로 붙여넣는다. Codex가 컨텍스트 잡으면 이후엔 `docs/project/role-prompts.md` §5 표준 프롬프트로 운영.
- 사용자가 Codex 응답을 받으면 본 파일을 `archive/workflow/` 또는 유사한 위치로 이동해도 무방 (1회용).
- 본 프롬프트가 너무 길거나 Codex 컨텍스트 한도에 영향이 있으면, "반드시 먼저 읽을 파일" 섹션만 줄여 사용 가능 (Codex가 work-plan.md를 먼저 읽으면 나머지 컨텍스트는 그 안에 있음).

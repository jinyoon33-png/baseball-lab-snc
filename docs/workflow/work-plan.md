1. 요청 요약
- 활성 티켓: `투구수·권장 휴식일 7일 스케줄 배지 설계 1차 — AdSense 승인 전 구현 보류`
- 현재 단계: `[Step 1. 설계 대기 — 투구수·권장 휴식일 7일 스케줄 배지 설계 1차 — AdSense 승인 전 구현 보류]`
- 담당: 코드 담당 Claude 설계 작업. 총괄 Codex 최종 검토.
- 목적: 근거문서 `2026-06-13 — 투구수·권장 휴식일 캘린더 설계 근거 조사 1차` 결과를 바탕으로, 기존 워크로드 입력 투구 수를 활용해 7일 스케줄 카드에 `권장 휴식일 참고` 배지를 표시하는 1차 구현 범위를 설계한다.
- 핵심 방향: MLB Pitch Smart를 기본 기준으로 삼고, Little League는 별도 모드가 아니라 비교 참고 근거로 유지한다. `realAge` 우선, `age` fallback. 위험 판정·부상 예측·투구 금지 단정·ACWR/RPE 기반 자동 휴식일 연장은 금지한다.
- AdSense 승인 전에는 `site/*` 구현·배포를 보류한다. 이번 티켓은 설계 문서화까지만 진행한다.
- 사용자 승인 문구(2026-06-13): 배지는 `권장 휴식 N일`을 기본으로 하고, 보조 설명은 `MLB Pitch Smart 기준을 참고한 휴식일입니다. 실제 소속 리그·대회 규정이 있으면 해당 규정을 우선하세요.`로 고정한다.

2. 대상 파일
- 수정 허용: `docs/workflow/work-plan.md` 결과 기록만.
- 읽기 허용: `site/app.js`, `site/index.html`, `site/style.css`, `site/data.js`, `docs/evidence/evidence-research.md`.
- 수정 금지: `site/*`, `docs/evidence/*`, `docs/security/*`, `site/assets/**`, `site/vendor/**`.

3. 설계 범위
- 현재 저장 구조에서 투구 수 날짜를 어떻게 읽을지 확인한다: `dailyCompletion.pitchCount`, `workloadHistory`, `completionHistory`, `weekStartDate`, `pitchDate`.
- 투수만 대상인지 확인한다: `type` 또는 기존 투수/타자 분기 기준을 근거로, 타자 스윙 수와 투구 수가 같은 필드에 섞이는 위험을 정리한다.
- 나이 기준을 설계한다: `realAge`가 있으면 우선 사용하고, 없으면 `age`를 fallback으로 둔다.
- MLB Pitch Smart 휴식일 표를 앱 내부에 어떤 형태로 둘지 설계한다. 1차는 7~22세 범위만, 범위 밖은 `확인 필요`로 둔다.
- 7일 스케줄 카드 배지 문구와 위치를 설계한다. 예: `권장 휴식 2일`, `소속 리그 규정 확인`, `휴식일 참고`.
- 승인된 사용자 문구를 기준으로 helper tooltip 또는 작은 보조 설명 위치를 설계한다.
- 저장 schema 변경 여부를 판단한다. 1차 권장 방향은 기존 기록을 읽는 read-only 계산이며, 신규 저장 필드 추가는 보류한다.
- 별도 투구수·휴식일 캘린더는 2차 후보로만 남긴다.

4. 정적 확인 명령
- `rg -n "pitchCount|dailyCompletion|workloadHistory|completionHistory|weekStartDate|pitchDate|realAge|age|type" site/app.js site/index.html`
- `rg -n "renderWeeklyCalendar|renderSchedule|week-list|schedule|dailyCompletion|workload" site/app.js`
- `rg -n "투구수|권장 휴식일|Pitch Smart|Little League|realAge|권장 휴식" docs/evidence/evidence-research.md`
- `node --check site/app.js`
- `node --check site/data.js`
- `git diff -- site/app.js site/data.js site/index.html site/style.css site/docs.css site/tokens.css site/assets site/vendor docs/security`
- `git diff -- docs/evidence/evidence-research.md` (참고 전용: 근거문서팀 변경분 확인, 코드 담당 수정 여부와 분리)

5. 완료 조건
- 1차 구현 후보가 `read-only 계산 + 7일 스케줄 카드 배지`인지, 아니면 schema 변경이 필요한지 명확히 결론 낸다.
- 투수/타자 필드 혼용 위험을 설계에 반영한다.
- MLB Pitch Smart 기준표 적용 범위와 범위 밖 문구를 정리한다.
- 사용자 노출 문구는 `권장`, `참고`, `확인`, `소속 리그 규정 우선` 수준으로만 제한한다.
- 다음 구현 티켓의 수정 파일 후보와 금지 파일을 명확히 적는다.
- AdSense 승인 전에는 구현 티켓으로 전환하지 않는다는 보류 조건을 명시한다.

6. 이슈 분류 기준
- BLOCKER: 저장 schema 변경 필요성이 있는데 영향 분석 누락, 투수/타자 pitchCount 혼용 위험 누락.
- MAJOR: 위험 판정·부상 예측·투구 금지 단정 표현 포함, Little League 별도 모드로 범위 확대.
- MINOR: 배지 위치·문구 후보가 불명확, 연령 범위 밖 처리 누락.
- NIT: 용어·띄어쓰기·섹션 번호.

7. Claude 작업 지침
- 이번 티켓은 설계 전용이다. `site/*`는 수정하지 않는다.
- 근거문서 결론을 복사하지 말고, 구현에 필요한 필드·함수·UI 위치만 압축해서 정리한다.
- 완료 보고는 변경 파일, 설계 결론, 실행한 확인 명령, 남은 리스크만 짧게 작성한다.

7-1. AdSense 승인 후 대기 티켓 큐
- A1 `AdSense 승인 후 실제 광고 게재 확인 1차`: 총괄 Codex가 브라우저 실사용 확인을 수행한다. 메인 앱, 공개 가이드, 모바일/데스크톱에서 광고 위치가 앱 조작을 방해하는지 확인한다. `site/*` 수정 없음.
- A2 `자동광고 위치 조정 1차`: A1에서 앱 조작 영역 광고 방해가 확인될 때만 진행한다. AdSense 콘솔에서 메인 앱 인페이지 광고 제외, 가이드 문서 광고 유지, 모바일 전면광고 OFF 유지 여부를 조정한다. 코드 변경 없음.
- A3 `수동 광고 단위 설계/삽입 판단 1차`: 자동광고 품질이 낮거나 위치 제어가 필요할 때만 진행한다. 공개 가이드 문서 본문 중간/하단만 후보로 두고, 선수 등록·평가 저장·워크로드/RPE 입력·백업/복원·운동 대체 주변은 금지한다. `data-ad-slot` 발급 전에는 구현하지 않는다.
- A4 `AdSense 광고 보안·정책 QA 1차`: 보안/QA Claude가 읽기 전용으로 점검한다. 외부 광고 스크립트, CSP, privacy/terms 정합성, 광고 배치 정책, 모바일 레이아웃 회귀를 확인한다.
- A5 `CSP 강화 재검토 1차`: 광고가 안정적으로 노출된 뒤 진행한다. AdSense 동작을 깨지 않는 범위에서 `script-src`, `connect-src`, `frame-src`, `style-src` 축소 가능성을 재검토한다.
- A6 `PWA 홈화면 설치 설계/구현 1차`: 광고 안정화 후 진행한다. manifest, 앱 이름, 아이콘, standalone 표시, 설치 안내를 우선 검토한다. service worker는 AdSense·CSP 영향 검토 후 별도 보류한다.
- A7 `투구수·권장 휴식일 7일 스케줄 배지 구현 1차`: 현재 설계 티켓 완료 후에도 AdSense 승인 및 광고 안정화 전까지 구현하지 않는다. 구현 시 read-only 계산과 `권장 휴식 N일` 배지만 우선한다.

8. 총괄 운영 체계 메모 (Codex 복귀 인수인계)
- Codex 사용 한도 소진 → 총괄 역할을 Claude(Opus 4.8)가 위임 인계.
- 역할 분담(현행 2026-06-07):
  - 총괄 Claude(Opus): 티켓 설계·선정, 하위 에이전트 위임, 증거 검토식 검증, work-plan 관리, 배포 커밋, 의사결정·보고. ※ 사용자 지시("코드 작업은 난이도에 맞는 하위 에이전트, 총괄은 총괄 업무만")로 직접 코드 구현·명령 재실행은 하지 않고 하위 에이전트에 위임. 총괄 검증 = 하위 에이전트 보고 증거(명령 출력·스니펫)를 설계 대비 검토.
  - Sonnet 4.6 하위 에이전트: 코드·콘텐츠 구현 + 자체 정적검증(node --check/rg/git diff) 결과 보고. 커밋·푸시는 안 함.
  - 보안/QA: 사용자가 운용하는 **별도 Claude 터미널**(독립 read-only 검수, memory security-qa-role 형식). 총괄이 §티켓에 점검 항목을 남기면 거기서 독립 점검 → GO/STOP 보고를 work-plan 해당 §에 기입.
  - 사용자: GitHub Desktop Push origin, AdSense 콘솔, 보안 터미널 운용.
- 워크플로우: 총괄 설계(티켓 §기록) → Sonnet 구현 → 총괄 증거검토 GO → 보안 터미널 독립 GO → 총괄 커밋(main) → 사용자 Push → Cloudflare 자동 재배포. (ㄱㄱ=작업 시작 신호, 매번 work-plan 먼저 읽기)
- Codex 복귀 시: **먼저 §22 'Codex 복귀 로드맵'(우선순위 큐) 확인** → 본 메모 + work-plan(§14 백로그, §15~21 티켓 상세) + git 이력으로 그대로 이어받음.
- 직전 완료(2026-06-07~08, 전부 보안 GO): T1 index 가이드 내부링크(§15) / T2 SEO 메타·favicon 13p(§16) / T3 보안 재점검 GO(§17) / T4 sitemap lastmod(§14) / T5 연속기록 streak 배지(§18, 커밋 004f814, 배포·실사용 확인) / T6 streak 결과화면+대시보드 확장(§19, 커밋 e62f158) / T7 대시보드 필터 버그 수정(§20, 커밋 7eee6b2) / T8 백업 리마인더+데스크탑 레이아웃 수정(§21, 커밋 9ad04a2, push·배포·실도메인 정상 작동 확인 완료, 보안 NIT1→§14 LATER a11y).
- 현재 git(2026-06-09): origin/main=ba00f2e(T8 종료정리까지 전부 push·Cloudflare 배포 완료, working tree clean). 본 §22 로드맵 정리 문서 커밋 1건 추가 → push 대기(문서 전용·코드 0).
- 백로그(LATER, §14): PWA 홈화면(manifest=가벼움/지금가능, service worker=무거움/앱출시 시점·AdSense·CSP 검토) / _headers CSP 강화(AdSense 안정화 후) / og:image PNG(에셋 준비 시 13p 일괄) / T8 배너 a11y 미세정리(role="alert"+aria-live="polite" 혼용→택1, 기능·보안 영향 0). 미착수 후보: SEO 콘텐츠 확장. (데이터 안전장치=백업 리마인더는 T8로 완료·배포.) 온보딩은 이미 구현(첫방문 appGuideModal + 헤더 가이드 버튼).
- 외부 대기: AdSense 승인(§9~13). 승인 후 §13 게재 확인.
- 인프라 스냅샷: CSP 정적 fallback(`script-src 'self' 'unsafe-inline' 'unsafe-eval' https:`), nonce 미들웨어 폐기(`4218f3e`). 광고 연결 스크립트 13개 HTML head 삽입 완료, 광고 단위(`ins.adsbygoogle`) 미게재(자동광고/승인 후 단계), ads.txt 게시 완료. 데이터=localStorage 전용(백엔드 없음, 기기/캐시 삭제 시 손실 위험 → 데이터 안전장치 후보 근거). streak는 순수 read-only 계산(getRecordStreak app.js, completionHistory∪workloadHistory 기준).

9. 구현·검증 결과 (Step 2 완료 — 2026-06-07)
- 구현: Sonnet 4.6 하위 에이전트. 검증: 총괄 Claude(Opus) §5 명령 독립 재실행.
- 추가 섹션(파일별 2개, 총 6섹션 연속 01~06):
  - assessment: §02 평가 전 준비와 측정 일관성 / §06 기록 비교로 변화 읽기.
  - recovery: §03 회복 기록을 해석하는 법 / §05 학생선수·동호인 적용 시 주의.
  - workload: §03 입력 예시로 보는 워크로드 계산 / §05 코치·보호자와 함께 보는 법.
- 단어 수: assessment 317→520, recovery 379→600, workload 358→568 (의미 있는 증가).
- `node --check` app.js/data.js 2 PASS.
- `<h2>` 각 6, `h-num` 01~06 연속 정렬 확인.
- 금지 표현: 신규 섹션 0건. 기존 부정형 안전 고지(진단이 아니다/보장하지 않는다/물리치료사 명칭)만 잔존, 정상.
- workload §03에 "위 숫자는 계산 방식을 보여주는 예시일 뿐이며 권장 임계값이 아닙니다" 면책 포함.
- 보존: AdSense script·canonical 각 2건, doc-note/doc-links/doc-meta/meta 유지.
- 수정 금지 경로 diff 0.
- 판정: 완료 조건 전부 충족, 이슈 0건. → 사용자 `Push origin` 대기.

10. 후속 정합 작업 — 약관 광고 고지 + 날짜 (2026-06-07, 총괄 Claude 직접 수행)
- 발견: `terms.html` §06이 "광고 미포함" 미래형 → privacy(능동 고지) 및 실제 광고 연결 상태(스크립트 13개 + ads.txt)와 모순. 사용자 상황: AdSense 신청 후 승인 대기 중.
- 판단: 승인 대기 중일수록 정책 일관성이 재크롤링 심사에 유리 → 즉시 정합 처리.
- 조치: terms §06을 "Google AdSense 광고를 게재합니다" 능동형으로 수정 + privacy 교차 링크 추가, 운영 원칙 도입부 "광고 게재 시" 현재형. 유료기능은 미제공+도입 시 갱신 명시.
- 날짜 정합: terms·assessment·recovery·workload `doc-meta` "2026년 5월"→"6월". privacy 포함 5개 정책/가이드 문서 전부 6월 통일.
- 검증: terms 금지표현 0건, 수정 금지 경로 diff 0, 변경 파일 = terms + 가이드 3종 + work-plan.
- 판정: 약관/방침 광고 고지 정합 완료. 가이드 보강과 함께 1회 Push로 배포 완료(커밋 `ae5ba94`). 공개 도메인 반영 검증 OK.

11. 광고 배치 설계 (2026-06-07, 총괄 Claude) — AdSense 승인 후 구현 대기
- 현재 상태: 자동광고(Auto ads) 모드. 수동 광고 단위(`<ins data-ad-slot>`) 0개. AdSense AI가 위치 자동 결정.
- 문제: 자동광고는 `index.html` 앱 조작 영역(선수 등록 폼·입력 버튼·모달)에 광고를 끼워넣을 수 있어 terms §06 "앱 조작 영역 광고 금지" 원칙과 충돌 + 기능 방해.
- 권장 방식: 자동광고를 앱 페이지에서 제외 + 가이드 문서에 수동 광고 단위 정밀 배치(약관 부합 + 기능 방해 0 + 위치 제어).
- 배치 대상(8개 가이드, 600~783단어/6~7섹션): training-program, fielding-baserunning-agility, rpe, acwr, warmup-shoulder, recovery, workload, assessment.
- 배치 위치:
  - A(최우선·전 가이드 공통): 마지막 섹션 끝 ~ `doc-note` 사이. 콘텐츠 종료 지점, 링크·버튼 방해 0.
  - B(긴 가이드만): 본문 중간(약 §03 뒤). 자연스러운 읽기 흐름.
- 광고 제외(의도적): `index.html` 전체(앱 조작 영역), `privacy`/`terms`/`contact`(정책·연락 페이지, 신뢰·심사 유리), `doc-note` 밀착 배치 금지.
- 구현 전제: AdSense 콘솔에서 광고 단위 생성 → `data-ad-slot` ID 발급 필요. 발급 후 총괄이 `<ins>` 코드 삽입(또는 Sonnet 위임) + 정적 검증.
- 상태: 사용자 검토 완료. 1차로 자동광고 콘솔 설정(§12) 적용함. 수동 단위 정밀화는 승인 후 선택(§13).

12. AdSense 콘솔 자동광고 설정 완료 (2026-06-07, 총괄 Claude — Claude in Chrome 브라우저 조작)
- ※ 코드/사이트 파일 변경 아님. AdSense 콘솔(adsense.google.com)에서 직접 설정한 내역. git에 안 남으므로 본 기록이 유일한 인수인계 근거.
- 사이트 심사 상태: "광고 게재 가능 여부 검토 중"(승인 대기). 프로필·광고설정·사이트연결 단계 완료. ads.txt 게시 완료.
- 자동광고(Auto ads) 설정 조정 결과:
  - 자동광고: ON 유지
  - 오버레이 형식 2/3: 앵커 ON, 사이드 레일 ON, **모바일 전면광고 OFF**(전체화면 덮어 방해 큼).
  - 인페이지 형식 1/3: **배너만 ON**, 멀티플렉스 OFF, 관련검색어 OFF(배너 위주 절제).
  - 의도 기반 형식: 0/1.
  - 제외된 페이지 3건(옵션="이 페이지만"=URL 정확히 일치): `baseballlabsnc.com`(메인 앱), `baseballlabsnc.com/terms`, `baseballlabsnc.com/contact`.
  - `privacy`는 제외 안 함 — 사용자 결정(앵커/배너 노출 허용).
- 적용: "지금 변경사항 적용" 저장 완료(실험 모드 아님). 최대 1시간 내 반영. 단 실제 광고는 승인 후 게재.
- SPA 주의(중요): 선수관리·정밀평가·스케줄·대시보드는 별도 URL이 아니라 전부 `baseballlabsnc.com/`(SPA). AdSense 제외는 URL 기준이라 메인 앱은 루트 1건 제외로 통째 차단됨. 가이드(`/rpe-guide` 등)는 별도 URL이라 광고 유지.
- 결과 페이지별 노출(아래는 제외 해제 전 기준): 메인앱·terms·contact = 광고 0 / 가이드 8종·about = 앵커+사이드레일+배너 / privacy = 앵커+배너.
- ※ 후속 변경(2026-06-07): 사용자가 콘솔 '제외된 페이지'를 직접 해제(메인 앱 포함 광고 허용 방향). 최종 콘솔 상태는 사용자 조작 기준. 미리보기 확인 결과 메인앱(선수등록·정밀평가 결과·스케줄·워크로드 입력 화면)에 앵커+인페이지 배너 2개 노출됨 — 운동 항목/입력 버튼 사이에 배너가 끼어 조작 방해 소지 확인.
- ※ 사용자 방침(2026-06-07): AdSense 승인 완료 후 실제 광고 게재 상태에서 직접 사용해보고 인페이지 배너 방해 여부를 판단하기로 함. 그 전까지 추가 광고 설정 변경 보류. 방해 시 대응안: '제외된 영역'으로 메인앱 인페이지만 제외(앵커만 유지) 또는 §11 수동 단위 전환.

13. 다음 단계 — AdSense 승인 후 (선택지)
- 기본(추천): 승인되면 §12 자동광고 설정대로 자동 게재. **추가 코드·수동 작업 불필요.**
- 옵션(정밀화): 자동광고 위치/개수가 불만이거나 "특정 페이지에 앵커만" 등 정밀 제어를 원하면 → §11 설계대로 수동 광고 단위(`<ins data-ad-slot>`) 삽입.
  - 전제: AdSense 콘솔 "광고 → 광고 단위 기준"에서 디스플레이 광고 단위 생성 → `data-ad-slot` ID 발급.
  - 구현: 총괄이 가이드 HTML 설계 위치(마지막 섹션 끝~doc-note 사이 등)에 `<ins>` 삽입 또는 Sonnet 위임 → 정적 검증 → 커밋/푸시.
  - 주의: 자동광고와 수동 단위 병행 시 페이지당 광고 과밀 주의(권장 3~5개 이내). 수동 전환 시 자동광고 인페이지를 줄이는 것 고려.

14. 후속 티켓 백로그 (2026-06-07, 총괄 Claude)
- T1 [완료]: 공개 메인(index) 가이드 내부 링크 누락 보정 — workload/recovery/assessment 3개 링크를 index 2개 블록에 추가. 검증 OK. (상세 §15)
- T2 [완료]: 전체 SEO/메타 보강 — OG·Twitter·JSON-LD·favicon 13페이지 추가 완료, 검증 OK. og:image는 추후 PNG. 상세 §16.
- T3 [완료·GO]: 보안/QA 재점검 — 결론 GO, 이슈 0(NIT 1: CSP 광범위, 중장기). 상세 §17.
- T4 [완료]: sitemap.xml lastmod 13건 2026-06-07 갱신, XML 유효, loc 13 유지, 금지파일 diff 0.
- T5 [완료·GO·배포]: 연속기록(streak) 배지 — 리텐션. 선수 카드에 "🔥 N일 연속 기록" 배지. 순수 read-only 계산(저장 schema 무변경). 구현+총괄검증+보안 3중 GO. 사용자 Push 완료, 실사용 노출 확인. 상세 §18.
- T6 [완료·GO]: 연속기록(streak) 확장 — 결과화면(s3)+팀 대시보드(s4). resName에 streak 배지 노출 + 대시보드 "오늘 기록 N명" stat-card. read-only. 구현+총괄검증+보안 3중 GO. 배포 커밋(main, Push 대기). 상세 §19.
- T7 [완료·GO]: 팀 대시보드 필터 버그 수정 — 전체/투수/타자/시즌중/비시즌 필터에서도 액션 큐가 조치필요 선수만 표시되던 버그(무조건 needsAction 필터). 필터별 전체 선수 표시 + 동적 제목 + 빈상태 문구 필터인지 + 정상 범위 태그. read-only. 구현+총괄검증+보안 3중 GO. 배포 커밋(main, Push 대기). 상세 §20.
- T8 [완료·GO·배포]: 백업 리마인더(데이터 안전장치) — localStorage 전용 손실 위험 대비 정기 백업 유도. 선수목록 s1 상단 닫기가능 배너 + 마지막백업 14일 경과/이력없음 시 표시 + 3일 snooze. 백업 기능 자체는 기존(downloadBackup). lastBackupAt/snooze localStorage 키 2개 추가(players schema 무변경). 구현 Sonnet 4.6 + 데스크탑 레이아웃 수정 Haiku. 구현+총괄검증+보안 3중 GO + 총괄 정밀 재검증 GO(보안 NIT1=배너 role/aria 혼용→§14 LATER). 커밋 9ad04a2, push·Cloudflare 배포·실도메인 정상 작동 확인 완료(2026-06-08). 상세 §21.
- T9 [완료·GO]: a11y 접근성 폴리시 — 구현 Sonnet(Haiku 2회 시행착오)+총괄 증거검토 GO+보안 독립 GO(이슈 0건). 커밋(main)·Push 대기. 상세 §23. ▸원래범위: ① 백업 배너 role="alert"+aria-live="polite" 혼용→택1(index.html L77, §21 NIT1) ② 모달 닫기 버튼 7개 aria-label="닫기"(index.html L492·551·593·658·682·824·927, 현재 &times; 텍스트만) ③ 헤더/대시보드 아이콘 전용 버튼 2개 aria-label(L47·464, data-lucide users/home) ④ form <label>→for 속성으로 input id 연결(pName 등, 현재 proximity 의존). 순수 markup·사용자 변화 0·기능/보안 영향 0·CSP-safe(inline 없음). 수정 site/index.html만. 권장 Haiku. 효과 S. 지금 가능(외부 의존 0).
- T10 [완료·GO]: SEO 콘텐츠 확장 — 구현 Sonnet+총괄 GO+보안 독립 GO(이슈 0건). about·contact FAQ 5문항씩 + 4페이지 JSON-LD + contact 푸터링크 보강. 커밋(main)·Push 대기. 상세 §24. ▸원래범위: 얇은 페이지(about ~473w/contact ~416w) 콘텐츠 품질·분량 보강 + 정책/소개 페이지(about/contact/privacy/terms) JSON-LD 적용 검토. 오가닉 SEO·AdSense 승인 심사에 도움. 제약: evidence rules 엄수(근거 기반, 금지표현 0: 치료·처방·진단·보장·최적·예방·향상, 안전대안만 참고·확인·권장·"도움이 될 수 있음"). 워크플로우: ㄱㄱ 시 플랜모드 재진입→근거조사→설계→Sonnet 구현→3중 게이트. 효과 M. 지금은 스텁만(착수 아님).
- T11 [CLOSED 2026-06-10]: 빠른 보완 묶음 — ① 404.html 신설(브랜드 404, noindex, AdSense 스크립트 제외) ② 모달 ESC 닫기+포커스 관리(공용 openModal/closeModal L764~ 활용, ESC=취소 경로만) ③ theme-color(#0b1220)+apple-touch-icon PNG 전 페이지. 커밋 ae278e5. 3중 게이트 GO(NIT1 커밋 전 정리)+Push+실사용 확인 완료. 상세 §25.
- T12 [CLOSED 2026-06-10]: 선수 목록 검색·정렬 — s1 목록에 이름 실시간 검색 + 정렬(등록순/이름순). 표시용 사본만 필터·정렬(players 원본·schema 무수정). 커밋 715a190. 3중 게이트 GO(이슈 0)+Push+실사용 확인 완료. 상세 §26.
- T13 [CLOSED 2026-06-10]: 팀 대시보드 ACWR 분포 차트 — Chart.js scatter, X=만성/Y=급성, calculateACWRMetrics 재사용, 표시 전용. 커밋 f187ef1. 3중 게이트 GO(이슈 0)+Push+실사용 확인 완료. 상세 §28.
- T14 [CLOSED 2026-06-11]: 팀 평균 피지컬 레이더 — 공통 7항목+포지션 겸용 8번축(풀업=투수/사이드 점프=타자), 투수/타자 평균 2 dataset(블루/앰버). 커밋 16b1652+보완 548f31a(색상)·3f68141(8축). 3중 게이트 GO+Push+실사용 확인 완료. 상세 §29.
- T15 [보류·대형]: 코칭 메모(태그·타임라인) — pLDB_v4_5 스키마 변경 필요(마이그레이션·백업/복원 호환·XSS·용량). C1(CRUD+고정태그+타임라인)→C2(태그 필터) 분할, C3(메모→스케줄 자동개입)은 기각. 착수 전 총괄 정식 재설계 필수. 상세 §27.
- T16 [CLOSED 2026-06-11]: og:image 제작·적용 — 1200×630 브랜드 PNG 자체 제작 + 13페이지 og:image/twitter:image 메타, twitter:card→summary_large_image. 커밋 2d50ce1 + 로고 lockup 교체 4ff82bd(사용자 피드백). 3중 게이트 GO+Push+실사용 확인(카톡 미리보기 정상). 로드맵 ④ 해소. 상세 §30.
- LATER(리텐션 후속): PWA 홈화면 설치(manifest.json=가벼움/지금 가능, service worker=무거움/AdSense·CSP 검토 필요·"앱 출시" 시점). 사용자 결정으로 추후 앱 출시 시 진행. 온보딩은 이미 구현됨(첫방문 appGuideModal 자동 + 헤더 가이드 버튼)이라 별도 작업 불요.
- 중장기(LATER): _headers CSP 강화 — 'unsafe-inline'/'unsafe-eval' 축소(nonce 등). 자동광고 요건과 트레이드오프. AdSense 안정화 후 검토.
- 별도 대기(외부): AdSense 승인 → 승인 후 실광고 판단(§13).

15. T1 티켓 상세 — 공개 메인 가이드 내부 링크 누락 보정 1차
- 대상(수정 허용): `site/index.html`, `docs/workflow/work-plan.md`.
- 수정 금지: `site/app.js`, `site/data.js`, `site/*.css`, 가이드/정책 HTML, `site/_headers`, `site/ads.txt`, `site/assets/**`, `site/vendor/**`, `docs/evidence/**`, `docs/security/**`.
- 작업: index.html 가이드 링크 2개 블록에 누락된 3개 링크 추가.
  - 블록A: `.policy-links` (데이터 초기화 영역 하단, 들여쓰기 24칸).
  - 블록B: `.policy-links--in-modal` (가이드 모달 하단, 들여쓰기 16칸).
- 추가 링크 3개(각 `<a href target=_blank rel=noopener noreferrer>제목</a>` + `<span class="policy-sep">·</span>`):
  - `/workload-guide` → "워크로드/ACWR 가이드"
  - `/recovery-guide` → "회복 기록 가이드"
  - `/assessment-guide` → "정밀평가 활용법"
- 삽입 위치: 두 블록 모두 `acwr-guide` 링크 뒤에 위 3개를 순서대로 삽입(주제 흐름: RPE→ACWR→워크로드→회복→정밀평가→훈련프로그램).
- 검증: `node --check app.js/data.js`, `rg -c`로 각 3개 링크 index.html 2건씩 확인, 금지 파일 diff 0.
- 구현: Sonnet 4.6 하위 에이전트 / 검증: 총괄 Claude.
- 결과(완료 2026-06-07): Sonnet 구현 → 총괄 §검증 재실행. 두 블록(.policy-links, .policy-links--in-modal) 모두 `acwr-guide` 뒤에 workload→recovery→assessment 삽입(각 2건), 기존 6개 링크 유지, `node --check` OK, 금지 파일 diff 0. 변경 파일: site/index.html. 최종 순서: about→rpe→acwr→workload→recovery→assessment→training→warmup→fielding→contact.

16. T2 티켓 상세 — 전체 SEO/메타 보강
- 대상(수정 허용): site/index.html, about/contact/privacy/terms.html, 가이드 9종 html, 신규 site/favicon.svg, docs/workflow/work-plan.md.
- 수정 금지: app.js, data.js, *.css, _headers, ads.txt, sitemap.xml, robots.txt, vendor/**, evidence/**, security/**, 기존 title/description 텍스트(아래 3개 축약 외).
- 작업: ① favicon.svg 생성 + 전 14페이지 head에 favicon link. ② 전 14페이지에 OG 6개+Twitter 3개(값은 각 파일 기존 title/description/canonical 재사용; og:type=website[index·about·contact·privacy·terms]/article[가이드 9], og:site_name="Baseball Lab S&C", og:locale="ko_KR", twitter:card=summary). ③ JSON-LD: index=WebSite+Organization, 가이드 9=Article, 정책·about·contact=생략. ④ description 3개 축약(~150자, 금지어 없이): index, rpe-guide, warmup-shoulder-guide.
- og:image: 이번 제외(추후 PNG 1200x630 준비 시 og:image+twitter:image 일괄 추가).
- 검증: node --check, 전 페이지 og:title·twitter:card 존재, favicon link 13, JSON-LD(index 2종/가이드 Article), 금지 표현 0, 금지 파일 diff 0.
- 결과(완료 2026-06-07): Sonnet 구현 → 총괄 검증. favicon.svg(305B, 야구공 솔기) 생성. 13페이지 전부 og:title·twitter:card·favicon link 각 1건. JSON-LD = index(WebSite+Organization @graph) + 가이드 8 Article = 9개 파일, 전부 JSON 파싱 유효. 금지 표현 0, 금지 파일 diff 0. description은 실제 ~72자(앞선 205는 UTF-8 바이트 오측)로 적정 → 축약 불필요. og:image/twitter:image는 미적용(추후 PNG 1200x630 준비 시 일괄). 변경: site/favicon.svg(신규) + 13개 HTML.

17. T3 티켓 — 보안/QA 재점검 (담당: 보안/QA 정밀점검 담당 / 독립 검수)
- 권장 모델: **Sonnet 4.6**. 근거: 이번 세션 변경은 정적 HTML(메타·내부링크·콘텐츠)로 사용자 입력이 닿지 않는 저위험. 체크리스트 정적 점검(rg/node + 패턴 확인)으로 충분. → 향후 광고 단위 `<ins>` 실삽입·CSP(`_headers`) 변경 티켓의 보안 점검은 **Opus 권장**(실제 스크립트·보안 경계 변경, 정밀 추론 필요).
- 권한(메모리 security-qa-role 준수): 읽기/조회만. 코드·문서·git 수정 금지. 보고서만 작성. 다음 티켓은 총괄이 결정.
- 점검 대상: 이번 세션 커밋 범위 — 가이드 3종 보강, 약관 광고고지 정합, T1 내부링크(index), T2 OG/Twitter/JSON-LD/favicon(13p+favicon.svg). 커밋 a14b46b~06aef60.
- 집중 점검:
  1. JSON-LD/OG/Twitter 메타: 사용자 데이터 직접 삽입 없는 정적값인지, JSON 유효성, 금지 표현 0.
  2. favicon.svg: `<script>`·외부 참조·이벤트 핸들러 없는 순수 정적 SVG인지(SVG XSS 경로 점검).
  3. T1 신규 링크: `target="_blank"` + `rel="noopener noreferrer"` 일관성.
  4. 자동광고 연결 후 CSP(`_headers`): 광고 도메인 허용이 과도/와일드카드 남용 아닌지(자동광고는 콘솔 설정이라 코드 무변경이어야 함 — diff 0 확인).
  5. inline handler(onclick/oninput/onchange) 재도입 0, 계산/저장 schema·localStorage 경로 무변경.
- 검증 명령: 메모리 기본 명령 + `node --check`, `rg -n "og:|twitter:|application/ld\\+json|canonical|adsbygoogle"`, `rg -n "<script" site/favicon.svg`, `git diff -- site/_headers site/app.js site/data.js site/*.css`.
- 보고 형식: 메모리 정의(BLOCKER/MAJOR/MINOR/NIT + [근거] 파일:라인 인용 + [결론] GO/조건부GO/STOP).
- 결과(2026-06-07, 보안/QA 담당 Sonnet 4.6): **결론 GO**. BLOCKER/MAJOR/MINOR 0. NIT 1 — _headers CSP `unsafe-inline`/`unsafe-eval` https: 광범위 허용(기존 정책·자동광고 불가피·이번 변경 아님, 중장기 개선 여지). 근거: JSON-LD 9개 유효, favicon.svg 순수 정적(script/on*/use/image 0), T1 링크 rel=noopener+target=_blank 6건, _headers·app.js·data.js diff 0, inline handler 0, 금지표현 신규 0, og:image 의도적 0. → 총괄 수용: NIT는 §14 중장기(LATER)로 이관, 즉시 조치 불필요.

18. T5 티켓 상세 — 연속기록(streak) 배지 (리텐션, 2026-06-07 설계: 총괄 Claude)
- 배경: 리텐션 분석 결과, 기능은 충실하나 "재방문 동기" 부재. 사용자 선택 = 연속기록(streak). 온보딩은 이미 구현(첫방문 appGuideModal 자동 L536 + 헤더 data-header-action=guide → openGuideModal L1644)이라 이번 범위 제외(사용자 "연속기록만" 확정).
- 정의: 선수별 "기록한 날"의 연속 일수. 기록일 = 그날 completionHistory(날짜키 객체, L4995~) 또는 workloadHistory(배열 [{date,...}], L4999~)에 항목 존재. ※ wellness는 오늘 1건만 덮어쓰는 단일 객체(이력 없음, saveWellness L3022~)라 기준 제외 — 확인 완료.
- 계산(순수 read-only, 저장 schema·localStorage 무변경 → 데이터 손상 위험 0):
  - 활동 날짜 Set = Object.keys(completionHistory) ∪ workloadHistory[].date.
  - 기준일: 오늘(getTodayStr) 기록 있으면 오늘부터, 없으면 어제부터 역방향. 어제도 없으면 0.
  - while(Set.has(커서날짜)) count++; 커서 하루 감소. 기존 헬퍼 getTodayStr/getLocalDateStr/parseLocalDate 재사용.
  - 경계: 0건=0, 오늘만=1, 오늘+어제=2, 중간 끊김=끊긴 지점까지, 오늘 미기록+어제까지 연속=연속 유지(동기 부여).
- 표시: 선수 카드 헤더 player-row-info(L2344~2348, 접힌 카드에서도 보임) season 태그 뒤에 `<span class="player-streak-badge"><i data-lucide="flame"></i>N일</span>`. N≥2일 때만 노출(1 이하 노이즈). 숫자만 삽입 → XSS 안전(사용자 데이터 직접 삽입 없음). lucide.createIcons는 renderPlayerList 말미(L2371)에서 이미 호출.
- 수정 파일: site/app.js(getRecordStreak 함수 추가 + renderPlayerList 헤더 배지 주입), site/style.css(.player-streak-badge 스타일, amber/flame 톤·기존 player-*-badge 패턴 일치). work-plan은 총괄이 기록(Sonnet 미수정).
- 수정 금지: site/data.js, site/index.html, site/tokens.css, site/docs.css, site/_headers, site/ads.txt, site/sitemap.xml, site/robots.txt, 기타 가이드/정책 HTML, site/vendor/**, docs/evidence/**, docs/security/**.
- 표현: "N일 연속 기록"만. 금지표현(향상·예방·보장·최적·진단·처방) 0. inline onclick 금지(CSP) — 배지는 표시 전용(클릭 동작 없음).
- 검증(총괄 재실행): node --check app.js·data.js / rg "getRecordStreak|player-streak-badge" / streak 경계 로직 검토 / 금지표현 0 / git diff --stat = app.js+style.css만(+work-plan 총괄). 
- 구현: Sonnet 4.6 하위 에이전트 / 검증: 총괄 Claude(Opus) / 보안/QA: 별도 담당(read-only 계산 위주 저위험 → Sonnet 4.6 권장).
- 결과(구현 Sonnet 4.6 → 총괄 Opus 독립 검증, 2026-06-07): **총괄 검증 GO**. getRecordStreak(app.js L5002~5037) 순수 read-only(players 무수정), 헬퍼 getTodayStr/parseLocalDate/getLocalDateStr 재사용, 경계(0/1/2/중간끊김/오늘미기록+어제연속유지) 로직 정확. 배지 주입 renderPlayerList player-row-info season-tag 뒤(app.js L2350), N≥2만 노출, 숫자만 삽입(XSS 안전). .player-streak-badge(style.css L2676~2694) var(--warning)#d97706+var(--warning-light)#fef3c7(토큰 실재 L50-51). node --check app.js/data.js 2 PASS. 신규 금지표현 0(기존 목표라벨 "구속 향상" 등은 무관 잔존). inline handler 0(표시 전용). git diff --stat = site/app.js+site/style.css+work-plan(총괄)만, 금지파일 0. → 다음: 보안/QA 별도 담당 점검 후 사용자 Push origin.
- 보안/QA 결과(2026-06-07, 보안담당 Sonnet 4.6): **GO**. BLOCKER/MAJOR/MINOR/NIT 0건. 실행: node --check(2 PASS) / rg getRecordStreak·player-streak-badge(app.js L2225~2226·L5002~5037, style.css L2676·L2689) / git diff --stat(app.js+style.css+work-plan 3파일만, 금지파일 0) / inline handler 0 / 금지표현 신규 0. XSS 확인: streak은 count++(순수 숫자), 사용자 데이터 비삽입. 경계 로직 독립 확인: 오늘기록=오늘부터, 미기록=어제부터(없으면 0), while(Set.has) 정확, 오늘미기록+어제연속=유지. → 사용자 Push origin 가능.
- 배포(2026-06-07): T5 변경(site/app.js + site/style.css + work-plan) main 커밋(004f814). 직전 origin = 8aebe6e. 사용자 GitHub Desktop Push origin 완료 → Cloudflare 재배포 → **공개 도메인 실사용 노출 확인(배지 정상)**.

19. T6 티켓 상세 — 연속기록(streak) 확장 (리텐션, 2026-06-07 설계: 총괄 Claude)
- 배경: T5로 선수 목록 카드에 streak 배지 도입·실사용 확인. 노출 확장 선택(사용자 "연속기록 확장" 확정). getRecordStreak(app.js L5002~)는 T5에서 추가됨, 재사용.
- 범위 A — 선수 결과화면(s3): renderResult(app.js L3163~)에서 resName에 streak 배지 노출.
  - 현재 `document.getElementById('resName').innerText = \`${escapeHTML(p.name)} 선수 리포트\`;`. → innerText를 innerHTML로 변경(이름 escapeHTML 이미 적용 = 안전) 후 getRecordStreak(p)≥2면 뒤에 `<span class="player-streak-badge"><i data-lucide="flame"></i>N일</span>` 추가. lucide.createIcons는 renderResult 말미(L3178)에서 호출됨. index.html 미변경(정적 요소 추가 없이 innerHTML 주입).
- 범위 B — 팀 대시보드(s4): renderTeamDashboard(app.js L3890~) 전역 통계 섹션(stat-section-global, "전체 선수"/"평가 완료" stat-card 옆)에 "오늘 기록" stat-card 1개 추가.
  - 값 = 오늘(getTodayStr) completion 또는 workload 기록한 선수 수. 계산: `players.filter(p => getCompletionEntryByDate(p, todayStr) || getWorkloadEntryByDate(p, todayStr)).length` (기존 헬퍼 L4995/L4999 재사용, todayStr는 함수 내 기존 변수 재사용). 표기 "N". 값은 escapeHTML(String(count)) 적용(기존 stat-card 패턴 일치). count>0이면 success 톤 클래스 부여 가능(기존 danger/warning 패턴처럼, 없으면 무톤).
- 안전: 전부 read-only 계산(players·localStorage·저장 schema 무변경). 삽입 값 = 정수(escapeHTML) + escapeHTML 적용 이름만 → XSS 안전. inline handler 신규 0.
- 수정 파일: site/app.js(renderResult 배지 주입 + renderTeamDashboard 통계 카드). site/style.css는 .player-streak-badge(T5) 재사용으로 원칙상 불요 — 결과 헤더에서 크기/정렬 조정 필요할 때만 소폭 추가 허용.
- 수정 금지: site/index.html, site/data.js, site/tokens.css, site/docs.css, site/_headers, site/ads.txt, site/sitemap.xml, site/robots.txt, 가이드/정책 HTML, site/vendor/**, docs/evidence/**, docs/security/**.
- 표현: "N일"·"오늘 기록"만. 금지표현(향상·예방·보장·최적·진단·처방) 0.
- 검증: node --check app.js/data.js / rg getRecordStreak(결과화면 주입 확인) / rg "오늘 기록"(stat-card 존재) / 금지표현 0 / git diff --stat = site/app.js(+style.css 선택)만, 금지파일 0.
- 구현: Sonnet 4.6 하위 에이전트 / 검증: 총괄 Claude(증거 검토) + 보안담당 터미널(독립 재점검) / 사용자 Push origin.
- 결과(구현 Sonnet 4.6 → 총괄 Opus 증거 검토, 2026-06-07): **총괄 검증 GO(증거 검토)**. A) renderResult resName innerText→innerHTML, escapeHTML(p.name) 유지, 배지=정수 _resStreak만(L3165~3167). B) renderTeamDashboard recordedTodayCount=players.filter(getCompletionEntryByDate‖getWorkloadEntryByDate)(L3916), escapeHTML(String) 적용(L3937), 전역 통계 "오늘 기록" stat-card(L3958). .stat-card.success 미존재 확인→임의 CSS 신설 안 함(plain stat-card), style.css 무수정. node --check 2 PASS(Sonnet 보고), git diff = site/app.js만(+work-plan 총괄), 금지파일 0, inline handler 0, 금지표현 0. → 다음: 보안담당 터미널 독립 재점검 후 총괄 커밋 + 사용자 Push.
- 보안/QA 결과(2026-06-07, 보안담당 Sonnet 4.6): **GO**. BLOCKER/MAJOR/MINOR/NIT 0건. 실행: node --check(2 PASS) / git diff --stat(app.js+work-plan 2파일만, style.css·금지파일 0) / inline handler 0 / 금지표현 신규 0. XSS 독립 확인: A) resName innerHTML 삽입값 = escapeHTML(p.name)+"선수 리포트"+배지. 배지 내 삽입값=_resStreak(순수 정수), 사용자 데이터 직접 삽입 없음. B) safeRecordedTodayCount=escapeHTML(String(정수)), XSS 안전. read-only 확인: players·localStorage·저장schema 수정 없음(filter 조회만). getRecordStreak·getCompletionEntryByDate·getWorkloadEntryByDate 기존 헬퍼 재사용. stat-card plain(CSS 신설 없음). → 커밋 + 사용자 Push origin 가능.
- 배포(2026-06-07): T6 변경(site/app.js + work-plan) main 커밋(f10402e→amend e62f158). 직전 origin = 004f814(T5). 사용자 GitHub Desktop Push origin 후 Cloudflare 재배포 → 공개 도메인 반영.

20. T7 티켓 상세 — 팀 대시보드 필터 버그 수정 (2026-06-07 설계: 총괄 Claude, 사용자 실사용 버그 제보)
- 제보: 팀 대시보드에서 전체/투수/타자/시즌중/비시즌 필터를 골라도 "조치 필요" 선수만 표시됨. 기대 = 해당 필터의 관리중 선수 전원 표시.
- 원인: renderTeamDashboard(app.js)의 액션 큐가 `filtered`(getFilteredPlayers 결과) 위에 무조건 `.filter(({ risk }) => risk.needsAction)`(약 L3986)를 한 번 더 적용. getFilteredPlayers는 필터별 올바른 집합 반환(정상)이나, 이 재필터로 인해 어떤 필터든 needsAction만 남음. T6 이전부터 존재한 로직(T6 무관).
- 설계(전부 renderTeamDashboard 내, read-only, app.js만):
  1. 핵심: 무조건 needsAction 재필터 제거. queueItems = filtered.map(p=>({p,risk:getPlayerRiskInfo(p)})).sort(priority desc). '조치 필요' 필터는 getFilteredPlayers가 이미 needsAction만 반환하므로 동작 유지. 그 외 필터는 전원 표시(조치필요가 priority로 상단 정렬).
  2. 동적 제목: index.html 고정 `.action-queue-heading`("오늘 액션 큐 (집중 관리 대상)", L468)을 querySelector로 갱신. filter='조치 필요' → `<i data-lucide="alert-triangle" class="ui-icon-16 text-danger"></i>오늘 액션 큐 (집중 관리 대상)`. 그 외 → `<i data-lucide="users" class="ui-icon-16"></i>{escapeHTML(filter)} 선수 ({filteredCount}명)`. index.html 미변경.
  3. 빈 상태 문구 필터인지: filter='조치 필요' & 0 → 기존("현재 조치가 필요한 선수가 없습니다 / 모든 선수가 정상 범위 내에 있습니다"). 그 외 & 0 → "표시할 선수가 없습니다 / 이 조건에 해당하는 선수가 없습니다".
  4. 정상 카드 태그: reasons 비면 `<span class="aq-tag aq-info">정상 범위</span>`(기존 클래스 재사용, 신규 CSS 0). 카드가 비어 보이지 않게.
  5. lucide.createIcons(): 동적 제목 아이콘 렌더 위해 renderTeamDashboard 말미에 1회 호출 추가(현재 queue else 분기엔 없음, 빈상태 분기에만 있음).
- 안전: read-only(players·localStorage·저장schema 무변경). 동적 제목 삽입값 = escapeHTML(filter)+정수만 → XSS 안전. inline handler 0. 신규 CSS 0, index.html 변경 0.
- 수정 파일: site/app.js만. 수정 금지: site/index.html, site/data.js, *.css, _headers, ads.txt, sitemap.xml, robots.txt, 가이드/정책 HTML, vendor/**, docs/evidence|security/**.
- 표현: 금지표현(향상·예방·보장·최적·진단·처방) 0.
- 검증: node --check app.js/data.js / 동적 제목·필터별 전체 표시 로직 / 금지표현 0 / git diff = site/app.js만.
- 구현: Sonnet 4.6 / 검증: 총괄(증거 검토) + 보안담당 터미널(독립) / 사용자 Push.
- 결과(구현 Sonnet 4.6 → 총괄 Opus 증거 검토, 2026-06-07): **총괄 검증 GO(증거 검토)**. 1) queueItems에서 `.filter(({risk})=>risk.needsAction)` 1줄 삭제(L4001~4003), priority desc 정렬 유지 → 버그 제거. 2) 동적 제목 querySelector('.action-queue-heading')(L3992~3999), 삽입값=escapeHTML(filter)+filteredCount만. 3) 빈상태 필터 분기(L4005~4019): 조치필요=기존문구 / 그외="표시할 선수가 없습니다·이 조건에 해당하는 선수가 없습니다". 4) reasonsHtml 빈 경우 `<span class="aq-tag aq-info">정상 범위</span>`(L4029~4031, 기존 클래스). 5) 함수 말미 lucide.createIcons()(L4054). node --check 2 PASS, git diff=site/app.js만(+work-plan 총괄), index.html·CSS·금지파일 0, inline handler 0, 금지표현 0, read-only(getFilteredPlayers/getPlayerRiskInfo 조회만). → 다음: 보안담당 터미널 독립 재점검 후 총괄 커밋 + 사용자 Push.
- 보안/QA 결과(2026-06-07, 보안담당 Sonnet 4.6): **GO**. BLOCKER/MAJOR/MINOR 0건. NIT 1 — empty-state 경로에서 lucide.createIcons() 2회 호출(기존 empty-state 내 1회 + 함수 말미 신규 1회). 기능 영향 없음(idempotent), 리팩터링 불필요. 실행: node --check(2 PASS) / git diff --stat(app.js+work-plan 2파일만, CSS·금지파일 0) / inline handler 0 / 금지표현 신규 0. XSS 독립 확인: 동적 제목 삽입값=escapeHTML(currentDashboardFilter)+filteredCount(정수), 사용자 자유입력 경로 없음. read-only 확인: needsAction 재필터 삭제(filter→map+sort), getFilteredPlayers/getPlayerRiskInfo 조회만, players·localStorage 무수정. → 커밋 + 사용자 Push origin 가능.
- 배포(2026-06-07): T7 변경(site/app.js + work-plan) main 커밋(f571349). 직전 origin = e62f158(T6, push 완료). 사용자 GitHub Desktop Push origin 후 Cloudflare 재배포 → 공개 도메인 반영.

21. T8 티켓 상세 — 백업 리마인더 (데이터 안전장치, 2026-06-08 설계: 총괄 Claude Opus)
- 배경: 데이터=localStorage 전용(백엔드 없음) → 기기 교체·브라우저 캐시 삭제 시 선수 데이터 전손 위험. 백업 기능(다운로드/복원/오래된기록 정리/전체초기화 + 3MB/4MB 저장공간 경고)은 이미 구현됨(downloadBackup L6472, renderBackupStorageStatus L628, backupSection index.html L295). **빠진 조각 = 정기 백업 유도(리마인더)**. 사용자가 '데이터 관리' 섹션을 직접 안 열면 백업 계기가 없음. 리텐션 겸 데이터 안전장치.
- 현재 부재 확인: `rg lastBackupAt|backupReminder` → 0건. 마지막 백업 시각 추적·리마인더 전무.
- 사용자 결정(2026-06-08): ① 노출 = 선수목록(s1) 상단 **닫기 가능 배너** ② 권장 주기 = **14일**.
- 설계(read 외 schema 무변경, players 데이터 불변):
  1. 저장(players와 분리, 백업 payload 영향 0): localStorage 키 2개 신규 — `pLDB_lastBackupAt`(ISO, 백업 다운로드/복원 성공 시 기록), `pLDB_backupReminderSnoozeUntil`(ISO, 배너 '나중에'/닫기 시 now+3일). ※ buildBackupPayload/restore 검증(_isValidEnvelope, storageKey 'pLDB_v4_5')과 무관 — 별도 키라 백업/복원 정합 영향 0.
  2. 표시 조건 shouldShowBackupReminder(): players.length>=1 AND (lastBackupAt 없음 OR now-lastBackupAt >= 14일) AND (snoozeUntil 없음 OR now>=snoozeUntil). 첫 방문(선수0)엔 미표시 → appGuideModal 온보딩과 충돌 0.
  3. 배너 DOM(index.html, #s1 > .s1-layout 최상단, 신규 선수 등록 카드 앞): `<div id="backupReminderBanner" class="backup-reminder-banner is-hidden">` 기본 숨김, JS로 show/hide. 구성 = 아이콘(shield/alert-triangle) + 메시지 + [지금 백업][나중에] 버튼 + 닫기 X. inline onclick 금지 → data-* + addEventListener(기존 패턴). '지금 백업'은 기존 data-backup-action="download" 재사용 가능, 닫기/나중에는 신규 data-action.
  4. 메시지 2종(정적 + N만 삽입): 백업 이력 0 → "아직 데이터를 백업한 적이 없습니다. 기기 변경이나 브라우저 정리 시 기록이 사라질 수 있어 백업을 권장합니다." / 14일+ 경과 → "마지막 백업 후 N일이 지났습니다. 데이터 보호를 위해 백업 다운로드를 권장합니다."
  5. 버튼 동작: 지금 백업 → downloadBackup() 후 markBackupDone()(lastBackupAt=now) → 배너 숨김. 나중에/닫기 → snoozeUntil=now+3일 → 배너 숨김.
  6. 통합 지점: downloadBackup() 성공부(L6500 부근) + restore 성공부(복원=백업파일 보유 시점)에서 markBackupDone() 호출. s1 렌더/진입 시(renderPlayerList 또는 화면 전환 함수)에서 renderBackupReminder() 호출 → 조건 평가 후 배너 갱신/표시/숨김 + lucide.createIcons().
  7. CSS(style.css): .backup-reminder-banner — 기존 토큰 재사용(info/--warning 계열, 경고 톤). 닫기 X·버튼 레이아웃. .is-hidden 기존 패턴 확인 후 재사용(없으면 display:none 클래스 추가).
- 안전/표현: 금지표현 0(향상·예방·보장·최적·진단·처방·치료 금지. "권장"·"보호"·"사라질 수 있음"은 허용 — "완벽 보호"·"손실 방지 보장" 같은 보장형은 금지). XSS: 메시지 정적 문자열 + 일수(정수)만, 사용자 자유입력 삽입 경로 0. read 외 schema: players(pLDB_v4_5) 무수정, 신규 키 2개만. 비침입: dismissible + 3일 snooze, 선수1명+ 조건. AdSense 자동광고와 별개(앱 콘텐츠 영역).
- 적정 모델: Sonnet 4.6(중간 난이도 — 신규 함수 3~4개 + DOM 배너 + CSS, 기존 백업/이벤트위임/배지 패턴 재사용 多).
- 수정 파일: site/app.js, site/index.html, site/style.css (+ docs/workflow/work-plan.md = 총괄 기록). 수정 금지: site/data.js, site/_headers, site/ads.txt, sitemap.xml, robots.txt, 가이드/정책 HTML, site/assets|vendor/**, docs/evidence|security/**.
- 검증(하위 에이전트 자체 실행 + 증거 보고): `node --check site/app.js`, `node --check site/data.js`, `rg -n "치료|처방|진단|보장|최적|부상 예방|성과 향상" site/app.js site/index.html`(신규 0), `rg -n "lastBackupAt|backupReminder|backup-reminder" site/app.js site/index.html`(추가 확인), `rg -n "onclick" site/index.html`(배너부 0), `git diff --stat`(= app.js + index.html + style.css + work-plan만).
- 완료 조건: 조건부 배너 정상(선수0=미표시, 백업이력0=표시, 14일경과=표시, snooze중=미표시, 백업직후=숨김). markBackupDone이 다운로드·복원 양쪽 연결. 금지표현 0, inline handler 0, players schema 무변경, 수정 금지 경로 diff 0.
- 워크플로우: 총괄 설계(본 §21) → Sonnet 구현 → 총괄 증거검토 GO → 보안담당 터미널 독립 GO → 총괄 커밋 → 사용자 Push.
- 구현(Sonnet 4.6, 2026-06-08): 신규 함수 6개 — shouldShowBackupReminder()(3-AND 조건), markBackupDone()(lastBackupAt=now 후 재렌더), renderBackupReminder()(조건 평가→메시지 채움/표시·숨김+lucide), _snoozeBackupReminder()(now+3일), _handleBackupReminderClick()(data-backup-reminder-action 위임: backup-now→downloadBackup, snooze→snooze), _bindBackupReminderClickHandler()(중복제거 후 바인딩). 통합: downloadBackup 성공부 markBackupDone, finalizeRestorePlayers 성공부 markBackupDone, renderPlayerList 양분기(empty L2213/정상 말미 L2377) renderBackupReminder, window.onload 바인딩. 배너 DOM index.html #s1>.s1-layout 최상단(role=alert/aria-live). CSS .backup-reminder-banner(--warning 계열 토큰, .is-hidden display:none).
- 총괄 증거검토 GO(2026-06-08, Opus 직접 코드 재확인): ① shouldShowBackupReminder 3-AND(players≥1 AND lastBackup없음·14일경과 AND snooze만료) 정확 ② renderBackupReminder 메시지=textContent+경과일수(정수)만 → XSS 안전 ③ backup-now 핸들러는 downloadBackup()만 호출, markBackupDone은 downloadBackup 내부에서 1회 → 중복 호출 없음 ④ renderPlayerList 양분기 모두 호출(빠지는 경로 0) ⑤ _safeLocalStorageGet/Set 안전 래퍼 사용 ⑥ players(pLDB_v4_5) 무수정, 신규키 2개만.
- 데스크탑 레이아웃 버그 발견·수정(사용자 실사용 제보, Haiku 구현): 증상=데스크탑 전체화면에서 신규선수등록/선수목록 위치 어긋남. 원인=.s1-layout이 @media(min-width:1280px)에서 2열 grid(minmax 320px·1.2fr)인데 배너가 첫 grid item으로 1칸 차지→등록폼 둘째칸·목록 다음행. 수정=style.css 미디어쿼리 안 `.s1-layout > .backup-reminder-banner { grid-column: 1 / -1; }`(L3074~3076) 추가→배너 전체행, 등록폼+목록 정상 2열 복귀. 총괄 직접 확인(파일 L3059~3076). 모바일(1열)은 grid 미적용이라 영향 0.
- 검증 증거: node --check app.js/data.js 2 PASS, 금지표현(치료·처방·진단·보장·최적·예방·향상) 신규 0(기존 부정형 안전고지만 잔존), inline onclick 0, git diff=site/app.js+index.html+style.css 3개(+work-plan 총괄). data.js/_headers/ads.txt/sitemap/robots/가이드·정책 HTML/vendor/assets/docs(evidence·security) diff 0.
- 보안 검토 포인트(보안담당 터미널용, Push 전 커밋 diff 독립 검토): ① players schema 무변경(pLDB_v4_5 무수정, 신규키 pLDB_lastBackupAt·pLDB_backupReminderSnoozeUntil 2개만) ② 백업/복원 정합 영향 0(buildBackupPayload/_isValidEnvelope/storageKey 'pLDB_v4_5' 무수정) ③ XSS(배너 메시지 textContent+정수, 사용자 자유입력 삽입 경로 0) ④ inline handler 0(data-* 이벤트 위임) ⑤ 금지표현 0 ⑥ 부작용=localStorage 2키 쓰기만(read 외 schema 무변경) ⑦ 레이아웃 수정은 CSS 1블록(grid-column)만, JS·HTML 무관.
- 배포: 사용자 결정으로 localhost 사전검증 생략, 커밋·배포 후 실도메인 확인 경로 선택. 총괄 커밋(main) → 사용자 Push origin → Cloudflare 재배포 → 실도메인(baseballlabsnc.com)에서 선수 1명+ 상태로 배너 확인.
- 보안/QA 결과(2026-06-08, 보안담당 Claude Opus 4.8 — 커밋 `9ad04a2` 독립 검토, Push 전): **GO(코드 레벨)**. BLOCKER/MAJOR/MINOR 0건, NIT 1. 브라우저 실사용: 미수행(설계대로 배포 후 실도메인 확인 — 정적으로 토큰·DOM·로직 독립 확인). 실행: node --check app.js·data.js(2 PASS) / `git show 9ad04a2 --stat`(app.js·index.html·style.css·work-plan 4파일만) + 수정금지 경로(data.js·_headers·ads.txt·sitemap·robots·가이드/정책 HTML·vendor·assets·docs evidence·security) diff 0 / 신규 금지표현 0(added-line 검사) / inline handler 0(index.html). 독립 확인: ① players schema 무변경 — 신규키 `pLDB_lastBackupAt`·`pLDB_backupReminderSnoozeUntil`(app.js L6464~6465) 2개만, storageKey `pLDB_v4_5`(L424·439·745·1162·6555·6614) 무수정. ② 백업/복원 정합 영향 0 — buildBackupPayload/_isValidEnvelope 본문 무변경(신규키 분리). ③ XSS 0 — 배너 문구 textContent + Math.floor 정수 일수만(renderBackupReminder L6491~6510), index.html `#backupReminderText`(L79) 빈 span을 JS textContent로 채움, 사용자 자유입력 삽입 경로 없음. ④ inline handler 0 — 버튼 전부 data-backup-reminder-action(index.html L81·82·84), banner click 위임 addEventListener(L6539~6546) + dedupe 바인딩. ⑤ 금지표현 0 — '권장/보호/사라질 수 있음'만(보장형 없음). ⑥ 부작용 = localStorage 2키 write만(markBackupDone L6486=LAST_KEY, _snoozeBackupReminder L6513=SNOOZE_KEY), players 무수정. ⑦ 레이아웃 = style.css `.s1-layout > .backup-reminder-banner{grid-column:1/-1}`(L3074~3075, @media min-1280 내) 1블록 + 배너 스타일(L4558~) — 참조 토큰 9종(--warning-surface-soft/border-soft/accent/text-strong/deep/soft/border/light·--radius-sm) 전부 :root(L13~124) 정의 확인(미정의 0). markBackupDone 중복호출 없음(backup-now→downloadBackup()만 호출, markBackupDone은 downloadBackup 성공부 L6591 + finalizeRestorePlayers L6802 각 1회). shouldShowBackupReminder 3-AND + snooze 무효날짜 방어 정확. NIT: 배너 `role="alert"` + `aria-live="polite"` 혼용(role=alert는 assertive 함의) — 기능/보안 영향 0, a11y 사소(중장기 정리 여지). → 사용자 Push origin 가능. 배포 후 실도메인에서 배너 노출(선수1명+ & 미백업/14일경과 조건) 시각 확인 권장.
- 총괄 정밀검토(2026-06-08, Opus — 보안보고서 독립 교차검증): **GO 수용**. 보안보고서 7개 검토포인트+NIT 전부 코드 대조 재확인 일치. 교차검증 근거: ① 신규키 2개(app.js L6464~65)·storageKey 'pLDB_v4_5' 무수정 ② markBackupDone 단일경로(L6591 다운로드성공·L6802 복원성공 각1회, backup-now→downloadBackup()만 호출→중복 0) ③ renderPlayerList 양분기 호출(L2213 empty·L2377 정상) ④ 바인딩 window.onload(L525) ⑤ XSS 0(renderBackupReminder textContent+Math.floor 정수, L6502·6506 금지표현 0=권장/보호/사라질수있음) ⑥ inline handler 0(index.html L81·82·84 data-*, 위임 L6546) ⑦ 레이아웃 grid-column 1블록(style.css L3074, @media min-1280) ⑧ 배너 실참조 토큰 9종(--warning-surface-soft·border-soft·accent·text-strong·text-deep·text-soft·border·light·--radius-sm) 전부 :root(L51~117) 정의·미정의 0(보고서 약식표기 'deep/soft'=text-deep/text-soft, --radius-sm은 ,6px/,4px fallback 보유로 이중안전). NIT(배너 role="alert"+aria-live="polite" 혼용) 타당하나 ARIA 규칙상 명시 aria-live가 우선→실동작 polite, 기능/보안 영향 0 → §14 LATER(a11y 정리)로 이관, 즉시조치 불필요. 보고서 토큰 약식표기 모호성은 감사 결론(미정의 0) 무영향. → 3중 게이트(구현·총괄·보안 + 총괄 재검증) 통과, 사용자 Push origin 진행 가능.
- T8 종료(2026-06-08): 사용자 Push origin → Cloudflare 재배포 → 실도메인(baseballlabsnc.com) 배너 정상 작동 확인(선수1명+·미백업 조건 노출, 지금백업/나중에/X 동작 정상, 데스크탑 레이아웃 정상). origin/main=12e4733(T8 코드 커밋 9ad04a2 포함). **티켓 CLOSED.** 잔여: 보안 NIT1(배너 role="alert"+aria-live="polite" 혼용)→§14 LATER a11y 정리로 이관(기능·보안 영향 0, 즉시조치 불필요). 다음 트리거: AdSense 승인 보고(§13) 또는 사용자 신규 지시.

22. Codex 복귀 로드맵 (2026-06-09, 총괄 Claude — Codex 6/11 복귀 대비)
- 현재 상태: T1~T8 완료·배포·push 완료. origin/main=ba00f2e, working tree clean, 활성 티켓 없음. 정적 스캔상 버그·미완성·TODO 0. 메인 외부 게이트=AdSense 승인 대기(Google 심사).
- 우선순위 큐(권장 순서 / 게이팅 상태):
  ① [🔴 외부 대기·PRIMARY] AdSense 승인 후 게재 확인(§13) — 승인 시 자동광고 게재 확인 + 인페이지 방해 판단 + 필요시 §11 수동 광고단위 정밀화.
  ② [✅ 완료·CLOSED] T9 a11y 접근성 폴리시 — 커밋 4c45a6a, 3중 게이트 GO+실사용 검증 완료(2026-06-09). 상세 §23.
  ③ [✅ 완료·CLOSED] T10 SEO 콘텐츠 확장 — 커밋 33034f5(about·contact FAQ+JSON-LD 4p), 3중 게이트 GO+실사용 검증 완료(2026-06-09). 상세 §24.
  ④ [✅ 완료·CLOSED] og:image PNG 13p 일괄 — T16으로 해소(에셋 자체 제작), 커밋 2d50ce1+4ff82bd, 3중 게이트 GO+실사용 검증 완료(2026-06-11). 상세 §30.
  ⑤ [🟡 AdSense 안정화 후·M-L] _headers CSP 강화 — unsafe-inline/eval 축소·nonce. 자동광고 요건과 트레이드오프(§17 NIT 후속).
  ⑥ [⏸️ 사용자 결정 보류] PWA manifest 홈화면 — "앱 출시" 시점에 진행(사용자 결정).
- 총괄 권장: 외부 의존 없는 ②T9(즉시·저위험) → ③T10(AdSense·SEO 도움) 순. ①은 Google 승인 떨어지면 최우선 전환.
- 본 로드맵은 문서 정리 전용(2026-06-09): 코드 변경 0. T9/T10 실제 착수는 Codex 복귀 또는 사용자 ㄱㄱ 신호 시. 3중 게이트(구현→총괄검증→보안) 워크플로우 동일 적용.
- 추가(2026-06-10, 사이트 완성도 검토 후 사용자 확정): ⑦ T11 빠른 보완 묶음(404+모달 ESC+theme-color/터치아이콘) [CLOSED·커밋 ae278e5·§25] ⑧ T12 선수 목록 검색·정렬 [CLOSED·커밋 715a190·§26]. CSV 내보내기는 실수요 확인 후 보류.
- 추가(2026-06-10, 제미나이 제안서 검토 후 사용자 지시로 등재): ⑨ T13 ACWR 분포 차트 [CLOSED·커밋 f187ef1·§28] ⑩ T14 팀 평균 레이더 [CLOSED·커밋 16b1652+548f31a+3f68141·§29] ⑪ T15 코칭 메모 [보류·대형·§27]. 제안서 원안의 Recharts/D3·CDN 주입·Tailwind 마크업·금지표현·"Banister Impulse Model" 출처 표기는 전부 기각(§27 검토 기록).

23. T9 티켓 상세 — a11y 접근성 폴리시 (2026-06-09, 총괄 설계 / 사용자 ㄱㄱ로 착수)
- 배경: Explore 정적 스캔에서 접근성 미세 갭 다수 확인. 단일 NIT(배너 role/aria)을 포함해 묶음 처리. 순수 마크업 → 사용자 화면·기능·보안 영향 0, 보조기술(스크린리더) 사용자에게만 개선.
- 범위(4항목):
  1) 백업 배너(#backupReminderBanner): `role="alert"` 제거, `aria-live="polite"` 유지(비침입 리마인더에 polite 적합) → 속성 충돌 해소.
  2) 모달 닫기 버튼(.modal-close, 현재 `&times;` 텍스트만·aria-label 없음): 각 버튼에 `aria-label="닫기"` 추가.
  3) 아이콘 전용 버튼(텍스트 없이 `<i data-lucide>`만, aria-label 없음): 버튼 실제 기능에서 도출한 한글 `aria-label` 추가.
  4) form `<label>`: 대응 input의 **기존 id**로 `for` 속성 연결. ※ input id는 추가·변경·삭제 금지(JS getElementById 의존). id 없는 라벨은 스킵·보고.
- 수정 파일: `site/index.html`만. data.js/app.js/css/_headers/기타 금지.
- 제약: inline handler 신규 0, 금지표현 0, 화면 표시·레이아웃·기능 무변경, **id 무변경**.
- 구현: Haiku(기계적 마크업) / 검증: 총괄 증거검토(전체 diff·id변경 0 확인) + 보안담당 터미널 독립.
- 워크플로우: 총괄 설계(본 §23) → Haiku 구현 → 총괄 증거검토 GO → 보안담당 터미널 독립 GO → 총괄 커밋 → 사용자 Push.
- 보안 검토 포인트(터미널용): ① 변경=마크업 속성만(role 제거/aria-label/for 추가) ② input id 무변경(getElementById 영향 0) ③ inline handler 신규 0 ④ 금지표현 0 ⑤ 수정파일 index.html 단일·금지파일 diff 0 ⑥ 화면/기능 회귀 0.
- 구현(2026-06-09): 최종 Sonnet 4.6. ※시행착오 기록(교훈): Haiku 1차=4항목 구현했으나 텍스트 있는 헤더버튼에 aria-label 추가(스펙 이탈) / Haiku 2차=수정 지시했으나 git restore류로 파일 되돌려 role제거·for 54 소실(총괄 diff 검증서 발견) / Sonnet 3차=전체 재구현 정상. → 향후 하위에이전트 지시에 "git checkout/restore/reset/stash 금지, Edit만" 명시 필수.
- 총괄 증거검토 GO(2026-06-09, Opus 직접 재검증): for= 54건 추가(전 타깃 실 id로 해소·미해소 0건 독립확인), role="alert" 제거 1건(배너 aria-live="polite" 유지, L77), aria-label="닫기" 7건(모달 닫기), 텍스트 버튼 aria-label 0건(header-dashboard-btn/dashboardHomeBtn/header-guide-cta 무라벨=스펙대로), input id 변경 0건(diff id= 매칭쌍 banner/wlRpeLabel/wlCountLabel 전부 -/+ 동일값, 입력 id 무수정), inline onclick 0, 수정파일 site/index.html 단일(+work-plan 총괄), diff 124행=62수정라인(54+7+1) 정합. 금지표현 무관(속성만 변경, 텍스트 무변경).
- 보안/QA 결과(2026-06-09, 보안담당 Claude Opus 4.8 — 워킹트리 T9 diff 독립 검토, 커밋/Push 전): **GO**. BLOCKER/MAJOR/MINOR/NIT 0건. 브라우저 실사용: 미수행(순수 마크업 속성 변경 — 화면·레이아웃·기능 무변경을 정규화 diff로 입증, 보조기술 전용 개선이라 정적 검증으로 충분).
  - 실행: `git diff --numstat`(index.html 62/62 순수수정 + work-plan 17/1만) / 금지경로 `git diff --stat`(app.js·data.js·*.css·_headers·ads.txt·sitemap·robots·favicon·about·contact·privacy·terms·*-guide·assets·vendor·docs evidence·security) = **0** / `node --check` app.js·data.js 2 PASS(미변경 sanity).
  - 독립 확인: ① **id 멀티셋 HEAD≡NEW 완전 일치**(`diff` 0 → getElementById 의존 무영향, input id 무변경 입증) ② **정규화 diff 0** — `for=`/`aria-label="닫기"`/`role="alert"` 3속성 제거 후 HEAD≡NEW(텍스트·구조·기타 속성 단 한 글자도 무변경 → 회귀 0 강증명) ③ `role="alert"` HEAD 1→NEW 0(배너 L77, `aria-live="polite"` 유지=비침입 리마인더에 적합·ARIA 충돌 해소) ④ `aria-label="닫기"` +7건(모달 close L492·551·593·658·682·824·927, `&times;` 텍스트·`data-*-action` 위임 유지) — 배너 close L84의 1건은 T8 기존(diff 무관, NEW 총 8=기존1+신규7) ⑤ `for=` +54건 전부 실 id로 해소(`comm` 미해소 0건), single-quote id/for 0(스캔 사각 없음) ⑥ inline handler(onclick/oninput/onchange/onsubmit) 0 — CSP-safe·신규 0 ⑦ added 라인 금지표현 0.
  - 스펙 이행 교차검증: 헤더/대시보드 아이콘 후보 3버튼 — header-dashboard-btn(L46 '팀 대시보드')·header-guide-cta(L50 '처음 사용 가이드')·dashboardHomeBtn(L464 '홈으로') 전부 **가시 텍스트 보유** → aria-label 생략 정당(WAI-ARIA: 가시 텍스트 있으면 불필요, 추가 시 접근명 덮어씀), 미라벨 아이콘전용 버튼 잔존 0. 모달 close는 `&times;`(×=기호) 위 `aria-label="닫기"`가 접근명 우선 → 의도된 개선. §287 시행착오(Haiku 2차 for 54 소실)는 최종 워킹트리에서 54건 전수 존재로 회복 확인.
  - [총괄 판단 요청] 없음.
  - [결론] **GO** — 3중 게이트(구현 Sonnet·총괄 증거검토·보안 독립) 통과, 총괄 커밋(main) + 사용자 Push origin 진행 가능.

24. T10 티켓 상세 — SEO 콘텐츠 확장 (2026-06-09, 총괄 설계 / 사용자 옵션 B 승인)
- 배경: 얇은 공개페이지(about ~289w/contact ~263w) + about·contact·privacy·terms JSON-LD 전무. AdSense 심사·오가닉 SEO 보강. 효능 주장 없이 제품·사용법 사실(FAQ)만 추가 → 근거규칙 위험 낮음.
- 범위(옵션 B): JSON-LD 4페이지(about=AboutPage+FAQPage / contact=ContactPage+FAQPage / privacy·terms=WebPage) + about·contact "자주 묻는 질문" 섹션 신설 + contact 푸터 내부링크 보강.
- 수정 파일: site/about.html, site/contact.html, site/privacy.html, site/terms.html만. 수정금지: app.js/data.js/*.css/_headers/ads.txt/sitemap/robots/index.html/가이드 HTML/assets/vendor/docs. CSS·JS 변경 0(기존 .doc-wrap/.h-num/.doc-note/.doc-links 재사용).
- 콘텐츠: about FAQ 5(저장위치/가입/비용/의료도구아님/기기간) · contact FAQ 5(백업/기기변경/데이터손실/개인정보·광고문의/응대범위). 전부 사실 기반(앱 구조상 자명). 금지표현 0(부정형 면책만), 기존 안전 톤 유지.
- JSON-LD: 가이드 Article 패턴 재사용, <head> ko-KR, publisher=Organization, canonical url. FAQPage 리치결과는 구글정책상 제한적 — 주목적 콘텐츠 깊이·시맨틱.
- 구현: Sonnet 4.6 / 검증: 총괄 증거검토(금지표현·사실·JSON유효·금지파일0) + 보안담당 터미널 독립.
- 워크플로우: 총괄 설계(본 §24) → Sonnet 구현 → 총괄 GO → 보안 독립 GO → 총괄 커밋 → 사용자 Push.
- 보안 검토 포인트(터미널용): ① 수정파일 4개(about/contact/privacy/terms) 한정·코드/금지파일 diff 0 ② 신규 금지표현 0(added-line, 부정형 제외) ③ JSON-LD JSON 파싱 유효·타입/URL 정확·가시 FAQ와 일치 ④ inline handler 신규 0·CSS/JS 무변경 ⑤ FAQ 사실성(localStorage/무가입/무동기화/백업복원=앱 실제동작) ⑥ XSS: 정적 텍스트만(사용자 입력 삽입 경로 0).
- 구현(Sonnet 4.6, 2026-06-09): about/contact "자주 묻는 질문" 5문항씩 신설(.h-num 연번 05, 기존 더알아보기→06) + 4페이지 <head> JSON-LD + contact 푸터 가이드링크 8개 보강. diff: about +15·contact +29·privacy +1·terms +1행.
- 총괄 증거검토 GO(2026-06-09, Opus 직접 재검증): ① 수정파일 4개 HTML만(+work-plan 총괄), 코드/CSS/JS/금지파일 diff 0 ② JSON-LD 4블록 전부 유효 파싱(python json.loads): about=[AboutPage,FAQPage]·contact=[ContactPage,FAQPage]·privacy/terms=WebPage, canonical url 정확(/about·/contact·/privacy·/terms) ③ FAQ 섹션 2개(about·contact), JSON-LD FAQPage 답변=가시 <p> 텍스트 일치 ④ 금지표현 추가라인 전부 부정형(진단·치료·처방 "…위한 도구가 아니며" / 진단·처방·보장 "…문의에는 답변하지 않으며") — 긍정 주장 0, 향상/최적/예방 0 ⑤ inline handler 추가 0(CSP-safe) ⑥ FAQ 사실성=앱 실제동작(localStorage 전용·무가입·무비용·무동기화·백업복원) 일치.
- 보안/QA 결과(2026-06-09, 보안담당 Claude Opus 4.8 — 워킹트리 T10 diff 독립 검토, 커밋/Push 전): **GO**. BLOCKER/MAJOR/MINOR/NIT 0건. 브라우저 실사용: 미수행(정적 HTML 콘텐츠·메타데이터만 — JS/CSS/레이아웃/인터랙션 변경 0, JSON-LD는 크롤러용 데이터로 파서 검증·FAQ는 정적 텍스트라 정적 검증으로 충분).
  - 실행: `git diff --numstat`(about 14/1·contact 29/0·privacy 1/0·terms 1/0 + work-plan 14/1만) / 금지경로 `git diff --stat`(app.js·data.js·*.css·_headers·ads.txt·sitemap·robots·index.html·favicon·*-guide·assets·vendor·docs evidence·security) = **0**.
  - 독립 확인: ① **수정파일 4개 HTML 한정** — 코드/CSS/JS/index/가이드/금지파일 diff 0(CSS·JS 무변경 입증) ② **JSON-LD 4블록 전부 JSON.parse 유효**(node 추출 검증): about=[AboutPage,FAQPage]·contact=[ContactPage,FAQPage]·privacy/terms=WebPage, canonical url 4종 정확(/about·/contact·/privacy·/terms), inLanguage ko-KR·publisher Organization ③ **added `<script>` = ld+json 4개뿐** — 실행 script·`<style>`·inline handler(onclick/oninput/onchange/onerror/onload)·javascript: 신규 0 → CSP-safe·XSS 0 ④ **FAQPage 구조화데이터 ↔ 가시 `<p>` 텍스트 10문항 전수 일치**(about 5·contact 5, 구글 structured-data=visible 요건 충족) ⑤ **금지표현 0** — added 라인 내 진단·치료·처방·보장은 전부 부정형 면책("…위한 도구가 아니며"/"…답변하지 않으며"), 긍정 효능주장·향상·최적·예방·효과·개선 0 ⑥ **FAQ 사실성 = 앱 실제동작 일치**(localStorage 전용·서버 미전송·무가입·무비용·의료도구 아님·자동동기화 없음·백업다운로드→JSON·복원) ⑦ **XSS/주입 0** — 정적 authored 텍스트, ld+json 내 `</script>` 조기종료·미이스케이프 없음(전체 파싱 성공이 증명), 따옴표 `\"` 정상 이스케이프(contact "백업 다운로드"/"복원").
  - 회귀/품질 교차검증: contact 푸터 신규 가이드링크 8종 전부 실파일 해소(rpe·acwr·workload·recovery·assessment·training-program·warmup-shoulder·fielding-baserunning-agility-guide.html 존재 → broken link 0), 내부링크 plain(target=_blank 0 = 기존 about/privacy/terms 푸터 패턴 일치), h-num 연번 about 01~06·contact 01~05 연속(번호 끊김 0).
  - [총괄 판단 요청] 없음.
  - [결론] **GO** — 3중 게이트(구현 Sonnet·총괄 증거검토·보안 독립) 통과, 총괄 커밋(main) + 사용자 Push origin 진행 가능.

25. T11 티켓 상세 — 빠른 보완 묶음 (2026-06-10, 총괄 설계 / 사용자 "바로 작업" 지시)
- 배경: 2026-06-10 사이트 완성도 검토에서 확인된 갭 3건 묶음 — 404.html 부재(Cloudflare 기본 404 노출), 모달 ESC/포커스 처리 0건, theme-color·apple-touch-icon 부재.
- 범위(3항목):
  1) **404.html 신설**: about.html 헤드/구조(.doc-wrap, docs.css) 재사용. title "페이지를 찾을 수 없습니다", `meta robots noindex`, **AdSense 스크립트 제외**(무콘텐츠 페이지 광고 정책 리스크), og/JSON-LD 불요, sitemap.xml 추가 금지. 본문=안내 + 홈/주요 가이드 링크. 금지표현 0.
  2) **모달 ESC 닫기 + 포커스 관리**: 공용 openModal(L764)/closeModal(L765) 활용. document keydown 1회 바인딩(중복 방지), `e.key==='Escape' && !e.isComposing`(한글 IME 보호) → 열린 .modal-overlay 중 z-최상위 1개만 닫기. 닫기 = 해당 모달의 기존 닫기/취소 컨트롤 .click() 재사용(modal-close / confirmCancelBtn / resetAllCancelBtn / alertConfirmBtn). **긍정·파괴 버튼(confirmBtn, resetAllConfirmBtn 등) click 절대 금지**. 포커스: openModal에서 직전 activeElement 저장→closeModal에서 복원(요소가 DOM에 연결·가시일 때만, try-catch). openModal 미경유 모달은 수정하지 말고 보고.
  3) **theme-color + apple-touch-icon**: 전 공개 HTML(13p+404)에 `<meta name="theme-color" content="#0b1220">`(favicon 배경색=브랜드 네이비). apple-touch-icon.png(180×180)는 favicon.svg(불투명 배경 rect 보유)에서 qlmanage 변환 시도→sips 크기 검증→site/apple-touch-icon.png + link 태그. **변환 실패/비정상 시 아이콘 스킵하고 theme-color만**(아이콘은 og:image 에셋 배치로 이관).
- 수정 파일: site/404.html(신규), site/app.js, site/index.html+가이드/정책 HTML 12종(head 1~2줄), site/apple-touch-icon.png(신규·조건부). 수정 금지: data.js, *.css, _headers, ads.txt, sitemap.xml, robots.txt, vendor/**, docs/**.
- 구현: Sonnet 4.6 / 검증: 총괄 증거검토(diff·node --check·ESC 로직·PNG 시각 확인) + 보안담당 터미널 독립.
- 워크플로우: 총괄 설계(본 §25) → Sonnet 구현 → 총괄 증거검토 GO → 보안담당 터미널 독립 GO → 총괄 커밋 → 사용자 Push.
- 보안 검토 포인트(터미널용): ① ESC 핸들러가 취소 경로만 트리거(파괴/긍정 버튼 click 0) ② keydown 바인딩 1회·중복 0 ③ 404에 AdSense/외부 스크립트 0·noindex ④ sitemap/robots/_headers diff 0 ⑤ 신규 금지표현 0 ⑥ inline handler 0 ⑦ PNG는 정적 바이너리(스크립트 무관) ⑧ 포커스 복원 try-catch 방어.
- 구현(2026-06-10, Sonnet 2회): 1차 에이전트가 보고 중 중단(theme-color/아이콘 13p+포커스관리까지 완료, ESC·404 미구현) → 총괄 직접 diff 검증으로 미완 확인 → 2차 Sonnet이 ESC+404 완성. ※1차 부분작업은 전부 건전(되돌림 없음), 메모리 교훈(보고 아닌 diff 검증) 재적중.
- 총괄 증거검토 GO(2026-06-10, Opus 직접 재검증): ① node --check app.js·data.js 2 PASS ② ESC: _handleGlobalModalKeydown(app.js L6903~)+_bindGlobalModalKeydown(L6926~), 선언 L499~500, onload 바인딩 L529(dedupe 패턴) — isComposing 한글IME 보호, z-index 최상위(동률=DOM 후순위), 취소경로만 click(.modal-close→confirmCancelBtn→resetAllCancelBtn→alertConfirmBtn), 추가라인 긍정/파괴버튼 참조 0 직접 확인 ③ 포커스: openModal 저장→closeModal 복원(isConnected·offsetParent 가드+try-catch, L766~779) ④ 404.html: 스크립트 0(AdSense 포함)·noindex 1·금지표현 0·onclick 0·링크 5종 전부 실파일 해소·doc-* 구조 일치(총괄 직접 열람) ⑤ theme-color 13p+404=14p(#0b1220=파비콘 배경)·apple-touch-icon.png 180×180(7.8KB) 총괄 시각 확인(네이비 라운드+블루 야구공, 파비콘 일치) ⑥ 금지파일(data.js·css·_headers·ads.txt·sitemap·robots·vendor) diff 0 — sitemap에 404 미추가 확인.
- 보안/QA 결과(2026-06-10, 보안담당 Claude Opus 4.8 — 워킹트리 T11 diff 독립 검토, 커밋/Push 전): **GO**. BLOCKER/MAJOR/MINOR 0건. NIT 1건(미사용 변수). 브라우저 실사용: 미수행(ESC=취소경로만 트리거를 코드경로 정적추적으로 입증, 메타·404·PNG는 정적 자원 — 정적 검증으로 충분).
  - 실행: `node --check` app.js·data.js 2 PASS / 금지경로 `git diff --stat`(data.js·*.css·_headers·ads.txt·sitemap·robots·vendor·docs/evidence·docs/security) = **0**(docs는 work-plan.md 1건만=총괄 기록, 정상) / `git diff --numstat`(app.js 47/1 + HTML 13p 각 2/0 + work-plan 23/1) / 404·HTML inline handler·script 스캔 / PNG `file`+`sips`.
  - 독립 확인: ① **ESC 취소경로 단독 보장(핵심)** — `_handleGlobalModalKeydown`(app.js L6903~) 컨트롤 체인=`.modal-close`→`#confirmCancelBtn`→`#resetAllCancelBtn`→`#alertConfirmBtn`. 파괴버튼 `confirmBtn`(L904 btn-danger '확인')·`resetAllConfirmBtn`(L919 btn-danger '초기화 실행') **체인 0참조**(rg 교차확인). confirmModal(L899)·resetAllModal(L910)은 `.modal-close` 없음 → ESC가 각 모달 스코프 querySelector로 취소버튼(취소)만 click, danger 실행버튼 절대 미click 입증. alertModal(L891)은 alertConfirmBtn('확인'=알림 닫기, 비파괴)만 보유 → 정당. `.modal-close` 6모달(wellness/perf/guide/swap/app-guide/workload/edit-player)은 전부 `data-*-action="close"`=비파괴 닫기 ② **IME 보호** `e.isComposing` 가드(한글 입력중 ESC 무시) ③ **z-index 최상위 1개만**(동률=DOM 후순위) ④ **바인딩 1회** — addEventListener('keydown') 단 1건, `_bindGlobalModalKeydown`이 기존 핸들러 removeEventListener 후 재등록(중복 0) ⑤ **포커스 복원 방어** openModal 저장→closeModal 복원, `isConnected && !hidden && offsetParent!==null` 가드+try-catch(예외 격리) ⑥ **404.html** script/AdSense/googlesyndication 0·`robots noindex`(L7)·inline handler 0·링크 5종(/, /about, /workload-guide, /rpe-guide, /contact) 전부 실파일 해소 ⑦ **theme-color #0b1220 14p**(13p+404)·**apple-touch-icon link 14p**, PNG 정적 바이너리 180×180 RGBA(스크립트 무관) ⑧ added HTML 라인 inline handler(onclick/oninput/onchange/onload/onerror/onsubmit/javascript:) **0**·금지표현 **0** ⑨ XSS/저장경로: 사용자 데이터 삽입·localStorage schema 변경 0(ESC=기존 컨트롤 위임, 포커스소스=DOM 요소 참조뿐).
  - NIT1: `let _escKeyHandler = null;`(app.js L498) 선언만 있고 사용처 0(실제 핸들러는 `_globalModalKeydownHandler` 사용) — 죽은 변수. 기능·보안 영향 0. 정리 시 제거 권장(즉시 조치 불요).
  - [총괄 판단 요청] 없음.
  - [결론] **GO** — 3중 게이트(구현 Sonnet·총괄 증거검토·보안 독립) 통과, 총괄 커밋(main) + 사용자 Push origin 진행 가능. NIT1은 차기 정리 시 선택 반영.
- 총괄 보안 GO 수용 + NIT1 즉시 처리(2026-06-10): NIT1(_escKeyHandler 죽은 변수)은 이번 티켓이 새로 추가한 줄이라 커밋 전 제거가 적절 → 총괄 직접 1줄 삭제(app.js L498), node --check 재PASS. 커밋 진행.
- **CLOSED(2026-06-10)**: 커밋 ae278e5 → 사용자 Push origin → Cloudflare 재배포 → 사용자 실사용 확인 완료("정상 작동"). 3중 게이트(구현·총괄·보안) + 실사용 검증 전부 통과. 티켓 종료.

26. T12 티켓 상세 — 선수 목록 검색·정렬 (2026-06-10, 총괄 설계 / 사용자 결정: 검색=이름 실시간, 정렬=등록순+이름순 최소안)
- 배경: s1 선수 목록에 검색/정렬 전무 → 선수 10명+ 팀에서 탐색 불편. 2026-06-10 완성도 검토 최대가치 후보, 사용자 확정.
- 설계:
  1) UI: "관리중인 선수 목록" 카드 상단(#playerList 위)에 컨트롤 행 — 검색 input(placeholder "선수 이름 검색", id=playerSearchInput, label 연결) + 정렬 select(id=playerSortSelect, 옵션: 등록순[기본]/이름순). CSP 준수: inline handler 0, window.onload dedupe 바인딩.
  2) 로직: 모듈 변수 _playerListSearchTerm/_playerListSortMode(세션 내 유지, localStorage 무사용=schema 무변경). renderPlayerList에서 표시용 사본만 필터·정렬: 검색=trim·소문자 비교 name.includes / 정렬 이름순=[...arr].sort(localeCompare 'ko') — **players 원본 무수정**(등록순=원본 순서 그대로).
  3) 빈 상태 구분(중요): players 0명=기존 온보딩 empty state 유지 / players 있으나 검색결과 0=목록 영역에 "검색 결과가 없습니다" 간단 문구(온보딩 empty state 오발동 금지). 양쪽 모두 renderBackupReminder 호출 경로(L2213·L2377) 유지.
  4) XSS: 검색어는 필터 비교에만 사용, HTML 삽입 0. 선수명 escapeHTML 기존 유지.
  5) CSS: style.css에 .player-list-controls 소형 flex 블록만(기존 토큰 재사용, 모바일 wrap).
- 수정 파일: site/index.html(컨트롤 마크업), site/app.js(필터·정렬·바인딩), site/style.css(컨트롤 1블록). 수정 금지: data.js, tokens.css, docs.css, _headers, ads.txt, sitemap, robots, 가이드/정책 HTML, vendor/**, docs/**.
- 구현: Sonnet 4.6 / 검증: 총괄 증거검토 + 보안담당 터미널 독립 / 워크플로우: 3중 게이트 표준.
- 보안 검토 포인트(터미널용): ① players 원본·localStorage schema 무수정(표시용 사본만) ② 검색어 HTML 삽입 0(XSS) ③ inline handler 0·바인딩 dedupe 1회 ④ 빈상태 분기 정확(온보딩 오발동 0) ⑤ 금지표현 0 ⑥ 수정 3파일 한정·금지파일 diff 0.
- 구현(Sonnet 4.6, 2026-06-10): index.html 컨트롤 행(L304~, #playerList L311 위) — playerSearchInput(aria-label)+playerSortSelect(등록순/이름순, form-control 기존 클래스) / app.js 모듈변수 4종+_bindPlayerListControls(L2213, dedupe)+onload 호출(L545)+renderPlayerList 표시용 필터·정렬 체인+무결과 분기 / style.css .player-list-controls+.player-list-no-results 블록(+모바일 wrap). diff: app.js +44·index.html +7·style.css +36.
- 총괄 증거검토 GO(2026-06-10, Opus 직접 재검증): ① node --check 2 PASS ② 수정 3파일 한정(+work-plan 총괄), 금지파일 diff 0 ③ players 원본 무수정 — 추가라인 players.(sort|splice|reverse) 0, 정렬은 [...visiblePlayers] 사본만 ④ 3분기 renderBackupReminder 전부 호출(온보딩/무결과/정상) — 무결과 분기는 정적 문구만 삽입(검색어 HTML 미삽입=XSS 0) ⑤ 코드 추가라인 onclick·localStorage 0(검출 2건=본 §26 설계 문구, 코드 0 확인)·금지표현 0 ⑥ form-control 셀렉터 실재(style.css L601)+사용 토큰 --s-3/--s-4/--s-6/--text-muted 전부 정의 확인(미정의 0) ⑦ 행 액션 data-player-id→players.find(id) 방식이라 필터·정렬 후에도 오라우팅 불가 ⑧ renderPlayerList 호출처 12곳 전부 무인자(시그니처 무변경).
- 보안/QA 결과(2026-06-10, 보안담당 Claude Opus 4.8 — 워킹트리 T12 diff 독립 검토, 커밋/Push 전): **GO**. BLOCKER/MAJOR/MINOR/NIT 0건. 브라우저 실사용: 미수행(표시용 필터·정렬은 순수 read-only 코드경로 정적추적으로 입증, players 원본·schema 무변경·XSS 0을 정적 검증으로 확정).
  - 실행: `node --check` app.js·data.js 2 PASS / 금지경로 `git diff --stat`(data.js·tokens.css·docs.css·_headers·ads.txt·sitemap·robots·vendor·docs/evidence·docs/security·가이드/정책 HTML) = **0**(docs는 work-plan 1건=총괄 기록) / `git diff --numstat`(app.js 43/1·index.html 7/0·style.css 36/0 + work-plan).
  - 독립 확인: ① **players 원본 무수정(핵심)** — 추가라인 `players.(sort|splice|reverse|push|pop|shift|unshift)` **0**. 검색=`players.filter()`(새 배열), 정렬=`[...visiblePlayers].sort(localeCompare 'ko')`(spread 사본). 원본 배열·localStorage schema 단 한 번도 변형 없음 ② **XSS 0** — 검색어(`_playerListSearchTerm`)는 `.trim().toLowerCase().includes(term)` 비교에만 사용, HTML 삽입 경로 0. 무결과 문구는 정적 리터럴('검색 결과가 없습니다', 검색어 미삽입). 정상 렌더 선수명 `escapeHTML(p.name)`→`safePlayerName` 기존 유지 ③ **빈상태 3분기 정확 분리** — players.length===0=온보딩 empty-state(L2251, createIcons+renderBackupReminder+return) / 필터결과 0=`.player-list-no-results` 문구(L2267, renderBackupReminder+return) / 정상=map 렌더 후 renderBackupReminder(L2432). 온보딩은 원본 길이 기준이라 검색결과 0에 **오발동 불가**, 백업리마인더 3경로 전부 호출 ④ **CSP-safe** — index.html 신규 input/select에 inline handler(onclick/oninput/onchange) **0**, 이벤트는 `_bindPlayerListControls`가 addEventListener로 위임(input/change), removeEventListener 선행 dedupe·onload 1회 바인딩 ⑤ **세션 한정** — `_playerListSearchTerm`/`_playerListSortMode` 모듈변수, localStorage write 0(schema 무변경) ⑥ **금지표현 0**·코드 추가라인 localStorage 0(검출 2건=§26 설계 문구뿐) ⑦ **CSS** — `.player-list-controls`/`.player-list-no-results` 신규 1블록, 토큰 --s-3/--s-4/--s-6/--text-muted 정의 실재, form-control 재사용, 모바일 wrap(≤480px) ⑧ **회귀 0** — 행 액션 data-player-id→find(id) 방식이라 필터·정렬 후 오라우팅 불가, renderPlayerList 시그니처 무변경.
  - aria 접근성: playerSearchInput `aria-label="선수 검색"`, playerSortSelect `aria-label="정렬 기준"` — 라벨 보유(T9 a11y 기조 일치).
  - [총괄 판단 요청] 없음.
  - [결론] **GO** — 3중 게이트(구현 Sonnet·총괄 증거검토·보안 독립) 통과, 총괄 커밋(main) + 사용자 Push origin 진행 가능.
- **CLOSED(2026-06-10)**: 커밋 715a190 → 사용자 Push origin → Cloudflare 재배포 → 사용자 실사용 확인 완료("정상적으로 잘 작동"). 검색 타이핑 필터·정렬 전환·무결과 문구·기존 수정/삭제 동작 정상. 3중 게이트 + 실사용 검증 전부 통과. 티켓 종료.

27. 제미나이 제안서 검토 + T13~T15 설계 시드 (2026-06-10, 총괄 검토 / 사용자 등재 지시)
- 입력: 외부(제미나이) 제안서 — ① 팀 대시보드 시각화(ACWR scatter+피지컬 레이더) ② 코칭 메모 고도화(태그·타임라인·스마트얼럿·스키마 변경).
- 검토 결론(총괄): 핵심 아이디어 2건 반영 가치 있음, 단 원안 그대로는 불가 — 선별 수용.
  - 이미 구현됨(제안 불요): 선수 8종 레이더(app.js L3270~) · 위험 배지+조치필요 큐(getPlayerRiskInfo: 통증/ACWR>1.5/>1.3/회복저하) · 웰니스 구조화 입력→스케줄 실시간 반영 · localStorage 저장+백업 다운로드+용량 경고.
  - 기각 4건: ① Recharts=React 전용(바닐라 앱 불가)·D3 불요 — Chart.js(vendor self-host)가 scatter 기본 지원, CDN 주입은 self-host 정책+CSP 강화 계획과 충돌 ② Tailwind 마크업(bg-white 등)=토큰 시스템·네이비 다크 테마와 충돌 → 기존 .stat-card 패턴으로 재작성 ③ 금지표현("최적 훈련 영역"·"정밀 진단"·"부상 고위험" 단정) → 기존 안전 라벨(과소/안정/주의/위험)로 치환 ④ "Banister Impulse Model 기준" 표기=허위 출처(ACWR은 별개 지표) — 출처 표기 대신 워크로드 가이드 링크.
- T13 설계 시드 — ACWR 팀 분포 차트 (난이도 중·위험 낮음·가치 높음):
  - 팀 대시보드 카드 1장: Chart.js scatter, X=만성 워크로드, Y=급성 워크로드, 점=기록 보유 선수(calculateACWRMetrics(p)→acuteLoad/chronicLoad/ratio 그대로 사용, isReady=false 선수 제외).
  - 구간: 점 색상 4구간(<0.8 과소 / 0.8~1.3 안정 / 1.3~1.5 주의 / >1.5 위험) — 기존 L3417~ 구간·배지와 동일 기준·동일 라벨. 영역 배경 셰이딩은 선택.
  - 툴팁=Chart.js 기본(선수명+ACWR 수치). 클릭→해당 선수 스크롤 연동은 2차 선택 범위.
  - 제약: 표시 전용(players·schema 무수정), inline handler 0, 신규 라이브러리 0, 금지표현 0, 대상 선수 0명 시 안내 문구(차트 크래시 방지).
- T14 설계 시드 — 팀 평균 피지컬 레이더 (난이도 하):
  - 기존 선수 radar(app.js L3270~) 패턴 재사용, p.scores 보유 선수의 8종 평균 1장. 투수/타자 키 차이(풀업/사이드점프) 처리: 공통 7종+포지션별 분리 또는 포지션 필터 연동 — 구현 설계 시 확정.
  - "취약점 저하 발생"류 자동 진단 문구 금지 — 수치·차트만. 평가 선수 0명 시 안내 문구.
- T15 설계 시드 — 코칭 메모 (보류·대형·착수 전 총괄 정식 재설계 필수):
  - 본 프로젝트 유일 schema 변경 티켓: player.coachNotes[] {id, createdAt, category(고정 5종), content, linkedACWR}. author 필드는 단일 사용자 앱이라 제외 검토.
  - 필수 동반: 마이그레이션(기존 선수 기본값) · sanitizer(app.js L319~ scores 패턴 준용) · 백업/복원 JSON 호환 · content escapeHTML 렌더(XSS) · 저장 용량 경고 연동.
  - 분할: C1=CRUD+고정 태그+타임라인 / C2=태그 필터 / C3(메모→스케줄 자동 개입)=기각 — 처방성 리스크+기존 웰니스 구조화 입력이 동일 역할을 더 안전하게 수행.
- 우선순위(총괄 권장): 외부 대기(AdSense·og:image) 제외 시 T13→T14→(실수요 확인 후) T15. Codex 6/11 복귀 시 본 §27 시드에서 정식 설계로 승격.

28. T13 티켓 상세 — 팀 워크로드 분포 차트(ACWR scatter) (2026-06-10, 총괄 정식 설계 / §27 시드 승격, 사용자 착수 신호)
- 배경: §27 T13 시드 승격. 팀 대시보드(s4)에 선수별 급성/만성 워크로드 분포 카드 1장. 표시 전용·schema 무변경.
- 설계:
  1) 마크업(index.html): #teamStatsGrid 닫는 div 바로 뒤(액션 큐 .dashboard-section 앞)에 차트 카드 — 제목 "팀 워크로드 분포 (ACWR)" + 부제 "전체 선수 기준" + /workload-guide 링크("지표 설명") + `<canvas id="acwrScatterChart" role="img" aria-label="선수별 급성·만성 워크로드 분포 차트">` + 무데이터 안내 div(#acwrScatterEmpty, 기본 숨김, 정적 문구 "워크로드 기록이 누적되면 분포가 표시됩니다.").
  2) 데이터(app.js): 전체 players 기준(대시보드 필터 비연동 — 팀 전체 분포가 직관적, 통계 그리드와 혼동 방지 위해 부제로 명시). calculateACWRMetrics(p) 재사용, isReady=false 선수 제외. x=chronicLoad, y=acuteLoad.
  3) 구간 4 dataset(범례 라벨=기존 안전 표현 재사용, app.js L3417~ 동일 기준): ratio<0.8 "부하 낮음"(--info) / 0.8~1.3 "권장 범위 참고"(--success) / 1.3~1.5 "부하 증가 확인 필요"(--warning) / >1.5 "부하 급증 조정 검토"(--danger). 색은 getComputedStyle로 기존 토큰 해석+fallback hex. 영역 배경 셰이딩 제외(시드의 선택 항목).
  4) 렌더: renderTeamDashboard() 끝에서 renderAcwrScatterChart() 호출(s4 표시 상태에서만 불리는 기존 경로 그대로, 신규 바인딩 불요). 모듈 변수 acwrScatterChartInstance + 재렌더 시 destroy 선행(기존 radarChartInstance L448/3255 패턴). 대상 0명 → canvas 숨김+안내 문구 표시(차트 크래시 방지). 툴팁 콜백="선수명 · ACWR n.nn"(canvas 렌더=HTML 삽입 경로 0). 축 제목 X="만성 워크로드 (4주 평균)" Y="급성 워크로드 (최근 7일)". responsive + maintainAspectRatio:false(고정 높이 컨테이너).
  5) CSS(style.css): .dashboard-chart-card 1블록(기존 토큰만 사용, 차트 body 고정 높이 ~300px/모바일 ~240px).
- 수정 파일: site/index.html, site/app.js, site/style.css 3개 한정. 수정 금지: data.js, tokens.css, docs.css, _headers, ads.txt, sitemap, robots, 가이드/정책 HTML, vendor/**, docs/**.
- 제약: 표시 전용(players·localStorage 무수정), inline handler 0, 신규 라이브러리 0(vendor Chart.js 기존 로드 L25 사용), 금지표현 0(라벨=기존 안전 표현만), 클릭→선수 스크롤 연동은 범위 제외(2차).
- 구현: Sonnet 4.6 / 워크플로우: 3중 게이트 표준(Sonnet 구현 → 총괄 증거검토 GO → 보안담당 터미널 독립 GO → 총괄 커밋 → 사용자 Push).
- 보안 검토 포인트(터미널용): ① players 원본·localStorage schema 무수정(read-only 표시) ② canvas 렌더=HTML 삽입 0(XSS 0, 무데이터 문구=정적 리터럴) ③ inline handler 0 ④ 차트 인스턴스 destroy 선행(중복 생성·누수 0) ⑤ 금지표현 0(기존 안전 라벨 재사용 확인) ⑥ 수정 3파일 한정·금지파일 diff 0 ⑦ 신규 외부 리소스 0(CSP 무영향).
- 구현(Sonnet 4.6, 2026-06-10): index.html 차트 카드(#teamStatsGrid 뒤, BEM 클래스 dashboard-chart-card__*) +13 / app.js 모듈변수 acwrScatterChartInstance(L449)+renderAcwrScatterChart()(drawRadarChart 뒤)+renderTeamDashboard 끝 호출 1줄 +90 / style.css .dashboard-chart-card 블록+모바일 240px +57. 삭제 0줄(순수 추가).
- 총괄 증거검토 GO(2026-06-10, 직접 재검증): ① node --check app.js·data.js 2 PASS ② 수정 3파일 한정(+work-plan 총괄), 금지파일 diff 0 ③ 추가라인 onclick·localStorage·금지표현·players 변형 메서드 전부 0(스캔 exit 1=무검출) ④ 구간 경계 정확(<0.8 / 0.8~1.3 / 1.3~1.5 / >1.5)·라벨=기존 L3417~ 안전 표현 4종 그대로 ⑤ 툴팁=canvas 렌더(HTML 삽입 경로 0), 무데이터 문구=정적 리터럴 ⑥ destroy 선행+무데이터 시 인스턴스 정리·canvas 숨김·안내 표시(크래시 방지) ⑦ 사용 CSS 토큰 16종 전부 tokens.css/style.css 정의 실재(--s-6·--t-h3-weight 포함 미정의 0) ⑧ renderTeamDashboard 변경=호출 1줄뿐(기존 코드 삭제 0). 수용 NIT: calculateACWRMetrics 선수당 2회 호출(filter+forEach) — 팀 규모(수십 명) 데이터라 영향 무시 가능, 차단 사유 아님.
- 보안/QA 결과(2026-06-10, 보안담당 Claude Opus 4.8 — 워킹트리 T13 diff 독립 검토, 커밋/Push 전): **GO**. BLOCKER/MAJOR/MINOR/NIT 0건. 브라우저 실사용: 미수행(표시 전용 차트는 read-only 코드경로 정적추적+Chart.js canvas 렌더 특성으로 XSS·schema 무변경 확정, 정적 검증으로 충분).
  - 실행: `node --check` app.js·data.js 2 PASS / 금지경로 `git diff --stat`(data.js·tokens.css·docs.css·_headers·ads.txt·sitemap·robots·vendor·docs/evidence·docs/security·가이드/정책 HTML) = **0** / `git diff --numstat`(app.js 90/0·index.html 13/0·style.css 57/0 + work-plan).
  - 독립 확인: ① **players 원본 무수정** — 추가라인 `players.(sort|splice|reverse|push|pop|shift|unshift)` **0**. 데이터=`players.filter(isReady)`(새 배열)+`eligible.forEach`(읽기만), localStorage write 0(schema 무변경) ② **XSS 0** — 툴팁 콜백은 Chart.js **canvas 렌더**(HTML/DOM 삽입 경로 없음)라 playerName(p.name)·`ratio.toFixed(2)` 그려도 주입 불가. 무데이터 문구='워크로드 기록이 누적되면…' 정적 리터럴. index.html canvas는 정적 마크업(role="img"+aria-label) ③ **inline handler 0** — 콜백은 JS 함수, index.html onclick/oninput/onchange 추가 0(CSP-safe) ④ **차트 인스턴스 destroy 선행** — 무데이터 분기(destroy+null+canvas 숨김+안내 표시=크래시 방지)·신규 생성 직전(`if(inst) inst.destroy()`) 양쪽 모두 정리 → 중복 생성·메모리 누수 0 ⑤ **금지표현 0** — 범례 4라벨('부하 낮음'/'권장 범위 참고'/'부하 증가 확인 필요'/'부하 급증 조정 검토') 전부 **HEAD(T13 이전)에 1건씩 기존 존재**(워킹트리 2건=기존+차트)로 신규 발명 아님 입증, 축 제목(만성/급성 워크로드)도 중립. 진단·치료·처방·보장·향상·예방·최적 0 ⑥ **신규 외부 리소스 0** — 기존 vendor `chart.umd.min.js`(index L25) 사용, 신규 lib·CDN·CSP 변경 0 ⑦ **CSS** — `.dashboard-chart-card*`/`.dashboard-chart-empty` 신규 블록, 사용 토큰 13종(--card-bg/--r-lg/--shadow-card/--s-3~6/--t-h3-size/--t-h3-weight/--text-main/--text-muted/--primary/--border) 정의 실재(미정의 0), 고정 높이 300px/모바일 240px ⑧ **회귀 0** — renderTeamDashboard 변경=`renderAcwrScatterChart()` 호출 1줄뿐(기존 삭제 0), s4 표시 경로 그대로라 신규 바인딩 불요, 색상 resolveToken은 토큰 비면 fallback hex로 방어.
  - 수용 NIT(총괄 기록): calculateACWRMetrics 선수당 2회 호출(filter+forEach) — 팀 규모(수십 명)라 성능 영향 무시 가능, 보안·정확성 영향 0(차단 사유 아님).
  - [총괄 판단 요청] 없음.
  - [결론] **GO** — 3중 게이트(구현 Sonnet·총괄 증거검토·보안 독립) 통과, 총괄 커밋(main) + 사용자 Push origin 진행 가능.
- **CLOSED(2026-06-10)**: 커밋 f187ef1 → 사용자 Push origin → Cloudflare 재배포 → 사용자 실사용 확인 완료. 3중 게이트 + 실사용 검증 전부 통과. 티켓 종료.

29. T14 티켓 상세 — 팀 평균 피지컬 레이더 (2026-06-10, 총괄 정식 설계 / §27 시드 승격, 사용자 ㄱㄱ)
- 배경: §27 T14 시드 승격. 팀 대시보드(s4)의 T13 ACWR 차트 카드 바로 아래에 평가 점수 팀 평균 레이더 카드 1장. 표시 전용·schema 무변경. 난이도 하.
- 설계:
  1) 포지션 키 차이 확정(시드의 미결 사항): 투수=pullup, 타자=lateralBound가 8번째 항목이라 축이 달라짐 → **공통 7항목 축**(sprint/squat/deadlift/broadJump/thoracic/hip/core = 스프린트/스쿼트/데드리프트/제자리 멀리뛰기/흉추/고관절/코어, 기존 한글 라벨 재사용) + **투수 평균/타자 평균 2개 dataset**으로 비교 표시. 해당 포지션에 평가 완료 선수 0명이면 그 dataset 생략.
  2) 마크업(index.html): T13 카드(.dashboard-chart-card) 바로 뒤에 동일 구조 카드 — 제목 "팀 피지컬 평균 (공통 7항목)" + 부제 "초기 평가 완료 선수 기준" + /assessment-guide 링크("평가 가이드") + `<canvas id="teamPhysiqueRadar" role="img" aria-label="팀 평균 피지컬 평가 레이더 차트">` + 무데이터 div(#teamPhysiqueRadarEmpty, 기본 숨김, 정적 문구 "초기 평가가 완료되면 팀 평균이 표시됩니다.").
  3) 데이터(app.js): 대상=players.filter(p => p.scores)(read-only). 포지션 분류는 기존 패턴 `p.type || '투수'`. 항목별 평균=해당 키가 유한값인 선수만 집계(빈 키는 분모 제외), 유한값 0명인 키=null(차트 갭 허용). 평균값은 소수 2자리 반올림.
  4) 차트: 기존 radar 옵션 재사용(L3269~ — r축 min 0/max 5/stepSize 1/ticks 숨김, Pretendard pointLabels). 색=getCssVar('--primary')(투수)/getCssVar('--info')(타자), 반투명 배경. legend 표시(bottom). 툴팁 기본. 모듈 변수 teamRadarChartInstance + destroy 선행. 평가 선수 0명 → destroy+canvas wrapper 숨김+안내 표시. renderTeamDashboard() 끝 renderAcwrScatterChart() 호출 다음 줄에 renderTeamPhysiqueRadar() 호출 1줄.
  5) CSS: 변경 0 목표 — T13의 .dashboard-chart-card__* 클래스 전부 재사용. 불가피할 때만 최소 추가.
- 수정 파일: site/index.html, site/app.js 2개(+불가피 시 style.css). 수정 금지: data.js, tokens.css, docs.css, _headers, ads.txt, sitemap, robots, 가이드/정책 HTML, vendor/**, docs/**.
- 제약: 표시 전용(players·localStorage 무수정), inline handler 0, 신규 라이브러리 0, 금지표현 0, 자동 "취약점/저하" 판정 문구 금지(수치·차트만 — §27 기각 사유).
- 구현: Sonnet 4.6 / 워크플로우: 3중 게이트 표준.
- 보안 검토 포인트(터미널용): ① players 원본·localStorage schema 무수정(read-only 집계) ② canvas 렌더=HTML 삽입 0(XSS 0, 무데이터 문구=정적 리터럴) ③ inline handler 0 ④ 인스턴스 destroy 선행 ⑤ 금지표현 0·자동 판정 문구 0 ⑥ 수정 파일 한정(원칙 2개)·금지파일 diff 0 ⑦ 신규 외부 리소스 0 ⑧ 항목별 평균 계산 정확(유한값만 집계·빈 키 null 처리, NaN 미발생).
- 구현(Sonnet 4.6, 2026-06-10): index.html T14 카드(T13 카드 직후, 동일 BEM 구조) +13 / app.js 모듈변수 teamRadarChartInstance(L450)+renderTeamPhysiqueRadar()(renderAcwrScatterChart 뒤)+renderTeamDashboard 끝 호출 1줄 +82 / **style.css 변경 0**(T13 .dashboard-chart-card__* 전부 재사용). 삭제 0줄(순수 추가).
- 총괄 증거검토 GO(2026-06-10, 직접 재검증): ① node --check app.js·data.js 2 PASS ② 수정 2파일 한정(+work-plan 총괄)·style.css 0·금지파일 diff 0 ③ 추가라인 inline handler·localStorage·금지표현·자동판정문구·players 변형 메서드 전부 0(스캔 exit 1) ④ 평균 계산 NaN 경로 0 — Number.isFinite 필터+0명 키 null+소수2자리 반올림 ⑤ 포지션 분류 전수 보장 — (p.type||'투수') 기본값으로 pitchers+batters=assessed, 평가 선수 있으면 dataset 최소 1개 ⑥ 0명 분기 destroy+canvas 숨김+정적 안내(크래시 방지), 생성 전 destroy 선행 ⑦ 기존 radar 옵션 컨벤션 일치(r축 0~5/stepSize 1/Pretendard, getCssVar 기존 헬퍼 재사용) ⑧ renderTeamDashboard 변경=호출 1줄뿐 ⑨ /assessment-guide 링크 실파일 해소, canvas role/aria-label 보유.
- 보안/QA 결과(2026-06-10, 보안담당 Claude Opus 4.8 — 워킹트리 T14 diff 독립 검토, 커밋/Push 전): **GO**. BLOCKER/MAJOR/MINOR/NIT 0건. 브라우저 실사용: 미수행(표시 전용 집계 차트는 read-only 코드경로 정적추적+Chart.js canvas 렌더 특성으로 XSS·schema 무변경·NaN 미발생 확정, 정적 검증으로 충분).
  - 실행: `node --check` app.js·data.js 2 PASS / 금지경로 `git diff --stat`(data.js·style.css·tokens.css·docs.css·_headers·ads.txt·sitemap·robots·vendor·docs/evidence·docs/security·가이드/정책 HTML) = **0**(style.css 변경 0=T13 클래스 재사용 입증) / `git diff --numstat`(app.js 82/0·index.html 13/0 + work-plan).
  - 독립 확인: ① **players 원본 무수정** — 추가라인 `players.(sort|splice|reverse|push|pop|shift|unshift)` **0**. 집계=`players.filter(p=>p.scores)`+`.filter`+`.map`+`.reduce`(전부 새 배열·읽기만), localStorage write 0(schema 무변경) ② **XSS 0(T13보다 표면 작음)** — 신규 차트에 툴팁 콜백·playerName 렌더 **0**(스캔 무검출). labels=정적 LABELS(스프린트/스쿼트/…7항목 한글 리터럴), dataset label='투수 평균'/'타자 평균' 정적, data=수치 평균뿐(사용자 문자열 렌더 경로 없음). 무데이터 문구='초기 평가가 완료되면…' 정적 리터럴. canvas=정적 마크업(role="img"+aria-label) ③ **평균 NaN 미발생** — `p.scores[key]`를 `Number.isFinite(v)` 필터→빈 키 `return null`(0분모 차단)→`Math.round(avg*100)/100` 2자리. null은 radar 갭으로 처리(크래시 0) ④ **포지션 분류 전수** — player.type 도메인은 '투수'/'타자' 이진(나머지 검출 '구속'/'타격'/'투구'는 목표·지표 종류로 별개 컨텍스트), `(p.type||'투수')`로 pitchers+batters=assessed, 평가 선수 있으면 dataset≥1 ⑤ **인스턴스 destroy 선행** — 0명 분기(destroy+null+canvas 숨김+안내) + 생성 직전(`if(inst) inst.destroy()`) 양쪽 정리 → 중복·누수 0 ⑥ **금지표현·자동판정 0** — 추가라인 진단·치료·처방·보장·향상·예방·최적·취약·저하·위험판정 전부 0(§27 기각사유 준수=수치·차트만, 자동 "취약점/저하" 문구 없음) ⑦ **inline handler 0**(CSP-safe)·**신규 외부 리소스 0**(기존 Chart + getCssVar 헬퍼 L7 재사용) ⑧ **회귀 0** — renderTeamDashboard 변경=`renderTeamPhysiqueRadar()` 호출 1줄뿐(기존 삭제 0), 기존 radar 옵션 컨벤션 일치(r축 0~5/stepSize1/ticks 숨김/Pretendard), /assessment-guide 링크 실파일 해소.
  - [총괄 판단 요청] 없음.
  - [결론] **GO** — 3중 게이트(구현 Sonnet·총괄 증거검토·보안 독립) 통과, 총괄 커밋(main) + 사용자 Push origin 진행 가능.
- 사용자 실사용 피드백 보완(2026-06-10): "투수·타자 색상이 동일해 가독성 불량" → 원인=앱 테마에서 --primary가 var(--navy)로 재정의(L3904)되어 투수=네이비·타자=인디고(--info #3730a3) 동일 청색 계열. 조치=총괄 직접 수정(T11 NIT 선례, 색상값 4줄/삭제 2줄): 타자 dataset을 --warning-accent(#f59e0b 앰버)+rgba(245,158,11,0.20) 채움으로 교체, 양 dataset에 pointBackgroundColor 추가(점 색 일치). 검증=node --check PASS + 로컬 프리뷰 실렌더(테스트 선수 4명 시드): 캔버스 픽셀 분석 앰버 17,762px·블루 6,496px 동시 페인트 확인(색 분리 입증), 평균값 정확(투수 스프린트 3.5=(4+3)/2 등), 콘솔 오류 0, ACWR 카드 빈상태 정상(워크로드 무기록 시드라 안내 문구 표시), 테스트 데이터 정리 완료. diff=app.js 4/2뿐.
- 보안/QA 결과(색상 보완분, 2026-06-11, 보안담당 Claude Opus 4.8 — 워킹트리 독립 검토, 커밋/Push 전): **GO**. BLOCKER/MAJOR/MINOR/NIT 0건. 브라우저 실사용: 미수행(순수 표시용 색상 상수 변경 — 로직·데이터·schema 무관, 정적 검증으로 충분).
  - 실행: `node --check` app.js PASS / 금지경로 `git diff --stat`(data.js·style.css·tokens.css·docs.css·_headers·ads.txt·index.html·sitemap·robots·vendor·docs/evidence·docs/security·가이드/정책 HTML) = **0**(app.js+work-plan만) / `git diff --numstat` app.js 4/2.
  - 독립 확인: ① **변경=색상 상수뿐** — 타자 dataset borderColor `--info`→`--warning-accent`, backgroundColor rgba(blue 0.15)→rgba(245,158,11,0.20 앰버), 양 dataset에 `pointBackgroundColor` 추가. 계산·데이터 흐름·DOM 구조 무변경 ② **`--warning-accent` 토큰 정의 실재**(style.css L56 `#f59e0b`, getCssVar 해석 가능·미정의 0) ③ **회귀/부작용 0** — players·localStorage·schema 무관, 추가라인 inline handler·localStorage·금지표현·자동판정 0, XSS 표면 무변경(여전히 정적 라벨·수치만), getCssVar 기존 헬퍼 재사용·신규 외부 리소스 0.
  - [총괄 판단 요청] 없음.
  - [결론] **GO** — 표시용 색상 보완, 위험 0. 총괄 커밋(main) + 사용자 Push origin 진행 가능.
- 사용자 결정 보완 2(2026-06-11, 옵션 2 선택): 8번째 축 "풀업/사이드 점프" 추가 — 투수 dataset=pullup 평균, 타자 dataset=lateralBound 평균(겸용 축). calcAvgs(group, positionKey)로 확장, 카드 제목 "팀 피지컬 평균"+부제에 "풀업=투수 / 사이드 점프=타자" 명시. 총괄 직접 수정(app.js 7/5·index.html 2/2). 검증=node --check PASS+프리뷰 실렌더: 8축 라벨 확인, 투수 8축 3.5=(3+4)/2·타자 8축 4.5=(4+5)/2 정확, 콘솔 오류 0, 금지 스캔 0. ※검증 중 발견(코드 무관): 타자 lateralBound는 기존 1회성 정리 로직(L334~, 신기준 미표시 옛 점수 삭제)에 걸리면 null→8축 갭으로 표시되는데, 이는 "재측정 전 데이터 없음"의 정확한 표현이라 설계 일치(별도 조치 불요).
- 보안/QA 결과(8축 보완분, 2026-06-11, 보안담당 Claude Opus 4.8 — 워킹트리 독립 검토, 커밋/Push 전): **GO**. BLOCKER/MAJOR/MINOR/NIT 0건. 브라우저 실사용: 미수행(표시 전용 축 1개 추가 — read-only 집계·정적 라벨, 정적 검증으로 충분).
  - 실행: `node --check` app.js PASS / 금지경로 `git diff --stat`(data.js·style.css·tokens.css·docs.css·_headers·ads.txt·sitemap·robots·vendor·docs/evidence·docs/security·가이드/정책 HTML) = **0**(app.js+index.html+work-plan만) / `git diff --numstat`(app.js 7/5·index.html 2/2).
  - 독립 확인: ① **라벨/데이터 정합** — LABELS 8개(+'풀업/사이드 점프'), calcAvgs `[...KEYS, positionKey]`=7+1=8 반환 → 축·데이터 길이 일치(Chart.js radar 정합) ② **positionKey=하드코딩 상수** — `calcAvgs(pitchers,'pullup')`/`calcAvgs(batters,'lateralBound')` 문자열 리터럴(사용자 데이터 아님), XSS 표면 무변경(정적 라벨+수치만) ③ **평균 NaN 미발생 유지** — 8번째 키도 동일 경로(`Number.isFinite` 필터→빈 키 null→2자리 반올림), `p.scores['pullup'/'lateralBound']` undefined면 갭 처리(크래시 0) ④ **players 원본 무수정** — filter/map 읽기만, 추가라인 players 변형 메서드·localStorage·inline handler·금지표현·자동판정 전부 0 ⑤ **index.html=정적 텍스트만** — 카드 제목 "팀 피지컬 평균"+부제 "…풀업=투수 / 사이드 점프=타자"(중립 안내, 효능·판정 표현 0), 핸들러·스크립트 추가 0 ⑥ getCssVar 기존 헬퍼 재사용·신규 외부 리소스 0.
  - 참고(코드 무관): 타자 lateralBound가 기존 1회성 정리 로직으로 null이면 8축 갭 표시 — "재측정 전 데이터 없음"의 정확한 표현이라 설계 일치(조치 불요, 총괄 §검증과 동일 결론).
  - [총괄 판단 요청] 없음.
  - [결론] **GO** — 8축 표시 보완, 위험 0. 총괄 커밋(main) + 사용자 Push origin 진행 가능.
- **CLOSED(2026-06-11)**: 본체 커밋 16b1652 + 사용자 피드백 보완 548f31a(투수/타자 색상 대비: 타자 인디고→앰버) + 사용자 결정 보완 3f68141(8번축 풀업/사이드 점프 겸용) → 사용자 Push origin → Cloudflare 재배포 → 사용자 실사용 확인 완료. 보완 2건 포함 전 변경 3중 게이트 + 실사용 검증 통과. 티켓 종료.

30. T16 티켓 상세 — og:image 제작·적용 (2026-06-11, 총괄 설계 / 사용자 ㄱㄱ, 로드맵 ④ 해소)
- 배경: 13개 공개 페이지에 OG/Twitter 메타 완비(T2)이나 og:image만 부재 → SNS/메신저 공유 미리보기 이미지 없음. 기존엔 "에셋 준비 시"로 외부 대기였으나 T11 선례(favicon.svg→qlmanage PNG 변환·총괄 시각 확인)로 자체 제작 가능 판단.
- 설계:
  1) 에셋 제작(총괄 직접 — T11 아이콘과 동일하게 변환·시각검수 필요): og-image.svg 1200×630 디자인 — 네이비 #0b1220 배경, favicon 야구공 마크(#3b82f6) 확대 배치, "Baseball Lab S&C" 타이틀 + "야구 훈련 · 회복 · 워크로드 관리" 부제(시스템 폰트, 금지표현 0). qlmanage→sips로 site/og-image.png 1200×630 변환, 총괄 Read 시각 확인. 소스 SVG는 배포 불요 시 site에 미포함.
  2) 메타 적용(하위 에이전트 — 13페이지 균일 기계 삽입): 각 페이지 og:locale 줄 뒤에 5줄 추가 — og:image(절대 URL https://www.baseballlabsnc.com/og-image.png), og:image:width(1200), og:image:height(630), og:image:alt("Baseball Lab S&C — 야구 훈련·회복·워크로드 관리"), twitter:image(동일 절대 URL). 기존 `twitter:card` "summary"→"summary_large_image" 교체(1200×630 대형 이미지 표준 페어링, 페이지당 1줄 수정).
  3) 대상 13페이지 = og:title 보유 전체(index/about/contact/privacy/terms/가이드 8종). 404.html 제외(noindex·og 무).
- 수정 파일: site/og-image.png(신규), 13개 HTML(head 메타만). 수정 금지: app.js, data.js, *.css, _headers, ads.txt, sitemap.xml, robots.txt, 404.html, favicon.svg, vendor/**, docs/**.
- 제약: 메타 외 마크업 무변경, inline handler 0, 금지표현 0(이미지 텍스트 포함), PNG=정적 바이너리(스크립트 무관), URL=절대경로(크롤러 요건).
- 구현: 에셋=총괄 / 메타 삽입=Haiku(균일 13파일 기계 삽입, 정확 텍스트 제공) / 워크플로우: 3중 게이트 표준.
- 보안 검토 포인트(터미널용): ① 변경=head 메타 5추가+1교체×13p와 PNG 1개뿐(스크립트·핸들러 0) ② og:image 절대 URL 정확(자기 도메인, 외부 리소스 아님) ③ PNG 1200×630 정적 바이너리 ④ 금지표현 0(alt·이미지 문구) ⑤ 금지파일(404 포함) diff 0 ⑥ 기존 og/twitter 값 무변경(twitter:card 1줄 제외).
- 구현(2026-06-11): ① 에셋(총괄 직접): og-image.svg 1200×1200 정사각 설계(콘텐츠 중앙 630 배치)→qlmanage 변환→sips 중앙 크롭 1200×630 → site/og-image.png(84.7KB RGBA, 신규). 디자인=네이비 #0b1220+블루 야구공 워터마크+브랜드명+한글 헤드라인("야구 훈련 · 회복 · 워크로드 / 한곳에서 관리")+기능 목록, 총괄 Read 시각 검수 통과(잘림 0·금지표현 0). 1차 1200×630 직접 변환은 qlmanage 정사각 패딩으로 실패→정사각+크롭 우회. ② 메타(Haiku): 13페이지 각 6/1 — og:image·width·height·alt 4줄+twitter:image 1줄 삽입, twitter:card summary→summary_large_image 교체.
- 총괄 증거검토 GO(2026-06-11, 직접 재검증): ① PNG 1200×630 확정(sips)+시각 검수 ② 카운트 전수 13/13/13(og:image·twitter:image·summary_large_image), 잔존 content="summary" 0 ③ 13파일 균일 6/1, index diff 직접 열람=스펙 정확(절대 URL·들여쓰기 일치) ④ 404·app.js·data.js·css·_headers·sitemap diff 0 ⑤ 추가라인 script·핸들러·금지표현 0 ⑥ Haiku 보고 오기 1건(+7/-1로 보고, 실제 6/1) — 코드는 정상, 보고 수치만 부정확(메모리 교훈 재확인: diff 직접 검증). ※프리뷰 서버 종료로 HTTP 200 확인 생략 — 정적 파일 존재+경로 일치로 충분.
- 보안/QA 결과(2026-06-11, 보안담당 Claude Opus 4.8 — 워킹트리 T16 diff 독립 검토, 커밋/Push 전): **GO**. BLOCKER/MAJOR/MINOR/NIT 0건. 브라우저 실사용: 미수행(정적 head 메타+PNG 바이너리 — JS/CSS/레이아웃/인터랙션 무변경, 크롤러용 메타는 카운트·URL·도메인 정합 정적 검증으로 충분).
  - 실행: 금지경로 `git diff --stat`(app.js·data.js·*.css·_headers·ads.txt·sitemap·robots·404.html·favicon.svg·vendor·docs/evidence·docs/security) = **0** / `git diff --numstat`(HTML 13개 전부 균일 6/1 + work-plan) / `file`+`sips`(PNG 1200×630 RGBA) + PNG 시그니처 `89504e47`(순수 PNG, 실행 바이너리 흔적 0).
  - 독립 확인: ① **변경=head 메타 5추가+twitter:card 1교체×13p + PNG 1개뿐** — added 라인 `<script>`·inline handler(onclick/onerror/onload/javascript:) **0**(CSP-safe·XSS 0) ② **전수 카운트 13/13/13** — og:image·twitter:image·summary_large_image 각 13파일, 잔존 `content="summary"` **0**(교체 누락 0), 404.html 제외(diff 0) ③ **og:image 절대 URL 정확·도메인 정합** — `https://www.baseballlabsnc.com/og-image.png`, 기존 canonical/og:url `https://www.baseballlabsnc.com/`(www)와 **동일 도메인**이라 이미지 URL이 페이지와 같은 호스트에서 해소(외부 리소스 아님·자기도메인) ④ **PNG=정적 바이너리** 1200×630 RGBA(84.7KB), PNG 매직넘버 확인(스크립트 무관) ⑤ **금지표현 0** — og:image:alt "Baseball Lab S&C — 야구 훈련·회복·워크로드 관리" 및 added 라인 전체 진단·치료·처방·보장·향상·예방·최적·효과 0(중립 서술) ⑥ **기존 메타 무변경** — og:title/description/url/type/site_name/locale·twitter:title 등 불변, 변경은 og:image 5줄 신규 + twitter:card "summary"→"summary_large_image" 1줄(1200×630 대형 이미지 표준 페어링=의도된 교체)뿐 ⑦ **마크업 회귀 0** — head 메타 영역만 변경, body·구조·핸들러 무변경.
  - 참고: 프리뷰 HTTP 200 검증은 총괄이 서버 종료로 생략했으나, 정적 파일 site/og-image.png 존재+메타 절대경로(/og-image.png)+도메인 정합으로 배포 시 정상 해소 예상(Cloudflare 정적 서빙).
  - [총괄 판단 요청] 없음.
  - [결론] **GO** — 3중 게이트(에셋 총괄·메타 Haiku·보안 독립) 통과, 총괄 커밋(main) + 사용자 Push origin 진행 가능.
- 사용자 피드백 보완(2026-06-11, 미리보기 정상 확인 후 로고 교체 지시): og-image.png 브랜드 lockup을 사용자 제공 로고 스타일로 재제작 — "BASEBALL"(화이트)+"LAB"(민트 #57C79C), AvenirNextCondensed-Heavy 96px(컨덴스드 헤비체, 리터치 자연스러움 총괄 시각 검수), 야구공 아이콘 행 제거. 헤드라인·기능 부제는 무변경 유지(사용자 지시). 변경=site/og-image.png 바이너리 1개뿐(HTML·URL 무변경 — 동일 절대경로 재사용). 검증: 1200×630 RGBA 확정, 잘림 0, 금지표현 0.
- 보안/QA 결과(로고 보완분, 2026-06-11, 보안담당 Claude Opus 4.8 — 워킹트리 독립 검토, 커밋/Push 전): **GO**. BLOCKER/MAJOR/MINOR/NIT 0건. 브라우저 실사용: 미수행(정적 PNG 바이너리 1개 교체 — HTML/URL/코드 무변경, 무결성·메타·시각 검수로 충분).
  - 실행: 금지경로 `git diff --stat`(app.js·data.js·*.html·*.css·_headers·ads.txt·sitemap·robots·favicon·vendor·docs) = **0**(og-image.png+work-plan만) / PNG 무결성·청크·메타·시각 검수.
  - 독립 확인: ① **변경=og-image.png 바이너리 1개뿐** — HTML/메타/URL 무변경(동일 절대경로 /og-image.png 재사용=13p 메타 그대로 유효), 코드 0 ② **PNG 무결성** — 시그니처 `89504e47` OK, 1200×630 RGBA(IHDR+sips, og:image:width/height 메타와 일치), IEND 뒤 잔여=CRC 4바이트뿐(**은닉 payload 0**), 청크=IHDR/gAMA/cHRM/eXIf/iTXt/IDAT×5/IEND(표준, 실행/스크립트 청크 없음) ③ **정보노출 0** — eXIf/iTXt(XMP) 메타에 PII·로컬경로·사용자명·이메일 패턴 0(strings 스캔 무검출). ※XMP에 PixelYDimension=1200 잔존(정사각 소스 흔적)이나 실제 IHDR·표시·og 메타는 1200×630이라 크롤러 영향 0(무해) ④ **이미지 내용 정상** — 총괄 시각검수 교차확인: "BASEBALL"(화이트)+"LAB"(민트) 로고 lockup + 헤드라인 "야구 훈련·회복·워크로드 한곳에서 관리" + 기능 부제(초기평가·7일 스케줄·ACWR 추적·백업/복원), 네이비 배경+야구공 워터마크. **금지표현 0**(진단·치료·처방·보장·향상·예방·최적 없음, 중립 기능 서술), 잘림·깨짐 0.
  - [총괄 판단 요청] 없음.
  - [결론] **GO** — 정적 에셋 교체, 위험 0. 총괄 커밋(main) + 사용자 Push origin 진행 가능.
- **CLOSED(2026-06-11)**: 본체 커밋 2d50ce1(PNG+13p 메타) + 사용자 피드백 보완 4ff82bd(브랜드 로고 lockup 교체: BASEBALL 화이트+LAB 민트) → 사용자 Push origin → Cloudflare 재배포 → 사용자 실사용 확인 완료(미리보기 정상). 3중 게이트 + 실사용 검증 통과. 티켓 종료. 로드맵 외부 대기 중 og:image 해소 — 잔여 외부 대기=AdSense 승인 유일.

31. 인수인계 — Codex 총괄 복귀 (2026-06-11, 공백기 총괄 대행 Claude 작성)
- 공백기(2026-06-09~11) 처리 완료분: T9 a11y(4c45a6a) / T10 SEO(33034f5) / T11 빠른보완(ae278e5) / T12 선수 검색·정렬(715a190) / T13 ACWR 분포 차트(f187ef1) / T14 팀 평균 레이더(16b1652+548f31a+3f68141) / T16 og:image(2d50ce1+4ff82bd) — 전부 3중 게이트(구현→총괄 증거검토→보안 독립 GO)+사용자 실사용 검증 후 CLOSED. 각 상세 §23~§26·§28~§30.
- 외부 입력 처리: 제미나이 제안서 검토(§27) — 시각화 2건 선별 수용(T13·T14 완료), 코칭 메모는 T15로 등재(보류·대형·유일한 schema 변경 후보, 착수 전 정식 재설계 필수), 원안의 Recharts/CDN/Tailwind/금지표현/허위출처는 기각 기록.
- 현재 잔여 큐: ① AdSense 승인 대기(PRIMARY, 승인 시 §13 게재 확인) ② T15 코칭 메모(보류) ③ CSP 강화(AdSense 안정화 후) ④ PWA manifest(사용자 보류) ⑤ CSV 내보내기(실수요 미확인).
- 역할 원복(사용자 지시): Codex=총괄(티켓 설계·게이트 운영·커밋), Claude=근거조사·지원. 코드 작업 위임 기준(사용자 지시 2026-06-11): 무거운 작업=상위 모델 직접, 가벼운 작업=난이도에 맞는 하위 모델 에이전트.
- 운영 관행(공백기 확립, 유지 권장): ① 하위 에이전트 결과는 보고 아닌 git diff 직접 검증(§23 Haiku 사고·§30 보고 오기 사례) ② 위임 프롬프트에 git 되돌림 금지 명시 ③ 보안담당 터미널 독립 GO 후 커밋 ④ 사용자 실사용 확인 후 CLOSED ⑤ 금지표현·schema 무수정 원칙.

32. AdSense 승인 전 공개 사이트 상태·정책 정합 점검 1차 (2026-06-11, 총괄 Codex)
- 목적: AdSense 승인 대기 시간을 활용해 공개 배포 상태, 광고 심사 기본요건, 정책·저작권·안전 문구 정합성을 점검한다. 코드·사이트 파일 수정 없음.
- 공식 기준 확인: Google AdSense 사이트 준비 가이드(고유하고 관련성 있는 콘텐츠, 명확한 탐색, 원본 콘텐츠, 좋은 사용자 경험), AdSense 프로그램 정책(무효 클릭·클릭 유도 금지), Google 게시자 정책(불법·저작권 침해 콘텐츠 금지), AdSense 쿠키 안내(개인정보처리방침에 쿠키·광고 데이터 사용 고지 필요)를 기준으로 대조.
- 공개 배포 점검: `https://www.baseballlabsnc.com/` HTTP 200, sitemap URL 13개 전부 HTTP 200, `ads.txt`는 `google.com, pub-2911719487887723, DIRECT, f08c47fec0942fa0`로 확인, `robots.txt`는 전체 허용 및 sitemap 경로 포함, `og-image.png`는 1200×630 PNG로 확인.
- 정적 점검: `node --check site/app.js` PASS, `node --check site/data.js` PASS, AdSense script 13페이지, canonical 13페이지, og:image 13페이지, JSON-LD 13블록 파싱 PASS, inline handler 0건, 404 페이지는 noindex 유지 및 AdSense script 없음.
- 정책 문구 점검: `privacy.html`에 AdSense·쿠키·광고 식별자·Google 광고 설정 안내 존재, `terms.html`에 광고 클릭 유도 금지와 안전 고지 존재, `contact.html`에 광고·개인정보 문의 경로 존재. 광고 클릭 유도 문구는 금지 선언 1건 외 0건.
- 안전·저작권 점검: 치료·처방·진단·보장·최적·부상 예방·성과 향상 관련 검출분은 모두 부정형 면책·안전 고지 문맥으로 확인. 신규 외부 저작물·장문 인용·출처 불명 이미지 도입 없음.
- 결론: 승인 전 현재 상태에서 추가 코드 수정 필요 없음. 승인 대기 중에는 큰 구조 변경, 광고 위치 실험, schema 변경, 의료·성과 보장성 문구 추가를 피한다.
- 다음 트리거: AdSense 승인 시 §13 게재 확인과 광고 노출 위치 점검으로 이동. 거절 시 거절 사유 원문을 기준으로 수정 티켓을 작성한다.

33. AdSense 승인 전 정책 접근성 보강 — 가이드·정책 페이지 문의 링크 일관화 (2026-06-11, 총괄 Codex)
- 배경: §32 후속 세부 점검에서 신규 가이드(rpe/acwr/training/warmup/fielding)는 하단 `doc-links`에 `/contact`가 있으나 기존 3개 가이드(`assessment-guide.html`, `recovery-guide.html`, `workload-guide.html`)는 `/privacy`, `/terms`까지만 있어 문의/지원 접근성이 불균일했다. 추가 확인에서 핵심 정책 페이지(`privacy.html`, `terms.html`)도 하단 `doc-links`가 없어 앱 메인·가이드·문의 이동성이 약했다.
- 변경: 기존 3개 가이드에는 `이용약관 및 안전 고지` 뒤에 `<a href="/contact">문의/지원</a>`를 추가했다. `privacy.html`, `terms.html`에는 `doc-note` 뒤 하단 `doc-links`를 추가해 앱 메인, 서비스 소개, 주요 가이드, 상호 정책 페이지, 문의/지원으로 이동 가능하게 했다. 본문 의미, meta, AdSense script, canonical, JSON-LD, CSS, JS, data, schema 변경 없음.
- 검증: 앵커 내부 링크 검사 `anchor_link_issues=0`, `node --check site/app.js` PASS, `node --check site/data.js` PASS, 5개 보강 파일 `/contact` 링크 각 1건 확인, inline handler 0건.
- 결론: AdSense 심사 관점의 정책·문의 접근성 일관성 보강 완료. 승인 대기 중 추가 대형 기능 변경은 보류한다.

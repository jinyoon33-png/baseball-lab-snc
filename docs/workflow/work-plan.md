1. 요청 요약
- 활성 티켓: `T10 SEO 콘텐츠 확장` — 3중 게이트(구현 Sonnet·총괄 증거검토·보안 독립) 전부 **GO(이슈 0건)**. 총괄 커밋(main) → **사용자 Push 대기**. 커밋 후 활성 티켓 없음(다음 트리거: AdSense 승인 보고 / 신규 지시). 상세 §24. (T9 a11y=GO·커밋 4c45a6a, T8 CLOSED.)
- 현재 단계: `[T1~T8 완료·전부 보안 GO·push·배포 완료(origin/main=12e4733). T8=백업 리마인더 구현(Sonnet)+데스크탑 레이아웃 수정(Haiku)+총괄 증거검토 GO+보안 독립 GO(NIT1)+총괄 정밀 재검증 GO → 커밋 9ad04a2 → push·Cloudflare 재배포 → 실도메인 배너 정상 작동 확인(사용자, 2026-06-08). 티켓 종료. 잔여 NIT1(배너 role/aria 혼용)=§14 LATER a11y. 병행 외부 대기: AdSense 승인/og:image]`
- 병행 대기(외부): AdSense 승인 심사(§9~13). 승인 후 실광고 판단.
- 담당: 총괄 Claude(Opus) 설계·검증 / Sonnet 4.6 하위 에이전트 구현.
- 직전 완료(배포됨): ① 가이드 3종 보강(§9, 커밋 ae5ba94) ② 약관 광고 고지 정합+날짜 통일(§10) ③ AdSense 자동광고 콘솔 설정(§12).
- 다음 트리거: 사용자가 "AdSense 승인 완료" 보고 시 → 게재 확인(§13) + 선택적 수동 광고 단위 정밀화.

2. 대상 파일
- 수정 허용: `site/assessment-guide.html`, `site/recovery-guide.html`, `site/workload-guide.html`, `docs/workflow/work-plan.md`
- 읽기 허용: 기타 `site/*-guide.html` (문체 참고)
- 수정 금지: `site/app.js`, `site/data.js`, `site/style.css`, `site/docs.css`, `site/tokens.css`, `site/_headers`, `site/ads.txt`, `site/index.html`, `site/sitemap.xml`, `site/robots.txt`, 기타 공개 HTML, `site/assets/**`, `site/vendor/**`, `docs/evidence/**`, `docs/security/**`

3. 파일별 보강 설계 (총괄 Claude)
[assessment-guide.html] — 현재 4섹션 → 6섹션
- 신규 §02 "평가 전 준비와 측정 일관성"(§01 뒤 삽입): 측정 전 컨디션·웜업·시간대·평가자·장비를 일정하게 맞춰야 점수 비교가 의미 있다. 측정 직전 고강도 훈련은 피한다.
- 신규 §06 "기록 비교로 변화 읽기"(맨 끝, 재평가 주기 뒤): 단일 점수보다 같은 선수의 이전 기록과 비교한다. 영역별 변화 폭이 다를 수 있고, 절대값보다 추세를 본다.
- 기존 §02~04 → §03~05로 번호 재정렬.

[recovery-guide.html] — 현재 4섹션 → 6섹션
- 신규 §03 "회복 기록을 해석하는 법"(§02 '4가지 항목' 뒤): 각 항목이 며칠 연속 나빠지는 패턴을 추세로 읽고, 다음 훈련 전 확인 신호(통증 잔존·수면 회복·피로 누적)를 점검한다.
- 신규 §05 "학생선수·동호인 적용 시 주의"(통증 행동 원칙 뒤): 미성년 자기보고 특성, 보호자·지도자 동석, 주말 동호인의 불규칙 일정에서도 같은 기준을 유지한다.
- 기존 §03(통증)→§04, §04(루틴)→§06으로 재정렬.

[workload-guide.html] — 현재 4섹션 → 6섹션
- 신규 §03 "입력 예시로 보는 워크로드 계산"(ACWR 설명 뒤): 구체 예시(투수 불펜 50구 RPE 6 → 300, 다음날 실전 80구 RPE 8 → 640, 주간 합계로 누적 흐름 보기). 숫자는 계산 방식 예시일 뿐 권장 임계값이 아님을 명시.
- 신규 §05 "코치·보호자와 함께 보는 법"(활용 섹션 뒤): 숫자 단독 판단을 피하고 컨디션 메모를 함께 보며 정기적으로 리뷰한다.
- 기존 §03(활용)→§04, §04(한계)→§06으로 재정렬.

4. 표현 제한
- 의료 진단·치료·처방 표현 금지(부정형 안전 고지 "~이 아니다/대체하지 않는다"는 허용).
- 부상 예방 보장, 성과 향상 보장, 자동 위험 판정, 최적화 표현 금지.
- ACWR/RPE 숫자 임계값 직접 처방 금지. "참고 신호", "확인", "조정 고려" 수준만 사용.
- 외부 자료 장문 인용 금지. 예시 숫자는 계산 방식 설명용이며 권장 임계값이 아님을 본문에 명시.
- 기존 `doc-note`·`doc-links`·`doc-meta`·`canonical`·AdSense script·`description` meta는 그대로 유지(수정 금지).

5. 정적 검증 명령 (총괄 재실행)
- `node --check site/app.js`
- `node --check site/data.js`
- `wc -w site/assessment-guide.html site/recovery-guide.html site/workload-guide.html`
- `rg -n "진단|치료|처방|보장|부상 예방|성과 향상|최적화|자동 위험 판정" site/assessment-guide.html site/recovery-guide.html site/workload-guide.html docs/workflow/work-plan.md`
- `rg -c "<h2>" site/assessment-guide.html site/recovery-guide.html site/workload-guide.html` (각 6)
- `rg -n "adsbygoogle|rel=\"canonical\"" site/assessment-guide.html site/recovery-guide.html site/workload-guide.html` (각 유지)
- `git diff --stat -- site/app.js site/data.js site/style.css site/docs.css site/tokens.css site/_headers site/ads.txt site/index.html site/sitemap.xml site/robots.txt site/assets site/vendor docs/evidence docs/security` (0)

6. 완료 조건
- 3개 파일 각각 섹션 2개 추가(총 6섹션), `h-num` 번호 01~06 연속 정렬.
- 금지 표현 사용자 노출 0(부정형 안전 고지 제외).
- 단어 수가 의미 있게 증가(얕은 채우기 아님).
- AdSense script·canonical·doc-note·doc-links·meta 보존.
- 수정 금지 경로 diff 0.

7. 작업 지침
- 구현: Sonnet 4.6 하위 에이전트. 설계(§3)대로 정확히, 기존 문체·HTML 구조(`h2`+`span.h-num` 패턴, `doc-note`, `doc-links`)를 그대로 따른다.
- 총괄 Claude: 구현 후 §5 재실행으로 독립 검증, 통과 시 work-plan §8에 결과 기록.
- 사용자: 검증 통과 후 GitHub Desktop `Push origin` 수행.

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
  ② [🟢 지금 가능·S] T9 a11y 접근성 폴리시(§14) — 외부 의존 0, 저위험. 대기 중 손쉬운 품질 보강(권장 Haiku).
  ③ [🟢 지금 가능·M·설계필요] T10 SEO 콘텐츠 확장(§14) — 오가닉 SEO + AdSense 승인 심사에 긍정적. evidence rules 엄수, ㄱㄱ 시 플랜모드 재진입 설계.
  ④ [🟡 에셋 대기·S] og:image PNG 13p 일괄 — 1200×630 PNG 준비 시 og:image/twitter:image 메타 13페이지 삽입(§16 후속).
  ⑤ [🟡 AdSense 안정화 후·M-L] _headers CSP 강화 — unsafe-inline/eval 축소·nonce. 자동광고 요건과 트레이드오프(§17 NIT 후속).
  ⑥ [⏸️ 사용자 결정 보류] PWA manifest 홈화면 — "앱 출시" 시점에 진행(사용자 결정).
- 총괄 권장: 외부 의존 없는 ②T9(즉시·저위험) → ③T10(AdSense·SEO 도움) 순. ①은 Google 승인 떨어지면 최우선 전환.
- 본 로드맵은 문서 정리 전용(2026-06-09): 코드 변경 0. T9/T10 실제 착수는 Codex 복귀 또는 사용자 ㄱㄱ 신호 시. 3중 게이트(구현→총괄검증→보안) 워크플로우 동일 적용.

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

1. 요청 요약
- 활성 티켓: `공개 메인(index) 가이드 내부 링크 누락 보정 1차` (T1, 백로그 §14)
- 현재 단계: `[Step 2. 완료 — T1 검증 OK. 다음: T2(SEO 점검)/T3(보안QA) 대기]`
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
- 역할 분담: 총괄 Claude(티켓 작성·선정, 위임, 재검증, work-plan 관리, 배포 확인) / Sonnet 4.6 하위 에이전트(코드·콘텐츠 구현) / 사용자(GitHub Push, AdSense 콘솔).
- Codex 복귀 시 본 메모 + work-plan + git 이력으로 그대로 이어받음.
- 직전 완료 티켓: `키 필수 표시·검증 GitHub push·Cloudflare 재배포 확인 1차` — 공개 도메인 반영 전부 확인(HEAD 1969c76), 이슈 0건.
- 인프라 스냅샷: CSP 정적 fallback(`script-src 'self' 'unsafe-inline' 'unsafe-eval' https:`), nonce 미들웨어 폐기(`4218f3e`). 광고 연결 스크립트 13개 HTML head 삽입 완료, 광고 단위(`ins.adsbygoogle`) 미게재(자동광고/승인 후 단계), ads.txt 게시 완료.

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
- T2 [대기]: 전체 SEO/메타 점검 — description·OG·sitemap·structured data 정합성.
- T3 [대기]: 보안/QA 재점검 — 자동광고 연결 후 CSP·외부 스크립트·localStorage·입력 검증.
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

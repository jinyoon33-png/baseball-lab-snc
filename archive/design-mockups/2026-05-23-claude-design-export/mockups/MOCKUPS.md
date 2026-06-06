# Mockups — Claude Code 작업용 시안 21종

이 폴더는 Claude Code가 베이스볼 랩 코드베이스에서 작업할 때 **시각적 참고**로 쓰는 시안 모음입니다. 각 PNG는 풀해상도 원본이며, `index.html`을 열면 한 화면에 모두 탐색할 수 있습니다.

## 빠른 사용법 (Claude Code)

작업 중 시안을 봐야 할 때:
- "S3 결과·스케줄 화면처럼 만들어줘" → `mockups/07-s3-dt-result-schedule.png` 참고
- "컨디션 입력 모달처럼 만들어줘" → `mockups/13-m1-dt-wellness.png` + `mockups/14-m1-mb-sheet.png`
- "문서 페이지 레이아웃" → `mockups/20-doc-assessment-guide.png` + `snippets/10-doc-page.html`

## 화면 → 컴포넌트 → 소스 매핑

각 시안이 어떤 클래스로 만들어졌고, 어떤 스니펫을 참고해야 하는지 정리:

| # | 시안 | 핵심 컴포넌트 | 참고 스니펫 |
|---|---|---|---|
| 01 | **토큰 시트** | `tokens.css` 전체 | — |
| 02 | **컴포넌트 시스템** | `.btn` `.badge` `.chip` `.field` `.rpe-bar` `.player-row` `.stat-val` | `01–08` |
| 03 | **Hero · 데스크톱** | `.hero-data` `.btn-navy` `.eyebrow` + 인라인 카드 | `06-acwr-hero` `01-buttons` |
| 04 | **Hero · 모바일** | 동일 + `.card` `.brand` | — |
| 05 | **S1 · 선수 등록·목록** | `.card` `.player-row` `.toggle` `.fields-2` `.chip` + 4단계 진행 표시 | `02-card` `03-player-row` `05-form-field` |
| 06 | **S2 · 8종목 정밀평가** | `.cl-assess-card` `.cl-assess-input` `.cl-assess-bar` `.cl-assess-progress` | `(direction-clinical-3.jsx)` |
| 07 | **S3 · 결과·스케줄** | `.hero-data` `.week-list` `.week-row.today` 8종목 레이더 + 구속 추이 | `06-acwr-hero` `08-schedule` |
| 08 | **S4 · 코치 대시보드** | `.cl-kpi` `.cl-action` `.badge.{watch\|risk}` ACWR 분포 히스토그램 | `04-badge-chip` |
| 09 | **S1 · 모바일** | `.cl-mobile` `.cl-tabbar` `.chip` `.card-tight` | `03-player-row` |
| 10 | **S2 · 모바일 스테퍼** | 1종목 풀스크린 + 진행 점 | — |
| 11 | **S3 · 모바일** | `.hero-data` 축소 + 오늘 카드 (다크 ink) | — |
| 12 | **S4 · 모바일** | KPI 2×2 그리드 + 액션 큐 리스트 | — |
| 13 | **M1 · 컨디션 (DT)** | `.modal` `.modal-head` `.range` `.chips` `.doc-note` | `09-modal` `05-form-field` |
| 14 | **M1 · 바텀시트 (MB)** | `.sheet` + 동일 본문 | `09-modal` 하단 주석 |
| 15 | **M2 · 워크로드 (DT)** | `.modal` `.rpe-bar` AU 계산 박스 | `07-rpe-strip` `09-modal` |
| 16 | **M2 · 바텀시트 (MB)** | `.sheet` + 동일 본문 | — |
| 17 | **M3 · 운동 가이드** | `.modal`(720) `.cl-guide-media` `.cl-guide-steps` `.cl-guide-cue` `.cl-evidence-bar` | — |
| 18 | **M4 · 운동 대체** | `.modal`(600) `.cl-swap-card` `.cl-swap-radio` 라디오 카드 그룹 | — |
| 19 | **M5 · 앱 사용 가이드** | `.modal`(780) `.cl-tabs-list` `.cl-quickstart` 3-step `.cl-faq` | — |
| 20 | **Doc · 활용 가이드** | `.doc-header` `.doc-wrap` `.doc-h1` `.doc-lead` `.doc-meta` `.doc-body` `.doc-note` `.doc-warn` `.doc-table` `.doc-postscript` `.doc-foot` | `10-doc-page` |
| 21 | **Doc · 이용약관** | 동일 + `.doc-danger` (의료 도구 아님 고지) | `10-doc-page` |

## 디자인 결정 메모 (Claude Code가 알면 좋은 것)

### 데이터 밀도
- 데스크톱: Comfortable — 카드 내부 패딩 24px, 카드 간 gap 20–24px
- 모바일: 동일 컴포넌트지만 더 큰 터치 타깃, 한 화면 1–2 의사결정

### 시그널 라벨 (의료 톤 회피)
- 정상 (green/sage) — ACWR 0.8–1.3
- 주의 (amber/ochre) — ACWR 1.3–1.5
- 초과 (coral, **빨강 아님**) — ACWR 1.5+
- 여유 (gray muted) — ACWR 0.4–0.8

### 카피 톤
- "참고 지표" "확인" "전문가 상담 권장" "기록·추적·관리"
- 진단·치료·예측·예방·최적 같은 단어는 **모든 시안에서 한 번도 안 씁니다**
- 약관 페이지(시안 21)에 "이 앱은 의료 도구가 아닙니다" 명시

### 모달 vs 바텀시트
- 데스크톱: `.modal` 중앙 정렬 — 폭은 컨텐츠 양에 따라 560/600/640/720/780
- 모바일: `.sheet` 바닥 고정 + drag handle (시각용, JS 없음) — max-height 82vh
- 두 변형 모두 동일 본문 마크업 공유 (`.modal-head` `.modal-body` `.modal-foot`)

### 문서 페이지 마스터
- 단일 컬럼, `max-width: 720px`
- 본문 16px / line-height 1.7 (앱 본문은 13.5px / 1.55 — 가독성 차이)
- H2에 번호 태그 `<span class="h-num">01</span>`
- 인라인 박스 3종: `.doc-note`(navy 정보) / `.doc-warn`(amber 주의) / `.doc-danger`(coral 의료 면책)
- 페이지 끝에 `.doc-postscript`(in-page CTA) + `.doc-foot`(prev/next 내비)

## 7개 문서 페이지 일관성

샘플 2종(활용 가이드, 이용약관)에서 보이는 구조는 나머지 5종에도 그대로 적용:

1. `about.html` — 서비스 소개
2. `assessment-guide.html` ✅ (샘플 #20)
3. `recovery-guide.html` — 등판 후 회복 기록
4. `workload-guide.html` — ACWR/RPE 이해
5. `contact.html` — 문의·지원
6. `privacy.html` — 개인정보처리방침
7. `terms.html` ✅ (샘플 #21)

각 페이지마다 다른 것은 본문 콘텐츠뿐이며, `.doc-header` 우측 nav의 active 표시(`color: var(--ink); font-weight: 600`)만 바꿔 줍니다.

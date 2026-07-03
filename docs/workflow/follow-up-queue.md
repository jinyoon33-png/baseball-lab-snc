# Follow-Up Queue

> 2026-05-25 총괄 Codex 복귀 검증 후 정리. 디자인 결정 사항 3건(equip, 다크모드, 본문 폰트 사이즈)은 처리 완료.

## 현재 활성 큐

- `앱 제품 우선 전환 묶음` — 활성. 첫 진입을 설명형 랜딩이 아니라 앱 화면으로 전환하고, PWA/Android 앱화 준비를 순차 진행한다. 현재 첫 티켓은 `docs/workflow/work-plan.md`의 `루트 진입 앱 전환 1차`다.
- `AdSense 콘텐츠 가치 보강 묶음` — 보류. 앱 제품 우선 전환 중에는 AdSense 승인을 최우선 목표로 두지 않는다. 공개 가이드와 정책 문서는 유지하되, 루트 앱 UX를 흔드는 광고 승인용 구조 변경은 중단한다.
- `앱 전환 로드맵 후속 결정` — 진행 방향 확정. 우선순위는 `루트 앱 진입 → PWA manifest → Android 앱화 검토 → 로그인/구독 v2 설계`다.
- `도메인/운영자 연락처 확정 후 SEO 구현 1차` — 차단. 최종 도메인과 운영자 이메일 확정 후 sitemap/canonical/robots Sitemap 지시문을 구현한다.
- `AdSense 코드 삽입 전 보안/QA 1차` — 차단. 실제 광고 코드/분석 코드 삽입 직전에 보안/QA Claude가 외부 스크립트, CSP, 개인정보/약관, 광고 배치 정책을 점검한다.

---

## AdSense/출시 준비 체크리스트

### 0. 현재 상태
- 공개 HTML: 15개(`index`, `guides`, `about`, `workload-guide`, `recovery-guide`, `assessment-guide`, `rpe-guide`, `acwr-guide`, `training-program-guide`, `warmup-shoulder-guide`, `fielding-baserunning-agility-guide`, `privacy`, `terms`, `contact`, `404`).
- 현재 허용: `site/robots.txt`는 전체 허용 + sitemap 지시문 포함.
- 현재 적용: `sitemap.xml`, canonical, JSON-LD, AdSense 코드, ads.txt, OG/Twitter 메타, og:image.
- 현재 전략: AdSense 승인은 후순위로 두고 앱 제품 전환을 우선한다. 공개 문서의 AdSense/SEO 기반은 유지하되 root 진입은 앱 UX 중심으로 재정렬한다.
- 현재 이슈: AdSense 승인 상태가 `주의 필요`, 세부 사유가 `가치가 별로 없는 콘텐츠`. `ads.txt`는 승인됨.
- 정책 문서: `privacy`, `terms`, `contact`는 광고/분석 도입 및 운영자 이메일 고지를 반영한 상태다.

### 1. AdSense 재검토 전 금지
- 검증 없이 AdSense 스크립트, ads.txt, robots.txt, sitemap.xml, canonical을 임의 변경하지 않는다.
- 앱 조작 화면, 저장/삭제/복원/워크로드 입력/평가 저장 주변에 수동 광고 단위를 넣지 않는다.
- `치료`, `처방`, `진단`, `보장`, `최적`, `부상 예방`, `성과 향상`, `부상 예측`, `위험 판정` 표현을 긍정·단정 문맥으로 추가하지 않는다.
- 저장 schema(`pLDB_v4_5`), 백업/복원, `site/data.js`는 콘텐츠 보강 티켓에서 수정하지 않는다.

### 2. 현재 확정값
- 최종 도메인: `https://baseballlabsnc.com`.
- 운영자 이메일: `jim3422@naver.com`.
- 배포 호스트: GitHub 저장소 + Cloudflare 배포.
- 광고 배치 원칙: 공개 가이드 문서 본문 중간/하단만 후보. 앱 조작 화면, 저장/삭제/복원/워크로드 입력/평가 저장 주변은 금지.
- 추가 검토 필요: `baseballlabsnc.com`과 `www.baseballlabsnc.com` 중 대표 도메인 1개로 301 정규화할지 결정.

### 3. AdSense 재검토 전 작업
- `docs/workflow/work-plan.md`의 `7-6. AdSense 콘텐츠 가치 보강 티켓 큐` 순서대로 공개 가이드를 확장한다.
- 대표 도메인 정규화 방식을 결정하고 canonical/sitemap/og:url과 맞춘다.
- Search Console에서 sitemap 제출 상태와 색인 가능 상태를 확인한다.
- 콘텐츠 보강 완료 후 모바일/데스크톱 브라우저 실사용 QA를 수행한다.
- 최종 QA 통과 후 AdSense 콘솔에서 `문제를 수정했음을 확인합니다` 체크 후 `검토 요청`한다.

### 4. AdSense 신청/광고 코드 전 작업
- Google AdSense site readiness 기준으로 고유 콘텐츠, 명확한 내비게이션, 정책 페이지 접근성을 재확인한다.
- Google AdSense Program policies와 Ad placement policies 기준으로 클릭 유도, 앱 조작 영역 주변 광고, 콘텐츠와 혼동되는 광고 배치를 금지한다.
- Google Required content 기준으로 쿠키/제3자 광고 기술 고지를 개인정보처리방침에 최종 반영한다.
- 실제 광고 코드 삽입 전 보안/QA Claude 호출: 외부 스크립트, CSP, inline handler, 개인정보/약관 정합성, 광고 slot 위치, 모바일 레이아웃 회귀를 점검한다.

### 5. 공식 기준 링크
- Google AdSense site readiness: https://support.google.com/adsense/answer/7299563
- Google AdSense Program policies: https://support.google.com/adsense/answer/48182
- Google Ad placement policies: https://support.google.com/adsense/answer/1346295
- Google AdSense Required content: https://support.google.com/adsense/answer/1348695
- Google robots.txt reference: https://developers.google.com/search/reference/robots_txt
- Google sitemap guide: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- Google canonical guide: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls

---

## 처리 완료로 큐에서 제외한 항목

- `웹 출시 전 공개 문구·근거 정합성 보정 묶음` (2026-06-05~06): `workload-guide` ACWR 숫자 임계값 공개 문구 보정, `recovery-guide` 수면·회복 단정 표현 완화, 운동 가이드 금지 표현 스윕, 준비운동·어깨 가동성 공개 문서, 수비·주루·민첩성 공개 문서, 웹 출시 전 보안/QA 최종 점검까지 완료.
- `품질 안정화 회귀 QA 묶음 1차` (2026-06-05): 메인 앱 등록→평가→스케줄, 주간/월간 전환, 운동 가이드/대체/워크로드 모달, RPE 11셀, 선수 수정 모달, 공개 문서 11개와 모바일 390px overflow를 확인. BLOCKER/MAJOR/MINOR/NIT 0건.
- `야구 S&C 훈련 프로그램 구성 가이드 브라우저 실사용 확인 1차` (2026-06-05): 신규 공개 문서와 기존 공개 문서 링크 실제 브라우저 로드 확인. 404/Not Found 0건, 모바일 overflow 0건, console error/warning 0건.
- `야구 S&C 훈련 프로그램 구성 가이드 구현 1차` (2026-06-05): `site/training-program-guide.html` 신규 생성과 기존 공개 문서 링크 연결 완료. 정밀검토 결과 BLOCKER/MAJOR/MINOR/NIT 0건, 면책 문맥 금지어 매칭 3건은 부정·면책 문맥으로 분류.
- `공개 콘텐츠 확장 후보 설계 1차` (2026-06-05): 다음 공개 문서는 `야구 S&C 훈련 프로그램 구성 가이드`로 선정. 활성 근거문서의 일반 야구 S&C·훈련 매칭·matchTags 설명 기준을 바로 활용 가능하고, 회복 가이드는 이미 존재하며 준비운동/수비·주루는 후순위로 보류.
- `AdSense/출시 준비 체크리스트 작성 1차` (2026-06-05): 도메인/연락처 확정 전 금지, 확정 후 SEO 작업, 광고 코드 전 보안/QA 호출 조건을 단계별로 정리 완료.
- HTML 클래스명 풀 리네임 (2026-05-27): 영향도 조사 결과 전면 리네임 보류. 현재 class는 JS selector와 동적 template의 안정 API로 유지하고, 필요한 화면만 영역별 alias 방식으로 진행.
- `.brand-mark` 시안 미니 로고 패턴 (2026-05-27): `hero-mark` class 유지 + 텍스트 `B` + corner accent 방식으로 구현. 보안/QA PASS, 사용자 실사용 정상 확인.
- 운동 가이드/대체/앱 가이드 모달 `.cl-*` 신규 클래스 (2026-05-27): v1 class-additive 방식으로 8개 class 도입. 보안/QA PASS, 사용자 실사용 정상 확인. `cl-tabs-list`는 v2 별도 설계로 보류.
- RPE 입력 `.rpe-bar` 11셀 그리드 도입 (2026-05-26): 기존 hidden `#wlRPE` input 호환 유지 + 11셀 버튼 UI 적용. 보안/QA PASS, 사용자 실사용 정상 확인.
- 7일 스케줄 시안 `.week-list / .week-row.today` 패턴 (2026-05-26): B2 방식으로 `renderWeeklyCalendar` 보조 보기만 `.week-list` 행 구조로 전환. 월간→주간 잔존 표시 버그 보정 후 사용자 실사용 정상 확인.
- 8종목 평가 `.cl-assess-card` 도입 (2026-05-26): `renderAssessmentForm`에 `.cl-assess-card`/`.cl-assess-input` 보수적 도입 완료. 보안/QA PASS, 사용자 실사용 중 발견된 다크모드 대비 이슈도 후속 보정 완료.
- 본문 폰트 사이즈 실사용 검토 (2026-05-25): 사용자 회신 `모두 정상`. 인터랙티브 13.5px / 문서 16px 유지, 보정 티켓 불필요.
- 다크모드 도입 (2026-05-25): prefers-color-scheme 자동 적용. site/tokens.css L179-217에 `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { ... } }` 블록 추가. `[data-theme="dark"]` 강제 블록 + `data-theme="light"` 라이트 강제도 동시 지원.
- equip 12색 유지/통일 디자인 결정: 절충안으로 처리 완료. 카테고리 식별성 유지 + 채도 낮춤 + text `var(--ink-2)` 통일.
- `.doc-note` 어두운 amber 텍스트 매핑: `site/docs.css`에서 `.doc-note` 색상이 `var(--ink-2)`로 통일되고 보정 주석이 존재함.
- `.player-velo-box` 보조 토큰 매핑: `site/style.css`에서 `--success-surface-soft`와 `--success-border`가 하단 alias로 매핑됨.

## 운영 메모

1. 현재 Stage 5 디자인 잔여 큐는 0개다.
2. 이후 시안 class 추가는 전면 리네임이 아니라 화면 단위 alias 방식만 허용한다.
3. 5/24 적용된 모든 변경은 `archive/root-file-backups/site-snapshot-2026-05-24-*/` 8개 시점 스냅샷으로 롤백 가능하다.

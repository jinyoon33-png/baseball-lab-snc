# Baseball Lab S&C — Clinical Trust · Design Export

**Direction**: B · Clinical Trust  
**Version**: 0.1.0  
**Exported**: 2026-05-23  
**Source**: Claude Design — Direction B (확정 후 export)

이 폴더는 `claude.ai/design` Direction B 시안의 디자인 토큰·컴포넌트·HTML 스니펫을 한 패키지로 묶은 것입니다. 코드베이스의 `site/style.css`를 이 토큰으로 교체하거나, 새 컴포넌트 추가 시 이 명세를 그대로 따르세요.

---

## 파일 구성

| 파일 | 용도 |
|---|---|
| `README.md` | 이 파일 |
| `tokens.json` | 디자인 토큰 (W3C DTCG 형식). Figma/Tokens Studio·Style Dictionary 등 디자인 툴 import용 |
| `tokens.css` | CSS 변수 형태로 동일 토큰 — 라이트/다크 둘 다. **앱 진입점에서 첫 번째로 import** |
| `components.css` | `.btn`, `.card`, `.player-row` 등 프로덕션 클래스 정의. `tokens.css` 변수 참조 |
| `snippets/01–10` | 각 컴포넌트의 사용 예시 HTML (복붙용) |
| `mockups/` | **Claude Code 시각 참고용 — 21개 화면 풀해상도 PNG + 그리드 뷰 + 매핑표** |
| `index.html` | 위 셋을 모두 로드해 모든 스니펫을 미리보기 |

작업 시작 시 `mockups/index.html`을 먼저 열어 화면 단위 시안을 한 번 훑고, 구체적인 컴포넌트 마크업은 `snippets/`에서 가져오는 흐름을 권장합니다.

---

## 5분 통합 가이드

### 1. CSS 두 줄 추가

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="components.css">
```

순서가 중요합니다 — `tokens.css`가 먼저, `components.css`가 다음.

### 2. 다크 모드는 속성 한 줄

```html
<html data-theme="dark"> ... </html>
```

`tokens.css`에 `[data-theme="dark"]` 오버라이드가 정의돼 있어, 컴포넌트는 그대로 다크 모드로 전환됩니다.

### 3. 기존 `style.css`의 컬러/타이포 변수를 이 토큰으로 1:1 매핑

`site/style.css`에 `--primary`, `--accent`, `--text` 같은 변수가 있다면 다음 매핑을 적용하세요:

| 기존 변수 | 새 변수 |
|---|---|
| `--primary` | `--navy` |
| `--text` | `--ink` |
| `--text-muted` | `--mute` |
| `--bg` | `--bg` |
| `--card-bg` | `--surface` |
| `--border` | `--rule` |
| `--success` | `--safe` |
| `--warning` | `--watch` |
| `--danger` | `--risk` |
| Forest Green `#2d6a4f` | 폐기, `--navy #1F4585`로 교체 |
| `#f4f5f2` (off-white) | `--bg #F5F6F8` |

### 4. 컴포넌트 클래스 교체

기존 클래스 → 새 클래스:

| 기존 (추정) | 새 |
|---|---|
| `.button`, `.btn-prim` | `.btn .btn-navy` |
| `.player-card`, `.player-list-item` | `.player-row` |
| `.modal-window`, `.dialog` | `.modal` |
| `.label-warning`, `.tag-danger` | `.badge.watch`, `.badge.risk` |
| `.guide-page`, `.doc-page` | `.doc-wrap` (안), `.doc-header`(위) |

---

## 토큰 카테고리 (요약)

### 컬러 — 시그널 3단계: **정상 · 주의 · 초과**
- `--safe` (정상) `#2F7A5F` — ACWR 0.8–1.3
- `--watch` (주의) `#A67635` — ACWR 1.3–1.5
- `--risk` (초과) `#B85C52` — ACWR 1.5+
- 의료적 빨강(`#E53E3E` 등)은 사용 금지. `--risk`는 코랄 톤으로 절제했습니다.

### 타이포
- 본문 `Pretendard Variable` + 숫자 `JetBrains Mono`
- 스케일: Display 44 / H1 36 / H2 20 / H3 15.5 / Body 13.5 / Caption 11.5
- 문서 페이지는 별도: H1 40 / Body **16/1.7**

### 간격 · 라운드
- 간격: 4 / 8 / 12 / 16 / 20 / 24 / 32 / 48
- 라운드: sm 3 / md 4 / lg 6 / xl 8 / 2xl 14 / pill 999

### 문서 페이지 전용
- `--doc-max-w 720px`
- `--doc-body-size 16px` · `--doc-body-leading 1.7`
- `--doc-h1-size 40px` · `--doc-section-gap 40px`

---

## 카피·표기 정책 (꼭 지킬 것)

**금지 단어**: 치료 · 처방 · 진단 · 부상 예방 보장 · 성과 향상 보장 · 최적 · 자동 위험 판정 · 부상 예측 · Optimize · Predict · Diagnose · Prevent · Boost.

**안전한 대체 표현**: 참고 · 확인 · 조정 고려 · 도움이 될 수 있음 · 전문가 상담 권장 · 기록 · 추적 · 관리.

**시그널 라벨**: 정상 / 주의 / 초과 (안전·위험·경고 같은 단어는 의료 톤이라 피했습니다).

**약관·고지에는 반드시 포함**:
- "이 앱은 의료 도구가 아닙니다."
- "통증·부상 의심 시 즉시 훈련을 중단하고 전문가 진료."
- "ACWR·RPE는 참고 지표 — 최종 훈련 판단은 코치·선수 책임."

---

## 두 컨텍스트의 일관성·차이

| 항목 | 앱 (interactive) | 문서 7종 |
|---|---|---|
| 토큰 | 동일 (`tokens.css`) | 동일 (`tokens.css`) |
| 컴포넌트 | `.card`, `.modal`, `.player-row` 등 풀세트 | `.doc-wrap` + 본문 컴포넌트만 |
| 본문 크기 | 13.5px (밀도) | 16px / 1.7 line-height (가독성) |
| 최대 너비 | 화면 전체 | `--doc-max-w` = 720px 단일 컬럼 |
| 카드 그림자 | `--shadow-card` 약함 | 사용 안 함 (보더만) |
| 모달 | 사용 | 사용 안 함 — 인라인 `.doc-note/warn/danger` |

---

## 문서 페이지 7종 매핑

`.doc-wrap` 마스터 하나로 다음 7개를 렌더:

1. `about.html` — 서비스 소개
2. `assessment-guide.html` — 8종목 정밀평가 활용법 (샘플 포함)
3. `recovery-guide.html` — 등판 후 회복 기록 가이드
4. `workload-guide.html` — 워크로드와 ACWR 이해하기
5. `contact.html` — 문의·지원
6. `privacy.html` — 개인정보처리방침
7. `terms.html` — 이용약관 및 안전 고지 (샘플 포함)

각 페이지는 `.doc-eyebrow` + `.doc-h1` + `.doc-lead` + `.doc-meta` + `.doc-body`(H2 with `.h-num`, p, ul/ol, `.doc-note/warn/danger`, `.doc-table`) + `.doc-postscript` + `.doc-foot` 골격을 따릅니다. 자세한 예시는 `snippets/10-doc-page.html` 참고.

---

## 변경 이력

- **v0.1.0 (2026-05-23)** — 초기 export. Direction B 확정 후.

문의: 디자인 시스템 변경 사항은 `tokens.css`의 변수만 수정하면 됩니다. 컴포넌트 CSS는 토큰을 참조만 하므로 자동 반영됩니다.

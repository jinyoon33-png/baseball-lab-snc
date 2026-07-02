# 보안/QA 점검 공간

## 담당
- 보안/QA 에이전트: 티켓 단위 읽기 전용 정적 점검과 보안 보고를 수행한다.
- 총괄 Codex: 보안/QA 보고를 직접 대조하고 최종 워크플랜 판단에 반영한다.

## 허용
- 파일 읽기.
- 정적 명령 실행.
- 보안/QA 보고 작성.
- 브라우저 상태 확인이 명시된 경우 read-only 확인.

## 금지
- 파일 수정.
- 파일 삭제 또는 이동.
- 커밋.
- push.
- 설치.
- 서버 설정 변경.
- 다음 티켓 작성.
- 구현 담당 역할 수행.
- 추측성 이슈를 확정 취약점처럼 표현.

## 호출 기준
- CSP 또는 보안 헤더 변경.
- localStorage, 백업/복원, 파일 import/export 변경.
- innerHTML, insertAdjacentHTML, template HTML, URL 처리 변경.
- 외부 링크, target="_blank", sourceUrl, YouTube 링크 정책 변경.
- 개인정보, 미성년자 데이터, 라이선스/NOTICE 변경.
- AdSense, analytics, 외부 script, iframe, 광고 위치 변경.
- 공개 페이지 SEO/JSON-LD/canonical/robots/sitemap 변경 중 정책 영향이 있는 경우.
- 총괄 Codex가 지정한 범위가 있으면 그 범위를 우선한다.
- 단순 문구, CSS, 문서 기록만 바꾸는 티켓은 기본적으로 호출하지 않는다.

## 기본 점검 명령
- `node --check site/app.js`
- `node --check site/data.js`
- `git diff --check`
- `rg -n 'innerHTML|insertAdjacentHTML|outerHTML|eval\(|new Function|localStorage|FileReader|JSON.parse|URL.createObjectURL|download|target="_blank"' site`
- `rg -n "onclick=|oninput=|onchange=" site/*.html`
- `rg -n "adsbygoogle|pagead2.googlesyndication.com|canonical|application/ld\+json" site`
- `rg -n "guideMediaType|guideMediaSrc|guideMediaPoster|guideMediaAlt|guideMediaCaption|guideMediaCredit" site/data.js`
- `git diff -- site/app.js site/data.js site/assets site/vendor docs/evidence docs/security`

## 보고 형식
```text
[보안/QA 점검 보고]
- 대상 티켓:
- 실행 명령:
- BLOCKER:
- MAJOR:
- MINOR:
- NIT:
- 총괄 Codex 판단 요청:
- 결론: GO / 조건부 GO / STOP
```

## 총괄 Codex 검토 기준
- 보안/QA 에이전트 보고는 최종 결론이 아니다.
- 총괄 Codex는 최소 1~3개 핵심 명령 또는 diff를 직접 대조한다.
- 이슈가 있으면 수정 티켓을 작성한다.
- 이슈가 없으면 사용자 확인, 커밋, 다음 티켓 중 다음 게이트를 결정한다.
